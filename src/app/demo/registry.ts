import type { DemoGroup, DemoMeta } from './types';

/* ================================================================== */
/* 基础                                                               */
/* ================================================================== */

const basicDemos: Array<DemoMeta> = [
  {
    id: 'basic',
    title: '基础用法',
    desc: '传入 datasource 即可渲染一棵树，节点通过 children 嵌套。',
    code: `import { Component } from "@angular/core";

@Component({
  selector: "app-basic",
  template: '<y-tree [datasource]="data"></y-tree>',
})
export class BasicComponent {
  data = [
    {
      id: "1",
      name: "节点 1",
      expanded: true,
      children: [
        { id: "1-1", name: "节点 1-1", children: [] },
        { id: "1-2", name: "节点 1-2", children: [] },
      ],
    },
    { id: "2", name: "节点 2", children: [] },
    { id: "3", name: "节点 3", children: [] },
  ];
}`,
  },
  {
    id: 'expand',
    title: '展开与折叠',
    desc: 'expandIds 受控控制展开状态，(expandChange) 监听展开变化；expandAll 可默认展开全部。空数组表示「未受控」，会回退到数据源内联的 expanded 状态。',
    code: `@Component({
  selector: "app-expand",
  // 注意：空数组表示「未受控」，会回退到数据源内联的 expanded 状态，
  // 所以受控场景下数据源不要写 expanded，空数组即「全部收起」
  template: \`
    <button (click)="expandIds = ['1']">展开节点 1</button>
    <button (click)="expandIds = []">全部收起</button>
    <y-tree
      [datasource]="data"
      [expandIds]="expandIds"
      (expandChange)="onExpandChange($event)"
    ></y-tree>
  \`,
})
export class ExpandComponent {
  expandIds: Array<string | number> = ["1"];

  onExpandChange(e: any) {
    this.expandIds = e.expand
      ? [...this.expandIds, e.id]
      : this.expandIds.filter((id) => id !== e.id);
  }
}`,
  },
  {
    id: 'show-line',
    title: '连接线',
    desc: 'showLine 显示节点之间的层级连接虚线，便于识别父子关系。',
    code: `@Component({
  selector: "app-show-line",
  // showLine 显示层级连接虚线，expandAll 展开全部节点查看完整连线
  template: '<y-tree [datasource]="data" [showLine]="true" [expandAll]="true"></y-tree>',
})
export class ShowLineComponent {
  data = data;
}`,
  },
  {
    id: 'size',
    title: '尺寸',
    desc: 'size 控制节点行高与字号，可选 small / default / large。',
    code: `@Component({
  selector: "app-size",
  template: \`
    <y-tree [datasource]="data" size="small"></y-tree>
    <y-tree [datasource]="data" size="default"></y-tree>
    <y-tree [datasource]="data" size="large"></y-tree>
  \`,
})
export class SizeComponent {
  data = data;
}`,
  },
];

/* ================================================================== */
/* 节点状态                                                            */
/* ================================================================== */

