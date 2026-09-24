/**
 * P6 查询 / 结构转换 / 节点更新 正确性验证
 *
 * 覆盖：
 * 1. getNodes / getNodeIndex
 * 2. getNodesByParam / getNodesByParamFuzzy（含子树范围）
 * 3. transformToArray / transformToTreeNodes 往返
 * 4. transformToTreeNodesFromFlat
 * 5. updateNode 展示字段；不改结构；checked / selected 走既有状态机
 *
 * 运行：node --experimental-strip-types scripts/verify-api.ts
 */
import { YTreeService } from "../common/service.ts";
import type { YTreeFlatNode, YTreeNode } from "../common/model.ts";

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

function tree(): Array<YTreeNode> {
  return [
    {
      id: "1",
      name: "节点 1",
      title: "部门 A",
      expanded: true,
      children: [
        { id: "1-1", name: "节点 1-1", title: "前端", children: [] },
        { id: "1-2", name: "节点 1-2", title: "后端", children: [] },
      ],
    },
    { id: "2", name: "节点 2", title: "部门 B", children: [] },
    { id: "3", name: "叶子 3", children: [] },
  ];
}

function svc() {
  return new YTreeService(tree());
}

console.log("—— 1. getNodes / getNodeIndex ——");
{
  const s = svc();
  check(
    "getNodes 根顺序",
    s.getNodes().map((n) => n.id),
    ["1", "2", "3"],
  );
  check("根节点下标", s.getNodeIndex("2"), 1);
  check("子节点下标", s.getNodeIndex("1-2"), 1);
  check("不存在 -1", s.getNodeIndex("nope"), -1);
}

console.log("—— 2. getNodesByParam / Fuzzy ——");
{
  const s = svc();
  check(
    "精确 name",
    s.getNodesByParam("name", "节点 1-1").map((n) => n.id),
    ["1-1"],
  );
  check(
    "精确 title",
    s.getNodesByParam("title", "部门 B").map((n) => n.id),
    ["2"],
  );
  check(
    "模糊 name 节点",
    s.getNodesByParamFuzzy("name", "节点").map((n) => n.id),
    ["1", "1-1", "1-2", "2"],
  );
  check(
    "子树范围不含兄弟",
    s.getNodesByParamFuzzy("name", "节点", "1").map((n) => n.id),
    ["1", "1-1", "1-2"],
  );
  check(
    "忽略大小写",
    s.getNodesByParamFuzzy("title", "前端").map((n) => n.id),
    ["1-1"],
  );
  check("不存在父", s.getNodesByParam("name", "x", "nope").length, 0);
}

console.log("—— 3. transform 往返 ——");
{
  const s = svc();
  check(
    "transformToArray DFS",
    s.transformToArray().map((n) => n.id),
    ["1", "1-1", "1-2", "2", "3"],
  );
  check(
    "transformToArray 子树",
    s.transformToArray("1").map((n) => n.id),
    ["1", "1-1", "1-2"],
  );
  const nested = s.transformToTreeNodes();
  check(
    "嵌套根 id",
    nested.map((n) => n.id),
    ["1", "2", "3"],
  );
  check(
    "嵌套 children",
    nested[0].children.map((n) => n.id),
    ["1-1", "1-2"],
  );
  check("叶子 children 空数组", nested[1].children, []);
  const round = new YTreeService(nested);
  check(
    "往返后扁平 id",
    round.transformToArray().map((n) => n.id),
    ["1", "1-1", "1-2", "2", "3"],
  );
}

console.log("—— 4. transformToTreeNodesFromFlat ——");
{
  const s = svc();
  const flat: Array<YTreeFlatNode> = [
    { id: "a", name: "A", pId: "" },
    { id: "a-1", name: "A-1", pId: "a" },
    { id: "b", name: "B", pId: "" },
  ];
  const nested = s.transformToTreeNodesFromFlat(flat);
  check(
    "扁转嵌套根",
    nested.map((n) => n.id),
    ["a", "b"],
  );
  check(
    "扁转嵌套子",
    nested[0].children.map((n) => n.id),
    ["a-1"],
  );
}

console.log("—— 5. updateNode ——");
{
  const s = svc();
  check("改 name", s.updateNode("1-1", { name: "前端组" }), true);
  check("读 name", s.getNodeById("1-1")?.name, "前端组");
  check(
    "改 title/icon",
    s.updateNode("1-1", { title: "FE", icon: "fa-code" }),
    true,
  );
  check("读 title", s.getNodeById("1-1")?.title, "FE");
  check("读 icon", s.getNodeById("1-1")?.icon, "fa-code");
  const beforeKids = [...(s.getNodeById("1")?.childIds ?? [])];
  s.updateNode("1", { id: "hacked", pId: "x", childIds: [] } as any);
  check("不改 id", s.getNodeById("1")?.id, "1");
  check("不改 childIds", s.getNodeById("1")?.childIds, beforeKids);
  check("同值无变更", s.updateNode("2", { name: "节点 2" }), false);
  check("禁用", s.updateNode("2", { disabled: true }), true);
  check("读 disabled", s.getNodeById("2")?.disabled, true);

  check("selected true", s.updateNode("1-1", { selected: true }), true);
  check(
    "getSelectedNodes",
    s.getSelectedNodes().map((n) => n.id),
    ["1-1"],
  );
  check("selected false", s.updateNode("1-1", { selected: false }), true);
  check("清空选中", s.getSelectedNodes().length, 0);

  check("checked true", s.updateNode("1-1", { checked: true }), true);
  check("读 checked", s.getNodeById("1-1")?.checked, true);
}

if (failures) {
  console.error(`\n❌ ${failures} 失败，${passed} 通过`);
  process.exit(1);
}
console.log(`\n✅ 全部通过：${passed} 通过，0 失败`);
