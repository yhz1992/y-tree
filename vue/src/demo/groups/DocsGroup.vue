<script setup lang="ts">
import DemoCard from '../DemoCard.vue';
import { demoMeta } from '../registry';
import { eventRows, methodRows, nodeInputRows, nodeModelRows, propsRows, type ApiDocRow } from '../api-docs';

const propCols: Array<{ key: keyof ApiDocRow; label: string }> = [
	{ key: 'name', label: '名称' },
	{ key: 'type', label: '类型' },
	{ key: 'defaultValue', label: '默认' },
	{ key: 'desc', label: '说明' }
];

const simpleCols: Array<{ key: keyof ApiDocRow; label: string }> = [
	{ key: 'name', label: '名称' },
	{ key: 'type', label: '类型' },
	{ key: 'desc', label: '说明' }
];

const cell = (row: ApiDocRow, key: keyof ApiDocRow) => row[key] || '—';
const isCode = (key: keyof ApiDocRow) => key === 'name' || key === 'type';
</script>

<template>
	<DemoCard v-bind="demoMeta('api-props')">
		<div class="demo-api-wrap">
			<table class="demo-api-table">
				<thead>
					<tr>
						<th v-for="col in propCols" :key="col.key">{{ col.label }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in propsRows" :key="row.name">
						<td v-for="col in propCols" :key="col.key">
							<code v-if="isCode(col.key)">{{ cell(row, col.key) }}</code>
							<template v-else>{{ cell(row, col.key) }}</template>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</DemoCard>

	<DemoCard v-bind="demoMeta('api-events')">
		<div class="demo-api-wrap">
			<table class="demo-api-table">
				<thead>
					<tr>
						<th v-for="col in simpleCols" :key="col.key">{{ col.label }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in eventRows" :key="row.name">
						<td v-for="col in simpleCols" :key="col.key">
							<code v-if="isCode(col.key)">{{ cell(row, col.key) }}</code>
							<template v-else>{{ cell(row, col.key) }}</template>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</DemoCard>

	<DemoCard v-bind="demoMeta('api-methods')">
		<div class="demo-api-wrap">
			<table class="demo-api-table">
				<thead>
					<tr>
						<th v-for="col in simpleCols" :key="col.key">{{ col.label }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in methodRows" :key="row.name">
						<td v-for="col in simpleCols" :key="col.key">
							<code v-if="isCode(col.key)">{{ cell(row, col.key) }}</code>
							<template v-else>{{ cell(row, col.key) }}</template>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</DemoCard>

	<DemoCard v-bind="demoMeta('api-node-model')">
		<p class="demo-col-label">入参字段（YTreeNode / YTreeFlatNode）</p>
		<div class="demo-api-wrap">
			<table class="demo-api-table">
				<thead>
					<tr>
						<th v-for="col in simpleCols" :key="col.key">{{ col.label }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in nodeInputRows" :key="row.name">
						<td v-for="col in simpleCols" :key="col.key">
							<code v-if="isCode(col.key)">{{ cell(row, col.key) }}</code>
							<template v-else>{{ cell(row, col.key) }}</template>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="demo-col-label" style="margin-top: 16px">运行时字段（YTreeModel，方法返回值）</p>
		<div class="demo-api-wrap">
			<table class="demo-api-table">
				<thead>
					<tr>
						<th v-for="col in simpleCols" :key="col.key">{{ col.label }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in nodeModelRows" :key="row.name">
						<td v-for="col in simpleCols" :key="col.key">
							<code v-if="isCode(col.key)">{{ cell(row, col.key) }}</code>
							<template v-else>{{ cell(row, col.key) }}</template>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</DemoCard>
</template>
