import { useEffect, useRef, useState } from "react";
import YTree, { type YTreeRef } from "../../components/y-tree";
import type { DemoMeta } from "../types";
import { dragData } from "../data";
import type { YTreeNode } from "../../../../common/model";

/* ------------------------------------------------------------------ */
/* 1. 拖拽移动                                                         */
/* ------------------------------------------------------------------ */

const moveCode = `import YTree from "y-tree-react";

// draggable 开启拖拽；拖到节点中间为 inner，上/下边缘为 prev / next
<YTree
  datasource={data}
  showLine
  expandAll
  draggable
  onNodeChange={(e) => {
    // e: { event, id, sourceId, targetId, position }
    console.log("移动", e.sourceId, "->", e.targetId, e.position);
  }}
/>;`;

function DragMoveDemo() {
  const [log, setLog] = useState("（拖拽节点到目标位置，观察三种落点）");
  return (
    <>
      <YTree
        datasource={dragData}
        showLine
        expandAll
        draggable
        height={140}
        onNodeChange={({ sourceId, targetId, position }) =>
          setLog(
            `onNodeChange: ${sourceId} → ${targetId}（position = ${position}）`,
          )
        }
      />
      <p className="demo-tip">
        拖到节点中间：移入其内部（inner）；拖到节点上 / 下边缘：移到其前 /
        后（prev / next）。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. 拖拽复制                                                         */
/* ------------------------------------------------------------------ */

const copyCode = `import YTree from "y-tree-react";

// isCopy 开启后按住 Ctrl（macOS 为 Cmd）拖拽即复制整棵子树
<YTree
  datasource={data}
  showLine
  expandAll
  draggable
  isCopy
  onDrop={(e) => {
    // e.moveType: "move" | "copy"
    console.log("drop", e.moveType);
  }}
/>;`;

function DragCopyDemo() {
  const [log, setLog] = useState("（按住 Ctrl / Cmd 拖拽节点，观察复制效果）");
  return (
    <>
      <YTree
        datasource={dragData}
        showLine
        expandAll
        draggable
        isCopy
        height={140}
        onDrop={({ moveType }) => setLog(`onDrop: moveType = ${moveType}`)}
        onNodeChange={({ sourceId, targetId, position }) =>
          setLog((prev) => `${prev}｜${sourceId} → ${targetId} (${position})`)
        }
      />
      <p className="demo-tip">
        按住 Ctrl / Cmd 拖拽会复制节点（含整棵子树、id 重映射），不按则为移动。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3. 拖拽限制                                                         */
/* ------------------------------------------------------------------ */

const limitCode = `import YTree from "y-tree-react";

<YTree
  datasource={data}
  showLine
  expandAll
  draggable
  // 只允许拖拽叶子节点
  allowDrag={(node) => node.childIds.length === 0}
  // 禁止在 B 上放置
  allowDrop={(_sourceId, targetId) => targetId !== "b"}
  // 移动距离小于 6px 时不触发拖拽
  minMoveSize={6}
/>;`;

function DragLimitDemo() {
  const [log, setLog] = useState("（只有叶子节点可拖拽，且不能拖到 B）");
  return (
    <>
      <YTree
        datasource={dragData}
        showLine
        expandAll
        draggable
        allowDrag={(node) => node.childIds.length === 0}
        allowDrop={(_sourceId, targetId) => targetId !== "b"}
        minMoveSize={6}
        height={140}
        onNodeChange={({ sourceId, targetId, position }) =>
          setLog(`onNodeChange: ${sourceId} → ${targetId} (${position})`)
        }
      />
      <p className="demo-tip">
        allowDrag / allowDrop 按节点与落点精细控制；minMoveSize
        设置触发拖拽的最小移动距离。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. 拖拽回调                                                         */
/* ------------------------------------------------------------------ */

const callbacksCode = `import YTree from "y-tree-react";

<YTree
  datasource={data}
  draggable
  // 拖拽开始前，返回 false 取消本次拖拽
  beforeDrag={(e) => console.log("beforeDrag", e.sourceId) || true}
  // 放置前，返回 false 取消本次落点
  beforeDrop={(e) => console.log("beforeDrop", e.targetId) || true}
  onDrag={(e) => console.log("onDrag", e.sourceId)}
  // dragover 时高频触发
  onDragMove={(e) => console.log("onDragMove", e.sourceId, e.targetId, e.position)}
  onDrop={(e) => console.log("onDrop", e.moveType)}
  onNodeChange={(e) => console.log("nodeChange", e.position)}
/>;`;

function DragCallbacksDemo() {
  const [log, setLog] = useState("（拖拽节点观察回调触发顺序）");
  const append = (msg: string) =>
    setLog((prev) => msg + "\n" + prev.slice(0, 400));

  return (
    <>
      <YTree
        datasource={dragData}
        showLine
        expandAll
        draggable
        height={140}
        beforeDrag={(e) => {
          append(`beforeDrag id=${e.sourceId}`);
          return true;
        }}
        beforeDrop={(e) => {
          append(`beforeDrop ${e.sourceId} → ${e.targetId} (${e.position})`);
          return true;
        }}
        onDrag={(e) => append(`onDrag id=${e.sourceId} copy=${e.isCopy}`)}
        onDragMove={(e) =>
          append(`onDragMove ${e.sourceId} → ${e.targetId} (${e.position})`)
        }
        onDrop={(e) =>
          append(
            `onDrop ${e.sourceId} → ${e.targetId} (${e.position}) moveType=${e.moveType}`,
          )
        }
        onNodeChange={({ sourceId, targetId, position }) =>
          append(`onNodeChange ${sourceId} → ${targetId} (${position})`)
        }
      />
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. 程序化 API                                                       */
/* ------------------------------------------------------------------ */

const apiCode = `import { useRef } from "react";
import YTree, { type YTreeRef } from "y-tree-react";

export default function App() {
  const treeRef = useRef<YTreeRef>(null);

  return (
    <>
      <YTree ref={treeRef} datasource={data} draggable expandAll />
      <button
        onClick={() => {
          const ok = treeRef.current?.moveNode("b", "a", "prev");
          console.log("moveNode =>", ok);
        }}
      >
        moveNode(B → A 之前)
      </button>
      <button
        onClick={() => {
          const newId = treeRef.current?.copyNode("c", "a", "next");
          console.log("copyNode =>", newId);
        }}
      >
        copyNode(C → A 之后)
      </button>
    </>
  );
}`;

function DragApiDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [data, setData] = useState<Array<YTreeNode>>(() => [...dragData]);
  const [log, setLog] = useState("（点击按钮以程序方式移动 / 复制节点）");
  const [action, setAction] = useState<"move" | "copy" | null>(null);

  // 每次操作前重置数据：子组件 effect 先于父组件执行，此时 service 已重建
  useEffect(() => {
    if (!action) return;
    if (action === "move") {
      const ok = treeRef.current?.moveNode("b", "a", "prev");
      setLog(`moveNode("b", "a", "prev") => ${ok}`);
    } else {
      const newId = treeRef.current?.copyNode("c", "a", "next");
      setLog(`copyNode("c", "a", "next") => ${newId}`);
    }
    setAction(null);
  }, [data, action]);

  return (
    <>
      <YTree ref={treeRef} datasource={data} showLine expandAll height={140} />
      <div className="demo-toolbar" style={{ marginTop: 10, marginBottom: 0 }}>
        <button
          type="button"
          onClick={() => {
            setData([...dragData]);
            setAction("move");
          }}
        >
          moveNode(B → A prev)
        </button>
        <button
          type="button"
          onClick={() => {
            setData([...dragData]);
            setAction("copy");
          }}
        >
          copyNode(C → A next)
        </button>
      </div>
      <p className="demo-tip">{log}</p>
    </>
  );
}

/* ------------------------------------------------------------------ */

export const dragDemos: Array<DemoMeta> = [
  {
    id: "drag-move",
    title: "拖拽移动",
    desc: "draggable 开启原生拖拽，落点分三种：移入（inner）、移到之前（prev）、移到之后（next），拖拽过程中有落点高亮。",
    code: moveCode,
    render: () => <DragMoveDemo />,
  },
  {
    id: "drag-copy",
    title: "拖拽复制",
    desc: "isCopy 开启后，按住 Ctrl / Cmd 拖拽会复制整棵子树（含 id 重映射与勾选状态保留），onDrop 的 moveType 会变为 copy。",
    code: copyCode,
    render: () => <DragCopyDemo />,
  },
  {
    id: "drag-limit",
    title: "拖拽限制",
    desc: "allowDrag 限制哪些节点可被拖动，allowDrop 限制可落点，minMoveSize 设置触发拖拽的最小移动距离。",
    code: limitCode,
    render: () => <DragLimitDemo />,
  },
  {
    id: "drag-callbacks",
    title: "拖拽回调",
    desc: "beforeDrag / beforeDrop 返回 false 可拦截拖拽与落点，onDrag / onDragMove / onDrop 分别对应拖拽开始、拖拽中、放置完成。",
    code: callbacksCode,
    render: () => <DragCallbacksDemo />,
  },
  {
    id: "drag-api",
    title: "程序化拖拽",
    desc: "通过 ref 暴露的 moveNode / copyNode 以代码方式移动或复制节点，分别返回是否成功与新节点 id。",
    code: apiCode,
    render: () => <DragApiDemo />,
  },
];
