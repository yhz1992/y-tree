import type {
  NodeId,
  YTreeCheckedState,
  YTreeCheckedSummary,
  YTreeChkboxType,
  YTreeChkStyle,
  YTreeFlatNode,
  YTreeModel,
  YTreeNode,
  YTreeRadioType,
} from "./model";

/**
 * 懒加载「根节点异步」时使用的虚拟根节点 id
 * datasource 为空且开启 lazy 时，loadData 会收到以该 id 构造的虚拟根节点
 */
export const Y_TREE_ROOT_ID = "__yt_root__";

/**
 * 节点直接子节点的状态计数（增量更新用）
 * checked = 子节点中状态为 checked/indeterminate 的数量
 * unchecked = 子节点中状态为 unchecked/indeterminate 的数量
 */
type ChildStateCount = {
  checked: number;
  unchecked: number;
};

/**
 * 节点勾选状态（"" 表示节点不存在，用于新增/删除节点的计数增减）
 */
type CheckedStateLike = YTreeCheckedState | "";

export class YTreeService {
  constructor(
    nodes: Array<YTreeNode | YTreeFlatNode> = [],
    checkIds: Set<string | number> | null = null,
    selectedIds: Set<string | number> | null = null,
    nocheckIds: Set<string | number> | null = null,
    disabledIds: Set<string | number> | null = null,
    expandIds: Set<string | number> | null = null,
    hideIds: Set<string | number> | null = null,
  ) {
    this.checkIds = checkIds;
    this.checkIdsControlled = checkIds !== null;
    this.selectedIds = selectedIds;
    this.nocheckIds = nocheckIds;
    this.disabledIds = disabledIds;
    this.expandIds = expandIds;
    this.hideIds = hideIds;

    this.init(nodes);
  }

  /**
   * @type {NodeId}
   * 根节点父id占位符
   */
  private readonly ROOT_PARENT_ID: NodeId = "";

  /**
   * @type { Map<NodeId, YTreeModel> }
   * 扁平化树形结构map集合
   */
  private flatNodesMap: Map<NodeId, YTreeModel> | null = null;

  /**
   * @type { Map<number, Array<NodeId>> }
   * level维度下的节点id集合
   */
  private levelMap: Map<number, Array<NodeId>> | null = null;

  /**
   * @type { Map<NodeId, YTreeCheckedState> }
   * 节点勾选状态缓存
   */
  private nodeCheckedStateMap: Map<NodeId, YTreeCheckedState> | null = null;

  /**
   * @type { Map<NodeId, ChildStateCount> | null }
   * 每个非叶子节点直接子节点的状态计数（增量更新用，父节点状态可 O(1) 解析）
   */
  private childStateCountMap: Map<NodeId, ChildStateCount> | null = null;

  /**
   * @type {boolean}
   * 叶子汇总是否因结构变更而失效（惰性重算标志，getTreeCheckedSummary 读取时重算）
   */
  private leafStatsDirty: boolean = false;

  /**
   * @type { Array<NodeId> }
   * 根节点id集合
   */
  private rootIds: Array<NodeId> = [];

  /**
   * @type {number}
   * 树结构最大层级
   */
  private maxLevel: number = 0;

  /**
   * @type {number}
   * 自动生成节点id的自增计数（配合时间戳，避免同毫秒冲突）
   */
  private nodeIdCounter: number = 0;

  /**
   * @type {number}
   * 整树可参与勾选计算的叶子节点总量
   */
  private treeLeafTotal: number = 0;

  /**
   * @type {number}
   * 整树叶子节点勾选数量
   */
  private treeLeafChecked: number = 0;

  /**
   * @type { Set<NodeId> }
   * 勾选节点的id集合
   */
  private checkIds: Set<NodeId> | null;

  /**
   * @type {boolean}
   * 勾选集合是否由外部受控传入（rebuildCheckedStatus 会覆盖 checkIds，需用此标志区分受控语义）
   */
  private checkIdsControlled: boolean = false;

  /**
   * @type { Set<NodeId> | null }
   * 文本区域选中的id集合
   */
  private selectedIds: Set<NodeId> | null;

  /**
   * @type { Set<NodeId> | null }
   * 整树开启勾选框模式下，不显示勾选框的节点id集合
   */
  private nocheckIds: Set<NodeId> | null;

  /**
   * @type { Set<NodeId> | null }
   * 节点禁用id集合，不可进行用户点击操作
   */
  private disabledIds: Set<NodeId> | null;

  /**
   * @type { Set<NodeId> | null }
   * 节点展开的id集合
   */
  private expandIds: Set<NodeId> | null;

  /**
   * @type { Set<NodeId> | null }
   * 隐藏节点的id集合
   */
  private hideIds: Set<NodeId> | null;

  /**
   * 当前对整树中勾选框的操作，以便视图更新依据
   */
  private TREE_CHECKED_STATUS: boolean = false;

  /**
   * 勾选控件样式（checkbox / radio）
   */
  private chkStyle: YTreeChkStyle = "checkbox";

  /**
   * radio 互斥范围（all = 整树；level = 同级兄弟）
   */
  private radioType: YTreeRadioType = "all";

  /**
   * 父子联动方向（Y=勾选时，N=取消勾选时；p=祖先，s=子孙）
   */
  private chkboxType: { Y: string; N: string } = { Y: "ps", N: "ps" };

  /**
   * 最近一次 init 时的勾选快照（getChangeCheckedNodes 对比用）
   */
  private lastCheckedSnapshot: Set<NodeId> | null = null;

  /**
   * 初始化数据，ps：二次初始化构建数据模型，内部数据计算状态将被重置
   * @param { Array<YTreeNode | YTreeFlatNode> } nodes 外部数据源
   * @returns {void} -
   */
  public init(nodes: Array<YTreeNode | YTreeFlatNode> | null): void {
    this.flatNodesMap = new Map();
    this.levelMap = new Map();
    this.nodeCheckedStateMap = new Map();
    this.childStateCountMap = new Map();
    this.leafStatsDirty = false;
    this.rootIds = [];
    this.maxLevel = 0;
    this.treeLeafTotal = 0;
    this.treeLeafChecked = 0;
    this.TREE_CHECKED_STATUS = false;

    if (!Array.isArray(nodes) || nodes.length === 0) {
      this.rebuildCheckedStatus();
      return;
    }

    if (this.isNestedMode(nodes)) {
      this.initByNested(nodes as Array<YTreeNode>);
    } else {
      this.initByFlat(nodes as Array<YTreeFlatNode>);
    }

    this.rebuildCheckedStatus();
    this.captureCheckedSnapshot();
    nodes = null;
  }

  /**
   * 配置勾选模式（组件在 props 变化时调用）
   * @param {YTreeChkStyle} chkStyle 勾选控件样式
   * @param {YTreeRadioType} radioType radio 互斥范围
   * @param {YTreeChkboxType | null} chkboxType 父子联动方向，null 表示默认双向 { Y: "ps", N: "ps" }
   */
  public configureCheckMode(
    chkStyle: YTreeChkStyle = "checkbox",
    radioType: YTreeRadioType = "all",
    chkboxType: YTreeChkboxType | null = null,
  ): void {
    this.chkStyle = chkStyle === "radio" ? "radio" : "checkbox";
    this.radioType = radioType === "level" ? "level" : "all";
    this.chkboxType = {
      Y: typeof chkboxType?.Y === "string" ? chkboxType.Y : "ps",
      N: typeof chkboxType?.N === "string" ? chkboxType.N : "ps",
    };
  }

  /**
   * 用户行为触发节点勾选
   * @param {NodeId} id 节点id
   * @param {boolean} checked 目标勾选状态
   * @param {boolean} linkage 是否联动子节点
   * @returns {boolean}
   */
  public setCheckedByUser(
    id: NodeId,
    checked: boolean,
    linkage: boolean = true,
  ): boolean {
    return this.setCheckedStatus(id, checked, false, linkage);
  }

  /**
   * 外部API触发节点勾选，disabled节点可通过该方式修改勾选状态
   * @param {NodeId} id 节点id
   * @param {boolean} checked 目标勾选状态
   * @param {boolean} linkage 是否联动子节点
   * @returns {boolean}
   */
  public setCheckedByApi(
    id: NodeId,
    checked: boolean,
    linkage: boolean = true,
  ): boolean {
    return this.setCheckedStatus(id, checked, true, linkage);
  }

  /**
   * 程序化勾选（走 API 通道，可改 disabled 节点）
   * @param {NodeId} id 节点id
   * @param {boolean} checked 目标勾选状态
   * @param {boolean} linkage 是否按 chkboxType 联动，默认 true
   */
  public checkNode(
    id: NodeId,
    checked: boolean,
    linkage: boolean = true,
  ): boolean {
    return this.setCheckedByApi(id, checked, linkage);
  }

  /**
   * 全选 / 全不选
   * radio 模式下全选无意义，仅全不选生效
   * nocheck / checkboxDisabled 节点跳过；disabled 节点按 API 通道可改
   * @param {boolean} checked true=全选，false=全不选
   * @returns {boolean} 是否发生实际变更
   */
  public checkAllNodes(checked: boolean = true): boolean {
    if (!this.flatNodesMap) {
      return false;
    }
    if (this.chkStyle === "radio" && checked) {
      return false;
    }

    let changed = false;
    this.flatNodesMap.forEach((node) => {
      if (!this.canUpdateChecked(node, true)) {
        return;
      }
      if (this.applyNodeChecked(node, checked)) {
        changed = true;
      }
    });

    if (changed) {
      this.rebuildCheckedStatus();
    }
    return changed;
  }

