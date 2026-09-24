/**
 * P4 勾选增强正确性验证
 *
 * 覆盖：
 * 1. radio all：整树互斥
 * 2. radio level：同级互斥、跨级可并存
 * 3. chkboxType Y:"s" N:"s"：只联动子孙，祖先不重算
 * 4. chkboxType Y:"p" N:"p"：只联动祖先，子孙不改
 * 5. chkboxType Y:"" N:""：完全不联动（等同 checkStrictly）
 * 6. checkAllNodes / cancelAllNodes
 * 7. getChangeCheckedNodes 相对 init 快照
 * 8. checkNode API 可改 disabled
 * 9. radio 下 checkAllNodes(true) 无效
 *
 * 运行：node --experimental-strip-types scripts/verify-check-enhance.ts
 */
import { YTreeService } from "../common/service.ts";

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

function idsOf(service: YTreeService): Array<string | number> {
  return [...service.getCheckedIds(false)].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
}

function tree() {
  return [
    {
      id: "A",
      name: "A",
      children: [
        { id: "A-1", name: "A-1", children: [] },
        { id: "A-2", name: "A-2", children: [] },
      ],
    },
    {
      id: "B",
      name: "B",
      children: [
        { id: "B-1", name: "B-1", children: [] },
        { id: "B-2", name: "B-2", children: [] },
      ],
    },
  ];
}

/* ================================================================== */
console.log("—— 1. radio all：整树互斥 ——");
{
  const s = new YTreeService(tree());
  s.configureCheckMode("radio", "all");
  ok("勾选 A-1", s.setCheckedByUser("A-1", true, true));
  check("仅 A-1", idsOf(s), ["A-1"]);
  ok("再勾 B-1", s.setCheckedByUser("B-1", true, true));
  check("仅 B-1（A-1 被清）", idsOf(s), ["B-1"]);
  ok("再勾 A", s.setCheckedByUser("A", true, true));
  check("仅 A（radio 不联动子孙）", idsOf(s), ["A"]);
}

/* ================================================================== */
console.log("—— 2. radio level：同级互斥、跨级可并存 ——");
{
  const s = new YTreeService(tree());
  s.configureCheckMode("radio", "level");
  s.setCheckedByUser("A-1", true, true);
  s.setCheckedByUser("A-2", true, true);
  check("同级互斥：A-2 取代 A-1", idsOf(s), ["A-2"]);
  s.setCheckedByUser("B-1", true, true);
  check("跨级可并存：A-2 + B-1", idsOf(s), ["A-2", "B-1"]);
  s.setCheckedByUser("A", true, true);
  check("根级互斥：A 取代 B，子级 A-2/B-1 仍在", idsOf(s), ["A", "A-2", "B-1"]);
}

/* ================================================================== */
console.log("—— 3. chkboxType Y:s N:s 只联动子孙 ——");
{
  const s = new YTreeService(tree());
  s.configureCheckMode("checkbox", "all", { Y: "s", N: "s" });
  s.setCheckedByUser("A", true, true);
  check("勾 A 后子孙全勾", idsOf(s), ["A", "A-1", "A-2"]);
  check("B 不受影响", s.getNodeCheckedState("B"), "unchecked");

  const s2 = new YTreeService(tree());
  s2.configureCheckMode("checkbox", "all", { Y: "s", N: "s" });
  s2.setCheckedByUser("A-1", true, true);
  check("勾叶子 A-1 后祖先不半选", s2.getNodeCheckedState("A"), "unchecked");
  check("仅 A-1 勾选", idsOf(s2), ["A-1"]);
}

/* ================================================================== */
console.log("—— 4. chkboxType Y:p N:p 只联动祖先 ——");
{
  const s = new YTreeService(tree());
  s.configureCheckMode("checkbox", "all", { Y: "p", N: "p" });
  s.setCheckedByUser("A-1", true, true);
  check("勾 A-1 后 A 半选", s.getNodeCheckedState("A"), "indeterminate");
  check("A-2 不被联动", s.getNodeCheckedState("A-2"), "unchecked");
  check("仅 A-1 在 checkIds（半选父不进 checkIds）", idsOf(s), ["A-1"]);

  s.setCheckedByUser("A-2", true, true);
  check("两个叶子勾选后 A 全选", s.getNodeCheckedState("A"), "checked");

  const s2 = new YTreeService(tree());
  s2.configureCheckMode("checkbox", "all", { Y: "p", N: "p" });
  s2.setCheckedByUser("A", true, true);
  check("勾父节点不联动子孙", idsOf(s2), ["A"]);
  check("A-1 仍未勾", s2.getNodeCheckedState("A-1"), "unchecked");
}

