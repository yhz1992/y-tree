import { Component, ViewChild } from '@angular/core';
import { YTreeComponent } from 'y-tree';
import { demoMeta } from '../registry';

const radioData: Array<any> = [
  {
    id: 'A',
    name: '部门 A',
    expanded: true,
    children: [
      { id: 'A-1', name: 'A-1', children: [] },
      { id: 'A-2', name: 'A-2', children: [] },
    ],
  },
  {
    id: 'B',
    name: '部门 B',
    expanded: true,
    children: [
      { id: 'B-1', name: 'B-1', children: [] },
      { id: 'B-2', name: 'B-2', children: [] },
    ],
  },
];

const chkboxData: Array<any> = [
  {
    id: '1',
    name: '节点 1',
    expanded: true,
    children: [
      { id: '1-1', name: '节点 1-1', children: [] },
      { id: '1-2', name: '节点 1-2', children: [] },
      {
        id: '1-3',
        name: '节点 1-3',
        expanded: true,
        children: [
          { id: '1-3-1', name: '节点 1-3-1', children: [] },
          { id: '1-3-2', name: '节点 1-3-2', children: [] },
        ],
      },
    ],
  },
  { id: '2', name: '节点 2', children: [] },
];

@Component({
  selector: 'demo-check-group',
  template: `
    <demo-card [meta]="m.radioAll">
      <y-tree
        #radioAllTree
        [datasource]="radioData"
        [checkable]="true"
        chkStyle="radio"
        radioType="all"
        [height]="196"
        (checkedChange)="onRadioAll($event)"
      ></y-tree>
      <p class="demo-tip">
        <code>chkStyle="radio"</code> +
        <code>radioType="all"</code
        >：整棵树只能勾选一个节点，勾选新节点会清掉旧的。
      </p>
      <pre class="demo-log">{{ radioAllLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.radioLevel">
      <y-tree
        #radioLevelTree
        [datasource]="radioData"
        [checkable]="true"
        chkStyle="radio"
        radioType="level"
        [height]="196"
        (checkedChange)="onRadioLevel($event)"
      ></y-tree>
      <p class="demo-tip">
        <code>radioType="level"</code>：同一父节点下的兄弟互斥；不同层级（如 A
        与 A-1）可以同时勾选。
      </p>
      <pre class="demo-log">{{ radioLevelLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.chkboxType">
      <div class="demo-toolbar" style="margin-bottom: 8px">
        <button type="button" (click)="setMode('ps')">
          双向 ps{{ mode === 'ps' ? ' ✓' : '' }}
        </button>
        <button type="button" (click)="setMode('s')">
          只子孙 s{{ mode === 's' ? ' ✓' : '' }}
        </button>
        <button type="button" (click)="setMode('p')">
          只祖先 p{{ mode === 'p' ? ' ✓' : '' }}
        </button>
        <button type="button" (click)="setMode('none')">
          不联动{{ mode === 'none' ? ' ✓' : '' }}
        </button>
      </div>
      <y-tree
        #chkboxTree
        [datasource]="chkboxData"
        [checkable]="true"
        [chkboxType]="chkboxType"
        [height]="224"
        (checkedChange)="onChkbox($event)"
      ></y-tree>
      <p class="demo-tip">
        <code>chkboxType</code> 控制联动方向：<code>s</code> 只改子孙、<code
          >p</code
        >
        只改祖先、空字符串完全不联动。
      </p>
      <pre class="demo-log">{{ chkboxLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.checkAll">
      <y-tree
        #checkAllTree
        [datasource]="chkboxData"
        [checkable]="true"
        [height]="224"
        (checkedChange)="refreshAll('勾选变化')"
      ></y-tree>
      <div class="demo-toolbar" style="margin: 10px 0 0">
        <button type="button" (click)="doCheckAll()">全选</button>
        <button type="button" (click)="doCancelAll()">全不选</button>
      </div>
      <p class="demo-tip">
        <code>checkAllNodes(true)</code> 全选，<code>cancelAllNodes()</code>
        全不选。radio 模式下全选无效。
      </p>
      <pre class="demo-log">{{ checkAllLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.checkNode">
      <y-tree
        #checkNodeTree
        [datasource]="chkboxData"
        [checkable]="true"
        [height]="224"
      ></y-tree>
      <div class="demo-toolbar" style="margin: 10px 0 0">
        <button type="button" (click)="doCheckNode()">勾选「节点 1-1」</button>
        <button type="button" (click)="doShowChanged()">查看变更</button>
      </div>
      <p class="demo-tip">
        <code>checkNode</code> 走 API 通道，可改 disabled 节点；<code
          >getChangeCheckedNodes</code
        >
        对比 init 时的勾选快照。
      </p>
      <pre class="demo-log">{{ checkNodeLog }}</pre>
    </demo-card>
  `,
})
export class CheckGroupComponent {
  readonly m = {
    radioAll: demoMeta('radio-all'),
    radioLevel: demoMeta('radio-level'),
    chkboxType: demoMeta('chkbox-type'),
    checkAll: demoMeta('check-all'),
    checkNode: demoMeta('check-node'),
  };

