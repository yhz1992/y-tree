/*
 * Public API Surface of y-tree
 */

export * from './lib/y-tree.component';
export * from './lib/y-tree.module';

// 数据模型与事件类型（供使用方撰写带类型的回调签名）
export type {
  NodeId,
  YTreeCheckedState,
  YTreeCheckedSummary,
  YTreeNode,
  YTreeFlatNode,
  YTreeModel,
  YTreeNodeEvent,
  YTreeRenameEvent,
  YTreeRemoveEvent,
  YTreeAddEvent,
  YTreeDragEvent,
  YTreeDragMoveEvent,
  YTreeDropEvent,
  YTreeNodeChangeEvent,
  YTreeAsyncFrom,
  YTreeAsyncEvent,
  YTreeAsyncSuccessEvent,
  YTreeAsyncErrorEvent,
} from './common/model';

// 懒加载根节点异步时使用的虚拟根节点 id
export { Y_TREE_ROOT_ID } from './common/service';
