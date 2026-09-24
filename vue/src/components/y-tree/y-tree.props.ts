import type { PropType } from 'vue';
import type {
	YTreeFlatNode,
	YTreeModel,
	YTreeNode,
	YTreeAddEvent,
	YTreeAsyncEvent,
	YTreeAsyncErrorEvent,
	YTreeAsyncSuccessEvent,
	YTreeChkboxType,
	YTreeChkStyle,
	YTreeExpandSpeed,
	YTreeFontCss,
	YTreeNodeChangeEvent,
	YTreeNodeEvent,
	YTreeRadioType,
	YTreeRemoveEvent,
	YTreeRenameEvent,
	YTreeDragEvent,
	YTreeDragMoveEvent,
	YTreeDropEvent
} from '../../../../common/model';

export type YTreeDropPosition = 'inner' | 'prev' | 'next';

/**
 * y-tree 组件 props
 * 与 Angular 版本一一对应
 */
export const YTreeProps = {
	/** 树组件数据源 */
	datasource: {
		type: Array as PropType<Array<YTreeNode | YTreeFlatNode>>,
		default: () => []
	},
	/** 是否展示勾选框 */
	checkable: { type: Boolean, default: false },
	/** 是否显示连线 */
	showLine: { type: Boolean, default: false },
	/** 是否默认展开全部节点 */
	expandAll: { type: Boolean, default: false },
	/** checkable 状态下节点选择完全受控（父子节点选中状态不再关联） */
	checkStrictly: { type: Boolean, default: false },
	/** 勾选控件样式：checkbox（默认）/ radio */
	chkStyle: {
		type: String as PropType<YTreeChkStyle>,
		default: 'checkbox'
	},
	/** radio 互斥范围：all=整树（默认）/ level=同级兄弟 */
	radioType: {
		type: String as PropType<YTreeRadioType>,
		default: 'all'
	},
	/** 父子联动方向 */
	chkboxType: {
		type: Object as PropType<YTreeChkboxType>
	},
	/** 节点是否可拖拽 */
	draggable: { type: Boolean, default: false },
	/** Ctrl+拖拽时复制而非移动 */
	isCopy: { type: Boolean, default: false },
	/** 允许拖拽节点判定，返回 false 阻止拖拽 */
	allowDrag: {
		type: Function as PropType<(node: YTreeModel) => boolean>
	},
	/** 允许落点判定，返回 false 阻止落点 */
	allowDrop: {
		type: Function as PropType<
			(sourceId: string | number, targetId: string | number, position: YTreeDropPosition) => boolean
		>
	},
	/** 拖拽生效最小移动距离（px），默认 5 */
	minMoveSize: { type: Number, default: 5 },
	/** 懒加载模式：子节点在首次展开时通过 loadData 异步获取 */
	lazy: { type: Boolean, default: false },
	/** 异步加载子节点数据（lazy 开启时生效） */
	loadData: {
		type: Function as PropType<
			(node: YTreeModel) => Promise<Array<YTreeNode | YTreeFlatNode>> | Array<YTreeNode | YTreeFlatNode>
		>
	},
	/** 异步加载前置拦截，返回 false 取消本次加载 */
	beforeAsync: {
		type: Function as PropType<(payload: YTreeAsyncEvent) => boolean>
	},
	/** 异步加载成功回调 */
	onAsyncSuccess: {
		type: Function as PropType<(payload: YTreeAsyncSuccessEvent) => void>
	},
	/** 异步加载失败回调 */
	onAsyncError: {
		type: Function as PropType<(payload: YTreeAsyncErrorEvent) => void>
	},
	/** 拖拽开始前置拦截，返回 false 取消 */
	beforeDrag: {
		type: Function as PropType<(payload: YTreeDragEvent) => boolean>
	},
	/** 拖拽放置前置拦截，返回 false 取消 */
	beforeDrop: {
		type: Function as PropType<(payload: YTreeDropEvent) => boolean>
	},
	/** 是否启用编辑能力（重命名/删除/新增按钮） */
	editable: { type: Boolean, default: false },
	/** 是否显示重命名按钮 */
	showRenameBtn: { type: Boolean, default: true },
	/** 是否显示删除按钮 */
	showRemoveBtn: { type: Boolean, default: true },
	/** 是否显示新增按钮 */
	showAddBtn: { type: Boolean, default: true },
	/** 删除前是否弹气泡确认 */
	removeConfirm: { type: Boolean, default: true },
	/** 进入编辑态前置拦截，返回 false 取消 */
	beforeEditName: {
		type: Function as PropType<(payload: YTreeNodeEvent) => boolean>
	},
	/** 重命名提交前置拦截，返回 false 取消 */
	beforeRename: {
		type: Function as PropType<(payload: YTreeRenameEvent) => boolean>
	},
	/** 删除前置拦截，返回 false 取消 */
	beforeRemove: {
		type: Function as PropType<(payload: YTreeRemoveEvent) => boolean>
	},
	/** 新增前置拦截，返回 false 取消 */
	beforeAdd: {
		type: Function as PropType<(payload: YTreeAddEvent) => boolean>
	},
	/** 展开的节点id集合 */
	expandIds: {
		type: Array as PropType<Array<string | number>>,
		default: () => []
	},
	/** 勾选节点的id集合 */
	checkedIds: {
		type: Array as PropType<Array<string | number>>,
		default: () => []
	},
	/** 选中节点的id集合（文本区域） */
	selectedIds: {
		type: Array as PropType<Array<string | number>>,
		default: () => []
	},
	/** 在 checkable 状态下不显示勾选框的节点id集合 */
	nocheckIds: {
		type: Array as PropType<Array<string | number>>,
		default: () => []
	},
	/** 搜索的关键字 */
	searchValue: { type: String, default: '' },
	/** 组件的大小模式，主要对应到节点行高，字号大小 */
	size: {
		type: String as PropType<'small' | 'default' | 'large'>,
		default: 'default'
	},
	/** 挂载到最外层容器上的样式类 */
	className: { type: String, default: '' },
	/** 滚动容器高度（px），虚拟滚动依赖固定高度容器 */
	height: { type: Number, default: 400 },
	/** 是否显示节点图标，默认 true */
	showIcon: { type: Boolean, default: true },
	/** 是否显示悬停 title，默认 true */
	showTitle: { type: Boolean, default: true },
	/** 自定义 title，返回空字符串则不显示 */
	title: {
		type: Function as PropType<(node: YTreeModel) => string>
	},
	/** 节点标题字体样式 */
	fontCss: {
		type: [Object, Function] as PropType<YTreeFontCss>
	},
	/** 双击标题是否展开/折叠，默认 true */
	dblClickExpand: { type: Boolean, default: true },
	/** 展开动画速度，默认关闭 */
	expandSpeed: {
		type: [Number, Boolean, String] as PropType<YTreeExpandSpeed>,
		default: 0
	},
	/** 是否允许多选文本选中，默认 true */
	selectedMulti: { type: Boolean, default: true },
	/** 点击前置拦截，返回 false 取消选中与 click */
	beforeClick: {
		type: Function as PropType<(payload: YTreeNodeEvent) => boolean>
	},
	/** 展开前置拦截，返回 false 取消 */
	beforeExpand: {
		type: Function as PropType<(payload: YTreeNodeEvent & { expand: boolean }) => boolean>
	},
	/** 折叠前置拦截，返回 false 取消 */
	beforeCollapse: {
		type: Function as PropType<(payload: YTreeNodeEvent & { expand: boolean }) => boolean>
	},
	/** 勾选前置拦截，返回 false 取消；程序化 checkNode 不走 */
	beforeCheck: {
		type: Function as PropType<(payload: YTreeNodeEvent & { checked: boolean }) => boolean>
	}
} as const;
