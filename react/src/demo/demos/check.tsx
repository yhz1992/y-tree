import { useRef, useState } from "react";
import YTree, { type YTreeRef } from "../../components/y-tree";
import type { DemoMeta } from "../types";
import type { YTreeNode } from "../../../../common/model";

const radioData: Array<YTreeNode> = [
  {
    id: "A",
    name: "部门 A",
    expanded: true,
    children: [
      { id: "A-1", name: "A-1", children: [] },
      { id: "A-2", name: "A-2", children: [] },
    ],
  },
  {
    id: "B",
    name: "部门 B",
    expanded: true,
    children: [
      { id: "B-1", name: "B-1", children: [] },
      { id: "B-2", name: "B-2", children: [] },
    ],
  },
];

const chkboxData: Array<YTreeNode> = [
  {
    id: "1",
    name: "节点 1",
    expanded: true,
    children: [
      { id: "1-1", name: "节点 1-1", children: [] },
      { id: "1-2", name: "节点 1-2", children: [] },
      {
        id: "1-3",
        name: "节点 1-3",
        expanded: true,
        children: [
          { id: "1-3-1", name: "节点 1-3-1", children: [] },
          { id: "1-3-2", name: "节点 1-3-2", children: [] },
        ],
      },
    ],
  },
  { id: "2", name: "节点 2", children: [] },
];

function namesOf(ref: React.RefObject<YTreeRef | null>): string {
  const list = ref.current?.getCheckedList(false) ?? [];
  return list.map((n) => n.name).join("、") || "（无）";
}

/* ------------------------------------------------------------------ */
/* 1. radio 整树互斥                                                   */
/* ------------------------------------------------------------------ */

const radioAllCode = `import YTree from "y-tree-react";

// chkStyle="radio" + radioType="all"：整棵树只能勾选一个节点
<YTree datasource={data} checkable chkStyle="radio" radioType="all" />;`;

function RadioAllDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [log, setLog] = useState("（点击单选，整树只能勾选一个）");
  return (
    <>
      <YTree
        ref={treeRef}
        datasource={radioData}
        checkable
        chkStyle="radio"
        radioType="all"
        height={196}
        onCheckedChange={(e) =>
          setLog(`勾选 ${e.id}｜当前：${namesOf(treeRef)}`)
        }
      />
      <p className="demo-tip">
        `chkStyle="radio"` +
        `radioType="all"`：整棵树只能勾选一个节点，勾选新节点会清掉旧的。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. radio 同级互斥                                                   */
/* ------------------------------------------------------------------ */

const radioLevelCode = `import YTree from "y-tree-react";

// radioType="level"：同一父节点下的兄弟互斥，跨级可以同时勾选
<YTree datasource={data} checkable chkStyle="radio" radioType="level" />;`;

function RadioLevelDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [log, setLog] = useState("（同级互斥，跨级可并存）");
  return (
    <>
      <YTree
        ref={treeRef}
        datasource={radioData}
        checkable
        chkStyle="radio"
        radioType="level"
        height={196}
        onCheckedChange={(e) =>
          setLog(`勾选 ${e.id}｜当前：${namesOf(treeRef)}`)
        }
      />
      <p className="demo-tip">
        `radioType="level"`：同一父节点下的兄弟互斥；不同层级（如 A 与
        A-1）可以同时勾选。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3. chkboxType 联动方向                                              */
/* ------------------------------------------------------------------ */

const chkboxTypeCode = `import YTree from "y-tree-react";

// Y = 勾选时影响的方向，N = 取消勾选时影响的方向
// p = 祖先，s = 子孙；空字符串 = 不联动
<YTree
  datasource={data}
  checkable
  chkboxType={{ Y: "s", N: "s" }}  // 只联动子孙
/>;`;

function ChkboxTypeDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [mode, setMode] = useState<"ps" | "s" | "p" | "none">("s");
  const [log, setLog] = useState("（切换联动方向后勾选观察）");
  const chkboxType =
    mode === "none"
      ? { Y: "", N: "" }
      : mode === "ps"
      ? { Y: "ps", N: "ps" }
      : mode === "s"
      ? { Y: "s", N: "s" }
      : { Y: "p", N: "p" };
  return (
    <>
      <div className="demo-toolbar" style={{ marginBottom: 8 }}>
        <button type="button" onClick={() => setMode("ps")}>
          双向 ps{mode === "ps" ? " ✓" : ""}
        </button>
        <button type="button" onClick={() => setMode("s")}>
          只子孙 s{mode === "s" ? " ✓" : ""}
        </button>
        <button type="button" onClick={() => setMode("p")}>
          只祖先 p{mode === "p" ? " ✓" : ""}
        </button>
        <button type="button" onClick={() => setMode("none")}>
          不联动{mode === "none" ? " ✓" : ""}
        </button>
      </div>
      <YTree
        key={mode}
        ref={treeRef}
        datasource={chkboxData}
        checkable
        chkboxType={chkboxType}
        height={224}
        onCheckedChange={(e) =>
          setLog(`勾选 ${e.id}=${e.checked}｜当前：${namesOf(treeRef)}`)
        }
      />
      <p className="demo-tip">
        `chkboxType` 控制联动方向：`s` 只改子孙、`p`
        只改祖先、空字符串完全不联动。切换模式会重建树。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. 全选 / 全不选                                                    */
/* ------------------------------------------------------------------ */

const checkAllCode = `import { useRef } from "react";
import YTree, { type YTreeRef } from "y-tree-react";

const treeRef = useRef<YTreeRef>(null);

treeRef.current?.checkAllNodes(true);   // 全选
treeRef.current?.cancelAllNodes();      // 全不选`;

function CheckAllDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [log, setLog] = useState("（点击全选 / 全不选）");
  const refresh = (action: string) =>
    setLog(`${action}｜当前：${namesOf(treeRef)}`);
  return (
    <>
      <YTree
        ref={treeRef}
        datasource={chkboxData}
        checkable
        height={224}
        onCheckedChange={() => refresh("勾选变化")}
      />
      <div className="demo-toolbar" style={{ marginTop: 10, marginBottom: 0 }}>
        <button
          type="button"
          onClick={() => {
            treeRef.current?.checkAllNodes(true);
            refresh("checkAllNodes(true)");
          }}
        >
          全选
        </button>
        <button
          type="button"
          onClick={() => {
            treeRef.current?.cancelAllNodes();
            refresh("cancelAllNodes()");
          }}
        >
          全不选
        </button>
      </div>
      <p className="demo-tip">
        `checkAllNodes(true)` 全选，`cancelAllNodes()` 全不选。radio
        模式下全选无效。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. 程序化勾选 + 变更审计                                            */
/* ------------------------------------------------------------------ */

const checkNodeCode = `const treeRef = useRef<YTreeRef>(null);

// 程序化勾选（可改 disabled 节点）
treeRef.current?.checkNode("1-1", true);

// 相对 init 快照，勾选状态发生变化的节点
const changed = treeRef.current?.getChangeCheckedNodes();`;

function CheckNodeDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [log, setLog] = useState("（先勾选几个节点，再点「查看变更」）");
  return (
    <>
      <YTree ref={treeRef} datasource={chkboxData} checkable height={224} />
      <div className="demo-toolbar" style={{ marginTop: 10, marginBottom: 0 }}>
        <button
          type="button"
          onClick={() => {
            const ok = treeRef.current?.checkNode("1-1", true);
            setLog(
              `checkNode("1-1", true) => ${ok}｜当前：${namesOf(treeRef)}`,
            );
          }}
        >
          勾选「节点 1-1」
        </button>
        <button
          type="button"
          onClick={() => {
            const changed = treeRef.current?.getChangeCheckedNodes() ?? [];
            setLog(
              `getChangeCheckedNodes() => ${
                changed.map((n) => n.name).join("、") || "（无变更）"
              }`,
            );
          }}
        >
          查看变更
        </button>
      </div>
      <p className="demo-tip">
        `checkNode` 走 API 通道，可改 disabled 节点；`getChangeCheckedNodes`
        对比 init 时的勾选快照。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */

export const checkDemos: Array<DemoMeta> = [
  {
    id: "radio-all",
    title: "单选 · 整树互斥",
    desc: 'chkStyle="radio" + radioType="all"：整棵树只能勾选一个节点，勾选新节点会清掉旧的。',
    code: radioAllCode,
    render: () => <RadioAllDemo />,
  },
  {
    id: "radio-level",
    title: "单选 · 同级互斥",
    desc: 'radioType="level"：同一父节点下的兄弟互斥，跨级可以同时勾选。',
    code: radioLevelCode,
    render: () => <RadioLevelDemo />,
  },
  {
    id: "chkbox-type",
    title: "联动方向",
    desc: "chkboxType 控制父子联动方向：Y/N 分别对应勾选与取消，p=祖先、s=子孙。",
    code: chkboxTypeCode,
    render: () => <ChkboxTypeDemo />,
  },
  {
    id: "check-all",
    title: "全选 / 全不选",
    desc: "通过 ref 的 checkAllNodes(true) / cancelAllNodes() 全选或全不选。radio 模式下全选无效。",
    code: checkAllCode,
    render: () => <CheckAllDemo />,
  },
  {
    id: "check-node",
    title: "程序化勾选",
    desc: "checkNode(id, checked) 程序化勾选（可改 disabled）；getChangeCheckedNodes() 返回相对 init 快照发生变化的节点。",
    code: checkNodeCode,
    render: () => <CheckNodeDemo />,
  },
];