  /**
   * 全不选
   */
  public cancelAllNodes(): boolean {
    return this.checkAllNodes(false);
  }

  /**
   * 相对 init 时快照，勾选状态发生变化的节点
   * 不含 nocheck 节点
   */
  public getChangeCheckedNodes(): Array<YTreeModel> {
    const list: Array<YTreeModel> = [];
    if (!this.flatNodesMap) {
      return list;
    }
    const snapshot = this.lastCheckedSnapshot ?? new Set<NodeId>();
    this.flatNodesMap.forEach((node, id) => {
      if (node.nocheck) {
        return;
      }
      const was = snapshot.has(id);
      const now = !!node.checked;
      if (was !== now) {
        list.push(node);
      }
    });
    return list;
  }

  /**
   * 确保 selectedIds 为可变集合（非受控时从当前节点 selected 快照生成）
   */
  private ensureSelectedIds(): Set<NodeId> {
    if (this.selectedIds) {
      return this.selectedIds;
    }
    const next = new Set<NodeId>();
    this.flatNodesMap?.forEach((node) => {
      if (node.selected) {
        next.add(node.id);
      }
    });
    this.selectedIds = next;
    return next;
  }

  /**
   * 选中节点文本区
   * @param {NodeId} id 节点id
   * @param {boolean} addFlag true=追加选中（多选），false=替换为仅该节点
   */
  public selectNode(id: NodeId, addFlag: boolean = false): boolean {
    const node = this.flatNodesMap?.get(id);
    if (!node) {
      return false;
    }
    const selected = this.ensureSelectedIds();
    if (!addFlag) {
      if (selected.size === 1 && selected.has(id) && node.selected) {
        return false;
      }
      selected.forEach((sid) => {
        const other = this.flatNodesMap?.get(sid);
        if (other) {
          other.selected = false;
        }
      });
      selected.clear();
    } else if (selected.has(id) && node.selected) {
      return false;
    }
    selected.add(id);
    node.selected = true;
    return true;
  }

  /**
   * 取消文本区选中
   * @param {NodeId} [id] 缺省则清空全部选中
   */
  public cancelSelectedNode(id?: NodeId): boolean {
    const selected = this.ensureSelectedIds();
    if (id === undefined) {
      if (selected.size === 0) {
        return false;
      }
      selected.forEach((sid) => {
        const node = this.flatNodesMap?.get(sid);
        if (node) {
          node.selected = false;
        }
      });
      selected.clear();
      return true;
    }
    const node = this.flatNodesMap?.get(id);
    if (!node || !selected.has(id)) {
      return false;
    }
    selected.delete(id);
    node.selected = false;
    return true;
  }

  /**
   * 当前文本区选中节点
   */
  public getSelectedNodes(): Array<YTreeModel> {
    const list: Array<YTreeModel> = [];
    if (!this.flatNodesMap) {
      return list;
    }
    if (this.selectedIds) {
      this.selectedIds.forEach((id) => {
        const node = this.flatNodesMap?.get(id);
        if (node && node.selected) {
          list.push(node);
        }
      });
      return list;
    }
    this.flatNodesMap.forEach((node) => {
      if (node.selected) {
        list.push(node);
      }
    });
    return list;
  }

  /**
   * 根节点列表
   */
  public getNodes(): Array<YTreeModel> {
    const list: Array<YTreeModel> = [];
    for (const id of this.rootIds) {
      const node = this.flatNodesMap?.get(id);
      if (node) {
        list.push(node);
      }
    }
    return list;
  }

  /**
   * 按属性精确匹配
   * parentId 有值时只搜该子树（含自身）
   */
  public getNodesByParam(
    key: string,
    value: unknown,
    parentId?: NodeId,
  ): Array<YTreeModel> {
    return this.collectByParam(key, value, parentId, false);
  }

  /**
   * 按属性模糊匹配，忽略大小写
   */
  public getNodesByParamFuzzy(
    key: string,
    value: unknown,
    parentId?: NodeId,
  ): Array<YTreeModel> {
    return this.collectByParam(key, value, parentId, true);
  }

  /**
   * 节点在兄弟中的下标，找不到返回 -1
   */
  public getNodeIndex(id: NodeId): number {
    const node = this.flatNodesMap?.get(id);
    if (!node) {
      return -1;
    }
    const siblings = this.getSiblingList(node);
    if (!siblings) {
      return -1;
    }
    return siblings.indexOf(id);
  }

  /**
   * 热更新展示字段
   * 不改 id / pId / childIds / level 等结构字段
   * checked 走 checkNode；selected 走 selectNode / cancelSelectedNode
   */
  public updateNode(
    id: NodeId,
    patch: Partial<YTreeModel> | Record<string, unknown> = {},
  ): boolean {
    const node = this.flatNodesMap?.get(id);
    if (!node || !patch) {
      return false;
    }
    const data = patch as Record<string, unknown>;
    let changed = false;

    const setStr = (field: string) => {
      if (!(field in data)) {
        return;
      }
      const next = data[field];
      if (typeof next !== "string") {
        return;
      }
      if ((node as Record<string, unknown>)[field] === next) {
        return;
      }
      (node as Record<string, unknown>)[field] = next;
      changed = true;
    };
    const setBool = (field: string) => {
      if (!(field in data)) {
        return;
      }
      const next = !!data[field];
      if ((node as Record<string, unknown>)[field] === next) {
        return;
      }
      (node as Record<string, unknown>)[field] = next;
      changed = true;
    };

    setStr("name");
    setStr("title");
    setStr("icon");
    setStr("iconOpen");
    setStr("iconClose");
    setStr("iconSkin");
    setBool("disabled");
    setBool("hide");
    setBool("nocheck");
    setBool("checkboxDisabled");

    if ("checked" in data) {
      if (this.checkNode(id, !!data["checked"])) {
        changed = true;
      }
    }
    if ("selected" in data) {
      const ok = data["selected"]
        ? this.selectNode(id, true)
        : this.cancelSelectedNode(id);
      if (ok) {
        changed = true;
      }
    }

    return changed;
  }

  /**
   * 当前树 DFS 扁平列表
   */
  public transformToArray(parentId?: NodeId): Array<YTreeModel> {
    const list: Array<YTreeModel> = [];
    if (!this.flatNodesMap) {
      return list;
    }
    const roots =
      parentId === undefined
        ? this.rootIds
        : this.flatNodesMap.get(parentId)
        ? [parentId]
        : [];
    const stack: Array<NodeId> = [...roots].reverse();
    while (stack.length) {
      const id = stack.pop() as NodeId;
      const node = this.flatNodesMap.get(id);
      if (!node) {
        continue;
      }
      list.push(node);
      for (let i = node.childIds.length - 1; i >= 0; i--) {
        stack.push(node.childIds[i]);
      }
    }
    return list;
  }

  /**
   * 当前树还原为嵌套结构
   */
  public transformToTreeNodes(parentId?: NodeId): Array<YTreeNode> {
    const build = (ids: Array<NodeId>): Array<YTreeNode> => {
      const result: Array<YTreeNode> = [];
      for (const id of ids) {
        const node = this.flatNodesMap?.get(id);
        if (!node) {
          continue;
        }
        result.push({
          ...(node as unknown as YTreeNode),
          children: build(node.childIds),
        });
      }
      return result;
    };
    if (parentId === undefined) {
      return build(this.rootIds);
    }
    const parent = this.flatNodesMap?.get(parentId);
    if (!parent) {
      return [];
    }
    return build(parent.childIds);
  }

  /**
   * 纯函数：id/pId 扁数据 → 嵌套（不碰当前树）
   */
  public transformToTreeNodesFromFlat(
    nodes: Array<YTreeFlatNode>,
  ): Array<YTreeNode> {
    const list = Array.isArray(nodes) ? nodes : [];
    const childrenMap = new Map<NodeId, Array<YTreeFlatNode>>();
    const roots: Array<YTreeFlatNode> = [];
    const sourceMap = new Map<NodeId, YTreeFlatNode>();
    for (const node of list) {
      if (!node || node.id === undefined || node.id === null) {
        continue;
      }
      sourceMap.set(node.id, node);
    }
    for (const node of list) {
      if (!node || node.id === undefined || node.id === null) {
        continue;
      }
      const pId = this.resolveFlatNodeParentId(node, sourceMap);
      if (pId === this.ROOT_PARENT_ID) {
        roots.push(node);
        continue;
      }
      const childs = childrenMap.get(pId);
      if (childs) {
        childs.push(node);
      } else {
        childrenMap.set(pId, [node]);
      }
    }
    const build = (items: Array<YTreeFlatNode>): Array<YTreeNode> => {
      return items.map((item) => ({
        ...(item as unknown as YTreeNode),
        children: build(childrenMap.get(item.id) ?? []),
      }));
    };
    return build(roots);
  }

