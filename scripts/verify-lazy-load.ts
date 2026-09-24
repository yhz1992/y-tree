/**
 * 懒加载（P3）服务层正确性验证
 *
 * 覆盖：
 * 1. hasChildren / isLazyParent 判定
 * 2. setNodeChildren 替换与追加、嵌套数据递归展开
 * 3. setNodeLoading 标记
 * 4. 加载子节点后勾选状态与「全量重建」一致（增量路径正确性）
 * 5. 加载空数组后 isParent 归一化为叶子
 * 6. 重复加载（替换）不残留旧节点
 *
 * 运行：node --experimental-strip-types scripts/verify-lazy-load.ts
 */
import { YTreeService } from "../common/service.ts";
import { Y_TREE_ROOT_ID } from "../common/service.ts";

let failures = 0;
let passed = 0;

function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed++;
  } else {
    failures++;
    console.error(`FAIL ${label}\n  actual:   ${a}\n  expected: ${e}`);
  }
}

function ok(label: string, condition: boolean) {
  check(label, condition, true);
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
    });
  });
  const summary = service.getTreeCheckedSummary();
  return {
    nodes,
    totalLeaf: summary.totalLeaf,
    checkedLeaf: summary.checkedLeaf,
    checkIds: [...service.getCheckedIds()].sort((a, b) =>
      String(a).localeCompare(String(b)),
    ),
  };
}

/** 断言增量结果与全量重建结果一致 */
function assertConsistent(label: string, service: YTreeService) {
  const incremental = snapshot(service);
  service.refreshCheckedStatus();
  const full = snapshot(service);
  check(`${label} · 增量 vs 全量一致`, incremental, full);
}

/** 造一棵懒加载树：根 A/B，均未加载子节点 */
function createLazyTree() {
  return new YTreeService([
    { id: "A", name: "A", isParent: true, children: [] },
    { id: "B", name: "B", children: [] },
  ]);
}

/* ================================================================== */
console.log("—— 1. hasChildren / isLazyParent 判定 ——");
{
  const service = createLazyTree();
  ok("A 标记 isParent → hasChildren 为 true", service.hasChildren("A"));
  ok("B 未标记 → hasChildren 为 false", !service.hasChildren("B"));
  ok("A 为待加载父节点", service.isLazyParent("A"));
  ok("B 不是待加载父节点", !service.isLazyParent("B"));
  ok("不存在的节点 hasChildren 为 false", !service.hasChildren("X"));
  ok("不存在的节点 isLazyParent 为 false", !service.isLazyParent("X"));
}

/* ================================================================== */
console.log("—— 2. setNodeLoading 标记 ——");
{
  const service = createLazyTree();
  ok("标记 A 加载中返回 true", service.setNodeLoading("A", true));
  ok("A.isAjaxing 为 true", !!service.getNodeById("A")?.isAjaxing);
  service.setNodeLoading("A", false);
  ok("A.isAjaxing 复位为 false", !service.getNodeById("A")?.isAjaxing);
  ok("不存在的节点返回 false", !service.setNodeLoading("X", true));
}

/* ================================================================== */
console.log("—— 3. setNodeChildren 替换模式 ——");
{
  const service = createLazyTree();
  const added = service.setNodeChildren("A", [
    { id: "A-1", name: "A-1", children: [] },
    { id: "A-2", name: "A-2", children: [] },
  ]);
  check("返回新增子节点id", added, ["A-1", "A-2"]);
  check("A.childIds 已写入", service.getNodeById("A")?.childIds, [
    "A-1",
    "A-2",
  ]);
  ok("A 不再是待加载父节点", !service.isLazyParent("A"));
  ok("A 仍有 hasChildren", service.hasChildren("A"));
  check("A-1 层级为 1", service.getNodeById("A-1")?.level, 1);
  check("A-2 pId 为 A", service.getNodeById("A-2")?.pId, "A");
  assertConsistent("加载子节点后", service);

  // 替换加载（旧子节点应被清除）
  const added2 = service.setNodeChildren("A", [
    { id: "A-3", name: "A-3", children: [] },
  ]);
  check("替换后返回新子节点id", added2, ["A-3"]);
  check("A.childIds 已替换", service.getNodeById("A")?.childIds, ["A-3"]);
  ok("旧子节点 A-1 已被移除", service.getNodeById("A-1") === null);
  assertConsistent("替换加载后", service);

  // 追加模式
  const added3 = service.setNodeChildren(
    "A",
    [{ id: "A-4", name: "A-4", children: [] }],
    true,
  );
  check("追加模式返回新id", added3, ["A-4"]);
  check("追加后保序", service.getNodeById("A")?.childIds, ["A-3", "A-4"]);
  assertConsistent("追加加载后", service);
}

