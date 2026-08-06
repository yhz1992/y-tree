import {
	Component,
	OnChanges,
	SimpleChanges,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	OnDestroy
} from '@angular/core';
/**
 * y-tree 多功能树组件
 * @param 接管该组件的视图变更
 */
@Component({
	selector: 'y-tree',
	templateUrl: './y-tree.component.html',
	styleUrls: ['./y-tree.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush
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

	protected nodeIds: Array<string | number> = [];

	/**
	 * 文本节点点击事件
	 * @param event
	 * @param id
	 */
	protected onClick(event: MouseEvent, id: string | number) {
		this.click.emit({ event, id });
		this.updateView();
	}

	/**
	 * 文本节点双击事件
	 * @param event
	 * @param id
	 */
	protected onDbClick(event: MouseEvent, id: string | number) {
		this.dbClick.emit({ event, id });
		this.updateView();
	}

	/**
	 * 文本节点右键点击事件
	 * @param event
	 * @param id
	 */
	protected onContextMenu(event: MouseEvent, id: string | number) {
		this.contextMenu.emit({ event, id });
	}

	/**
	 * 展开按钮事件
	 * @param event
	 * @param id
	 * @param expand
	 */
	protected onExpandChange(event: MouseEvent, id: string | number, expand: boolean) {
		this.contextMenu.emit({ event, id, expand });
		this.updateView();
	}

	/**
	 * 节点勾选框点击事件
	 * @param event
	 * @param id
	 * @param checked
	 */
	protected onCheckedChange(event: MouseEvent, id: string | number, checked: boolean) {
		this.contextMenu.emit({ event, id, checked });
		this.updateView();
	}
	/**
	 * 手动触发视图更新
	 */
	private updateView() {
		this.ref.detectChanges();
	}

	/**
	 * 获取节点信息
	 * @param id
	 */
	public getNodeById(id: string | number): any {}

	/**
	 * 获取勾选的节点集合
	 */
	public getCheckedList(): Array<any> {
		return [];
	}

	constructor(private ref: ChangeDetectorRef) {}
	ngOnChanges(changes: SimpleChanges): void {}
	ngOnDestroy(): void {}
}
