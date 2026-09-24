/**
 * P7 可见列表增量更新正确性 + 性能验证
 *
 * 覆盖：
 * 1. add / remove / move / copy 后增量列表与全量 DFS 一致
 * 2. hide / 搜索态回退全量
 * 3. 大树（约 1 万节点）增量耗时应远小于全量重建
 *
 * 运行：node --experimental-strip-types scripts/verify-visible-incremental.ts
 */
import { YTreeService } from "../common/service.ts";
import type { NodeId } from "../common/model.ts";
import {
  buildVisibleNodes,
  patchVisibleAfterAdd,
  patchVisibleAfterCopy,
  patchVisibleAfterMove,
  patchVisibleAfterRemove,
  shouldRebuildVisibleAfterUpdate,
} from "../common/view.ts";

let failures = 0;
let passed = 0;

function fail(label: string, detail: string) {
  failures++;
  console.error(`FAIL ${label}\n${detail}`);
}

function pass(label: string) {
  passed++;
  console.log(`PASS ${label}`);
}

function idsOf(list: Array<{ id: NodeId }>): string {
  return list.map((n) => String(n.id)).join(",");
}

function sameList(a: Array<{ id: NodeId }>, b: Array<{ id: NodeId }>): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) {
      return false;
    }
  }
  return true;
}

function expandAll(service: YTreeService): Set<NodeId> {
  const expanded = new Set<NodeId>();
  service.getFlatNodesMap()?.forEach((node) => {
    if (node.childIds.length > 0) {
      expanded.add(node.id);
    }
  });
  return expanded;
}

function verifyPatch(
  label: string,
  service: YTreeService,
  expanded: Set<NodeId>,
  list: Array<{ id: NodeId; node: any }>,
  ok: boolean,
) {
  const full = buildVisibleNodes(service, expanded);
  if (!ok) {
    fail(label, "增量返回 false，预期应成功");
    return;
  }
  if (!sameList(list, full)) {
    fail(label, `  增量[${idsOf(list)}]\n  全量[${idsOf(full)}]`);
    return;
  }
  pass(label);
}

function genTree(prefix: string, depth: number, fanout: number): Array<any> {
  if (depth <= 0) {
    return [];
  }
  const nodes: Array<any> = [];
  for (let i = 0; i < fanout; i++) {
    const id = `${prefix}-${i}`;
    nodes.push({
      id,
      name: id,
      children: genTree(`${id}`, depth - 1, fanout),
    });
  }
  return nodes;
}

const tree = genTree("n", 4, 3);
const freshTree = () => JSON.parse(JSON.stringify(tree));

/* ---------------- 1. addNode ---------------- */
{
  const s = new YTreeService(freshTree());
  const expanded = expandAll(s);
  const list = buildVisibleNodes(s, expanded);
  const newId = s.addNode("n-0", { id: "new-a", name: "new-a" });
  const ok = patchVisibleAfterAdd(list, s, expanded, newId as NodeId);
  verifyPatch("addNode 到展开父 n-0", s, expanded, list, ok);

  const leafId = s.addNode("n-0-0-0", { id: "new-leaf", name: "new-leaf" });
  const ok2 = patchVisibleAfterAdd(list, s, expanded, leafId as NodeId);
  verifyPatch("addNode 到叶子", s, expanded, list, ok2);
}

/* ---------------- 2. addNode 父未展开 ---------------- */
{
  const s = new YTreeService(freshTree());
  const expanded = expandAll(s);
  expanded.delete("n-1");
  const list = buildVisibleNodes(s, expanded);
  const newId = s.addNode("n-1", { id: "hidden-child", name: "hidden-child" });
  const ok = patchVisibleAfterAdd(list, s, expanded, newId as NodeId);
  verifyPatch("addNode 父未展开不插入", s, expanded, list, ok);
}

/* ---------------- 3. removeNode ---------------- */
{
  const s = new YTreeService(freshTree());
  const expanded = expandAll(s);
  const list = buildVisibleNodes(s, expanded);
  const removed = s.removeNode("n-0-0");
  const ok = patchVisibleAfterRemove(list, removed);
  verifyPatch("removeNode 子树 n-0-0", s, expanded, list, ok);

  const removedRoot = s.removeNode("n-2");
  const ok2 = patchVisibleAfterRemove(list, removedRoot);
  verifyPatch("removeNode 根 n-2", s, expanded, list, ok2);
}