const stateDemos: Array<DemoMeta> = [
  {
    id: 'checkable',
    title: '勾选框',
    desc: 'checkable 显示勾选框，默认父子联动：勾选父节点会同步全部子节点，子节点部分勾选时父节点为半选状态。',
    code: `@Component({
  selector: "app-checkable",
  template: \`
    <y-tree
      [datasource]="data"
      [checkable]="true"
      [expandAll]="true"
      (checkedChange)="onCheckedChange($event)"
    ></y-tree>
    <p>{{ log }}</p>
  \`,
})
export class CheckableComponent {
  @ViewChild(YTreeComponent) tree!: YTreeComponent;
  log = "";

  onCheckedChange(e: any) {
    const list = this.tree.getCheckedList();
    this.log = \`\${e.id} -> \${e.checked}，全树已勾选 \${list.length} 个节点\`;
  }
}`,
  },
  {
    id: 'check-strictly',
    title: '勾选严格模式',
    desc: 'checkStrictly 关闭父子联动，每个节点的勾选状态相互独立。',
    code: `@Component({
  selector: "app-check-strictly",
  template: \`
    <!-- 默认父子联动 -->
    <y-tree [datasource]="data" [checkable]="true" [expandAll]="true"></y-tree>

    <!-- checkStrictly 后父子勾选互不影响 -->
    <y-tree
      [datasource]="data"
      [checkable]="true"
      [checkStrictly]="true"
      [expandAll]="true"
    ></y-tree>
  \`,
})
export class CheckStrictlyComponent {
  data = data;
}`,
  },
  {
    id: 'controlled',
    title: '受控勾选',
    desc: 'checkedIds 受控勾选集合，配合 (checkedChange) 自行同步，可实现全选 / 清空等批量操作。空数组表示「未受控」，会回退到数据源内联的 checked 状态。',
    code: `@Component({
  selector: "app-controlled",
  // 注意：空数组表示「未受控」，受控场景下数据源不要写 checked
  template: \`
    <button (click)="checkedIds = allIds">全选</button>
    <button (click)="checkedIds = []">清空</button>
    <y-tree
      [datasource]="data"
      [checkable]="true"
      [checkedIds]="checkedIds"
      (checkedChange)="sync()"
    ></y-tree>
  \`,
})
export class ControlledComponent {
  @ViewChild(YTreeComponent) tree!: YTreeComponent;
  checkedIds: Array<string | number> = ["1-2"];
  allIds: Array<string | number> = [];

  // 父子联动会连带改变其他节点，直接读取服务里的完整勾选集合
  sync() {
    this.checkedIds = this.tree.getCheckedList().map((n: any) => n.id);
  }
}`,
  },
  {
    id: 'select',
    title: '选中节点',
    desc: 'selectedIds 控制节点文本区的选中高亮，组件不自行管理选中状态，需在 (click) 中同步（支持 Ctrl/Cmd 多选）。',
    code: `@Component({
  selector: "app-select",
  template: \`
    <y-tree
      [datasource]="data"
      [selectedIds]="selectedIds"
      (click)="onClick($event)"
    ></y-tree>
  \`,
})
export class SelectComponent {
  selectedIds: Array<string | number> = [];

  onClick(e: any) {
    const multi = e.event.ctrlKey || e.event.metaKey;
    if (!multi) {
      this.selectedIds = [e.id];
      return;
    }
    this.selectedIds = this.selectedIds.includes(e.id)
      ? this.selectedIds.filter((id) => id !== e.id)
      : [...this.selectedIds, e.id];
  }
}`,
  },
  {
    id: 'disabled',
    title: '禁用节点',
    desc: '数据上标记 disabled 的节点不可点击、不可勾选、不可拖拽，呈置灰样式。',
    code: `@Component({
  selector: "app-disabled",
  template: '<y-tree [datasource]="data" [checkable]="true" [expandAll]="true"></y-tree>',
})
export class DisabledComponent {
  // 节点数据上标记 disabled 即可禁用
  data = [
    {
      id: "1",
      name: "节点 1",
      children: [
        { id: "1-1", name: "节点 1-1", children: [] },
        { id: "1-2", name: "节点 1-2（disabled）", disabled: true, children: [] },
      ],
    },
    { id: "2", name: "节点 2（disabled）", disabled: true, children: [] },
  ];
}`,
  },
  {
    id: 'nocheck',
    title: '不可勾选',
    desc: 'nocheck 的节点不显示勾选框，避免用户直接操作该节点，但仍参与父节点的联动计算。',
    code: `@Component({
  selector: "app-nocheck",
  template: '<y-tree [datasource]="data" [checkable]="true" [expandAll]="true"></y-tree>',
})
export class NocheckComponent {
  // nocheck 的节点不显示勾选框，但仍参与父节点状态联动
  data = [
    {
      id: "1",
      name: "节点 1",
      children: [
        { id: "1-1", name: "节点 1-1", children: [] },
        { id: "1-2", name: "节点 1-2", children: [] },
      ],
    },
    { id: "2", name: "节点 2（nocheck）", nocheck: true, children: [] },
  ];
}`,
  },
  {
    id: 'hide',
    title: '隐藏节点',
    desc: '数据上标记 hide 的节点及其子树不会渲染，但节点数据仍保留在树内部。',
    code: `@Component({
  selector: "app-hide",
  template: '<y-tree [datasource]="data" [expandAll]="true"></y-tree>',
})
export class HideComponent {
  // hide 的节点及其子树不渲染，但数据仍在服务中
  data = [
    {
      id: "1",
      name: "节点 1",
      children: [
        { id: "1-1", name: "节点 1-1", children: [] },
        { id: "1-2", name: "节点 1-2（hide）", hide: true, children: [] },
      ],
    },
    { id: "2", name: "节点 2（hide）", hide: true, children: [] },
  ];
}`,
  },
];