  /**
   * 按属性收集节点
   */
  private collectByParam(
    key: string,
    value: unknown,
    parentId: NodeId | undefined,
    fuzzy: boolean,
  ): Array<YTreeModel> {
    const list: Array<YTreeModel> = [];
    if (!this.flatNodesMap || !key) {
      return list;
    }
    const needle = fuzzy ? String(value ?? "").toLowerCase() : value;
    const match = (node: YTreeModel): boolean => {
      const actual = (node as Record<string, unknown>)[key];
      if (fuzzy) {
        return (
          String(actual ?? "")
            .toLowerCase()
            .indexOf(needle as string) >= 0
        );
      }
      return actual === value;
    };
    if (parentId === undefined) {
      this.flatNodesMap.forEach((node) => {
        if (match(node)) {
          list.push(node);
        }
      });
      return list;
    }
    const root = this.flatNodesMap.get(parentId);
    if (!root) {
      return list;
    }
    const stack: Array<NodeId> = [parentId];
    const visited = new Set<NodeId>();
    while (stack.length) {
      const id = stack.pop() as NodeId;
      if (visited.has(id)) {
        continue;
      }
      visited.add(id);
      const node = this.flatNodesMap.get(id);
      if (!node) {
        continue;
      }
      if (match(node)) {
        list.push(node);
      }
      for (let i = node.childIds.length - 1; i >= 0; i--) {
        stack.push(node.childIds[i]);
      }
    }
    return list;
  }

  /**
   * 用户行为触发节点勾选切换
   * @param {NodeId} id 节点id
   * @param {boolean} linkage 是否联动子节点
   * @returns {boolean}
   */
  public toggleCheckedByUser(id: NodeId, linkage: boolean = true): boolean {
    const state = this.getNodeCheckedState(id);
    return this.setCheckedByUser(id, state !== "checked", linkage);
  }

  /**
   * 获取节点信息
   * @param {NodeId} id 节点id
   */
  public getNodeById(id: NodeId): YTreeModel | null {
    return this.flatNodesMap?.get(id) || null;
  }

  /**
   * 获取节点勾选状态
   * @param {NodeId} id 节点id
   */
  public getNodeCheckedState(id: NodeId): YTreeCheckedState {
    return this.nodeCheckedStateMap?.get(id) || "unchecked";
  }

  /**
   * 获取整树勾选汇总
   */
  public getTreeCheckedSummary(): YTreeCheckedSummary {
    this.ensureLeafStats();
    const state = this.resolveCheckedState(
      this.treeLeafChecked,
      this.treeLeafTotal,
    );
    return {
      rootIds: [...this.rootIds],
      totalLeaf: this.treeLeafTotal,
      checkedLeaf: this.treeLeafChecked,
      checked: state === "checked",
      indeterminate: state === "indeterminate",
      state,
    };
  }

  /**
   * 获取勾选的节点id集合
   * @param {boolean} includeNocheck 是否包含nocheck节点
   */
  public getCheckedIds(includeNocheck: boolean = true): Array<NodeId> {
    const ids: Array<NodeId> = [];
    if (!this.checkIds) {
      return ids;
    }

    this.checkIds.forEach((id) => {
      const node = this.flatNodesMap?.get(id);
      if (!node) {
        return;
      }
      if (!includeNocheck && node.nocheck) {
        return;
      }
      ids.push(id);
    });

    return ids;
  }

  /**
   * 获取勾选节点集合
   * @param {boolean} includeNocheck 是否包含nocheck节点
   */
  public getCheckedList(includeNocheck: boolean = true): Array<YTreeModel> {
    const list: Array<YTreeModel> = [];
    const checkedIds = this.getCheckedIds(includeNocheck);
    const len = checkedIds.length;

    for (let index = 0; index < len; index++) {
      const node = this.flatNodesMap?.get(checkedIds[index]);
      if (node) {
        list.push(node);
      }
    }

    return list;
  }

  /**
   * 获取节点map
   */
  public getFlatNodesMap() {
    return this.flatNodesMap;
  }

  /**
   * 获取根节点id集合（顺序即树根渲染顺序，moveNode 会更新此顺序）
   */
  public getRootIds(): Array<NodeId> {
    return [...this.rootIds];
  }

  /**
   * 获取level维度节点map
   */
  public getLevelMap() {
    return this.levelMap;
  }

  /**
   * 手动刷新整树勾选状态
   */
  public refreshCheckedStatus() {
    this.rebuildCheckedStatus();
  }

  /**
   * 移动节点（拖拽/API 调用）
   * 移动后自动重建派生字段：isFirst/isLast/index/preId/nextId/level，并重算勾选状态
   * @param {NodeId} sourceId 被移动节点id
   * @param {NodeId} targetId 目标节点id
   * @param {'inner' | 'prev' | 'next'} position 落点：inner=成为目标子节点，prev=插入目标之前，next=插入目标之后
   * @returns {boolean} 是否发生实际变更
   */
  public moveNode(
    sourceId: NodeId,
    targetId: NodeId,
    position: "inner" | "prev" | "next",
  ): boolean {
    if (!this.flatNodesMap || !this.levelMap) {
      return false;
    }

    const source = this.flatNodesMap.get(sourceId);
    const target = this.flatNodesMap.get(targetId);
    if (!source || !target) {
      return false;
    }
    if (sourceId === targetId) {
      return false;
    }
    // 禁用节点不可移动，也不可作为移动目标
    if (source.disabled || target.disabled) {
      return false;
    }
    // 不能移动到自己的子孙节点下（会导致断链）
    if (this.isDescendantOf(targetId, sourceId)) {
      return false;
    }
    // 原地移动（落点与当前位置一致）视为无变更
    if (this.isSamePosition(source, target, position)) {
      return false;
    }

    const newLevel = position === "inner" ? target.level + 1 : target.level;

    // 搬运语义：子树内部状态不变，仅同步原父/新父的计数并沿祖先链增量传播
    const sourceState = this.getNodeCheckedState(sourceId);

    // 结构变更：叶子汇总标记失效（读取时惰性重算）
    this.leafStatsDirty = true;

    this.detachNode(source);
    // 从原父移除：原父计数减去 source 贡献，向上传播
    this.propagateCheckedState(sourceId, sourceState, "");

    this.attachNode(source, target, position);
    this.rebuildSubtreeLevel(source, newLevel);
    this.rebuildLevelMap();
    // 挂到新父：新父计数加上 source 贡献，向上传播
    this.propagateCheckedState(sourceId, "", sourceState);

    return true;
  }

  /**
   * 复制节点（含整棵子树）到目标位置
   * 复制后自动为新子树生成新id并重建所有派生字段与勾选状态
   * @param {NodeId} sourceId 被复制节点id
   * @param {NodeId} targetId 目标节点id
   * @param {'inner' | 'prev' | 'next'} position 落点
   * @returns {NodeId | null} 新子树根节点id，失败返回 null
   */
  public copyNode(
    sourceId: NodeId,
    targetId: NodeId,
    position: "inner" | "prev" | "next",
  ): NodeId | null {
    if (!this.flatNodesMap || !this.levelMap) {
      return null;
    }

    const source = this.flatNodesMap.get(sourceId);
    const target = this.flatNodesMap.get(targetId);
    if (!source || !target) {
      return null;
    }
    if (sourceId === targetId) {
      return null;
    }
    if (source.disabled || target.disabled) {
      return null;
    }
    // 不能复制到自己的子孙节点下
    if (this.isDescendantOf(targetId, sourceId)) {
      return null;
    }

    // 收集源子树全部id（按层级、同层按顺序排列以保证复制后childIds顺序正确）
    const sourceIds = this.collectSubtreeNodeIds(sourceId);
    const oldIdToNewId = new Map<NodeId, NodeId>();
    const newNodes: Array<YTreeModel> = [];

    for (const oldId of sourceIds) {
      const old = this.flatNodesMap.get(oldId);
      if (!old) {
        continue;
      }
      const newId = this.generateNodeId();
      oldIdToNewId.set(oldId, newId);

      const newNode: YTreeModel = {
        ...old,
        id: newId,
        pId: "", // 先占位，稍后统一映射
        isRoot: false,
        childIds: [], // 先占位
        preId: "",
        nextId: "",
        index: 0,
        isFirst: false,
        isLast: false,
        level: 0, // 稍后由rebuildSubtreeLevel计算
      };
      newNodes.push(newNode);
      this.flatNodesMap?.set(newId, newNode);
    }

    // 映射父子关系与childIds
    for (const newNode of newNodes) {
      const oldId = sourceIds[newNodes.indexOf(newNode)];
      const old = this.flatNodesMap.get(oldId);
      if (old) {
        // pId映射
        if (oldId === sourceId) {
          // 根节点：pId由attachNode决定
          newNode.pId = "";
        } else if (oldIdToNewId.has(old.pId)) {
          newNode.pId = oldIdToNewId.get(old.pId) ?? "";
        }
        // childIds映射
        newNode.childIds = old.childIds
          .map((cid) => oldIdToNewId.get(cid) ?? "")
          .filter((id) => id !== "");
      }
    }

    // 将新子树根挂载到目标位置
    const rootNewId = oldIdToNewId.get(sourceId);
    if (rootNewId === undefined) {
      // 回滚
      newNodes.forEach((n) => this.flatNodesMap?.delete(n.id));
      return null;
    }
    const rootNewNode = this.flatNodesMap.get(rootNewId);
    if (!rootNewNode) {
      newNodes.forEach((n) => this.flatNodesMap?.delete(n.id));
      return null;
    }

    const newLevel = position === "inner" ? target.level + 1 : target.level;
    this.attachNode(rootNewNode, target, position);
    this.rebuildSubtreeLevel(rootNewNode, newLevel);
    this.rebuildLevelMap();
    // 结构变更：叶子汇总标记失效（读取时惰性重算）
    this.leafStatsDirty = true;
    // 新子树局部重建（全新子树：内部状态重算，统计由惰性重算兜底）+ 沿祖先链向上传播
    this.rebuildSubtreeCheckedStatus(rootNewId, true);

    return rootNewId;
  }

