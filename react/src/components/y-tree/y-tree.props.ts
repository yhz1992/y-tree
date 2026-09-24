import type { ReactNode } from "react";
import type {
  YTreeFlatNode,
  YTreeModel,
  YTreeNode,
  YTreeAddEvent,
  YTreeNodeChangeEvent,
  YTreeNodeEvent,
  YTreeRemoveEvent,
  YTreeRenameEvent,
  YTreeDragEvent,
  YTreeDragMoveEvent,
  YTreeDropEvent,
  YTreeAsyncEvent,
  YTreeAsyncSuccessEvent,
  YTreeAsyncErrorEvent,
  YTreeChkStyle,
  YTreeRadioType,
  YTreeChkboxType,
  YTreeExpandSpeed,
  YTreeFontCss,
} from "../../../../common/model";

export type YTreeSize = "small" | "default" | "large";

export type YTreeDropPosition = "inner" | "prev" | "next";

export type {
  YTreeNodeChangeEvent,
  YTreeAddEvent,
  YTreeRemoveEvent,
  YTreeRenameEvent,
  YTreeDragEvent,
  YTreeDragMoveEvent,
  YTreeDropEvent,
  YTreeAsyncEvent,
  YTreeAsyncSuccessEvent,
  YTreeAsyncErrorEvent,
  YTreeChkStyle,
  YTreeRadioType,
  YTreeChkboxType,
  YTreeExpandSpeed,
  YTreeFontCss,
};

export interface YTreeExpandChangeEvent extends YTreeNodeEvent {
  expand: boolean;
}

export interface YTreeCheckedChangeEvent extends YTreeNodeEvent {
  checked: boolean;
}

export interface YTreeProps {
  /** 树组件数据源 */
  datasource?: Array<YTreeNode | YTreeFlatNode>;
  /** 是否展示勾选框 */
  checkable?: boolean;
  /** 是否显示连线 */
  showLine?: boolean;
  /** 是否默认展开全部节点 */
  expandAll?: boolean;
  /** checkable 状态下节点选择完全受控（父子节点选中状态不再关联） */
  checkStrictly?: boolean;
  /** 勾选控件样式：checkbox（默认）/ radio */
  chkStyle?: YTreeChkStyle;
  /** radio 互斥范围：all=整树（默认）/ level=同级兄弟 */
  radioType?: YTreeRadioType;
  /** 父子联动方向。Y=勾选时，N=取消勾选时；含 p 影响祖先、含 s 影响子孙。默认 { Y: "ps", N: "ps" } */
  chkboxType?: YTreeChkboxType;
  /** 节点是否可拖拽 */
  draggable?: boolean;
  /** Ctrl+拖拽时复制而非移动 */
  isCopy?: boolean;
  /** 允许拖拽节点判定，返回 false 阻止拖拽（优先级高于 disabled） */
  allowDrag?: (node: YTreeModel) => boolean;
  /** 允许落点判定，返回 false 阻止落点 */
  allowDrop?: (
    sourceId: string | number,
    targetId: string | number,
    position: YTreeDropPosition,
  ) => boolean;
  /** 拖拽生效最小移动距离（px），默认 5 */
  minMoveSize?: number;
  /** 懒加载模式：子节点在首次展开时通过 loadData 异步获取 */
  lazy?: boolean;
  /** 异步加载子节点数据（lazy 开启时生效） */
  loadData?: (
    node: YTreeModel,
  ) =>
    | Promise<Array<YTreeNode | YTreeFlatNode>>
    | Array<YTreeNode | YTreeFlatNode>;
  /** 是否启用编辑能力（重命名/删除/新增按钮） */
  editable?: boolean;
  /** 是否显示重命名按钮 */
  showRenameBtn?: boolean;
  /** 是否显示删除按钮 */
  showRemoveBtn?: boolean;
  /** 是否显示新增按钮 */
  showAddBtn?: boolean;
  /** 删除前是否弹气泡确认 */
  removeConfirm?: boolean;
  /** 展开的节点id集合 */
  expandIds?: Array<string | number>;
  /** 勾选节点的id集合 */
  checkedIds?: Array<string | number>;
  /** 选中节点的id集合（文本区域） */
  selectedIds?: Array<string | number>;
  /** 在 checkable 状态下不显示勾选框的节点id集合 */
  nocheckIds?: Array<string | number>;
  /** 搜索的关键字 */
  searchValue?: string;
  /** 组件的大小模式 */
  size?: YTreeSize;
  /** 挂载到最外层容器上的样式类 */
  className?: string;
  /** 滚动容器高度（px），虚拟滚动依赖固定高度容器 */
  height?: number;
  /** 是否显示节点图标，默认 true */
  showIcon?: boolean;
  /** 是否显示悬停 title，默认 true */
  showTitle?: boolean;
  /** 自定义 title，返回空字符串则不显示 */
  title?: (node: YTreeModel) => string;
  /** 节点标题字体样式 */
  fontCss?: YTreeFontCss;
  /** 双击标题是否展开/折叠，默认 true；开启编辑时双击优先进入重命名 */
  dblClickExpand?: boolean;
  /** 展开动画速度，默认关闭；fast=200ms，slow=400ms */
  expandSpeed?: YTreeExpandSpeed;
  /** 是否允许多选文本选中，默认 true；false 时 Ctrl 也不追加 */
  selectedMulti?: boolean;
  /** 点击前置拦截，返回 false 取消选中与 onClick */
  beforeClick?: (payload: YTreeNodeEvent) => boolean;
  /** 展开前置拦截，返回 false 取消 */
  beforeExpand?: (payload: YTreeExpandChangeEvent) => boolean;
  /** 折叠前置拦截，返回 false 取消 */
  beforeCollapse?: (payload: YTreeExpandChangeEvent) => boolean;
  /** 勾选前置拦截，返回 false 取消；程序化 checkNode 不走 */
  beforeCheck?: (payload: YTreeCheckedChangeEvent) => boolean;

