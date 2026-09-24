import { computed, defineComponent, ref, shallowRef, watch } from 'vue';
import { YTreeService } from '../../../../common/service';
import type {
	NodeId,
	YTreeModel,
	YTreeAddEvent,
	YTreeAsyncEvent,
	YTreeAsyncErrorEvent,
	YTreeAsyncFrom,
	YTreeAsyncSuccessEvent,
	YTreeNodeChangeEvent,
	YTreeNodeEvent,
	YTreeRemoveEvent,
	YTreeRenameEvent,
	YTreeDragEvent,
	YTreeDragMoveEvent,
	YTreeDropEvent,
	YTreeFlatNode,
	YTreeNode
} from '../../../../common/model';
import {
	buildVisibleNodes,
	collectVisibleDescendants,
	parseExpandSpeed,
	patchVisibleAfterAdd,
	patchVisibleAfterCopy,
	patchVisibleAfterMove,
	patchVisibleAfterRemove,
	resolveFontCss,
	resolveNodeIcon,
	resolveNodeTitle,
	shouldRebuildVisibleAfterUpdate,
	type VisibleNode
} from '../../../../common/view';
import { YTreeProps } from './y-tree.props';
import type { YTreeDropPosition } from './y-tree.props';

/** 空集合返回 null（保留数据源内联状态），非空集合返回 Set（完全受控） */
const toSetOrNull = (list: Array<string | number>): Set<string | number> | null =>
	list && list.length > 0 ? new Set(list) : null;