  readonly radioData = radioData;
  readonly chkboxData = chkboxData;

  @ViewChild('radioAllTree') radioAllTree!: YTreeComponent;
  @ViewChild('radioLevelTree') radioLevelTree!: YTreeComponent;
  @ViewChild('chkboxTree') chkboxTree!: YTreeComponent;
  @ViewChild('checkAllTree') checkAllTree!: YTreeComponent;
  @ViewChild('checkNodeTree') checkNodeTree!: YTreeComponent;

  radioAllLog = '（点击单选，整树只能勾选一个）';
  radioLevelLog = '（同级互斥，跨级可并存）';
  chkboxLog = '（切换联动方向后勾选观察）';
  checkAllLog = '（点击全选 / 全不选）';
  checkNodeLog = '（先勾选几个节点，再点「查看变更」）';

  mode: 'ps' | 's' | 'p' | 'none' = 's';
  chkboxType: { Y: string; N: string } = { Y: 's', N: 's' };

  private namesOf(tree: YTreeComponent | undefined): string {
    const list = tree?.getCheckedList() ?? [];
    return list.map((n) => n.name).join('、') || '（无）';
  }

  onRadioAll(e: any): void {
    this.radioAllLog = `勾选 ${e.id}｜当前：${this.namesOf(this.radioAllTree)}`;
  }

  onRadioLevel(e: any): void {
    this.radioLevelLog = `勾选 ${e.id}｜当前：${this.namesOf(
      this.radioLevelTree
    )}`;
  }

  setMode(next: 'ps' | 's' | 'p' | 'none'): void {
    this.mode = next;
    if (next === 'none') this.chkboxType = { Y: '', N: '' };
    else if (next === 'ps') this.chkboxType = { Y: 'ps', N: 'ps' };
    else if (next === 's') this.chkboxType = { Y: 's', N: 's' };
    else this.chkboxType = { Y: 'p', N: 'p' };
  }

  onChkbox(e: any): void {
    this.chkboxLog = `勾选 ${e.id}=${e.checked}｜当前：${this.namesOf(
      this.chkboxTree
    )}`;
  }

  refreshAll(action: string): void {
    this.checkAllLog = `${action}｜当前：${this.namesOf(this.checkAllTree)}`;
  }

  doCheckAll(): void {
    this.checkAllTree.checkAllNodes(true);
    this.refreshAll('checkAllNodes(true)');
  }

  doCancelAll(): void {
    this.checkAllTree.cancelAllNodes();
    this.refreshAll('cancelAllNodes()');
  }

  doCheckNode(): void {
    const ok = this.checkNodeTree.checkNode('1-1', true);
    this.checkNodeLog = `checkNode("1-1", true) => ${ok}｜当前：${this.namesOf(
      this.checkNodeTree
    )}`;
  }

  doShowChanged(): void {
    const changed = this.checkNodeTree.getChangeCheckedNodes();
    this.checkNodeLog = `getChangeCheckedNodes() => ${
      changed.map((n) => n.name).join('、') || '（无变更）'
    }`;
  }
}
