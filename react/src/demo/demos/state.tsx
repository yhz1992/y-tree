import { useRef, useState } from "react";
import YTree, { type YTreeRef } from "../../components/y-tree";
import type { DemoMeta } from "../types";
import { basicData, checkData, collectIds } from "../data";
import type { YTreeNode } from "../../../../common/model";

/* 各功能点专属数据：只包含该功能点关心的字段，保证演示纯粹 */

const disabledData: Array<YTreeNode> = [
  {
    id: "1",
    name: "节点 1",
    expanded: true,
    children: [
      { id: "1-1", name: "节点 1-1", children: [] },
      { id: "1-2", name: "节点 1-2（disabled）", disabled: true, children: [] },
    ],
  },
  { id: "2", name: "节点 2（disabled）", disabled: true, children: [] },
  { id: "3", name: "节点 3", children: [] },
];

const nocheckData: Array<YTreeNode> = [
  {
    id: "1",
    name: "节点 1",
    expanded: true,
    children: [
      { id: "1-1", name: "节点 1-1", children: [] },
      { id: "1-2", name: "节点 1-2", children: [] },
    ],
  },
  { id: "2", name: "节点 2（nocheck）", nocheck: true, children: [] },
  { id: "3", name: "节点 3", children: [] },
];

/**
 * 受控勾选演示数据：不带内联 checked，
 * 勾选状态完全由 checkedIds 受控（空数组表示全不勾选）
 */
const controlledData: Array<YTreeNode> = [
  {
    id: "1",
    name: "节点 1",
    expanded: true,
    children: [
      { id: "1-1", name: "节点 1-1", children: [] },
      { id: "1-2", name: "节点 1-2", children: [] },
      { id: "1-3", name: "节点 1-3", children: [] },
    ],
  },
  { id: "2", name: "节点 2", children: [] },
];

const hideData: Array<YTreeNode> = [
  {
    id: "1",
    name: "节点 1",
    expanded: true,
    children: [
      { id: "1-1", name: "节点 1-1", children: [] },
      { id: "1-2", name: "节点 1-2（hide）", hide: true, children: [] },
    ],
  },
  { id: "2", name: "节点 2（hide）", hide: true, children: [] },
  { id: "3", name: "节点 3", children: [] },
];

/* ------------------------------------------------------------------ */
/* 1. 勾选框                                                           */
/* ------------------------------------------------------------------ */

const checkableCode = `import YTree from "y-tree-react";

// checkable 显示勾选框，默认父子联动：
// 勾父节点 -> 全部子节点勾选；子节点部分勾选 -> 父节点半选
export default () => (
  <YTree datasource={data} checkable onCheckedChange={(e) => {
    console.log("checkedChange", e.id, e.checked);
  }} />
);`;

function CheckableDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [log, setLog] = useState("（点击勾选框观察父子联动）");

  return (
    <>
      <YTree
        ref={treeRef}
        datasource={checkData}
        checkable
        expandAll
        height={196}
        onCheckedChange={(e) => {
          const list = treeRef.current?.getCheckedList() ?? [];
          setLog(
            `onCheckedChange: id=${e.id}, checked=${e.checked}｜全树已勾选 ${list.length} 个节点`,
          );
        }}
      />
      <p className="demo-tip">{log}</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. 严格模式（父子不联动）                                           */
/* ------------------------------------------------------------------ */

const strictCode = `import YTree from "y-tree-react";

// checkStrictly 后父子勾选状态互不影响
export default () => (
  <YTree datasource={data} checkable checkStrictly />
);`;

function CheckStrictlyDemo() {
  return (
    <div className="demo-row">
      <div className="demo-col">
        <div className="demo-col-label">默认：父子联动</div>
        <YTree datasource={checkData} checkable expandAll height={196} />
      </div>
      <div className="demo-col">
        <div className="demo-col-label">checkStrictly：互不联动</div>
        <YTree
          datasource={checkData}
          checkable
          checkStrictly
          expandAll
          height={196}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. 受控勾选                                                         */
/* ------------------------------------------------------------------ */

const controlledCode = `import { useRef, useState } from "react";
import YTree, { type YTreeRef } from "y-tree-react";

export default function App() {
  const treeRef = useRef<YTreeRef>(null);
  // 空数组表示「未受控」，会回退到数据源内联的 checked 状态，
  // 因此受控场景下数据源不要写 checked，空数组即「全部取消」
  const [checkedIds, setCheckedIds] = useState(["1-2"]);

  return (
    <>
      <button onClick={() => setCheckedIds(allIds)}>全选</button>
      <button onClick={() => setCheckedIds([])}>清空</button>

      <YTree
        ref={treeRef}
        datasource={data}
        checkable
        checkedIds={checkedIds}
        onCheckedChange={() => {
          // 父子联动会连带改变其他节点，直接读取服务里的完整勾选集合
          setCheckedIds(treeRef.current?.getCheckedList().map((n) => n.id) ?? []);
        }}
      />
    </>
  );
}`;

function ControlledDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [checkedIds, setCheckedIds] = useState<Array<string | number>>(["1-2"]);
  const [log, setLog] = useState('受控 checkedIds = ["1-2"]');

  const sync = (ids: Array<string | number>, msg: string) => {
    setCheckedIds(ids);
    setLog(msg);
  };

  return (
    <>
      <div className="demo-toolbar">
        <button
          type="button"
          onClick={() =>
            sync(collectIds(controlledData), "全选：checkedIds = 全部节点")
          }
        >
          全选
        </button>
        <button type="button" onClick={() => sync([], "清空：checkedIds = []")}>
          清空
        </button>
      </div>
      <YTree
        ref={treeRef}
        datasource={controlledData}
        checkable
        checkedIds={checkedIds}
        height={140}
        onCheckedChange={(e) => {
          // 受控模式：从服务读取联动后的完整勾选集合
          const ids = treeRef.current?.getCheckedList()?.map((n) => n.id) ?? [];
          sync(
            ids,
            `onCheckedChange: id=${e.id}｜checkedIds 已同步为 ${ids.length} 项`,
          );
        }}
      />
      <p className="demo-tip">{log}</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. 选中节点                                                         */
/* ------------------------------------------------------------------ */

const selectCode = `import { useState } from "react";
import YTree from "y-tree-react";

export default function App() {
  // 选中状态完全受控，组件不自行管理
  const [selectedIds, setSelectedIds] = useState([]);

  return (
    <YTree
      datasource={data}
      selectedIds={selectedIds}
      onClick={(e) => {
        // 按住 Ctrl / Cmd 支持多选
        const multi = e.event.ctrlKey || e.event.metaKey;
        setSelectedIds((prev) => {
          if (!multi) return [e.id];
          return prev.includes(e.id)
            ? prev.filter((id) => id !== e.id)
            : [...prev, e.id];
        });
      }}
    />
  );
}`;

function SelectDemo() {
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [log, setLog] = useState("（点击节点标题选中，Ctrl/Cmd + 点击多选）");

  return (
    <>
      <YTree
        datasource={basicData}
        expandAll
        selectedIds={selectedIds}
        height={140}
        onClick={(e) => {
          const multi = e.event.ctrlKey || e.event.metaKey;
          setSelectedIds((prev) => {
            const next = multi
              ? prev.includes(e.id)
                ? prev.filter((id) => id !== e.id)
                : [...prev, e.id]
              : [e.id];
            setLog(`selectedIds = [${next.join(", ")}]`);
            return next;
          });
        }}
      />
      <p className="demo-tip">{log}</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. 禁用节点                                                         */
/* ------------------------------------------------------------------ */

const disabledCode = `import YTree from "y-tree-react";

// 节点数据上标记 disabled 即可禁用：不可点击、不可勾选、不可拖拽
const data = [
  { id: "1", name: "节点 1", children: [
    { id: "1-1", name: "节点 1-1", children: [] },
    { id: "1-2", name: "节点 1-2（disabled）", disabled: true, children: [] },
  ]},
  { id: "2", name: "节点 2（disabled）", disabled: true, children: [] },
];

export default () => <YTree datasource={data} checkable expandAll />;`;

function DisabledDemo() {
  return <YTree datasource={disabledData} checkable expandAll height={140} />;
}

/* ------------------------------------------------------------------ */
/* 6. 不可勾选                                                         */
/* ------------------------------------------------------------------ */

const nocheckCode = `import YTree from "y-tree-react";

// nocheck 的节点不显示勾选框，但仍参与父节点状态联动
const data = [
  { id: "1", name: "节点 1", children: [
    { id: "1-1", name: "节点 1-1", children: [] },
    { id: "1-2", name: "节点 1-2", children: [] },
  ]},
  { id: "2", name: "节点 2（nocheck）", nocheck: true, children: [] },
];

export default () => <YTree datasource={data} checkable expandAll />;`;

function NocheckDemo() {
  return <YTree datasource={nocheckData} checkable expandAll height={140} />;
}

/* ------------------------------------------------------------------ */
/* 7. 隐藏节点                                                         */
/* ------------------------------------------------------------------ */

const hideCode = `import YTree from "y-tree-react";

// hide 的节点及其子树不渲染，但数据仍在服务中
const data = [
  { id: "1", name: "节点 1", children: [
    { id: "1-1", name: "节点 1-1", children: [] },
    { id: "1-2", name: "节点 1-2（hide）", hide: true, children: [] },
  ]},
  { id: "2", name: "节点 2（hide）", hide: true, children: [] },
];

export default () => <YTree datasource={data} expandAll />;`;

function HideDemo() {
  return <YTree datasource={hideData} expandAll height={84} />;
}

/* ------------------------------------------------------------------ */

export const stateDemos: Array<DemoMeta> = [
  {
    id: "checkable",
    title: "勾选框",
    desc: "checkable 显示勾选框，默认父子联动：勾选父节点会同步全部子节点，子节点部分勾选时父节点为半选状态。",
    code: checkableCode,
    render: () => <CheckableDemo />,
  },
  {
    id: "check-strictly",
    title: "勾选严格模式",
    desc: "checkStrictly 关闭父子联动，每个节点的勾选状态相互独立。",
    code: strictCode,
    render: () => <CheckStrictlyDemo />,
  },
  {
    id: "controlled",
    title: "受控勾选",
    desc: "checkedIds 受控勾选集合，配合 onCheckedChange 自行同步，可实现全选 / 清空等批量操作。空数组表示「未受控」，会回退到数据源内联的 checked 状态。",
    code: controlledCode,
    render: () => <ControlledDemo />,
  },
  {
    id: "select",
    title: "选中节点",
    desc: "selectedIds 控制节点文本区的选中高亮，组件不自行管理选中状态，需在 onClick 中同步（支持 Ctrl/Cmd 多选）。",
    code: selectCode,
    render: () => <SelectDemo />,
  },
  {
    id: "disabled",
    title: "禁用节点",
    desc: "数据上标记 disabled 的节点不可点击、不可勾选、不可拖拽，呈置灰样式。",
    code: disabledCode,
    render: () => <DisabledDemo />,
  },
  {
    id: "nocheck",
    title: "不可勾选",
    desc: "nocheck 的节点不显示勾选框，避免用户直接操作该节点，但仍参与父节点的联动计算。",
    code: nocheckCode,
    render: () => <NocheckDemo />,
  },
  {
    id: "hide",
    title: "隐藏节点",
    desc: "数据上标记 hide 的节点及其子树不会渲染，但节点数据仍保留在树内部。",
    code: hideCode,
    render: () => <HideDemo />,
  },
];
