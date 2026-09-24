<script setup lang="ts">
import { ref } from 'vue';
import YTree from '../../components/y-tree/y-tree.component.vue';
import DemoCard from '../DemoCard.vue';
import { demoMeta } from '../registry';
import type { YTreeNode } from '../../../../common/model';

/** 模拟后端接口：延迟返回子节点数据 */
function mockFetch(parentId: string | number): Promise<Array<YTreeNode>> {
	return new Promise(resolve => {
		window.setTimeout(() => {
			const prefix = String(parentId);
			const children = Array.from({ length: 3 }, (_, i) => ({
				id: `${prefix}-${i + 1}`,
				name: `子节点 ${prefix}-${i + 1}`,
				children: []
			})) as Array<YTreeNode>;
			resolve(children);
		}, 600);
	});
}

/* ---------- 1. 懒加载 ---------- */
const lazyData: Array<YTreeNode> = [
	{ id: '1', name: '节点 1（展开触发加载）', isParent: true, children: [] },
	{ id: '2', name: '节点 2（展开触发加载）', isParent: true, children: [] },
	{ id: '3', name: '节点 3（叶子，无箭头）', children: [] }
];
const lazyLog = ref('（点击展开箭头，观察懒加载过程）');
const lazyLoadData = (node: any) => mockFetch(node.id);

const lazyBeforeAsync = (e: any) => {
	lazyLog.value = `beforeAsync: id=${e.id}（from=${e.from}）→ 允许加载`;
	return true;
};
const lazySuccess = (e: any) => {
	lazyLog.value = `onAsyncSuccess: id=${e.id}，加载到 ${e.children.length} 个子节点`;
};

/* ---------- 2. 加载中状态 ---------- */
const slowFetch = (parentId: string | number): Promise<Array<YTreeNode>> =>
	new Promise(resolve => {
		window.setTimeout(() => {
			resolve(
				Array.from({ length: 3 }, (_, i) => ({
					id: `${parentId}-${i + 1}`,
					name: `${parentId}-${i + 1}`,
					children: []
				})) as Array<YTreeNode>
			);
		}, 2000);
	});

const loadingData: Array<YTreeNode> = [{ id: 'A', name: '节点 A（加载需 2 秒）', isParent: true, children: [] }];
const loadingLog = ref('（点击展开箭头，观察 loading 图标）');
const loadingLoadData = (node: any) => slowFetch(node.id);
const loadingSuccess = (e: any) => {
	loadingLog.value = `onAsyncSuccess: id=${e.id}，加载完成`;
};

/* ---------- 3. 异步回调 ---------- */
const callbackData: Array<YTreeNode> = [
	{ id: 'OK', name: '节点 OK（会加载成功）', isParent: true, children: [] },
	{ id: 'ERR', name: '节点 ERR（会加载失败）', isParent: true, children: [] }
];
const callbackLog = ref('（展开 OK / ERR 节点，对比成功与失败日志）');
const append = (msg: string) => {
	callbackLog.value = msg + '\n' + callbackLog.value.slice(0, 400);
};

const callbackLoadData = (node: any): Promise<Array<YTreeNode>> =>
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
					children: []
				})) as Array<YTreeNode>
			);
		}, 700);
	});

const callbackBeforeAsync = (e: any) => {
	append(`beforeAsync id=${e.id} from=${e.from}`);
	return true;
};
const callbackSuccess = (e: any) => append(`onAsyncSuccess id=${e.id} children=${e.children.length}`);
const callbackError = (e: any) => append(`onAsyncError id=${e.id} error=${e.error.message}`);

/* ---------- 4. 刷新子节点 ---------- */
const refreshRef = ref<any>(null);
const refreshData: Array<YTreeNode> = [
	{ id: '1', name: '节点 1', isParent: true, children: [] },
	{ id: '2', name: '节点 2', isParent: true, children: [] }
];
const refreshLog = ref('（先展开节点 1，再点击刷新按钮）');
const round = ref(0);

