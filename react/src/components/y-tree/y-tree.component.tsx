import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { YTreeService } from "../../../../common/service";
import type {
  NodeId,
  YTreeModel,
  YTreeAddEvent,
  YTreeAsyncEvent,
  YTreeAsyncFrom,
  YTreeDragEvent,
  YTreeDragMoveEvent,
  YTreeDropEvent,
  YTreeFlatNode,
  YTreeRemoveEvent,
  YTreeRenameEvent,
  YTreeNode,
} from "../../../../common/model";
import {
  buildVisibleNodes,
  collectVisibleDescendants,
  parseExpandSpeed,
  patchVisibleAfterAdd,
  patchVisibleAfterCopy,
  patchVisibleAfterMove,
  patchVisibleAfterRemove,
  resolveFontCss,
  resolveNodeIcon,
  resolveNodeTitle,
  shouldRebuildVisibleAfterUpdate,
  type VisibleNode,
} from "../../../../common/view";
import type { YTreeDropPosition, YTreeProps, YTreeRef } from "./y-tree.props";
import "./y-tree.component.css";

/** 虚拟滚动行高（px） */
const ROW_HEIGHT = 28;
/** 虚拟滚动可视区外缓冲行数 */
const OVERSCAN = 5;
/** 空集合返回 null（保留数据源内联状态），非空集合返回 Set（完全受控） */
function toSetOrNull(
  list?: Array<string | number>,
): Set<string | number> | null {
  return list && list.length > 0 ? new Set(list) : null;
}
/** 计算初始展开集合 */
function initExpanded(service: YTreeService, expandAll: boolean): Set<NodeId> {
  const expanded = new Set<NodeId>();
  const flatMap = service.getFlatNodesMap();
  if (!flatMap) {
    return expanded;
  }
  flatMap.forEach((node) => {
    if (node.childIds.length > 0 && (expandAll || node.expanded)) {
      expanded.add(node.id);
    }
  });
  return expanded;
}

/**
 * 生成折叠切换器（Switcher）引导线背景
 * 展开状态下从切换器中心（14px）向下画竖线连接子节点
 */
function switcherBg(
  showLine: boolean | undefined,
  isExpanded: boolean,
): string {
  if (!showLine || !isExpanded) {
    return "none";
  }
  const color = "#c0c4cc";
  return `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) 8px 14px / 1px 14px no-repeat`;
}

/** 生成节点引导线背景（竖虚线 + 水平虚线），antd/Element 拐角风格 */
function indentBg(
  showLine: boolean | undefined,
  node: YTreeModel,
  service: YTreeService | null,
  isLeaf: boolean,
): string {
  if (!showLine) {
    return "none";
  }

  const color = "#c0c4cc";
  const hasRootLine = (service?.getRootIds().length ?? 0) > 1;

  if (hasRootLine) {
    const ancestors: YTreeModel[] = [];
    let cur: YTreeModel | null = node;
    while (cur) {
      ancestors.unshift(cur);
      const pId: string | number = cur.pId;
      cur =
        pId === undefined || pId === null || pId === ""
          ? null
          : service?.getNodeById(pId) ?? null;
    }

    const level = node.level;
    const layers: string[] = [];

    for (let col = 0; col <= level; col++) {
      const x = col * 24 + 8;
      const isCornerCol = col === level;

      if (isCornerCol) {
        const startX = col * 24 + 8;
        const lineLen = isLeaf ? (col + 1) * 24 + 16 - startX : 12;
        layers.push(
          `repeating-linear-gradient(to right, transparent 0 3px, ${color} 3px 6px) ${startX}px 14px / ${lineLen}px 1px no-repeat`,
        );

        const hasTop = col === 0 ? !node.isFirst : true;
        const hasBottom = !node.isLast;

        if (hasTop && hasBottom) {
          layers.push(
            `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px 100% no-repeat`,
          );
        } else if (hasTop) {
          layers.push(
            `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px 14px no-repeat`,
          );
        } else if (hasBottom) {
          layers.push(
            `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 14px / 1px 14px no-repeat`,
          );
        }
      } else {
        const ancestor = ancestors[col];
        if (ancestor && !ancestor.isLast) {
          layers.push(
            `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px 100% no-repeat`,
          );
        }
      }
    }

    return layers.length > 0 ? layers.join(", ") : "none";
  }

  // 单根节点模式
  const level = node.level;
  if (level <= 0) {
    return "none";
  }

  const ancestors: YTreeModel[] = [];
  let cur: YTreeModel | null = node;
  while (cur) {
    ancestors.unshift(cur);
    const pId: string | number = cur.pId;
    cur =
      pId === undefined || pId === null || pId === ""
        ? null
        : service?.getNodeById(pId) ?? null;
  }

  const layers: string[] = [];
  for (let i = 0; i < level; i++) {
    const x = i * 24 + 8;
    const isCornerCol = i === level - 1;
    if (isCornerCol) {
      const height = node.isLast ? "14px" : "100%";
      layers.push(
        `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px ${height} no-repeat`,
      );
    } else {
      const ancestor = ancestors[i + 1];
      if (ancestor && !ancestor.isLast) {
        layers.push(
          `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px 100% no-repeat`,
        );
      }
    }
  }

  const startX = (level - 1) * 24 + 8;
  const lineLen = isLeaf ? level * 24 + 16 - startX : 12;
  layers.push(
    `repeating-linear-gradient(to right, transparent 0 3px, ${color} 3px 6px) ${startX}px 14px / ${lineLen}px 1px no-repeat`,
  );
  return layers.join(", ");
}

