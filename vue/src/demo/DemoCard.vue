<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
	/** 锚点 id */
	id: string;
	/** 功能点标题 */
	title: string;
	/** 一句话说明 */
	desc: string;
	/** 核心用法代码 */
	code: string;
}>();

const codeOpen = ref(false);
</script>

<template>
	<section class="demo-card" :id="id">
		<h3 class="demo-card-title">{{ title }}</h3>
		<p class="demo-card-desc">{{ desc }}</p>
		<div class="demo-card-body">
			<slot />
		</div>
		<div class="demo-card-code-bar">
			<button type="button" class="demo-card-code-btn" @click="codeOpen = !codeOpen">
				<span class="demo-card-code-caret" :class="{ 'is-open': codeOpen }">▸</span>
				{{ codeOpen ? '隐藏代码' : '显示代码' }}
			</button>
		</div>
		<pre v-if="codeOpen" class="demo-card-code"><code>{{ code }}</code></pre>
	</section>
</template>
