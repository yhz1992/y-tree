import { Component, ViewChild } from '@angular/core';
import { YTreeComponent } from 'y-tree';
import { demoMeta } from '../registry';
import {
  basicData as sharedBasicData,
  buildLargeData,
  collectIds,
} from '../data';

@Component({
  selector: 'demo-perf-group',
  template: `
    <demo-card [meta]="m.largeData">
      <div class="demo-toolbar">
        <button type="button" (click)="loadLarge()">生成 13.7 万节点</button>
        <button type="button" (click)="loadSmall()">恢复小数据</button>
        <button type="button" (click)="renameRoot()">重命名根节点</button>
        <button type="button" (click)="moveLastRoot()">移动末根到次位</button>
      </div>
      <y-tree
        #largeTree
        [datasource]="data"
        [showLine]="true"
        [checkable]="true"
        [editable]="true"
        [draggable]="true"
        [expandAll]="true"
        [height]="400"
        (checkedChange)="onCheckedChange($event)"
        (rename)="onRename($event)"
        (add)="onAdd($event)"
        (remove)="onRemove($event)"
        (drop)="onDrop($event)"
      ></y-tree>
      <p class="demo-tip">{{ log }}</p>
      <p class="demo-tip">{{ checkLog }}</p>
      <p class="demo-tip">{{ editLog }}</p>
      <p class="demo-tip">
        虚拟滚动只渲染视口内的节点，DOM
        数量始终保持常量级；勾选联动走增量更新（只重算受影响的祖先链，O(depth)），
        拖拽/编辑只补丁可见列表，不做 13.7 万行全量
        DFS，因此十万级节点下依然流畅。
      </p>
    </demo-card>
  `,
})
export class PerfGroupComponent {
  readonly m = {
    largeData: demoMeta('large-data'),
  };

  @ViewChild('largeTree') largeTree!: YTreeComponent;

  data: Array<any> = buildLargeData();
  log = '已加载 137,256 个节点（6 层 7 叉），全部展开';
  checkLog = '（勾选任意节点，观察父子联动范围与耗时）';
  editLog = '（重命名 / 拖拽 / 按钮操作观察增量更新耗时）';

  private resetCheckLog(): void {
    this.checkLog = '（勾选任意节点，观察父子联动范围与耗时）';
  }

  private resetEditLog(): void {
    this.editLog = '（重命名 / 拖拽 / 按钮操作观察增量更新耗时）';
  }

  loadLarge(): void {
    const start = performance.now();
    const large = buildLargeData();
    const buildCost = performance.now() - start;
    const total = collectIds(large).length;
    this.data = large;
    this.resetCheckLog();
    this.resetEditLog();
    requestAnimationFrame(() => {
      const renderCost = performance.now() - start;
      this.log = `已加载 ${total.toLocaleString()} 个节点（6 层 7 叉）｜构建数据 ${buildCost.toFixed(
        1
      )}ms，含首次渲染共 ${renderCost.toFixed(1)}ms`;
    });
  }

  loadSmall(): void {
    this.data = sharedBasicData;
    this.log = '已恢复为 6 个节点的小数据';
    this.resetCheckLog();
    this.resetEditLog();
  }

  renameRoot(): void {
    const tree = this.largeTree;
    const roots = tree?.getNodes() ?? [];
    if (!tree || roots.length === 0) {
      return;
    }
    const start = performance.now();
    tree.updateNode(roots[0].id, {
      name: `重命名 ${Date.now().toString().slice(-4)}`,
    });
    this.editLog = `程序化重命名 id=${roots[0].id}｜${(
      performance.now() - start
    ).toFixed(2)}ms`;
  }

  moveLastRoot(): void {
    const tree = this.largeTree;
    const roots = tree?.getNodes() ?? [];
    if (!tree || roots.length < 2) {
      return;
    }
    const start = performance.now();
    const ok = tree.moveNode(roots[roots.length - 1].id, roots[0].id, 'next');
    this.editLog = `程序化移动 ${String(roots[roots.length - 1].id)} → ${String(
      roots[0].id
    )} next ${ok ? '成功' : '失败'}｜${(performance.now() - start).toFixed(
      2
    )}ms`;
  }

  onCheckedChange(e: any): void {
    // 从事件时间戳起算：包含「联动重算」本身的耗时
    const cost = performance.now() - e.event.timeStamp;
    const list = this.largeTree?.getCheckedList() ?? [];
    const action = e.checked ? '勾选' : '取消勾选';
    this.checkLog = `${action} id=${
      e.id
    }｜父子联动后全树共 ${list.length.toLocaleString()} 个节点被勾选｜联动耗时 ${cost.toFixed(
      1
    )}ms`;
  }

  onRename(e: any): void {
    const cost = performance.now() - e.event.timeStamp;
    this.editLog = `行内重命名 id=${e.id}｜${cost.toFixed(2)}ms`;
  }

  onAdd(e: any): void {
    const cost = performance.now() - e.event.timeStamp;
    this.editLog = `新增子节点 id=${e.id}｜${cost.toFixed(2)}ms`;
  }

  onRemove(e: any): void {
    const cost = performance.now() - e.event.timeStamp;
    this.editLog = `删除节点 id=${e.id}｜${cost.toFixed(2)}ms`;
  }

  onDrop(e: any): void {
    const cost = performance.now() - e.event.timeStamp;
    this.editLog = `拖拽${e.moveType === 'copy' ? '复制' : '移动'} ${String(
      e.sourceId
    )} → ${String(e.targetId)} ${e.position}｜${cost.toFixed(2)}ms`;
  }
}
