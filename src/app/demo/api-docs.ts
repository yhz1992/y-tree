/** API 参考表格行 */
export interface ApiDocRow {
  name: string;
  type: string;
  defaultValue?: string;
  desc: string;
}

export const propsRows: Array<ApiDocRow> = [
  {
    name: 'datasource',
    type: 'Array<YTreeNode | YTreeFlatNode>',
    defaultValue: '[]',
    desc: '数据源。嵌套用 children，扁平用 pId。[datasource]。',
  },
  {
    name: 'checkable',
    type: 'boolean',
    defaultValue: 'false',
    desc: '显示勾选框。',
  },
  {
    name: 'showLine',
    type: 'boolean',
    defaultValue: 'false',
    desc: '显示层级连接虚线。',
  },
  {
    name: 'expandAll',
    type: 'boolean',
    defaultValue: 'false',
    desc: '初始展开全部节点。',
  },
  {
    name: 'checkStrictly',
    type: 'boolean',
    defaultValue: 'false',
    desc: '勾选时父子互不联动。',
  },
  {
    name: 'chkStyle',
    type: '"checkbox" | "radio"',
    defaultValue: '"checkbox"',
    desc: '勾选控件样式。',
  },
  {
    name: 'radioType',
    type: '"all" | "level"',
    defaultValue: '"all"',
    desc: 'radio 互斥范围：整树 / 同级兄弟。',
  },
  {
    name: 'chkboxType',
    type: '{ Y?: string; N?: string }',
    defaultValue: '{ Y: "ps", N: "ps" }',
    desc: '联动方向。Y=勾选、N=取消；p=祖先、s=子孙。',
  },
  {
    name: 'draggable',
    type: 'boolean',
    defaultValue: 'false',
    desc: '开启 HTML5 拖拽。',
  },
  {
    name: 'isCopy',
    type: 'boolean',
    defaultValue: 'false',
    desc: 'Ctrl/Meta 拖拽时复制而非移动。',
  },
  {
    name: 'allowDrag',
    type: '(node: YTreeModel) => boolean',
    desc: '返回 false 阻止该节点被拖。',
  },
  {
    name: 'allowDrop',
    type: '(sourceId, targetId, position) => boolean',
    desc: '返回 false 阻止落点。position: inner | prev | next。',
  },
  {
    name: 'minMoveSize',
    type: 'number',
    defaultValue: '5',
    desc: '拖拽生效的最小移动距离（px）。',
  },
  {
    name: 'lazy',
    type: 'boolean',
    defaultValue: 'false',
    desc: '懒加载。配合 loadData，数据用 isParent 标记未加载父节点。',
  },
  {
    name: 'loadData',
    type: '(node: YTreeModel) => Promise<...> | ...',
    desc: '首次展开时加载子节点；根为空时加载根。',
  },
  {
    name: 'editable',
    type: 'boolean',
    defaultValue: 'false',
    desc: '显示重命名 / 新增 / 删除按钮。',
  },
  {
    name: 'showRenameBtn',
    type: 'boolean',
    defaultValue: 'true',
    desc: 'editable 时是否显示重命名按钮。',
  },
  {
    name: 'showRemoveBtn',
    type: 'boolean',
    defaultValue: 'true',
    desc: 'editable 时是否显示删除按钮。',
  },
  {
    name: 'showAddBtn',
    type: 'boolean',
    defaultValue: 'true',
    desc: 'editable 时是否显示新增按钮。',
  },
  {
    name: 'removeConfirm',
    type: 'boolean',
    defaultValue: 'true',
    desc: '删除前弹出确认气泡。',
  },
  {
    name: 'expandIds',
    type: 'Array<string | number>',
    defaultValue: '[]',
    desc: '受控展开。空数组=未受控，回退数据源 expanded。',
  },
  {
    name: 'checkedIds',
    type: 'Array<string | number>',
    defaultValue: '[]',
    desc: '受控勾选。空数组=未受控。',
  },
  {
    name: 'selectedIds',
    type: 'Array<string | number>',
    defaultValue: '[]',
    desc: '受控文本选中。空数组=未受控。',
  },
  {
    name: 'nocheckIds',
    type: 'Array<string | number>',
    defaultValue: '[]',
    desc: '不显示勾选框的节点 id。',
  },
  {
    name: 'searchValue',
    type: 'string',
    defaultValue: '""',
    desc: '按 name 过滤可见节点。',
  },
  {
    name: 'size',
    type: '"small" | "default" | "large"',
    defaultValue: '"default"',
    desc: '行高与字号。',
  },
  {
    name: 'className',
    type: 'string',
    defaultValue: '""',
    desc: '挂到最外层容器的 class。',
  },
  {
    name: 'height',
    type: 'number',
    defaultValue: '400',
    desc: '滚动容器高度（px），虚拟滚动依赖固定高度。',
  },
  {
    name: 'showIcon',
    type: 'boolean',
    defaultValue: 'true',
    desc: '显示节点图标。',
  },
  {
    name: 'showTitle',
    type: 'boolean',
    defaultValue: 'true',
    desc: '悬停 title。false 关闭。',
  },
  {
    name: 'title',
    type: '(node: YTreeModel) => string',
    desc: '自定义 title，返回空字符串则不显示。',
  },
  {
    name: 'fontCss',
    type: 'object | (node) => object | null',
    desc: '标题内联样式。对象整树共用，函数按节点。',
  },
  {
    name: 'dblClickExpand',
    type: 'boolean',
    defaultValue: 'true',
    desc: '双击标题展开/折叠。editable 时双击优先重命名。',
  },
  {
    name: 'expandSpeed',
    type: 'number | false | "" | "fast" | "slow"',
    defaultValue: '0',
    desc: '展开动画。0/false/空=关闭；fast=200ms，slow=400ms。',
  },
  {
    name: 'selectedMulti',
    type: 'boolean',
    defaultValue: 'true',
    desc: '是否允许多选文本选中。false 时 Ctrl 也不追加。',
  },
  {
    name: 'beforeClick',
    type: '(payload) => boolean',
    desc: '点击前置拦截，返回 false 取消选中与 (click)。',
  },
  {
    name: 'beforeExpand',
    type: '(payload) => boolean',
    desc: '展开前置拦截，返回 false 取消。',
  },
  {
    name: 'beforeCollapse',
    type: '(payload) => boolean',
    desc: '折叠前置拦截，返回 false 取消。',
  },
  {
    name: 'beforeCheck',
    type: '(payload) => boolean',
    desc: '勾选前置拦截。程序化 checkNode 不走。',
  },
  {
    name: 'beforeDrag',
    type: '(payload) => boolean',
    desc: '拖拽开始拦截，返回 false 取消。',
  },
  {
    name: 'beforeDrop',
    type: '(payload) => boolean',
    desc: '放置拦截，返回 false 取消落点。',
  },
  {
    name: 'beforeEditName',
    type: '(payload) => boolean',
    desc: '进入重命名拦截。',
  },
  {
    name: 'beforeRename',
    type: '(payload) => boolean',
    desc: '提交重命名拦截。',
  },
  { name: 'beforeRemove', type: '(payload) => boolean', desc: '删除拦截。' },
  { name: 'beforeAdd', type: '(payload) => boolean', desc: '新增拦截。' },
  {
    name: 'beforeAsync',
    type: '(payload) => boolean',
    desc: '懒加载拦截，返回 false 取消本次加载。',
  },
  {
    name: 'ng-template#nodeExtra',
    type: 'TemplateRef',
    desc: "节点额外 DOM。@ContentChild('nodeExtra')。",
  },
];

