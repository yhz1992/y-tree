import type { DemoMeta } from "../types";
import {
  eventRows,
  methodRows,
  nodeInputRows,
  nodeModelRows,
  propsRows,
  type ApiDocRow,
} from "../api-docs";

function ApiTable({
  columns,
  rows,
}: {
  columns: Array<{ key: keyof ApiDocRow; label: string }>;
  rows: Array<ApiDocRow>;
}) {
  return (
    <div className="demo-api-wrap">
      <table className="demo-api-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.key === "name" || col.key === "type" ? (
                    <code>{row[col.key] || "—"}</code>
                  ) : (
                    row[col.key] || "—"
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const propCols = [
  { key: "name" as const, label: "名称" },
  { key: "type" as const, label: "类型" },
  { key: "defaultValue" as const, label: "默认" },
  { key: "desc" as const, label: "说明" },
];

const simpleCols = [
  { key: "name" as const, label: "名称" },
  { key: "type" as const, label: "类型" },
  { key: "desc" as const, label: "说明" },
];

export const docsDemos: Array<DemoMeta> = [
  {
    id: "api-props",
    title: "Props",
    desc: "组件入参。before* 拦截回调也列在这里；空数组受控集合表示「未受控」，会回退数据源内联状态。",
    code: `import YTree from "y-tree-react";

<YTree
  datasource={data}
  checkable
  showLine
  expandAll
  height={196}
/>`,
    render: () => <ApiTable columns={propCols} rows={propsRows} />,
  },
  {
    id: "api-events",
    title: "Events",
    desc: "React 用 onXxx 回调。通用 payload 含 event、id；拖拽/编辑/异步事件另有扩展字段。",
    code: `<YTree
  datasource={data}
  onClick={(e) => console.log(e.id)}
  onCheckedChange={(e) => console.log(e.checked)}
  onExpandChange={(e) => console.log(e.expand)}
/>`,
    render: () => <ApiTable columns={simpleCols} rows={eventRows} />,
  },
  {
    id: "api-methods",
    title: "Methods",
    desc: "通过 ref 调用。checkNode / moveNode / copyNode 等不走 before*；expandNode 走 beforeExpand / beforeCollapse。",
    code: `const treeRef = useRef<YTreeRef>(null);

treeRef.current?.checkNode("1-1", true);
treeRef.current?.getCheckedList();
treeRef.current?.expandNode("1", true);`,
    render: () => <ApiTable columns={simpleCols} rows={methodRows} />,
  },
  {
    id: "api-node-model",
    title: "NodeModel",
    desc: "入参是 YTreeNode（嵌套 children）或 YTreeFlatNode（pId）。getNodeById 等返回运行时 YTreeModel。",
    code: `/** 入参（嵌套） */
{ id: "1", name: "节点 1", children: [{ id: "1-1", name: "节点 1-1", children: [] }] }

/** 入参（扁平） */
{ id: "1-1", name: "节点 1-1", pId: "1" }

/** 运行时 YTreeModel 另含 childIds / level / halfChecked 等 */`,
    render: () => (
      <>
        <p className="demo-col-label">入参字段（YTreeNode / YTreeFlatNode）</p>
        <ApiTable columns={simpleCols} rows={nodeInputRows} />
        <p className="demo-col-label" style={{ marginTop: 16 }}>
          运行时字段（YTreeModel，方法返回值）
        </p>
        <ApiTable columns={simpleCols} rows={nodeModelRows} />
      </>
    ),
  },
];
