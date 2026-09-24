<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import type { DemoGroup } from './types';

defineProps<{ groups: Array<DemoGroup> }>();

const activeId = ref('');
const navOpen = ref(false);

const onScroll = () => {
	const cards = Array.from(document.querySelectorAll<HTMLElement>('.demo-card'));
	let current = cards[0]?.id ?? '';
	for (const card of cards) {
		if (card.getBoundingClientRect().top <= 120) {
			current = card.id;
		} else {
			break;
		}
	}
	activeId.value = current;
};

const onKey = (e: KeyboardEvent) => {
	if (e.key === 'Escape') navOpen.value = false;
};

onMounted(() => {
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll);
	window.addEventListener('keydown', onKey);
	onScroll();
});

onUnmounted(() => {
	window.removeEventListener('scroll', onScroll);
	window.removeEventListener('resize', onScroll);
	window.removeEventListener('keydown', onKey);
});

const handleClick = (id: string) => {
	const el = document.getElementById(id);
	if (!el) return;
	const top = el.getBoundingClientRect().top + window.scrollY - 24;
	navOpen.value = false;
	window.setTimeout(() => {
		window.scrollTo(0, top);
		activeId.value = id;
	}, 0);
};
</script>

<template>
	<div class="demo-nav" :class="{ 'is-open': navOpen }">
		<button
			type="button"
			class="demo-sidebar-toggle"
			:aria-expanded="navOpen"
			aria-controls="demo-sidebar"
			@click="navOpen = true"
		>
			目录
		</button>
		<button type="button" class="demo-sidebar-mask" aria-label="关闭目录" @click="navOpen = false" />
		<aside id="demo-sidebar" class="demo-sidebar" :class="{ 'is-open': navOpen }">
			<div class="demo-sidebar-title">
				y-tree
				<span class="demo-sidebar-sub">Vue</span>
				<button type="button" class="demo-sidebar-close" aria-label="关闭目录" @click="navOpen = false">
					×
				</button>
			</div>
			<nav class="demo-sidebar-nav">
				<div v-for="group in groups" :key="group.id" class="demo-sidebar-group">
					<div class="demo-sidebar-group-title">{{ group.title }}</div>
					<ul class="demo-sidebar-list">
						<li v-for="demo in group.demos" :key="demo.id">
							<button
								type="button"
								class="demo-sidebar-link"
								:class="{ 'is-active': activeId === demo.id }"
								@click="handleClick(demo.id)"
							>
								{{ demo.title }}
							</button>
						</li>
					</ul>
				</div>
			</nav>
		</aside>
	</div>
</template>