  /**
   * 重命名节点
   * @param {NodeId} id 节点id
   * @param {string} newName 新名称（空白或与原名相同视为无变更）
   * @returns {boolean} 是否发生实际变更
   */
  public renameNode(id: NodeId, newName: string): boolean {
    const node = this.flatNodesMap?.get(id);
    if (!node) {
      return false;
    }
    const name = typeof newName === "string" ? newName.trim() : "";
    if (!name || name === node.name) {
      return false;
    }
    node.name = name;
    return true;
  }

  /**
   * 删除节点（含整棵子树）
   * @param {NodeId} id 节点id
   * @returns {Array<NodeId>} 被删除的节点id集合（含自身与全部子孙），未删除返回空数组
   */
  public removeNode(id: NodeId): Array<NodeId> {
    if (!this.flatNodesMap || !this.levelMap) {
      return [];
    }
    const node = this.flatNodesMap.get(id);
    if (!node) {
      return [];
    }

    // 收集整棵子树（含自身），供调用方清理外部状态
    const removedIds = this.collectSubtreeNodeIds(id);

    // 结构变更：叶子汇总标记失效（读取时惰性重算）
    this.leafStatsDirty = true;

    // 从父级兄弟链上摘除（根节点从 rootIds 摘除）
    const siblings = this.getSiblingList(node);
    if (siblings) {
      const index = siblings.indexOf(id);
      if (index >= 0) {
        siblings.splice(index, 1);
        this.refreshSiblingMeta(siblings, node.pId);
      }
    }

    // 增量传播：被删子树根从父节点计数中移除（需在删除 map 之前执行）
    this.propagateCheckedState(id, this.getNodeCheckedState(id), "");

    // 移除内部数据结构
    for (const rid of removedIds) {
      this.flatNodesMap.delete(rid);
      this.nodeCheckedStateMap?.delete(rid);
      this.childStateCountMap?.delete(rid);
      this.checkIds?.delete(rid);
      this.selectedIds?.delete(rid);
    }
    this.rebuildLevelMap();

    return removedIds;
  }

  /**
   * 新增节点（作为 parentId 的子节点）
   * @param {NodeId} parentId 父节点id
   * @param {Partial<YTreeNode>} data 节点数据（id 缺省自动生成；name 缺省为"新建节点"）
   * @param {number} index 插入位置下标，-1 或越界时追加到末尾
   * @returns {NodeId | null} 新节点id，失败返回 null
   */
  public addNode(
    parentId: NodeId,
    data: Partial<YTreeNode> = {},
    index: number = -1,
  ): NodeId | null {
    if (!this.flatNodesMap || !this.levelMap) {
      return null;
    }
    const parent = this.flatNodesMap.get(parentId);
    if (!parent) {
      return null;
    }

    const _data = { ...(data as Record<string, any>) };
    let id = _data["id"] as NodeId;
    if (id === undefined || id === null || id === "") {
      id = this.generateNodeId();
    }
    if (this.flatNodesMap.has(id)) {
      return null;
    }

    const childIds = parent.childIds;
    const insertIndex =
      index < 0 || index > childIds.length ? childIds.length : index;

    const source: YTreeNode = {
      ...(_data as YTreeNode),
      id,
      name: typeof _data["name"] === "string" ? _data["name"] : "新建节点",
      children: [],
    };

    const node = this.createFlatNode(
      source,
      parent.id,
      parent.level + 1,
      insertIndex,
      childIds.length + 1,
      [],
      childIds[insertIndex - 1] ?? this.ROOT_PARENT_ID,
      childIds[insertIndex] ?? this.ROOT_PARENT_ID,
    );

    // createFlatNode 的受控判断依赖 this.checkIds（可能已被 rebuildCheckedStatus 汇总结果覆盖），
    // 这里按初始受控语义显式修正新节点勾选状态
    if (this.checkIdsControlled) {
      node.checked = !!this.checkIds?.has(id);
    } else if (typeof _data["checked"] === "boolean") {
      node.checked = _data["checked"];
    }
    if (node.nocheck) {
      node.checked = true;
    }

    childIds.splice(insertIndex, 0, id);
    this.flatNodesMap.set(id, node);
    this.registerLevelNode(node.level, id);
    this.refreshSiblingMeta(childIds, parent.id);

    // 新节点状态（叶子，nocheck 视为勾选）
    const newState = this.getResolvedLeafChecked(node)
      ? "checked"
      : "unchecked";
    this.applyStateToNode(node, newState);

    // 结构变更：叶子汇总标记失效（读取时惰性重算）
    this.leafStatsDirty = true;

    // 增量传播：父节点计数加上新节点贡献，向上传播
    this.propagateCheckedState(id, "", newState);

    return id;
  }

  /**
   * 自动生成节点id（时间戳 + 自增计数）
   * @returns {NodeId}
   */
  private generateNodeId(): NodeId {
    this.nodeIdCounter += 1;
    return `__yt_new_${Date.now()}_${this.nodeIdCounter}`;
  }

  // ------------------------------------------------------------------
  // 懒加载（P3）
  // ------------------------------------------------------------------

  /**
   * 构造懒加载「虚拟根节点」（datasource 为空、需异步加载根节点时传给 loadData）
   * @returns {YTreeModel}
   */
  public createLazyRootNode(): YTreeModel {
    const id = Y_TREE_ROOT_ID;
    return {
      id,
      name: "root",
      pId: this.ROOT_PARENT_ID,
      level: 0,
      index: 0,
      isRoot: true,
      isFirst: true,
      isLast: true,
      preId: this.ROOT_PARENT_ID,
      nextId: this.ROOT_PARENT_ID,
      childIds: [],
      checked: false,
      selected: false,
      nocheck: false,
      disabled: false,
      hide: false,
      expanded: false,
      halfChecked: false,
      isParent: true,
    };
  }

  /**
   * 节点是否具备子节点（含懒加载模式下「标记为父节点但子节点尚未加载」的情况）
   * 组件据此决定是否渲染展开箭头
   * @param {NodeId} id 节点id
   * @returns {boolean}
   */
  public hasChildren(id: NodeId): boolean {
    const node = this.flatNodesMap?.get(id);
    if (!node) {
      return false;
    }
    return node.childIds.length > 0 || !!node.isParent;
  }

  /**
   * 是否为「待异步加载」的父节点（标记 isParent 且子节点尚未加载）
   * @param {NodeId} id 节点id
   * @returns {boolean}
   */
  public isLazyParent(id: NodeId): boolean {
    const node = this.flatNodesMap?.get(id);
    if (!node) {
      return false;
    }
    return !!node.isParent && node.childIds.length === 0;
  }

  /**
   * 标记节点异步加载状态（渲染 loading 图标用）
   * @param {NodeId} id 节点id
   * @param {boolean} loading 是否加载中
   * @returns {boolean} 节点是否存在
   */
  public setNodeLoading(id: NodeId, loading: boolean): boolean {
    const node = this.flatNodesMap?.get(id);
    if (!node) {
      return false;
    }
    node.isAjaxing = loading;
    return true;
  }

  /**
   * 写入异步加载得到的子节点（懒加载核心）
   * 复用 addNode 的增量勾选传播，天然支持嵌套数据（children 递归展开）
   * @param {NodeId} parentId 父节点id
   * @param {Array<YTreeNode | YTreeFlatNode>} children 子节点数据
   * @param {boolean} append 是否追加；默认 false 表示替换已有子节点
   * @returns {Array<NodeId>} 本次新增的子节点id集合
   */
  public setNodeChildren(
    parentId: NodeId,
    children: Array<YTreeNode | YTreeFlatNode>,
    append: boolean = false,
  ): Array<NodeId> {
    if (!this.flatNodesMap || !this.levelMap) {
      return [];
    }
    const parent = this.flatNodesMap.get(parentId);
    if (!parent) {
      return [];
    }

    // 非追加模式：先摘除已有子树（含其勾选状态传播）
    if (!append) {
      const existed = [...parent.childIds];
      for (const cid of existed) {
        this.removeNode(cid);
      }
    }

    const added: Array<NodeId> = [];
    const list = Array.isArray(children) ? children : [];

    const insertOne = (pId: NodeId, item: YTreeNode | YTreeFlatNode): void => {
      const raw = item as Record<string, any>;
      const id = this.addNode(pId, raw as Partial<YTreeNode>, -1);
      if (id === null) {
        return;
      }
      added.push(id);
      const nested = raw["children"];
      if (Array.isArray(nested) && nested.length > 0) {
        for (const child of nested) {
          insertOne(id, child as YTreeNode);
        }
      }
    };

    for (const item of list) {
      if (item) {
        insertOne(parentId, item);
      }
    }

    // 加载完成后按实际子节点情况决定是否仍显示展开箭头：
    // 有子节点 → 普通父节点；无子节点 → 视为叶子，避免出现「点了没反应」的空箭头
    parent.isParent = parent.childIds.length > 0;
    this.normalizeLazyFlags(added, parentId);

    return added;
  }

