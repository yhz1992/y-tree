import { Component, ViewChild } from '@angular/core';
import { YTreeComponent } from 'y-tree';
import { demoMeta } from '../registry';
import {
  basicData as sharedBasicData,
  checkData as sharedCheckData,
  collectIds,
} from '../data';

const disabledData: Array<any> = [
  {
    id: '1',
    name: '节点 1',
    expanded: true,
    children: [
      { id: '1-1', name: '节点 1-1', children: [] },
      { id: '1-2', name: '节点 1-2（disabled）', disabled: true, children: [] },
    ],
  },
  { id: '2', name: '节点 2（disabled）', disabled: true, children: [] },
  { id: '3', name: '节点 3', children: [] },
];

const nocheckData: Array<any> = [
  {
    id: '1',
    name: '节点 1',
    expanded: true,
    children: [
      { id: '1-1', name: '节点 1-1', children: [] },
      { id: '1-2', name: '节点 1-2', children: [] },
    ],
  },
  { id: '2', name: '节点 2（nocheck）', nocheck: true, children: [] },
  { id: '3', name: '节点 3', children: [] },
];

const hideData: Array<any> = [
  {
    id: '1',
    name: '节点 1',
    expanded: true,
    children: [
      { id: '1-1', name: '节点 1-1', children: [] },
      { id: '1-2', name: '节点 1-2（hide）', hide: true, children: [] },
    ],
  },
  { id: '2', name: '节点 2（hide）', hide: true, children: [] },
  { id: '3', name: '节点 3', children: [] },
];

/** 受控勾选演示数据：不带内联 checked，勾选状态完全由 checkedIds 受控 */
const controlledTreeData: Array<any> = [
  {
    id: '1',
    name: '节点 1',
    expanded: true,
    children: [
      { id: '1-1', name: '节点 1-1', children: [] },
      { id: '1-2', name: '节点 1-2', children: [] },
      { id: '1-3', name: '节点 1-3', children: [] },
    ],
  },
  { id: '2', name: '节点 2', children: [] },
];

@Component({
  selector: 'demo-state-group',
  template: `
    <demo-card [meta]="m.checkable">
      <y-tree
        #checkableTree
        [datasource]="checkData"
        [checkable]="true"
        [expandAll]="true"
        [height]="196"
        (checkedChange)="onCheckedChange($event)"
      ></y-tree>
      <p class="demo-tip">{{ checkLog }}</p>
    </demo-card>

    <demo-card [meta]="m.checkStrictly">
      <div class="demo-row">
        <div class="demo-col">
          <div class="demo-col-label">默认：父子联动</div>
          <y-tree
            [datasource]="checkData"
            [checkable]="true"
            [expandAll]="true"
            [height]="196"
          ></y-tree>
        </div>
        <div class="demo-col">
          <div class="demo-col-label">checkStrictly：互不联动</div>
          <y-tree
            [datasource]="checkData"
            [checkable]="true"
            [checkStrictly]="true"
            [expandAll]="true"
            [height]="196"
          ></y-tree>
        </div>
      </div>
    </demo-card>

    <demo-card [meta]="m.controlled">
      <div class="demo-toolbar">
        <button type="button" (click)="checkAll()">全选</button>
        <button type="button" (click)="clearAll()">清空</button>
      </div>
      <y-tree
        #controlledTree
        [datasource]="controlledData"
        [checkable]="true"
        [checkedIds]="checkedIds"
        [height]="140"
        (checkedChange)="syncChecked($event)"
      ></y-tree>
      <p class="demo-tip">{{ controlledLog }}</p>
    </demo-card>

    <demo-card [meta]="m.select">
      <y-tree
        [datasource]="basicData"
        [expandAll]="true"
        [selectedIds]="selectedIds"
        [height]="140"
        (click)="onClick($event)"
      ></y-tree>
      <p class="demo-tip">{{ selectLog }}</p>
    </demo-card>

    <demo-card [meta]="m.disabled">
      <y-tree
        [datasource]="disabledData"
        [checkable]="true"
        [expandAll]="true"
        [height]="140"
      ></y-tree>
    </demo-card>

    <demo-card [meta]="m.nocheck">
      <y-tree
        [datasource]="nocheckData"
        [checkable]="true"
        [expandAll]="true"
        [height]="140"
      ></y-tree>
    </demo-card>

    <demo-card [meta]="m.hide">
      <y-tree [datasource]="hideData" [expandAll]="true" [height]="84"></y-tree>
    </demo-card>
  `,
})
export class StateGroupComponent {
  readonly m = {
    checkable: demoMeta('checkable'),
    checkStrictly: demoMeta('check-strictly'),
    controlled: demoMeta('controlled'),
    select: demoMeta('select'),
    disabled: demoMeta('disabled'),
    nocheck: demoMeta('nocheck'),
    hide: demoMeta('hide'),
  };

  readonly basicData = sharedBasicData;
  readonly checkData = sharedCheckData;
  readonly controlledData = controlledTreeData;
  readonly disabledData = disabledData;
  readonly nocheckData = nocheckData;
  readonly hideData = hideData;

  @ViewChild('checkableTree') checkableTree!: YTreeComponent;
  @ViewChild('controlledTree') controlledTree!: YTreeComponent;

  /* ---------- 勾选框 ---------- */
  checkLog = '（点击勾选框观察父子联动）';

  onCheckedChange(e: any): void {
    const list = this.checkableTree?.getCheckedList() ?? [];
    this.checkLog = `onCheckedChange: id=${e.id}, checked=${e.checked}｜全树已勾选 ${list.length} 个节点`;
  }

  /* ---------- 受控勾选 ---------- */
  checkedIds: Array<string | number> = ['1-2'];
  controlledLog = '受控 checkedIds = ["1-2"]';

  checkAll(): void {
    this.checkedIds = collectIds(this.controlledData);
    this.controlledLog = '全选：checkedIds = 全部节点';
  }

  clearAll(): void {
    this.checkedIds = [];
    this.controlledLog = '清空：checkedIds = []';
  }

  syncChecked(e: any): void {
    const ids =
      this.controlledTree?.getCheckedList()?.map((n: any) => n.id) ?? [];
    this.checkedIds = ids;
    this.controlledLog = `onCheckedChange: id=${e.id}｜checkedIds 已同步为 ${ids.length} 项`;
  }

  /* ---------- 选中 ---------- */
  selectedIds: Array<string | number> = [];
  selectLog = '（点击节点标题选中，Ctrl/Cmd + 点击多选）';

  onClick(e: any): void {
    const multi = e.event.ctrlKey || e.event.metaKey;
    if (!multi) {
      this.selectedIds = [e.id];
    } else {
      this.selectedIds = this.selectedIds.includes(e.id)
        ? this.selectedIds.filter((id) => id !== e.id)
        : [...this.selectedIds, e.id];
    }
    this.selectLog = `selectedIds = [${this.selectedIds.join(', ')}]`;
  }
}
