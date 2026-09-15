import { Component } from '@angular/core';
import { demoMeta } from '../registry';
import { basicData as sharedBasicData } from '../data';

/** 展开演示数据：数据源不带内联 expanded，展开状态完全由 expandIds 受控 */
const expandTreeData: Array<any> = [
  {
    id: '1',
    name: '节点 1',
    children: [
      { id: '1-1', name: '节点 1-1', children: [] },
      { id: '1-2', name: '节点 1-2', children: [] },
    ],
  },
  { id: '2', name: '节点 2', children: [] },
  { id: '3', name: '节点 3', children: [] },
];

@Component({
  selector: 'demo-basic-group',
  template: `
    <demo-card [meta]="m.basic">
      <y-tree [datasource]="basicData" [height]="140"></y-tree>
    </demo-card>

    <demo-card [meta]="m.expand">
      <div class="demo-toolbar">
        <button type="button" (click)="expandNode1()">展开节点 1</button>
        <button type="button" (click)="collapseAll()">全部收起</button>
      </div>
      <y-tree
        [datasource]="expandData"
        [expandIds]="expandIds"
        [height]="140"
        (expandChange)="onExpandChange($event)"
      ></y-tree>
      <p class="demo-tip">{{ expandLog }}</p>
    </demo-card>

    <demo-card [meta]="m.showLine">
      <y-tree
        [datasource]="basicData"
        [showLine]="true"
        [expandAll]="true"
        [height]="140"
      ></y-tree>
    </demo-card>

    <demo-card [meta]="m.size">
      <div class="demo-row">
        <div class="demo-col" *ngFor="let size of sizes">
          <div class="demo-col-label">size="{{ size }}"</div>
          <y-tree
            [datasource]="basicData"
            [size]="size"
            [expandAll]="true"
            [height]="140"
          ></y-tree>
        </div>
      </div>
    </demo-card>
  `,
})
export class BasicGroupComponent {
  readonly m = {
    basic: demoMeta('basic'),
    expand: demoMeta('expand'),
    showLine: demoMeta('show-line'),
    size: demoMeta('size'),
  };

  readonly basicData = sharedBasicData;
  readonly expandData = expandTreeData;
  readonly sizes: Array<'small' | 'default' | 'large'> = [
    'small',
    'default',
    'large',
  ];

  expandIds: Array<string | number> = ['1'];
  expandLog = '当前受控展开：节点 1';

  expandNode1(): void {
    this.expandIds = ['1'];
    this.expandLog = '展开节点 1';
  }

  collapseAll(): void {
    this.expandIds = [];
    this.expandLog = '全部收起';
  }

  onExpandChange(e: any): void {
    this.expandIds = e.expand
      ? [...this.expandIds, e.id]
      : this.expandIds.filter((id) => id !== e.id);
    this.expandLog = `onExpandChange: id=${e.id}, expand=${e.expand}`;
  }
}