  /**
   * 归一化本次加载节点的 isParent 标记：
   * 已有子节点 → 必为父节点；无子节点且未显式标记 → 叶子
   * @param {Array<NodeId>} ids 本次新增节点id集合
   * @param {NodeId} parentId 其父节点id（父节点由 setNodeChildren 单独处理）
   */
  private normalizeLazyFlags(ids: Array<NodeId>, parentId: NodeId): void {
    for (const id of ids) {
      if (id === parentId) {
        continue;
      }
      const node = this.flatNodesMap?.get(id);
      if (!node) {
        continue;
      }
      if (node.childIds.length > 0) {
        node.isParent = true;
      } else if (node.isParent === undefined) {
        node.isParent = false;
      }
    }
  }

  /**
   * @public
   */
  destroyed() {
    this.flatNodesMap = null;
    this.levelMap = null;
    this.nodeCheckedStateMap = null;
    this.childStateCountMap = null;
    this.leafStatsDirty = false;
    this.checkIds = null;
    this.selectedIds = null;
    this.nocheckIds = null;
    this.disabledIds = null;
    this.expandIds = null;
    this.hideIds = null;
    this.rootIds = [];
    this.maxLevel = 0;
    this.treeLeafTotal = 0;
    this.treeLeafChecked = 0;
    this.TREE_CHECKED_STATUS = false;
    this.lastCheckedSnapshot = null;
  }

  /**
   * 通过nested结构初始化
   * @param {Array<YTreeNode>} nodes
   */
  private initByNested(nodes: Array<YTreeNode>) {
    type StackItem = {
      node: YTreeNode;
      pId: NodeId;
      level: number;
      index: number;
      len: number;
      preId: NodeId;
      nextId: NodeId;
    };

    const stack: Array<StackItem> = [];
    const len = nodes.length;

    for (let index = len - 1; index >= 0; index--) {
      const node = nodes[index];
      if (!node) {
        continue;
      }

      stack.push({
        node,
        pId: this.ROOT_PARENT_ID,
        level: 0,
        index,
        len,
        preId: nodes[index - 1]?.id ?? this.ROOT_PARENT_ID,
        nextId: nodes[index + 1]?.id ?? this.ROOT_PARENT_ID,
      });
    }

    while (stack.length) {
      const current = stack.pop();
      if (
        !current ||
        !current.node ||
        this.flatNodesMap?.has(current.node.id)
      ) {
        continue;
      }

      const children = Array.isArray(current.node.children)
        ? current.node.children
        : [];
      const childLen = children.length;
      const childIds = children.map((item) => item.id);
      const flatNode = this.createFlatNode(
        current.node,
        current.pId,
        current.level,
        current.index,
        current.len,
        childIds,
        current.preId,
        current.nextId,
      );

      this.flatNodesMap?.set(flatNode.id, flatNode);
      this.registerLevelNode(flatNode.level, flatNode.id);

      if (flatNode.isRoot) {
        this.rootIds.push(flatNode.id);
      }

      for (let childIndex = childLen - 1; childIndex >= 0; childIndex--) {
        const childNode = children[childIndex];
        if (!childNode) {
          continue;
        }

        stack.push({
          node: childNode,
          pId: flatNode.id,
          level: current.level + 1,
          index: childIndex,
          len: childLen,
          preId: children[childIndex - 1]?.id ?? this.ROOT_PARENT_ID,
          nextId: children[childIndex + 1]?.id ?? this.ROOT_PARENT_ID,
        });
      }
    }
  }

  /**
   * 通过flat结构初始化
   * @param {Array<YTreeFlatNode>} nodes
   */
  private initByFlat(nodes: Array<YTreeFlatNode>) {
    type FlatStackItem = {
      node: YTreeFlatNode;
      pId: NodeId;
      level: number;
      index: number;
      len: number;
      preId: NodeId;
      nextId: NodeId;
    };

    const sourceMap = new Map<NodeId, YTreeFlatNode>();
    const sourceList: Array<YTreeFlatNode> = [];

    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      if (!node || node.id === undefined || node.id === null) {
        continue;
      }
      sourceMap.set(node.id, node);
      sourceList.push(node);
    }

    const childrenMap = new Map<NodeId, Array<YTreeFlatNode>>();
    const roots: Array<YTreeFlatNode> = [];

    for (let index = 0; index < sourceList.length; index++) {
      const node = sourceList[index];
      if (!node) {
        continue;
      }
      const pId = this.resolveFlatNodeParentId(node, sourceMap);

      if (pId === this.ROOT_PARENT_ID) {
        roots.push(node);
        continue;
      }

      const childs = childrenMap.get(pId);
      if (childs) {
        childs.push(node);
      } else {
        childrenMap.set(pId, [node]);
      }
    }

    const stack: Array<FlatStackItem> = [];

    for (let index = roots.length - 1; index >= 0; index--) {
      const rootNode = roots[index];
      stack.push({
        node: rootNode,
        pId: this.ROOT_PARENT_ID,
        level: 0,
        index,
        len: roots.length,
        preId: roots[index - 1]?.id ?? this.ROOT_PARENT_ID,
        nextId: roots[index + 1]?.id ?? this.ROOT_PARENT_ID,
      });
    }

    while (stack.length) {
      const current = stack.pop();
      if (
        !current ||
        !current.node ||
        this.flatNodesMap?.has(current.node.id)
      ) {
        continue;
      }

      const children = childrenMap.get(current.node.id) || [];
      const childLen = children.length;
      const childIds = children.map((item) => item.id);
      const flatNode = this.createFlatNode(
        current.node,
        current.pId,
        current.level,
        current.index,
        current.len,
        childIds,
        current.preId,
        current.nextId,
      );

      this.flatNodesMap?.set(flatNode.id, flatNode);
      this.registerLevelNode(flatNode.level, flatNode.id);

      if (flatNode.isRoot) {
        this.rootIds.push(flatNode.id);
      }

      for (let childIndex = childLen - 1; childIndex >= 0; childIndex--) {
        const childNode = children[childIndex];
        if (!childNode) {
          continue;
        }

        stack.push({
          node: childNode,
          pId: flatNode.id,
          level: current.level + 1,
          index: childIndex,
          len: childLen,
          preId: children[childIndex - 1]?.id ?? this.ROOT_PARENT_ID,
          nextId: children[childIndex + 1]?.id ?? this.ROOT_PARENT_ID,
        });
      }
    }

    // 兜底处理：处理不可达节点（脏数据或存在环路时，至少可以挂载到根并保留子关系）
    const orphans: Array<YTreeFlatNode> = [];
    for (let index = 0; index < sourceList.length; index++) {
      const node = sourceList[index];
      if (!this.flatNodesMap?.has(node.id)) {
        orphans.push(node);
      }
    }

    const orphanLen = orphans.length;
    for (let index = orphanLen - 1; index >= 0; index--) {
      const node = orphans[index];
      stack.push({
        node,
        pId: this.ROOT_PARENT_ID,
        level: 0,
        index,
        len: orphanLen,
        preId: orphans[index - 1]?.id ?? this.ROOT_PARENT_ID,
        nextId: orphans[index + 1]?.id ?? this.ROOT_PARENT_ID,
      });
    }