/* ================================================================== */
/* 数据与交互                                                          */
/* ================================================================== */

const interactionDemos: Array<DemoMeta> = [
  {
    id: 'search',
    title: '搜索过滤',
    desc: 'searchValue 按节点名称做关键字过滤，名称不匹配的节点及其子树都不会渲染。',
    code: `@Component({
  selector: "app-search",
  template: \`
    <input [(ngModel)]="keyword" placeholder="输入关键字" />
    <!-- 名称不匹配的节点及其子树都不渲染 -->
    <y-tree [datasource]="data" [expandAll]="true" [searchValue]="keyword"></y-tree>
  \`,
})
export class SearchComponent {
  keyword = "";
  data = data;
}`,
  },
  {
    id: 'events',
    title: '节点事件',
    desc: '(click) / (dbClick) / (contextMenu) / (expandChange) / (checkedChange)，所有事件都携带节点 id 与原生事件对象。',
    code: `@Component({
  selector: "app-events",
  template: \`
    <y-tree
      [datasource]="data"
      [checkable]="true"
      [expandAll]="true"
      (click)="log('click', $event.id)"
      (dbClick)="log('dbClick', $event.id)"
      (contextMenu)="log('contextMenu', $event.id)"
      (expandChange)="log('expandChange', $event.id, $event.expand)"
      (checkedChange)="log('checkedChange', $event.id, $event.checked)"
    ></y-tree>
  \`,
})
export class EventsComponent {
  data = data;
  log(...args: Array<any>) {
    console.log(...args);
  }
}`,
  },
];

/* ================================================================== */
/* 编辑 · P1                                                           */
/* ================================================================== */