const refreshLoadData = (node: any): Promise<Array<YTreeNode>> =>
	new Promise(resolve => {
		window.setTimeout(() => {
			resolve(
				Array.from({ length: 3 }, (_, i) => ({
					id: `${node.id}-${round.value}-${i + 1}`,
					name: `第 ${round.value + 1} 批 · 子节点 ${i + 1}`,
					children: []
				})) as Array<YTreeNode>
			);
		}, 500);
	});

const nextRound = () => {
	round.value += 1;
};

const doRefresh = async () => {
	const ok = await refreshRef.value?.reAsyncChildNodes('1');
	refreshLog.value = `reAsyncChildNodes("1") => ${ok}`;
};

/* ---------- 5. 根节点异步 ---------- */
const rootLog = ref('（初始 datasource 为空，自动异步加载根节点）');

const rootLoadData = (node: any): Promise<Array<YTreeNode>> =>
	new Promise(resolve => {
		rootLog.value = `loadData 收到虚拟根节点：id="${node.id}", name="${node.name}", isRoot=${node.isRoot}`;
		window.setTimeout(() => {
			resolve([
				{ id: 'r1', name: '根节点 1', isParent: true, children: [] },
				{ id: 'r2', name: '根节点 2', children: [] }
			] as Array<YTreeNode>);
		}, 700);
	});

const rootSuccess = (e: any) => {
	rootLog.value = `${rootLog.value}\n加载完成，得到 ${e.children.length} 个根节点`;
};
</script>

<template>
	<DemoCard v-bind="demoMeta('lazy-load')">
		<YTree
			:datasource="lazyData"
			lazy
			:load-data="lazyLoadData"
			show-line
			:height="260"
			:before-async="lazyBeforeAsync"
			@async-success="lazySuccess"
		/>
		<p class="demo-tip">
			<code>isParent: true</code>
			标记有子节点但尚未加载，首次展开时调用
			<code>loadData</code>
			拉取数据；加载完成后自动展开。
		</p>
		<pre class="demo-log">{{ lazyLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('async-loading')">
		<YTree
			:datasource="loadingData"
			lazy
			:load-data="loadingLoadData"
			show-line
			:height="200"
			@async-success="loadingSuccess"
		/>
		<p class="demo-tip">加载期间箭头变为旋转 loading 图标，该状态下重复点击不会重复发起请求。</p>
		<pre class="demo-log">{{ loadingLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('async-callbacks')">
		<YTree
			:datasource="callbackData"
			lazy
			:load-data="callbackLoadData"
			show-line
			:height="220"
			:before-async="callbackBeforeAsync"
			@async-success="callbackSuccess"
			@async-error="callbackError"
		/>
		<p class="demo-tip">
			<code>beforeAsync</code>
			返回 false 可取消加载；失败时节点不展开，箭头复位可重试。
		</p>
		<pre class="demo-log">{{ callbackLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('async-refresh')">
		<YTree ref="refreshRef" :datasource="refreshData" lazy :load-data="refreshLoadData" show-line :height="240" />
		<div class="demo-toolbar" style="margin: 10px 0 0">
			<button type="button" @click="nextRound">换一批数据（第 {{ round + 1 }} 批）</button>
			<button type="button" @click="doRefresh">刷新「节点 1」的子节点</button>
		</div>
		<p class="demo-tip">先展开节点 1，再点「换一批数据」改变数据源，最后点刷新即可看到子树被整体替换。</p>
		<pre class="demo-log">{{ refreshLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('async-root')">
		<YTree :datasource="[]" lazy :load-data="rootLoadData" show-line :height="200" @async-success="rootSuccess" />
		<p class="demo-tip">
			datasource 为空时组件自动加载根节点，
			<code>loadData</code>
			收到 id 为
			<code>__yt_root__</code>
			的虚拟根节点；加载到的数组即为树的根节点集合。
		</p>
		<pre class="demo-log">{{ rootLog }}</pre>
	</DemoCard>
</template>
