<script setup lang="ts">
import { ref, nextTick } from 'vue';
import YTree from '../../components/y-tree/y-tree.component.vue';
import DemoCard from '../DemoCard.vue';
import { demoMeta } from '../registry';
import { dragData } from '../data';
import type { YTreeNode } from '../../../../common/model';

/* ---------- 拖拽移动 ---------- */
const moveLog = ref('（拖拽节点到目标位置，观察三种落点）');

const onMove = (e: any) => {
	moveLog.value = `onNodeChange: ${e.sourceId} → ${e.targetId}（position = ${e.position}）`;
};

/* ---------- 拖拽复制 ---------- */
const copyLog = ref('（按住 Ctrl / Cmd 拖拽节点，观察复制效果）');

const onCopyDrop = (e: any) => {
	copyLog.value = `onDrop: moveType = ${e.moveType}`;
};

const onCopyNodeChange = (e: any) => {
	copyLog.value += `｜${e.sourceId} → ${e.targetId} (${e.position})`;
};

/* ---------- 拖拽限制 ---------- */
const limitLog = ref('（只有叶子节点可拖拽，且不能拖到 B）');

const allowDragNode = (node: any) => node.childIds.length === 0;
const allowDropNode = (_sourceId: any, targetId: any) => targetId !== 'b';

const onLimitMove = (e: any) => {
	limitLog.value = `onNodeChange: ${e.sourceId} → ${e.targetId} (${e.position})`;
};

/* ---------- 拖拽回调 ---------- */
const callbackLog = ref('（拖拽节点观察回调触发顺序）');
const append = (msg: string) => {
	callbackLog.value = msg + '\n' + callbackLog.value.slice(0, 400);
};

const beforeDrag = (e: any) => {
	append(`beforeDrag id=${e.sourceId}`);
	return true;
};

const beforeDrop = (e: any) => {
	append(`beforeDrop ${e.sourceId} → ${e.targetId} (${e.position})`);
	return true;
};

const onDrag = (e: any) => append(`onDrag id=${e.sourceId} copy=${e.isCopy}`);
const onDragMove = (e: any) => append(`onDragMove ${e.sourceId} → ${e.targetId} (${e.position})`);
const onDrop = (e: any) => append(`onDrop ${e.sourceId} → ${e.targetId} (${e.position}) moveType=${e.moveType}`);
const onCallbackNodeChange = (e: any) => append(`onNodeChange ${e.sourceId} → ${e.targetId} (${e.position})`);

/* ---------- 程序化拖拽 ---------- */
const apiRef = ref<any>(null);
const apiData = ref<Array<YTreeNode>>([...dragData]);
const apiLog = ref('（点击按钮以程序方式移动 / 复制节点）');

const apiMove = async () => {
	apiData.value = [...dragData];
	// 等待 YTree 重建 service 后再执行操作
	await nextTick();
	const ok = apiRef.value?.moveNode('b', 'a', 'prev');
	apiLog.value = `moveNode("b", "a", "prev") => ${ok}`;
};

const apiCopy = async () => {
	apiData.value = [...dragData];
	await nextTick();
	const newId = apiRef.value?.copyNode('c', 'a', 'next');
	apiLog.value = `copyNode("c", "a", "next") => ${newId}`;
};
</script>

<template>
	<DemoCard v-bind="demoMeta('drag-move')">
		<YTree :datasource="dragData" show-line expand-all draggable :height="140" @node-change="onMove" />
		<p class="demo-tip">拖到节点中间：移入其内部（inner）；拖到节点上 / 下边缘：移到其前 / 后（prev / next）。</p>
		<pre class="demo-log">{{ moveLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('drag-copy')">
		<YTree
			:datasource="dragData"
			show-line
			expand-all
			draggable
			is-copy
			:height="140"
			@drop="onCopyDrop"
			@node-change="onCopyNodeChange"
		/>
		<p class="demo-tip">按住 Ctrl / Cmd 拖拽会复制节点（含整棵子树、id 重映射），不按则为移动。</p>
		<pre class="demo-log">{{ copyLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('drag-limit')">
		<YTree
			:datasource="dragData"
			show-line
			expand-all
			draggable
			:allow-drag="allowDragNode"
			:allow-drop="allowDropNode"
			:min-move-size="6"
			:height="140"
			@node-change="onLimitMove"
		/>
		<p class="demo-tip">allowDrag / allowDrop 按节点与落点精细控制；minMoveSize 设置触发拖拽的最小移动距离。</p>
		<pre class="demo-log">{{ limitLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('drag-callbacks')">
		<YTree
			:datasource="dragData"
			show-line
			expand-all
			draggable
			:height="140"
			:before-drag="beforeDrag"
			:before-drop="beforeDrop"
			@drag="onDrag"
			@drag-move="onDragMove"
			@drop="onDrop"
			@node-change="onCallbackNodeChange"
		/>
		<pre class="demo-log">{{ callbackLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('drag-api')">
		<YTree ref="apiRef" :datasource="apiData" show-line expand-all :height="140" />
		<div class="demo-toolbar" style="margin: 10px 0 0">
			<button type="button" @click="apiMove">moveNode(B → A prev)</button>
			<button type="button" @click="apiCopy">copyNode(C → A next)</button>
		</div>
		<p class="demo-tip">{{ apiLog }}</p>
	</DemoCard>
</template>
