<template>
	<div
		class="y-tree"
		:class="[`y-tree-${size}`, className]"
		:style="{ height: height + 'px', '--y-tree-expand-speed': expandMs() + 'ms' }"
		@scroll="onScroll"
	>
		<div class="y-tree-virtual-spacer" :style="{ height: visibleNodes.length * ROW_HEIGHT + 'px' }"></div>
		<div class="y-tree-virtual-content" :style="{ transform: 'translateY(' + start * ROW_HEIGHT + 'px)' }">
			<div
				v-for="item in visibleSlice"
				:key="item.id"
				class="y-tree-node"
				:class="{
					'is-root': item.node.isRoot,
					'is-first': item.node.isFirst,
					'is-last': item.node.isLast,
					'is-selected': item.node.selected,
					'is-disabled': item.node.disabled,
					'is-expand-enter': enteringIds.has(item.id),
					'is-expand-leave': leaving && leaving.ids.indexOf(item.id) >= 0,
					'is-dragging': draggingId === item.id,
					'is-drop-inner': dropTarget && dropTarget.id === item.id && dropTarget.position === 'inner',
					'is-drop-before': dropTarget && dropTarget.id === item.id && dropTarget.position === 'prev',
					'is-drop-after': dropTarget && dropTarget.id === item.id && dropTarget.position === 'next'
				}"
				:draggable="draggable && !item.node.disabled"
				@dragstart="onDragStart($event, item.id)"
				@dragover="onDragOver($event, item.id)"
				@drop="onDrop($event, item.id)"
				@dragend="onDragEnd"
				@click="onClick($event, item.id)"
				@contextmenu.prevent="onContextMenu($event, item.id)"
			>
				<span
					class="y-tree-indent"
					:class="{ 'y-tree-indent-leaf': !hasChildren(item.id) }"
					:style="{
						width: (item.node.level + (hasRootLine ? 1 : 0)) * 24 + (!hasChildren(item.id) ? 16 : 0) + 'px',
						background: indentBg(item.node)
					}"
				></span>
				<span
					v-if="hasChildren(item.id)"
					class="y-tree-switcher"
					:class="{
						'has-children': true,
						'is-expanded': expanded.has(item.id)
					}"
					:style="{
						background: switcherBg(expanded.has(item.id))
					}"
					@click.stop="onExpandChange($event, item.id)"
				>
					<i
						class="fa-solid y-tree-switcher-icon"
						:class="
							item.node.isAjaxing
								? 'fa-spinner is-ajaxing'
								: expanded.has(item.id)
								? 'fa-chevron-down'
								: 'fa-chevron-right'
						"
					></i>
				</span>

				<label v-if="checkable && !item.node.nocheck" class="y-tree-checkbox" @click.stop>
					<input
						:type="chkStyle === 'radio' ? 'radio' : 'checkbox'"
						class="y-tree-checkbox-input"
						:checked="item.node.checked"
						:indeterminate.prop="chkStyle !== 'radio' && item.node.halfChecked"
						:disabled="item.node.disabled || item.node.checkboxDisabled"
						@change="onCheckedChange($event, item.id)"
					/>
					<i
						class="fa-regular y-tree-checkbox-icon"
						:class="
							chkStyle === 'radio'
								? item.node.checked
									? 'fa-circle-dot'
									: 'fa-circle'
								: item.node.checked
								? 'fa-square-check'
								: item.node.halfChecked
								? 'fa-square-minus'
								: 'fa-square'
						"
					></i>
				</label>

				<img
					v-if="nodeIcon(item.node, expanded.has(item.id), hasChildren(item.id)).type === 'img'"
					class="y-tree-node-icon y-tree-node-icon-img"
					:class="{ 'is-leaf': !hasChildren(item.id) }"
					:src="nodeIconSrc(item.node, expanded.has(item.id), hasChildren(item.id))"
					alt=""
				/>
				<i
					v-else-if="nodeIcon(item.node, expanded.has(item.id), hasChildren(item.id)).type === 'class'"
					class="y-tree-node-icon"
					:class="[
						nodeIconClass(item.node, expanded.has(item.id), hasChildren(item.id)),
						{ 'is-leaf': !hasChildren(item.id) }
					]"
				></i>
				<input
					v-if="editingId === item.id"
					class="y-tree-edit-input"
					v-model="editValue"
					autofocus
					@keydown.stop.enter="commitRename($event)"
					@keydown.stop.esc="cancelEdit()"
					@blur="commitRename($event)"
					@click.stop
				/>
				<span
					v-else
					class="y-tree-title"
					:class="{ 'is-link': showLine }"
					:title="nodeTitle(item.node) || undefined"
					:style="nodeFontCss(item.node)"
					@dblclick="
						onDbClick($event, item.id);
						startEdit($event, item.id);
					"
				>
					{{ item.node.name }}
				</span>

				<span v-if="editable && editingId !== item.id" class="y-tree-actions-wrap">
					<span class="y-tree-actions">
						<i
							v-if="showRenameBtn"
							class="y-tree-action-btn fa-solid fa-pen"
							@click.stop="startEdit($event, item.id)"
						></i>
						<i
							v-if="showAddBtn"
							class="y-tree-action-btn fa-solid fa-plus"
							@click.stop="handleAddClick($event, item.id)"
						></i>
						<i
							v-if="showRemoveBtn"
							class="y-tree-action-btn is-danger fa-solid fa-trash"
							@click.stop="handleRemoveClick($event, item.id)"
						></i>
					</span>

					<span v-if="confirmRemoveId === item.id" class="y-tree-remove-confirm">
						<span class="y-tree-remove-confirm-text">确认删除该节点？</span>
						<button class="y-tree-remove-confirm-btn" @click.stop="doRemove($event, item.id)">
							确认删除
						</button>
						<button class="y-tree-remove-cancel-btn" @click.stop="closeConfirm()">取消</button>
					</span>
				</span>

				<slot name="nodeExtra" :node="item.node"></slot>
			</div>
		</div>
	</div>
</template>

<script src="./y-tree.component.ts" lang="ts"></script>
<style src="./y-tree.component.css" scoped></style>
