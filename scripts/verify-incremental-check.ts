/**
 * 勾选状态「全量初始化 + 增量更新」双模式正确性验证
 *
 * 核心思路：对同一棵树执行操作后，分别用「增量路径」与「全量重建(refreshCheckedStatus)」
 * 计算状态，两者必须完全一致。覆盖：非联动/联动勾选、toggle、addNode、removeNode、
 * moveNode、copyNode、nocheck/disabled、随机模糊序列，以及大节点性能冒烟。
 *
 * 运行：node --experimental-strip-types scripts/verify-incremental-check.ts
 */
import { YTreeService } from "../common/service.ts";

let failures = 0;

function fail(label: string, detail: string) {
  failures++;
  console.error(`FAIL ${label}\n${detail}`);
}

/** 采集整树快照（节点状态 + 叶子汇总 + checkIds） */
function snapshot(service: YTreeService) {
  const map = service.getFlatNodesMap();
  const nodes: Array<Record<string, unknown>> = [];
  map?.forEach((node, id) => {
    nodes.push({
      id,
      checked: !!node.checked,
      halfChecked: !!node.halfChecked,
      state: service.getNodeCheckedState(id),
      nocheck: !!node.nocheck,
    });
  });
  const summary = service.getTreeCheckedSummary();
  return {
    nodes,
    totalLeaf: summary.totalLeaf,
    checkedLeaf: summary.checkedLeaf,
    checkedIds: [...service.getCheckedIds()].sort((a, b) =>
      String(a).localeCompare(String(b)),
    ),
  };
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** 执行操作 → 校验「增量结果」与「全量重建结果」一致 */
function verify(label: string, service: YTreeService, op: () => void) {
  op();
  const s1 = snapshot(service);
  service.refreshCheckedStatus();
  const s2 = snapshot(service);
  if (!deepEqual(s1, s2)) {
    // 输出紧凑差异摘要
    const diffNodes: Array<string> = [];
    const incMap = new Map(s1.nodes.map((n) => [String(n.id), n]));
    const fullSet = new Set(s2.nodes.map((n) => String(n.id)));
    for (const n of s1.nodes) {
      const m = incMap.get(String(n.id));
      if (!m) continue;
      const full = s2.nodes.find((x) => String(x.id) === String(n.id));
      const fmt = (x: any) => `${x.state}/${x.checked}/${x.halfChecked}`;
      if (!full || fmt(m) !== fmt(full)) {
        diffNodes.push(
          `${n.id}: 增量[${fmt(m)}] 全量[${full ? fmt(full) : "MISSING"}]`,
        );
      }
    }
    for (const n of s2.nodes) {
      if (!incMap.has(String(n.id))) {
        diffNodes.push(
          `${n.id}: 增量[MISSING] 全量[${n.state}/${n.checked}/${n.halfChecked}]`,
        );
      }
    }
    const sum = (s: any) =>
      `totalLeaf=${s.totalLeaf} checkedLeaf=${s.checkedLeaf} checkedIds=${s.checkedIds.length}`;
    fail(
      label,
      `  汇总 增量[${sum(s1)}] 全量[${sum(s2)}]\n  节点差异(${
        diffNodes.length
      }):\n    ${diffNodes.slice(0, 25).join("\n    ")}`,
    );
  } else {
    console.log(`PASS ${label}`);
  }
}

/* ---------------- 测试树 ---------------- */

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
      children: genTree(`${prefix}-${i}`, depth - 1, fanout),
    });
  }
  return nodes;
}

const tree = genTree("n", 4, 3); // 3^0 + 3^1 + 3^2 + 3^3 = 40 节点

const leafIds: Array<string> = [];
const allIds: Array<string> = [];
(function collect(nodes: Array<any>) {
  for (const n of nodes) {
    allIds.push(n.id);
    if (n.children.length === 0) {
      leafIds.push(n.id);
    } else {
      collect(n.children);
    }
  }
})(tree);

const freshTree = () => JSON.parse(JSON.stringify(tree));

/* ---------------- 1. 非联动勾选 ---------------- */
{
  const s = new YTreeService(freshTree());
  for (const id of leafIds.slice(0, 5)) {
    verify(`非联动勾选叶子 ${id}`, s, () =>
      s.setCheckedByUser(id, true, false),
    );
  }
  verify(`非联动取消叶子 ${leafIds[0]}`, s, () =>
    s.setCheckedByUser(leafIds[0], false, false),
  );
  // 非联动勾选非叶子（状态应被子节点反算覆盖）
  verify(`非联动勾选非叶子 n-0`, s, () =>
    s.setCheckedByUser("n-0", true, false),
  );
}