/* ================================================================== */
console.log("—— 5. chkboxType 空字符串 = 完全不联动 ——");
{
  const s = new YTreeService(tree());
  s.configureCheckMode("checkbox", "all", { Y: "", N: "" });
  s.setCheckedByUser("A", true, true);
  check("勾 A 不联动", idsOf(s), ["A"]);
  s.setCheckedByUser("A-1", true, true);
  check("勾 A-1 祖先不半选", s.getNodeCheckedState("A"), "checked");
  check("A 与 A-1 独立", idsOf(s), ["A", "A-1"]);
}

/* ================================================================== */
console.log("—— 6. checkAllNodes / cancelAllNodes ——");
{
  const s = new YTreeService(tree());
  ok("全选返回 true", s.checkAllNodes(true));
  check("全选后 6 个节点", idsOf(s).length, 6);
  ok("全不选返回 true", s.cancelAllNodes());
  check("全不选后空", idsOf(s), []);
  ok("重复全不选返回 false", s.cancelAllNodes() === false);
}

/* ================================================================== */
console.log("—— 7. getChangeCheckedNodes ——");
{
  const s = new YTreeService([
    {
      id: "A",
      name: "A",
      children: [
        { id: "A-1", name: "A-1", checked: true, children: [] },
        { id: "A-2", name: "A-2", children: [] },
      ],
    },
  ]);
  check(
    "init 后无变更",
    s.getChangeCheckedNodes().map((n) => n.id),
    [],
  );
  s.setCheckedByUser("A-2", true, true);
  const changed = s
    .getChangeCheckedNodes()
    .map((n) => n.id)
    .sort((a, b) => String(a).localeCompare(String(b)));
  // A-2 新勾选；A 由半选变全选（checked true）
  ok("A-2 出现在变更列表", changed.indexOf("A-2") >= 0);
  ok("A 出现在变更列表（半选→全选）", changed.indexOf("A") >= 0);
}

/* ================================================================== */
console.log("—— 8. checkNode API 可改 disabled ——");
{
  const s = new YTreeService([
    { id: "A", name: "A", disabled: true, children: [] },
    { id: "B", name: "B", children: [] },
  ]);
  ok("用户无法勾选 disabled", s.setCheckedByUser("A", true, true) === false);
  ok("API 可勾选 disabled", s.checkNode("A", true, false));
  check("A 已勾选", s.getNodeCheckedState("A"), "checked");
}

/* ================================================================== */
console.log("—— 9. radio 下 checkAllNodes(true) 无效 ——");
{
  const s = new YTreeService(tree());
  s.configureCheckMode("radio", "all");
  s.setCheckedByUser("A-1", true, true);
  ok("radio 全选返回 false", s.checkAllNodes(true) === false);
  check("仍仅 A-1", idsOf(s), ["A-1"]);
  ok("radio 全不选有效", s.checkAllNodes(false));
  check("全不选后空", idsOf(s), []);
}

/* ================================================================== */
console.log("—— 10. 默认 chkboxType 保持双向联动（回归） ——");
{
  const s = new YTreeService(tree());
  s.setCheckedByUser("A", true, true);
  check("默认勾父 → 子孙全勾", idsOf(s), ["A", "A-1", "A-2"]);
  s.setCheckedByUser("A-1", false, true);
  check("取消叶子 → 父半选", s.getNodeCheckedState("A"), "indeterminate");
}

console.log(
  `\n${
    failures === 0 ? "✅ 全部通过" : "❌ 存在失败"
  }：${passed} 通过，${failures} 失败`,
);
process.exit(failures === 0 ? 0 : 1);
