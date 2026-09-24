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
		desc: '数据源。嵌套用 children，扁平用 pId。模板 :datasource。'
	},
	{ name: 'checkable', type: 'boolean', defaultValue: 'false', desc: '显示勾选框。' },
	{ name: 'showLine', type: 'boolean', defaultValue: 'false', desc: '显示层级连接虚线。模板 show-line。' },
	{ name: 'expandAll', type: 'boolean', defaultValue: 'false', desc: '初始展开全部。模板 expand-all。' },
	{
		name: 'checkStrictly',
		type: 'boolean',
		defaultValue: 'false',
		desc: '勾选时父子互不联动。模板 check-strictly。'
	},
	{
		name: 'chkStyle',
		type: '"checkbox" | "radio"',
		defaultValue: '"checkbox"',
		desc: '勾选控件样式。模板 chk-style。'
	},
	{ name: 'radioType', type: '"all" | "level"', defaultValue: '"all"', desc: 'radio 互斥范围。模板 radio-type。' },
	{
		name: 'chkboxType',
		type: '{ Y?: string; N?: string }',
		defaultValue: '{ Y: "ps", N: "ps" }',
		desc: '联动方向。Y=勾选、N=取消；p=祖先、s=子孙。'
	},
	{ name: 'draggable', type: 'boolean', defaultValue: 'false', desc: '开启 HTML5 拖拽。' },
	{ name: 'isCopy', type: 'boolean', defaultValue: 'false', desc: 'Ctrl/Meta 拖拽时复制。模板 is-copy。' },
	{ name: 'allowDrag', type: '(node: YTreeModel) => boolean', desc: '返回 false 阻止该节点被拖。模板 :allow-drag。' },
	{
		name: 'allowDrop',
		type: '(sourceId, targetId, position) => boolean',
		desc: '返回 false 阻止落点。position: inner | prev | next。'
	},
	{
		name: 'minMoveSize',
		type: 'number',
		defaultValue: '5',
		desc: '拖拽生效最小移动距离（px）。模板 min-move-size。'
	},
	{
		name: 'lazy',
		type: 'boolean',
		defaultValue: 'false',
		desc: '懒加载。配合 loadData，数据用 isParent 标记未加载父节点。'
	},
	{
		name: 'loadData',
		type: '(node: YTreeModel) => Promise<...> | ...',
		desc: '首次展开加载子节点；根为空时加载根。模板 :load-data。'
	},
	{ name: 'editable', type: 'boolean', defaultValue: 'false', desc: '显示重命名 / 新增 / 删除按钮。' },
	{
		name: 'showRenameBtn',
		type: 'boolean',
		defaultValue: 'true',
		desc: 'editable 时是否显示重命名。模板 show-rename-btn。'
	},
	{
		name: 'showRemoveBtn',
		type: 'boolean',
		defaultValue: 'true',
		desc: 'editable 时是否显示删除。模板 show-remove-btn。'
	},
	{ name: 'showAddBtn', type: 'boolean', defaultValue: 'true', desc: 'editable 时是否显示新增。模板 show-add-btn。' },
	{ name: 'removeConfirm', type: 'boolean', defaultValue: 'true', desc: '删除前弹出确认气泡。模板 remove-confirm。' },
	{
		name: 'expandIds',
		type: 'Array<string | number>',
		defaultValue: '[]',
		desc: '受控展开。空数组=未受控。模板 :expand-ids。'
	},
	{
		name: 'checkedIds',
		type: 'Array<string | number>',
		defaultValue: '[]',
		desc: '受控勾选。空数组=未受控。模板 :checked-ids。'
	},
	{
		name: 'selectedIds',
		type: 'Array<string | number>',
		defaultValue: '[]',
		desc: '受控文本选中。空数组=未受控。模板 :selected-ids。'
	},
	{
		name: 'nocheckIds',
		type: 'Array<string | number>',
		defaultValue: '[]',
		desc: '不显示勾选框的节点 id。模板 :nocheck-ids。'
	},
	{ name: 'searchValue', type: 'string', defaultValue: '""', desc: '按 name 过滤。模板 :search-value。' },
	{ name: 'size', type: '"small" | "default" | "large"', defaultValue: '"default"', desc: '行高与字号。' },
	{ name: 'className', type: 'string', defaultValue: '""', desc: '挂到最外层容器的 class。模板 class-name。' },
	{ name: 'height', type: 'number', defaultValue: '400', desc: '滚动容器高度（px），虚拟滚动依赖固定高度。' },
	{ name: 'showIcon', type: 'boolean', defaultValue: 'true', desc: '显示节点图标。模板 show-icon。' },
	{ name: 'showTitle', type: 'boolean', defaultValue: 'true', desc: '悬停 title。模板 show-title。' },
	{ name: 'title', type: '(node: YTreeModel) => string', desc: '自定义 title，返回空字符串则不显示。' },
	{ name: 'fontCss', type: 'object | (node) => object | null', desc: '标题内联样式。模板 :font-css。' },
	{
		name: 'dblClickExpand',
		type: 'boolean',
		defaultValue: 'true',
		desc: '双击展开。editable 时双击优先重命名。模板 dbl-click-expand。'
	},
	{
		name: 'expandSpeed',
		type: 'number | false | "" | "fast" | "slow"',
		defaultValue: '0',
		desc: '展开动画。0=关闭。模板 expand-speed。'
	},
	{
		name: 'selectedMulti',
		type: 'boolean',
		defaultValue: 'true',
		desc: '是否允许多选文本选中。模板 selected-multi。'
	},
	{ name: 'beforeClick', type: '(payload) => boolean', desc: '点击拦截。模板 :before-click。' },
	{ name: 'beforeExpand', type: '(payload) => boolean', desc: '展开拦截。模板 :before-expand。' },
	{ name: 'beforeCollapse', type: '(payload) => boolean', desc: '折叠拦截。模板 :before-collapse。' },
	{ name: 'beforeCheck', type: '(payload) => boolean', desc: '勾选拦截。程序化 checkNode 不走。' },
	{ name: 'beforeDrag', type: '(payload) => boolean', desc: '拖拽开始拦截。' },
	{ name: 'beforeDrop', type: '(payload) => boolean', desc: '放置拦截。' },
	{ name: 'beforeEditName', type: '(payload) => boolean', desc: '进入重命名拦截。' },
	{ name: 'beforeRename', type: '(payload) => boolean', desc: '提交重命名拦截。' },
	{ name: 'beforeRemove', type: '(payload) => boolean', desc: '删除拦截。' },
	{ name: 'beforeAdd', type: '(payload) => boolean', desc: '新增拦截。' },
	{ name: 'beforeAsync', type: '(payload) => boolean', desc: '懒加载拦截。' },
	{ name: '#nodeExtra', type: 'slot', desc: '节点额外 DOM。作用域 slot，参数为 node。' }
];

