import { Component, ViewChild } from '@angular/core';
import { YTreeComponent } from 'y-tree';
import { demoMeta } from '../registry';

const iconData: Array<any> = [
  {
    id: '1',
    name: '项目文档',
    expanded: true,
    iconSkin: 'p5',
    children: [
      {
        id: '1-1',
        name: 'README.md',
        icon: 'fa-brands fa-markdown',
        children: [],
      },
      {
        id: '1-2',
        name: '设计稿.png',
        icon: 'fa-regular fa-image',
        children: [],
      },
    ],
  },
  {
    id: '2',
    name: '源码',
    iconOpen: 'fa-solid fa-folder-open',
    iconClose: 'fa-solid fa-folder',
    expanded: true,
    children: [
      { id: '2-1', name: 'index.ts', icon: 'fa-solid fa-code', children: [] },
      { id: '2-2', name: 'utils.ts', icon: 'fa-solid fa-code', children: [] },
    ],
  },
];

const fontData: Array<any> = [
  {
    id: '1',
    name: '普通节点',
    expanded: true,
    children: [
      { id: '1-1', name: '高亮节点', children: [] },
      { id: '1-2', name: '警告节点', children: [] },
    ],
  },
  { id: '2', name: '叶子', children: [] },
];

const titleData: Array<any> = [
  {
    id: '1',
    name: '部门 A',
    title: '总部 · 研发中心',
    expanded: true,
    children: [
      { id: '1-1', name: 'A-1', title: '前端组', children: [] },
      { id: '1-2', name: 'A-2', children: [] },
    ],
  },
  { id: '2', name: '部门 B', children: [] },
];

const basicData: Array<any> = [
  {
    id: '1',
    name: '节点 1',
    expanded: true,
    children: [
      { id: '1-1', name: '节点 1-1', children: [] },
      { id: '1-2', name: '节点 1-2', children: [] },
    ],
  },
  { id: '2', name: '节点 2', children: [] },
  { id: '3', name: '节点 3', children: [] },
];