/* ---------------- 2. 联动勾选 ---------------- */
{
  const s = new YTreeService(freshTree());
  verify(`联动勾选 n-0`, s, () => s.setCheckedByUser("n-0", true, true));
  verify(`联动取消 n-0`, s, () => s.setCheckedByUser("n-0", false, true));
  verify(`联动勾选 n-1-0`, s, () => s.setCheckedByUser("n-1-0", true, true));
  verify(`联动勾选根 n`, s, () => s.setCheckedByUser("n", true, true));
  verify(`联动取消根 n`, s, () => s.setCheckedByUser("n", false, true));
}

/* ---------------- 3. toggle ---------------- */
{
  const s = new YTreeService(freshTree());
  verify(`toggle 联动 n-0-0`, s, () => s.toggleCheckedByUser("n-0-0", true));
  verify(`toggle 联动 n-0-0 再`, s, () => s.toggleCheckedByUser("n-0-0", true));
  verify(`toggle 非联动 n-1`, s, () => s.toggleCheckedByUser("n-1", false));
}

/* ---------------- 4. addNode ---------------- */
{
  const s = new YTreeService(freshTree());
  verify(`addNode 带勾选到 n-0`, s, () =>
    s.addNode("n-0", { id: "new-a", name: "new-a", checked: true }),
  );
  verify(`addNode 到 n-0-0`, s, () => s.addNode("n-0-0", { name: "new-b" }));
  verify(`addNode 到叶子 new-b`, s, () =>
    s.addNode("new-b", { name: "new-c", checked: true }),
  );
  // 给已经带勾选父节点的树加叶子
  const s2 = new YTreeService(freshTree());
  s2.setCheckedByUser("n-0", true, true);
  verify(`勾选树中 addNode 未勾选`, s2, () =>
    s2.addNode("n-0", { name: "leaf-unchecked" }),
  );
  verify(`勾选树中 addNode 勾选`, s2, () =>
    s2.addNode("n-0", { name: "leaf-checked", checked: true }),
  );
}

/* ---------------- 5. removeNode ---------------- */
{
  const s = new YTreeService(freshTree());
  s.setCheckedByUser("n-0", true, true);
  verify(`removeNode n-0-0`, s, () => s.removeNode("n-0-0"));
  verify(`removeNode n-0`, s, () => s.removeNode("n-0"));
  verify(`removeNode 根 n-2`, s, () => s.removeNode("n-2"));
  // 删除唯一勾选子，父节点 checked 应保留
  const s2 = new YTreeService(freshTree());
  s2.setCheckedByUser("n-1-0-0", true, false);
  s2.setCheckedByUser("n-1-0-1", true, false);
  s2.setCheckedByUser("n-1-0-2", true, false);
  verify(`删除唯一勾选子树叶子`, s2, () => s2.removeNode("n-1-0-0"));
}

/* ---------------- 6. moveNode ---------------- */
{
  const s = new YTreeService(freshTree());
  s.setCheckedByUser("n-0", true, true);
  s.setCheckedByUser("n-2", true, true);
  verify(`moveNode n-0 → n-2 inner`, s, () =>
    s.moveNode("n-0", "n-2", "inner"),
  );
  verify(`moveNode n-2-0 → n-1 prev`, s, () =>
    s.moveNode("n-2-0", "n-1", "prev"),
  );
  verify(`moveNode n-2 → n-1 next`, s, () => s.moveNode("n-2", "n-1", "next"));
  // 移动未勾选子树到勾选父
  const s2 = new YTreeService(freshTree());
  s2.setCheckedByUser("n-1", true, true);
  verify(`移动未勾选 n-2 到勾选 n-1 inner`, s2, () =>
    s2.moveNode("n-2", "n-1", "inner"),
  );
}

/* ---------------- 7. copyNode ---------------- */
{
  const s = new YTreeService(freshTree());
  s.setCheckedByUser("n-0", true, true);
  verify(`copyNode n-0 → n-2 inner`, s, () =>
    s.copyNode("n-0", "n-2", "inner"),
  );
  verify(`copyNode n-2 → n-1 prev`, s, () => s.copyNode("n-2", "n-1", "prev"));
  verify(`copyNode 复制的子树再勾选`, s, () =>
    s.setCheckedByUser("n-0", false, true),
  );
}

