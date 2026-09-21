import { Component, ViewChild } from '@angular/core';
import { YTreeComponent } from 'y-tree';
import { demoMeta } from '../registry';
import { basicData } from '../data';

@Component({
  selector: 'demo-api-group',
  template: `
    <demo-card [meta]="m.queryNodes">
      <y-tree #queryTree [datasource]="basicData" [height]="140"></y-tree>
      <div class="demo-toolbar" style="margin: 10px 0 0">
        <button type="button" (click)="doGetNodes()">getNodes</button>
        <button type="button" (click)="doExact()">精确匹配 1-1</button>
        <button type="button" (click)="doFuzzy()">模糊匹配 1-</button>
        <button type="button" (click)="doIndex()">兄弟下标 1-2</button>
      </div>
      <p class="demo-tip">
        <code>getNodes</code> 返回根节点；<code>getNodesByParam</code>
        精确匹配，<code>getNodesByParamFuzzy</code> 忽略大小写；<code
          >getNodeIndex</code
        >
        返回兄弟下标，找不到为 -1。
      </p>
      <pre class="demo-log">{{ queryLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.transform">
      <y-tree #transformTree [datasource]="basicData" [height]="140"></y-tree>
      <div class="demo-toolbar" style="margin: 10px 0 0">
        <button type="button" (click)="doToArray()">当前树 → 扁平</button>
        <button type="button" (click)="doToNested()">当前树 → 嵌套</button>
        <button type="button" (click)="doFromFlat()">扁数据 → 嵌套</button>
      </div>
      <p class="demo-tip">
        <code>transformToArray</code> DFS 扁平；<code
          >transformToTreeNodes</code
        >
        还原嵌套；<code>transformToTreeNodesFromFlat</code>
        不碰当前树，仅把 id/pId 列表转嵌套。
      </p>
      <pre class="demo-log">{{ transformLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.updateNode">
      <y-tree
        #updateTree
        [datasource]="basicData"
        [checkable]="true"
        [height]="140"
      ></y-tree>
      <div class="demo-toolbar" style="margin: 10px 0 0">
        <button type="button" (click)="doRename()">改名 1-1</button>
        <button type="button" (click)="doHide()">隐藏节点 2</button>
        <button type="button" (click)="doShow()">显示节点 2</button>
      </div>
      <p class="demo-tip">
        <code>updateNode</code> 只改 name/title/icon/disabled/hide
        等展示字段；<code>id</code> / <code>pId</code> /
        <code>childIds</code> 会被忽略。<code>checked</code> /
        <code>selected</code> 走既有状态机。
      </p>
      <pre class="demo-log">{{ updateLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.expandNode">
      <y-tree #expandTree [datasource]="basicData" [height]="140"></y-tree>
      <div class="demo-toolbar" style="margin: 10px 0 0">
        <button type="button" (click)="doCollapse()">折叠节点 1</button>
        <button type="button" (click)="doExpand()">展开节点 1</button>
        <button type="button" (click)="doExpandParent()">展开 1-1 祖先</button>
      </div>
      <p class="demo-tip">
        <code>expandNode(id, expand?, sonSign?)</code>：<code>expand</code>
        缺省切换；<code>sonSign</code> 递归子孙。<code
          >expandCollapseParentNode</code
        >
        沿祖先链展开/收起，使目标可见。
      </p>
      <pre class="demo-log">{{ expandLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.beforeHooks">
      <y-tree
        [datasource]="basicData"
        [checkable]="true"
        [height]="140"
        [beforeClick]="beforeClick"
        [beforeExpand]="beforeExpand"
        [beforeCollapse]="beforeCollapse"
        [beforeCheck]="beforeCheck"
        (click)="onBeforeClick($event)"
      ></y-tree>
      <p class="demo-tip">
        <code>beforeClick</code> 返回 false 取消选中与 click；<code
          >beforeExpand</code
        >
        /
        <code>beforeCollapse</code>
        拦箭头、双击展开、<code>expandNode</code>；<code>beforeCheck</code>
        只拦勾选框，程序化 <code>checkNode</code> 不走。
      </p>
      <pre class="demo-log">{{ beforeLog }}</pre>
    </demo-card>
  `,
})
export class ApiGroupComponent {
  readonly m = {
    queryNodes: demoMeta('query-nodes'),
    transform: demoMeta('transform'),
    updateNode: demoMeta('update-node'),
    expandNode: demoMeta('expand-node'),
    beforeHooks: demoMeta('before-hooks'),
  };

  readonly basicData = basicData;

  @ViewChild('queryTree') queryTree!: YTreeComponent;
  @ViewChild('transformTree') transformTree!: YTreeComponent;
  @ViewChild('updateTree') updateTree!: YTreeComponent;
  @ViewChild('expandTree') expandTree!: YTreeComponent;

