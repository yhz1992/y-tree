<script setup lang="ts">
import { ref } from 'vue';
import YTree from '../../components/y-tree/y-tree.component.vue';
import DemoCard from '../DemoCard.vue';
import { demoMeta } from '../registry';
import type { YTreeChkboxType, YTreeNode } from '../../../../common/model';

const radioData: Array<YTreeNode> = [
	{
		id: 'A',
		name: '部门 A',
		expanded: true,
		children: [
			{ id: 'A-1', name: 'A-1', children: [] },
			{ id: 'A-2', name: 'A-2', children: [] }
		]
	},
	{
		id: 'B',
		name: '部门 B',
		expanded: true,
		children: [
			{ id: 'B-1', name: 'B-1', children: [] },
			{ id: 'B-2', name: 'B-2', children: [] }
		]
	}
];

const chkboxData: Array<YTreeNode> = [
	{
		id: '1',
		name: '节点 1',
		expanded: true,
		children: [
			{ id: '1-1', name: '节点 1-1', children: [] },
			{ id: '1-2', name: '节点 1-2', children: [] },
			{
				id: '1-3',
				name: '节点 1-3',
				expanded: true,
				children: [
					{ id: '1-3-1', name: '节点 1-3-1', children: [] },
					{ id: '1-3-2', name: '节点 1-3-2', children: [] }
				]
			}
		]
	},
	{ id: '2', name: '节点 2', children: [] }
];

const namesOf = (treeRef: any) => {
	const list = treeRef.value?.getCheckedList(false) ?? [];
	return list.map((n: any) => n.name).join('、') || '（无）';
};

/* ---------- 1. radio 整树互斥 ---------- */
const radioAllRef = ref<any>(null);
const radioAllLog = ref('（点击单选，整树只能勾选一个）');
const onRadioAll = (e: any) => {
	radioAllLog.value = `勾选 ${e.id}｜当前：${namesOf(radioAllRef)}`;
};

/* ---------- 2. radio 同级互斥 ---------- */
const radioLevelRef = ref<any>(null);
const radioLevelLog = ref('（同级互斥，跨级可并存）');
const onRadioLevel = (e: any) => {
	radioLevelLog.value = `勾选 ${e.id}｜当前：${namesOf(radioLevelRef)}`;
};

/* ---------- 3. chkboxType ---------- */
const chkboxRef = ref<any>(null);
const mode = ref<'ps' | 's' | 'p' | 'none'>('s');
const chkboxLog = ref('（切换联动方向后勾选观察）');
const chkboxType = (): YTreeChkboxType => {
	if (mode.value === 'none') return { Y: '', N: '' };
	if (mode.value === 'ps') return { Y: 'ps', N: 'ps' };
	if (mode.value === 's') return { Y: 's', N: 's' };
	return { Y: 'p', N: 'p' };
};
const onChkbox = (e: any) => {
	chkboxLog.value = `勾选 ${e.id}=${e.checked}｜当前：${namesOf(chkboxRef)}`;
};

/* ---------- 4. 全选 ---------- */
const checkAllRef = ref<any>(null);
const checkAllLog = ref('（点击全选 / 全不选）');
const refreshAll = (action: string) => {
	checkAllLog.value = `${action}｜当前：${namesOf(checkAllRef)}`;
};

/* ---------- 5. 程序化勾选 ---------- */
const checkNodeRef = ref<any>(null);
const checkNodeLog = ref('（先勾选几个节点，再点「查看变更」）');
</script>

<template>
	<DemoCard v-bind="demoMeta('radio-all')">
		<YTree
			ref="radioAllRef"
			:datasource="radioData"
			checkable
			chk-style="radio"
			radio-type="all"
			:height="196"
			@checked-change="onRadioAll"
		/>
		<p class="demo-tip">
			<code>chkStyle="radio"</code>
			+
			<code>radioType="all"</code>
			：整棵树只能勾选一个节点，勾选新节点会清掉旧的。
		</p>
		<pre class="demo-log">{{ radioAllLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('radio-level')">
		<YTree
			ref="radioLevelRef"
			:datasource="radioData"
			checkable
			chk-style="radio"
			radio-type="level"
			:height="196"
			@checked-change="onRadioLevel"
		/>
		<p class="demo-tip">
			<code>radioType="level"</code>
			：同一父节点下的兄弟互斥；不同层级（如 A 与 A-1）可以同时勾选。
		</p>
		<pre class="demo-log">{{ radioLevelLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('chkbox-type')">
		<div class="demo-toolbar" style="margin-bottom: 8px">
			<button type="button" @click="mode = 'ps'">双向 ps{{ mode === 'ps' ? ' ✓' : '' }}</button>
			<button type="button" @click="mode = 's'">只子孙 s{{ mode === 's' ? ' ✓' : '' }}</button>
			<button type="button" @click="mode = 'p'">只祖先 p{{ mode === 'p' ? ' ✓' : '' }}</button>
			<button type="button" @click="mode = 'none'">不联动{{ mode === 'none' ? ' ✓' : '' }}</button>
		</div>
		<YTree
			:key="mode"
			ref="chkboxRef"
			:datasource="chkboxData"
			checkable
			:chkbox-type="chkboxType()"
			:height="224"
			@checked-change="onChkbox"
		/>
		<p class="demo-tip">
			<code>chkboxType</code>
			控制联动方向：
			<code>s</code>
			只改子孙、
			<code>p</code>
			只改祖先、空字符串完全不联动。切换模式会重建树。
		</p>
		<pre class="demo-log">{{ chkboxLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('check-all')">
		<YTree
			ref="checkAllRef"
			:datasource="chkboxData"
			checkable
			:height="224"
			@checked-change="refreshAll('勾选变化')"
		/>
		<div class="demo-toolbar" style="margin-top: 10px">
			<button
				type="button"
				@click="
					checkAllRef?.checkAllNodes(true);
					refreshAll('checkAllNodes(true)');
				"
			>
				全选
			</button>
			<button
				type="button"
				@click="
					checkAllRef?.cancelAllNodes();
					refreshAll('cancelAllNodes()');
				"
			>
				全不选
			</button>
		</div>
		<p class="demo-tip">
			<code>checkAllNodes(true)</code>
			全选，
			<code>cancelAllNodes()</code>
			全不选。radio 模式下全选无效。
		</p>
		<pre class="demo-log">{{ checkAllLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('check-node')">
		<YTree ref="checkNodeRef" :datasource="chkboxData" checkable :height="224" />
		<div class="demo-toolbar" style="margin-top: 10px">
			<button
				type="button"
				@click="
					checkNodeLog = `checkNode('1-1', true) => ${checkNodeRef?.checkNode('1-1', true)}｜当前：${namesOf(
						checkNodeRef
					)}`
				"
			>
				勾选「节点 1-1」
			</button>
			<button
				type="button"
				@click="
					checkNodeLog = `getChangeCheckedNodes() => ${
						(checkNodeRef?.getChangeCheckedNodes() ?? []).map((n: any) => n.name).join('、') || '（无变更）'
					}`
				"
			>
				查看变更
			</button>
		</div>
		<p class="demo-tip">
			<code>checkNode</code>
			走 API 通道，可改 disabled 节点；
			<code>getChangeCheckedNodes</code>
			对比 init 时的勾选快照。
		</p>
		<pre class="demo-log">{{ checkNodeLog }}</pre>
	</DemoCard>
</template>