    while (stack.length) {
      const current = stack.pop();
      if (
        !current ||
        !current.node ||
        this.flatNodesMap?.has(current.node.id)
      ) {
        continue;
      }

      const children = childrenMap.get(current.node.id) || [];
      const childLen = children.length;
      const childIds = children.map((item) => item.id);
      const flatNode = this.createFlatNode(
        current.node,
        current.pId,
        current.level,
        current.index,
        current.len,
        childIds,
        current.preId,
        current.nextId,
      );

      this.flatNodesMap?.set(flatNode.id, flatNode);
      this.registerLevelNode(flatNode.level, flatNode.id);

      if (flatNode.isRoot) {
        this.rootIds.push(flatNode.id);
      }

      for (let childIndex = childLen - 1; childIndex >= 0; childIndex--) {
        const childNode = children[childIndex];
        if (!childNode) {
          continue;
        }

        stack.push({
          node: childNode,
          pId: flatNode.id,
          level: current.level + 1,
          index: childIndex,
          len: childLen,
          preId: children[childIndex - 1]?.id ?? this.ROOT_PARENT_ID,
          nextId: children[childIndex + 1]?.id ?? this.ROOT_PARENT_ID,
        });
      }
    }
  }

  /**
   * 根据节点与上下文构建内部模型
   */
  private createFlatNode(
    source: YTreeNode | YTreeFlatNode,
    pId: NodeId,
    level: number,
    index: number,
    len: number,
    childIds: Array<NodeId>,
    preId: NodeId,
    nextId: NodeId,
  ): YTreeModel {
    const _source: Record<string, any> = { ...(source as Record<string, any>) };
    delete _source["children"];

    const id = _source["id"] as NodeId;
    const nocheck = !!_source["nocheck"] || !!this.nocheckIds?.has(id);
    const disabled = !!_source["disabled"] || !!this.disabledIds?.has(id);
    const selected =
      this.selectedIds !== null
        ? this.selectedIds.has(id)
        : !!_source["selected"];
    const expanded =
      this.expandIds !== null ? this.expandIds.has(id) : !!_source["expanded"];
    const hide =
      this.hideIds !== null ? this.hideIds.has(id) : !!_source["hide"];
    const checked = nocheck
      ? true
      : this.checkIds !== null
      ? this.checkIds.has(id)
      : !!_source["checked"];

    const flatNode: YTreeModel = {
      ..._source,
      id,
      name: typeof _source["name"] === "string" ? _source["name"] : "",
      pId,
      level,
      index,
      isRoot: pId === this.ROOT_PARENT_ID,
      isFirst: index === 0,
      isLast: index === len - 1,
      preId,
      nextId,
      childIds,
      checked,
      selected,
      nocheck,
      disabled,
      hide,
      expanded,
    };

    flatNode.halfChecked = false;
    return flatNode;
  }

  /**
   * 统一处理节点勾选状态设置
   * @param {NodeId} id 节点id
   * @param {boolean} checked 目标勾选状态
   * @param {boolean} fromApi 是否来自外部api
   * @param {boolean} linkage 是否按 chkboxType 联动
   */
  private setCheckedStatus(
    id: NodeId,
    checked: boolean,
    fromApi: boolean,
    linkage: boolean,
  ): boolean {
    const targetNode = this.flatNodesMap?.get(id);
    if (!targetNode) {
      return false;
    }

    // 用户行为下，disabled/nocheck/checkboxDisabled节点不可触发勾选修改
    if (!fromApi && !this.canUpdateChecked(targetNode, fromApi)) {
      return false;
    }

    // radio 模式：勾选时先清互斥范围内的其它节点
    if (this.chkStyle === "radio" && checked) {
      this.clearRadioGroup(id, fromApi);
    }

    // radio 互斥已保证整树/同级只有一个勾选，再向下联动会破坏互斥，故 radio 不联动子孙
    const affectChildren =
      linkage &&
      this.chkStyle !== "radio" &&
      this.shouldAffectChildren(checked);
    const affectParent = linkage && this.shouldAffectParent(checked);

    let changed = false;
    if (affectChildren) {
      const subtreeIds = this.collectSubtreeNodeIds(id);
      const len = subtreeIds.length;

      for (let index = 0; index < len; index++) {
        const currentNode = this.flatNodesMap?.get(subtreeIds[index]);
        if (!currentNode || !this.canUpdateChecked(currentNode, fromApi)) {
          continue;
        }

        if (this.applyNodeChecked(currentNode, checked)) {
          changed = true;
        }
      }

      if (changed) {
        // 子树局部重建（自底向上）+ 叶子统计同步；按 chkboxType 决定是否沿祖先链传播
        this.rebuildSubtreeCheckedStatus(id, false, affectParent);
      }
    } else {
      if (!this.canUpdateChecked(targetNode, fromApi)) {
        return false;
      }
      changed = this.applyNodeChecked(targetNode, checked);
      if (changed) {
        // linkage=false（checkStrictly）：沿用旧语义——非叶子按子节点重算，并向上传播
        // linkage=true 但不联动子孙（radio / chkboxType 不含 s）：保留用户设置的 checked
        if (
          linkage &&
          !affectChildren &&
          (targetNode.childIds || []).length > 0
        ) {
          const oldState = this.getNodeCheckedState(targetNode.id);
          const newState: YTreeCheckedState = checked ? "checked" : "unchecked";
          this.applyStateToNode(targetNode, newState);
          if (affectParent && oldState !== newState) {
            this.propagateCheckedState(targetNode.id, oldState, newState);
          }
        } else {
          this.applySingleNodeChecked(
            targetNode,
            linkage ? affectParent : true,
          );
        }
      }
    }

    return changed;
  }

  /**
   * 当前操作是否影响子孙（chkboxType 的 s）
   */
  private shouldAffectChildren(checked: boolean): boolean {
    const dir = checked ? this.chkboxType.Y : this.chkboxType.N;
    return dir.indexOf("s") >= 0;
  }

  /**
   * 当前操作是否影响祖先（chkboxType 的 p）
   */
  private shouldAffectParent(checked: boolean): boolean {
    const dir = checked ? this.chkboxType.Y : this.chkboxType.N;
    return dir.indexOf("p") >= 0;
  }

  /**
   * radio 互斥：清掉范围内其它已勾选节点
   * all = 整树；level = 同级兄弟
   */
  private clearRadioGroup(keepId: NodeId, fromApi: boolean): void {
    const keep = this.flatNodesMap?.get(keepId);
    if (!keep) {
      return;
    }

    const ids: Array<NodeId> = [];
    if (this.radioType === "level") {
      const siblings = this.getSiblingList(keep);
      if (siblings) {
        for (let i = 0; i < siblings.length; i++) {
          ids.push(siblings[i]);
        }
      }
    } else if (this.flatNodesMap) {
      this.flatNodesMap.forEach((_node, id) => {
        ids.push(id);
      });
    }

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (id === keepId) {
        continue;
      }
      const node = this.flatNodesMap?.get(id);
      if (!node || !this.canUpdateChecked(node, fromApi)) {
        continue;
      }
      if (this.applyNodeChecked(node, false)) {
        this.applySingleNodeChecked(node);
      }
    }
  }

  /**
   * 记录当前勾选快照（init 后调用，供 getChangeCheckedNodes 对比）
   */
  private captureCheckedSnapshot(): void {
    const snapshot = new Set<NodeId>();
    this.flatNodesMap?.forEach((node, id) => {
      if (!node.nocheck && node.checked) {
        snapshot.add(id);
      }
    });
    this.lastCheckedSnapshot = snapshot;
  }

  /**
   * 判断当前节点是否允许被更新勾选状态
   * @param {YTreeModel} node
   * @param {boolean} fromApi
   * @returns {boolean}
   */
  private canUpdateChecked(node: YTreeModel, fromApi: boolean): boolean {
    if (node.nocheck) {
      return false;
    }
    if (fromApi) {
      return true;
    }
    return !node.disabled && !node.checkboxDisabled;
  }

  /**
   * 应用节点勾选状态
   * @param {YTreeModel} node
   * @param {boolean} checked
   */
  private applyNodeChecked(node: YTreeModel, checked: boolean): boolean {
    const nextChecked = node.nocheck ? true : checked;
    const preChecked = !!node.checked;

    if (preChecked === nextChecked) {
      return false;
    }

    node.checked = nextChecked;
    return true;
  }

  /**
   * 收集子树节点id集合
   * @param {NodeId} id
   */
  private collectSubtreeNodeIds(id: NodeId): Array<NodeId> {
    const ids: Array<NodeId> = [];
    const visited = new Set<NodeId>();
    const stack: Array<NodeId> = [id];

    while (stack.length) {
      const currentId = stack.pop();
      if (currentId === undefined || visited.has(currentId)) {
        continue;
      }
      visited.add(currentId);

      const node = this.flatNodesMap?.get(currentId);
      if (!node) {
        continue;
      }

      ids.push(currentId);
      const childIds = node.childIds || [];
      for (let index = childIds.length - 1; index >= 0; index--) {
        const childId = childIds[index];
        if (!visited.has(childId)) {
          stack.push(childId);
        }
      }
    }

    return ids;
  }

  /**
   * 获取节点的兄弟id集合（根节点返回根集合，非根返回父节点childIds）
   * @param {YTreeModel} node
   */
  private getSiblingList(node: YTreeModel): Array<NodeId> | null {
    if (node.isRoot) {
      return this.rootIds;
    }
    const parent = this.flatNodesMap?.get(node.pId);
    return parent ? parent.childIds : null;
  }

  /**
   * 判断 id 是否为 ancestorId 的子孙节点
   * @param {NodeId} id
   * @param {NodeId} ancestorId
   */
  private isDescendantOf(id: NodeId, ancestorId: NodeId): boolean {
    let current = this.flatNodesMap?.get(id);
    const visited = new Set<NodeId>();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      if (current.pId === ancestorId) {
        return true;
      }
      if (current.pId === this.ROOT_PARENT_ID) {
        break;
      }
      current = this.flatNodesMap?.get(current.pId);
    }
    return false;
  }

  /**
   * 判断目标落点是否为原地（无实际变化）
   * - prev 原地：source 已紧邻 target 之前（source.nextId === target.id）
   * - next 原地：source 已紧邻 target 之后（source.preId === target.id）
   * - inner 原地：source 已是 target 的子节点
   * @param {YTreeModel} source
   * @param {YTreeModel} target
   * @param {'inner' | 'prev' | 'next'} position
   */
  private isSamePosition(
    source: YTreeModel,
    target: YTreeModel,
    position: "inner" | "prev" | "next",
  ): boolean {
    if (position === "inner") {
      return source.pId === target.id;
    }
    if (position === "prev") {
      return source.nextId === target.id;
    }
    return source.preId === target.id;
  }

  /**
   * 从原父节点上摘除节点，并刷新原兄弟的派生字段
   * @param {YTreeModel} node
   */
  private detachNode(node: YTreeModel): void {
    const siblings = this.getSiblingList(node);
    if (!siblings) {
      return;
    }
    const index = siblings.indexOf(node.id);
    if (index < 0) {
      return;
    }
    siblings.splice(index, 1);
    this.refreshSiblingMeta(siblings, node.pId);
  }

  /**
   * 将节点挂载到目标位置（inner 追加为目标末子，prev/next 插入目标前/后）
   * @param {YTreeModel} node
   * @param {YTreeModel} target
   * @param {'inner' | 'prev' | 'next'} position
   */
  private attachNode(
    node: YTreeModel,
    target: YTreeModel,
    position: "inner" | "prev" | "next",
  ): void {
    if (position === "inner") {
      const childIds = target.childIds;
      childIds.push(node.id);
      node.pId = target.id;
      node.isRoot = false;
      this.refreshSiblingMeta(childIds, target.id);
      return;
    }

    const siblings = this.getSiblingList(target);
    if (!siblings) {
      return;
    }
    const targetIndex = siblings.indexOf(target.id);
    const insertIndex = position === "prev" ? targetIndex : targetIndex + 1;
    if (insertIndex < 0) {
      return;
    }
    siblings.splice(insertIndex, 0, node.id);
    node.pId = target.pId;
    node.isRoot = target.isRoot;
    this.refreshSiblingMeta(siblings, target.pId);
  }

  /**
   * 重建被移动子树所有节点的 level（自顶向下）
   * @param {YTreeModel} root 子树根节点
   * @param {number} newLevel 子树根节点的新层级
   */
  private rebuildSubtreeLevel(root: YTreeModel, newLevel: number): void {
    const stack: Array<{ node: YTreeModel; level: number }> = [
      { node: root, level: newLevel },
    ];
    while (stack.length) {
      const current = stack.pop();
      if (!current) {
        continue;
      }
      current.node.level = current.level;
      const childIds = current.node.childIds;
      for (let index = childIds.length - 1; index >= 0; index--) {
        const child = this.flatNodesMap?.get(childIds[index]);
        if (child) {
          stack.push({ node: child, level: current.level + 1 });
        }
      }
    }
  }

  /**
   * 重建 levelMap 与 maxLevel（移动后节点层级可能整体变化）
   */
  private rebuildLevelMap(): void {
    if (!this.flatNodesMap) {
      return;
    }
    this.levelMap = new Map();
    this.maxLevel = 0;
    this.flatNodesMap.forEach((node) => {
      this.registerLevelNode(node.level, node.id);
    });
  }

  /**
   * 刷新兄弟节点的派生字段（index/isFirst/isLast/preId/nextId）
   * @param {Array<NodeId>} ids 兄弟id集合（已按新顺序排列）
   * @param {NodeId} parentId 父节点id（根节点为 ROOT_PARENT_ID）
   */
  private refreshSiblingMeta(ids: Array<NodeId>, parentId: NodeId): void {
    const len = ids.length;
    for (let index = 0; index < len; index++) {
      const node = this.flatNodesMap?.get(ids[index]);
      if (!node) {
        continue;
      }
      node.pId = parentId;
      node.isRoot = parentId === this.ROOT_PARENT_ID;
      node.index = index;
      node.isFirst = index === 0;
      node.isLast = index === len - 1;
      node.preId = ids[index - 1] ?? this.ROOT_PARENT_ID;
      node.nextId = ids[index + 1] ?? this.ROOT_PARENT_ID;
    }
  }

  /**
   * 判断节点是否为叶子（无有效子节点）
   * @param {YTreeModel} node
   */
  private isLeafNode(node: YTreeModel): boolean {
    const childIds = node.childIds || [];
    for (let index = 0; index < childIds.length; index++) {
      if (this.flatNodesMap?.has(childIds[index])) {
        return false;
      }
    }
    return true;
  }

  /**
   * 扫描直接子节点状态，计算状态计数（增量更新用）
   * @param {YTreeModel} node
   */
  private computeChildStateCount(node: YTreeModel): ChildStateCount {
    const counts: ChildStateCount = { checked: 0, unchecked: 0 };
    const childIds = node.childIds || [];
    for (let index = 0; index < childIds.length; index++) {
      const childId = childIds[index];
      if (!this.flatNodesMap?.has(childId)) {
        continue;
      }
      const childState = this.getNodeCheckedState(childId);
      if (childState === "checked" || childState === "indeterminate") {
        counts.checked++;
      }
      if (childState === "unchecked" || childState === "indeterminate") {
        counts.unchecked++;
      }
    }
    return counts;
  }

  /**
   * 根据直接子节点状态计数解析节点状态
   * 计数为空（无有效子节点）时按叶子逻辑处理（nocheck 视为勾选）
   * @param {YTreeModel} node
   * @param {ChildStateCount | undefined} counts
   */
  private resolveStateByCounts(
    node: YTreeModel,
    counts: ChildStateCount | undefined,
  ): YTreeCheckedState {
    if (!counts || (counts.checked === 0 && counts.unchecked === 0)) {
      return this.getResolvedLeafChecked(node) ? "checked" : "unchecked";
    }
    if (counts.unchecked === 0) {
      return "checked";
    }
    if (counts.checked === 0) {
      return "unchecked";
    }
    return "indeterminate";
  }

  /**
   * 应用节点状态（写 checked/halfChecked/状态缓存，并按需同步 checkIds）
   * @param {YTreeModel} node
   * @param {YTreeCheckedState} state
   * @param {Map<NodeId, YTreeCheckedState> | null} stateMap 指定状态缓存（全量重建时传入局部map）
   * @param {boolean} syncCheckIds 是否同步维护 checkIds（全量重建由调用方整体覆盖，传 false）
   */
  private applyStateToNode(
    node: YTreeModel,
    state: YTreeCheckedState,
    stateMap: Map<NodeId, YTreeCheckedState> | null = null,
    syncCheckIds: boolean = true,
  ): void {
    const map = stateMap || this.nodeCheckedStateMap;
    if (!map) {
      return;
    }

    const preChecked = map.get(node.id) === "checked";
    if (state === "checked") {
      node.checked = true;
      node.halfChecked = false;
    } else if (state === "unchecked") {
      node.checked = false;
      node.halfChecked = false;
    } else {
      node.checked = false;
      node.halfChecked = true;
    }
    map.set(node.id, state);

    if (syncCheckIds && this.checkIds && preChecked !== !!node.checked) {
      if (node.checked) {
        this.checkIds.add(node.id);
      } else {
        this.checkIds.delete(node.id);
      }
    }
  }

  /**
   * 状态计数增减（"" 空状态无贡献，用于新增/删除节点的计数变化）
   * @param {ChildStateCount} counts
   * @param {CheckedStateLike} state
   * @param {number} delta
   */
  private adjustStateCount(
    counts: ChildStateCount,
    state: CheckedStateLike,
    delta: number,
  ): void {
    if (state === "checked" || state === "indeterminate") {
      counts.checked += delta;
    }
    if (state === "unchecked" || state === "indeterminate") {
      counts.unchecked += delta;
    }
  }

  /**
   * 增量更新核心：节点状态变化后沿祖先链向上传播
   * 父节点状态仅依赖直接子节点，逐级更新父节点计数并重算状态，状态不变的祖先链提前终止
   * @param {NodeId} id 状态发生变化的节点id
   * @param {CheckedStateLike} oldState 变化前状态（"" 表示此前不存在）
   * @param {CheckedStateLike} newState 变化后状态（"" 表示被删除）
   */
  private propagateCheckedState(
    id: NodeId,
    oldState: CheckedStateLike,
    newState: CheckedStateLike,
  ): void {
    if (
      oldState === newState ||
      !this.flatNodesMap ||
      !this.nodeCheckedStateMap ||
      !this.childStateCountMap
    ) {
      return;
    }

    let curId = id;
    let curOldState = oldState;
    let curNewState = newState;

    while (curId !== this.ROOT_PARENT_ID) {
      const node = this.flatNodesMap.get(curId);
      if (!node || node.isRoot) {
        break;
      }
      const parent = this.flatNodesMap.get(node.pId);
      if (!parent) {
        break;
      }

      // 更新父节点计数：子节点状态 curOldState → curNewState
      let counts = this.childStateCountMap.get(parent.id);
      if (!counts) {
        counts = { checked: 0, unchecked: 0 };
        this.childStateCountMap.set(parent.id, counts);
      }
      this.adjustStateCount(counts, curOldState, -1);
      this.adjustStateCount(counts, curNewState, 1);

      // 重算父节点状态
      const parentOldState =
        this.nodeCheckedStateMap.get(parent.id) || "unchecked";
      const parentNewState = this.resolveStateByCounts(parent, counts);
      this.applyStateToNode(parent, parentNewState);

      if (parentNewState === parentOldState) {
        break;
      }

      curId = parent.id;
      curOldState = parentOldState;
      curNewState = parentNewState;
    }
  }

  /**
   * 单节点状态解析（增量路径：非 linkage 修改后调用）
   * 叶子按 resolved 状态，非叶子按直接子节点计数（用户设置的 checked 会被子节点状态覆盖）
   * @param {YTreeModel} node
   */
  private resolveNodeState(node: YTreeModel): YTreeCheckedState {
    if ((node.childIds || []).length === 0) {
      return this.getResolvedLeafChecked(node) ? "checked" : "unchecked";
    }
    return this.resolveStateByCounts(
      node,
      this.childStateCountMap?.get(node.id),
    );
  }

  /**
   * 单节点增量更新（非 linkage 勾选）
   * 重算节点最终状态、同步叶子统计；按需沿祖先链传播
   * @param {YTreeModel} node 已由 applyNodeChecked 修改 checked 的节点
   * @param {boolean} propagate 是否沿祖先链传播（chkboxType 含 p 时为 true）
   */
  private applySingleNodeChecked(
    node: YTreeModel,
    propagate: boolean = true,
  ): void {
    const oldState = this.getNodeCheckedState(node.id);
    const newState = this.resolveNodeState(node);

    // 始终写回最终状态（覆盖 applyNodeChecked 对非叶子节点的无效设置）
    this.applyStateToNode(node, newState);

    if (newState === oldState) {
      return;
    }

    if (propagate) {
      this.propagateCheckedState(node.id, oldState, newState);
    }

    // 叶子节点统计同步（叶子状态仅 checked/unchecked 两态）
    if (this.isLeafNode(node)) {
      this.treeLeafChecked += node.checked ? 1 : -1;
      this.syncTreeCheckedStatus();
    }
  }

  /**
   * 子树局部重建（自底向上）+ 叶子统计同步 + 沿祖先链向上传播
   * 用于联动勾选（linkage）与复制新子树（isNewSubtree=true）
   * @param {NodeId} rootId 子树根节点id
   * @param {boolean} isNewSubtree 是否为全新子树（新增叶子计入 treeLeafTotal）
   * @param {boolean} propagate 是否沿祖先链向上传播（chkboxType 含 p 时为 true）
   */
  private rebuildSubtreeCheckedStatus(
    rootId: NodeId,
    isNewSubtree: boolean = false,
    propagate: boolean = true,
  ): void {
    if (
      !this.flatNodesMap ||
      !this.nodeCheckedStateMap ||
      !this.childStateCountMap
    ) {
      return;
    }
    const root = this.flatNodesMap.get(rootId);
    if (!root) {
      return;
    }

    const rootOldState = this.nodeCheckedStateMap.get(rootId) || "";

    // 收集子树节点并按 level 分组（自底向上局部重建）
    const subtreeIds = this.collectSubtreeNodeIds(rootId);
    const levelIds = new Map<number, Array<NodeId>>();
    let maxLevel = root.level;
    for (let index = 0; index < subtreeIds.length; index++) {
      const subNode = this.flatNodesMap.get(subtreeIds[index]);
      if (!subNode) {
        continue;
      }
      const ids = levelIds.get(subNode.level);
      if (ids) {
        ids.push(subNode.id);
      } else {
        levelIds.set(subNode.level, [subNode.id]);
      }
      if (subNode.level > maxLevel) {
        maxLevel = subNode.level;
      }
    }

    for (let level = maxLevel; level >= root.level; level--) {
      const ids = levelIds.get(level);
      if (!ids) {
        continue;
      }
      for (let index = 0; index < ids.length; index++) {
        const subNode = this.flatNodesMap.get(ids[index]);
        if (!subNode) {
          continue;
        }

        const counts = this.computeChildStateCount(subNode);
        const isLeaf = counts.checked + counts.unchecked === 0;

        if (isLeaf) {
          const preChecked = isNewSubtree
            ? false
            : this.nodeCheckedStateMap.get(subNode.id) === "checked";
          const state = this.getResolvedLeafChecked(subNode)
            ? "checked"
            : "unchecked";
          this.applyStateToNode(subNode, state);
          // 联动勾选：增量维护勾选叶子数（结构变更后由惰性重算兜底）
          if (!isNewSubtree) {
            this.treeLeafChecked +=
              (subNode.checked ? 1 : 0) - (preChecked ? 1 : 0);
          }
        } else {
          this.childStateCountMap.set(subNode.id, counts);
          this.applyStateToNode(
            subNode,
            this.resolveStateByCounts(subNode, counts),
          );
        }
      }
    }
    if (!isNewSubtree) {
      this.syncTreeCheckedStatus();
    }

    // 子树根状态变化 → 按需沿祖先链向上传播
    if (propagate) {
      const rootNewState = this.nodeCheckedStateMap.get(rootId) || "unchecked";
      this.propagateCheckedState(rootId, rootOldState, rootNewState);
    }
  }

  /**
   * 同步整树勾选汇总状态（基于叶子统计，O(1)）
   */
  private syncTreeCheckedStatus(): void {
    this.TREE_CHECKED_STATUS =
      this.treeLeafTotal > 0 && this.treeLeafTotal === this.treeLeafChecked;
  }

  /**
   * 结构变更后的叶子汇总惰性重算（O(N)，仅 dirty 时执行一次）
   */
  private ensureLeafStats(): void {
    if (!this.leafStatsDirty || !this.flatNodesMap) {
      return;
    }
    this.leafStatsDirty = false;
    let total = 0;
    let checked = 0;
    this.flatNodesMap.forEach((node) => {
      if (this.isLeafNode(node)) {
        total++;
        if (this.getResolvedLeafChecked(node)) {
          checked++;
        }
      }
    });
    this.treeLeafTotal = total;
    this.treeLeafChecked = checked;
    this.TREE_CHECKED_STATUS = total > 0 && total === checked;
  }

  /**
   * 重建整树勾选状态（自底向上，O(N+E)，仅初始化/手动刷新时全量执行）
   * 1. 叶子节点根据nocheck/checked得到真实状态
   * 2. 非叶子节点根据直接子节点状态反算
   * 3. 同步整树汇总状态（根节点状态可O(1)读取）
   * 4. 同步填充直接子节点状态计数（增量更新前置数据）
   */
  private rebuildCheckedStatus() {
    if (!this.flatNodesMap || !this.levelMap) {
      return;
    }

    const checkedIds = new Set<NodeId>();
    const nodeStateMap = new Map<NodeId, YTreeCheckedState>();
    const childStateCountMap = new Map<NodeId, ChildStateCount>();
    let treeLeafTotal = 0;
    let treeLeafChecked = 0;

    for (let level = this.maxLevel; level >= 0; level--) {
      const ids = this.levelMap.get(level);
      if (!ids || ids.length === 0) {
        continue;
      }

      for (let index = 0; index < ids.length; index++) {
        const id = ids[index];
        const node = this.flatNodesMap.get(id);
        if (!node) {
          continue;
        }

        const childIds = node.childIds || [];
        let childCount = 0;
        const counts: ChildStateCount = { checked: 0, unchecked: 0 };

        // 完整统计直接子节点状态计数（不短路，保证计数完整供增量更新使用）
        for (let childIndex = 0; childIndex < childIds.length; childIndex++) {
          const childId = childIds[childIndex];
          if (!this.flatNodesMap.has(childId)) {
            continue;
          }
          childCount++;
          const childState = nodeStateMap.get(childId) || "unchecked";
          if (childState === "checked" || childState === "indeterminate") {
            counts.checked++;
          }
          if (childState === "unchecked" || childState === "indeterminate") {
            counts.unchecked++;
          }
        }

        // 非叶子节点缓存直接子节点状态计数（增量更新用）
        if (childCount > 0) {
          childStateCountMap.set(id, counts);
        }

        let state: YTreeCheckedState;
        if (childCount === 0) {
          state = this.getResolvedLeafChecked(node) ? "checked" : "unchecked";
          treeLeafTotal++;
          if (state === "checked") {
            treeLeafChecked++;
          }
        } else if (counts.unchecked === 0) {
          state = "checked";
        } else if (counts.checked === 0) {
          state = "unchecked";
        } else {
          state = "indeterminate";
        }

        this.applyStateToNode(node, state, nodeStateMap, false);

        if (node.checked) {
          checkedIds.add(id);
        }
      }
    }

    this.checkIds = checkedIds;
    this.nodeCheckedStateMap = nodeStateMap;
    this.childStateCountMap = childStateCountMap;
    this.treeLeafTotal = treeLeafTotal;
    this.treeLeafChecked = treeLeafChecked;
    this.TREE_CHECKED_STATUS =
      treeLeafTotal > 0 && treeLeafTotal === treeLeafChecked;
    this.leafStatsDirty = false;
  }

  /**
   * 叶子节点最终勾选状态
   * 说明：
   * 1. nocheck节点在勾选统计上视为勾选状态
   * 2. disabled节点按自身checked状态参与统计，用户不可改但api可改
   */
  private getResolvedLeafChecked(node: YTreeModel): boolean {
    if (node.nocheck) {
      return true;
    }
    return !!node.checked;
  }

  /**
   * 判断当前输入数据是否为nested结构
   * @param {Array<YTreeNode | YTreeFlatNode>} nodes
   */
  private isNestedMode(nodes: Array<YTreeNode | YTreeFlatNode>): boolean {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index] as YTreeNode;
      if (node && Array.isArray(node.children)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 扁平结构下解析父节点id
   * @param {YTreeFlatNode} node
   * @param {Map<NodeId, YTreeFlatNode>} sourceMap
   */
  private resolveFlatNodeParentId(
    node: YTreeFlatNode,
    sourceMap: Map<NodeId, YTreeFlatNode>,
  ): NodeId {
    const pId = node.pId;
    if (pId === undefined || pId === null || pId === this.ROOT_PARENT_ID) {
      return this.ROOT_PARENT_ID;
    }
    if (pId === node.id) {
      return this.ROOT_PARENT_ID;
    }
    if (!sourceMap.has(pId)) {
      return this.ROOT_PARENT_ID;
    }
    return pId;
  }

  /**
   * 注册节点level信息
   * @param {number} level
   * @param {NodeId} id
   */
  private registerLevelNode(level: number, id: NodeId) {
    if (!this.levelMap) {
      return;
    }

    const ids = this.levelMap.get(level);
    if (ids) {
      ids.push(id);
    } else {
      this.levelMap.set(level, [id]);
    }

    if (level > this.maxLevel) {
      this.maxLevel = level;
    }
  }

  /**
   * 根据数量解析勾选状态
   * @param {number} checked
   * @param {number} total
   */
  private resolveCheckedState(
    checked: number,
    total: number,
  ): YTreeCheckedState {
    if (total <= 0 || checked <= 0) {
      return "unchecked";
    }
    if (checked >= total) {
      return "checked";
    }
    return "indeterminate";
  }
}