  /** 文本节点点击事件 */
  onClick?: (payload: YTreeNodeEvent) => void;
  /** 文本节点双击事件 */
  onDbClick?: (payload: YTreeNodeEvent) => void;
  /** 文本节点右键点击事件 */
  onContextMenu?: (payload: YTreeNodeEvent) => void;
  /** 展开按钮事件 */
  onExpandChange?: (payload: YTreeExpandChangeEvent) => void;
  /** 节点勾选框点击事件 */
  onCheckedChange?: (payload: YTreeCheckedChangeEvent) => void;
  /** 节点拖拽移动事件（draggable 开启时触发） */
  onNodeChange?: (payload: YTreeNodeChangeEvent) => void;
  /** 拖拽开始前置拦截，返回 false 取消拖拽 */
  beforeDrag?: (payload: YTreeDragEvent) => boolean;
  /** 拖拽放置前置拦截，返回 false 取消落点 */
  beforeDrop?: (payload: YTreeDropEvent) => boolean;
  /** 拖拽开始时回调 */
  onDrag?: (payload: YTreeDragEvent) => void;
  /** 拖拽过程中回调（dragover 时触发，频率高） */
  onDragMove?: (payload: YTreeDragMoveEvent) => void;
  /** 拖拽放置完成回调（在 onNodeChange 之前） */
  onDrop?: (payload: YTreeDropEvent) => void;
  /** 进入编辑态前置拦截，返回 false 取消 */
  beforeEditName?: (payload: YTreeNodeEvent) => boolean;
  /** 重命名提交前置拦截，返回 false 取消 */
  beforeRename?: (payload: YTreeRenameEvent) => boolean;
  /** 重命名完成回调 */
  onRename?: (payload: YTreeRenameEvent) => void;
  /** 删除前置拦截，返回 false 取消 */
  beforeRemove?: (payload: YTreeRemoveEvent) => boolean;
  /** 删除完成回调 */
  onRemove?: (payload: YTreeRemoveEvent) => void;
  /** 新增前置拦截，返回 false 取消 */
  beforeAdd?: (payload: YTreeAddEvent) => boolean;
  /** 新增完成回调 */
  onAdd?: (payload: YTreeAddEvent) => void;
  /** 异步加载前置拦截，返回 false 取消本次加载 */
  beforeAsync?: (payload: YTreeAsyncEvent) => boolean;
  /** 异步加载成功回调 */
  onAsyncSuccess?: (payload: YTreeAsyncSuccessEvent) => void;
  /** 异步加载失败回调 */
  onAsyncError?: (payload: YTreeAsyncErrorEvent) => void;
  /** 自定义节点 DOM */
  renderNodeExtra?: (node: YTreeModel) => ReactNode;
}

