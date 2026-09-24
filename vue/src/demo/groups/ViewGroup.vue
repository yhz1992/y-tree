<script setup lang="ts">
import { ref } from 'vue';
import YTree from '../../components/y-tree/y-tree.component.vue';
import DemoCard from '../DemoCard.vue';
import { demoMeta } from '../registry';
import type { YTreeNode } from '../../../../common/model';

const iconData: Array<YTreeNode> = [
	{
		id: '1',
		name: '项目文档',
		expanded: true,
		iconSkin: 'p5',
		children: [
			{ id: '1-1', name: 'README.md', icon: 'fa-brands fa-markdown', children: [] },
			{ id: '1-2', name: '设计稿.png', icon: 'fa-regular fa-image', children: [] }
		]
	},
	{
		id: '2',
		name: '源码',
		iconOpen: 'fa-solid fa-folder-open',
		iconClose: 'fa-solid fa-folder',
		expanded: true,
		children: [
			{ id: '2-1', name: 'index.ts', icon: 'fa-solid fa-code', children: [] },
			{ id: '2-2', name: 'utils.ts', icon: 'fa-solid fa-code', children: [] }
		]
	}
];

const fontData: Array<YTreeNode> = [
	{
		id: '1',
		name: '普通节点',
		expanded: true,
		children: [
			{ id: '1-1', name: '高亮节点', children: [] },
			{ id: '1-2', name: '警告节点', children: [] }
		]
	},
	{ id: '2', name: '叶子', children: [] }
];

const titleData: Array<YTreeNode> = [
	{
		id: '1',
		name: '部门 A',
		title: '总部 · 研发中心',
		expanded: true,
		children: [
			{ id: '1-1', name: 'A-1', title: '前端组', children: [] },
			{ id: '1-2', name: 'A-2', children: [] }
		]
	},
	{ id: '2', name: '部门 B', children: [] }
];

const basicData: Array<YTreeNode> = [
	{
		id: '1',
		name: '节点 1',
		expanded: true,
		children: [
			{ id: '1-1', name: '节点 1-1', children: [] },
			{ id: '1-2', name: '节点 1-2', children: [] }
		]
	},
	{ id: '2', name: '节点 2', children: [] },
	{ id: '3', name: '节点 3', children: [] }
];

const showIcon = ref(true);

const fontCss = (node: any): Record<string, string> => {
	if (node.id === '1-1') return { color: '#1677ff', fontWeight: '700' };
	if (node.id === '1-2') return { color: '#fa541c' };
	return {};
};

const dblEnabled = ref(true);
const dblLog = ref('（双击标题观察是否展开）');
const onDbl = (e: any) => {
	dblLog.value = `dbClick ${e.id}`;
};
const onDblExpand = (e: any) => {
	dblLog.value = `expandChange ${e.id} => ${e.expand}`;
};

const speed = ref<'fast' | 'slow' | 0>('fast');

const multi = ref(true);
const multiRef = ref<any>(null);
const multiLog = ref('（点击节点选中，Ctrl/Cmd 追加）');
const namesOfSelected = () => {
	const list = multiRef.value?.getSelectedNodes() ?? [];
	return list.map((n: any) => n.name).join('、') || '（无）';
};
</script>

<template>
	<DemoCard v-bind="demoMeta('node-icon')">
		<div class="demo-toolbar" style="margin-bottom: 8px">
			<button type="button" @click="showIcon = !showIcon">showIcon={{ String(showIcon) }}</button>
		</div>
		<YTree :datasource="iconData" :show-icon="showIcon" :height="168" />
		<p class="demo-tip">
			<code>icon</code>
			指定 class / 图片 URL；父节点可用
			<code>iconOpen</code>
			/
			<code>iconClose</code>
			；
			<code>iconSkin</code>
			渲染为
			<code>y-tree-icon-skin-skinName</code>
			。
			<code>showIcon=false</code>
			关闭图标。
		</p>
	</DemoCard>

	<DemoCard v-bind="demoMeta('font-css')">
		<YTree :datasource="fontData" :height="140" :font-css="fontCss" />
		<p class="demo-tip">
			<code>fontCss</code>
			按节点返回样式，可用于搜索命中高亮、标记异常节点。
		</p>
	</DemoCard>

	<DemoCard v-bind="demoMeta('node-title')">
		<YTree :datasource="titleData" :height="140" />
		<p class="demo-tip">
			鼠标悬停标题显示
			<code>title</code>
			；未设置时回退为
			<code>name</code>
			。
			<code>showTitle=false</code>
			关闭提示。
		</p>
	</DemoCard>

	<DemoCard v-bind="demoMeta('dblclick-expand')">
		<div class="demo-toolbar" style="margin-bottom: 8px">
			<button type="button" @click="dblEnabled = !dblEnabled">dblClickExpand={{ String(dblEnabled) }}</button>
		</div>
		<YTree
			:key="String(dblEnabled)"
			:datasource="basicData"
			:dbl-click-expand="dblEnabled"
			:height="140"
			@db-click="onDbl"
			@expand-change="onDblExpand"
		/>
		<p class="demo-tip">
			<code>dblClickExpand</code>
			默认 true。开启编辑时双击优先进入重命名，不会折叠。
		</p>
		<pre class="demo-log">{{ dblLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('expand-speed')">
		<div class="demo-toolbar" style="margin-bottom: 8px">
			<button type="button" @click="speed = 'fast'">fast{{ speed === 'fast' ? ' ✓' : '' }}</button>
			<button type="button" @click="speed = 'slow'">slow{{ speed === 'slow' ? ' ✓' : '' }}</button>
			<button type="button" @click="speed = 0">关闭{{ speed === 0 ? ' ✓' : '' }}</button>
		</div>
		<YTree :key="String(speed)" :datasource="basicData" :expand-speed="speed" :height="140" />
		<p class="demo-tip">
			<code>expandSpeed</code>
			控制展开/折叠过渡；默认关闭，避免大数据虚拟滚动抖动。
		</p>
	</DemoCard>

	<DemoCard v-bind="demoMeta('selected-multi')">
		<div class="demo-toolbar" style="margin-bottom: 8px">
			<button
				type="button"
				@click="
					multi = !multi;
					multiRef?.cancelSelectedNode();
					multiLog = '已清空选中';
				"
			>
				selectedMulti={{ String(multi) }}
			</button>
			<button
				type="button"
				@click="
					multiRef?.selectNode('1-1', true);
					multiLog = `selectNode('1-1', true)｜当前：${namesOfSelected()}`;
				"
			>
				追加选中 1-1
			</button>
			<button
				type="button"
				@click="
					multiRef?.cancelSelectedNode();
					multiLog = 'cancelSelectedNode()';
				"
			>
				清空选中
			</button>
		</div>
		<YTree
			ref="multiRef"
			:datasource="basicData"
			:selected-multi="multi"
			:height="140"
			@click="multiLog = `当前：${namesOfSelected()}`"
		/>
		<p class="demo-tip">
			点击节点高亮选中；
			<code>selectedMulti=true</code>
			时 Ctrl/Cmd 追加。组件内部维护选中，不再需要外部同步
			<code>selectedIds</code>
			。
		</p>
		<pre class="demo-log">{{ multiLog }}</pre>
	</DemoCard>
</template>