  queryLog = '（点按钮查询当前树）';
  transformLog = '（点按钮看扁平 / 嵌套结果）';
  updateLog = '（点按钮热更新展示字段）';
  expandLog = '（先折叠节点 1，再程序化展开）';
  beforeLog = '点节点 2 拦点击；折叠节点 1 拦；勾选 1-1 拦';

  private names(list: Array<{ name: string }>): string {
    return list.map((n) => n.name).join('、') || '（无）';
  }

  doGetNodes(): void {
    this.queryLog = `getNodes()｜根：${this.names(this.queryTree.getNodes())}`;
  }

  doExact(): void {
    this.queryLog = `getNodesByParam("name","节点 1-1")｜${this.names(
      this.queryTree.getNodesByParam('name', '节点 1-1')
    )}`;
  }

  doFuzzy(): void {
    this.queryLog = `getNodesByParamFuzzy("name","1-")｜${this.names(
      this.queryTree.getNodesByParamFuzzy('name', '1-')
    )}`;
  }

  doIndex(): void {
    this.queryLog = `getNodeIndex("1-2") = ${this.queryTree.getNodeIndex(
      '1-2'
    )}`;
  }

  doToArray(): void {
    const list = this.transformTree.transformToArray();
    this.transformLog = `transformToArray()｜${list
      .map((n) => n.id)
      .join(' → ')}`;
  }

  doToNested(): void {
    const nested = this.transformTree.transformToTreeNodes();
    const summarize = (nodes: Array<any>): string =>
      nodes
        .map(
          (n) =>
            `${n.name}[${(n.children ?? []).map((c: any) => c.name).join(',')}]`
        )
        .join('；');
    this.transformLog = `transformToTreeNodes()｜${summarize(nested)}`;
  }

  doFromFlat(): void {
    const nested = this.transformTree.transformToTreeNodesFromFlat([
      { id: 'a', name: 'A', pId: '' },
      { id: 'a-1', name: 'A-1', pId: 'a' },
      { id: 'b', name: 'B', pId: '' },
    ]);
    this.transformLog = `fromFlat([A,A-1,B])｜根 ${nested
      .map((n) => n.name)
      .join('、')}，A 子 ${
      nested[0]?.children?.map((c: any) => c.name).join('、') || '（无）'
    }`;
  }

  doRename(): void {
    const ok = this.updateTree.updateNode('1-1', {
      name: '节点 1-1（已改名）',
    });
    this.updateLog = `updateNode("1-1", { name }) => ${ok}`;
  }

  doHide(): void {
    const ok = this.updateTree.updateNode('2', { hide: true });
    this.updateLog = `updateNode("2", { hide: true }) => ${ok}（节点 2 隐藏）`;
  }

  doShow(): void {
    const ok = this.updateTree.updateNode('2', { hide: false });
    this.updateLog = `updateNode("2", { hide: false }) => ${ok}`;
  }

  doCollapse(): void {
    const ok = this.expandTree.expandNode('1', false);
    this.expandLog = `expandNode("1", false) => ${ok}`;
  }

  doExpand(): void {
    const ok = this.expandTree.expandNode('1', true);
    this.expandLog = `expandNode("1", true) => ${ok}`;
  }

  doExpandParent(): void {
    this.expandTree.expandNode('1', false);
    const ok = this.expandTree.expandCollapseParentNode('1-1', true);
    this.expandLog = `expandCollapseParentNode("1-1", true) => ${ok}`;
  }

  beforeClick = (e: any): boolean => {
    if (e.id === '2') {
      this.beforeLog = 'beforeClick 拦截节点 2，不选中、不发 click';
      return false;
    }
    this.beforeLog = `click ${e.id}`;
    return true;
  };

  beforeExpand = (e: any): boolean => {
    this.beforeLog = `beforeExpand ${e.id}`;
    return true;
  };

  beforeCollapse = (e: any): boolean => {
    if (e.id === '1') {
      this.beforeLog = 'beforeCollapse 拦截节点 1，保持展开';
      return false;
    }
    this.beforeLog = `beforeCollapse ${e.id}`;
    return true;
  };

  beforeCheck = (e: any): boolean => {
    if (e.id === '1-1') {
      this.beforeLog = 'beforeCheck 拦截节点 1-1，勾选框不变';
      return false;
    }
    this.beforeLog = `beforeCheck ${e.id} => ${e.checked}`;
    return true;
  };

  onBeforeClick(e: any): void {
    this.beforeLog = `${this.beforeLog}｜onClick ${e.id}`;
  }
}