const editDemos: Array<DemoMeta> = [
  {
    id: 'editable',
    title: '编辑按钮配置',
    desc: 'editable 开启行内编辑能力，hover 节点显示操作按钮；showRenameBtn / showRemoveBtn / showAddBtn 分别控制三个按钮的显隐。',
    code: `@Component({
  selector: "app-editable",
  template: \`
    <y-tree
      [datasource]="data"
      [editable]="true"
      [showRenameBtn]="showRename"
      [showRemoveBtn]="showRemove"
      [showAddBtn]="showAdd"
    ></y-tree>
  \`,
})
export class EditableComponent {
  data = data;
  showRename = true;
  showRemove = true;
  showAdd = true;
}`,
  },
  {
    id: 'rename',
    title: '重命名',
    desc: '双击节点标题或点击笔按钮进入编辑态；beforeEditName 拦截进入编辑，beforeRename 拦截提交，(rename) 在重命名完成后触发。',
    code: `@Component({
  selector: "app-rename",
  template: \`
    <y-tree
      [datasource]="data"
      [editable]="true"
      [beforeEditName]="beforeEditName"
      [beforeRename]="beforeRename"
      (rename)="onRename($event)"
    ></y-tree>
  \`,
})
export class RenameComponent {
  data = data;

  beforeEditName = (e: any) => {
    console.log("beforeEditName", e.id);
    return true;
  };

  beforeRename = (e: any) => {
    console.log("beforeRename", e.oldName, "->", e.newName);
    return true;
  };

  onRename(e: any) {
    console.log("onRename", e.id, e.newName);
  }
}`,
  },
  {
    id: 'remove',
    title: '删除节点',
    desc: '点击垃圾桶按钮删除节点，removeConfirm 控制是否弹出确认气泡；beforeRemove 可拦截删除，(remove) 在删除完成后触发。',
    code: `@Component({
  selector: "app-remove",
  template: \`
    <y-tree
      [datasource]="data"
      [editable]="true"
      [removeConfirm]="true"
      [beforeRemove]="beforeRemove"
      (remove)="onRemove($event)"
    ></y-tree>
  \`,
})
export class RemoveComponent {
  data = data;

  beforeRemove = (e: any) => {
    console.log("beforeRemove", e.id);
    return true;
  };

  onRemove(e: any) {
    console.log("onRemove 已删除", e.id);
  }
}`,
  },
  {
    id: 'add',
    title: '新增节点',
    desc: '点击加号按钮在节点下追加子节点，beforeAdd 可拦截；(add) 回调携带父节点 id 与新节点 id。',
    code: `@Component({
  selector: "app-add",
  template: \`
    <y-tree
      [datasource]="data"
      [editable]="true"
      [beforeAdd]="beforeAdd"
      (add)="onAdd($event)"
    ></y-tree>
  \`,
})
export class AddComponent {
  data = data;

  beforeAdd = (e: any) => {
    console.log("beforeAdd 父节点", e.id);
    return true;
  };

  onAdd(e: any) {
    console.log("onAdd", e.parentId, "->", e.id);
  }
}`,
  },
  {
    id: 'node-extra',
    title: '自定义节点内容',
    desc: 'ng-template #nodeExtra 在节点标题后渲染自定义内容，对标 zTree 的 addDiyDom。',
    code: `@Component({
  selector: "app-node-extra",
  template: \`
    <!-- nodeExtra 模板对标 zTree addDiyDom -->
    <y-tree [datasource]="data" [expandAll]="true">
      <ng-template #nodeExtra let-node>
        <span class="tag">
          {{ node.childIds.length === 0 ? "叶子" : node.childIds.length + " 个子节点" }}
        </span>
      </ng-template>
    </y-tree>
  \`,
})
export class NodeExtraComponent {
  data = data;
}`,
  },
];

/* ================================================================== */
/* 拖拽 · P2                                                           */
/* ================================================================== */