export interface YTreeRef {
  /** 获取节点信息 */
  getNodeById: (id: string | number) => YTreeModel | null;
  /** 获取勾选的节点集合 */
  getCheckedList: (includeNocheck?: boolean) => Array<YTreeModel>;
  /** 程序化移动节点 */
  moveNode: (
    sourceId: string | number,
    targetId: string | number,
    position: YTreeDropPosition,
  ) => boolean;
  /** 程序化复制节点，返回新节点id或null */
  copyNode: (
    sourceId: string | number,
    targetId: string | number,
    position: YTreeDropPosition,
  ) => string | number | null;
  /** 选中节点文本区（addFlag=true 追加） */
  selectNode: (id: string | number, addFlag?: boolean) => boolean;
  /** 取消文本区选中，缺省清空全部 */
  cancelSelectedNode: (id?: string | number) => boolean;
  /** 当前文本区选中节点 */
  getSelectedNodes: () => Array<YTreeModel>;
  /** 重新异步加载指定节点的子节点（懒加载模式），返回是否加载成功 */
  reAsyncChildNodes: (id: string | number) => Promise<boolean>;
  /** 程序化勾选（可改 disabled 节点） */
  checkNode: (
    id: string | number,
    checked: boolean,
    linkage?: boolean,
  ) => boolean;
  /** 全选 / 全不选（radio 模式下全选无效） */
  checkAllNodes: (checked?: boolean) => boolean;
  /** 全不选 */
  cancelAllNodes: () => boolean;
  /** 相对 init 快照，勾选状态发生变化的节点 */
  getChangeCheckedNodes: () => Array<YTreeModel>;
  /** 根节点列表 */
  getNodes: () => Array<YTreeModel>;
  /** 按属性精确匹配；parentId 有值时只搜该子树 */
  getNodesByParam: (
    key: string,
    value: unknown,
    parentId?: string | number,
  ) => Array<YTreeModel>;
  /** 按属性模糊匹配（忽略大小写） */
  getNodesByParamFuzzy: (
    key: string,
    value: unknown,
    parentId?: string | number,
  ) => Array<YTreeModel>;
  /** 兄弟下标，找不到返回 -1 */
  getNodeIndex: (id: string | number) => number;
  /** 热更新展示字段；checked/selected 走既有状态机 */
  updateNode: (
    id: string | number,
    patch?: Partial<YTreeModel> | Record<string, unknown>,
  ) => boolean;
  /** 当前树 DFS 扁平列表 */
  transformToArray: (parentId?: string | number) => Array<YTreeModel>;
  /** 当前树还原嵌套 */
  transformToTreeNodes: (parentId?: string | number) => Array<YTreeNode>;
  /** 扁数据 id/pId → 嵌套（不碰当前树） */
  transformToTreeNodesFromFlat: (
    nodes: Array<YTreeFlatNode>,
  ) => Array<YTreeNode>;
  /** 精确展开/折叠；expand 缺省=切换；sonSign 递归子孙 */
  expandNode: (
    id: string | number,
    expand?: boolean,
    sonSign?: boolean,
  ) => boolean;
  /** 沿祖先链展开/收起，使目标可见 */
  expandCollapseParentNode: (id: string | number, expand: boolean) => boolean;
}