export const eventRows: Array<ApiDocRow> = [
	{ name: 'click', type: 'YTreeNodeEvent', desc: '@click。payload: { event, id }' },
	{ name: 'db-click', type: 'YTreeNodeEvent', desc: '@db-click 双击标题。' },
	{ name: 'context-menu', type: 'YTreeNodeEvent', desc: '@context-menu 标题右键。' },
	{ name: 'expand-change', type: 'YTreeNodeEvent & { expand }', desc: '@expand-change 展开/折叠变化。' },
	{ name: 'checked-change', type: 'YTreeNodeEvent & { checked }', desc: '@checked-change 勾选变化。' },
	{ name: 'node-change', type: 'YTreeNodeChangeEvent', desc: '@node-change 拖拽移动完成。' },
	{ name: 'drag', type: 'YTreeDragEvent', desc: '@drag 拖拽开始。' },
	{ name: 'drag-move', type: 'YTreeDragMoveEvent', desc: '@drag-move 拖拽过程（频率高）。' },
	{ name: 'drop', type: 'YTreeDropEvent', desc: '@drop 放置完成，在 node-change 之前。' },
	{ name: 'rename', type: 'YTreeRenameEvent', desc: '@rename 含 oldName / newName。' },
	{ name: 'remove', type: 'YTreeRemoveEvent', desc: '@remove 删除完成。' },
	{ name: 'add', type: 'YTreeAddEvent', desc: '@add 含 parentId。' },
	{ name: 'async-success', type: 'YTreeAsyncSuccessEvent', desc: '@async-success 含 children。' },
	{ name: 'async-error', type: 'YTreeAsyncErrorEvent', desc: '@async-error 含 error。' }
];