const dragDemos: Array<DemoMeta> = [
  {
    id: 'drag-move',
    title: '拖拽移动',
    desc: 'draggable 开启原生拖拽，落点分三种：移入（inner）、移到之前（prev）、移到之后（next），拖拽过程中有落点高亮。',
    code: `@Component({
  selector: "app-drag-move",
  // 拖到节点中间为 inner，上/下边缘为 prev / next
  template: \`
    <y-tree
      [datasource]="data"
      [showLine]="true"
      [expandAll]="true"
      [draggable]="true"
      (nodeChange)="onNodeChange($event)"
    ></y-tree>
  \`,
})
export class DragMoveComponent {
  data = data;

  onNodeChange(e: any) {
    console.log("移动", e.sourceId, "->", e.targetId, e.position);
  }
}`,
  },
  {
    id: 'drag-copy',
    title: '拖拽复制',
    desc: 'isCopy 开启后，按住 Ctrl / Cmd 拖拽会复制整棵子树（含 id 重映射与勾选状态保留），(drop) 的 moveType 会变为 copy。',
    code: `@Component({
  selector: "app-drag-copy",
  template: \`
    <y-tree
      [datasource]="data"
      [showLine]="true"
      [expandAll]="true"
      [draggable]="true"
      [isCopy]="true"
      (drop)="onDrop($event)"
    ></y-tree>
  \`,
})
export class DragCopyComponent {
  data = data;

  onDrop(e: any) {
    console.log("drop", e.moveType);
  }
}`,
  },
  {
    id: 'drag-limit',
    title: '拖拽限制',
    desc: 'allowDrag 限制哪些节点可被拖动，allowDrop 限制可落点，minMoveSize 设置触发拖拽的最小移动距离。',
    code: `@Component({
  selector: "app-drag-limit",
  template: \`
    <y-tree
      [datasource]="data"
      [showLine]="true"
      [expandAll]="true"
      [draggable]="true"
      [allowDrag]="allowDrag"
      [allowDrop]="allowDrop"
      [minMoveSize]="6"
    ></y-tree>
  \`,
})
export class DragLimitComponent {
  data = data;

  allowDrag = (node: any) => node.childIds.length === 0;
  allowDrop = (_sourceId: any, targetId: any) => targetId !== "b";
}`,
  },
  {
    id: 'drag-callbacks',
    title: '拖拽回调',
    desc: 'beforeDrag / beforeDrop 返回 false 可拦截拖拽与落点，(drag) / (dragMove) / (drop) 分别对应拖拽开始、拖拽中、放置完成。',
    code: `@Component({
  selector: "app-drag-callbacks",
  template: \`
    <y-tree
      [datasource]="data"
      [showLine]="true"
      [expandAll]="true"
      [draggable]="true"
      [beforeDrag]="beforeDrag"
      [beforeDrop]="beforeDrop"
      (drag)="onDrag($event)"
      (dragMove)="onDragMove($event)"
      (drop)="onDrop($event)"
    ></y-tree>
  \`,
})
export class DragCallbacksComponent {
  data = data;

  beforeDrag = (e: any) => {
    console.log("beforeDrag", e.sourceId);
    return true;
  };

  beforeDrop = (e: any) => {
    console.log("beforeDrop", e.targetId);
    return true;
  };

  onDrag(e: any) {
    console.log("onDrag", e.sourceId);
  }

  onDragMove(e: any) {
    console.log("onDragMove", e.sourceId, e.targetId, e.position);
  }

  onDrop(e: any) {
    console.log("onDrop", e.moveType);
  }
}`,
  },
  {
    id: 'drag-api',
    title: '程序化拖拽',
    desc: '通过组件实例公开的 moveNode / copyNode 以代码方式移动或复制节点，分别返回是否成功与新节点 id。',
    code: `@Component({
  selector: "app-drag-api",
  template: \`
    <y-tree #tree [datasource]="data" [showLine]="true" [expandAll]="true"></y-tree>
    <button (click)="move()">moveNode(B → A 之前)</button>
    <button (click)="copy()">copyNode(C → A 之后)</button>
  \`,
})
export class DragApiComponent {
  @ViewChild("tree") tree!: YTreeComponent;
  data = data;

  move() {
    const ok = this.tree.moveNode("b", "a", "prev");
    console.log("moveNode =>", ok);
  }

  copy() {
    const newId = this.tree.copyNode("c", "a", "next");
    console.log("copyNode =>", newId);
  }
}`,
  },
];

/* ================================================================== */
/* 性能 · P7                                                           */
/* ================================================================== */

const perfDemos: Array<DemoMeta> = [
  {
    id: 'large-data',
    title: '虚拟滚动 · 大数据量',
    desc: 'height 指定滚动容器高度，组件只渲染视口内的节点。13.7 万节点全部展开时，实际 DOM 数量仍保持在几十个，连接线与父子联动勾选也保持毫秒级响应。',
    code: `@Component({
  selector: "app-large-data",
  // height 指定滚动容器高度，组件内部只渲染视口内的节点
  // showLine 显示连接线，checkable 开启父子联动勾选
  template: \`
    <y-tree
      #tree
      [datasource]="data"
      [height]="400"
      [showLine]="true"
      [checkable]="true"
      [expandAll]="true"
      (checkedChange)="onCheckedChange($event)"
    ></y-tree>
  \`,
})
export class LargeDataComponent {
  @ViewChild("tree") tree!: YTreeComponent;
  data = buildLargeData();

  onCheckedChange(e: any) {
    // 勾选联动是增量更新：只重算受影响的祖先链（O(depth)），
    // 不做全量重建，因此 13.7 万节点下勾选依然是毫秒级
    const list = this.tree.getCheckedList();
    console.log("联动后勾选节点数", list.length);
  }
}

// 生成 6 层 7 叉共 137,256 个节点
function buildLargeData(depth = 6, perNode = 7) {
  let id = 0;
  const build = (level: number): Array<any> => {
    const nodes: Array<any> = [];
    for (let i = 0; i < perNode; i++) {
      const node: any = { id: id++, name: \`节点 \${level}-\${i}\`, children: [] };
      if (level < depth) node.children = build(level + 1);
      nodes.push(node);
    }
    return nodes;
  };
  return build(1);
}`,
  },
];

