import { Component, ViewChild } from '@angular/core';
import { YTreeComponent } from 'y-tree';
import { demoMeta } from '../registry';

/** demo 内统一用 any（demo 应用不 import 库外 common，避免 TS rootDir 报错） */
type YTreeNode = any;

/** 模拟后端接口：延迟返回子节点数据 */
function mockFetch(parentId: string | number): Promise<Array<YTreeNode>> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const prefix = String(parentId);
      const children: Array<YTreeNode> = Array.from({ length: 3 }, (_, i) => ({
        id: `${prefix}-${i + 1}`,
        name: `子节点 ${prefix}-${i + 1}`,
        children: [],
      }));
      resolve(children);
    }, 600);
  });
}

/** 加载较慢的接口，用于观察 loading 图标 */
function slowFetch(parentId: string | number): Promise<Array<YTreeNode>> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(
        Array.from({ length: 3 }, (_, i) => ({
          id: `${parentId}-${i + 1}`,
          name: `${parentId}-${i + 1}`,
          children: [],
        })) as Array<YTreeNode>
      );
    }, 2000);
  });
}

@Component({
  selector: 'demo-async-group',
  template: `
    <demo-card [meta]="m.lazyLoad">
      <y-tree
        [datasource]="lazyData"
        [lazy]="true"
        [loadData]="lazyLoadData"
        [showLine]="true"
        [height]="260"
        [beforeAsync]="lazyBeforeAsync"
        (asyncSuccess)="onLazySuccess($event)"
      ></y-tree>
      <p class="demo-tip">
        <code>isParent: true</code> 标记有子节点但尚未加载，首次展开时调用
        <code>loadData</code> 拉取数据；加载完成后自动展开。
      </p>
      <pre class="demo-log">{{ lazyLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.asyncLoading">
      <y-tree
        [datasource]="loadingData"
        [lazy]="true"
        [loadData]="loadingLoadData"
        [showLine]="true"
        [height]="200"
        (asyncSuccess)="onLoadingSuccess($event)"
      ></y-tree>
      <p class="demo-tip">
        加载期间箭头变为旋转 loading 图标，该状态下重复点击不会重复发起请求。
      </p>
      <pre class="demo-log">{{ loadingLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.asyncCallbacks">
      <y-tree
        [datasource]="callbackData"
        [lazy]="true"
        [loadData]="callbackLoadData"
        [showLine]="true"
        [height]="220"
        [beforeAsync]="callbackBeforeAsync"
        (asyncSuccess)="onCallbackSuccess($event)"
        (asyncError)="onCallbackError($event)"
      ></y-tree>
      <p class="demo-tip">
        <code>beforeAsync</code> 返回 false
        可取消加载；失败时节点不展开，箭头复位可重试。
      </p>
      <pre class="demo-log">{{ callbackLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.asyncRefresh">
      <y-tree
        #refreshTree
        [datasource]="refreshData"
        [lazy]="true"
        [loadData]="refreshLoadData"
        [showLine]="true"
        [height]="240"
      ></y-tree>
      <div class="demo-toolbar" style="margin: 10px 0 0">
        <button type="button" (click)="nextRound()">
          换一批数据（第 {{ round + 1 }} 批）
        </button>
        <button type="button" (click)="doRefresh()">
          刷新「节点 1」的子节点
        </button>
      </div>
      <p class="demo-tip">
        先展开节点
        1，再点「换一批数据」改变数据源，最后点刷新即可看到子树被整体替换。
      </p>
      <pre class="demo-log">{{ refreshLog }}</pre>
    </demo-card>

    <demo-card [meta]="m.asyncRoot">
      <y-tree
        [datasource]="emptyData"
        [lazy]="true"
        [loadData]="rootLoadData"
        [showLine]="true"
        [height]="200"
        (asyncSuccess)="onRootSuccess($event)"
      ></y-tree>
      <p class="demo-tip">
        datasource 为空时组件自动加载根节点，<code>loadData</code> 收到 id 为
        <code>__yt_root__</code> 的虚拟根节点；加载到的数组即为树的根节点集合。
      </p>
      <pre class="demo-log">{{ rootLog }}</pre>
    </demo-card>
  `,
})
export class AsyncGroupComponent {
  readonly m = {
    lazyLoad: demoMeta('lazy-load'),
    asyncLoading: demoMeta('async-loading'),
    asyncCallbacks: demoMeta('async-callbacks'),
    asyncRefresh: demoMeta('async-refresh'),
    asyncRoot: demoMeta('async-root'),
  };