export const eventRows: Array<ApiDocRow> = [
  {
    name: 'click',
    type: 'YTreeNodeEvent',
    desc: '(click)。payload: { event, id }',
  },
  { name: 'dbClick', type: 'YTreeNodeEvent', desc: '(dbClick) 双击标题。' },
  {
    name: 'contextMenu',
    type: 'YTreeNodeEvent',
    desc: '(contextMenu) 标题右键。',
  },
  {
    name: 'expandChange',
    type: 'YTreeNodeEvent & { expand }',
    desc: '(expandChange) 展开/折叠变化。',
  },
  {
    name: 'checkedChange',
    type: 'YTreeNodeEvent & { checked }',
    desc: '(checkedChange) 勾选变化。',
  },
  {
    name: 'nodeChange',
    type: 'YTreeNodeChangeEvent',
    desc: '(nodeChange) 拖拽移动完成。',
  },
  { name: 'drag', type: 'YTreeDragEvent', desc: '(drag) 拖拽开始。' },
  {
    name: 'dragMove',
    type: 'YTreeDragMoveEvent',
    desc: '(dragMove) 拖拽过程（频率高）。',
  },
  {
    name: 'drop',
    type: 'YTreeDropEvent',
    desc: '(drop) 放置完成，在 nodeChange 之前。',
  },
  {
    name: 'rename',
    type: 'YTreeRenameEvent',
    desc: '(rename) 含 oldName / newName。',
  },
  { name: 'remove', type: 'YTreeRemoveEvent', desc: '(remove) 删除完成。' },
  { name: 'add', type: 'YTreeAddEvent', desc: '(add) 含 parentId。' },
  {
    name: 'asyncSuccess',
    type: 'YTreeAsyncSuccessEvent',
    desc: '(asyncSuccess) 含 children。',
  },
  {
    name: 'asyncError',
    type: 'YTreeAsyncErrorEvent',
    desc: '(asyncError) 含 error。',
  },
];