/* ================================================================== */
/* 异步加载 · P3                                                       */
/* ================================================================== */

const asyncDemos: Array<DemoMeta> = [
  {
    id: 'lazy-load',
    title: '懒加载',
    desc: 'lazy 开启懒加载，数据上用 isParent: true 标记「有子节点但未加载」，首次展开时调用 loadData 异步获取子节点，加载完成后自动展开。',
    code: `@Component({
  selector: "app-lazy-load",
  // lazy：子节点在首次展开时才异步获取
  // 数据上用 isParent: true 标记「有子节点但尚未加载」，组件据此渲染展开箭头
  template: \`
    <y-tree
      [datasource]="data"
      [lazy]="true"
      [loadData]="loadData"
      [showLine]="true"
      (asyncSuccess)="onAsyncSuccess($event)"
    ></y-tree>
  \`,
})
export class LazyLoadComponent {
  data = [
    { id: "1", name: "节点 1", isParent: true, children: [] },
    { id: "2", name: "节点 2", isParent: true, children: [] },
  ];

  loadData = async (node: any) => {
    const res = await fetch(\`/api/children?parentId=\${node.id}\`);
    return res.json(); // 返回子节点数组即可
  };

  onAsyncSuccess(e: any) {
    console.log("加载成功", e.id, e.children.length);
  }
}`,
  },
  {
    id: 'async-loading',
    title: '加载中状态',
    desc: '加载期间节点的展开箭头替换为旋转的 loading 图标（node.isAjaxing），且同一节点不会重复发起请求。',
    code: `@Component({
  selector: "app-async-loading",
  // 加载期间节点的展开箭头会替换为旋转的 loading 图标
  // 组件内部通过 node.isAjaxing 标记，样式类为 .y-tree-switcher-icon.is-ajaxing
  template: '<y-tree [datasource]="data" [lazy]="true" [loadData]="loadData" [showLine]="true"></y-tree>',
})
export class AsyncLoadingComponent {
  data = [{ id: "A", name: "节点 A", isParent: true, children: [] }];

  // 故意放慢接口，便于观察 loading 图标
  loadData = async (node: any) => {
    await new Promise((r) => setTimeout(r, 2000));
    return fetchChildren(node.id);
  };
}`,
  },
  {
    id: 'async-callbacks',
    title: '异步回调',
    desc: 'beforeAsync 返回 false 可取消本次加载；(asyncSuccess) / (asyncError) 分别处理成功与失败，失败时节点保持收起可重试。',
    code: `@Component({
  selector: "app-async-callbacks",
  template: \`
    <y-tree
      [datasource]="data"
      [lazy]="true"
      [loadData]="loadData"
      [beforeAsync]="beforeAsync"
      (asyncSuccess)="onAsyncSuccess($event)"
      (asyncError)="onAsyncError($event)"
    ></y-tree>
  \`,
})
export class AsyncCallbacksComponent {
  data = data;
  loadData = loadData;

  // 返回 false 可取消本次加载（权限控制场景）
  beforeAsync = (e: any) => {
    console.log("即将加载", e.id, e.from);
    return true;
  };

  onAsyncSuccess(e: any) {
    console.log("加载成功", e.id, e.children.length);
  }

  onAsyncError(e: any) {
    console.error("加载失败", e.id, e.error);
  }
}`,
  },
  {
    id: 'async-refresh',
    title: '刷新子节点',
    desc: '通过组件实例公开的 reAsyncChildNodes(id) 重新加载指定节点的子节点，返回 Promise<boolean>，原有子树会被整体替换。',
    code: `@Component({
  selector: "app-async-refresh",
  template: \`
    <y-tree #tree [datasource]="data" [lazy]="true" [loadData]="loadData"></y-tree>
    <button (click)="refresh()">刷新「节点 1」的子节点</button>
  \`,
})
export class AsyncRefreshComponent {
  @ViewChild("tree") tree!: YTreeComponent;
  data = data;
  loadData = loadData;

  async refresh() {
    // 重新拉取指定节点的子节点，替换原有子树
    const ok = await this.tree.reAsyncChildNodes("1");
    console.log("重新加载完成", ok);
  }
}`,
  },
  {
    id: 'async-root',
    title: '根节点异步',
    desc: 'datasource 为空时组件自动异步加载根节点，loadData 收到 id 为 __yt_root__ 的虚拟根节点，返回的数组即为根节点集合。',
    code: `@Component({
  selector: "app-async-root",
  // datasource 为空 + lazy：组件会自动调用 loadData 加载根节点数据，
  // 此时 loadData 收到的是 id 为 "__yt_root__" 的虚拟根节点
  template: '<y-tree [datasource]="emptyData" [lazy]="true" [loadData]="loadData"></y-tree>',
})
export class AsyncRootComponent {
  // 空数据源用固定引用，避免内联字面量导致每次变更检测都重建服务
  emptyData: Array<any> = [];

  loadData = async (node: any) => {
    console.log("加载根节点，虚拟根 id =", node.id);
    const res = await fetch("/api/roots");
    return res.json();
  };
}`,
  },
];