  /* ---------- 1. 懒加载 ---------- */
  readonly lazyData: Array<any> = [
    { id: '1', name: '节点 1（展开触发加载）', isParent: true, children: [] },
    { id: '2', name: '节点 2（展开触发加载）', isParent: true, children: [] },
    { id: '3', name: '节点 3（叶子，无箭头）', children: [] },
  ];
  lazyLog = '（点击展开箭头，观察懒加载过程）';

  lazyLoadData = (node: any): Promise<Array<YTreeNode>> => mockFetch(node.id);

  lazyBeforeAsync = (e: any): boolean => {
    this.lazyLog = `beforeAsync: id=${e.id}（from=${e.from}）→ 允许加载`;
    return true;
  };

  onLazySuccess(e: any): void {
    this.lazyLog = `onAsyncSuccess: id=${e.id}，加载到 ${e.children.length} 个子节点`;
  }

  /* ---------- 2. 加载中状态 ---------- */
  readonly loadingData: Array<any> = [
    { id: 'A', name: '节点 A（加载需 2 秒）', isParent: true, children: [] },
  ];
  loadingLog = '（点击展开箭头，观察 loading 图标）';

  loadingLoadData = (node: any): Promise<Array<YTreeNode>> =>
    slowFetch(node.id);

  onLoadingSuccess(e: any): void {
    this.loadingLog = `onAsyncSuccess: id=${e.id}，加载完成`;
  }

  /* ---------- 3. 异步回调 ---------- */
  readonly callbackData: Array<any> = [
    { id: 'OK', name: '节点 OK（会加载成功）', isParent: true, children: [] },
    { id: 'ERR', name: '节点 ERR（会加载失败）', isParent: true, children: [] },
  ];
  callbackLog = '（展开 OK / ERR 节点，对比成功与失败日志）';

  private append(msg: string): void {
    this.callbackLog = msg + '\n' + this.callbackLog.slice(0, 400);
  }

  callbackLoadData = (node: any): Promise<Array<YTreeNode>> =>
    new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if (String(node.id) === 'ERR') {
          reject(new Error(`加载「${node.id}」子节点失败：网络超时`));
          return;
        }
        resolve(
          Array.from({ length: 2 }, (_, i) => ({
            id: `${node.id}-${i + 1}`,
            name: `${node.id}-${i + 1}`,
            children: [],
          })) as Array<YTreeNode>
        );
      }, 700);
    });

  callbackBeforeAsync = (e: any): boolean => {
    this.append(`beforeAsync id=${e.id} from=${e.from}`);
    return true;
  };

  onCallbackSuccess(e: any): void {
    this.append(`onAsyncSuccess id=${e.id} children=${e.children.length}`);
  }

  onCallbackError(e: any): void {
    this.append(`onAsyncError id=${e.id} error=${e.error.message}`);
  }

  /* ---------- 4. 刷新子节点 ---------- */
  @ViewChild('refreshTree') refreshTree!: YTreeComponent;

  readonly refreshData: Array<any> = [
    { id: '1', name: '节点 1', isParent: true, children: [] },
    { id: '2', name: '节点 2', isParent: true, children: [] },
  ];
  refreshLog = '（先展开节点 1，再点击刷新按钮）';
  round = 0;

  refreshLoadData = (node: any): Promise<Array<YTreeNode>> =>
    new Promise((resolve) => {
      window.setTimeout(() => {
        resolve(
          Array.from({ length: 3 }, (_, i) => ({
            id: `${node.id}-${this.round}-${i + 1}`,
            name: `第 ${this.round + 1} 批 · 子节点 ${i + 1}`,
            children: [],
          })) as Array<YTreeNode>
        );
      }, 500);
    });

  nextRound(): void {
    this.round += 1;
  }

  async doRefresh(): Promise<void> {
    const ok = await this.refreshTree.reAsyncChildNodes('1');
    this.refreshLog = `reAsyncChildNodes("1") => ${ok}`;
  }

  /* ---------- 5. 根节点异步 ---------- */
  /** 空数据源用固定引用，避免内联字面量导致每次变更检测都重建服务 */
  readonly emptyData: Array<any> = [];
  rootLog = '（初始 datasource 为空，自动异步加载根节点）';

  rootLoadData = (node: any): Promise<Array<YTreeNode>> =>
    new Promise((resolve) => {
      this.rootLog = `loadData 收到虚拟根节点：id="${node.id}", name="${node.name}", isRoot=${node.isRoot}`;
      window.setTimeout(() => {
        resolve([
          { id: 'r1', name: '根节点 1', isParent: true, children: [] },
          { id: 'r2', name: '根节点 2', children: [] },
        ] as Array<YTreeNode>);
      }, 700);
    });

  onRootSuccess(e: any): void {
    this.rootLog = `${this.rootLog}\n加载完成，得到 ${e.children.length} 个根节点`;
  }
}
