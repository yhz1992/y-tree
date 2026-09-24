import type { DemoGroup, DemoMeta } from './types';

/* ================================================================== */
/* 基础                                                               */
/* ================================================================== */

const basicDemos: Array<DemoMeta> = [
	{
		id: 'basic',
		title: '基础用法',
		desc: '传入 datasource 即可渲染一棵树，节点通过 children 嵌套。',
		code: `<script setup lang="ts">
import YTree from "y-tree-vue";
import "y-tree-vue/style.css";

const data = [
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
<\/script>

<template>
  <YTree :datasource="data" />
</template>`
	},
	{
		id: 'expand',
		title: '展开与折叠',
		desc: 'expand-ids 受控控制展开状态，@expand-change 监听展开变化；expand-all 可默认展开全部。空数组表示「未受控」，会回退到数据源内联的 expanded 状态。',
		code: `<script setup lang="ts">
import { ref } from "vue";
import YTree from "y-tree-vue";

// 注意：空数组表示「未受控」，会回退到数据源内联的 expanded 状态，
// 所以受控场景下数据源不要写 expanded，空数组即「全部收起」
const expandIds = ref(["1"]);

const onExpandChange = (e) => {
  expandIds.value = e.expand
    ? [...expandIds.value, e.id]
    : expandIds.value.filter((id) => id !== e.id);
};
<\/script>

<template>
  <button @click="expandIds = ['1']">展开节点 1</button>
  <button @click="expandIds = []">全部收起</button>

  <YTree :datasource="data" :expand-ids="expandIds" @expand-change="onExpandChange" />
</template>`
	},
	{
		id: 'show-line',
		title: '连接线',
		desc: 'show-line 显示节点之间的层级连接虚线，便于识别父子关系。',
		code: `<script setup lang="ts">
import YTree from "y-tree-vue";

// show-line 显示层级连接虚线，expand-all 展开全部节点查看完整连线
<\/script>

<template>
  <YTree :datasource="data" show-line expand-all />
</template>`
	},
	{
		id: 'size',
		title: '尺寸',
		desc: 'size 控制节点行高与字号，可选 small / default / large。',
		code: `<template>
  <YTree :datasource="data" size="small" />
  <YTree :datasource="data" size="default" />
  <YTree :datasource="data" size="large" />
</template>`
	}
];

/* ================================================================== */
/* 节点状态                                                            */
/* ================================================================== */

