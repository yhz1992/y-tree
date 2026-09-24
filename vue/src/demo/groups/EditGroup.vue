<script setup lang="ts">
import { ref } from 'vue';
import YTree from '../../components/y-tree/y-tree.component.vue';
import DemoCard from '../DemoCard.vue';
import { demoMeta } from '../registry';
import type { YTreeNode } from '../../../../common/model';

/** 编辑演示数据 */
const editData: Array<YTreeNode> = [
	{
		id: 'a',
		name: 'A',
		expanded: true,
		children: [
			{ id: 'a-1', name: 'A-1', children: [] },
			{ id: 'a-2', name: 'A-2', children: [] }
		]
	},
	{ id: 'b', name: 'B', children: [] },
	{ id: 'c', name: 'C', children: [] }
];

const cloneEditData = () => JSON.parse(JSON.stringify(editData)) as Array<YTreeNode>;

/* ---------- 编辑按钮配置 ---------- */
const showRename = ref(true);
const showRemove = ref(true);
const showAdd = ref(true);

/* ---------- 重命名 ---------- */
const renameLog = ref('（双击节点标题，或点击笔按钮进入编辑）');
const appendRename = (msg: string) => {
	renameLog.value = msg + '\n' + renameLog.value.slice(0, 300);
};

const beforeEditName = (e: any) => {
	appendRename(`beforeEditName id=${e.id}`);
	return true;
};

const beforeRename = (e: any) => {
	appendRename(`beforeRename "${e.oldName}" -> "${e.newName}"`);
	return true;
};

const onRename = (e: any) => appendRename(`onRename id=${e.id} -> "${e.newName}"`);

/* ---------- 删除 ---------- */
const removeData = ref<Array<YTreeNode>>(cloneEditData());
const removeLog = ref('（点击垃圾桶按钮，气泡中确认删除）');

const onRemove = (e: any) => {
	removeLog.value = `onRemove 已删除 id=${e.id}\n` + removeLog.value.slice(0, 300);
};

const resetRemoveData = () => {
	removeData.value = cloneEditData();
	removeLog.value = '数据已重置';
};

/* ---------- 新增 ---------- */
const addData = ref<Array<YTreeNode>>(cloneEditData());
const addLog = ref('（点击加号按钮新增子节点，自动进入编辑态）');

const beforeAdd = (e: any) => {
	addLog.value = `beforeAdd 父节点 id=${e.id}\n` + addLog.value.slice(0, 300);
	return true;
};

const onAdd = (e: any) => {
	addLog.value = `onAdd 父=${e.parentId} 新节点=${e.id}\n` + addLog.value.slice(0, 300);
};

const resetAddData = () => {
	addData.value = cloneEditData();
	addLog.value = '数据已重置';
};
</script>

<template>
	<DemoCard v-bind="demoMeta('editable')">
		<div class="demo-toolbar">
			<label class="demo-check">
				<input v-model="showRename" type="checkbox" />
				showRenameBtn
			</label>
			<label class="demo-check">
				<input v-model="showRemove" type="checkbox" />
				showRemoveBtn
			</label>
			<label class="demo-check">
				<input v-model="showAdd" type="checkbox" />
				showAddBtn
			</label>
		</div>
		<YTree
			:datasource="editData"
			expand-all
			editable
			:show-rename-btn="showRename"
			:show-remove-btn="showRemove"
			:show-add-btn="showAdd"
			:height="140"
		/>
		<p class="demo-tip">鼠标悬停在节点上显示操作按钮，三个开关分别控制重命名 / 删除 / 新增按钮。</p>
	</DemoCard>

	<DemoCard v-bind="demoMeta('rename')">
		<YTree
			:datasource="editData"
			expand-all
			editable
			:height="140"
			:before-edit-name="beforeEditName"
			:before-rename="beforeRename"
			@rename="onRename"
		/>
		<p class="demo-tip">双击标题或点击笔按钮进入编辑，Enter 提交 / Esc 取消 / 失焦提交。</p>
		<pre class="demo-log">{{ renameLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('remove')">
		<YTree :datasource="removeData" expand-all editable :remove-confirm="true" :height="140" @remove="onRemove" />
		<div class="demo-toolbar" style="margin: 10px 0 0">
			<button type="button" @click="resetRemoveData">重置数据</button>
		</div>
		<pre class="demo-log">{{ removeLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('add')">
		<YTree :datasource="addData" expand-all editable :height="140" :before-add="beforeAdd" @add="onAdd" />
		<div class="demo-toolbar" style="margin: 10px 0 0">
			<button type="button" @click="resetAddData">重置数据</button>
		</div>
		<pre class="demo-log">{{ addLog }}</pre>
	</DemoCard>

	<DemoCard v-bind="demoMeta('node-extra')">
		<YTree :datasource="editData" expand-all :height="140">
			<template #nodeExtra="{ node }">
				<span class="demo-node-tag">
					{{ node.childIds.length === 0 ? '叶子' : `${node.childIds.length} 个子节点` }}
				</span>
			</template>
		</YTree>
		<p class="demo-tip">nodeExtra 插槽接收节点数据，可用来展示标签、徽标、操作入口等。</p>
	</DemoCard>
</template>
