<script setup lang="ts">
import { ref } from 'vue';
import YTree from '../../components/y-tree/y-tree.component.vue';
import DemoCard from '../DemoCard.vue';
import { demoMeta } from '../registry';
import { basicData, buildLargeData, collectIds } from '../data';
import type { YTreeNode } from '../../../../common/model';

const treeRef = ref<any>(null);
const data = ref<Array<YTreeNode>>(buildLargeData());
const log = ref('已加载 137,256 个节点（6 层 7 叉），全部展开');
const checkLog = ref('（勾选任意节点，观察父子联动范围与耗时）');
const editLog = ref('（重命名 / 拖拽 / 按钮操作观察增量更新耗时）');

const resetCheckLog = () => {
	checkLog.value = '（勾选任意节点，观察父子联动范围与耗时）';
};

const resetEditLog = () => {
	editLog.value = '（重命名 / 拖拽 / 按钮操作观察增量更新耗时）';
};

const loadLarge = () => {
	const start = performance.now();
	const large = buildLargeData();
	const buildCost = performance.now() - start;
	const total = collectIds(large).length;
	data.value = large;
	resetCheckLog();
	resetEditLog();
	requestAnimationFrame(() => {
		const renderCost = performance.now() - start;
		log.value = `已加载 ${total.toLocaleString()} 个节点（6 层 7 叉）｜构建数据 ${buildCost.toFixed(
			1
		)}ms，含首次渲染共 ${renderCost.toFixed(1)}ms`;
	});
};

const loadSmall = () => {
	data.value = basicData;
	log.value = '已恢复为 6 个节点的小数据';
	resetCheckLog();
	resetEditLog();
};

const renameRoot = () => {
	const tree = treeRef.value;
	const roots = tree?.getNodes() ?? [];
	if (!tree || roots.length === 0) {
		return;
	}
	const start = performance.now();
	tree.updateNode(roots[0].id, { name: `重命名 ${Date.now().toString().slice(-4)}` });
	editLog.value = `程序化重命名 id=${roots[0].id}｜${(performance.now() - start).toFixed(2)}ms`;
};

const moveLastRoot = () => {
	const tree = treeRef.value;
	const roots = tree?.getNodes() ?? [];
	if (!tree || roots.length < 2) {
		return;
	}
	const start = performance.now();
	const ok = tree.moveNode(roots[roots.length - 1].id, roots[0].id, 'next');
	editLog.value = `程序化移动 ${String(roots[roots.length - 1].id)} → ${String(roots[0].id)} next ${
		ok ? '成功' : '失败'
	}｜${(performance.now() - start).toFixed(2)}ms`;
};

const onCheckedChange = (e: any) => {
	// 从事件时间戳起算：包含「联动重算」本身的耗时
	const cost = performance.now() - e.event.timeStamp;
	const list = treeRef.value?.getCheckedList() ?? [];
	const action = e.checked ? '勾选' : '取消勾选';
	checkLog.value = `${action} id=${
		e.id
	}｜父子联动后全树共 ${list.length.toLocaleString()} 个节点被勾选｜联动耗时 ${cost.toFixed(1)}ms`;
};

const onRename = (e: any) => {
	const cost = performance.now() - e.event.timeStamp;
	editLog.value = `行内重命名 id=${e.id}｜${cost.toFixed(2)}ms`;
};

const onAdd = (e: any) => {
	const cost = performance.now() - e.event.timeStamp;
	editLog.value = `新增子节点 id=${e.id}｜${cost.toFixed(2)}ms`;
};

const onRemove = (e: any) => {
	const cost = performance.now() - e.event.timeStamp;
	editLog.value = `删除节点 id=${e.id}｜${cost.toFixed(2)}ms`;
};

const onDrop = (e: any) => {
	const cost = performance.now() - e.event.timeStamp;
	editLog.value = `拖拽${e.moveType === 'copy' ? '复制' : '移动'} ${String(e.sourceId)} → ${String(e.targetId)} ${
		e.position
	}｜${cost.toFixed(2)}ms`;
};
</script>

<template>
	<DemoCard v-bind="demoMeta('large-data')">
		<div class="demo-toolbar">
			<button type="button" @click="loadLarge">生成 13.7 万节点</button>
			<button type="button" @click="loadSmall">恢复小数据</button>
			<button type="button" @click="renameRoot">重命名根节点</button>
			<button type="button" @click="moveLastRoot">移动末根到次位</button>
		</div>
		<YTree
			ref="treeRef"
			:datasource="data"
			show-line
			checkable
			editable
			draggable
			expand-all
			:height="400"
			@checked-change="onCheckedChange"
			@rename="onRename"
			@add="onAdd"
			@remove="onRemove"
			@drop="onDrop"
		/>
		<p class="demo-tip">{{ log }}</p>
		<p class="demo-tip">{{ checkLog }}</p>
		<p class="demo-tip">{{ editLog }}</p>
		<p class="demo-tip">
			虚拟滚动只渲染视口内的节点，DOM 数量始终保持常量级；勾选联动走增量更新（只重算受影响的祖先链，O(depth)），
			拖拽/编辑只补丁可见列表，不做 13.7 万行全量 DFS，因此十万级节点下依然流畅。
		</p>
	</DemoCard>
</template>
