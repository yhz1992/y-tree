import { Component, ViewChild } from '@angular/core';
import { YTreeComponent } from 'y-tree';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
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

  @ViewChild(YTreeComponent) tree!: YTreeComponent;

  onClick(payload: any) {
    console.log('click', payload.id);
  }

  onDbClick(payload: any) {
    console.log('dbClick', payload.id);
  }

  onContextMenu(payload: any) {
    console.log('contextMenu', payload.id);
  }

  onExpandChange(payload: any) {
    console.log('expandChange', payload.id, payload.expand);
  }

  onCheckedChange(payload: any) {
    console.log('checkedChange', payload.id, payload.checked);
  }

  printChecked() {
    console.log('checkedList', this.tree?.getCheckedList());
  }

  /**
   * 生成 10 万节点（6 层）演示数据
   */
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