@Component({
  selector: 'demo-view-group',
  template: `
    <demo-card [meta]="m.nodeIcon">
      <div class="demo-toolbar" style="margin-bottom: 8px">
        <button type="button" (click)="showIcon = !showIcon">
          showIcon={{ showIcon }}
        </button>
      </div>
      <y-tree
        [datasource]="iconData"
        [showIcon]="showIcon"
        [height]="168"
      ></y-tree>
      <p class="demo-tip">
        <code>icon</code> 指定 class / 图片 URL；父节点可用
        <code>iconOpen</code> / <code>iconClose</code>；<code>iconSkin</code>
        渲染为 <code>y-tree-icon-skin-skinName</code>。
        <code>showIcon=false</code> 关闭图标。
      </p>
    </demo-card>

    <demo-card [meta]="m.fontCss">
      <y-tree
        [datasource]="fontData"
        [height]="140"
        [fontCss]="fontCss"
      ></y-tree>
      <p class="demo-tip">
        <code>fontCss</code> 按节点返回样式，可用于搜索命中高亮、标记异常节点。
      </p>
    </demo-card>

    <demo-card [meta]="m.nodeTitle">
      <y-tree [datasource]="titleData" [height]="140"></y-tree>
      <p class="demo-tip">
        鼠标悬停标题显示 <code>title</code>；未设置时回退为
        <code>name</code>。<code>showTitle=false</code> 关闭提示。
      </p>
    </demo-card>

    <demo-card [meta]="m.dblclickExpand">
      <div class="demo-toolbar" style="margin-bottom: 8px">
        <button type="button" (click)="dblEnabled = !dblEnabled">
          dblClickExpand={{ dblEnabled }}
        </button>
      </div>
      <y-tree
        [datasource]="basicData"
        [dblClickExpand]="dblEnabled"
        [height]="140"
        (dbClick)="onDbl($event)"
        (expandChange)="onDblExpand($event)"
      ></y-tree>
      <p class="demo-tip">
        <code>dblClickExpand</code> 默认
        true。开启编辑时双击优先进入重命名，不会折叠。
      </p>
      <pre class="demo-log">{{ dblLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.expandSpeed">
      <div class="demo-toolbar" style="margin-bottom: 8px">
        <button type="button" (click)="speed = 'fast'">
          fast{{ speed === 'fast' ? ' ✓' : '' }}
        </button>
        <button type="button" (click)="speed = 'slow'">
          slow{{ speed === 'slow' ? ' ✓' : '' }}
        </button>
        <button type="button" (click)="speed = 0">
          关闭{{ speed === 0 ? ' ✓' : '' }}
        </button>
      </div>
      <y-tree
        [datasource]="basicData"
        [expandSpeed]="speed"
        [height]="140"
      ></y-tree>
      <p class="demo-tip">
        <code>expandSpeed</code>
        控制展开/折叠过渡；默认关闭，避免大数据虚拟滚动抖动。
      </p>
    </demo-card>

    <demo-card [meta]="m.selectedMulti">
      <div class="demo-toolbar" style="margin-bottom: 8px">
        <button type="button" (click)="toggleMulti()">
          selectedMulti={{ multi }}
        </button>
        <button type="button" (click)="addSelect()">追加选中 1-1</button>
        <button type="button" (click)="clearSelect()">清空选中</button>
      </div>
      <y-tree
        #multiTree
        [datasource]="basicData"
        [selectedMulti]="multi"
        [height]="140"
        (click)="onSelectClick()"
      ></y-tree>
      <p class="demo-tip">
        点击节点高亮选中；<code>selectedMulti=true</code> 时 Ctrl/Cmd
        追加。组件内部维护选中，不再需要外部同步 <code>selectedIds</code>。
      </p>
      <pre class="demo-log">{{ multiLog }}</pre>
    </demo-card>
  `,
})
export class ViewGroupComponent {
  readonly m = {
    nodeIcon: demoMeta('node-icon'),
    fontCss: demoMeta('font-css'),
    nodeTitle: demoMeta('node-title'),
    dblclickExpand: demoMeta('dblclick-expand'),
    expandSpeed: demoMeta('expand-speed'),
    selectedMulti: demoMeta('selected-multi'),
  };

  readonly iconData = iconData;
  readonly fontData = fontData;
  readonly titleData = titleData;
  readonly basicData = basicData;

  showIcon = true;
  dblEnabled = true;
  dblLog = '（双击标题观察是否展开）';
  speed: 'fast' | 'slow' | 0 = 'fast';
  multi = true;
  multiLog = '（点击节点选中，Ctrl/Cmd 追加）';

  @ViewChild('multiTree') multiTree!: YTreeComponent;

  fontCss = (node: any): Record<string, string> => {
    if (node.id === '1-1') return { color: '#1677ff', fontWeight: '700' };
    if (node.id === '1-2') return { color: '#fa541c' };
    return {};
  };

  onDbl(e: any): void {
    this.dblLog = `dbClick ${e.id}`;
  }

  onDblExpand(e: any): void {
    this.dblLog = `expandChange ${e.id} => ${e.expand}`;
  }

  private namesOfSelected(): string {
    const list = this.multiTree?.getSelectedNodes() ?? [];
    return list.map((n: any) => n.name).join('、') || '（无）';
  }

  toggleMulti(): void {
    this.multi = !this.multi;
    this.multiTree?.cancelSelectedNode();
    this.multiLog = '已清空选中';
  }

  addSelect(): void {
    this.multiTree.selectNode('1-1', true);
    this.multiLog = `selectNode("1-1", true)｜当前：${this.namesOfSelected()}`;
  }

  clearSelect(): void {
    this.multiTree.cancelSelectedNode();
    this.multiLog = 'cancelSelectedNode()';
  }

  onSelectClick(): void {
    this.multiLog = `当前：${this.namesOfSelected()}`;
  }
}
