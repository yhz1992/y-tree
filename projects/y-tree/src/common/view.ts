import type { YTreeExpandSpeed, YTreeFontCss, YTreeModel } from './model';

/**
 * 节点图标解析结果
 */
export type YTreeIconResult =
  | { type: 'img'; src: string }
  | { type: 'class'; className: string }
  | { type: 'none' };

const DEFAULT_ICON_OPEN = 'fa-solid fa-folder-open';
const DEFAULT_ICON_CLOSE = 'fa-solid fa-folder';
const DEFAULT_ICON_LEAF = 'fa-regular fa-file';

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
  showIcon: boolean = true
): YTreeIconResult {
  if (!showIcon) {
    return { type: 'none' };
  }

  let raw = '';
  if (hasChildren) {
    if (isExpanded && typeof node.iconOpen === 'string' && node.iconOpen) {
      raw = node.iconOpen;
    } else if (
      !isExpanded &&
      typeof node.iconClose === 'string' &&
      node.iconClose
    ) {
      raw = node.iconClose;
    }
  }
  if (!raw && typeof node.icon === 'string' && node.icon) {
    raw = node.icon;
  }
  if (!raw && typeof node.iconSkin === 'string' && node.iconSkin) {
    const state = hasChildren ? (isExpanded ? 'open' : 'close') : 'docu';
    return {
      type: 'class',
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
    return { type: 'img', src: raw };
  }
  return { type: 'class', className: raw };
}

/**
 * 解析悬停 title
 */
export function resolveNodeTitle(
  node: YTreeModel,
  showTitle: boolean = true,
  titleFn?: (node: YTreeModel) => string
): string {
  if (!showTitle) {
    return '';
  }
  if (titleFn) {
    const custom = titleFn(node);
    return typeof custom === 'string' ? custom : '';
  }
  if (typeof node.title === 'string' && node.title) {
    return node.title;
  }
  return typeof node.name === 'string' ? node.name : '';
}

/**
 * 解析节点字体样式
 */
export function resolveFontCss(
  node: YTreeModel,
  fontCss?: YTreeFontCss
): Record<string, string> {
  if (!fontCss) {
    return {};
  }
  if (typeof fontCss === 'function') {
    return fontCss(node) ?? {};
  }
  return fontCss;
}

/**
 * 把 expandSpeed 归一化为毫秒；0 表示关闭动画
 */
export function parseExpandSpeed(speed: YTreeExpandSpeed | undefined): number {
  if (speed === false || speed === '' || speed === 0) {
    return 0;
  }
  if (speed === 'slow') {
    return 400;
  }
  if (speed === 'fast') {
    return 200;
  }
  if (speed == null) {
    return 0;
  }
  if (typeof speed === 'number' && Number.isFinite(speed)) {
    return Math.max(0, speed);
  }
  return 0;
}
