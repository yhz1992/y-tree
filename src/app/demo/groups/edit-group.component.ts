import { Component } from '@angular/core';
import { demoMeta } from '../registry';

/** 编辑演示数据 */
const editTreeData: Array<any> = [
  {
    id: 'a',
    name: 'A',
    expanded: true,
    children: [
      { id: 'a-1', name: 'A-1', children: [] },
      { id: 'a-2', name: 'A-2', children: [] },
    ],
  },
  { id: 'b', name: 'B', children: [] },
  { id: 'c', name: 'C', children: [] },
];

const cloneEditData = () =>
  JSON.parse(JSON.stringify(editTreeData)) as Array<any>;

@Component({
  selector: 'demo-edit-group',
  template: `
    <demo-card [meta]="m.editable">
      <div class="demo-toolbar">
        <label class="demo-check">
          <input type="checkbox" [(ngModel)]="showRename" />
          showRenameBtn
        </label>
        <label class="demo-check">
          <input type="checkbox" [(ngModel)]="showRemove" />
          showRemoveBtn
        </label>
        <label class="demo-check">
          <input type="checkbox" [(ngModel)]="showAdd" />
          showAddBtn
        </label>
      </div>
      <y-tree
        [datasource]="editData"
        [expandAll]="true"
        [editable]="true"
        [showRenameBtn]="showRename"
        [showRemoveBtn]="showRemove"
        [showAddBtn]="showAdd"
        [height]="140"
      ></y-tree>
      <p class="demo-tip">
        鼠标悬停在节点上显示操作按钮，三个开关分别控制重命名 / 删除 / 新增按钮。
      </p>
    </demo-card>

    <demo-card [meta]="m.rename">
      <y-tree
        [datasource]="editData"
        [expandAll]="true"
        [editable]="true"
        [height]="140"
        [beforeEditName]="beforeEditName"
        [beforeRename]="beforeRename"
        (rename)="onRename($event)"
      ></y-tree>
      <p class="demo-tip">
        双击标题或点击笔按钮进入编辑，Enter 提交 / Esc 取消 / 失焦提交。
      </p>
      <pre class="demo-log">{{ renameLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.remove">
      <y-tree
        [datasource]="removeData"
        [expandAll]="true"
        [editable]="true"
        [removeConfirm]="true"
        [height]="140"
        (remove)="onRemove($event)"
      ></y-tree>
      <div class="demo-toolbar" style="margin: 10px 0 0">
        <button type="button" (click)="resetRemoveData()">重置数据</button>
      </div>
      <pre class="demo-log">{{ removeLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.add">
      <y-tree
        [datasource]="addData"
        [expandAll]="true"
        [editable]="true"
        [height]="140"
        [beforeAdd]="beforeAdd"
        (add)="onAdd($event)"
      ></y-tree>
      <div class="demo-toolbar" style="margin: 10px 0 0">
        <button type="button" (click)="resetAddData()">重置数据</button>
      </div>
      <pre class="demo-log">{{ addLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.nodeExtra">
      <y-tree [datasource]="editData" [expandAll]="true" [height]="140">
        <ng-template #nodeExtra let-node>
          <span class="demo-node-tag">
            {{
              node.childIds.length === 0
                ? '叶子'
                : node.childIds.length + ' 个子节点'
            }}
          </span>
        </ng-template>
      </y-tree>
      <p class="demo-tip">
        nodeExtra 模板接收节点数据，可用来展示标签、徽标、操作入口等。
      </p>
    </demo-card>
  `,
})
export class EditGroupComponent {
  readonly m = {
    editable: demoMeta('editable'),
    rename: demoMeta('rename'),
    remove: demoMeta('remove'),
    add: demoMeta('add'),
    nodeExtra: demoMeta('node-extra'),
  };

  readonly editData = editTreeData;

  /* ---------- 编辑按钮配置 ---------- */
  showRename = true;
  showRemove = true;
  showAdd = true;

  /* ---------- 重命名 ---------- */
  renameLog = '（双击节点标题，或点击笔按钮进入编辑）';

  private appendRename(msg: string): void {
    this.renameLog = msg + '\n' + this.renameLog.slice(0, 300);
  }

  beforeEditName = (e: any): boolean => {
    this.appendRename(`beforeEditName id=${e.id}`);
    return true;
  };

  beforeRename = (e: any): boolean => {
    this.appendRename(`beforeRename "${e.oldName}" -> "${e.newName}"`);
    return true;
  };

  onRename(e: any): void {
    this.appendRename(`onRename id=${e.id} -> "${e.newName}"`);
  }

  /* ---------- 删除 ---------- */
  removeData: Array<any> = cloneEditData();
  removeLog = '（点击垃圾桶按钮，气泡中确认删除）';

  onRemove(e: any): void {
    this.removeLog =
      `onRemove 已删除 id=${e.id}\n` + this.removeLog.slice(0, 300);
  }

  resetRemoveData(): void {
    this.removeData = cloneEditData();
    this.removeLog = '数据已重置';
  }

  /* ---------- 新增 ---------- */
  addData: Array<any> = cloneEditData();
  addLog = '（点击加号按钮新增子节点，自动进入编辑态）';

  beforeAdd = (e: any): boolean => {
    this.addLog = `beforeAdd 父节点 id=${e.id}\n` + this.addLog.slice(0, 300);
    return true;
  };

  onAdd(e: any): void {
    this.addLog =
      `onAdd 父=${e.parentId} 新节点=${e.id}\n` + this.addLog.slice(0, 300);
  }

  resetAddData(): void {
    this.addData = cloneEditData();
    this.addLog = '数据已重置';
  }
}