const stateDemos: Array<DemoMeta> = [
	{
		id: 'checkable',
		title: '勾选框',
		desc: 'checkable 显示勾选框，默认父子联动：勾选父节点会同步全部子节点，子节点部分勾选时父节点为半选状态。',
		code: `<script setup lang="ts">
import { ref } from "vue";
import YTree from "y-tree-vue";

const treeRef = ref(null);
const log = ref("");

const onCheckedChange = (e) => {
  const list = treeRef.value?.getCheckedList() ?? [];
  log.value = \`\${e.id} -> \${e.checked}，全树已勾选 \${list.length} 个节点\`;
};
<\/script>

<template>
  <YTree ref="treeRef" :datasource="data" checkable @checked-change="onCheckedChange" />
  <p>{{ log }}</p>
</template>`
	},
	{
		id: 'check-strictly',
		title: '勾选严格模式',
		desc: 'check-strictly 关闭父子联动，每个节点的勾选状态相互独立。',
		code: `<template>
  <!-- 默认父子联动 -->
  <YTree :datasource="data" checkable expand-all />

  <!-- check-strictly 后父子勾选互不影响 -->
  <YTree :datasource="data" checkable check-strictly expand-all />
</template>`
	},
	{
		id: 'controlled',
		title: '受控勾选',
		desc: 'checked-ids 受控勾选集合，配合 @checked-change 自行同步，可实现全选 / 清空等批量操作。空数组表示「未受控」，会回退到数据源内联的 checked 状态。',
		code: `<script setup lang="ts">
import { ref } from "vue";
import YTree from "y-tree-vue";

const treeRef = ref(null);
// 注意：空数组表示「未受控」，受控场景下数据源不要写 checked
const checkedIds = ref(["1-2"]);

// 父子联动会连带改变其他节点，直接读取服务里的完整勾选集合
const sync = () => {
  checkedIds.value = treeRef.value?.getCheckedList().map((n) => n.id) ?? [];
};
<\/script>

<template>
  <button @click="checkedIds = allIds">全选</button>
  <button @click="checkedIds = []">清空</button>

  <YTree
    ref="treeRef"
    :datasource="data"
    checkable
    :checked-ids="checkedIds"
    @checked-change="sync"
  />
</template>`
	},
	{
		id: 'select',
		title: '选中节点',
		desc: 'selected-ids 控制节点文本区的选中高亮，组件不自行管理选中状态，需在 @click 中同步（支持 Ctrl/Cmd 多选）。',
		code: `<script setup lang="ts">
import { ref } from "vue";
import YTree from "y-tree-vue";

const selectedIds = ref([]);

const onClick = (e) => {
  const multi = e.event.ctrlKey || e.event.metaKey;
  if (!multi) {
    selectedIds.value = [e.id];
    return;
  }
  selectedIds.value = selectedIds.value.includes(e.id)
    ? selectedIds.value.filter((id) => id !== e.id)
    : [...selectedIds.value, e.id];
};
<\/script>

<template>
  <YTree :datasource="data" :selected-ids="selectedIds" @click="onClick" />
</template>`
	},
	{
		id: 'disabled',
		title: '禁用节点',
		desc: '数据上标记 disabled 的节点不可点击、不可勾选、不可拖拽，呈置灰样式。',
		code: `<script setup lang="ts">
// 节点数据上标记 disabled 即可禁用
const data = [
  { id: "1", name: "节点 1", children: [
    { id: "1-1", name: "节点 1-1", children: [] },
    { id: "1-2", name: "节点 1-2（disabled）", disabled: true, children: [] },
  ]},
  { id: "2", name: "节点 2（disabled）", disabled: true, children: [] },
];
<\/script>

<template>
  <YTree :datasource="data" checkable expand-all />
</template>`
	},
	{
		id: 'nocheck',
		title: '不可勾选',
		desc: 'nocheck 的节点不显示勾选框，避免用户直接操作该节点，但仍参与父节点的联动计算。',
		code: `<script setup lang="ts">
// nocheck 的节点不显示勾选框，但仍参与父节点状态联动
const data = [
  { id: "1", name: "节点 1", children: [
    { id: "1-1", name: "节点 1-1", children: [] },
    { id: "1-2", name: "节点 1-2", children: [] },
  ]},
  { id: "2", name: "节点 2（nocheck）", nocheck: true, children: [] },
];
<\/script>

<template>
  <YTree :datasource="data" checkable expand-all />
</template>`
	},
	{
		id: 'hide',
		title: '隐藏节点',
		desc: '数据上标记 hide 的节点及其子树不会渲染，但节点数据仍保留在树内部。',
		code: `<script setup lang="ts">
// hide 的节点及其子树不渲染，但数据仍在服务中
const data = [
  { id: "1", name: "节点 1", children: [
    { id: "1-1", name: "节点 1-1", children: [] },
    { id: "1-2", name: "节点 1-2（hide）", hide: true, children: [] },
  ]},
  { id: "2", name: "节点 2（hide）", hide: true, children: [] },
];
<\/script>

<template>
  <YTree :datasource="data" expand-all />
</template>`
	}
];

/* ================================================================== */
/* 数据与交互                                                          */
/* ================================================================== */

const interactionDemos: Array<DemoMeta> = [
	{
		id: 'search',
		title: '搜索过滤',
		desc: 'search-value 按节点名称做关键字过滤，名称不匹配的节点及其子树都不会渲染。',
		code: `<script setup lang="ts">
import { ref } from "vue";
import YTree from "y-tree-vue";

const keyword = ref("");
<\/script>

<template>
  <input v-model="keyword" placeholder="输入关键字" />
  <!-- 名称不匹配的节点及其子树都不渲染 -->
  <YTree :datasource="data" expand-all :search-value="keyword" />
</template>`
	},
	{
		id: 'events',
		title: '节点事件',
		desc: '@click / @db-click / @context-menu / @expand-change / @checked-change，所有事件都携带节点 id 与原生事件对象。',
		code: `<template>
  <YTree
    :datasource="data"
    checkable
    expand-all
    @click="(e) => log('click', e.id)"
    @db-click="(e) => log('dbClick', e.id)"
    @context-menu="(e) => log('contextMenu', e.id)"
    @expand-change="(e) => log('expandChange', e.id, e.expand)"
    @checked-change="(e) => log('checkedChange', e.id, e.checked)"
  />
</template>`
	}
];

