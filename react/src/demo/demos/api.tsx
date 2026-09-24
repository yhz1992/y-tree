import { useRef, useState } from "react";
import YTree, { type YTreeRef } from "../../components/y-tree";
import type { DemoMeta } from "../types";
import { basicData } from "../data";
import type { YTreeFlatNode, YTreeNode } from "../../../../common/model";

const names = (list: Array<{ name: string }>) =>
  list.map((n) => n.name).join("、") || "（无）";

const queryCode = `const roots = treeRef.current?.getNodes() ?? [];
const hits = treeRef.current?.getNodesByParam("name", "节点 1-1") ?? [];
const fuzzy = treeRef.current?.getNodesByParamFuzzy("name", "1-") ?? [];
const idx = treeRef.current?.getNodeIndex("1-2") ?? -1;`;

function QueryDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [log, setLog] = useState("（点按钮查询当前树）");
  return (
    <>
      <YTree ref={treeRef} datasource={basicData} height={140} />
      <div className="demo-toolbar" style={{ marginTop: 10, marginBottom: 0 }}>
        <button
          type="button"
          onClick={() =>
            setLog(
              `getNodes()｜根：${names(treeRef.current?.getNodes() ?? [])}`,
            )
          }
        >
          getNodes
        </button>
        <button
          type="button"
          onClick={() =>
            setLog(
              `getNodesByParam("name","节点 1-1")｜${names(
                treeRef.current?.getNodesByParam("name", "节点 1-1") ?? [],
              )}`,
            )
          }
        >
          精确匹配 1-1
        </button>
        <button
          type="button"
          onClick={() =>
            setLog(
              `getNodesByParamFuzzy("name","1-")｜${names(
                treeRef.current?.getNodesByParamFuzzy("name", "1-") ?? [],
              )}`,
            )
          }
        >
          模糊匹配 1-
        </button>
        <button
          type="button"
          onClick={() =>
            setLog(
              `getNodeIndex("1-2") = ${treeRef.current?.getNodeIndex("1-2")}`,
            )
          }
        >
          兄弟下标 1-2
        </button>
      </div>
      <p className="demo-tip">
        `getNodes` 返回根节点；`getNodesByParam`
        精确匹配，`getNodesByParamFuzzy` 忽略大小写；`getNodeIndex`
        返回兄弟下标，找不到为 -1。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

const transformCode = `const flat = treeRef.current?.transformToArray() ?? [];
const nested = treeRef.current?.transformToTreeNodes() ?? [];
const rebuilt = treeRef.current?.transformToTreeNodesFromFlat(flatNodes) ?? [];`;

const sampleFlat: Array<YTreeFlatNode> = [
  { id: "a", name: "A", pId: "" },
  { id: "a-1", name: "A-1", pId: "a" },
  { id: "b", name: "B", pId: "" },
];

function TransformDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [log, setLog] = useState("（点按钮看扁平 / 嵌套结果）");
  return (
    <>
      <YTree ref={treeRef} datasource={basicData} height={140} />
      <div className="demo-toolbar" style={{ marginTop: 10, marginBottom: 0 }}>
        <button
          type="button"
          onClick={() => {
            const list = treeRef.current?.transformToArray() ?? [];
            setLog(`transformToArray()｜${list.map((n) => n.id).join(" → ")}`);
          }}
        >
          当前树 → 扁平
        </button>
        <button
          type="button"
          onClick={() => {
            const nested = treeRef.current?.transformToTreeNodes() ?? [];
            const summarize = (nodes: Array<YTreeNode>): string =>
              nodes
                .map(
                  (n) =>
                    `${n.name}[${(n.children ?? [])
                      .map((c) => c.name)
                      .join(",")}]`,
                )
                .join("；");
            setLog(`transformToTreeNodes()｜${summarize(nested)}`);
          }}
        >
          当前树 → 嵌套
        </button>
        <button
          type="button"
          onClick={() => {
            const nested =
              treeRef.current?.transformToTreeNodesFromFlat(sampleFlat) ?? [];
            setLog(
              `fromFlat([A,A-1,B])｜根 ${nested
                .map((n) => n.name)
                .join("、")}，A 子 ${
                nested[0]?.children?.map((c) => c.name).join("、") || "（无）"
              }`,
            );
          }}
        >
          扁数据 → 嵌套
        </button>
      </div>
      <p className="demo-tip">
        `transformToArray` DFS 扁平；`transformToTreeNodes` 还原嵌套；
        `transformToTreeNodesFromFlat` 不碰当前树，仅把 id/pId 列表转嵌套。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

const updateCode = `treeRef.current?.updateNode("1-1", { name: "已改名" });
treeRef.current?.updateNode("2", { hide: true });`;

function UpdateDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [log, setLog] = useState("（点按钮热更新展示字段）");
  return (
    <>
      <YTree ref={treeRef} datasource={basicData} checkable height={140} />
      <div className="demo-toolbar" style={{ marginTop: 10, marginBottom: 0 }}>
        <button
          type="button"
          onClick={() => {
            const ok = treeRef.current?.updateNode("1-1", {
              name: "节点 1-1（已改名）",
            });
            setLog(`updateNode("1-1", { name }) => ${ok}`);
          }}
        >
          改名 1-1
        </button>
        <button
          type="button"
          onClick={() => {
            const ok = treeRef.current?.updateNode("2", { hide: true });
            setLog(`updateNode("2", { hide: true }) => ${ok}（节点 2 隐藏）`);
          }}
        >
          隐藏节点 2
        </button>
        <button
          type="button"
          onClick={() => {
            const ok = treeRef.current?.updateNode("2", { hide: false });
            setLog(`updateNode("2", { hide: false }) => ${ok}`);
          }}
        >
          显示节点 2
        </button>
      </div>
      <p className="demo-tip">
        `updateNode` 只改 name/title/icon/disabled/hide 等展示字段；`id` / `pId`
        / `childIds` 会被忽略。`checked` / `selected` 走既有状态机。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

const expandCode = `treeRef.current?.expandNode("1", false);
treeRef.current?.expandNode("1", true, true); // sonSign 递归子孙
treeRef.current?.expandCollapseParentNode("1-1", true);`;

function ExpandNodeDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [log, setLog] = useState("（先折叠节点 1，再程序化展开）");
  return (
    <>
      <YTree ref={treeRef} datasource={basicData} height={140} />
      <div className="demo-toolbar" style={{ marginTop: 10, marginBottom: 0 }}>
        <button
          type="button"
          onClick={() => {
            const ok = treeRef.current?.expandNode("1", false);
            setLog(`expandNode("1", false) => ${ok}`);
          }}
        >
          折叠节点 1
        </button>
        <button
          type="button"
          onClick={() => {
            const ok = treeRef.current?.expandNode("1", true);
            setLog(`expandNode("1", true) => ${ok}`);
          }}
        >
          展开节点 1
        </button>
        <button
          type="button"
          onClick={() => {
            treeRef.current?.expandNode("1", false);
            const ok = treeRef.current?.expandCollapseParentNode("1-1", true);
            setLog(`expandCollapseParentNode("1-1", true) => ${ok}`);
          }}
        >
          展开 1-1 祖先
        </button>
      </div>
      <p className="demo-tip">
        `expandNode(id, expand?, sonSign?)`：`expand` 缺省切换；`sonSign`
        递归子孙。 `expandCollapseParentNode` 沿祖先链展开/收起，使目标可见。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

const beforeCode = `<YTree
  datasource={data}
  checkable
  beforeClick={(e) => e.id !== "2"}
  beforeCollapse={(e) => e.id !== "1"}
  beforeCheck={(e) => e.id !== "1-1"}
/>`;

function BeforeHooksDemo() {
  const [log, setLog] = useState("点节点 2 拦点击；折叠节点 1 拦；勾选 1-1 拦");
  return (
    <>
      <YTree
        datasource={basicData}
        checkable
        height={140}
        beforeClick={(e) => {
          if (e.id === "2") {
            setLog("beforeClick 拦截节点 2，不选中、不发 click");
            return false;
          }
          setLog(`click ${e.id}`);
          return true;
        }}
        beforeExpand={(e) => {
          setLog(`beforeExpand ${e.id}`);
          return true;
        }}
        beforeCollapse={(e) => {
          if (e.id === "1") {
            setLog("beforeCollapse 拦截节点 1，保持展开");
            return false;
          }
          setLog(`beforeCollapse ${e.id}`);
          return true;
        }}
        beforeCheck={(e) => {
          if (e.id === "1-1") {
            setLog("beforeCheck 拦截节点 1-1，勾选框不变");
            return false;
          }
          setLog(`beforeCheck ${e.id} => ${e.checked}`);
          return true;
        }}
        onClick={(e) => setLog((prev) => `${prev}｜onClick ${e.id}`)}
      />
      <p className="demo-tip">
        `beforeClick` 返回 false 取消选中与 click；`beforeExpand` /
        `beforeCollapse` 拦箭头、双击展开、`expandNode`；`beforeCheck`
        只拦勾选框，程序化 `checkNode` 不走。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

export const apiDemos: Array<DemoMeta> = [
  {
    id: "query-nodes",
    title: "批量查询",
    desc: "getNodes / getNodesByParam / getNodesByParamFuzzy / getNodeIndex：根列表、精确/模糊属性查询、兄弟下标。",
    code: queryCode,
    render: () => <QueryDemo />,
  },
  {
    id: "transform",
    title: "结构转换",
    desc: "transformToArray / transformToTreeNodes 互转当前树；transformToTreeNodesFromFlat 把扁数据转嵌套，不碰当前树。",
    code: transformCode,
    render: () => <TransformDemo />,
  },
  {
    id: "update-node",
    title: "节点更新",
    desc: "updateNode 热更新展示字段并刷新视图；结构字段 id/pId/childIds 会被忽略。",
    code: updateCode,
    render: () => <UpdateDemo />,
  },
  {
    id: "expand-node",
    title: "精确展开",
    desc: "expandNode(id, expand?, sonSign?) 精确展开/折叠；expandCollapseParentNode 沿祖先链操作。",
    code: expandCode,
    render: () => <ExpandNodeDemo />,
  },
  {
    id: "before-hooks",
    title: "before* 拦截",
    desc: "beforeClick / beforeExpand / beforeCollapse / beforeCheck 返回 false 取消操作。点节点 2 拦点击、折叠节点 1 拦、勾选 1-1 拦。",
    code: beforeCode,
    render: () => <BeforeHooksDemo />,
  },
];
