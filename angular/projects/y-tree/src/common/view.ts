import type { NodeId, YTreeExpandSpeed, YTreeFontCss, YTreeModel } from "./model";

/**
 * 节点图标解析结果
 */
export type YTreeIconResult =
  | { type: "img"; src: string }
  | { type: "class"; className: string }
  | { type: "none" };

const DEFAULT_ICON_OPEN = "fa-solid fa-folder-open";
const DEFAULT_ICON_CLOSE = "fa-solid fa-folder";
const DEFAULT_ICON_LEAF = "fa-regular fa-file";

/**
 * 是否把图标字符串当成图片地址
 */
export function isIconUrl(value: string): boolean {
  return (
    /^(https?:|data:|\/|\.\/|\.\.\/)/.test(value) ||
    /\.(png|jpe?g|gif|svg|webp|ico)(\?|#|$)/i.test(value)
  );
}

/**
 * 解析节点展示图标
 * 优先级：展开态 iconOpen / 折叠态 iconClose → icon → iconSkin → 默认文件夹/文档
 */
export function resolveNodeIcon(
  node: YTreeModel,
  isExpanded: boolean,
  hasChildren: boolean,
  showIcon: boolean = true,
): YTreeIconResult {
  if (!showIcon) {
    return { type: "none" };
  }

  let raw = "";
  if (hasChildren) {
    if (isExpanded && typeof node.iconOpen === "string" && node.iconOpen) {
      raw = node.iconOpen;
    } else if (
      !isExpanded &&
      typeof node.iconClose === "string" &&
      node.iconClose
    ) {
      raw = node.iconClose;
    }
  }
  if (!raw && typeof node.icon === "string" && node.icon) {
    raw = node.icon;
  }
  if (!raw && typeof node.iconSkin === "string" && node.iconSkin) {
    const state = hasChildren ? (isExpanded ? "open" : "close") : "docu";
    return {
      type: "class",
      className: `y-tree-icon-skin y-tree-icon-skin-${node.iconSkin} is-${state}`,
    };
  }
  if (!raw) {
    raw = hasChildren
      ? isExpanded
        ? DEFAULT_ICON_OPEN
        : DEFAULT_ICON_CLOSE
      : DEFAULT_ICON_LEAF;
  }

  if (isIconUrl(raw)) {
    return { type: "img", src: raw };
  }
  return { type: "class", className: raw };
}

/**
 * 解析悬停 title
 */
export function resolveNodeTitle(
  node: YTreeModel,
  showTitle: boolean = true,
  titleFn?: (node: YTreeModel) => string,
): string {
  if (!showTitle) {
    return "";
  }
  if (titleFn) {
    const custom = titleFn(node);
    return typeof custom === "string" ? custom : "";
  }
  if (typeof node.title === "string" && node.title) {
    return node.title;
  }
  return typeof node.name === "string" ? node.name : "";
}

/**
 * 解析节点字体样式
 */
export function resolveFontCss(
  node: YTreeModel,
  fontCss?: YTreeFontCss,
): Record<string, string> {
  if (!fontCss) {
    return {};
  }
  if (typeof fontCss === "function") {
    return fontCss(node) ?? {};
  }
  return fontCss;
}

/**
 * 把 expandSpeed 归一化为毫秒；0 表示关闭动画
 */
export function parseExpandSpeed(speed: YTreeExpandSpeed | undefined): number {
  if (speed === false || speed === "" || speed === 0) {
    return 0;
  }
  if (speed === "slow") {
    return 400;
  }
  if (speed === "fast") {
    return 200;
  }
  if (speed == null) {
    return 0;
  }
  if (typeof speed === "number" && Number.isFinite(speed)) {
    return Math.max(0, speed);
  }
  return 0;
}

/**
 * 可见行（扁平化渲染）
 */
export interface VisibleNode {
  id: NodeId;
  node: YTreeModel;
}

/**
 * 收起动画：父节点已折叠，但仍需短暂渲染的子孙
 */
export type VisibleLeaving = {
  parentId: NodeId;
  ids: Array<NodeId>;
} | null;

/**
 * 可见列表所需的最小服务接口（避免 view ↔ service 循环依赖）
 */
export interface YTreeVisibleSource {
  getFlatNodesMap(): Map<NodeId, YTreeModel> | null | undefined;
  getRootIds(): Array<NodeId>;
}

export interface VisibleListOptions {
  searchValue?: string;
  leaving?: VisibleLeaving;
}

/**
 * 全量 DFS 构建可见列表（init / 搜索 / 展开折叠 / hide / 懒加载）
 */
export function buildVisibleNodes(
  service: YTreeVisibleSource | null | undefined,
  expanded: Set<NodeId>,
  options: VisibleListOptions = {},
): Array<VisibleNode> {
  const list: Array<VisibleNode> = [];
  const flatMap = service?.getFlatNodesMap();
  if (!service || !flatMap) {
    return list;
  }
  const searchValue = options.searchValue ?? "";
  const leaving = options.leaving ?? null;
  const rootIds: Array<NodeId> = service.getRootIds();
  const stack: Array<NodeId> = [...rootIds].reverse();
  while (stack.length) {
    const id = stack.pop() as NodeId;
    const node = flatMap.get(id);
    if (!node || node.hide) {
      continue;
    }
    if (searchValue && node.name.indexOf(searchValue) === -1) {
      continue;
    }
    list.push({ id, node });
    if (node.childIds.length > 0 && expanded.has(id)) {
      for (let i = node.childIds.length - 1; i >= 0; i--) {
        stack.push(node.childIds[i]);
      }
    } else if (leaving && leaving.parentId === id) {
      for (const lid of leaving.ids) {
        const child = flatMap.get(lid);
        if (child && !child.hide) {
          list.push({ id: lid, node: child });
        }
      }
    }
  }
  return list;
}

/**
 * 收集当前可见的子孙节点（展开动画进入/离开用；不含父节点自身）
 */
export function collectVisibleDescendants(
  service: YTreeVisibleSource | null | undefined,
  parentId: NodeId,
  expandedSet: Set<NodeId>,
): Array<NodeId> {
  const ids: Array<NodeId> = [];
  const flatMap = service?.getFlatNodesMap();
  const parent = flatMap?.get(parentId);
  if (!flatMap || !parent) {
    return ids;
  }
  const stack: Array<NodeId> = [...parent.childIds].reverse();
  while (stack.length) {
    const cid = stack.pop() as NodeId;
    const child = flatMap.get(cid);
    if (!child || child.hide) {
      continue;
    }
    ids.push(cid);
    if (child.childIds.length > 0 && expandedSet.has(cid)) {
      for (let i = child.childIds.length - 1; i >= 0; i--) {
        stack.push(child.childIds[i]);
      }
    }
  }
  return ids;
}

/**
 * 以 rootId 为根构建可见段（含自身；搜索未命中则空）
 */
export function buildVisibleSegment(
  service: YTreeVisibleSource,
  rootId: NodeId,
  expanded: Set<NodeId>,
  searchValue: string = "",
): Array<VisibleNode> {
  const list: Array<VisibleNode> = [];
  const flatMap = service.getFlatNodesMap();
  const root = flatMap?.get(rootId);
  if (!flatMap || !root || root.hide) {
    return list;
  }
  if (searchValue && root.name.indexOf(searchValue) === -1) {
    return list;
  }
  const stack: Array<NodeId> = [rootId];
  while (stack.length) {
    const id = stack.pop() as NodeId;
    const node = flatMap.get(id);
    if (!node || node.hide) {
      continue;
    }
    if (searchValue && node.name.indexOf(searchValue) === -1) {
      continue;
    }
    list.push({ id, node });
    if (node.childIds.length > 0 && expanded.has(id)) {
      for (let i = node.childIds.length - 1; i >= 0; i--) {
        stack.push(node.childIds[i]);
      }
    }
  }
  return list;
}

function collectSubtreeIds(
  service: YTreeVisibleSource,
  rootId: NodeId,
): Array<NodeId> {
  const ids: Array<NodeId> = [];
  const flatMap = service.getFlatNodesMap();
  if (!flatMap) {
    return ids;
  }
  const stack: Array<NodeId> = [rootId];
  const visited = new Set<NodeId>();
  while (stack.length) {
    const id = stack.pop() as NodeId;
    if (visited.has(id)) {
      continue;
    }
    visited.add(id);
    const node = flatMap.get(id);
    if (!node) {
      continue;
    }
    ids.push(id);
    const childIds = node.childIds || [];
    for (let i = childIds.length - 1; i >= 0; i--) {
      stack.push(childIds[i]);
    }
  }
  return ids;
}

function spanLength(
  list: Array<VisibleNode>,
  start: number,
  idSet: Set<NodeId>,
): number {
  let n = 0;
  while (start + n < list.length && idSet.has(list[start + n].id)) {
    n++;
  }
  return n;
}

/**
 * 从可见列表中摘除子树对应的连续段，返回原起始下标；未出现返回 -1
 */
function spliceSubtreeBlock(
  list: Array<VisibleNode>,
  subtreeSet: Set<NodeId>,
): number {
  const start = list.findIndex((item) => subtreeSet.has(item.id));
  if (start < 0) {
    return -1;
  }
  const len = spanLength(list, start, subtreeSet);
  list.splice(start, len);
  return start;
}

/**
 * 按当前树结构计算 nodeId 应插入的可见下标
 * 返回 null 表示当前不可见（无需插入）；返回 -1 表示列表与结构失步，应全量重建
 */
function computeInsertIndex(
  list: Array<VisibleNode>,
  service: YTreeVisibleSource,
  expanded: Set<NodeId>,
  nodeId: NodeId,
): number | null {
  const flatMap = service.getFlatNodesMap();
  const node = flatMap?.get(nodeId);
  if (!flatMap || !node || node.hide) {
    return null;
  }
  if (!node.isRoot) {
    const parent = flatMap.get(node.pId);
    if (!parent || parent.hide) {
      return null;
    }
    if (!expanded.has(parent.id)) {
      return null;
    }
    const parentIdx = list.findIndex((item) => item.id === parent.id);
    if (parentIdx < 0) {
      return -1;
    }
  }
  const siblingIds = node.isRoot
    ? service.getRootIds()
    : (flatMap.get(node.pId)?.childIds ?? []);
  const idx = siblingIds.indexOf(nodeId);
  if (idx < 0) {
    return -1;
  }
  for (let i = idx - 1; i >= 0; i--) {
    const prevId = siblingIds[i];
    const prevIdx = list.findIndex((item) => item.id === prevId);
    if (prevIdx >= 0) {
      const prevSet = new Set(collectSubtreeIds(service, prevId));
      return prevIdx + spanLength(list, prevIdx, prevSet);
    }
  }
  if (node.isRoot) {
    return 0;
  }
  const parentIdx = list.findIndex((item) => item.id === node.pId);
  return parentIdx < 0 ? -1 : parentIdx + 1;
}

function insertVisibleSubtree(
  list: Array<VisibleNode>,
  service: YTreeVisibleSource,
  expanded: Set<NodeId>,
  rootId: NodeId,
  searchValue: string,
): boolean {
  if (searchValue) {
    return false;
  }
  const index = computeInsertIndex(list, service, expanded, rootId);
  if (index === -1) {
    return false;
  }
  if (index == null) {
    return true;
  }
  const segment = buildVisibleSegment(service, rootId, expanded, searchValue);
  list.splice(index, 0, ...segment);
  return true;
}

/**
 * 新增节点后增量插入；搜索态或无法定位时返回 false（调用方全量重建）
 */
export function patchVisibleAfterAdd(
  list: Array<VisibleNode>,
  service: YTreeVisibleSource,
  expanded: Set<NodeId>,
  newId: NodeId,
  searchValue: string = "",
): boolean {
  return insertVisibleSubtree(list, service, expanded, newId, searchValue);
}

/**
 * 复制子树后增量插入新根
 */
export function patchVisibleAfterCopy(
  list: Array<VisibleNode>,
  service: YTreeVisibleSource,
  expanded: Set<NodeId>,
  newRootId: NodeId,
  searchValue: string = "",
): boolean {
  return insertVisibleSubtree(list, service, expanded, newRootId, searchValue);
}

/**
 * 删除子树：按 id 集合摘除连续可见段
 */
export function patchVisibleAfterRemove(
  list: Array<VisibleNode>,
  removedIds: Array<NodeId>,
): boolean {
  if (removedIds.length === 0) {
    return true;
  }
  const subtreeSet = new Set(removedIds);
  spliceSubtreeBlock(list, subtreeSet);
  return true;
}

/**
 * 移动节点：先摘除旧段再按新位置插入
 */
export function patchVisibleAfterMove(
  list: Array<VisibleNode>,
  service: YTreeVisibleSource,
  expanded: Set<NodeId>,
  sourceId: NodeId,
  searchValue: string = "",
): boolean {
  if (searchValue) {
    return false;
  }
  const subtreeSet = new Set(collectSubtreeIds(service, sourceId));
  spliceSubtreeBlock(list, subtreeSet);
  return insertVisibleSubtree(list, service, expanded, sourceId, searchValue);
}

/**
 * updateNode 后：hide 变化必须全量；其余展示字段原地即可（调用方 tick）
 */
export function shouldRebuildVisibleAfterUpdate(
  patch: Partial<YTreeModel> | Record<string, unknown> | undefined,
  searchValue: string = "",
): boolean {
  if (!patch) {
    return false;
  }
  const data = patch as Record<string, unknown>;
  if ("hide" in data) {
    return true;
  }
  if (searchValue && "name" in data) {
    return true;
  }
  return false;
}
