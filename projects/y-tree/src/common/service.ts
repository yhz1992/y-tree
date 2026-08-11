import type {
  NodeId,
  YTreeCheckedState,
  YTreeCheckedSummary,
  YTreeFlatNode,
  YTreeModel,
  YTreeNode,
} from "./model";

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
   * 初始化数据，ps：二次初始化构建数据模型，内部数据计算状态将被重置
   * @param { Array<YTreeNode | YTreeFlatNode> } nodes 外部数据源
   * @returns {void} -
   */
  public init(nodes: Array<YTreeNode | YTreeFlatNode> | null): void {
    this.flatNodesMap = new Map();
    this.levelMap = new Map();
    this.nodeCheckedStateMap = new Map();
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
    nodes = null;
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

    this.detachNode(source);
    this.attachNode(source, target, position);
    this.rebuildSubtreeLevel(source, newLevel);
    this.rebuildLevelMap();
    this.rebuildCheckedStatus();

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
    this.rebuildCheckedStatus();

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

    // 从父级兄弟链上摘除（根节点从 rootIds 摘除）
    const siblings = this.getSiblingList(node);
    if (siblings) {
      const index = siblings.indexOf(id);
      if (index >= 0) {
        siblings.splice(index, 1);
        this.refreshSiblingMeta(siblings, node.pId);
      }
    }

    // 移除内部数据结构
    for (const rid of removedIds) {
      this.flatNodesMap.delete(rid);
      this.nodeCheckedStateMap?.delete(rid);
    }
    this.rebuildLevelMap();
    this.rebuildCheckedStatus();

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
    this.rebuildCheckedStatus();

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

  /**
   * @public
   */
  destroyed() {
    this.flatNodesMap = null;
    this.levelMap = null;
    this.nodeCheckedStateMap = null;
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
   * @param {boolean} linkage 是否联动子节点
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

    let changed = false;
    if (!linkage) {
      if (!this.canUpdateChecked(targetNode, fromApi)) {
        return false;
      }
      changed = this.applyNodeChecked(targetNode, checked);
    } else {
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
    }

    if (changed) {
      this.rebuildCheckedStatus();
    }

    return changed;
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
   * 重建整树勾选状态（自底向上）
   * 1. 叶子节点根据nocheck/checked得到真实状态
   * 2. 非叶子节点根据直接子节点状态反算
   * 3. 同步整树汇总状态（根节点状态可O(1)读取）
   */
  private rebuildCheckedStatus() {
    if (!this.flatNodesMap || !this.levelMap) {
      return;
    }

    const checkedIds = new Set<NodeId>();
    const nodeStateMap = new Map<NodeId, YTreeCheckedState>();
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
        let hasChecked = false;
        let hasUnchecked = false;
        let childCount = 0;

        for (let childIndex = 0; childIndex < childIds.length; childIndex++) {
          const childId = childIds[childIndex];
          if (!this.flatNodesMap.has(childId)) {
            continue;
          }
          childCount++;
          const childState = nodeStateMap.get(childId) || "unchecked";
          if (childState === "checked") {
            hasChecked = true;
          } else if (childState === "indeterminate") {
            hasChecked = true;
            hasUnchecked = true;
          } else {
            hasUnchecked = true;
          }
          if (hasChecked && hasUnchecked) {
            break;
          }
        }

        if (childCount === 0) {
          const checked = this.getResolvedLeafChecked(node);
          node.checked = checked;
          node.halfChecked = false;
          nodeStateMap.set(id, checked ? "checked" : "unchecked");
          treeLeafTotal++;
          if (checked) {
            treeLeafChecked++;
          }
        } else if (hasChecked && !hasUnchecked) {
          node.checked = true;
          node.halfChecked = false;
          nodeStateMap.set(id, "checked");
        } else if (!hasChecked && hasUnchecked) {
          node.checked = false;
          node.halfChecked = false;
          nodeStateMap.set(id, "unchecked");
        } else {
          node.checked = false;
          node.halfChecked = true;
          nodeStateMap.set(id, "indeterminate");
        }

        if (node.checked) {
          checkedIds.add(id);
        }
      }
    }

    this.checkIds = checkedIds;
    this.nodeCheckedStateMap = nodeStateMap;
    this.treeLeafTotal = treeLeafTotal;
    this.treeLeafChecked = treeLeafChecked;
    this.TREE_CHECKED_STATUS =
      treeLeafTotal > 0 && treeLeafTotal === treeLeafChecked;
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
