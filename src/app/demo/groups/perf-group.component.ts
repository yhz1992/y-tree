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
      </div>
      <y-tree
        #largeTree
        [datasource]="data"
        [showLine]="true"
        [checkable]="true"
        [expandAll]="true"
        [height]="400"
        (checkedChange)="onCheckedChange($event)"
      ></y-tree>
      <p class="demo-tip">{{ log }}</p>
      <p class="demo-tip">{{ checkLog }}</p>
      <p class="demo-tip">
        虚拟滚动只渲染视口内的节点，DOM
        数量始终保持常量级；勾选联动走增量更新（只重算受影响的祖先链，O(depth)），
        因此十万级节点下的连接线、勾选依然流畅。
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

  private resetCheckLog(): void {
    this.checkLog = '（勾选任意节点，观察父子联动范围与耗时）';
  }

  loadLarge(): void {
    const start = performance.now();
    const large = buildLargeData();
    const buildCost = performance.now() - start;
    const total = collectIds(large).length;
    this.data = large;
    this.resetCheckLog();
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
}