/* ================================================================== */
/* 勾选增强 · P4                                                       */
/* ================================================================== */

const checkDemos: Array<DemoMeta> = [
  {
    id: 'radio-all',
    title: '单选 · 整树互斥',
    desc: 'chkStyle="radio" + radioType="all"：整棵树只能勾选一个节点，勾选新节点会清掉旧的。',
    code: `<y-tree [datasource]="data" [checkable]="true" chkStyle="radio" radioType="all"></y-tree>`,
  },
  {
    id: 'radio-level',
    title: '单选 · 同级互斥',
    desc: 'radioType="level"：同一父节点下的兄弟互斥，跨级可以同时勾选。',
    code: `<y-tree [datasource]="data" [checkable]="true" chkStyle="radio" radioType="level"></y-tree>`,
  },
  {
    id: 'chkbox-type',
    title: '联动方向',
    desc: 'chkboxType 控制父子联动方向：Y/N 分别对应勾选与取消，p=祖先、s=子孙。',
    code: `<y-tree [datasource]="data" [checkable]="true" [chkboxType]="{ Y: 's', N: 's' }"></y-tree>`,
  },
  {
    id: 'check-all',
    title: '全选 / 全不选',
    desc: '通过组件实例的 checkAllNodes(true) / cancelAllNodes() 全选或全不选。radio 模式下全选无效。',
    code: `this.tree.checkAllNodes(true);
this.tree.cancelAllNodes();`,
  },
  {
    id: 'check-node',
    title: '程序化勾选',
    desc: 'checkNode(id, checked) 程序化勾选（可改 disabled）；getChangeCheckedNodes() 返回相对 init 快照发生变化的节点。',
    code: `this.tree.checkNode("1-1", true);
const changed = this.tree.getChangeCheckedNodes();`,
  },
];

/* ================================================================== */

export const demoGroups: Array<DemoGroup> = [
  { id: 'group-basic', title: '基础', demos: basicDemos },
  { id: 'group-state', title: '节点状态', demos: stateDemos },
  { id: 'group-interaction', title: '数据与交互', demos: interactionDemos },
  { id: 'group-async', title: '异步加载 · P3', demos: asyncDemos },
  { id: 'group-check', title: '勾选增强 · P4', demos: checkDemos },
  { id: 'group-edit', title: '编辑 · P1', demos: editDemos },
  { id: 'group-drag', title: '拖拽 · P2', demos: dragDemos },
  { id: 'group-perf', title: '性能 · P7', demos: perfDemos },
];

/** 按 id 取单个 demo 元数据（供分组模板绑定使用） */
export function demoMeta(id: string): DemoMeta {
  for (const group of demoGroups) {
    for (const demo of group.demos) {
      if (demo.id === id) {
        return demo;
      }
    }
  }
  throw new Error(`未找到 demo: ${id}`);
}