/* ================================================================== */
/* 编辑 · P1                                                           */
/* ================================================================== */

const editDemos: Array<DemoMeta> = [
	{
		id: 'editable',
		title: '编辑按钮配置',
		desc: 'editable 开启行内编辑能力，hover 节点显示操作按钮；show-rename-btn / show-remove-btn / show-add-btn 分别控制三个按钮的显隐。',
		code: `<template>
  <YTree
    :datasource="data"
    editable
    :show-rename-btn="showRename"
    :show-remove-btn="showRemove"
    :show-add-btn="showAdd"
  />
</template>`
	},
	{
		id: 'rename',
		title: '重命名',
		desc: '双击节点标题或点击笔按钮进入编辑态；before-edit-name 拦截进入编辑，before-rename 拦截提交，@rename 在重命名完成后触发。',
		code: `<template>
  <YTree
    :datasource="data"
    editable
    :before-edit-name="(e) => { console.log('beforeEditName', e.id); return true; }"
    :before-rename="(e) => { console.log('beforeRename', e.oldName, e.newName); return true; }"
    @rename="(e) => console.log('onRename', e.id, e.newName)"
  />
</template>`
	},
	{
		id: 'remove',
		title: '删除节点',
		desc: '点击垃圾桶按钮删除节点，remove-confirm 控制是否弹出确认气泡；before-remove 可拦截删除，@remove 在删除完成后触发。',
		code: `<template>
  <YTree
    :datasource="data"
    editable
    :remove-confirm="true"
    :before-remove="(e) => { console.log('beforeRemove', e.id); return true; }"
    @remove="(e) => console.log('onRemove 已删除', e.id)"
  />
</template>`
	},
	{
		id: 'add',
		title: '新增节点',
		desc: '点击加号按钮在节点下追加子节点，before-add 可拦截；@add 回调携带父节点 id 与新节点 id。',
		code: `<template>
  <YTree
    :datasource="data"
    editable
    :before-add="(e) => { console.log('beforeAdd 父节点', e.id); return true; }"
    @add="(e) => console.log('onAdd', e.parentId, '->', e.id)"
  />
</template>`
	},
	{
		id: 'node-extra',
		title: '自定义节点内容',
		desc: 'nodeExtra 插槽在节点标题后渲染自定义内容。',
		code: `<template>
  <!-- nodeExtra 插槽 -->
  <YTree :datasource="data" expand-all>
    <template #nodeExtra="{ node }">
      <span class="tag">
        {{ node.childIds.length === 0 ? "叶子" : node.childIds.length + " 个子节点" }}
      </span>
    </template>
  </YTree>
</template>`
	}
];

/* ================================================================== */
/* 拖拽 · P2                                                           */
/* ================================================================== */

