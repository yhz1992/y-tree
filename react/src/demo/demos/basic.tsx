import { useState } from "react";
import YTree from "../../components/y-tree";
import type { DemoMeta } from "../types";
import { basicData } from "../data";
import type { YTreeNode } from "../../../../common/model";

/**
 * 展开演示数据：数据源不带内联 expanded，
 * 展开状态完全由 expandIds 受控（空数组表示全部收起）
 */
const expandData: Array<YTreeNode> = [
  {
    id: "1",
    name: "节点 1",
    children: [
      { id: "1-1", name: "节点 1-1", children: [] },
      { id: "1-2", name: "节点 1-2", children: [] },
    ],
  },
  { id: "2", name: "节点 2", children: [] },
  { id: "3", name: "节点 3", children: [] },
];

/* ------------------------------------------------------------------ */
/* 1. 基础用法                                                         */
/* ------------------------------------------------------------------ */

const basicCode = `import YTree from "y-tree-react";

const data = [
  {
    id: "1",
    name: "节点 1",
    expanded: true,
    children: [
      { id: "1-1", name: "节点 1-1", children: [] },
      { id: "1-2", name: "节点 1-2", children: [] },
    ],
  },
  { id: "2", name: "节点 2", children: [] },
  { id: "3", name: "节点 3", children: [] },
];

export default () => <YTree datasource={data} />;`;

function BasicDemo() {
  return <YTree datasource={basicData} height={140} />;
}

/* ------------------------------------------------------------------ */
/* 2. 展开与折叠                                                       */
/* ------------------------------------------------------------------ */

const expandCode = `import { useState } from "react";
import YTree from "y-tree-react";

export default function App() {
  // 受控展开：expandIds 决定哪些节点展开
  // 注意：空数组表示「未受控」，会回退到数据源内联的 expanded 状态，
  // 所以受控场景下数据源不要写 expanded，空数组即「全部收起」
  const [expandIds, setExpandIds] = useState(["1"]);

  return (
    <>
      <button onClick={() => setExpandIds(["1"])}>展开节点 1</button>
      <button onClick={() => setExpandIds([])}>全部收起</button>

      <YTree
        datasource={data}
        expandIds={expandIds}
        onExpandChange={(e) => {
          // 受控模式下需自行同步展开状态
          setExpandIds((prev) =>
            e.expand ? [...prev, e.id] : prev.filter((id) => id !== e.id),
          );
        }}
      />
    </>
  );
}`;

function ExpandDemo() {
  const [expandIds, setExpandIds] = useState<Array<string | number>>(["1"]);
  const [log, setLog] = useState("当前受控展开：节点 1");

  return (
    <>
      <div className="demo-toolbar">
        <button
          type="button"
          onClick={() => {
            setExpandIds(["1"]);
            setLog("展开节点 1");
          }}
        >
          展开节点 1
        </button>
        <button
          type="button"
          onClick={() => {
            setExpandIds([]);
            setLog("全部收起");
          }}
        >
          全部收起
        </button>
      </div>
      <YTree
        datasource={expandData}
        expandIds={expandIds}
        height={140}
        onExpandChange={(e) => {
          setExpandIds((prev) =>
            e.expand ? [...prev, e.id] : prev.filter((id) => id !== e.id),
          );
          setLog(`onExpandChange: id=${e.id}, expand=${e.expand}`);
        }}
      />
      <p className="demo-tip">{log}</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3. 连接线                                                           */
/* ------------------------------------------------------------------ */

const lineCode = `import YTree from "y-tree-react";

// showLine 显示层级连接虚线，展开全部节点查看完整连线
export default () => (
  <YTree datasource={data} showLine expandAll />
);`;

function ShowLineDemo() {
  return <YTree datasource={basicData} showLine expandAll height={140} />;
}

/* ------------------------------------------------------------------ */
/* 4. 尺寸                                                             */
/* ------------------------------------------------------------------ */

const sizeCode = `import YTree from "y-tree-react";

// size 控制节点行高与字号：small / default / large
export default () => (
  <>
    <YTree datasource={data} size="small" />
    <YTree datasource={data} size="default" />
    <YTree datasource={data} size="large" />
  </>
);`;

function SizeDemo() {
  const sizes = ["small", "default", "large"] as const;
  return (
    <div className="demo-row">
      {sizes.map((size) => (
        <div className="demo-col" key={size}>
          <div className="demo-col-label">size="{size}"</div>
          <YTree datasource={basicData} size={size} expandAll height={140} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export const basicDemos: Array<DemoMeta> = [
  {
    id: "basic",
    title: "基础用法",
    desc: "传入 datasource 即可渲染一棵树，节点通过 children 嵌套。",
    code: basicCode,
    render: () => <BasicDemo />,
  },
  {
    id: "expand",
    title: "展开与折叠",
    desc: "expandIds 受控控制展开状态，onExpandChange 监听展开变化；expandAll 可默认展开全部。空数组表示「未受控」，会回退到数据源内联的 expanded 状态。",
    code: expandCode,
    render: () => <ExpandDemo />,
  },
  {
    id: "show-line",
    title: "连接线",
    desc: "showLine 显示节点之间的层级连接虚线，便于识别父子关系。",
    code: lineCode,
    render: () => <ShowLineDemo />,
  },
  {
    id: "size",
    title: "尺寸",
    desc: "size 控制节点行高与字号，可选 small / default / large。",
    code: sizeCode,
    render: () => <SizeDemo />,
  },
];