export default defineComponent({
	name: 'y-tree',
	props: YTreeProps,
	emits: {
		click: (payload: YTreeNodeEvent) => !!payload,
		dbClick: (payload: YTreeNodeEvent) => !!payload,
		contextMenu: (payload: YTreeNodeEvent) => !!payload,
		expandChange: (payload: YTreeNodeEvent & { expand: boolean }) => !!payload,
		checkedChange: (payload: YTreeNodeEvent & { checked: boolean }) => !!payload,
		nodeChange: (payload: YTreeNodeChangeEvent) => !!payload,
		rename: (payload: YTreeRenameEvent) => !!payload,
		remove: (payload: YTreeRemoveEvent) => !!payload,
		add: (payload: YTreeAddEvent) => !!payload,
		drag: (payload: YTreeDragEvent) => !!payload,
		dragMove: (payload: YTreeDragMoveEvent) => !!payload,
		drop: (payload: YTreeDropEvent) => !!payload,
		asyncSuccess: (payload: YTreeAsyncSuccessEvent) => !!payload,
		asyncError: (payload: YTreeAsyncErrorEvent) => !!payload
	},
	setup(props, ctx) {
		// 核心服务实例
		let service = new YTreeService();

		// 展开集合
		const expanded = ref<Set<NodeId>>(new Set());

		// 懒加载根节点异步：datasource 为空时先异步取根数据
		const lazyRootData = ref<Array<YTreeNode | YTreeFlatNode> | null>(null);
		let rootLoadStarted = false;
		// 实际参与建树的数据源（根节点异步成功后用加载到的数据）
		const effectiveDatasource = computed<Array<YTreeNode | YTreeFlatNode>>(() => {
			if (props.datasource && props.datasource.length > 0) {
				return props.datasource;
			}
			if (props.lazy && lazyRootData.value) {
				return lazyRootData.value;
			}
			return props.datasource ?? [];
		});

		// 编辑状态：正在重命名的节点 + 输入内容 + 待确认删除的节点
		const editingId = ref<NodeId | null>(null);
		const editValue = ref('');
		const confirmRemoveId = ref<NodeId | null>(null);

		const enteringIds = ref<Set<NodeId>>(new Set());
		const leaving = ref<{ parentId: NodeId; ids: Array<NodeId> } | null>(null);
		let expandTimer = 0;

		const visibleNodes = shallowRef<Array<VisibleNode>>([]);
		const rebuildVisible = () => {
			visibleNodes.value = buildVisibleNodes(service, expanded.value, {
				searchValue: props.searchValue,
				leaving: leaving.value
			});
		};
		const bump = () => {
			visibleNodes.value = visibleNodes.value.slice();
		};
		const applyStructurePatch = (run: (list: Array<VisibleNode>) => boolean) => {
			const list = visibleNodes.value.slice();
			if (run(list)) {
				visibleNodes.value = list;
			} else {
				rebuildVisible();
			}
		};

		const initService = () => {
			const instance = new YTreeService(
				effectiveDatasource.value,
				toSetOrNull(props.checkedIds),
				toSetOrNull(props.selectedIds),
				toSetOrNull(props.nocheckIds),
				undefined,
				toSetOrNull(props.expandIds),
				undefined
			);
			instance.configureCheckMode(
				props.chkStyle,
				props.radioType,
				props.checkStrictly ? { Y: '', N: '' } : props.chkboxType ?? null
			);
			service.destroyed();
			service = instance;

			// 初始化展开集合
			const next = new Set<NodeId>();
			const flatMap = service.getFlatNodesMap();
			if (flatMap) {
				flatMap.forEach(node => {
					if (node.childIds.length > 0 && (props.expandAll || node.expanded)) {
						next.add(node.id);
					}
				});
			}
			expanded.value = next;
			rebuildVisible();
		};

		watch(
			() => [
				effectiveDatasource.value,
				props.expandIds,
				props.checkedIds,
				props.selectedIds,
				props.nocheckIds,
				props.expandAll,
				props.checkStrictly,
				props.chkStyle,
				props.radioType,
				props.chkboxType
			],
			initService,
			{ immediate: true }
		);

		watch(() => [expanded.value, props.searchValue, leaving.value] as const, rebuildVisible);

		// ---------- 虚拟滚动 ----------
		const ROW_HEIGHT = 28;
		const OVERSCAN = 5;
		const start = ref(0);
		const end = ref(0);

		const updateSlice = () => {
			const total = visibleNodes.value.length;
			const viewportRows = Math.ceil(props.height / ROW_HEIGHT);
			end.value = Math.min(total, start.value + viewportRows + OVERSCAN * 2);
		};

		const onScroll = (event: Event) => {
			const top = (event.target as HTMLElement).scrollTop;
			start.value = Math.max(0, Math.floor(top / ROW_HEIGHT) - OVERSCAN);
			updateSlice();
		};

		// 可见节点变化时更新可视切片
		watch(visibleNodes, updateSlice, { immediate: true });

		const visibleSlice = computed(() => visibleNodes.value.slice(start.value, end.value));

		const hasRootLine = computed<boolean>(() => {
			return !!props.showLine && service.getRootIds().length > 1;
		});

		/**
		 * 生成折叠切换器（Switcher）引导线背景
		 * 展开状态下从切换器中心（14px）向下画竖线连接子节点
		 */
		const switcherBg = (isExpanded: boolean): string => {
			if (!props.showLine || !isExpanded) {
				return 'none';
			}
			const color = '#c0c4cc';
			return `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) 8px 14px / 1px 14px no-repeat`;
		};

		// 生成节点引导线背景（竖虚线 + 水平虚线），antd/Element 拐角风格
		const indentBg = (node: YTreeModel): string => {
			if (!props.showLine) {
				return 'none';
			}
			const color = '#c0c4cc';
			const isLeaf = !service.hasChildren(node.id);

			if (hasRootLine.value) {
				const ancestors: Array<YTreeModel> = [];
				let cur: YTreeModel | null = node;
				while (cur) {
					ancestors.unshift(cur);
					const pId: string | number = cur.pId;
					cur = pId === undefined || pId === null || pId === '' ? null : service.getNodeById(pId) ?? null;
				}

				const level = node.level;
				const layers: Array<string> = [];

				for (let col = 0; col <= level; col++) {
					const x = col * 24 + 8;
					const isCornerCol = col === level;

					if (isCornerCol) {
						const startX = col * 24 + 8;
						const lineLen = isLeaf ? (col + 1) * 24 + 16 - startX : 12;
						layers.push(
							`repeating-linear-gradient(to right, transparent 0 3px, ${color} 3px 6px) ${startX}px 14px / ${lineLen}px 1px no-repeat`
						);

						const hasTop = col === 0 ? !node.isFirst : true;
						const hasBottom = !node.isLast;

						if (hasTop && hasBottom) {
							layers.push(
								`repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px 100% no-repeat`
							);
						} else if (hasTop) {
							layers.push(
								`repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px 14px no-repeat`
							);
						} else if (hasBottom) {
							layers.push(
								`repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 14px / 1px 14px no-repeat`
							);
						}
					} else {
						const ancestor = ancestors[col];
						if (ancestor && !ancestor.isLast) {
							layers.push(
								`repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px 100% no-repeat`
							);
						}
					}
				}

				return layers.length > 0 ? layers.join(', ') : 'none';
			}

			// 单根节点模式
			const level = node.level;
			if (level <= 0) {
				return 'none';
			}

			const ancestors: Array<YTreeModel> = [];
			let cur: YTreeModel | null = node;
			while (cur) {
				ancestors.unshift(cur);
				const pId: string | number = cur.pId;
				cur = pId === undefined || pId === null || pId === '' ? null : service.getNodeById(pId) ?? null;
			}
			const layers: Array<string> = [];
			for (let i = 0; i < level; i++) {
				const x = i * 24 + 8;
				const isCornerCol = i === level - 1;
				if (isCornerCol) {
					const height = node.isLast ? '14px' : '100%';
					layers.push(
						`repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px ${height} no-repeat`
					);
				} else {
					const ancestor = ancestors[i + 1];
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
		};

		// ---------- 懒加载（P3） ----------

		/** 执行一次异步加载；isRoot 为 true 时写入根数据集（datasource 为空的根节点异步） */
		const runLazyLoad = async (
			node: YTreeModel,
			from: YTreeAsyncFrom,
			isRoot: boolean = false,
			event?: MouseEvent
		): Promise<boolean> => {
			if (!props.loadData) {
				return false;
			}

			const payload: YTreeAsyncEvent = { id: node.id, name: node.name, from, node };

			// beforeAsync 前置拦截
			if (props.beforeAsync && props.beforeAsync(payload) === false) {
				return false;
			}

			// 根节点异步时无实体节点，不需要 loading 标记
			if (!isRoot) {
				service.setNodeLoading(node.id, true);
				bump();
			}

			try {
				const result = await props.loadData(node);
				const children = Array.isArray(result) ? result : [];
				if (isRoot) {
					lazyRootData.value = children;
				} else {
					service.setNodeChildren(node.id, children);
					service.setNodeLoading(node.id, false);
					// 加载成功后才真正展开
					const s = new Set(expanded.value);
					s.add(node.id);
					expanded.value = s;
					ctx.emit('expandChange', {
						event: (event ?? undefined) as unknown as MouseEvent,
						id: node.id,
						expand: true
					});
				}
				bump();
				ctx.emit('asyncSuccess', { ...payload, children });
				return true;
			} catch (error) {
				if (!isRoot) {
					service.setNodeLoading(node.id, false);
				}
				bump();
				ctx.emit('asyncError', { ...payload, error });
				return false;
			}
		};

		// 根节点异步：lazy 开启且 datasource 为空时，自动加载根数据（仅触发一次）
		watch(
			() => [props.lazy, props.loadData, effectiveDatasource.value] as const,
			() => {
				if (!props.lazy || !props.loadData || rootLoadStarted) {
					return;
				}
				if (props.datasource && props.datasource.length > 0) {
					return;
				}
				rootLoadStarted = true;
				void runLazyLoad(service.createLazyRootNode(), 'api', true);
			},
			{ immediate: true }
		);

		// ---------- 事件处理 ----------

		const applyExpandNode = (id: NodeId, expand?: boolean, sonSign?: boolean): boolean => {
			const node = service.getNodeById(id);
			if (!node) {
				return false;
			}
			const next = expand === undefined ? !expanded.value.has(id) : expand;
			const payload = { event: undefined as unknown as MouseEvent, id, expand: next };
			if (next) {
				if (props.beforeExpand?.(payload) === false) {
					return false;
				}
			} else if (props.beforeCollapse?.(payload) === false) {
				return false;
			}

			const ids: Array<NodeId> = [id];
			if (sonSign) {
				const flatMap = service.getFlatNodesMap();
				const stack = [...node.childIds];
				while (stack.length) {
					const cid = stack.pop() as NodeId;
					const child = flatMap?.get(cid);
					if (!child) {
						continue;
					}
					if (child.childIds.length > 0 || service.hasChildren(cid)) {
						ids.push(cid);
					}
					stack.push(...child.childIds);
				}
			}

			if (next && props.lazy && props.loadData) {
				for (const nid of ids) {
					if (service.isLazyParent(nid)) {
						const lazyNode = service.getNodeById(nid);
						if (lazyNode && !lazyNode.isAjaxing) {
							void runLazyLoad(lazyNode, 'api');
						}
					}
				}
			}

			const s = new Set(expanded.value);
			for (const nid of ids) {
				if (next) {
					s.add(nid);
				} else {
					s.delete(nid);
				}
			}
			expanded.value = s;
			ctx.emit('expandChange', payload);
			return true;
		};

		const applyExpandCollapseParent = (id: NodeId, expand: boolean): boolean => {
			const node = service.getNodeById(id);
			if (!node) {
				return false;
			}
			const ancestors: Array<NodeId> = [];
			let cur = node;
			while (cur) {
				const pId = cur.pId;
				if (pId === undefined || pId === null || pId === '') {
					break;
				}
				const parent = service.getNodeById(pId);
				if (!parent) {
					break;
				}
				ancestors.push(parent.id);
				cur = parent;
			}
			if (ancestors.length === 0) {
				return false;
			}
			const s = new Set(expanded.value);
			for (const nid of ancestors) {
				if (expand) {
					s.add(nid);
				} else {
					s.delete(nid);
				}
			}
			expanded.value = s;
			return true;
		};

		const onExpandChange = (event: MouseEvent, id: NodeId) => {
			const next = !expanded.value.has(id);
			const payload = { event, id, expand: next };
			if (next) {
				if (props.beforeExpand?.(payload) === false) {
					return;
				}
			} else if (props.beforeCollapse?.(payload) === false) {
				return;
			}

			// 懒加载：首次展开且子节点尚未加载 → 触发异步加载，成功后由 runLazyLoad 展开
			if (next && props.lazy && props.loadData && service.isLazyParent(id)) {
				const node = service.getNodeById(id);
				if (node && !node.isAjaxing) {
					void runLazyLoad(node, 'user', false, event);
				}
				return;
			}

			const expandMs = parseExpandSpeed(props.expandSpeed);
			if (expandMs > 0) {
				window.clearTimeout(expandTimer);
				if (next) {
					const enterIds = collectVisibleDescendants(service, id, expanded.value);
					leaving.value = null;
					enteringIds.value = new Set(enterIds);
					expandTimer = window.setTimeout(() => {
						enteringIds.value = new Set();
					}, expandMs);
				} else {
					const leaveIds = collectVisibleDescendants(service, id, expanded.value);
					enteringIds.value = new Set();
					leaving.value = { parentId: id, ids: leaveIds };
					expandTimer = window.setTimeout(() => {
						leaving.value = null;
					}, expandMs);
				}
			}

			const s = new Set(expanded.value);
			if (next) {
				s.add(id);
			} else {
				s.delete(id);
			}
			expanded.value = s;
			ctx.emit('expandChange', { event, id, expand: next });
		};

		const onClick = (event: MouseEvent, id: NodeId) => {
			const payload = { event, id };
			if (props.beforeClick?.(payload) === false) {
				event.stopPropagation();
				return;
			}
			const node = service.getNodeById(id);
			if (node && !node.disabled) {
				const addFlag = !!props.selectedMulti && (event.ctrlKey || event.metaKey);
				service.selectNode(id, addFlag);
				bump();
			}
			ctx.emit('click', payload);
		};

		const onDbClick = (event: MouseEvent, id: NodeId) => {
			ctx.emit('dbClick', { event, id });
			if (props.editable) {
				return;
			}
			if (props.dblClickExpand && service.hasChildren(id)) {
				onExpandChange(event, id);
			}
		};

		const onContextMenu = (event: MouseEvent, id: NodeId) => {
			ctx.emit('contextMenu', { event, id });
		};

		const onCheckedChange = (event: Event, id: NodeId) => {
			const checked = (event.target as HTMLInputElement).checked;
			const payload = { event: event as MouseEvent, id, checked };
			if (props.beforeCheck?.(payload) === false) {
				(event.target as HTMLInputElement).checked = !checked;
				return;
			}
			const ok = service.setCheckedByUser(id, checked, !props.checkStrictly);
			if (ok) {
				bump();
				ctx.emit('checkedChange', payload);
			}
		};

		// ---------- 拖拽 ----------
		const draggingId = ref<NodeId | null>(null);
		const dropTarget = ref<{ id: NodeId; position: YTreeDropPosition } | null>(null);

		/** 计算拖拽落点：行高固定 28px，按相对行的纵向位置三分 */
		const calcDropPosition = (event: DragEvent, hasChildren: boolean): YTreeDropPosition => {
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
		};

		// 拖拽起始位置（用于 minMoveSize 判断）
		const dragStartPos = { x: 0, y: 0 };

		const cleanupDrag = () => {
			draggingId.value = null;
			dropTarget.value = null;
		};

		const onDragStart = (event: DragEvent, id: NodeId) => {
			if (!props.draggable) {
				return;
			}
			const node = service.getNodeById(id);
			if (!node || node.disabled) {
				return;
			}
			// allowDrag 精细控制
			if (props.allowDrag && !props.allowDrag(node)) {
				return;
			}
			// beforeDrag 前置拦截
			if (props.beforeDrag?.({ event, id, sourceId: id, isCopy: false }) === false) {
				return;
			}
			dragStartPos.x = event.clientX;
			dragStartPos.y = event.clientY;
			draggingId.value = id;
			// 拖拽时收起非叶子节点（延迟到拖拽会话建立后执行）
			if (service.hasChildren(id) && expanded.value.has(id)) {
				const collapseId = id;
				window.setTimeout(() => {
					if (expanded.value.has(collapseId)) {
						const s = new Set(expanded.value);
						s.delete(collapseId);
						expanded.value = s;
					}
				}, 0);
			}
			const copyMode = props.isCopy && (event.ctrlKey || event.metaKey);
			if (event.dataTransfer) {
				event.dataTransfer.effectAllowed = copyMode ? 'copy' : 'move';
				event.dataTransfer.setData('text/plain', String(id));
				try {
					event.dataTransfer.setDragImage(event.currentTarget as HTMLElement, 20, 14);
				} catch {
					/* 部分浏览器不支持 setDragImage */
				}
			}
			ctx.emit('drag', { event, id, sourceId: id, isCopy: copyMode });
		};

		const onDragOver = (event: DragEvent, id: NodeId) => {
			if (!props.draggable || draggingId.value === null) {
				return;
			}
			const node = service.getNodeById(id);
			if (!node || node.disabled) {
				return;
			}
			// minMoveSize：实际移动距离不足时不显示落点
			const dx = event.clientX - dragStartPos.x;
			const dy = event.clientY - dragStartPos.y;
			if (props.minMoveSize > 0 && Math.sqrt(dx * dx + dy * dy) < props.minMoveSize) {
				return;
			}
			event.preventDefault();
			const copyMode = props.isCopy && (event.ctrlKey || event.metaKey);
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = copyMode ? 'copy' : 'move';
			}
			const position = calcDropPosition(event, service.hasChildren(id));
			dropTarget.value = { id, position };
			ctx.emit('dragMove', {
				event,
				id: draggingId.value,
				sourceId: draggingId.value,
				targetId: id,
				position,
				isCopy: copyMode
			});
		};

		const onDrop = (event: DragEvent, id: NodeId) => {
			if (!props.draggable || draggingId.value === null) {
				return;
			}
			event.preventDefault();
			const target = dropTarget.value;
			const sourceId = draggingId.value;
			cleanupDrag();
			if (!target || target.id !== id) {
				return;
			}
			const copyMode = props.isCopy && (event.ctrlKey || event.metaKey);
			const moveType: 'move' | 'copy' = copyMode ? 'copy' : 'move';

			// allowDrop 精细控制
			if (props.allowDrop && !props.allowDrop(sourceId, id, target.position)) {
				return;
			}
			// beforeDrop 前置拦截
			if (
				props.beforeDrop?.({
					event,
					id: sourceId,
					sourceId,
					targetId: id,
					position: target.position,
					isCopy: copyMode,
					moveType
				}) === false
			) {
				return;
			}

			// 执行移动或复制
			let ok = false;
			let resultId: NodeId | null = null;
			if (copyMode) {
				resultId = service.copyNode(sourceId, id, target.position);
				ok = resultId != null;
			} else {
				ok = service.moveNode(sourceId, id, target.position);
				resultId = sourceId;
			}

			if (ok) {
				if (copyMode && resultId != null) {
					applyStructurePatch(list =>
						patchVisibleAfterCopy(list, service, expanded.value, resultId as NodeId, props.searchValue)
					);
				} else {
					applyStructurePatch(list =>
						patchVisibleAfterMove(list, service, expanded.value, sourceId, props.searchValue)
					);
				}
				ctx.emit('drop', {
					event,
					id: resultId ?? sourceId,
					sourceId,
					targetId: id,
					position: target.position,
					isCopy: copyMode,
					moveType
				});
				ctx.emit('nodeChange', {
					event,
					id: resultId ?? sourceId,
					sourceId,
					targetId: id,
					position: target.position
				});
			}
		};

		const onDragEnd = () => {
			cleanupDrag();
		};

		// ---------- 编辑能力（P1） ----------

		/** 进入编辑态（双击标题 / 点击笔按钮），beforeEditName 返回 false 取消 */
		const startEdit = (event: MouseEvent, id: NodeId) => {
			if (!props.editable) {
				return;
			}
			const node = service.getNodeById(id);
			if (!node) {
				return;
			}
			if (props.beforeEditName?.({ event, id }) === false) {
				return;
			}
			confirmRemoveId.value = null;
			editingId.value = id;
			editValue.value = node.name;
		};

		/** 提交重命名（Enter / blur），beforeRename 返回 false 仅退出不保存 */
		const commitRename = (event?: Event) => {
			if (editingId.value === null) {
				return;
			}
			const id = editingId.value;
			const node = service.getNodeById(id);
			const newName = editValue.value.trim();
			editingId.value = null;
			if (!node || !newName || newName === node.name) {
				return;
			}
			const oldName = node.name;
			const payload: YTreeRenameEvent = {
				event: (event ?? undefined) as MouseEvent,
				id,
				oldName,
				newName
			};
			if (props.beforeRename?.(payload) === false) {
				return;
			}
			const ok = service.renameNode(id, newName);
			if (ok) {
				if (props.searchValue) {
					rebuildVisible();
				} else {
					bump();
				}
				ctx.emit('rename', payload);
			}
		};

		/** 取消编辑（Esc） */
		const cancelEdit = () => {
			editingId.value = null;
		};

		/** 关闭确认气泡 */
		const closeConfirm = () => {
			confirmRemoveId.value = null;
		};

		/** 点击垃圾桶：切换确认气泡显隐 */
		const handleRemoveClick = (event: MouseEvent, id: NodeId) => {
			editingId.value = null;
			confirmRemoveId.value = confirmRemoveId.value === id ? null : id;
		};

		/** 确认删除：beforeRemove 返回 false 取消 */
		const doRemove = (event: MouseEvent, id: NodeId) => {
			closeConfirm();
			if (props.beforeRemove?.({ event, id }) === false) {
				return;
			}
			const removed = service.removeNode(id);
			if (removed.length > 0) {
				removed.forEach(rid => expanded.value.delete(rid));
				applyStructurePatch(list => patchVisibleAfterRemove(list, removed));
				ctx.emit('remove', { event, id });
			}
		};

		/** 点击加号：给当前节点追加一个子节点，beforeAdd 返回 false 取消 */
		const handleAddClick = (event: MouseEvent, id: NodeId) => {
			if (!props.editable) {
				return;
			}
			if (props.beforeAdd?.({ event, id, parentId: id }) === false) {
				return;
			}
			const newId = service.addNode(id, { name: '新建节点' });
			if (newId != null) {
				if (expanded.value.has(id)) {
					applyStructurePatch(list =>
						patchVisibleAfterAdd(list, service, expanded.value, newId, props.searchValue)
					);
				} else {
					const s = new Set(expanded.value);
					s.add(id);
					expanded.value = s;
				}
				ctx.emit('add', { event, id: newId, parentId: id });
			}
		};

		// ---------- 对外暴露方法（通过 ref 调用） ----------
		const getNodeById = (id: NodeId): YTreeModel | null => service.getNodeById(id);

		const getCheckedList = (includeNocheck = true): Array<YTreeModel> => service.getCheckedList(includeNocheck);

		const moveNode = (sid: NodeId, tid: NodeId, pos: YTreeDropPosition) => {
			const ok = service.moveNode(sid, tid, pos);
			if (ok) {
				applyStructurePatch(list =>
					patchVisibleAfterMove(list, service, expanded.value, sid, props.searchValue)
				);
			}
			return ok;
		};

		const copyNode = (sid: NodeId, tid: NodeId, pos: YTreeDropPosition) => {
			const newId = service.copyNode(sid, tid, pos);
			if (newId != null) {
				applyStructurePatch(list =>
					patchVisibleAfterCopy(list, service, expanded.value, newId, props.searchValue)
				);
			}
			return newId;
		};

		ctx.expose({
			getNodeById,
			getCheckedList,
			moveNode,
			copyNode,
			reAsyncChildNodes: (id: NodeId): Promise<boolean> => {
				const node = service.getNodeById(id);
				if (!node || !props.loadData) {
					return Promise.resolve(false);
				}
				return runLazyLoad(node, 'api');
			},
			checkNode: (id: NodeId, checked: boolean, linkage = true) => {
				const ok = service.checkNode(id, checked, linkage);
				if (ok) bump();
				return ok;
			},
			checkAllNodes: (checked = true) => {
				const ok = service.checkAllNodes(checked);
				if (ok) bump();
				return ok;
			},
			cancelAllNodes: () => {
				const ok = service.cancelAllNodes();
				if (ok) bump();
				return ok;
			},
			getChangeCheckedNodes: () => service.getChangeCheckedNodes(),
			selectNode: (id: NodeId, addFlag = false) => {
				const ok = service.selectNode(id, addFlag);
				if (ok) bump();
				return ok;
			},
			cancelSelectedNode: (id?: NodeId) => {
				const ok = service.cancelSelectedNode(id);
				if (ok) bump();
				return ok;
			},
			getSelectedNodes: () => service.getSelectedNodes(),
			getNodes: () => service.getNodes(),
			getNodesByParam: (key: string, value: unknown, parentId?: NodeId) =>
				service.getNodesByParam(key, value, parentId),
			getNodesByParamFuzzy: (key: string, value: unknown, parentId?: NodeId) =>
				service.getNodesByParamFuzzy(key, value, parentId),
			getNodeIndex: (id: NodeId) => service.getNodeIndex(id),
			updateNode: (id: NodeId, patch?: Partial<YTreeModel> | Record<string, unknown>) => {
				const ok = service.updateNode(id, patch);
				if (ok) {
					if (shouldRebuildVisibleAfterUpdate(patch, props.searchValue)) {
						rebuildVisible();
					} else {
						bump();
					}
				}
				return ok;
			},
			transformToArray: (parentId?: NodeId) => service.transformToArray(parentId),
			transformToTreeNodes: (parentId?: NodeId) => service.transformToTreeNodes(parentId),
			transformToTreeNodesFromFlat: (nodes: Array<YTreeFlatNode>) => service.transformToTreeNodesFromFlat(nodes),
			expandNode: (id: NodeId, expand?: boolean, sonSign?: boolean) => applyExpandNode(id, expand, sonSign),
			expandCollapseParentNode: (id: NodeId, expand: boolean) => applyExpandCollapseParent(id, expand)
		});

		return {
			visibleNodes,
			visibleSlice,
			expanded,
			start,
			ROW_HEIGHT,
			hasRootLine,
			indentBg,
			switcherBg,
			/** 节点是否具备子节点（懒加载父节点也计入），模板据此渲染箭头与缩进 */
			hasChildren: (id: NodeId): boolean => service.hasChildren(id),
			onScroll,
			onClick,
			onDbClick,
			onContextMenu,
			onExpandChange,
			onCheckedChange,
			draggingId,
			dropTarget,
			onDragStart,
			onDragOver,
			onDrop,
			onDragEnd,
			editingId,
			editValue,
			confirmRemoveId,
			startEdit,
			commitRename,
			cancelEdit,
			closeConfirm,
			handleRemoveClick,
			doRemove,
			handleAddClick,
			enteringIds,
			leaving,
			expandMs: () => parseExpandSpeed(props.expandSpeed),
			nodeIcon: (node: YTreeModel, isExpanded: boolean, hasChildren: boolean) =>
				resolveNodeIcon(node, isExpanded, hasChildren, props.showIcon),
			nodeIconSrc: (node: YTreeModel, isExpanded: boolean, hasChildren: boolean): string => {
				const icon = resolveNodeIcon(node, isExpanded, hasChildren, props.showIcon);
				return icon.type === 'img' ? icon.src : '';
			},
			nodeIconClass: (node: YTreeModel, isExpanded: boolean, hasChildren: boolean): string => {
				const icon = resolveNodeIcon(node, isExpanded, hasChildren, props.showIcon);
				return icon.type === 'class' ? icon.className : '';
			},
			nodeTitle: (node: YTreeModel) => resolveNodeTitle(node, props.showTitle, props.title),
			nodeFontCss: (node: YTreeModel) => resolveFontCss(node, props.fontCss)
		};
	}
});