const dragDemos: Array<DemoMeta> = [
	{
		id: 'drag-move',
		title: '拖拽移动',
		desc: 'draggable 开启原生拖拽，落点分三种：移入（inner）、移到之前（prev）、移到之后（next），拖拽过程中有落点高亮。',
		code: `<template>
  <!-- 拖到节点中间为 inner，上/下边缘为 prev / next -->
  <YTree
    :datasource="data"
    show-line
    expand-all
    draggable
    @node-change="(e) => console.log('移动', e.sourceId, '->', e.targetId, e.position)"
  />
</template>`
	},
	{
		id: 'drag-copy',
		title: '拖拽复制',
		desc: 'is-copy 开启后，按住 Ctrl / Cmd 拖拽会复制整棵子树（含 id 重映射与勾选状态保留），@drop 的 moveType 会变为 copy。',
		code: `<template>
  <YTree
    :datasource="data"
    show-line
    expand-all
    draggable
    is-copy
    @drop="(e) => console.log('drop', e.moveType)"
  />
</template>`
	},
	{
		id: 'drag-limit',
		title: '拖拽限制',
		desc: 'allow-drag 限制哪些节点可被拖动，allow-drop 限制可落点，min-move-size 设置触发拖拽的最小移动距离。',
		code: `<template>
  <YTree
    :datasource="data"
    show-line
    expand-all
    draggable
    :allow-drag="(node) => node.childIds.length === 0"
    :allow-drop="(_sourceId, targetId) => targetId !== 'b'"
    :min-move-size="6"
  />
</template>`
	},
	{
		id: 'drag-callbacks',
		title: '拖拽回调',
		desc: 'before-drag / before-drop 返回 false 可拦截拖拽与落点，@drag / @drag-move / @drop 分别对应拖拽开始、拖拽中、放置完成。',
		code: `<template>
  <YTree
    :datasource="data"
    show-line
    expand-all
    draggable
    :before-drag="(e) => { console.log('beforeDrag', e.sourceId); return true; }"
    :before-drop="(e) => { console.log('beforeDrop', e.targetId); return true; }"
    @drag="(e) => console.log('onDrag', e.sourceId)"
    @drag-move="(e) => console.log('onDragMove', e.sourceId, e.targetId, e.position)"
    @drop="(e) => console.log('onDrop', e.moveType)"
  />
</template>`
	},
	{
		id: 'drag-api',
		title: '程序化拖拽',
		desc: '通过组件实例暴露的 moveNode / copyNode 以代码方式移动或复制节点，分别返回是否成功与新节点 id。',
		code: `<script setup lang="ts">
import { ref } from "vue";
import YTree from "y-tree-vue";

const treeRef = ref(null);

const move = () => {
  const ok = treeRef.value?.moveNode("b", "a", "prev");
  console.log("moveNode =>", ok);
};

const copy = () => {
  const newId = treeRef.value?.copyNode("c", "a", "next");
  console.log("copyNode =>", newId);
};
<\/script>

<template>
  <YTree ref="treeRef" :datasource="data" show-line expand-all />
  <button @click="move">moveNode(B → A 之前)</button>
  <button @click="copy">copyNode(C → A 之后)</button>
</template>`
	}
];

/* ================================================================== */
/* 性能 · P7                                                           */
/* ================================================================== */

const perfDemos: Array<DemoMeta> = [
	{
		id: 'large-data',
		title: '虚拟滚动 · 大数据量',
		desc: 'height 指定滚动容器高度，组件只渲染视口内的节点。13.7 万节点全部展开时，实际 DOM 数量仍保持在几十个；勾选、拖拽、编辑都走增量更新，避免全量重建可见列表。',
		code: `<script setup lang="ts">
import { ref } from "vue";
import YTree from "y-tree-vue";

// 生成 6 层 7 叉共 137,256 个节点
function buildLargeData(depth = 6, perNode = 7) {
  let id = 0;
  const build = (level) => {
    const nodes = [];
    for (let i = 0; i < perNode; i++) {
      const node = { id: id++, name: \`节点 \${level}-\${i}\`, children: [] };
      if (level < depth) node.children = build(level + 1);
      nodes.push(node);
    }
    return nodes;
  };
  return build(1);
}

const treeRef = ref(null);
const data = ref(buildLargeData());

const onCheckedChange = (e) => {
  // 勾选联动是增量更新：只重算受影响的祖先链（O(depth)），
  // 不做全量重建，因此 13.7 万节点下勾选依然是毫秒级
  const list = treeRef.value?.getCheckedList() ?? [];
  console.log("联动后勾选节点数", list.length);
};
<\/script>

<template>
  <!-- height 指定滚动容器高度，组件内部只渲染视口内的节点 -->
  <YTree
    ref="treeRef"
    :datasource="data"
    :height="400"
    show-line
    checkable
    expand-all
    @checked-change="onCheckedChange"
  />
</template>`
	}
];

/* ================================================================== */
/* 异步加载 · P3                                                       */
/* ================================================================== */

