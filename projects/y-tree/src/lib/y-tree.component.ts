import {
  Component,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { YTreeService } from '../common/service';
import type {
  NodeId,
  YTreeModel,
  YTreeAddEvent,
  YTreeAsyncErrorEvent,
  YTreeAsyncEvent,
  YTreeAsyncFrom,
  YTreeAsyncSuccessEvent,
  YTreeChkboxType,
  YTreeChkStyle,
  YTreeNodeEvent,
  YTreeFlatNode,
  YTreeRadioType,
  YTreeRemoveEvent,
  YTreeRenameEvent,
  YTreeDragEvent,
  YTreeDragMoveEvent,
  YTreeDropEvent,
  YTreeNode,
} from '../common/model';

/**
 * y-tree 多功能树组件
 */
@Component({
  selector: 'y-tree',
  templateUrl: './y-tree.component.html',
  styleUrls: ['./y-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YTreeComponent implements OnChanges, OnDestroy {
  /**
   * 树组件数据源
   */
  @Input() datasource: Array<any> = [];
  /**
   * 是否展示勾选框
   */
  @Input() checkable: boolean = false;
  /**
   * 是否显示连线
   */
  @Input() showLine: boolean = false;
  /**
   * 是否默认展开全部节点
   */
  @Input() expandAll: boolean = false;
  /**
   * checkable 状态下节点选择完全受控（父子节点选中状态不再关联）
   */
  @Input() checkStrictly: boolean = false;
  /**
   * 勾选控件样式：checkbox（默认）/ radio
   */
  @Input() chkStyle: YTreeChkStyle = 'checkbox';
  /**
   * radio 互斥范围：all=整树（默认）/ level=同级兄弟
   */
  @Input() radioType: YTreeRadioType = 'all';
  /**
   * 父子联动方向（对标 zTree chkboxType）
   */
  @Input() chkboxType?: YTreeChkboxType;
  /**
   * 节点是否可拖拽
   */
  @Input() draggable: boolean = false;
  /**
   * Ctrl+拖拽时复制而非移动
   */
  @Input() isCopy: boolean = false;
  /**
   * 允许拖拽节点判定，返回 false 阻止拖拽
   */
  @Input() allowDrag?: (node: YTreeModel) => boolean;
  /**
   * 允许落点判定，返回 false 阻止落点
   */
  @Input() allowDrop?: (
    sourceId: string | number,
    targetId: string | number,
    position: 'inner' | 'prev' | 'next'
  ) => boolean;
  /**
   * 拖拽生效最小移动距离（px）
   */
  @Input() minMoveSize: number = 5;
  /**
   * 懒加载模式：子节点在首次展开时通过 loadData 异步获取
   */
  @Input() lazy: boolean = false;
  /**
   * 异步加载子节点数据（lazy 开启时生效）
   */
  @Input() loadData?: (
    node: YTreeModel
  ) =>
    | Promise<Array<YTreeNode | YTreeFlatNode>>
    | Array<YTreeNode | YTreeFlatNode>;
  /**
   * 异步加载前置拦截，返回 false 取消本次加载
   */
  @Input() beforeAsync?: (payload: YTreeAsyncEvent) => boolean;
  /**
   * 拖拽开始前置拦截，返回 false 取消
   */
  @Input() beforeDrag?: (payload: YTreeDragEvent) => boolean;
  /**
   * 拖拽放置前置拦截，返回 false 取消
   */
  @Input() beforeDrop?: (payload: YTreeDropEvent) => boolean;
  /**
   * 是否启用编辑能力（重命名/删除/新增按钮）
   */
  @Input() editable: boolean = false;
  /**
   * 是否显示重命名按钮
   */
  @Input() showRenameBtn: boolean = true;
  /**
   * 是否显示删除按钮
   */
  @Input() showRemoveBtn: boolean = true;
  /**
   * 是否显示新增按钮
   */
  @Input() showAddBtn: boolean = true;
  /**
   * 删除前是否弹气泡确认
   */
  @Input() removeConfirm: boolean = true;
  /**
   * 进入编辑态前置拦截，返回 false 取消
   */
  @Input() beforeEditName?: (payload: YTreeNodeEvent) => boolean;
  /**
   * 重命名提交前置拦截，返回 false 取消
   */
  @Input() beforeRename?: (payload: YTreeRenameEvent) => boolean;
  /**
   * 删除前置拦截，返回 false 取消
   */
  @Input() beforeRemove?: (payload: YTreeRemoveEvent) => boolean;
  /**
   * 新增前置拦截，返回 false 取消
   */
  @Input() beforeAdd?: (payload: YTreeAddEvent) => boolean;
  /**
   * 展开的节点id集合
   */
  @Input() expandIds: Array<string | number> = [];
  /**
   * 勾选节点的id集合
   */
  @Input() checkedIds: Array<string | number> = [];
  /**
   * 选中节点的id集合（文本区域）
   */
  @Input() selectedIds: Array<string | number> = [];
  /**
   * 在 checkable 状态下不显示勾选框的节点id集合
   */
  @Input() nocheckIds: Array<string | number> = [];
  /**
   * 搜索的关键字
   */
  @Input() searchValue: string = '';
  /**
   * 组件的大小模式，主要对应到节点行高，字号大小
   */
  @Input() size: 'small' | 'default' | 'large' = 'default';
  /**
   * 挂载到最外层容器上的样式类
   */
  @Input() className: string = '';
  /**
   * 滚动容器高度（px），虚拟滚动依赖固定高度容器
   */
  @Input() height: number = 400;
  /**
   * 文本节点点击事件
   */
  @Output() click = new EventEmitter<any>();
  /**
   * 文本节点双击事件，默认会触发当前节点展开
   */
  @Output() dbClick = new EventEmitter<any>();
  /**
   * 文本节点右键点击事件
   */
  @Output() contextMenu = new EventEmitter<any>();
  /**
   * 展开按钮事件
   */
  @Output() expandChange = new EventEmitter<any>();
  /**
   * 节点勾选框点击事件
   */
  @Output() checkedChange = new EventEmitter<any>();
  /**
   * 节点拖拽移动事件（draggable 开启时触发）
   */
  @Output() nodeChange = new EventEmitter<any>();
  /**
   * 拖拽开始事件
   */
  @Output() drag = new EventEmitter<any>();
  /**
   * 拖拽移动中事件
   */
  @Output() dragMove = new EventEmitter<any>();
  /**
   * 拖拽放置事件
   */
  @Output() drop = new EventEmitter<any>();
  /**
   * 节点重命名事件
   */
  @Output() rename = new EventEmitter<any>();
  /**
   * 节点删除事件
   */
  @Output() remove = new EventEmitter<any>();
  /**
   * 节点新增事件
   */
  @Output() add = new EventEmitter<any>();
  /**
   * 异步加载成功事件（懒加载 P3）
   */
  @Output() asyncSuccess = new EventEmitter<any>();
  /**
   * 异步加载失败事件（懒加载 P3）
   */
  @Output() asyncError = new EventEmitter<any>();
  /**
   * 自定义节点 DOM 模板（对标 zTree addDiyDom）
   */
  @ContentChild('nodeExtra', { static: false })
  nodeExtraTemplate: TemplateRef<any> | null = null;

  /**
   * 可见节点列表（扁平化渲染）
   */
  protected visibleNodes: Array<{ id: NodeId; node: YTreeModel }> = [];

  /**
   * 拖拽状态：正在拖拽的节点id
   */
  protected draggingId: NodeId | null = null;

  /**
   * 拖拽状态：当前落点（用于高亮指示）
   */
  protected dropTarget: {
    id: NodeId;
    position: 'inner' | 'prev' | 'next';
  } | null = null;

  /**
   * 编辑状态：正在重命名的节点id
   */
  protected editingId: NodeId | null = null;

  /**
   * 编辑状态：重命名输入框内容
   */
  protected editValue: string = '';

  /**
   * 编辑状态：待确认删除的节点id
   */
  protected confirmRemoveId: NodeId | null = null;

  /**
   * 拖拽起始位置（用于 minMoveSize 判断）
   */
  private dragStartPos: { x: number; y: number } = { x: 0, y: 0 };

  /**
   * 虚拟滚动行高（px），固定行高是虚拟滚动的前提
   */
  protected readonly ROW_HEIGHT: number = 28;

  /**
   * 虚拟滚动可视区外缓冲行数
   */
  private static readonly OVERSCAN: number = 5;

  /**
   * 虚拟滚动可视切片
   */
  protected visibleSlice: Array<{ id: NodeId; node: YTreeModel }> = [];

  /**
   * 虚拟滚动起始行
   */
  protected start: number = 0;

  /**
   * 虚拟滚动结束行
   */
  protected end: number = 0;

  /**
   * 总行数
   */
  protected total: number = 0;

  /**
   * 展开节点id集合
   */
  protected expandedIds: Set<NodeId> = new Set();

  /**
   * 核心服务实例
   */
  private service: YTreeService | null = null;

  /**
   * 懒加载根节点异步：datasource 为空时异步加载到的根数据
   */
  private lazyRootData: Array<YTreeNode | YTreeFlatNode> | null = null;

  /**
   * 根节点异步是否已触发（避免重复请求）
   */
  private rootLoadStarted: boolean = false;

  constructor(private ref: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.initService();
    this.tryLoadLazyRoot();
  }

  /**
   * 实际参与建树的数据源（根节点异步成功后用加载到的数据）
   */
  private get effectiveDatasource(): Array<any> {
    if (this.datasource && this.datasource.length > 0) {
      return this.datasource;
    }
    if (this.lazy && this.lazyRootData) {
      return this.lazyRootData;
    }
    return this.datasource ?? [];
  }

  /**
   * 根节点异步：lazy 开启且 datasource 为空时自动加载根数据（仅触发一次）
   */
  private tryLoadLazyRoot(): void {
    if (!this.lazy || !this.loadData || this.rootLoadStarted) {
      return;
    }
    if (this.datasource && this.datasource.length > 0) {
      return;
    }
    this.rootLoadStarted = true;
    void this.runLazyLoad(this.service!.createLazyRootNode(), 'api', true);
  }

  /**
   * 空集合返回 null（保留数据源内联状态），非空集合返回 Set（完全受控）
   * @param list 节点id集合
   */
  private toSetOrNull(
    list: Array<string | number> | null
  ): Set<string | number> | null {
    return list && list.length > 0 ? new Set(list) : null;
  }

  /**
   * 初始化/重建核心服务
   */
  private initService(): void {
    this.service?.destroyed();
    this.service = new YTreeService(
      this.effectiveDatasource,
      this.toSetOrNull(this.checkedIds),
      this.toSetOrNull(this.selectedIds),
      this.toSetOrNull(this.nocheckIds),
      undefined,
      this.toSetOrNull(this.expandIds),
      undefined
    );
    this.service.configureCheckMode(
      this.chkStyle,
      this.radioType,
      this.checkStrictly ? { Y: '', N: '' } : this.chkboxType ?? null
    );

    // 初始化展开集合
    const expanded = new Set<NodeId>();
    const flatMap = this.service.getFlatNodesMap();
    if (flatMap) {
      flatMap.forEach((node) => {
        if (node.childIds.length > 0 && (this.expandAll || node.expanded)) {
          expanded.add(node.id);
        }
      });
    }
    this.expandedIds = expanded;
    this.rebuildVisibleNodes();
    // OnPush 组件内部状态变化，标记需要检查以刷新视图
    this.ref.markForCheck();
  }

  /**
   * 重建可见节点列表（按展开状态 DFS，命中 searchValue 过滤）
   */
  private rebuildVisibleNodes(): void {
    const flatMap = this.service?.getFlatNodesMap();
    const list: Array<{ id: NodeId; node: YTreeModel }> = [];
    if (!flatMap) {
      this.visibleNodes = list;
      return;
    }

    // 根顺序以 service.getRootIds() 为准（moveNode 会更新此顺序）
    const rootIds: Array<NodeId> = this.service?.getRootIds() ?? [];

    const stack: Array<NodeId> = [...rootIds].reverse();
    while (stack.length) {
      const id = stack.pop() as NodeId;
      const node = flatMap.get(id);
      if (!node || node.hide) {
        continue;
      }
      if (this.searchValue && node.name.indexOf(this.searchValue) === -1) {
        continue;
      }
      list.push({ id, node });
      if (node.childIds.length > 0 && this.expandedIds.has(id)) {
        for (let i = node.childIds.length - 1; i >= 0; i--) {
          stack.push(node.childIds[i]);
        }
      }
    }
    this.visibleNodes = list;
    this.updateVisibleSlice();
  }

  /**
   * 更新虚拟滚动可视切片（只渲染可视区 + 缓冲）
   */
  private updateVisibleSlice(): void {
    this.total = this.visibleNodes.length;
    const viewportRows = Math.ceil(this.height / this.ROW_HEIGHT);
    this.end = Math.min(
      this.total,
      this.start + viewportRows + YTreeComponent.OVERSCAN * 2
    );
    this.visibleSlice = this.visibleNodes.slice(this.start, this.end);
  }

  /**
   * 滚动容器滚动事件
   * @param event
   */
  protected onVirtualScroll(event: Event): void {
    const top = (event.target as HTMLElement).scrollTop;
    this.start = Math.max(
      0,
      Math.floor(top / this.ROW_HEIGHT) - YTreeComponent.OVERSCAN
    );
    this.updateVisibleSlice();
    this.ref.markForCheck();
  }

  /**
   * 节点是否展开
   * @param id 节点id
   */
  protected isExpanded(id: NodeId): boolean {
    return this.expandedIds.has(id);
  }

  /**
   * 生成折叠切换器（Switcher）引导线背景
   * 根节点与一级子节点在展开或多节点时产生垂直连接线
   * @param node 节点信息
   */
  protected switcherBg(node: YTreeModel): string {
    if (!this.showLine) {
      return 'none';
    }
    const isExpanded = this.isExpanded(node.id);
    const isRoot = node.level === 0;
    const hasTopLine = isRoot && !node.isFirst;
    const hasBottomLine = isRoot ? !node.isLast || isExpanded : isExpanded;

    if (!hasTopLine && !hasBottomLine) {
      return 'none';
    }

    const color = '#c0c4cc';
    const layers: Array<string> = [];
    if (hasTopLine && hasBottomLine) {
      layers.push(
        `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) 8px 0 / 1px 100% no-repeat`
      );
    } else if (hasTopLine) {
      layers.push(
        `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) 8px 0 / 1px 14px no-repeat`
      );
    } else if (hasBottomLine) {
      layers.push(
        `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) 8px 14px / 1px 14px no-repeat`
      );
    }
    return layers.join(', ');
  }

  /**
   * 生成节点引导线背景（竖虚线 + 水平虚线），antd/Element 拐角风格
   * @param node 节点信息
   */
  protected indentBg(node: YTreeModel): string {
    if (!this.showLine) {
      return 'none';
    }
    const color = '#c0c4cc';
    const level = node.level;
    const isLeaf = !this.hasChildren(node.id);

    // 一级节点（根节点）
    if (level === 0) {
      if (!isLeaf) {
        return 'none';
      }
      const hasTopLine = !node.isFirst;
      const hasBottomLine = !node.isLast;
      const hasHorizLine = !node.isFirst || !node.isLast;
      if (!hasTopLine && !hasBottomLine && !hasHorizLine) {
        return 'none';
      }
      const layers: Array<string> = [];
      if (hasTopLine && hasBottomLine) {
        layers.push(
          `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) 8px 0 / 1px 100% no-repeat`
        );
      } else if (hasTopLine) {
        layers.push(
          `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) 8px 0 / 1px 14px no-repeat`
        );
      } else if (hasBottomLine) {
        layers.push(
          `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) 8px 14px / 1px 14px no-repeat`
        );
      }
      if (hasHorizLine) {
        layers.push(
          `repeating-linear-gradient(to right, transparent 0 3px, ${color} 3px 6px) 8px 14px / 8px 1px no-repeat`
        );
      }
      return layers.join(', ');
    }

    // 二级及更深层级节点（level > 0）
    const ancestors: Array<YTreeModel> = [];
    let cur: YTreeModel | null = node;
    while (cur) {
      ancestors.unshift(cur);
      const pId: string | number = cur.pId;
      cur =
        pId === undefined || pId === null || pId === ''
          ? null
          : this.service?.getNodeById(pId) ?? null;
    }
    const layers: Array<string> = [];
    for (let i = 0; i < level; i++) {
      const x = i * 24 + 8;
      const isCornerCol = i === level - 1;
      if (isCornerCol) {
        const continuesDown =
          !node.isLast || (level === 1 && ancestors[0] && !ancestors[0].isLast);
        const height = continuesDown ? '100%' : '14px';
        layers.push(
          `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px ${height} no-repeat`
        );
      } else {
        const ancestor = ancestors[i];
        if (ancestor && !ancestor.isLast) {
          layers.push(
            `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px 100% no-repeat`
          );
        }
      }
    }
    const startX = (level - 1) * 24 + 8;
    const lineLen = isLeaf ? level * 24 + 16 - startX : 12;
    layers.push(
      `repeating-linear-gradient(to right, transparent 0 3px, ${color} 3px 6px) ${startX}px 14px / ${lineLen}px 1px no-repeat`
    );
    return layers.join(', ');
  }

  /**
   * 节点是否具备子节点（懒加载「标记为父节点但尚未加载」也计入）
   * 模板据此渲染展开箭头与缩进对齐
   * @param id 节点id
   */
  protected hasChildren(id: NodeId): boolean {
    return this.service?.hasChildren(id) ?? false;
  }

  // ------------------------------------------------------------------
  // 懒加载（P3）
  // ------------------------------------------------------------------

  /**
   * 执行一次异步加载
   * @param node 目标节点
   * @param from 触发来源
   * @param isRoot 是否为根节点异步（加载结果写入根数据集）
   * @param event 原始鼠标事件（用于 expandChange 回调）
   * @returns 是否加载成功
   */
  private async runLazyLoad(
    node: YTreeModel,
    from: YTreeAsyncFrom,
    isRoot: boolean = false,
    event?: MouseEvent
  ): Promise<boolean> {
    if (!this.service || !this.loadData) {
      return false;
    }

    const payload: YTreeAsyncEvent = {
      id: node.id,
      name: node.name,
      from,
      node,
    };

    // beforeAsync 前置拦截
    if (this.beforeAsync && this.beforeAsync(payload) === false) {
      return false;
    }

    // 根节点异步时无实体节点，不需要 loading 标记
    if (!isRoot) {
      this.service.setNodeLoading(node.id, true);
      this.ref.markForCheck();
    }

    try {
      const result = await this.loadData(node);
      const children = Array.isArray(result) ? result : [];
      if (isRoot) {
        this.lazyRootData = children;
        // 用加载到的根数据重建服务
        this.initService();
      } else {
        this.service.setNodeChildren(node.id, children);
        this.service.setNodeLoading(node.id, false);
        // 加载成功后才真正展开
        this.expandedIds.add(node.id);
        this.rebuildVisibleNodes();
        this.expandChange.emit({
          event: event ?? null,
          id: node.id,
          expand: true,
        });
      }
      this.ref.markForCheck();
      this.asyncSuccess.emit({ ...payload, children });
      return true;
    } catch (error) {
      if (!isRoot) {
        this.service.setNodeLoading(node.id, false);
      }
      this.ref.markForCheck();
      this.asyncError.emit({ ...payload, error });
      return false;
    }
  }

  /**
   * 重新异步加载指定节点的子节点（懒加载模式）
   * @param id 节点id
   * @returns 是否加载成功
   */
  public reAsyncChildNodes(id: NodeId): Promise<boolean> {
    const node = this.service?.getNodeById(id);
    if (!node || !this.loadData) {
      return Promise.resolve(false);
    }
    // 重新拉取并整体替换该节点的子树
    return this.runLazyLoad(node, 'api');
  }

  /**
   * 文本节点点击事件
   * @param event
   * @param id
   */
  protected onClick(event: MouseEvent, id: NodeId) {
    this.click.emit({ event, id });
  }

  /**
   * 文本节点双击事件
   * @param event
   * @param id
   */
  protected onDbClick(event: MouseEvent, id: NodeId) {
    this.dbClick.emit({ event, id });
  }

  /**
   * 文本节点右键点击事件
   * @param event
   * @param id
   */
  protected onContextMenu(event: MouseEvent, id: NodeId) {
    event.preventDefault();
    this.contextMenu.emit({ event, id });
  }

  /**
   * 手动触发视图更新（重建可见节点 + 标记检查）
   */
  private updateView(): void {
    this.rebuildVisibleNodes();
    this.ref.markForCheck();
  }

  /**
   * 展开按钮事件
   * @param event
   * @param id
   */
  protected onExpandChange(event: MouseEvent, id: NodeId) {
    event.stopPropagation();
    const next = !this.expandedIds.has(id);

    // 懒加载：首次展开且子节点尚未加载 → 触发异步加载，成功后由 runLazyLoad 展开
    if (next && this.lazy && this.loadData && this.service?.isLazyParent(id)) {
      const node = this.service.getNodeById(id);
      if (node && !node.isAjaxing) {
        void this.runLazyLoad(node, 'user', false, event);
      }
      return;
    }

    if (next) {
      this.expandedIds.add(id);
    } else {
      this.expandedIds.delete(id);
    }
    this.expandChange.emit({ event, id, expand: next });
    this.updateView();
  }

  /**
   * 节点勾选框点击事件
   * @param event
   * @param id
   */
  protected onCheckedChange(event: Event, id: NodeId) {
    const checked = (event.target as HTMLInputElement).checked;
    const ok = this.service?.setCheckedByUser(id, checked, !this.checkStrictly);
    if (ok) {
      this.checkedChange.emit({ event: event as MouseEvent, id, checked });
      this.updateView();
    }
  }

  /**
   * 计算拖拽落点：行高固定 28px，按相对行的纵向位置三分
   * @param event
   * @param hasChildren
   */
  private calcDropPosition(
    event: DragEvent,
    hasChildren: boolean
  ): 'inner' | 'prev' | 'next' {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const offset = event.clientY - rect.top;
    const ratio = offset / rect.height;
    if (ratio < 0.25) {
      return 'prev';
    }
    if (ratio > 0.75) {
      return 'next';
    }
    return hasChildren ? 'inner' : 'prev';
  }

  /**
   * 清理拖拽状态
   */
  private cleanupDrag(): void {
    this.draggingId = null;
    this.dropTarget = null;
    this.ref.markForCheck();
  }

  /**
   * 节点拖拽开始
   * @param event
   * @param id
   */
  protected onDragStart(event: DragEvent, id: NodeId) {
    if (!this.draggable) {
      return;
    }
    const node = this.service?.getNodeById(id);
    if (!node || node.disabled) {
      return;
    }
    // allowDrag 精细控制
    if (this.allowDrag && !this.allowDrag(node)) {
      return;
    }
    // beforeDrag 前置拦截
    if (
      this.beforeDrag?.({ event, id, sourceId: id, isCopy: false }) === false
    ) {
      return;
    }
    this.dragStartPos = { x: event.clientX, y: event.clientY };
    this.draggingId = id;
    this.ref.markForCheck();
    // 拖拽时收起非叶子节点（延迟到拖拽会话建立后执行）
    if (this.hasChildren(id) && this.expandedIds.has(id)) {
      const collapseId = id;
      window.setTimeout(() => {
        if (this.expandedIds.has(collapseId)) {
          this.expandedIds.delete(collapseId);
          this.updateView();
        }
      }, 0);
    }
    const copyMode = this.isCopy && (event.ctrlKey || event.metaKey);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = copyMode ? 'copy' : 'move';
      event.dataTransfer.setData('text/plain', String(id));
      try {
        event.dataTransfer.setDragImage(
          event.currentTarget as HTMLElement,
          20,
          14
        );
      } catch {
        /* 部分浏览器不支持 setDragImage */
      }
    }
    this.drag.emit({ event, id, sourceId: id, isCopy: copyMode });
  }

  /**
   * 节点拖拽经过（计算落点并高亮）
   * @param event
   * @param id
   */
  protected onDragOver(event: DragEvent, id: NodeId) {
    if (!this.draggable || this.draggingId === null) {
      return;
    }
    const node = this.service?.getNodeById(id);
    if (!node || node.disabled) {
      return;
    }
    // minMoveSize：实际移动距离不足时不显示落点
    const dx = event.clientX - this.dragStartPos.x;
    const dy = event.clientY - this.dragStartPos.y;
    if (
      this.minMoveSize > 0 &&
      Math.sqrt(dx * dx + dy * dy) < this.minMoveSize
    ) {
      return;
    }
    event.preventDefault();
    const copyMode = this.isCopy && (event.ctrlKey || event.metaKey);
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = copyMode ? 'copy' : 'move';
    }
    const position = this.calcDropPosition(event, this.hasChildren(id));
    this.dropTarget = { id, position };
    this.ref.markForCheck();
    this.dragMove.emit({
      event,
      id: this.draggingId,
      sourceId: this.draggingId,
      targetId: id,
      position,
      isCopy: copyMode,
    });
  }

  /**
   * 节点拖拽放下（执行移动/复制并通知外部）
   * @param event
   * @param id
   */
  protected onDrop(event: DragEvent, id: NodeId) {
    if (!this.draggable || this.draggingId === null) {
      return;
    }
    event.preventDefault();
    const target = this.dropTarget;
    const sourceId = this.draggingId;
    this.cleanupDrag();
    if (!target || target.id !== id) {
      return;
    }
    const copyMode = this.isCopy && (event.ctrlKey || event.metaKey);
    const moveType: 'move' | 'copy' = copyMode ? 'copy' : 'move';

    // allowDrop 精细控制
    if (this.allowDrop && !this.allowDrop(sourceId, id, target.position)) {
      return;
    }
    // beforeDrop 前置拦截
    if (
      this.beforeDrop?.({
        event,
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
      resultId = this.service?.copyNode(sourceId, id, target.position) ?? null;
      ok = resultId != null;
    } else {
      ok = this.service?.moveNode(sourceId, id, target.position) ?? false;
      resultId = sourceId;
    }

    if (ok) {
      this.drop.emit({
        event,
        id: resultId ?? sourceId,
        sourceId,
        targetId: id,
        position: target.position,
        isCopy: copyMode,
        moveType,
      });
      this.nodeChange.emit({
        event,
        id: resultId ?? sourceId,
        sourceId,
        targetId: id,
        position: target.position,
      });
      this.updateView();
    }
  }

  /**
   * 节点拖拽结束
   */
  protected onDragEnd() {
    this.cleanupDrag();
  }

  // ---------- 编辑能力（P1） ----------

  /**
   * 进入编辑态（双击标题 / 点击笔按钮），beforeEditName 返回 false 取消
   * @param event
   * @param id
   */
  protected startEdit(event: MouseEvent, id: NodeId) {
    if (!this.editable) {
      return;
    }
    const node = this.service?.getNodeById(id);
    if (!node) {
      return;
    }
    if (this.beforeEditName?.({ event, id }) === false) {
      return;
    }
    this.confirmRemoveId = null;
    this.editingId = id;
    this.editValue = node.name;
    this.ref.markForCheck();
  }

  /**
   * 重命名输入事件
   * @param event
   */
  protected onEditInput(event: Event) {
    this.editValue = (event.target as HTMLInputElement).value;
  }

  /**
   * 提交重命名（Enter / blur），beforeRename 返回 false 仅退出不保存
   * @param event
   */
  protected commitRename(event?: Event) {
    if (this.editingId === null) {
      return;
    }
    const id = this.editingId;
    const node = this.service?.getNodeById(id);
    const newName = this.editValue.trim();
    this.editingId = null;
    this.ref.markForCheck();
    if (!node || !newName || newName === node.name) {
      return;
    }
    const oldName = node.name;
    const payload: YTreeRenameEvent = {
      event: (event ?? undefined) as MouseEvent,
      id,
      oldName,
      newName,
    };
    if (this.beforeRename?.(payload) === false) {
      return;
    }
    const ok = this.service?.renameNode(id, newName);
    if (ok) {
      this.rename.emit(payload);
      this.updateView();
    }
  }

  /**
   * 取消编辑（Esc）
   */
  protected cancelEdit() {
    this.editingId = null;
    this.ref.markForCheck();
  }

  /**
   * 关闭删除确认气泡
   */
  protected closeConfirm() {
    this.confirmRemoveId = null;
    this.ref.markForCheck();
  }

  /**
   * 点击垃圾桶：切换确认气泡显隐
   * @param event
   * @param id
   */
  protected handleRemoveClick(event: MouseEvent, id: NodeId) {
    this.editingId = null;
    this.confirmRemoveId = this.confirmRemoveId === id ? null : id;
    this.ref.markForCheck();
  }

  /**
   * 确认删除：beforeRemove 返回 false 取消
   * @param event
   * @param id
   */
  protected doRemove(event: MouseEvent, id: NodeId) {
    this.closeConfirm();
    if (this.beforeRemove?.({ event, id }) === false) {
      return;
    }
    const removed = this.service?.removeNode(id) ?? [];
    if (removed.length > 0) {
      removed.forEach((rid) => this.expandedIds.delete(rid));
      this.remove.emit({ event, id });
      this.updateView();
    }
  }

  /**
   * 点击加号：给当前节点追加一个子节点，beforeAdd 返回 false 取消
   * @param event
   * @param id
   */
  protected handleAddClick(event: MouseEvent, id: NodeId) {
    if (!this.editable) {
      return;
    }
    if (this.beforeAdd?.({ event, id, parentId: id }) === false) {
      return;
    }
    const newId = this.service?.addNode(id, { name: '新建节点' });
    if (newId != null) {
      this.expandedIds.add(id);
      this.add.emit({ event, id: newId, parentId: id });
      this.updateView();
    }
  }

  /**
   * 获取节点信息
   * @param id
   */
  public getNodeById(id: NodeId): YTreeModel | null {
    return this.service?.getNodeById(id) ?? null;
  }

  /**
   * 获取勾选的节点集合
   */
  public getCheckedList(): Array<YTreeModel> {
    return this.service?.getCheckedList() ?? [];
  }

  /**
   * 程序化勾选（可改 disabled 节点）
   */
  public checkNode(
    id: NodeId,
    checked: boolean,
    linkage: boolean = true
  ): boolean {
    const ok = this.service?.checkNode(id, checked, linkage) ?? false;
    if (ok) this.updateView();
    return ok;
  }

  /**
   * 全选 / 全不选（radio 模式下全选无效）
   */
  public checkAllNodes(checked: boolean = true): boolean {
    const ok = this.service?.checkAllNodes(checked) ?? false;
    if (ok) this.updateView();
    return ok;
  }

  /**
   * 全不选
   */
  public cancelAllNodes(): boolean {
    return this.checkAllNodes(false);
  }

  /**
   * 相对 init 快照，勾选状态发生变化的节点
   */
  public getChangeCheckedNodes(): Array<YTreeModel> {
    return this.service?.getChangeCheckedNodes() ?? [];
  }

  /**
   * 程序化移动节点
   */
  public moveNode(
    sourceId: NodeId,
    targetId: NodeId,
    position: 'inner' | 'prev' | 'next'
  ): boolean {
    const ok = this.service?.moveNode(sourceId, targetId, position) ?? false;
    if (ok) this.updateView();
    return ok;
  }

  /**
   * 程序化复制节点，返回新节点id或null
   */
  public copyNode(
    sourceId: NodeId,
    targetId: NodeId,
    position: 'inner' | 'prev' | 'next'
  ): NodeId | null {
    const newId = this.service?.copyNode(sourceId, targetId, position) ?? null;
    if (newId != null) this.updateView();
    return newId;
  }

  ngOnDestroy(): void {
    this.service?.destroyed();
    this.service = null;
  }
}
