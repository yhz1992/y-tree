import {
  Component,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { YTreeService } from '../common/service';
import type {
  NodeId,
  YTreeModel,
  YTreeAddEvent,
  YTreeNodeEvent,
  YTreeRemoveEvent,
  YTreeRenameEvent,
  YTreeDragEvent,
  YTreeDragMoveEvent,
  YTreeDropEvent,
} from '../common/model';

/**
 * y-tree 多功能树组件
 */
@Component({
  selector: 'y-tree',
  templateUrl: './y-tree.component.html',
  styleUrls: ['./y-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YTreeComponent implements OnChanges, OnDestroy {
  /**
   * 树组件数据源
   */
  @Input() datasource: Array<any> = [];
  /**
   * 是否展示勾选框
   */
  @Input() checkable: boolean = false;
  /**
   * 是否显示连线
   */
  @Input() showLine: boolean = false;
  /**
   * 是否默认展开全部节点
   */
  @Input() expandAll: boolean = false;
  /**
   * checkable 状态下节点选择完全受控（父子节点选中状态不再关联）
   */
  @Input() checkStrictly: boolean = false;
  /**
   * 节点是否可拖拽
   */
  @Input() draggable: boolean = false;
  /**
   * Ctrl+拖拽时复制而非移动
   */
  @Input() isCopy: boolean = false;
  /**
   * 允许拖拽节点判定，返回 false 阻止拖拽
   */
  @Input() allowDrag?: (node: YTreeModel) => boolean;
  /**
   * 允许落点判定，返回 false 阻止落点
   */
  @Input() allowDrop?: (
    sourceId: string | number,
    targetId: string | number,
    position: 'inner' | 'prev' | 'next'
  ) => boolean;
  /**
   * 拖拽生效最小移动距离（px）
   */
  @Input() minMoveSize: number = 5;
  /**
   * 拖拽开始前置拦截，返回 false 取消
   */
  @Input() beforeDrag?: (payload: YTreeDragEvent) => boolean;
  /**
   * 拖拽放置前置拦截，返回 false 取消
   */
  @Input() beforeDrop?: (payload: YTreeDropEvent) => boolean;
  /**
   * 是否启用编辑能力（重命名/删除/新增按钮）
   */
  @Input() editable: boolean = false;
  /**
   * 是否显示重命名按钮
   */
  @Input() showRenameBtn: boolean = true;
  /**
   * 是否显示删除按钮
   */
  @Input() showRemoveBtn: boolean = true;
  /**
   * 是否显示新增按钮
   */
  @Input() showAddBtn: boolean = true;
  /**
   * 删除前是否弹气泡确认
   */
  @Input() removeConfirm: boolean = true;
  /**
   * 进入编辑态前置拦截，返回 false 取消
   */
  @Input() beforeEditName?: (payload: YTreeNodeEvent) => boolean;
  /**
   * 重命名提交前置拦截，返回 false 取消
   */
  @Input() beforeRename?: (payload: YTreeRenameEvent) => boolean;
  /**
   * 删除前置拦截，返回 false 取消
   */
  @Input() beforeRemove?: (payload: YTreeRemoveEvent) => boolean;
  /**
   * 新增前置拦截，返回 false 取消
   */
  @Input() beforeAdd?: (payload: YTreeAddEvent) => boolean;
  /**
   * 展开的节点id集合
   */
  @Input() expandIds: Array<string | number> = [];
  /**
   * 勾选节点的id集合
   */
  @Input() checkedIds: Array<string | number> = [];
  /**
   * 选中节点的id集合（文本区域）
   */
  @Input() selectedIds: Array<string | number> = [];
  /**
   * 在 checkable 状态下不显示勾选框的节点id集合
   */
  @Input() nocheckIds: Array<string | number> = [];
  /**
   * 搜索的关键字
   */
  @Input() searchValue: string = '';
  /**
   * 组件的大小模式，主要对应到节点行高，字号大小
   */
  @Input() size: 'small' | 'default' | 'large' = 'default';
  /**
   * 挂载到最外层容器上的样式类
   */
  @Input() className: string = '';
  /**
   * 滚动容器高度（px），虚拟滚动依赖固定高度容器
   */
  @Input() height: number = 400;
  /**
   * 文本节点点击事件
   */
  @Output() click = new EventEmitter<any>();
  /**
   * 文本节点双击事件，默认会触发当前节点展开
   */
  @Output() dbClick = new EventEmitter<any>();
  /**
   * 文本节点右键点击事件
   */
  @Output() contextMenu = new EventEmitter<any>();
  /**
   * 展开按钮事件
   */
  @Output() expandChange = new EventEmitter<any>();
  /**
   * 节点勾选框点击事件
   */
  @Output() checkedChange = new EventEmitter<any>();
  /**
   * 节点拖拽移动事件（draggable 开启时触发）
   */
  @Output() nodeChange = new EventEmitter<any>();
  /**
   * 拖拽开始事件
   */
  @Output() drag = new EventEmitter<any>();
  /**
   * 拖拽移动中事件
   */
  @Output() dragMove = new EventEmitter<any>();
  /**
   * 拖拽放置事件
   */
  @Output() drop = new EventEmitter<any>();
  /**
   * 节点重命名事件
   */
  @Output() rename = new EventEmitter<any>();
  /**
   * 节点删除事件
   */
  @Output() remove = new EventEmitter<any>();
  /**
   * 节点新增事件
   */
  @Output() add = new EventEmitter<any>();
  /**
   * 自定义节点 DOM 模板（对标 zTree addDiyDom）
   */
  @ContentChild('nodeExtra', { static: false })
  nodeExtraTemplate: TemplateRef<any> | null = null;

  /**
   * 可见节点列表（扁平化渲染）
   */
  protected visibleNodes: Array<{ id: NodeId; node: YTreeModel }> = [];

  /**
   * 拖拽状态：正在拖拽的节点id
   */
  protected draggingId: NodeId | null = null;

  /**
   * 拖拽状态：当前落点（用于高亮指示）
   */
  protected dropTarget: {
    id: NodeId;
    position: 'inner' | 'prev' | 'next';
  } | null = null;

  /**
   * 编辑状态：正在重命名的节点id
   */
  protected editingId: NodeId | null = null;

  /**
   * 编辑状态：重命名输入框内容
   */
  protected editValue: string = '';

  /**
   * 编辑状态：待确认删除的节点id
   */
  protected confirmRemoveId: NodeId | null = null;

  /**
   * 拖拽起始位置（用于 minMoveSize 判断）
   */
  private dragStartPos: { x: number; y: number } = { x: 0, y: 0 };

  /**
   * 虚拟滚动行高（px），固定行高是虚拟滚动的前提
   */
  protected readonly ROW_HEIGHT: number = 28;

  /**
   * 虚拟滚动可视区外缓冲行数
   */
  private static readonly OVERSCAN: number = 5;

  /**
   * 虚拟滚动可视切片
   */
  protected visibleSlice: Array<{ id: NodeId; node: YTreeModel }> = [];

  /**
   * 虚拟滚动起始行
   */
  protected start: number = 0;

  /**
   * 虚拟滚动结束行
   */
  protected end: number = 0;

  /**
   * 总行数
   */
  protected total: number = 0;

  /**
   * 展开节点id集合
   */
  protected expandedIds: Set<NodeId> = new Set();

  /**
   * 核心服务实例
   */
  private service: YTreeService | null = null;

  constructor(private ref: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.initService();
  }

  /**
   * 空集合返回 null（保留数据源内联状态），非空集合返回 Set（完全受控）
   * @param list 节点id集合
   */
  private toSetOrNull(
    list: Array<string | number> | null
  ): Set<string | number> | null {
    return list && list.length > 0 ? new Set(list) : null;
  }

  /**
   * 初始化/重建核心服务
   */
  private initService(): void {
    this.service?.destroyed();
    this.service = new YTreeService(
      this.datasource,
      this.toSetOrNull(this.checkedIds),
      this.toSetOrNull(this.selectedIds),
      this.toSetOrNull(this.nocheckIds),
      undefined,
      this.toSetOrNull(this.expandIds),
      undefined
    );

    // 初始化展开集合
    const expanded = new Set<NodeId>();
    const flatMap = this.service.getFlatNodesMap();
    if (flatMap) {
      flatMap.forEach((node) => {
        if (node.childIds.length > 0 && (this.expandAll || node.expanded)) {
          expanded.add(node.id);
        }
      });
    }
    this.expandedIds = expanded;
    this.rebuildVisibleNodes();
    // OnPush 组件内部状态变化，标记需要检查以刷新视图
    this.ref.markForCheck();
  }

  /**
   * 重建可见节点列表（按展开状态 DFS，命中 searchValue 过滤）
   */
  private rebuildVisibleNodes(): void {
    const flatMap = this.service?.getFlatNodesMap();
    const list: Array<{ id: NodeId; node: YTreeModel }> = [];
    if (!flatMap) {
      this.visibleNodes = list;
      return;
    }

    // 根顺序以 service.getRootIds() 为准（moveNode 会更新此顺序）
    const rootIds: Array<NodeId> = this.service?.getRootIds() ?? [];

    const stack: Array<NodeId> = [...rootIds].reverse();
    while (stack.length) {
      const id = stack.pop() as NodeId;
      const node = flatMap.get(id);
      if (!node || node.hide) {
        continue;
      }
      if (this.searchValue && node.name.indexOf(this.searchValue) === -1) {
        continue;
      }
      list.push({ id, node });
      if (node.childIds.length > 0 && this.expandedIds.has(id)) {
        for (let i = node.childIds.length - 1; i >= 0; i--) {
          stack.push(node.childIds[i]);
        }
      }
    }
    this.visibleNodes = list;
    this.updateVisibleSlice();
  }

  /**
   * 更新虚拟滚动可视切片（只渲染可视区 + 缓冲）
   */
  private updateVisibleSlice(): void {
    this.total = this.visibleNodes.length;
    const viewportRows = Math.ceil(this.height / this.ROW_HEIGHT);
    this.end = Math.min(
      this.total,
      this.start + viewportRows + YTreeComponent.OVERSCAN * 2
    );
    this.visibleSlice = this.visibleNodes.slice(this.start, this.end);
  }

  /**
   * 滚动容器滚动事件
   * @param event
   */
  protected onVirtualScroll(event: Event): void {
    const top = (event.target as HTMLElement).scrollTop;
    this.start = Math.max(
      0,
      Math.floor(top / this.ROW_HEIGHT) - YTreeComponent.OVERSCAN
    );
    this.updateVisibleSlice();
    this.ref.markForCheck();
  }

  /**
   * 节点是否展开
   * @param id 节点id
   */
  protected isExpanded(id: NodeId): boolean {
    return this.expandedIds.has(id);
  }

  /**
   * 生成节点引导线背景（竖虚线 + 水平虚线），antd/Element 拐角风格
   * 缩进 24px/列；竖线位于列内偏右（antd inset-inline-end: switcherSize/2 → x = i*24 + 13）
   * 横线从父列竖线连接到内容边界（长 11px）；虚线 3px/3px 统一
   * 列 i 竖线：非最后列 → 该级祖先非最后子时贯穿，否则不画；最后一列 → 最后子画半截（└），否则贯穿
   * 每行独立绘制，兼容虚拟滚动
   * @param node 节点信息
   */
  protected indentBg(node: YTreeModel): string {
    if (!this.showLine || node.level <= 0) {
      return 'none';
    }
    const color = '#c0c4cc';
    const layers: Array<string> = [];
    // 收集祖先链：chain = [本节点(L), 父(L-1), ..., level1 祖先]
    const chain: Array<YTreeModel> = [];
    let cur: YTreeModel | null = node;
    while (cur && cur.level > 0) {
      chain.push(cur);
      cur = this.service?.getNodeById(cur.pId) ?? null;
    }
    const L = node.level;
    for (let i = 0; i < L; i++) {
      const ancestor = chain[L - 1 - i];
      if (!ancestor) {
        continue;
      }
      const x = i * 24 + 8;
      const isCornerCol = i === L - 1;
      if (isCornerCol) {
        // 本节点自己的列：最后子 → 半截（到横线）；否则贯穿
        const height = ancestor.isLast ? '14px' : '100%';
        layers.push(
          `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px ${height} no-repeat`
        );
      } else if (!ancestor.isLast) {
        layers.push(
          `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px 100% no-repeat`
        );
      }
    }
    // 最后一列：水平虚线连接竖线与节点内容（拐角）；叶子横线画满 indent（margin-right 6px 前）
    const startX = (L - 1) * 24 + 8;
    const lineLen = node.childIds.length === 0 ? L * 24 + 16 - startX : 12;
    layers.push(
      `repeating-linear-gradient(to right, transparent 0 3px, ${color} 3px 6px) ${startX}px 14px / ${lineLen}px 1px no-repeat`
    );
    return layers.join(', ');
  }

  /**
   * 文本节点点击事件
   * @param event
   * @param id
   */
  protected onClick(event: MouseEvent, id: NodeId) {
    this.click.emit({ event, id });
  }

  /**
   * 文本节点双击事件
   * @param event
   * @param id
   */
  protected onDbClick(event: MouseEvent, id: NodeId) {
    this.dbClick.emit({ event, id });
  }

  /**
   * 文本节点右键点击事件
   * @param event
   * @param id
   */
  protected onContextMenu(event: MouseEvent, id: NodeId) {
    event.preventDefault();
    this.contextMenu.emit({ event, id });
  }

  /**
   * 手动触发视图更新（重建可见节点 + 标记检查）
   */
  private updateView(): void {
    this.rebuildVisibleNodes();
    this.ref.markForCheck();
  }

  /**
   * 展开按钮事件
   * @param event
   * @param id
   */
  protected onExpandChange(event: MouseEvent, id: NodeId) {
    event.stopPropagation();
    const next = !this.expandedIds.has(id);
    if (next) {
      this.expandedIds.add(id);
    } else {
      this.expandedIds.delete(id);
    }
    this.expandChange.emit({ event, id, expand: next });
    this.updateView();
  }

  /**
   * 节点勾选框点击事件
   * @param event
   * @param id
   */
  protected onCheckedChange(event: Event, id: NodeId) {
    const checked = (event.target as HTMLInputElement).checked;
    const ok = this.service?.setCheckedByUser(id, checked, !this.checkStrictly);
    if (ok) {
      this.checkedChange.emit({ event: event as MouseEvent, id, checked });
      this.updateView();
    }
  }

  /**
   * 计算拖拽落点：行高固定 28px，按相对行的纵向位置三分
   * @param event
   * @param hasChildren
   */
  private calcDropPosition(
    event: DragEvent,
    hasChildren: boolean
  ): 'inner' | 'prev' | 'next' {
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
  }

  /**
   * 清理拖拽状态
   */
  private cleanupDrag(): void {
    this.draggingId = null;
    this.dropTarget = null;
    this.ref.markForCheck();
  }

  /**
   * 节点拖拽开始
   * @param event
   * @param id
   */
  protected onDragStart(event: DragEvent, id: NodeId) {
    if (!this.draggable) {
      return;
    }
    const node = this.service?.getNodeById(id);
    if (!node || node.disabled) {
      return;
    }
    // allowDrag 精细控制
    if (this.allowDrag && !this.allowDrag(node)) {
      return;
    }
    // beforeDrag 前置拦截
    if (
      this.beforeDrag?.({ event, id, sourceId: id, isCopy: false }) === false
    ) {
      return;
    }
    this.dragStartPos = { x: event.clientX, y: event.clientY };
    this.draggingId = id;
    this.ref.markForCheck();
    // 拖拽时收起非叶子节点（延迟到拖拽会话建立后执行）
    if (node.childIds.length > 0 && this.expandedIds.has(id)) {
      const collapseId = id;
      window.setTimeout(() => {
        if (this.expandedIds.has(collapseId)) {
          this.expandedIds.delete(collapseId);
          this.updateView();
        }
      }, 0);
    }
    const copyMode = this.isCopy && (event.ctrlKey || event.metaKey);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = copyMode ? 'copy' : 'move';
      event.dataTransfer.setData('text/plain', String(id));
      try {
        event.dataTransfer.setDragImage(
          event.currentTarget as HTMLElement,
          20,
          14
        );
      } catch {
        /* 部分浏览器不支持 setDragImage */
      }
    }
    this.drag.emit({ event, id, sourceId: id, isCopy: copyMode });
  }

  /**
   * 节点拖拽经过（计算落点并高亮）
   * @param event
   * @param id
   */
  protected onDragOver(event: DragEvent, id: NodeId) {
    if (!this.draggable || this.draggingId === null) {
      return;
    }
    const node = this.service?.getNodeById(id);
    if (!node || node.disabled) {
      return;
    }
    // minMoveSize：实际移动距离不足时不显示落点
    const dx = event.clientX - this.dragStartPos.x;
    const dy = event.clientY - this.dragStartPos.y;
    if (
      this.minMoveSize > 0 &&
      Math.sqrt(dx * dx + dy * dy) < this.minMoveSize
    ) {
      return;
    }
    event.preventDefault();
    const copyMode = this.isCopy && (event.ctrlKey || event.metaKey);
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = copyMode ? 'copy' : 'move';
    }
    const position = this.calcDropPosition(event, node.childIds.length > 0);
    this.dropTarget = { id, position };
    this.ref.markForCheck();
    this.dragMove.emit({
      event,
      id: this.draggingId,
      sourceId: this.draggingId,
      targetId: id,
      position,
      isCopy: copyMode,
    });
  }

  /**
   * 节点拖拽放下（执行移动/复制并通知外部）
   * @param event
   * @param id
   */
  protected onDrop(event: DragEvent, id: NodeId) {
    if (!this.draggable || this.draggingId === null) {
      return;
    }
    event.preventDefault();
    const target = this.dropTarget;
    const sourceId = this.draggingId;
    this.cleanupDrag();
    if (!target || target.id !== id) {
      return;
    }
    const copyMode = this.isCopy && (event.ctrlKey || event.metaKey);
    const moveType: 'move' | 'copy' = copyMode ? 'copy' : 'move';

    // allowDrop 精细控制
    if (this.allowDrop && !this.allowDrop(sourceId, id, target.position)) {
      return;
    }
    // beforeDrop 前置拦截
    if (
      this.beforeDrop?.({
        event,
        id: sourceId,
        sourceId,
        targetId: id,
        position: target.position,
        isCopy: copyMode,
        moveType,
      }) === false
    ) {
      return;
    }

    // 执行移动或复制
    let ok = false;
    let resultId: NodeId | null = null;
    if (copyMode) {
      resultId = this.service?.copyNode(sourceId, id, target.position) ?? null;
      ok = resultId != null;
    } else {
      ok = this.service?.moveNode(sourceId, id, target.position) ?? false;
      resultId = sourceId;
    }

    if (ok) {
      this.drop.emit({
        event,
        id: resultId ?? sourceId,
        sourceId,
        targetId: id,
        position: target.position,
        isCopy: copyMode,
        moveType,
      });
      this.nodeChange.emit({
        event,
        id: resultId ?? sourceId,
        sourceId,
        targetId: id,
        position: target.position,
      });
      this.updateView();
    }
  }

  /**
   * 节点拖拽结束
   */
  protected onDragEnd() {
    this.cleanupDrag();
  }

  // ---------- 编辑能力（P1） ----------

  /**
   * 进入编辑态（双击标题 / 点击笔按钮），beforeEditName 返回 false 取消
   * @param event
   * @param id
   */
  protected startEdit(event: MouseEvent, id: NodeId) {
    if (!this.editable) {
      return;
    }
    const node = this.service?.getNodeById(id);
    if (!node) {
      return;
    }
    if (this.beforeEditName?.({ event, id }) === false) {
      return;
    }
    this.confirmRemoveId = null;
    this.editingId = id;
    this.editValue = node.name;
    this.ref.markForCheck();
  }

  /**
   * 重命名输入事件
   * @param event
   */
  protected onEditInput(event: Event) {
    this.editValue = (event.target as HTMLInputElement).value;
  }

  /**
   * 提交重命名（Enter / blur），beforeRename 返回 false 仅退出不保存
   * @param event
   */
  protected commitRename(event?: Event) {
    if (this.editingId === null) {
      return;
    }
    const id = this.editingId;
    const node = this.service?.getNodeById(id);
    const newName = this.editValue.trim();
    this.editingId = null;
    this.ref.markForCheck();
    if (!node || !newName || newName === node.name) {
      return;
    }
    const oldName = node.name;
    const payload: YTreeRenameEvent = {
      event: (event ?? undefined) as MouseEvent,
      id,
      oldName,
      newName,
    };
    if (this.beforeRename?.(payload) === false) {
      return;
    }
    const ok = this.service?.renameNode(id, newName);
    if (ok) {
      this.rename.emit(payload);
      this.updateView();
    }
  }

  /**
   * 取消编辑（Esc）
   */
  protected cancelEdit() {
    this.editingId = null;
    this.ref.markForCheck();
  }

  /**
   * 关闭删除确认气泡
   */
  protected closeConfirm() {
    this.confirmRemoveId = null;
    this.ref.markForCheck();
  }

  /**
   * 点击垃圾桶：切换确认气泡显隐
   * @param event
   * @param id
   */
  protected handleRemoveClick(event: MouseEvent, id: NodeId) {
    this.editingId = null;
    this.confirmRemoveId = this.confirmRemoveId === id ? null : id;
    this.ref.markForCheck();
  }

  /**
   * 确认删除：beforeRemove 返回 false 取消
   * @param event
   * @param id
   */
  protected doRemove(event: MouseEvent, id: NodeId) {
    this.closeConfirm();
    if (this.beforeRemove?.({ event, id }) === false) {
      return;
    }
    const removed = this.service?.removeNode(id) ?? [];
    if (removed.length > 0) {
      removed.forEach((rid) => this.expandedIds.delete(rid));
      this.remove.emit({ event, id });
      this.updateView();
    }
  }

  /**
   * 点击加号：给当前节点追加一个子节点，beforeAdd 返回 false 取消
   * @param event
   * @param id
   */
  protected handleAddClick(event: MouseEvent, id: NodeId) {
    if (!this.editable) {
      return;
    }
    if (this.beforeAdd?.({ event, id, parentId: id }) === false) {
      return;
    }
    const newId = this.service?.addNode(id, { name: '新建节点' });
    if (newId != null) {
      this.expandedIds.add(id);
      this.add.emit({ event, id: newId, parentId: id });
      this.updateView();
    }
  }

  /**
   * 获取节点信息
   * @param id
   */
  public getNodeById(id: NodeId): YTreeModel | null {
    return this.service?.getNodeById(id) ?? null;
  }

  /**
   * 获取勾选的节点集合
   */
  public getCheckedList(): Array<YTreeModel> {
    return this.service?.getCheckedList() ?? [];
  }

  /**
   * 程序化移动节点
   */
  public moveNode(
    sourceId: NodeId,
    targetId: NodeId,
    position: 'inner' | 'prev' | 'next'
  ): boolean {
    const ok = this.service?.moveNode(sourceId, targetId, position) ?? false;
    if (ok) this.updateView();
    return ok;
  }

  /**
   * 程序化复制节点，返回新节点id或null
   */
  public copyNode(
    sourceId: NodeId,
    targetId: NodeId,
    position: 'inner' | 'prev' | 'next'
  ): NodeId | null {
    const newId = this.service?.copyNode(sourceId, targetId, position) ?? null;
    if (newId != null) this.updateView();
    return newId;
  }

  ngOnDestroy(): void {
    this.service?.destroyed();
    this.service = null;
  }
}
