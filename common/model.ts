/**
 * 节点id类型
 */
export type NodeId = string | number;

/**
 * 节点勾选状态
 */
export type YTreeCheckedState = "unchecked" | "indeterminate" | "checked";

/**
 * 勾选控件样式：复选框 / 单选框
 */
export type YTreeChkStyle = "checkbox" | "radio";

/**
 * radio 互斥范围
 * all = 整树只能勾选一个；level = 同一父节点下的兄弟互斥
 */
export type YTreeRadioType = "all" | "level";

/**
 * 父子联动方向
 * Y = 勾选时影响的方向；N = 取消勾选时影响的方向
 * 字符含 "p" 表示影响祖先，含 "s" 表示影响子孙；空字符串表示不联动
 * 默认 { Y: "ps", N: "ps" } 即双向联动
 */
export interface YTreeChkboxType {
  Y?: string;
  N?: string;
}

/**
 * 展开动画速度
 * 数字 = 毫秒；fast=200；slow=400；false / "" / 0 = 关闭动画
 */
export type YTreeExpandSpeed = number | false | "" | "fast" | "slow";

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
  /**
   * 子节点是否正在异步加载中（懒加载模式下渲染 loading 图标）
   * @type {boolean}
   */
  isAjaxing?: boolean;
}

/**
 * 节点标题字体样式
 * 对象则整树共用；函数则按节点返回（返回空表示不覆盖）
 */
export type YTreeFontCss =
  | Record<string, string>
  | ((node: YTreeModel) => Record<string, string> | null | undefined);

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
  /**
   * 懒加载模式：标记该节点为父节点（子节点尚未加载，展开时触发 loadData）
   * @type {boolean}
   */
  isParent?: boolean;
  /**
   * 自定义节点图标（CSS class 或图片 URL）
   */
  icon?: string;
  /**
   * 父节点展开时的图标
   */
  iconOpen?: string;
  /**
   * 父节点折叠时的图标
   */
  iconClose?: string;
  /**
   * 图标皮肤名，渲染为 `y-tree-icon-skin-${iconSkin}`
   */
  iconSkin?: string;
  /**
   * 鼠标悬停提示，缺省回退为 name
   */
  title?: string;
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

/**
 * 节点重命名事件
 * @extends {YTreeNodeEvent}
 */
export interface YTreeRenameEvent extends YTreeNodeEvent {
  /**
   * 原名称
   */
  oldName: string;
  /**
   * 新名称
   */
  newName: string;
}

/**
 * 节点删除事件
 * @extends {YTreeNodeEvent}
 */
export interface YTreeRemoveEvent extends YTreeNodeEvent {}

/**
 * 节点新增事件
 * @extends {YTreeNodeEvent}
 */
export interface YTreeAddEvent extends YTreeNodeEvent {
  /**
   * 父节点id
   */
  parentId: string | number;
}

/**
 * 拖拽事件（dragstart 时触发）
 * @extends {YTreeNodeEvent}
 */
export interface YTreeDragEvent extends YTreeNodeEvent {
  /** 被拖拽节点id */
  sourceId: string | number;
  /** 是否复制模式（Ctrl 按下 + isCopy 开启） */
  isCopy: boolean;
}

/**
 * 拖拽移动事件（dragover 时持续触发）
 * @extends {YTreeNodeEvent}
 */
export interface YTreeDragMoveEvent extends YTreeNodeEvent {
  /** 被拖拽节点id */
  sourceId: string | number;
  /** 目标节点id */
  targetId: string | number;
  /** 当前落点 */
  position: "inner" | "prev" | "next";
  /** 是否复制模式 */
  isCopy: boolean;
}

/**
 * 拖拽放置事件（drop 时触发）
 * @extends {YTreeNodeEvent}
 */
export interface YTreeDropEvent extends YTreeNodeEvent {
  /** 被拖拽节点id */
  sourceId: string | number;
  /** 目标节点id */
  targetId: string | number;
  /** 落点 */
  position: "inner" | "prev" | "next";
  /** 是否复制模式 */
  isCopy: boolean;
  /** 移动类型：move=移动，copy=复制 */
  moveType: "move" | "copy";
}

/**
 * 节点移动（拖拽）事件
 * @extends {YTreeNodeEvent}
 */
export interface YTreeNodeChangeEvent extends YTreeNodeEvent {
  /**
   * 被移动节点id
   * @type {string | number}
   */
  sourceId: string | number;
  /**
   * 目标节点id
   * @type {string | number}
   */
  targetId: string | number;
  /**
   * 落点：inner=成为目标子节点，prev=插入目标之前，next=插入目标之后
   */
  position: "inner" | "prev" | "next";
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

/**
 * 异步加载触发来源：
 * user=用户展开节点触发；api=程序化调用 reAsyncChildNodes
 */
export type YTreeAsyncFrom = "user" | "api";

/**
 * 异步加载事件基类（懒加载 P3）
 */
export interface YTreeAsyncEvent {
  /**
   * 触发加载的节点id（根节点异步时为其虚拟根 id）
   * @type {string | number}
   */
  id: string | number;
  /**
   * 节点名称
   * @type {string}
   */
  name: string;
  /**
   * 触发来源
   * @type {YTreeAsyncFrom}
   */
  from: YTreeAsyncFrom;
  /**
   * 节点内部模型（根节点异步时为虚拟根模型）
   * @type {YTreeModel}
   */
  node: YTreeModel;
}

/**
 * 异步加载成功事件
 * @extends {YTreeAsyncEvent}
 */
export interface YTreeAsyncSuccessEvent extends YTreeAsyncEvent {
  /**
   * 本次加载得到的子节点数据
   */
  children: Array<YTreeNode | YTreeFlatNode>;
}

/**
 * 异步加载失败事件
 * @extends {YTreeAsyncEvent}
 */
export interface YTreeAsyncErrorEvent extends YTreeAsyncEvent {
  /**
   * 加载失败的错误对象
   */
  error: any;
}