/* ================================================================== */
console.log("—— 4. 嵌套数据递归展开 ——");
{
  const service = createLazyTree();
  service.setNodeChildren("A", [
    {
      id: "A-1",
      name: "A-1",
      children: [
        { id: "A-1-1", name: "A-1-1", children: [] },
        {
          id: "A-1-2",
          name: "A-1-2",
          children: [{ id: "A-1-2-1", name: "A-1-2-1", children: [] }],
        },
      ],
    },
  ]);
  check("嵌套子节点已展开", service.getNodeById("A-1")?.childIds, [
    "A-1-1",
    "A-1-2",
  ]);
  check("二层嵌套已展开", service.getNodeById("A-1-2")?.childIds, ["A-1-2-1"]);
  check("深层节点层级正确", service.getNodeById("A-1-2-1")?.level, 3);
  ok("A-1 因有子节点标记为父节点", !!service.getNodeById("A-1")?.isParent);
  ok("叶子 A-1-1 非父节点", !service.getNodeById("A-1-1")?.isParent);
  assertConsistent("嵌套加载后", service);
}

/* ================================================================== */
console.log("—— 5. 加载空数组 → 归一化为叶子 ——");
{
  const service = createLazyTree();
  const added = service.setNodeChildren("A", []);
  check("空加载无新增节点", added, []);
  ok("A 不再是父节点（箭头消失）", !service.hasChildren("A"));
  ok("A.isParent 已被归一化", service.getNodeById("A")?.isParent === false);
  assertConsistent("空加载后", service);
}

/* ================================================================== */
console.log("—— 6. 加载子节点后的勾选联动一致性 ——");
{
  // 受控勾选：A 已勾选，加载子节点后子节点应继承联动
  const service = new YTreeService(
    [
      { id: "A", name: "A", isParent: true, checked: true, children: [] },
      { id: "B", name: "B", children: [] },
    ],
    null,
    null,
    null,
    null,
    null,
    null,
  );
  service.setNodeChildren("A", [
    { id: "A-1", name: "A-1", children: [] },
    { id: "A-2", name: "A-2", checked: true, children: [] },
  ]);
  assertConsistent("父已勾选时加载子节点", service);

  // 加载后修改子节点勾选，父节点状态应正确联动
  service.setCheckedByUser("A-1", true, true);
  check(
    "两个子节点勾选后 A 为 checked",
    service.getNodeCheckedState("A"),
    "checked",
  );
  service.setCheckedByUser("A-2", false, true);
  check(
    "一个子节点取消后 A 为 indeterminate",
    service.getNodeCheckedState("A"),
    "indeterminate",
  );
  assertConsistent("加载后勾选联动", service);

  // 手写: 验证 leaf 统计
  const summary = service.getTreeCheckedSummary();
  check("叶子总数 = A-1 + A-2 + B", summary.totalLeaf, 3);
  check("已勾选叶子数 = A-1", summary.checkedLeaf, 1);
}

/* ================================================================== */
console.log("—— 7. 虚拟根节点（根节点异步） ——");
{
  const service = createLazyTree();
  const root = service.createLazyRootNode();
  check("虚拟根 id", root.id, Y_TREE_ROOT_ID);
  ok("虚拟根 isRoot", root.isRoot);
  ok("虚拟根 isParent", !!root.isParent);
  check("虚拟根 childIds 为空", root.childIds, []);
}

/* ================================================================== */
console.log("—— 8. 多层懒加载：逐级加载后勾选传播 ——");
{
  const service = createLazyTree();
  service.setNodeChildren("A", [
    { id: "A-1", name: "A-1", isParent: true, children: [] },
  ]);
  ok("A-1 为待加载父节点", service.isLazyParent("A-1"));
  assertConsistent("一级加载后", service);

  // 勾选 A-1（此时是叶子）
  service.setCheckedByUser("A-1", true, true);
  check("A-1 勾选传导至 A", service.getNodeCheckedState("A"), "checked");
  assertConsistent("加载后勾选 A-1", service);

  // 二级加载：A-1 下挂两个子节点，勾选状态应保持（搬运语义：子树汇总）
  service.setNodeChildren("A-1", [
    { id: "A-1-1", name: "A-1-1", children: [] },
    { id: "A-1-2", name: "A-1-2", children: [] },
  ]);
  ok("A-1 不再是待加载父节点", !service.isLazyParent("A-1"));
  assertConsistent("二级加载后", service);

  const summary = service.getTreeCheckedSummary();
  check("叶子数 = A-1-1 + A-1-2 + B", summary.totalLeaf, 3);
}

/* ================================================================== */
console.log("—— 9. 大数据懒加载冒烟 ——");
{
  const service = createLazyTree();
  const start = performance.now();
  // 分 10 批加载，每批 1000 个节点
  for (let batch = 0; batch < 10; batch++) {
    const children = [];
    for (let i = 0; i < 1000; i++) {
      children.push({
        id: `N-${batch}-${i}`,
        name: `N-${batch}-${i}`,
        children: [],
      });
    }
    service.setNodeChildren("A", children, batch > 0);
  }
  const cost = performance.now() - start;
  check(
    "A 下累计 10000 个子节点",
    service.getNodeById("A")?.childIds.length,
    10000,
  );
  ok(`一万节点分批评加载耗时 ${cost.toFixed(1)}ms`, cost < 5000);
  assertConsistent("批量懒加载后", service);
}

/* ================================================================== */
console.log(
  `\n${
    failures === 0 ? "✅ 全部通过" : "❌ 存在失败"
  }：${passed} 通过，${failures} 失败`,
);
process.exit(failures === 0 ? 0 : 1);