/* ---------------- 4. moveNode ---------------- */
{
  const s = new YTreeService(freshTree());
  const expanded = expandAll(s);
  const list = buildVisibleNodes(s, expanded);
  s.moveNode("n-0", "n-2", "inner");
  const ok = patchVisibleAfterMove(list, s, expanded, "n-0");
  verifyPatch("moveNode n-0 → n-2 inner", s, expanded, list, ok);

  s.moveNode("n-2-0", "n-1", "prev");
  const ok2 = patchVisibleAfterMove(list, s, expanded, "n-2-0");
  verifyPatch("moveNode n-2-0 → n-1 prev", s, expanded, list, ok2);

  s.moveNode("n-2", "n-1", "next");
  const ok3 = patchVisibleAfterMove(list, s, expanded, "n-2");
  verifyPatch("moveNode n-2 → n-1 next", s, expanded, list, ok3);
}

/* ---------------- 5. copyNode ---------------- */
{
  const s = new YTreeService(freshTree());
  const expanded = expandAll(s);
  const list = buildVisibleNodes(s, expanded);
  const newId = s.copyNode("n-0", "n-2", "inner");
  const ok = patchVisibleAfterCopy(list, s, expanded, newId as NodeId);
  verifyPatch("copyNode n-0 → n-2 inner", s, expanded, list, ok);
}

/* ---------------- 6. hide 必须全量 ---------------- */
{
  const rebuild = shouldRebuildVisibleAfterUpdate({ hide: true });
  if (rebuild) {
    pass("updateNode hide 触发全量");
  } else {
    fail("updateNode hide 触发全量", "expected true");
  }
  const noRebuild = shouldRebuildVisibleAfterUpdate({ name: "x" });
  if (!noRebuild) {
    pass("updateNode name 不触发全量");
  } else {
    fail("updateNode name 不触发全量", "expected false");
  }
  const searchRebuild = shouldRebuildVisibleAfterUpdate({ name: "x" }, "x");
  if (searchRebuild) {
    pass("搜索态改 name 触发全量");
  } else {
    fail("搜索态改 name 触发全量", "expected true");
  }
}

/* ---------------- 7. 搜索态增量回退 ---------------- */
{
  const s = new YTreeService(freshTree());
  const expanded = expandAll(s);
  const list = buildVisibleNodes(s, expanded, { searchValue: "n-0" });
  const newId = s.addNode("n-0", { id: "search-new", name: "search-new" });
  const ok = patchVisibleAfterAdd(list, s, expanded, newId as NodeId, "n-0");
  if (!ok) {
    pass("搜索态 add 回退全量");
  } else {
    fail("搜索态 add 回退全量", "expected false");
  }
}

/* ---------------- 8. 连续结构变更 ---------------- */
{
  const s = new YTreeService(freshTree());
  const expanded = expandAll(s);
  const list = buildVisibleNodes(s, expanded);
  const a = s.addNode("n-0", { id: "seq-a", name: "seq-a" }) as NodeId;
  patchVisibleAfterAdd(list, s, expanded, a);
  const b = s.addNode("n-1", { id: "seq-b", name: "seq-b" }) as NodeId;
  patchVisibleAfterAdd(list, s, expanded, b);
  s.moveNode("seq-a", "n-2", "prev");
  patchVisibleAfterMove(list, s, expanded, "seq-a");
  const removed = s.removeNode("seq-b");
  patchVisibleAfterRemove(list, removed);
  const full = buildVisibleNodes(s, expanded);
  if (sameList(list, full)) {
    pass("连续 add/move/remove 一致");
  } else {
    fail(
      "连续 add/move/remove 一致",
      `  增量[${idsOf(list)}]\n  全量[${idsOf(full)}]`,
    );
  }
}

