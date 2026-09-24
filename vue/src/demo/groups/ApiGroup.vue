<script setup lang="ts">
import { ref } from 'vue';
import YTree from '../../components/y-tree/y-tree.component.vue';
import DemoCard from '../DemoCard.vue';
import { demoMeta } from '../registry';
import { basicData } from '../data';
import type { YTreeFlatNode, YTreeNode } from '../../../../common/model';

const names = (list: Array<{ name: string }>) => list.map(n => n.name).join('、') || '（无）';

const queryRef = ref<any>(null);
const queryLog = ref('（点按钮查询当前树）');

const doGetNodes = () => {
	queryLog.value = `getNodes()｜根：${names(queryRef.value?.getNodes() ?? [])}`;
};
const doExact = () => {
	queryLog.value = `getNodesByParam('name','节点 1-1')｜${names(
		queryRef.value?.getNodesByParam('name', '节点 1-1') ?? []
	)}`;
};
const doFuzzy = () => {
	queryLog.value = `getNodesByParamFuzzy('name','1-')｜${names(
		queryRef.value?.getNodesByParamFuzzy('name', '1-') ?? []
	)}`;
};
const doIndex = () => {
	queryLog.value = `getNodeIndex('1-2') = ${queryRef.value?.getNodeIndex('1-2')}`;
};

const transformRef = ref<any>(null);
const transformLog = ref('（点按钮看扁平 / 嵌套结果）');
const sampleFlat: Array<YTreeFlatNode> = [
	{ id: 'a', name: 'A', pId: '' },
	{ id: 'a-1', name: 'A-1', pId: 'a' },
	{ id: 'b', name: 'B', pId: '' }
];

const doToArray = () => {
	transformLog.value = `transformToArray()｜${(transformRef.value?.transformToArray() ?? [])
		.map((n: any) => n.id)
		.join(' → ')}`;
};
const doToNested = () => {
	const nested = (transformRef.value?.transformToTreeNodes() ?? []) as Array<YTreeNode>;
	const summarize = (nodes: Array<YTreeNode>) =>
		nodes.map(n => `${n.name}[${(n.children ?? []).map(c => c.name).join(',')}]`).join('；');
	transformLog.value = `transformToTreeNodes()｜${summarize(nested)}`;
};
const doFromFlat = () => {
	const nested = (transformRef.value?.transformToTreeNodesFromFlat(sampleFlat) ?? []) as Array<YTreeNode>;
	transformLog.value = `fromFlat([A,A-1,B])｜根 ${nested.map(n => n.name).join('、')}，A 子 ${
		nested[0]?.children?.map(c => c.name).join('、') || '（无）'
	}`;
};

const updateRef = ref<any>(null);
const updateLog = ref('（点按钮热更新展示字段）');

const doRename = () => {
	updateLog.value = `updateNode('1-1', { name }) => ${updateRef.value?.updateNode('1-1', {
		name: '节点 1-1（已改名）'
	})}`;
};
const doHide = () => {
	updateLog.value = `updateNode('2', { hide: true }) => ${updateRef.value?.updateNode('2', {
		hide: true
	})}（节点 2 隐藏）`;
};
const doShow = () => {
	updateLog.value = `updateNode('2', { hide: false }) => ${updateRef.value?.updateNode('2', { hide: false })}`;
};

const expandRef = ref<any>(null);
const expandLog = ref('（先折叠节点 1，再程序化展开）');

const doCollapse = () => {
	expandLog.value = `expandNode('1', false) => ${expandRef.value?.expandNode('1', false)}`;
};
const doExpand = () => {
	expandLog.value = `expandNode('1', true) => ${expandRef.value?.expandNode('1', true)}`;
};
const doExpandParent = () => {
	expandRef.value?.expandNode('1', false);
	expandLog.value = `expandCollapseParentNode('1-1', true) => ${expandRef.value?.expandCollapseParentNode(
		'1-1',
		true
	)}`;
};

const beforeLog = ref('点节点 2 拦点击；折叠节点 1 拦；勾选 1-1 拦');

