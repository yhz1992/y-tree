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
    const hide = this.hideIds !== null ? this.hideIds.has(id) : !!_source["hide"];
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