export const methodRows: Array<ApiDocRow> = [
  {
    name: 'getNodeById',
    type: '(id) => YTreeModel | null',
    desc: '按 id 取运行时节点。',
  },
  {
    name: 'getCheckedList',
    type: '() => YTreeModel[]',
    desc: '已勾选节点（无 includeNocheck 参数）。',
  },
  {
    name: 'getSelectedNodes',
    type: '() => YTreeModel[]',
    desc: '文本区当前选中节点。',
  },
  { name: 'getNodes', type: '() => YTreeModel[]', desc: '根节点列表。' },
  {
    name: 'getNodesByParam',
    type: '(key, value, parentId?) => YTreeModel[]',
    desc: '按属性精确匹配。',
  },
  {
    name: 'getNodesByParamFuzzy',
    type: '(key, value, parentId?) => YTreeModel[]',
    desc: '按属性模糊匹配（忽略大小写）。',
  },
  {
    name: 'getNodeIndex',
    type: '(id) => number',
    desc: '兄弟下标，找不到返回 -1。',
  },
  {
    name: 'selectNode',
    type: '(id, addFlag?) => boolean',
    desc: '选中文本区。addFlag=true 追加。',
  },
  {
    name: 'cancelSelectedNode',
    type: '(id?) => boolean',
    desc: '取消选中；缺省清空全部。',
  },
  {
    name: 'checkNode',
    type: '(id, checked, linkage?) => boolean',
    desc: '程序化勾选，可改 disabled。',
  },
  {
    name: 'checkAllNodes',
    type: '(checked?) => boolean',
    desc: '全选/全不选。radio 模式下全选无效。',
  },
  { name: 'cancelAllNodes', type: '() => boolean', desc: '全不选。' },
  {
    name: 'getChangeCheckedNodes',
    type: '() => YTreeModel[]',
    desc: '相对 init 快照，勾选发生变化的节点。',
  },
  {
    name: 'updateNode',
    type: '(id, patch?) => boolean',
    desc: '热更新展示字段；checked/selected 走既有状态机。',
  },
  {
    name: 'expandNode',
    type: '(id, expand?, sonSign?) => boolean',
    desc: '展开/折叠。expand 缺省=切换；sonSign 递归子孙。',
  },
  {
    name: 'expandCollapseParentNode',
    type: '(id, expand) => boolean',
    desc: '沿祖先链展开/收起。不走 before*。',
  },
  {
    name: 'moveNode',
    type: '(sourceId, targetId, position) => boolean',
    desc: '程序化移动。position: inner | prev | next。',
  },
  {
    name: 'copyNode',
    type: '(sourceId, targetId, position) => id | null',
    desc: '程序化复制，返回新节点 id。',
  },
  {
    name: 'reAsyncChildNodes',
    type: '(id) => Promise<boolean>',
    desc: '重新异步加载该节点子树（懒加载）。',
  },
  {
    name: 'transformToArray',
    type: '(parentId?) => YTreeModel[]',
    desc: '当前树 DFS 扁平列表。',
  },
  {
    name: 'transformToTreeNodes',
    type: '(parentId?) => YTreeNode[]',
    desc: '当前树还原为嵌套。',
  },
  {
    name: 'transformToTreeNodesFromFlat',
    type: '(nodes) => YTreeNode[]',
    desc: '扁数据 id/pId → 嵌套，不碰当前树。',
  },
];

