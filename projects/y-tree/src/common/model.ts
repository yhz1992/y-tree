/**
 * 节点id类型
 */
export type NodeId = string | number;

/**
 * 节点勾选状态
 */
export type YTreeCheckedState = "unchecked" | "indeterminate" | "checked";

/**
 * 整树勾选汇总
 */
export interface YTreeCheckedSummary {
  rootIds: Array<NodeId>;
  totalLeaf: number;
  checkedLeaf: number;
  checked: boolean;
  indeterminate: boolean;
  state: YTreeCheckedState;
}

/**
 * 树节点嵌套数据
 * @extends {YTreeBaseNode}
 */
export interface YTreeNode extends YTreeBaseNode {
  /**
   * 子节点集合
   */
  children: Array<YTreeNode>;
}

/**
 * 树节点扁平化数据
 * @extends {YTreeBaseNode}
 */
export interface YTreeFlatNode extends YTreeBaseNode {
  /**
   * 父节点id
   * @type {string | number}
   */
  pId: string | number;
}

/**
 * 内部使用模型
 * @extends {YTreeFlatNode}
 */
export interface YTreeModel extends YTreeFlatNode {
  /**
   * 是否为根节点
   * @type {boolean}
   */
  isRoot: boolean;
  /**
   * 是否为当前父级下第一个节点
   * @type {boolean}
   */
  isFirst: boolean;
  /**
   * 是否为当前父级下最后一个节点
   * @type {boolean}
   */
  isLast: boolean;
  /**
   * 子节点id集合
   * @type {Array<string | number>}
   */
  childIds: Array<string | number>;
  /**
   * 上一个节点id
   * @type {string | number}
   */
  preId: string | number;
  /**
   * 下一个节点id
   * @type {string | number}
   */
  nextId: string | number;
  /**
   * 当前节点在父级下的位置下标
   * @type {number}
   */
  index: number;
  /**
   * 节点层级
   * @type {number}
   */
  level: number;
  /**
   * 节点是否半选状态（仅勾选框模式下使用）
   * @type {boolean}
   */
  halfChecked?: boolean;
}

/**
 * 节点通用数据模型
 */
interface YTreeBaseNode {
  /**
   * 节点id
   * @type {string | number}
   */
  id: string | number;
  /**
   * 节点名称
   * @type {string}
   */
  name: string;
  /**
   * 节点文本区域选中状态
   * @type {boolean}
   */
  selected?: boolean;
  /**
   * 节点文本区域禁用状态，不会触发点击事件
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * 节点勾选框状态
   * @type {boolean}
   */
  checked?: boolean;
  /**
   * 节点勾选框禁用状态
   * @type {boolean}
   */
  checkboxDisabled?: boolean;
  /**
   * 当前节点是否显示勾选框，仅在组件开启勾选框开启模式下生效
   * @type {boolean}
   */
  nocheck?: boolean;
  /**
   * 当前节点是否展开
   * @type {boolean}
   */
  expanded?: boolean;
  /**
   * 当前节点的隐藏状态
   * @type {boolean}
   */
  hide?: boolean;
  [key: string]: any;
}

export interface YTreeNodeEvent {
  /**
   * 原生事件对象
   * @type {MouseEvent}
   */
  event: MouseEvent;
  /**
   * 节点id
   * @type {string | number}
   */
  id: string | number;
  [key: string]: any;
}

export interface DataSource<M extends Array<YTreeNode | YTreeFlatNode>> {
  /**
   * 数据源建立连接
   * @returns
   */
  connect: () => () => void;
  /**
   * 数据源断开链接
   * @returns
   */
  disConnect: () => void;
}