const asyncDemos: Array<DemoMeta> = [
	{
		id: 'lazy-load',
		title: '懒加载',
		desc: 'lazy 开启懒加载，数据上用 isParent: true 标记「有子节点但未加载」，首次展开时调用 loadData 异步获取子节点，加载完成后自动展开。',
		code: `<script setup lang="ts">
import YTree from "y-tree-vue";

// lazy：子节点在首次展开时才异步获取
// 数据上用 isParent: true 标记「有子节点但尚未加载」，组件据此渲染展开箭头
const data = [
  { id: "1", name: "节点 1", isParent: true, children: [] },
  { id: "2", name: "节点 2", isParent: true, children: [] },
];

const loadData = async (node) => {
  const res = await fetch(\`/api/children?parentId=\${node.id}\`);
  return res.json(); // 返回子节点数组即可
};

const onAsyncSuccess = (e) => {
  console.log("加载成功", e.id, e.children.length);
};
<\/script>

<template>
  <YTree :datasource="data" lazy :load-data="loadData" show-line @async-success="onAsyncSuccess" />
</template>`
	},
	{
		id: 'async-loading',
		title: '加载中状态',
		desc: '加载期间节点的展开箭头替换为旋转的 loading 图标（node.isAjaxing），且同一节点不会重复发起请求。',
		code: `<script setup lang="ts">
import YTree from "y-tree-vue";

// 加载期间节点的展开箭头会替换为旋转的 loading 图标
// 组件内部通过 node.isAjaxing 标记，样式类为 .y-tree-switcher-icon.is-ajaxing
// 故意放慢接口，便于观察 loading 图标
const loadData = async (node) => {
  await new Promise((r) => setTimeout(r, 2000));
  return fetchChildren(node.id);
};
<\/script>

<template>
  <YTree :datasource="data" lazy :load-data="loadData" show-line />
</template>`
	},
	{
		id: 'async-callbacks',
		title: '异步回调',
		desc: 'beforeAsync 返回 false 可取消本次加载；@async-success / @async-error 分别处理成功与失败，失败时节点保持收起可重试。',
		code: `<script setup lang="ts">
import YTree from "y-tree-vue";

// beforeAsync 返回 false 可取消本次加载（权限控制场景）
const beforeAsync = (e) => {
  console.log("即将加载", e.id, e.from);
  return true;
};

const onAsyncSuccess = (e) => {
  console.log("加载成功", e.id, e.children.length);
};

const onAsyncError = (e) => {
  console.error("加载失败", e.id, e.error);
};
<\/script>

<template>
  <YTree
    :datasource="data"
    lazy
    :load-data="loadData"
    :before-async="beforeAsync"
    @async-success="onAsyncSuccess"
    @async-error="onAsyncError"
  />
</template>`
	},
	{
		id: 'async-refresh',
		title: '刷新子节点',
		desc: '通过组件实例暴露的 reAsyncChildNodes(id) 重新加载指定节点的子节点，返回 Promise<boolean>，原有子树会被整体替换。',
		code: `<script setup lang="ts">
import { ref } from "vue";
import YTree from "y-tree-vue";

const treeRef = ref(null);

const refresh = async () => {
  // 重新拉取指定节点的子节点，替换原有子树
  const ok = await treeRef.value?.reAsyncChildNodes("1");
  console.log("重新加载完成", ok);
};
<\/script>

<template>
  <YTree ref="treeRef" :datasource="data" lazy :load-data="loadData" />
  <button @click="refresh">刷新「节点 1」的子节点</button>
</template>`
	},
	{
		id: 'async-root',
		title: '根节点异步',
		desc: 'datasource 为空时组件自动异步加载根节点，loadData 收到 id 为 __yt_root__ 的虚拟根节点，返回的数组即为根节点集合。',
		code: `<script setup lang="ts">
import YTree from "y-tree-vue";

// datasource 为空 + lazy：组件会自动调用 loadData 加载根节点数据，
// 此时 loadData 收到的是 id 为 "__yt_root__" 的虚拟根节点
const loadData = async (node) => {
  console.log("加载根节点，虚拟根 id =", node.id);
  const res = await fetch("/api/roots");
  return res.json();
};
<\/script>

<template>
  <YTree :datasource="[]" lazy :load-data="loadData" />
</template>`
	}
];

/* ================================================================== */
/* 勾选增强 · P4                                                       */
/* ================================================================== */