/* ---------------- 8. nocheck / disabled ---------------- */
{
  const data = freshTree();
  // n-0 整棵子树（根 n-0 为 nocheck），n-1-0-0 叶子 disabled
  const s = new YTreeService(
    data,
    null,
    null,
    new Set(["n-0-0-0"]),
    new Set(["n-1-0-0"]),
  );
  verify(`nocheck 叶子 + disabled 叶子 初始化`, s, () => {});
  // disabled 用户不可改
  verify(`disabled 用户改 n-1-0-0`, s, () =>
    s.setCheckedByUser("n-1-0-0", true, true),
  );
  // disabled API 可改
  verify(`disabled api 改 n-1-0-0`, s, () =>
    s.setCheckedByApi("n-1-0-0", true, true),
  );
  // 联动勾选普通父节点（含 nocheck 叶子参与统计）
  verify(`联动勾选 n-0`, s, () => s.setCheckedByUser("n-0", true, true));
  verify(`联动勾选 n-1`, s, () => s.setCheckedByUser("n-1", true, true));
  // nocheck 叶子统计上视为已勾选
  const summary = s.getTreeCheckedSummary();
  console.log(
    `   (nocheck 叶子统计: totalLeaf=${summary.totalLeaf} checkedLeaf=${summary.checkedLeaf})`,
  );
}

/* ---------------- 9. 受控 checkIds ---------------- */
{
  const checkedLeaf = new Set(leafIds.slice(0, 6));
  const s = new YTreeService(freshTree(), checkedLeaf);
  verify(`受控模式初始化`, s, () => {});
  verify(`受控模式联动勾选 n-0`, s, () =>
    s.setCheckedByUser("n-0", true, true),
  );
  verify(`受控模式非联动取消叶子`, s, () =>
    s.setCheckedByUser(leafIds[0], false, false),
  );
}

/* ---------------- 10. 随机模糊测试 ---------------- */
{
  const rand = (n: number) => Math.floor(Math.random() * n);
  const s = new YTreeService(freshTree());
  let checked = true;
  for (let i = 0; i < 300; i++) {
    const kind = rand(6);
    const id = allIds[rand(allIds.length)];
    const op = () => {
      if (kind === 0) {
        s.setCheckedByUser(id, checked, false);
      } else if (kind === 1) {
        s.setCheckedByUser(id, checked, true);
      } else if (kind === 2) {
        s.toggleCheckedByUser(id, rand(2) === 0);
      } else if (kind === 3) {
        s.addNode(id, { name: `rand-${i}`, checked: rand(2) === 0 });
      } else if (kind === 4) {
        s.removeNode(id);
      } else {
        const tid = allIds[rand(allIds.length)];
        const pos = (["inner", "prev", "next"] as const)[rand(3)];
        s.moveNode(id, tid, pos);
      }
    };
    verify(`rand #${i} (kind=${kind})`, s, op);
    checked = !checked;
  }
}

/* ---------------- 11. 大节点性能冒烟 ---------------- */
{
  let count = 0;
  function bigTree(depth: number): Array<any> {
    if (depth <= 0 || count > 200000) {
      return [];
    }
    const a = { id: `b-${count++}`, name: "x", children: bigTree(depth - 1) };
    const b = { id: `b-${count++}`, name: "x", children: bigTree(depth - 1) };
    return [a, b];
  }
  const big = bigTree(20);
  const leafCount = Math.ceil(count / 2) + 1;
  console.log(`大节点树规模: ${count} 节点（约 ${leafCount} 叶子）`);
  const s = new YTreeService(big);

  const t0 = performance.now();
  s.setCheckedByUser("b-0", true, false); // 增量路径（单点非联动）
  const t1 = performance.now();
  console.log(`  增量单点勾选耗时: ${(t1 - t0).toFixed(3)}ms`);

  const t2 = performance.now();
  s.refreshCheckedStatus(); // 全量重建
  const t3 = performance.now();
  console.log(`  全量重建耗时: ${(t3 - t2).toFixed(3)}ms`);

  // 增量后与全量一致性
  verify(`大节点单点增量一致性`, s, () =>
    s.setCheckedByUser("b-1", true, false),
  );
  const t4 = performance.now();
  console.log(`  大节点二次增量耗时: ${(t4 - t3).toFixed(3)}ms`);

  // 大节点联动（子树局部重建）
  const t5 = performance.now();
  s.setCheckedByUser("b-0", false, true);
  const t6 = performance.now();
  console.log(`  大节点联动增量耗时: ${(t6 - t5).toFixed(3)}ms`);
  verify(`大节点联动增量一致性`, s, () => {});
}

console.log(failures === 0 ? "\n全部通过 ✔" : `\n${failures} 个场景失败 ✘`);
process.exit(failures === 0 ? 0 : 1);