const beforeClick = (e: any) => {
	if (e.id === '2') {
		beforeLog.value = 'beforeClick 拦截节点 2，不选中、不发 click';
		return false;
	}
	beforeLog.value = `click ${e.id}`;
	return true;
};
const beforeExpand = (e: any) => {
	beforeLog.value = `beforeExpand ${e.id}`;
	return true;
};
const beforeCollapse = (e: any) => {
	if (e.id === '1') {
		beforeLog.value = 'beforeCollapse 拦截节点 1，保持展开';
		return false;
	}
	beforeLog.value = `beforeCollapse ${e.id}`;
	return true;
};
const beforeCheck = (e: any) => {
	if (e.id === '1-1') {
		beforeLog.value = 'beforeCheck 拦截节点 1-1，勾选框不变';
		return false;
	}
	beforeLog.value = `beforeCheck ${e.id} => ${e.checked}`;
	return true;
};
const onBeforeClick = (e: any) => {
	beforeLog.value = `${beforeLog.value}｜onClick ${e.id}`;
};
</script>

<template>
	<DemoCard v-bind="demoMeta('query-nodes')">
		<YTree ref="queryRef" :datasource="basicData" :height="140" />
		<div class="demo-toolbar" style="margin-top: 10px">
			<button type="button" @click="doGetNodes">getNodes</button>
			<button type="button" @click="doExact">精确匹配 1-1</button>
			<button type="button" @click="doFuzzy">模糊匹配 1-</button>
			<button type="button" @click="doIndex">兄弟下标 1-2</button>
		</div>
		<p class="demo-tip">
			<code>getNodes</code>
			返回根节点；
			<code>getNodesByParam</code>
			精确匹配，
			<code>getNodesByParamFuzzy</code>
			忽略大小写；
			<code>getNodeIndex</code>
			返回兄弟下标，找不到为 -1。
		</p>
		<pre class="demo-log">{{ queryLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('transform')">
		<YTree ref="transformRef" :datasource="basicData" :height="140" />
		<div class="demo-toolbar" style="margin-top: 10px">
			<button type="button" @click="doToArray">当前树 → 扁平</button>
			<button type="button" @click="doToNested">当前树 → 嵌套</button>
			<button type="button" @click="doFromFlat">扁数据 → 嵌套</button>
		</div>
		<p class="demo-tip">
			<code>transformToArray</code>
			DFS 扁平；
			<code>transformToTreeNodes</code>
			还原嵌套；
			<code>transformToTreeNodesFromFlat</code>
			不碰当前树，仅把 id/pId 列表转嵌套。
		</p>
		<pre class="demo-log">{{ transformLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('update-node')">
		<YTree ref="updateRef" :datasource="basicData" checkable :height="140" />
		<div class="demo-toolbar" style="margin-top: 10px">
			<button type="button" @click="doRename">改名 1-1</button>
			<button type="button" @click="doHide">隐藏节点 2</button>
			<button type="button" @click="doShow">显示节点 2</button>
		</div>
		<p class="demo-tip">
			<code>updateNode</code>
			只改 name/title/icon/disabled/hide 等展示字段；
			<code>id</code>
			/
			<code>pId</code>
			/
			<code>childIds</code>
			会被忽略。
			<code>checked</code>
			/
			<code>selected</code>
			走既有状态机。
		</p>
		<pre class="demo-log">{{ updateLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('expand-node')">
		<YTree ref="expandRef" :datasource="basicData" :height="140" />
		<div class="demo-toolbar" style="margin-top: 10px">
			<button type="button" @click="doCollapse">折叠节点 1</button>
			<button type="button" @click="doExpand">展开节点 1</button>
			<button type="button" @click="doExpandParent">展开 1-1 祖先</button>
		</div>
		<p class="demo-tip">
			<code>expandNode(id, expand?, sonSign?)</code>
			：
			<code>expand</code>
			缺省切换；
			<code>sonSign</code>
			递归子孙。
			<code>expandCollapseParentNode</code>
			沿祖先链展开/收起，使目标可见。
		</p>
		<pre class="demo-log">{{ expandLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('before-hooks')">
		<YTree
			:datasource="basicData"
			checkable
			:height="140"
			:before-click="beforeClick"
			:before-expand="beforeExpand"
			:before-collapse="beforeCollapse"
			:before-check="beforeCheck"
			@click="onBeforeClick"
		/>
		<p class="demo-tip">
			<code>beforeClick</code>
			返回 false 取消选中与 click；
			<code>beforeExpand</code>
			/
			<code>beforeCollapse</code>
			拦箭头、双击展开、
			<code>expandNode</code>
			；
			<code>beforeCheck</code>
			只拦勾选框，程序化
			<code>checkNode</code>
			不走。
		</p>
		<pre class="demo-log">{{ beforeLog }}</pre>
	</DemoCard>
</template>