const checkDemos: Array<DemoMeta> = [
	{
		id: 'radio-all',
		title: '单选 · 整树互斥',
		desc: 'chkStyle="radio" + radioType="all"：整棵树只能勾选一个节点，勾选新节点会清掉旧的。',
		code: `<YTree :datasource="data" checkable chk-style="radio" radio-type="all" />`
	},
	{
		id: 'radio-level',
		title: '单选 · 同级互斥',
		desc: 'radioType="level"：同一父节点下的兄弟互斥，跨级可以同时勾选。',
		code: `<YTree :datasource="data" checkable chk-style="radio" radio-type="level" />`
	},
	{
		id: 'chkbox-type',
		title: '联动方向',
		desc: 'chkboxType 控制父子联动方向：Y/N 分别对应勾选与取消，p=祖先、s=子孙。',
		code: `<YTree :datasource="data" checkable :chkbox-type="{ Y: 's', N: 's' }" />`
	},
	{
		id: 'check-all',
		title: '全选 / 全不选',
		desc: '通过 ref 的 checkAllNodes(true) / cancelAllNodes() 全选或全不选。radio 模式下全选无效。',
		code: `treeRef.value.checkAllNodes(true);
treeRef.value.cancelAllNodes();`
	},
	{
		id: 'check-node',
		title: '程序化勾选',
		desc: 'checkNode(id, checked) 程序化勾选（可改 disabled）；getChangeCheckedNodes() 返回相对 init 快照发生变化的节点。',
		code: `treeRef.value.checkNode("1-1", true);
const changed = treeRef.value.getChangeCheckedNodes();`
	}
];

/* ================================================================== */
/* 展示增强 · P5                                                       */
/* ================================================================== */

const viewDemos: Array<DemoMeta> = [
	{
		id: 'node-icon',
		title: '自定义图标',
		desc: 'icon / iconOpen / iconClose / iconSkin 自定义节点图标；showIcon 控制显隐。未指定时父节点显示文件夹、叶子显示文档。',
		code: `<YTree :datasource="data" :show-icon="true" />`
	},
	{
		id: 'font-css',
		title: '自定义字体',
		desc: 'fontCss 按节点返回标题样式，用于高亮、标记。',
		code: `<YTree
  :datasource="data"
  :font-css="(node) => node.id === '1-1' ? { color: '#1677ff', fontWeight: '700' } : {}"
/>`
	},
	{
		id: 'node-title',
		title: 'title 提示',
		desc: '节点 title 透传到标题悬停提示，缺省回退为 name；showTitle=false 关闭。',
		code: `<YTree :datasource="data" :show-title="true" />`
	},
	{
		id: 'dblclick-expand',
		title: '双击展开',
		desc: 'dblClickExpand 控制双击标题是否展开/折叠，默认 true。开启编辑时双击优先进入重命名。',
		code: `<YTree :datasource="data" :dbl-click-expand="true" />`
	},
	{
		id: 'expand-speed',
		title: '展开动画',
		desc: 'expandSpeed 控制展开/折叠过渡：fast=200ms、slow=400ms、0 关闭（默认）。',
		code: `<YTree :datasource="data" expand-speed="fast" />`
	},
	{
		id: 'selected-multi',
		title: '多选文本选中',
		desc: 'selectedMulti 控制 Ctrl/Cmd 是否追加选中；组件内部维护选中高亮，ref 暴露 selectNode / cancelSelectedNode / getSelectedNodes。',
		code: `<YTree :datasource="data" :selected-multi="true" />`
	}
];

/* ================================================================== */
/* 查询与操作 · P6                                                     */
/* ================================================================== */