export const YTree = forwardRef<YTreeRef, YTreeProps>(function YTree(
  props,
  ref,
) {
  const {
    datasource,
    checkable = false,
    showLine = false,
    expandAll = false,
    checkStrictly = false,
    chkStyle = "checkbox",
    radioType = "all",
    chkboxType,
    draggable = false,
    isCopy = false,
    allowDrag,
    allowDrop,
    minMoveSize = 5,
    beforeDrag,
    beforeDrop,
    onDrag,
    onDragMove,
    onDrop: onDropCb,
    editable = false,
    showRenameBtn = true,
    showRemoveBtn = true,
    showAddBtn = true,
    removeConfirm = true,
    beforeEditName,
    beforeRename,
    onRename,
    beforeRemove,
    onRemove,
    beforeAdd,
    onAdd,
    renderNodeExtra,
    lazy = false,
    loadData,
    beforeAsync,
    onAsyncSuccess,
    onAsyncError,
    expandIds,
    checkedIds,
    selectedIds,
    nocheckIds,
    searchValue = "",
    size = "default",
    className = "",
    height = 400,
    showIcon = true,
    showTitle = true,
    title,
    fontCss,
    dblClickExpand = true,
    expandSpeed = 0,
    selectedMulti = true,
    beforeClick,
    beforeExpand,
    beforeCollapse,
    beforeCheck,
    onClick,
    onDbClick,
    onContextMenu,
    onExpandChange,
    onCheckedChange,
    onNodeChange,
  } = props;

  // 核心服务实例
  const serviceRef = useRef<YTreeService | null>(null);
  if (!serviceRef.current) {
    serviceRef.current = new YTreeService();
  }

  // 展开状态；结构变化走可见列表补丁，勾选/选中/重命名只刷新行
  const [expanded, setExpanded] = useState<Set<NodeId>>(() => new Set());
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;
  const [visibleNodes, setVisibleNodes] = useState<Array<VisibleNode>>([]);
  const visibleNodesRef = useRef<Array<VisibleNode>>([]);
  const leavingRef = useRef<{ parentId: NodeId; ids: Array<NodeId> } | null>(
    null,
  );

  // 懒加载根节点异步：datasource 为空时先异步取根数据
  const [lazyRootData, setLazyRootData] = useState<Array<
    YTreeNode | YTreeFlatNode
  > | null>(null);
  const rootLoadStartedRef = useRef(false);

  /** 实际参与建树的数据源（根节点异步成功后用加载到的数据） */
  const effectiveDatasource = useMemo(() => {
    if (datasource && datasource.length > 0) {
      return datasource;
    }
    if (lazy && lazyRootData) {
      return lazyRootData;
    }
    return datasource ?? [];
  }, [datasource, lazy, lazyRootData]);

  // 拖拽状态：正在拖拽的节点 + 当前落点（用于高亮指示）
  const [draggingId, setDraggingId] = useState<NodeId | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: NodeId;
    position: YTreeDropPosition;
  } | null>(null);

  // 编辑状态：正在重命名的节点 + 输入内容 + 待确认删除的节点
  const [editingId, setEditingId] = useState<NodeId | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmRemoveId, setConfirmRemoveId] = useState<NodeId | null>(null);

  // 展开动画：刚展开的子孙 / 正在收起但仍需短暂渲染的子孙
  const [enteringIds, setEnteringIds] = useState<Set<NodeId>>(() => new Set());
  const [leaving, setLeaving] = useState<{
    parentId: NodeId;
    ids: Array<NodeId>;
  } | null>(null);
  const expandTimerRef = useRef<number>(0);
  const expandMs = parseExpandSpeed(expandSpeed);

  // 拖拽起始位置（用于 minMoveSize 判断）
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 数据源 / 状态集合变化时重建服务
  useEffect(() => {
    const instance = new YTreeService(
      effectiveDatasource ?? [],
      toSetOrNull(checkedIds),
      toSetOrNull(selectedIds),
      toSetOrNull(nocheckIds),
      undefined,
      toSetOrNull(expandIds),
      undefined,
    );
    instance.configureCheckMode(
      chkStyle,
      radioType,
      checkStrictly ? { Y: "", N: "" } : chkboxType ?? null,
    );
    serviceRef.current?.destroyed();
    serviceRef.current = instance;
    setExpanded(initExpanded(instance, expandAll));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    effectiveDatasource,
    checkedIds,
    selectedIds,
    nocheckIds,
    expandIds,
    expandAll,
    checkStrictly,
    chkStyle,
    radioType,
    chkboxType,
  ]);

  leavingRef.current = leaving;

  const rebuildVisible = useCallback(() => {
    const list = buildVisibleNodes(serviceRef.current, expandedRef.current, {
      searchValue,
      leaving: leavingRef.current,
    });
    visibleNodesRef.current = list;
    setVisibleNodes(list);
  }, [searchValue]);

  /** 勾选/选中/重命名：节点对象已原地更新，换数组引用以刷新行 */
  const bump = useCallback(() => {
    setVisibleNodes(visibleNodesRef.current.slice());
  }, []);

  const applyStructurePatch = useCallback(
    (run: (list: Array<VisibleNode>) => boolean) => {
      const list = visibleNodesRef.current;
      if (run(list)) {
        visibleNodesRef.current = list;
        setVisibleNodes(list.slice());
      } else {
        rebuildVisible();
      }
    },
    [rebuildVisible],
  );

  useEffect(() => {
    rebuildVisible();
  }, [expanded, searchValue, leaving, rebuildVisible]);

  // 虚拟滚动区间 [start, end)
  const [range, setRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const computeRange = useCallback(
    (start: number, total: number) => {
      const viewportRows = Math.ceil(height / ROW_HEIGHT);
      const end = Math.min(total, start + viewportRows + OVERSCAN * 2);
      return { start: Math.max(0, start), end };
    },
    [height],
  );

  // 可见节点变化时重算区间（防止越界）
  useEffect(() => {
    setRange((prev) =>
      computeRange(
        Math.min(prev.start, Math.max(0, visibleNodes.length - 1)),
        visibleNodes.length,
      ),
    );
  }, [visibleNodes, computeRange]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    setRange(
      computeRange(
        Math.floor(top / ROW_HEIGHT) - OVERSCAN,
        visibleNodes.length,
      ),
    );
  };

  const visibleSlice = visibleNodes.slice(range.start, range.end);

  // ---------- 懒加载（P3） ----------

  /** 执行一次异步加载；isRoot 为 true 时写入根数据集（datasource 为空的根节点异步） */
  const runLazyLoad = useCallback(
    async (
      node: YTreeModel,
      from: YTreeAsyncFrom,
      isRoot: boolean = false,
      nativeEvent?: MouseEvent,
    ): Promise<boolean> => {
      const service = serviceRef.current;
      if (!service || !loadData) {
        return false;
      }

      const payload: YTreeAsyncEvent = {
        id: node.id,
        name: node.name,
        from,
        node,
      };

      // beforeAsync 前置拦截
      if (beforeAsync?.(payload) === false) {
        return false;
      }

      // 根节点异步时无实体节点，不需要 loading 标记
      if (!isRoot) {
        service.setNodeLoading(node.id, true);
        bump();
      }

      try {
        const result = await loadData(node);
        const children = Array.isArray(result) ? result : [];
        if (isRoot) {
          setLazyRootData(children);
        } else {
          service.setNodeChildren(node.id, children);
          service.setNodeLoading(node.id, false);
          // 加载成功后才真正展开
          setExpanded((prev) => {
            const s = new Set(prev);
            s.add(node.id);
            return s;
          });
          onExpandChange?.({
            event: (nativeEvent ?? undefined) as unknown as MouseEvent,
            id: node.id,
            expand: true,
          });
        }
        bump();
        onAsyncSuccess?.({ ...payload, children });
        return true;
      } catch (error) {
        if (!isRoot) {
          service.setNodeLoading(node.id, false);
        }
        bump();
        onAsyncError?.({ ...payload, error });
        return false;
      }
    },
    [loadData, beforeAsync, onAsyncSuccess, onAsyncError, onExpandChange, bump],
  );

  // 根节点异步：lazy 开启且 datasource 为空时，自动加载根数据（仅触发一次）
  useEffect(() => {
    if (!lazy || !loadData) {
      return;
    }
    if (datasource && datasource.length > 0) {
      return;
    }
    if (rootLoadStartedRef.current) {
      return;
    }
    const service = serviceRef.current;
    if (!service) {
      return;
    }
    rootLoadStartedRef.current = true;
    void runLazyLoad(service.createLazyRootNode(), "api", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazy, loadData, datasource, runLazyLoad]);

  const applyExpandNode = (
    id: NodeId,
    expand?: boolean,
    sonSign?: boolean,
  ): boolean => {
    const service = serviceRef.current;
    const node = service?.getNodeById(id);
    if (!service || !node) {
      return false;
    }
    const next = expand === undefined ? !expanded.has(id) : expand;
    const payload = {
      event: undefined as unknown as MouseEvent,
      id,
      expand: next,
    };
    if (next) {
      if (beforeExpand?.(payload) === false) {
        return false;
      }
    } else if (beforeCollapse?.(payload) === false) {
      return false;
    }

    const ids: Array<NodeId> = [id];
    if (sonSign) {
      const flatMap = service.getFlatNodesMap();
      const stack = [...node.childIds];
      while (stack.length) {
        const cid = stack.pop() as NodeId;
        const child = flatMap?.get(cid);
        if (!child) {
          continue;
        }
        if (child.childIds.length > 0 || service.hasChildren(cid)) {
          ids.push(cid);
        }
        stack.push(...child.childIds);
      }
    }

    if (next && lazy && loadData) {
      for (const nid of ids) {
        if (service.isLazyParent(nid)) {
          const lazyNode = service.getNodeById(nid);
          if (lazyNode && !lazyNode.isAjaxing) {
            void runLazyLoad(lazyNode, "api");
          }
        }
      }
    }

    setExpanded((prev) => {
      const s = new Set(prev);
      for (const nid of ids) {
        if (next) {
          s.add(nid);
        } else {
          s.delete(nid);
        }
      }
      return s;
    });
    onExpandChange?.(payload);
    return true;
  };

  const applyExpandCollapseParent = (id: NodeId, expand: boolean): boolean => {
    const service = serviceRef.current;
    const node = service?.getNodeById(id);
    if (!service || !node) {
      return false;
    }
    const ancestors: Array<NodeId> = [];
    let cur = node;
    while (cur) {
      const pId = cur.pId;
      if (pId === undefined || pId === null || pId === "") {
        break;
      }
      const parent = service.getNodeById(pId);
      if (!parent) {
        break;
      }
      ancestors.push(parent.id);
      cur = parent;
    }
    if (ancestors.length === 0) {
      return false;
    }
    setExpanded((prev) => {
      const s = new Set(prev);
      for (const nid of ancestors) {
        if (expand) {
          s.add(nid);
        } else {
          s.delete(nid);
        }
      }
      return s;
    });
    return true;
  };

  // 对外暴露方法
  useImperativeHandle(
    ref,
    () => ({
      getNodeById: (id: NodeId) => serviceRef.current?.getNodeById(id) ?? null,
      getCheckedList: (includeNocheck = true) =>
        serviceRef.current?.getCheckedList(includeNocheck) ?? [],
      moveNode: (sid: NodeId, tid: NodeId, pos: YTreeDropPosition) => {
        const ok = serviceRef.current?.moveNode(sid, tid, pos) ?? false;
        if (ok) {
          applyStructurePatch((list) =>
            patchVisibleAfterMove(
              list,
              serviceRef.current!,
              expandedRef.current,
              sid,
              searchValue,
            ),
          );
        }
        return ok;
      },
      copyNode: (sid: NodeId, tid: NodeId, pos: YTreeDropPosition) => {
        const newId = serviceRef.current?.copyNode(sid, tid, pos) ?? null;
        if (newId != null) {
          applyStructurePatch((list) =>
            patchVisibleAfterCopy(
              list,
              serviceRef.current!,
              expandedRef.current,
              newId,
              searchValue,
            ),
          );
        }
        return newId;
      },
      reAsyncChildNodes: (id: NodeId): Promise<boolean> => {
        const node = serviceRef.current?.getNodeById(id);
        if (!node || !loadData) {
          return Promise.resolve(false);
        }
        // 重新加载：先清除 isParent 归一化影响，允许重复拉取
        return runLazyLoad(node, "api");
      },
      checkNode: (id: NodeId, checked: boolean, linkage = true) => {
        const ok = serviceRef.current?.checkNode(id, checked, linkage) ?? false;
        if (ok) bump();
        return ok;
      },
      checkAllNodes: (checked = true) => {
        const ok = serviceRef.current?.checkAllNodes(checked) ?? false;
        if (ok) bump();
        return ok;
      },
      cancelAllNodes: () => {
        const ok = serviceRef.current?.cancelAllNodes() ?? false;
        if (ok) bump();
        return ok;
      },
      getChangeCheckedNodes: () =>
        serviceRef.current?.getChangeCheckedNodes() ?? [],
      selectNode: (id: NodeId, addFlag = false) => {
        const ok = serviceRef.current?.selectNode(id, addFlag) ?? false;
        if (ok) bump();
        return ok;
      },
      cancelSelectedNode: (id?: NodeId) => {
        const ok = serviceRef.current?.cancelSelectedNode(id) ?? false;
        if (ok) bump();
        return ok;
      },
      getSelectedNodes: () => serviceRef.current?.getSelectedNodes() ?? [],
      getNodes: () => serviceRef.current?.getNodes() ?? [],
      getNodesByParam: (key, value, parentId) =>
        serviceRef.current?.getNodesByParam(key, value, parentId) ?? [],
      getNodesByParamFuzzy: (key, value, parentId) =>
        serviceRef.current?.getNodesByParamFuzzy(key, value, parentId) ?? [],
      getNodeIndex: (id) => serviceRef.current?.getNodeIndex(id) ?? -1,
      updateNode: (id, patch) => {
        const ok = serviceRef.current?.updateNode(id, patch) ?? false;
        if (ok) {
          if (shouldRebuildVisibleAfterUpdate(patch, searchValue)) {
            rebuildVisible();
          } else {
            bump();
          }
        }
        return ok;
      },
      transformToArray: (parentId) =>
        serviceRef.current?.transformToArray(parentId) ?? [],
      transformToTreeNodes: (parentId) =>
        serviceRef.current?.transformToTreeNodes(parentId) ?? [],
      transformToTreeNodesFromFlat: (nodes) =>
        serviceRef.current?.transformToTreeNodesFromFlat(nodes) ?? [],
      expandNode: (id, expand, sonSign) => applyExpandNode(id, expand, sonSign),
      expandCollapseParentNode: (id, expand) =>
        applyExpandCollapseParent(id, expand),
    }),
    [
      runLazyLoad,
      loadData,
      bump,
      applyExpandNode,
      applyExpandCollapseParent,
      applyStructurePatch,
      rebuildVisible,
      searchValue,
    ],
  );

  const handleClick = (event: React.MouseEvent, id: NodeId) => {
    const payload = { event: event.nativeEvent, id };
    if (beforeClick?.(payload) === false) {
      event.stopPropagation();
      return;
    }
    const node = serviceRef.current?.getNodeById(id);
    if (node && !node.disabled) {
      const addFlag =
        selectedMulti &&
        (event.nativeEvent.ctrlKey || event.nativeEvent.metaKey);
      serviceRef.current?.selectNode(id, addFlag);
      bump();
    }
    onClick?.(payload);
  };

  const handleDbClick = (event: React.MouseEvent, id: NodeId) => {
    onDbClick?.({ event: event.nativeEvent, id });
    if (editable) {
      return;
    }
    if (dblClickExpand && serviceRef.current?.hasChildren(id)) {
      handleExpandChange(event, id);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, id: NodeId) => {
    onContextMenu?.({ event: event.nativeEvent, id });
  };

  const handleExpandChange = (event: React.MouseEvent, id: NodeId) => {
    const next = !expanded.has(id);
    const payload = { event: event.nativeEvent, id, expand: next };
    if (next) {
      if (beforeExpand?.(payload) === false) {
        return;
      }
    } else if (beforeCollapse?.(payload) === false) {
      return;
    }

    // 懒加载：首次展开且子节点尚未加载 → 触发异步加载，成功后由 runLazyLoad 展开
    if (next && lazy && loadData && serviceRef.current?.isLazyParent(id)) {
      const node = serviceRef.current.getNodeById(id);
      if (node && !node.isAjaxing) {
        void runLazyLoad(node, "user", false, event.nativeEvent);
      }
      return;
    }

    const service = serviceRef.current;
    if (expandMs > 0 && service) {
      window.clearTimeout(expandTimerRef.current);
      if (next) {
        const enterIds = collectVisibleDescendants(service, id, expanded);
        setLeaving(null);
        setEnteringIds(new Set(enterIds));
        expandTimerRef.current = window.setTimeout(() => {
          setEnteringIds(new Set());
        }, expandMs);
      } else {
        const leaveIds = collectVisibleDescendants(service, id, expanded);
        setEnteringIds(new Set());
        setLeaving({ parentId: id, ids: leaveIds });
        expandTimerRef.current = window.setTimeout(() => {
          setLeaving(null);
        }, expandMs);
      }
    }

    setExpanded((prev) => {
      const s = new Set(prev);
      if (next) {
        s.add(id);
      } else {
        s.delete(id);
      }
      return s;
    });
    onExpandChange?.({ event: event.nativeEvent, id, expand: next });
  };

  const handleCheckedChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: NodeId,
  ) => {
    const checked = event.target.checked;
    const payload = {
      event: event.nativeEvent as MouseEvent,
      id,
      checked,
    };
    if (beforeCheck?.(payload) === false) {
      event.target.checked = !checked;
      return;
    }
    const ok = serviceRef.current?.setCheckedByUser(
      id,
      checked,
      !checkStrictly,
    );
    if (ok) {
      bump();
      onCheckedChange?.(payload);
    }
  };

  /** 计算拖拽落点：行高固定 28px，按相对行的纵向位置三分 */
  const calcDropPosition = (
    event: React.DragEvent<HTMLDivElement>,
    hasChildren: boolean,
  ): YTreeDropPosition => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offset = event.clientY - rect.top;
    const ratio = offset / rect.height;
    if (ratio < 0.25) {
      return "prev";
    }
    if (ratio > 0.75) {
      return "next";
    }
    return hasChildren ? "inner" : "prev";
  };

  const cleanupDrag = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    id: NodeId,
  ) => {
    if (!draggable) {
      return;
    }
    const node = serviceRef.current?.getNodeById(id);
    if (!node || node.disabled) {
      return;
    }
    // allowDrag 精细控制
    if (allowDrag && !allowDrag(node)) {
      return;
    }
    // beforeDrag 前置拦截
    if (
      beforeDrag?.({
        event: event.nativeEvent,
        id,
        sourceId: id,
        isCopy: false,
      }) === false
    ) {
      return;
    }
    dragStartPos.current = { x: event.clientX, y: event.clientY };
    setDraggingId(id);
    // 拖拽时收起非叶子节点（延迟到拖拽会话建立后执行，避免 dragstart 期间同步 DOM 变化中断拖拽）
    if (serviceRef.current?.hasChildren(id) && expanded.has(id)) {
      const collapseId = id;
      window.setTimeout(() => {
        setExpanded((prev) => {
          if (!prev.has(collapseId)) {
            return prev;
          }
          const s = new Set(prev);
          s.delete(collapseId);
          return s;
        });
      }, 0);
    }
    const copyMode = isCopy && (event.ctrlKey || event.metaKey);
    event.dataTransfer.effectAllowed = copyMode ? "copy" : "move";
    event.dataTransfer.setData("text/plain", String(id));
    // 拖拽预览：避免虚拟滚动卸载源节点导致拖拽中断
    try {
      event.dataTransfer.setDragImage(event.currentTarget, 20, 14);
    } catch {
      /* 部分浏览器不支持 setDragImage */
    }
    onDrag?.({ event: event.nativeEvent, id, sourceId: id, isCopy: copyMode });
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    id: NodeId,
  ) => {
    if (!draggable || draggingId === null) {
      return;
    }
    const node = serviceRef.current?.getNodeById(id);
    if (!node || node.disabled) {
      return;
    }
    // minMoveSize：实际移动距离不足时不显示落点
    const dx = event.clientX - dragStartPos.current.x;
    const dy = event.clientY - dragStartPos.current.y;
    if (minMoveSize > 0 && Math.sqrt(dx * dx + dy * dy) < minMoveSize) {
      return;
    }
    event.preventDefault();
    const copyMode = isCopy && (event.ctrlKey || event.metaKey);
    event.dataTransfer.dropEffect = copyMode ? "copy" : "move";
    const position = calcDropPosition(
      event,
      serviceRef.current?.hasChildren(id) ?? false,
    );
    setDropTarget({ id, position });
    onDragMove?.({
      event: event.nativeEvent,
      id,
      sourceId: draggingId,
      targetId: id,
      position,
      isCopy: copyMode,
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, id: NodeId) => {
    if (!draggable || draggingId === null) {
      return;
    }
    event.preventDefault();
    const target = dropTarget;
    const sourceId = draggingId;
    cleanupDrag();
    if (!target || target.id !== id) {
      return;
    }
    const copyMode = isCopy && (event.ctrlKey || event.metaKey);
    const moveType: "move" | "copy" = copyMode ? "copy" : "move";

    // allowDrop 精细控制
    if (allowDrop && !allowDrop(sourceId, id, target.position)) {
      return;
    }
    // beforeDrop 前置拦截
    if (
      beforeDrop?.({
        event: event.nativeEvent,
        id: sourceId,
        sourceId,
        targetId: id,
        position: target.position,
        isCopy: copyMode,
        moveType,
      }) === false
    ) {
      return;
    }

    // 执行移动或复制
    let ok = false;
    let resultId: NodeId | null = null;
    if (copyMode) {
      resultId =
        serviceRef.current?.copyNode(sourceId, id, target.position) ?? null;
      ok = resultId != null;
    } else {
      ok = serviceRef.current?.moveNode(sourceId, id, target.position) ?? false;
      resultId = sourceId;
    }

    if (ok) {
      if (copyMode && resultId != null) {
        applyStructurePatch((list) =>
          patchVisibleAfterCopy(
            list,
            serviceRef.current!,
            expandedRef.current,
            resultId as NodeId,
            searchValue,
          ),
        );
      } else {
        applyStructurePatch((list) =>
          patchVisibleAfterMove(
            list,
            serviceRef.current!,
            expandedRef.current,
            sourceId,
            searchValue,
          ),
        );
      }
      onDropCb?.({
        event: event.nativeEvent,
        id: resultId ?? sourceId,
        sourceId,
        targetId: id,
        position: target.position,
        isCopy: copyMode,
        moveType,
      });
      onNodeChange?.({
        event: event.nativeEvent as MouseEvent,
        id: resultId ?? sourceId,
        sourceId,
        targetId: id,
        position: target.position,
      });
    }
  };

  const handleDragEnd = () => {
    cleanupDrag();
  };

  // ---------- 编辑能力（P1） ----------

  /** 进入编辑态（双击标题 / 点击笔按钮），beforeEditName 返回 false 取消 */
  const startEdit = (event: React.MouseEvent, id: NodeId) => {
    if (!editable) {
      return;
    }
    const node = serviceRef.current?.getNodeById(id);
    if (!node) {
      return;
    }
    if (beforeEditName?.({ event: event.nativeEvent, id }) === false) {
      return;
    }
    setConfirmRemoveId(null);
    setEditingId(id);
    setEditValue(node.name);
  };

  /** 提交重命名（Enter / blur），beforeRename 返回 false 仅退出不保存 */
  const commitRename = (event?: React.SyntheticEvent) => {
    if (editingId === null) {
      return;
    }
    const id = editingId;
    const node = serviceRef.current?.getNodeById(id);
    const newName = editValue.trim();
    setEditingId(null);
    if (!node || !newName || newName === node.name) {
      return;
    }
    const oldName = node.name;
    const payload: YTreeRenameEvent = {
      event: (event?.nativeEvent ?? undefined) as unknown as MouseEvent,
      id,
      oldName,
      newName,
    };
    if (beforeRename?.(payload) === false) {
      return;
    }
    const ok = serviceRef.current?.renameNode(id, newName);
    if (ok) {
      if (searchValue) {
        rebuildVisible();
      } else {
        bump();
      }
      onRename?.(payload);
    }
  };

  /** 取消编辑（Esc） */
  const cancelEdit = () => {
    setEditingId(null);
  };

  /** 点击垃圾桶：切换确认气泡显隐 */
  const handleRemoveClick = (event: React.MouseEvent, id: NodeId) => {
    setEditingId(null);
    setConfirmRemoveId((prev) => (prev === id ? null : id));
  };

  /** 确认删除：beforeRemove 返回 false 取消 */
  const doRemove = (event: React.MouseEvent, id: NodeId) => {
    setConfirmRemoveId(null);
    if (beforeRemove?.({ event: event.nativeEvent, id }) === false) {
      return;
    }
    const removed = serviceRef.current?.removeNode(id) ?? [];
    if (removed.length > 0) {
      removed.forEach((rid) => expandedRef.current.delete(rid));
      applyStructurePatch((list) => patchVisibleAfterRemove(list, removed));
      onRemove?.({ event: event.nativeEvent, id });
    }
  };

  /** 点击加号：给当前节点追加一个子节点，beforeAdd 返回 false 取消 */
  const handleAddClick = (event: React.MouseEvent, id: NodeId) => {
    if (!editable) {
      return;
    }
    if (beforeAdd?.({ event: event.nativeEvent, id, parentId: id }) === false) {
      return;
    }
    const newId = serviceRef.current?.addNode(id, { name: "新建节点" });
    if (newId != null) {
      if (expandedRef.current.has(id)) {
        applyStructurePatch((list) =>
          patchVisibleAfterAdd(
            list,
            serviceRef.current!,
            expandedRef.current,
            newId,
            searchValue,
          ),
        );
      } else {
        expandedRef.current.add(id);
        setExpanded(new Set(expandedRef.current));
      }
      onAdd?.({ event: event.nativeEvent, id: newId, parentId: id });
    }
  };

  return (
    <div
      className={["y-tree", `y-tree-${size}`, className]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          height,
          ["--y-tree-expand-speed" as string]: `${expandMs}ms`,
        } as React.CSSProperties
      }
      onScroll={handleScroll}
    >
      <div
        className="y-tree-virtual-spacer"
        style={{ height: visibleNodes.length * ROW_HEIGHT }}
      />
      <div
        className="y-tree-virtual-content"
        style={{ transform: `translateY(${range.start * ROW_HEIGHT}px)` }}
      >
        {visibleSlice.map(({ id, node }) => {
          // 懒加载父节点（isParent 但子节点未加载）也视为「有子节点」，用于渲染箭头与缩进对齐
          const hasChildren = serviceRef.current?.hasChildren(id) ?? false;
          const isLeafNode = !hasChildren;
          const isAjaxing = !!node.isAjaxing;
          const isExpanded = expanded.has(id);
          const hasRootLine =
            !!showLine && (serviceRef.current?.getRootIds().length ?? 0) > 1;
          const icon = resolveNodeIcon(node, isExpanded, hasChildren, showIcon);
          const titleText = resolveNodeTitle(node, showTitle, title);
          const titleStyle = resolveFontCss(node, fontCss);
          const isEntering = enteringIds.has(id);
          const isLeaving = !!leaving && leaving.ids.indexOf(id) >= 0;
          return (
            <div
              key={String(id)}
              className={[
                "y-tree-node",
                node.isRoot ? "is-root" : "",
                node.isFirst ? "is-first" : "",
                node.isLast ? "is-last" : "",
                node.selected ? "is-selected" : "",
                node.disabled ? "is-disabled" : "",
                isEntering ? "is-expand-enter" : "",
                isLeaving ? "is-expand-leave" : "",
                draggingId === id ? "is-dragging" : "",
                dropTarget?.id === id && dropTarget.position === "inner"
                  ? "is-drop-inner"
                  : "",
                dropTarget?.id === id && dropTarget.position === "prev"
                  ? "is-drop-before"
                  : "",
                dropTarget?.id === id && dropTarget.position === "next"
                  ? "is-drop-after"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              draggable={draggable && !node.disabled}
              onDragStart={(e) => handleDragStart(e, id)}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={(e) => handleDrop(e, id)}
              onDragEnd={handleDragEnd}
              onClick={(e) => handleClick(e, id)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleContextMenu(e, id);
              }}
            >
              <span
                className={[
                  "y-tree-indent",
                  isLeafNode ? "y-tree-indent-leaf" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  width:
                    (node.level + (hasRootLine ? 1 : 0)) * 24 +
                    (isLeafNode ? 16 : 0),
                  background: indentBg(
                    showLine,
                    node,
                    serviceRef.current,
                    isLeafNode,
                  ),
                }}
              />
              {hasChildren && (
                <span
                  className={[
                    "y-tree-switcher",
                    "has-children",
                    isExpanded ? "is-expanded" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    background: switcherBg(showLine, isExpanded),
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpandChange(e, id);
                  }}
                >
                  <i
                    className={[
                      "fa-solid y-tree-switcher-icon",
                      isAjaxing
                        ? "fa-spinner is-ajaxing"
                        : isExpanded
                        ? "fa-chevron-down"
                        : "fa-chevron-right",
                    ].join(" ")}
                  />
                </span>
              )}

              {checkable && !node.nocheck && (
                <label
                  className="y-tree-checkbox"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type={chkStyle === "radio" ? "radio" : "checkbox"}
                    className="y-tree-checkbox-input"
                    checked={!!node.checked}
                    disabled={!!node.disabled || !!node.checkboxDisabled}
                    ref={(el) => {
                      if (el && chkStyle !== "radio") {
                        el.indeterminate = !!node.halfChecked;
                      }
                    }}
                    onChange={(e) => handleCheckedChange(e, id)}
                  />
                  <i
                    className={[
                      "fa-regular y-tree-checkbox-icon",
                      chkStyle === "radio"
                        ? node.checked
                          ? "fa-circle-dot"
                          : "fa-circle"
                        : node.checked
                        ? "fa-square-check"
                        : node.halfChecked
                        ? "fa-square-minus"
                        : "fa-square",
                    ].join(" ")}
                  />
                </label>
              )}

              {icon.type === "img" && (
                <img
                  className={[
                    "y-tree-node-icon y-tree-node-icon-img",
                    isLeafNode ? "is-leaf" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  src={icon.src}
                  alt=""
                />
              )}
              {icon.type === "class" && (
                <i
                  className={[
                    "y-tree-node-icon",
                    icon.className,
                    isLeafNode ? "is-leaf" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              )}

              {editingId === id ? (
                <input
                  className="y-tree-edit-input"
                  value={editValue}
                  autoFocus
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                      commitRename(e);
                    } else if (e.key === "Escape") {
                      cancelEdit();
                    }
                  }}
                  onBlur={(e) => commitRename(e)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className={["y-tree-title", showLine ? "is-link" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  title={titleText || undefined}
                  style={titleStyle as React.CSSProperties}
                  onDoubleClick={(e) => {
                    handleDbClick(e, id);
                    startEdit(e, id);
                  }}
                >
                  {node.name}
                </span>
              )}

              {editable && editingId !== id && (
                <span className="y-tree-actions-wrap">
                  <span className="y-tree-actions">
                    {showRenameBtn && (
                      <i
                        className="y-tree-action-btn fa-solid fa-pen"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(e, id);
                        }}
                      />
                    )}
                    {showAddBtn && (
                      <i
                        className="y-tree-action-btn fa-solid fa-plus"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddClick(e, id);
                        }}
                      />
                    )}
                    {showRemoveBtn && (
                      <i
                        className="y-tree-action-btn is-danger fa-solid fa-trash"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveClick(e, id);
                        }}
                      />
                    )}
                  </span>

                  {confirmRemoveId === id && (
                    <span className="y-tree-remove-confirm">
                      <span className="y-tree-remove-confirm-text">
                        确认删除该节点？
                      </span>
                      <button
                        className="y-tree-remove-confirm-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          doRemove(e, id);
                        }}
                      >
                        确认删除
                      </button>
                      <button
                        className="y-tree-remove-cancel-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmRemoveId(null);
                        }}
                      >
                        取消
                      </button>
                    </span>
                  )}
                </span>
              )}

              {renderNodeExtra?.(node)}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default YTree;