export const nodeInputRows: Array<ApiDocRow> = [
  { name: 'id', type: 'string | number', desc: '节点 id，同树内唯一。' },
  { name: 'name', type: 'string', desc: '显示名称。' },
  { name: 'children', type: 'YTreeNode[]', desc: '嵌套子节点。叶子请传 []。' },
  {
    name: 'pId',
    type: 'string | number',
    desc: '仅扁平数据：父节点 id。根节点可空。',
  },
  { name: 'checked', type: 'boolean', desc: '初始勾选。' },
  {
    name: 'expanded',
    type: 'boolean',
    desc: '初始展开。受控 expandIds 非空时被覆盖。',
  },
  { name: 'selected', type: 'boolean', desc: '初始文本选中。' },
  { name: 'disabled', type: 'boolean', desc: '禁用点击/拖拽。' },
  {
    name: 'checkboxDisabled',
    type: 'boolean',
    desc: '勾选框禁用（用户不可改，API 可改）。',
  },
  { name: 'nocheck', type: 'boolean', desc: '不显示勾选框。' },
  { name: 'hide', type: 'boolean', desc: '隐藏该节点。' },
  {
    name: 'isParent',
    type: 'boolean',
    desc: '懒加载：标记为父节点，子节点尚未加载。',
  },
  {
    name: 'icon / iconOpen / iconClose',
    type: 'string',
    desc: '自定义图标：class 或图片 URL。',
  },
  {
    name: 'iconSkin',
    type: 'string',
    desc: '图标皮肤，渲染为 y-tree-icon-skin-skinName。',
  },
  { name: 'title', type: 'string', desc: '悬停提示，缺省回退 name。' },
];

export const nodeModelRows: Array<ApiDocRow> = [
  {
    name: 'pId',
    type: 'string | number',
    desc: '父节点 id。根为内部 ROOT_PARENT_ID。',
  },
  {
    name: 'isRoot / isFirst / isLast',
    type: 'boolean',
    desc: '根、同级首/末，连线与缩进用。',
  },
  {
    name: 'childIds',
    type: 'Array<string | number>',
    desc: '直接子节点 id，顺序即渲染顺序。',
  },
  {
    name: 'preId / nextId',
    type: 'string | number',
    desc: '同级前后兄弟 id。',
  },
  { name: 'index', type: 'number', desc: '同级下标。' },
  { name: 'level', type: 'number', desc: '层级，根为 0。' },
  {
    name: 'halfChecked',
    type: 'boolean',
    desc: '半选。仅 checkbox 联动时出现。',
  },
  { name: 'isAjaxing', type: 'boolean', desc: '子节点正在异步加载。' },
];
