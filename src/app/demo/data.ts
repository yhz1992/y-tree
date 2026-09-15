/**
 * demo 共享数据。
 * 注意：demo 应用不 import 库外 common（TS 会因 rootDir 报错），统一用 any。
 */

/** 基础数据：两层结构，用于多数演示 */
export const basicData: Array<any> = [
  {
    id: '1',
    name: '节点 1',
    expanded: true,
    children: [
      { id: '1-1', name: '节点 1-1', children: [] },
      { id: '1-2', name: '节点 1-2', children: [] },
    ],
  },
  { id: '2', name: '节点 2', children: [] },
  { id: '3', name: '节点 3', children: [] },
];

/** 勾选演示数据：部分节点预置勾选状态 */
export const checkData: Array<any> = [
  {
    id: '1',
    name: '节点 1',
    expanded: true,
    children: [
      { id: '1-1', name: '节点 1-1', children: [] },
      { id: '1-2', name: '节点 1-2', checked: true, children: [] },
      {
        id: '1-3',
        name: '节点 1-3',
        children: [
          { id: '1-3-1', name: '节点 1-3-1', children: [] },
          { id: '1-3-2', name: '节点 1-3-2', children: [] },
        ],
      },
    ],
  },
  { id: '2', name: '节点 2', children: [] },
];

/** 拖拽演示数据：A 下含子节点，便于观察三种落点 */
export const dragData: Array<any> = [
  {
    id: 'a',
    name: 'A',
    expanded: true,
    children: [
      { id: 'a-1', name: 'A-1', children: [] },
      { id: 'a-2', name: 'A-2', children: [] },
    ],
  },
  { id: 'b', name: 'B', children: [] },
  { id: 'c', name: 'C', children: [] },
];

/** 扁平化收集所有节点 id（含嵌套子节点） */
export function collectIds(nodes: Array<any>): Array<string | number> {
  const ids: Array<string | number> = [];
  const walk = (list: Array<any>) => {
    for (const node of list) {
      ids.push(node.id);
      if (node.children?.length) {
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return ids;
}

/** 生成 6 层 7 叉的树（13.7 万节点），用于虚拟滚动演示 */
export function buildLargeData(depth = 6, perNode = 7): Array<any> {
  let id = 0;
  const build = (level: number): Array<any> => {
    const nodes: Array<any> = [];
    for (let i = 0; i < perNode; i++) {
      const node: any = { id: id++, name: `节点 ${level}-${i}`, children: [] };
      if (level < depth) {
        node.children = build(level + 1);
      }
      nodes.push(node);
    }
    return nodes;
  };
  return build(1);
}