/* ---------------- 9. 大树性能 ---------------- */
{
  let count = 0;
  function bigTree(depth: number, fanout: number): Array<any> {
    if (depth <= 0) {
      return [];
    }
    const nodes: Array<any> = [];
    for (let i = 0; i < fanout; i++) {
      const id = `b-${count++}`;
      nodes.push({
        id,
        name: id,
        children: bigTree(depth - 1, fanout),
      });
    }
    return nodes;
  }
  const big = bigTree(6, 5); // (5^6-1)/4 = 3906? wait 5^0+...+5^5 = 3906; depth 6 fanout 5 = 19531
  console.log(`大树规模: ${count} 节点`);
  const s = new YTreeService(big);
  const expanded = expandAll(s);
  const t0 = performance.now();
  const list = buildVisibleNodes(s, expanded);
  const t1 = performance.now();
  const fullMs = t1 - t0;
  console.log(`  全量 DFS 耗时: ${fullMs.toFixed(3)}ms（${list.length} 行）`);

  const parentId = "b-0";
  const t2 = performance.now();
  const newId = s.addNode(parentId, {
    id: "perf-new",
    name: "perf-new",
  }) as NodeId;
  const okAdd = patchVisibleAfterAdd(list, s, expanded, newId);
  const t3 = performance.now();
  const addMs = t3 - t2;
  console.log(`  增量 add 耗时: ${addMs.toFixed(3)}ms`);
  const fullAfterAdd = buildVisibleNodes(s, expanded);
  if (okAdd && sameList(list, fullAfterAdd)) {
    pass("大树 add 增量一致");
  } else {
    fail(
      "大树 add 增量一致",
      `ok=${okAdd} len ${list.length}/${fullAfterAdd.length}`,
    );
  }

  const t4 = performance.now();
  s.moveNode("perf-new", "b-1", "inner");
  const okMove = patchVisibleAfterMove(list, s, expanded, "perf-new");
  const t5 = performance.now();
  const moveMs = t5 - t4;
  console.log(`  增量 move 耗时: ${moveMs.toFixed(3)}ms`);
  const fullAfterMove = buildVisibleNodes(s, expanded);
  if (okMove && sameList(list, fullAfterMove)) {
    pass("大树 move 增量一致");
  } else {
    fail("大树 move 增量一致", `ok=${okMove}`);
  }

  const t6 = performance.now();
  const removed = s.removeNode("perf-new");
  const okRemove = patchVisibleAfterRemove(list, removed);
  const t7 = performance.now();
  const removeMs = t7 - t6;
  console.log(`  增量 remove 耗时: ${removeMs.toFixed(3)}ms`);
  const fullAfterRemove = buildVisibleNodes(s, expanded);
  if (okRemove && sameList(list, fullAfterRemove)) {
    pass("大树 remove 增量一致");
  } else {
    fail("大树 remove 增量一致", `ok=${okRemove}`);
  }

  const t8 = performance.now();
  const copied = s.copyNode("b-2", "b-3", "next");
  const okCopy = patchVisibleAfterCopy(list, s, expanded, copied as NodeId);
  const t9 = performance.now();
  const copyMs = t9 - t8;
  console.log(`  增量 copy 耗时: ${copyMs.toFixed(3)}ms`);
  const fullAfterCopy = buildVisibleNodes(s, expanded);
  if (okCopy && sameList(list, fullAfterCopy)) {
    pass("大树 copy 增量一致");
  } else {
    fail(
      "大树 copy 增量一致",
      `ok=${okCopy} len ${list.length}/${fullAfterCopy.length}`,
    );
  }

  if (addMs < fullMs && moveMs < fullMs && removeMs < fullMs) {
    pass("大树增量耗时小于全量 DFS");
  } else {
    fail(
      "大树增量耗时小于全量 DFS",
      `full=${fullMs.toFixed(3)} add=${addMs.toFixed(3)} move=${moveMs.toFixed(
        3,
      )} remove=${removeMs.toFixed(3)} copy=${copyMs.toFixed(3)}`,
    );
  }
}

console.log(
  failures === 0
    ? `\n全部通过 ✔（${passed}）`
    : `\n${failures} 个场景失败 ✘（通过 ${passed}）`,
);
process.exit(failures === 0 ? 0 : 1);
