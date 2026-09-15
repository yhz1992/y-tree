import { Component, ViewChild } from '@angular/core';
import { YTreeComponent } from 'y-tree';
import { demoMeta } from '../registry';
import { dragData as sharedDragData } from '../data';

@Component({
  selector: 'demo-drag-group',
  template: `
    <demo-card [meta]="m.dragMove">
      <y-tree
        [datasource]="dragData"
        [showLine]="true"
        [expandAll]="true"
        [draggable]="true"
        [height]="140"
        (nodeChange)="onMove($event)"
      ></y-tree>
      <p class="demo-tip">
        拖到节点中间：移入其内部（inner）；拖到节点上 / 下边缘：移到其前 /
        后（prev / next）。
      </p>
      <pre class="demo-log">{{ moveLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.dragCopy">
      <y-tree
        [datasource]="dragData"
        [showLine]="true"
        [expandAll]="true"
        [draggable]="true"
        [isCopy]="true"
        [height]="140"
        (drop)="onCopyDrop($event)"
        (nodeChange)="onCopyNodeChange($event)"
      ></y-tree>
      <p class="demo-tip">
        按住 Ctrl / Cmd 拖拽会复制节点（含整棵子树、id 重映射），不按则为移动。
      </p>
      <pre class="demo-log">{{ copyLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.dragLimit">
      <y-tree
        [datasource]="dragData"
        [showLine]="true"
        [expandAll]="true"
        [draggable]="true"
        [allowDrag]="allowDrag"
        [allowDrop]="allowDrop"
        [minMoveSize]="6"
        [height]="140"
        (nodeChange)="onLimitMove($event)"
      ></y-tree>
      <p class="demo-tip">
        allowDrag / allowDrop 按节点与落点精细控制；minMoveSize
        设置触发拖拽的最小移动距离。
      </p>
      <pre class="demo-log">{{ limitLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.dragCallbacks">
      <y-tree
        [datasource]="dragData"
        [showLine]="true"
        [expandAll]="true"
        [draggable]="true"
        [height]="140"
        [beforeDrag]="beforeDrag"
        [beforeDrop]="beforeDrop"
        (drag)="onDrag($event)"
        (dragMove)="onDragMove($event)"
        (drop)="onDrop($event)"
        (nodeChange)="onCallbackNodeChange($event)"
      ></y-tree>
      <pre class="demo-log">{{ callbackLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.dragApi">
      <y-tree
        #apiTree
        [datasource]="apiData"
        [showLine]="true"
        [expandAll]="true"
        [height]="140"
      ></y-tree>
      <div class="demo-toolbar" style="margin: 10px 0 0">
        <button type="button" (click)="apiMove()">moveNode(B → A prev)</button>
        <button type="button" (click)="apiCopy()">copyNode(C → A next)</button>
      </div>
      <p class="demo-tip">{{ apiLog }}</p>
    </demo-card>
  `,
})
export class DragGroupComponent {
  readonly m = {
    dragMove: demoMeta('drag-move'),
    dragCopy: demoMeta('drag-copy'),
    dragLimit: demoMeta('drag-limit'),
    dragCallbacks: demoMeta('drag-callbacks'),
    dragApi: demoMeta('drag-api'),
  };

  readonly dragData = sharedDragData;

  /* ---------- 拖拽移动 ---------- */
  moveLog = '（拖拽节点到目标位置，观察三种落点）';

  onMove(e: any): void {
    this.moveLog = `onNodeChange: ${e.sourceId} → ${e.targetId}（position = ${e.position}）`;
  }

  /* ---------- 拖拽复制 ---------- */
  copyLog = '（按住 Ctrl / Cmd 拖拽节点，观察复制效果）';

  onCopyDrop(e: any): void {
    this.copyLog = `onDrop: moveType = ${e.moveType}`;
  }

  onCopyNodeChange(e: any): void {
    this.copyLog += `｜${e.sourceId} → ${e.targetId} (${e.position})`;
  }

  /* ---------- 拖拽限制 ---------- */
  limitLog = '（只有叶子节点可拖拽，且不能拖到 B）';

  allowDrag = (node: any): boolean => node.childIds.length === 0;
  allowDrop = (_sourceId: any, targetId: any): boolean => targetId !== 'b';

  onLimitMove(e: any): void {
    this.limitLog = `onNodeChange: ${e.sourceId} → ${e.targetId} (${e.position})`;
  }

  /* ---------- 拖拽回调 ---------- */
  callbackLog = '（拖拽节点观察回调触发顺序）';

  private append(msg: string): void {
    this.callbackLog = msg + '\n' + this.callbackLog.slice(0, 400);
  }

  beforeDrag = (e: any): boolean => {
    this.append(`beforeDrag id=${e.sourceId}`);
    return true;
  };

  beforeDrop = (e: any): boolean => {
    this.append(`beforeDrop ${e.sourceId} → ${e.targetId} (${e.position})`);
    return true;
  };

  onDrag(e: any): void {
    this.append(`onDrag id=${e.sourceId} copy=${e.isCopy}`);
  }

  onDragMove(e: any): void {
    this.append(`onDragMove ${e.sourceId} → ${e.targetId} (${e.position})`);
  }

  onDrop(e: any): void {
    this.append(
      `onDrop ${e.sourceId} → ${e.targetId} (${e.position}) moveType=${e.moveType}`
    );
  }

  onCallbackNodeChange(e: any): void {
    this.append(`onNodeChange ${e.sourceId} → ${e.targetId} (${e.position})`);
  }

  /* ---------- 程序化拖拽 ---------- */
  @ViewChild('apiTree') apiTree!: YTreeComponent;
  apiData: Array<any> = [...sharedDragData];
  apiLog = '（点击按钮以程序方式移动 / 复制节点）';

  apiMove(): void {
    this.apiData = [...sharedDragData];
    // 等待变更检测重建 service 后再执行操作
    setTimeout(() => {
      const ok = this.apiTree.moveNode('b', 'a', 'prev');
      this.apiLog = `moveNode("b", "a", "prev") => ${ok}`;
    });
  }

  apiCopy(): void {
    this.apiData = [...sharedDragData];
    setTimeout(() => {
      const newId = this.apiTree.copyNode('c', 'a', 'next');
      this.apiLog = `copyNode("c", "a", "next") => ${newId}`;
    });
  }
}
