import { Component, ViewChild } from '@angular/core';
import { YTreeComponent } from 'y-tree';

const smallData: Array<any> = [
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  smallData = smallData;
  datasource: Array<any> = [
    {
      id: '1',
      name: '节点1',
      expanded: true,
      children: [
        { id: '1-1', name: '节点1-1', children: [] },
        { id: '1-2', name: '节点1-2', checked: true, children: [] },
        {
          id: '1-3',
          name: '节点1-3',
          children: [
            { id: '1-3-1', name: '节点1-3-1', children: [] },
            { id: '1-3-2', name: '节点1-3-2', children: [] },
          ],
        },
      ],
    },
    { id: '2', name: '节点2', nocheck: true, children: [] },
    { id: '3', name: '节点3', disabled: true, children: [] },
  ];

  @ViewChild('apiTree') apiTree!: YTreeComponent;

  log1 = '（按住 Ctrl 拖拽节点到其他位置观察复制效果）';
  log2 = '（拖拽节点观察回调日志）';
  log3 = '（只有叶子节点可拖，不能拖到 B 上）';
  log4 = '（点击下方按钮执行程序化移动/复制）';

  // 程序化 API：每次操作前重置数据（保证可重复演示且效果明显）
  apiTreeData: Array<any> = [...smallData];

  allowDrag = (node: any) => node.childIds.length === 0;
  allowDrop = (_sid: any, tid: any, _pos: any) => tid !== 'b';

  onCopyNodeChange(e: any) {
    this.log1 = `nodeChange: ${e.sourceId} -> ${e.targetId} (${e.position})`;
  }
  onCopyDrop(e: any) {
    this.log1 += ` | moveType=${e.moveType}`;
  }

  onDrag(e: any) {
    this.log2 =
      `drag id=${e.sourceId} copy=${e.isCopy}\n` + this.log2.slice(0, 400);
  }
  onDragMove(e: any) {
    this.log2 =
      `dragMove ${e.sourceId} -> ${e.targetId} (${e.position})\n` +
      this.log2.slice(0, 400);
  }
  onDrop(e: any) {
    this.log2 =
      `drop ${e.sourceId} -> ${e.targetId} (${e.position}) copy=${e.isCopy}\n` +
      this.log2.slice(0, 400);
  }
  onCbNodeChange(e: any) {
    this.log2 =
      `nodeChange ${e.sourceId} -> ${e.targetId} (${e.position})\n` +
      this.log2.slice(0, 400);
  }

  onCtlNodeChange(e: any) {
    this.log3 = `nodeChange: ${e.sourceId} -> ${e.targetId} (${e.position})`;
  }

  apiMove() {
    this.apiTreeData = [...smallData];
    // 等待变更检测重建 service 后再执行操作
    setTimeout(() => {
      const ok = this.apiTree?.moveNode('b', 'a', 'prev');
      this.log4 = `moveNode("b","a","prev") => ${ok}`;
    });
  }
  apiCopy() {
    this.apiTreeData = [...smallData];
    setTimeout(() => {
      const newId = this.apiTree?.copyNode('c', 'a', 'next');
      this.log4 = `copyNode("c","a","next") => newId=${newId}`;
    });
  }

  onNodeChange(e: any) {
    console.log('nodeChange', e.sourceId, '->', e.targetId, e.position);
  }
  onDragLog(e: any) {
    console.log('drag', e.sourceId);
  }
  onDropLog(e: any) {
    console.log('drop', e.sourceId, '->', e.targetId, e.moveType);
  }

  generateLargeData(): void {
    this.datasource = this.buildLargeData();
  }

  private buildLargeData(): Array<any> {
    let id = 0;
    const depth = 6;
    const perNode = 7;
    const build = (level: number): Array<any> => {
      const nodes: Array<any> = [];
      for (let i = 0; i < perNode; i++) {
        const node: any = { id: id++, name: `节点${level}-${i}`, children: [] };
        if (level < depth) {
          node.children = build(level + 1);
        }
        nodes.push(node);
      }
      return nodes;
    };
    return build(1);
  }
}
