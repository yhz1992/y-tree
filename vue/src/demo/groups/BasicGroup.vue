<script setup lang="ts">
import { ref } from 'vue';
import YTree from '../../components/y-tree/y-tree.component.vue';
import DemoCard from '../DemoCard.vue';
import { demoMeta } from '../registry';
import { basicData } from '../data';
import type { YTreeNode } from '../../../../common/model';

/**
 * 展开演示数据：数据源不带内联 expanded，
 * 展开状态完全由 expandIds 受控（空数组表示全部收起）
 */
const expandData: Array<YTreeNode> = [
	{
		id: '1',
		name: '节点 1',
		children: [
			{ id: '1-1', name: '节点 1-1', children: [] },
			{ id: '1-2', name: '节点 1-2', children: [] }
		]
	},
	{ id: '2', name: '节点 2', children: [] },
	{ id: '3', name: '节点 3', children: [] }
];

const expandIds = ref<Array<string | number>>(['1']);
const expandLog = ref('当前受控展开：节点 1');

const expandNode1 = () => {
	expandIds.value = ['1'];
	expandLog.value = '展开节点 1';
};

const collapseAll = () => {
	expandIds.value = [];
	expandLog.value = '全部收起';
};

const onExpandChange = (e: any) => {
	expandIds.value = e.expand ? [...expandIds.value, e.id] : expandIds.value.filter(id => id !== e.id);
	expandLog.value = `onExpandChange: id=${e.id}, expand=${e.expand}`;
};

const sizes = ['small', 'default', 'large'] as const;
</script>

<template>
	<DemoCard v-bind="demoMeta('basic')">
		<YTree :datasource="basicData" :height="140" />
	</DemoCard>

	<DemoCard v-bind="demoMeta('expand')">
		<div class="demo-toolbar">
			<button type="button" @click="expandNode1">展开节点 1</button>
			<button type="button" @click="collapseAll">全部收起</button>
		</div>
		<YTree :datasource="expandData" :expand-ids="expandIds" :height="140" @expand-change="onExpandChange" />
		<p class="demo-tip">{{ expandLog }}</p>
	</DemoCard>

	<DemoCard v-bind="demoMeta('show-line')">
		<YTree :datasource="basicData" show-line expand-all :height="140" />
	</DemoCard>

	<DemoCard v-bind="demoMeta('size')">
		<div class="demo-row">
			<div v-for="size in sizes" :key="size" class="demo-col">
				<div class="demo-col-label">size="{{ size }}"</div>
				<YTree :datasource="basicData" :size="size" expand-all :height="140" />
			</div>
		</div>
	</DemoCard>
</template>
