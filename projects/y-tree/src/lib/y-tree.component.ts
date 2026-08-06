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
} from '@angular/core';
import { YTreeService } from '../common/service';
import type { NodeId, YTreeModel } from '../common/model';

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
   * 可见节点列表（扁平化渲染）
   */
  protected visibleNodes: Array<{ id: NodeId; node: YTreeModel }> = [];

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
    list: Array<string | number> | null,
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
      undefined,
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

    const rootIds: Array<NodeId> = [];
    flatMap.forEach((node) => {
      if (node.isRoot) {
        rootIds.push(node.id);
      }
    });

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
      this.start + viewportRows + YTreeComponent.OVERSCAN * 2,
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
      Math.floor(top / this.ROW_HEIGHT) - YTreeComponent.OVERSCAN,
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
          `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px ${height} no-repeat`,
        );
      } else if (!ancestor.isLast) {
        layers.push(
          `repeating-linear-gradient(to bottom, transparent 0 3px, ${color} 3px 6px) ${x}px 0 / 1px 100% no-repeat`,
        );
      }
    }
    // 最后一列：水平虚线连接竖线与节点内容（拐角）；叶子横线画满 indent（margin-right 6px 前）
    const startX = (L - 1) * 24 + 8;
    const lineLen = node.childIds.length === 0 ? L * 24 + 16 - startX : 12;
    layers.push(
      `repeating-linear-gradient(to right, transparent 0 3px, ${color} 3px 6px) ${startX}px 14px / ${lineLen}px 1px no-repeat`,
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

  ngOnDestroy(): void {
    this.service?.destroyed();
    this.service = null;
  }
}
