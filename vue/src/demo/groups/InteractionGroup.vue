<script setup lang="ts">
import { ref } from 'vue';
import YTree from '../../components/y-tree/y-tree.component.vue';
import DemoCard from '../DemoCard.vue';
import { demoMeta } from '../registry';
import { basicData } from '../data';

/* ---------- 搜索过滤 ---------- */
const keyword = ref('');

/* ---------- 节点事件 ---------- */
const eventLog = ref('（点击 / 双击 / 右键节点，或操作展开与勾选）');
const append = (msg: string) => {
	eventLog.value = msg + '\n' + eventLog.value.slice(0, 300);
};

const onNodeClick = (e: any) => append(`onClick id=${e.id}`);
const onNodeDbClick = (e: any) => append(`onDbClick id=${e.id}`);
const onNodeContextMenu = (e: any) => append(`onContextMenu id=${e.id}`);
const onNodeExpand = (e: any) => append(`onExpandChange id=${e.id} expand=${e.expand}`);
const onNodeChecked = (e: any) => append(`onCheckedChange id=${e.id} checked=${e.checked}`);
</script>

<template>
	<DemoCard v-bind="demoMeta('search')">
		<div class="demo-toolbar">
			<input v-model="keyword" class="demo-input" placeholder="输入关键字，如 节点 1-2" />
			<button type="button" @click="keyword = ''">清空</button>
		</div>
		<YTree :datasource="basicData" expand-all :search-value="keyword" :height="140" />
		<p class="demo-tip">
			{{
				keyword ? `searchValue = "${keyword}"，仅渲染名称包含该关键字的节点` : 'searchValue 为空，渲染全部节点'
			}}
		</p>
	</DemoCard>

	<DemoCard v-bind="demoMeta('events')">
		<YTree
			:datasource="basicData"
			checkable
			expand-all
			:height="140"
			@click="onNodeClick"
			@db-click="onNodeDbClick"
			@context-menu="onNodeContextMenu"
			@expand-change="onNodeExpand"
			@checked-change="onNodeChecked"
		/>
		<pre class="demo-log">{{ eventLog }}</pre>
	</DemoCard>
</template>