const apiDemos: Array<DemoMeta> = [
	{
		id: 'query-nodes',
		title: '批量查询',
		desc: 'getNodes / getNodesByParam / getNodesByParamFuzzy / getNodeIndex：根列表、精确/模糊属性查询、兄弟下标。',
		code: `const roots = treeRef.value?.getNodes() ?? [];
const hits = treeRef.value?.getNodesByParam("name", "节点 1-1") ?? [];
const fuzzy = treeRef.value?.getNodesByParamFuzzy("name", "1-") ?? [];
const idx = treeRef.value?.getNodeIndex("1-2") ?? -1;`
	},
	{
		id: 'transform',
		title: '结构转换',
		desc: 'transformToArray / transformToTreeNodes 互转当前树；transformToTreeNodesFromFlat 把扁数据转嵌套，不碰当前树。',
		code: `const flat = treeRef.value?.transformToArray() ?? [];
const nested = treeRef.value?.transformToTreeNodes() ?? [];
const rebuilt = treeRef.value?.transformToTreeNodesFromFlat(flatNodes) ?? [];`
	},
	{
		id: 'update-node',
		title: '节点更新',
		desc: 'updateNode 热更新展示字段并刷新视图；结构字段 id/pId/childIds 会被忽略。',
		code: `treeRef.value?.updateNode("1-1", { name: "已改名" });
treeRef.value?.updateNode("2", { hide: true });`
	},
	{
		id: 'expand-node',
		title: '精确展开',
		desc: 'expandNode(id, expand?, sonSign?) 精确展开/折叠；expandCollapseParentNode 沿祖先链操作。',
		code: `treeRef.value?.expandNode("1", false);
treeRef.value?.expandNode("1", true, true);
treeRef.value?.expandCollapseParentNode("1-1", true);`
	},
	{
		id: 'before-hooks',
		title: 'before* 拦截',
		desc: 'beforeClick / beforeExpand / beforeCollapse / beforeCheck 返回 false 取消操作。点节点 2 拦点击、折叠节点 1 拦、勾选 1-1 拦。',
		code: `<YTree
  :datasource="data"
  checkable
  :before-click="(e) => e.id !== '2'"
  :before-collapse="(e) => e.id !== '1'"
  :before-check="(e) => e.id !== '1-1'"
/>`
	}
];

/* ================================================================== */
/* API 参考                                                           */
/* ================================================================== */

const docsDemos: Array<DemoMeta> = [
	{
		id: 'api-props',
		title: 'Props',
		desc: '组件入参。before* 拦截回调也列在这里；空数组受控集合表示「未受控」，会回退数据源内联状态。',
		code: `<YTree
  :datasource="data"
  checkable
  show-line
  expand-all
  :height="196"
/>`
	},
	{
		id: 'api-events',
		title: 'Events',
		desc: 'Vue 用 kebab-case 事件名。通用 payload 含 event、id；拖拽/编辑/异步事件另有扩展字段。',
		code: `<YTree
  :datasource="data"
  @click="(e) => console.log(e.id)"
  @checked-change="(e) => console.log(e.checked)"
  @expand-change="(e) => console.log(e.expand)"
/>`
	},
	{
		id: 'api-methods',
		title: 'Methods',
		desc: '通过 ref 调用。checkNode / moveNode / copyNode 等不走 before*；expandNode 走 beforeExpand / beforeCollapse。',
		code: `const treeRef = ref();

treeRef.value?.checkNode("1-1", true);
treeRef.value?.getCheckedList();
treeRef.value?.expandNode("1", true);`
	},
	{
		id: 'api-node-model',
		title: 'NodeModel',
		desc: '入参是 YTreeNode（嵌套 children）或 YTreeFlatNode（pId）。getNodeById 等返回运行时 YTreeModel。',
		code: `/** 入参（嵌套） */
{ id: "1", name: "节点 1", children: [{ id: "1-1", name: "节点 1-1", children: [] }] }

/** 入参（扁平） */
{ id: "1-1", name: "节点 1-1", pId: "1" }

/** 运行时 YTreeModel 另含 childIds / level / halfChecked 等 */`
	}
];

/* ================================================================== */

export const demoGroups: Array<DemoGroup> = [
	{ id: 'group-api-docs', title: 'API 参考', demos: docsDemos },
	{ id: 'group-basic', title: '基础', demos: basicDemos },
	{ id: 'group-state', title: '节点状态', demos: stateDemos },
	{ id: 'group-interaction', title: '数据与交互', demos: interactionDemos },
	{ id: 'group-async', title: '异步加载 · P3', demos: asyncDemos },
	{ id: 'group-check', title: '勾选增强 · P4', demos: checkDemos },
	{ id: 'group-view', title: '展示增强 · P5', demos: viewDemos },
	{ id: 'group-api', title: '查询与操作 · P6', demos: apiDemos },
	{ id: 'group-edit', title: '编辑 · P1', demos: editDemos },
	{ id: 'group-drag', title: '拖拽 · P2', demos: dragDemos },
	{ id: 'group-perf', title: '性能 · P7', demos: perfDemos }
];

/** 按 id 取单个 demo 元数据（供分组模板 v-bind 使用） */
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
