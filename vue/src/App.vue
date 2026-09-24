<script setup lang="ts">
import Sidebar from './demo/Sidebar.vue';
import DocsGroup from './demo/groups/DocsGroup.vue';
import BasicGroup from './demo/groups/BasicGroup.vue';
import StateGroup from './demo/groups/StateGroup.vue';
import InteractionGroup from './demo/groups/InteractionGroup.vue';
import AsyncGroup from './demo/groups/AsyncGroup.vue';
import CheckGroup from './demo/groups/CheckGroup.vue';
import ViewGroup from './demo/groups/ViewGroup.vue';
import ApiGroup from './demo/groups/ApiGroup.vue';
import EditGroup from './demo/groups/EditGroup.vue';
import DragGroup from './demo/groups/DragGroup.vue';
import PerfGroup from './demo/groups/PerfGroup.vue';
import { demoGroups } from './demo/registry';
import './demo/demo.css';

const total = demoGroups.reduce((sum, group) => sum + group.demos.length, 0);
</script>

<template>
	<div class="demo-layout">
		<Sidebar :groups="demoGroups" />
		<main class="demo-main">
			<header class="demo-header">
				<h1>y-tree · Vue</h1>
				<p>一个树组件，共 {{ total }} 个功能点演示。 左侧按能力域分组，点击可跳转到对应示例。</p>
			</header>

			<DocsGroup />
			<BasicGroup />
			<StateGroup />
			<InteractionGroup />
			<AsyncGroup />
			<CheckGroup />
			<ViewGroup />
			<ApiGroup />
			<EditGroup />
			<DragGroup />
			<PerfGroup />
		</main>
	</div>
</template>
