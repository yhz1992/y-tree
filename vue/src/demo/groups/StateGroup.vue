<script setup lang="ts">
import { ref } from 'vue';
import YTree from '../../components/y-tree/y-tree.component.vue';
import DemoCard from '../DemoCard.vue';
import { demoMeta } from '../registry';
import { basicData, checkData, collectIds } from '../data';
import type { YTreeNode } from '../../../../common/model';

const disabledData: Array<YTreeNode> = [
	{
		id: '1',
		name: '节点 1',
		expanded: true,
		children: [
			{ id: '1-1', name: '节点 1-1', children: [] },
			{ id: '1-2', name: '节点 1-2（disabled）', disabled: true, children: [] }
		]
	},
	{ id: '2', name: '节点 2（disabled）', disabled: true, children: [] },
	{ id: '3', name: '节点 3', children: [] }
];

const nocheckData: Array<YTreeNode> = [
	{
		id: '1',
		name: '节点 1',
		expanded: true,
		children: [
			{ id: '1-1', name: '节点 1-1', children: [] },
			{ id: '1-2', name: '节点 1-2', children: [] }
		]
	},
	{ id: '2', name: '节点 2（nocheck）', nocheck: true, children: [] },
	{ id: '3', name: '节点 3', children: [] }
];

const hideData: Array<YTreeNode> = [
	{
		id: '1',
		name: '节点 1',
		expanded: true,
		children: [
			{ id: '1-1', name: '节点 1-1', children: [] },
			{ id: '1-2', name: '节点 1-2（hide）', hide: true, children: [] }
		]
	},
	{ id: '2', name: '节点 2（hide）', hide: true, children: [] },
	{ id: '3', name: '节点 3', children: [] }
];

/**
 * 受控勾选演示数据：不带内联 checked，
 * 勾选状态完全由 checkedIds 受控（空数组表示全不勾选）
 */
const controlledData: Array<YTreeNode> = [
	{
		id: '1',
		name: '节点 1',
		expanded: true,
		children: [
			{ id: '1-1', name: '节点 1-1', children: [] },
			{ id: '1-2', name: '节点 1-2', children: [] },
			{ id: '1-3', name: '节点 1-3', children: [] }
		]
	},
	{ id: '2', name: '节点 2', children: [] }
];

/* ---------- 勾选框 ---------- */
const checkableRef = ref<any>(null);
const checkLog = ref('（点击勾选框观察父子联动）');

const onCheckedChange = (e: any) => {
	const list = checkableRef.value?.getCheckedList() ?? [];
	checkLog.value = `onCheckedChange: id=${e.id}, checked=${e.checked}｜全树已勾选 ${list.length} 个节点`;
};

/* ---------- 受控勾选 ---------- */
const controlledRef = ref<any>(null);
const checkedIds = ref<Array<string | number>>(['1-2']);
const controlledLog = ref('受控 checkedIds = ["1-2"]');

const checkAll = () => {
	checkedIds.value = collectIds(controlledData);
	controlledLog.value = '全选：checkedIds = 全部节点';
};

const clearAll = () => {
	checkedIds.value = [];
	controlledLog.value = '清空：checkedIds = []';
};

const syncChecked = (e: any) => {
	const ids = controlledRef.value?.getCheckedList()?.map((n: any) => n.id) ?? [];
	checkedIds.value = ids;
	controlledLog.value = `onCheckedChange: id=${e.id}｜checkedIds 已同步为 ${ids.length} 项`;
};

/* ---------- 选中 ---------- */
const selectedIds = ref<Array<string | number>>([]);
const selectLog = ref('（点击节点标题选中，Ctrl/Cmd + 点击多选）');

const onClick = (e: any) => {
	const multi = e.event.ctrlKey || e.event.metaKey;
	if (!multi) {
		selectedIds.value = [e.id];
	} else {
		selectedIds.value = selectedIds.value.includes(e.id)
			? selectedIds.value.filter(id => id !== e.id)
			: [...selectedIds.value, e.id];
	}
	selectLog.value = `selectedIds = [${selectedIds.value.join(', ')}]`;
};
</script>

<template>
	<DemoCard v-bind="demoMeta('checkable')">
		<YTree
			ref="checkableRef"
			:datasource="checkData"
			checkable
			expand-all
			:height="196"
			@checked-change="onCheckedChange"
		/>
		<p class="demo-tip">{{ checkLog }}</p>
	</DemoCard>

	<DemoCard v-bind="demoMeta('check-strictly')">
		<div class="demo-row">
			<div class="demo-col">
				<div class="demo-col-label">默认：父子联动</div>
				<YTree :datasource="checkData" checkable expand-all :height="196" />
			</div>
			<div class="demo-col">
				<div class="demo-col-label">checkStrictly：互不联动</div>
				<YTree :datasource="checkData" checkable check-strictly expand-all :height="196" />
			</div>
		</div>
	</DemoCard>

	<DemoCard v-bind="demoMeta('controlled')">
		<div class="demo-toolbar">
			<button type="button" @click="checkAll">全选</button>
			<button type="button" @click="clearAll">清空</button>
		</div>
		<YTree
			ref="controlledRef"
			:datasource="controlledData"
			checkable
			:checked-ids="checkedIds"
			:height="140"
			@checked-change="syncChecked"
		/>
		<p class="demo-tip">{{ controlledLog }}</p>
	</DemoCard>

	<DemoCard v-bind="demoMeta('select')">
		<YTree :datasource="basicData" expand-all :selected-ids="selectedIds" :height="140" @click="onClick" />
		<p class="demo-tip">{{ selectLog }}</p>
	</DemoCard>

	<DemoCard v-bind="demoMeta('disabled')">
		<YTree :datasource="disabledData" checkable expand-all :height="140" />
	</DemoCard>

	<DemoCard v-bind="demoMeta('nocheck')">
		<YTree :datasource="nocheckData" checkable expand-all :height="140" />
	</DemoCard>

	<DemoCard v-bind="demoMeta('hide')">
		<YTree :datasource="hideData" expand-all :height="84" />
	</DemoCard>
</template>
