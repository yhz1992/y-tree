import { Component } from '@angular/core';
import { demoMeta } from '../registry';
import { basicData as sharedBasicData } from '../data';

@Component({
  selector: 'demo-interaction-group',
  template: `
    <demo-card [meta]="m.search">
      <div class="demo-toolbar">
        <input
          class="demo-input"
          [(ngModel)]="keyword"
          placeholder="输入关键字，如 节点 1-2"
        />
        <button type="button" (click)="keyword = ''">清空</button>
      </div>
      <y-tree
        [datasource]="basicData"
        [expandAll]="true"
        [searchValue]="keyword"
        [height]="140"
      ></y-tree>
      <p class="demo-tip">
        {{
          keyword
            ? 'searchValue = "' + keyword + '"，仅渲染名称包含该关键字的节点'
            : 'searchValue 为空，渲染全部节点'
        }}
      </p>
    </demo-card>

    <demo-card [meta]="m.events">
      <y-tree
        [datasource]="basicData"
        [checkable]="true"
        [expandAll]="true"
        [height]="140"
        (click)="onNodeClick($event)"
        (dbClick)="onNodeDbClick($event)"
        (contextMenu)="onNodeContextMenu($event)"
        (expandChange)="onNodeExpand($event)"
        (checkedChange)="onNodeChecked($event)"
      ></y-tree>
      <pre class="demo-log">{{ eventLog }}</pre>
    </demo-card>
  `,
})
export class InteractionGroupComponent {
  readonly m = {
    search: demoMeta('search'),
    events: demoMeta('events'),
  };

  readonly basicData = sharedBasicData;

  /* ---------- 搜索过滤 ---------- */
  keyword = '';

  /* ---------- 节点事件 ---------- */
  eventLog = '（点击 / 双击 / 右键节点，或操作展开与勾选）';

  private append(msg: string): void {
    this.eventLog = msg + '\n' + this.eventLog.slice(0, 300);
  }

  onNodeClick(e: any): void {
    this.append(`onClick id=${e.id}`);
  }

  onNodeDbClick(e: any): void {
    this.append(`onDbClick id=${e.id}`);
  }

  onNodeContextMenu(e: any): void {
    this.append(`onContextMenu id=${e.id}`);
  }

  onNodeExpand(e: any): void {
    this.append(`onExpandChange id=${e.id} expand=${e.expand}`);
  }

  onNodeChecked(e: any): void {
    this.append(`onCheckedChange id=${e.id} checked=${e.checked}`);
  }
}