export const methodRows: Array<ApiDocRow> = [
	{ name: 'getNodeById', type: '(id) => YTreeModel | null', desc: '按 id 取运行时节点。' },
	{
		name: 'getCheckedList',
		type: '(includeNocheck?) => YTreeModel[]',
		desc: '已勾选节点。includeNocheck 默认 true。'
	},
	{ name: 'getSelectedNodes', type: '() => YTreeModel[]', desc: '文本区当前选中节点。' },
	{ name: 'getNodes', type: '() => YTreeModel[]', desc: '根节点列表。' },
	{ name: 'getNodesByParam', type: '(key, value, parentId?) => YTreeModel[]', desc: '按属性精确匹配。' },
	{
		name: 'getNodesByParamFuzzy',
		type: '(key, value, parentId?) => YTreeModel[]',
		desc: '按属性模糊匹配（忽略大小写）。'
	},
	{ name: 'getNodeIndex', type: '(id) => number', desc: '兄弟下标，找不到返回 -1。' },
	{ name: 'selectNode', type: '(id, addFlag?) => boolean', desc: '选中文本区。addFlag=true 追加。' },
	{ name: 'cancelSelectedNode', type: '(id?) => boolean', desc: '取消选中；缺省清空全部。' },
	{ name: 'checkNode', type: '(id, checked, linkage?) => boolean', desc: '程序化勾选，可改 disabled。' },
	{ name: 'checkAllNodes', type: '(checked?) => boolean', desc: '全选/全不选。radio 模式下全选无效。' },
	{ name: 'cancelAllNodes', type: '() => boolean', desc: '全不选。' },
	{ name: 'getChangeCheckedNodes', type: '() => YTreeModel[]', desc: '相对 init 快照，勾选发生变化的节点。' },
	{ name: 'updateNode', type: '(id, patch?) => boolean', desc: '热更新展示字段；checked/selected 走既有状态机。' },
	{
		name: 'expandNode',
		type: '(id, expand?, sonSign?) => boolean',
		desc: '展开/折叠。expand 缺省=切换；sonSign 递归子孙。'
	},
	{ name: 'expandCollapseParentNode', type: '(id, expand) => boolean', desc: '沿祖先链展开/收起。不走 before*。' },
	{
		name: 'moveNode',
		type: '(sourceId, targetId, position) => boolean',
		desc: '程序化移动。position: inner | prev | next。'
	},
	{ name: 'copyNode', type: '(sourceId, targetId, position) => id | null', desc: '程序化复制，返回新节点 id。' },
	{ name: 'reAsyncChildNodes', type: '(id) => Promise<boolean>', desc: '重新异步加载该节点子树（懒加载）。' },
	{ name: 'transformToArray', type: '(parentId?) => YTreeModel[]', desc: '当前树 DFS 扁平列表。' },
	{ name: 'transformToTreeNodes', type: '(parentId?) => YTreeNode[]', desc: '当前树还原为嵌套。' },
	{ name: 'transformToTreeNodesFromFlat', type: '(nodes) => YTreeNode[]', desc: '扁数据 id/pId → 嵌套，不碰当前树。' }
];

export const nodeInputRows: Array<ApiDocRow> = [
	{ name: 'id', type: 'string | number', desc: '节点 id，同树内唯一。' },
	{ name: 'name', type: 'string', desc: '显示名称。' },
	{ name: 'children', type: 'YTreeNode[]', desc: '嵌套子节点。叶子请传 []。' },
	{ name: 'pId', type: 'string | number', desc: '仅扁平数据：父节点 id。根节点可空。' },
	{ name: 'checked', type: 'boolean', desc: '初始勾选。' },
	{ name: 'expanded', type: 'boolean', desc: '初始展开。受控 expandIds 非空时被覆盖。' },
	{ name: 'selected', type: 'boolean', desc: '初始文本选中。' },
	{ name: 'disabled', type: 'boolean', desc: '禁用点击/拖拽。' },
	{ name: 'checkboxDisabled', type: 'boolean', desc: '勾选框禁用（用户不可改，API 可改）。' },
	{ name: 'nocheck', type: 'boolean', desc: '不显示勾选框。' },
	{ name: 'hide', type: 'boolean', desc: '隐藏该节点。' },
	{ name: 'isParent', type: 'boolean', desc: '懒加载：标记为父节点，子节点尚未加载。' },
	{ name: 'icon / iconOpen / iconClose', type: 'string', desc: '自定义图标：class 或图片 URL。' },
	{ name: 'iconSkin', type: 'string', desc: '图标皮肤，渲染为 y-tree-icon-skin-${iconSkin}。' },
	{ name: 'title', type: 'string', desc: '悬停提示，缺省回退 name。' }
];

export const nodeModelRows: Array<ApiDocRow> = [
	{ name: 'pId', type: 'string | number', desc: '父节点 id。根为内部 ROOT_PARENT_ID。' },
	{ name: 'isRoot / isFirst / isLast', type: 'boolean', desc: '根、同级首/末，连线与缩进用。' },
	{ name: 'childIds', type: 'Array<string | number>', desc: '直接子节点 id，顺序即渲染顺序。' },
	{ name: 'preId / nextId', type: 'string | number', desc: '同级前后兄弟 id。' },
	{ name: 'index', type: 'number', desc: '同级下标。' },
	{ name: 'level', type: 'number', desc: '层级，根为 0。' },
	{ name: 'halfChecked', type: 'boolean', desc: '半选。仅 checkbox 联动时出现。' },
	{ name: 'isAjaxing', type: 'boolean', desc: '子节点正在异步加载。' }
];
