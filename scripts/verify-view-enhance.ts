/**
 * P5 展示增强正确性验证
 *
 * 覆盖：
 * 1. 图标解析：icon / iconOpen / iconClose / iconSkin / 默认文件夹文档 / URL
 * 2. title：节点 title、回退 name、showTitle=false、自定义函数
 * 3. fontCss：对象 / 函数
 * 4. expandSpeed 归一化
 * 5. selectNode / cancelSelectedNode / getSelectedNodes（单选、追加、清空）
 * 6. 删除节点时清理 selectedIds
 *
 * 运行：node --experimental-strip-types scripts/verify-view-enhance.ts
 */
import { YTreeService } from "../common/service.ts";
import {
  isIconUrl,
  parseExpandSpeed,
  resolveFontCss,
  resolveNodeIcon,
  resolveNodeTitle,
} from "../common/view.ts";
import type { YTreeModel } from "../common/model.ts";

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

function asModel(partial: Partial<YTreeModel>): YTreeModel {
  return {
    id: "n",
    name: "节点",
    pId: "",
    isRoot: true,
    isFirst: true,
    isLast: true,
    childIds: [],
    preId: "",
    nextId: "",
    index: 0,
    level: 0,
    ...partial,
  };
}

function tree() {
  return [
    {
      id: "A",
      name: "A",
      selected: true,
      children: [
        { id: "A-1", name: "A-1", children: [] },
        { id: "A-2", name: "A-2", children: [] },
      ],
    },
    { id: "B", name: "B", children: [] },
  ];
}

/* ================================================================== */
console.log("—— 1. 图标解析 ——");
{
  const leaf = asModel({ id: "l", name: "叶子" });
  check("叶子默认文档图标", resolveNodeIcon(leaf, false, false), {
    type: "class",
    className: "fa-regular fa-file",
  });

  const folder = asModel({ id: "f", name: "文件夹", childIds: ["x"] });
  check("父节点折叠默认文件夹", resolveNodeIcon(folder, false, true), {
    type: "class",
    className: "fa-solid fa-folder",
  });
  check("父节点展开默认打开文件夹", resolveNodeIcon(folder, true, true), {
    type: "class",
    className: "fa-solid fa-folder-open",
  });

  const custom = asModel({
    id: "c",
    icon: "fa-solid fa-star",
    iconOpen: "fa-solid fa-book-open",
    iconClose: "fa-solid fa-book",
    childIds: ["x"],
  });
  check("iconOpen 优先于 icon", resolveNodeIcon(custom, true, true), {
    type: "class",
    className: "fa-solid fa-book-open",
  });
  check("iconClose 优先于 icon", resolveNodeIcon(custom, false, true), {
    type: "class",
    className: "fa-solid fa-book",
  });
  check("叶子走 icon", resolveNodeIcon(custom, false, false), {
    type: "class",
    className: "fa-solid fa-star",
  });

  const skin = asModel({ id: "s", iconSkin: "p5", childIds: ["x"] });
  check("iconSkin 展开", resolveNodeIcon(skin, true, true), {
    type: "class",
    className: "y-tree-icon-skin y-tree-icon-skin-p5 is-open",
  });
  check(
    "iconSkin 叶子",
    resolveNodeIcon(asModel({ iconSkin: "p5" }), false, false),
    {
      type: "class",
      className: "y-tree-icon-skin y-tree-icon-skin-p5 is-docu",
    },
  );

  const url = asModel({ icon: "https://example.com/a.png" });
  check("URL 图标", resolveNodeIcon(url, false, false), {
    type: "img",
    src: "https://example.com/a.png",
  });
  ok("识别 png URL", isIconUrl("./icons/a.png"));
  ok("识别 https", isIconUrl("https://x.com/a.svg"));
  ok("class 不是 URL", isIconUrl("fa-solid fa-star") === false);

  check("showIcon=false 不渲染", resolveNodeIcon(leaf, false, false, false), {
    type: "none",
  });
}

/* ================================================================== */
console.log("—— 2. title ——");
{
  const n = asModel({ name: "节点名", title: "自定义提示" });
  check("优先节点 title", resolveNodeTitle(n), "自定义提示");
  check("回退 name", resolveNodeTitle(asModel({ name: "仅名称" })), "仅名称");
  check("showTitle=false 为空", resolveNodeTitle(n, false), "");
  check(
    "自定义函数",
    resolveNodeTitle(n, true, (node) => `id=${node.id}`),
    "id=n",
  );
}

/* ================================================================== */
console.log("—— 3. fontCss ——");
{
  const n = asModel({ id: "A" });
  check("对象样式", resolveFontCss(n, { color: "red" }), { color: "red" });
  check(
    "函数按节点",
    resolveFontCss(n, (node) => (node.id === "A" ? { color: "blue" } : {})),
    { color: "blue" },
  );
  check("缺省空对象", resolveFontCss(n), {});
}

/* ================================================================== */
console.log("—— 4. expandSpeed ——");
{
  check("默认关闭", parseExpandSpeed(undefined), 0);
  check("false 关闭", parseExpandSpeed(false), 0);
  check("空字符串关闭", parseExpandSpeed(""), 0);
  check("0 关闭", parseExpandSpeed(0), 0);
  check("fast=200", parseExpandSpeed("fast"), 200);
  check("slow=400", parseExpandSpeed("slow"), 400);
  check("数字毫秒", parseExpandSpeed(320), 320);
}

/* ================================================================== */
console.log("—— 5. selectNode / cancelSelectedNode / getSelectedNodes ——");
{
  const s = new YTreeService(tree());
  check(
    "init 内联 selected 生效",
    s.getSelectedNodes().map((n) => n.id),
    ["A"],
  );

  ok("点 B 替换选中", s.selectNode("B"));
  check(
    "仅 B",
    s.getSelectedNodes().map((n) => n.id),
    ["B"],
  );
  ok("A.selected 已清", s.getNodeById("A")?.selected === false);

  ok("追加 A-1", s.selectNode("A-1", true));
  check(
    "B + A-1",
    s
      .getSelectedNodes()
      .map((n) => n.id)
      .sort(),
    ["A-1", "B"],
  );

  ok("取消 B", s.cancelSelectedNode("B"));
  check(
    "仅 A-1",
    s.getSelectedNodes().map((n) => n.id),
    ["A-1"],
  );

  ok("单选切回 B", s.selectNode("B"));
  check(
    "仅 B",
    s.getSelectedNodes().map((n) => n.id),
    ["B"],
  );
  ok("重复选中 B（单选）返回 false", s.selectNode("B") === false);

  ok("清空全部", s.cancelSelectedNode());
  check(
    "清空后空",
    s.getSelectedNodes().map((n) => n.id),
    [],
  );
  ok("重复清空返回 false", s.cancelSelectedNode() === false);
}

/* ================================================================== */
console.log("—— 6. 删除节点清理 selectedIds ——");
{
  const s = new YTreeService(tree());
  s.selectNode("A-1");
  s.removeNode("A");
  check(
    "删除后选中清空",
    s.getSelectedNodes().map((n) => n.id),
    [],
  );
}

console.log(
  `\n${
    failures === 0 ? "✅ 全部通过" : "❌ 存在失败"
  }：${passed} 通过，${failures} 失败`,
);
process.exit(failures === 0 ? 0 : 1);
