import { useState } from "react";
import YTree from "../../components/y-tree";
import type { DemoMeta } from "../types";
import { basicData } from "../data";

/* ------------------------------------------------------------------ */
/* 1. 搜索过滤                                                         */
/* ------------------------------------------------------------------ */

const searchCode = `import { useState } from "react";
import YTree from "y-tree-react";

export default function App() {
  const [keyword, setKeyword] = useState("");

  return (
    <>
      <input
        value={keyword}
        placeholder="输入关键字"
        onChange={(e) => setKeyword(e.target.value)}
      />
      {/* searchValue 按节点名称过滤：不匹配的节点及其子树都不渲染 */}
      <YTree datasource={data} expandAll searchValue={keyword} />
    </>
  );
}`;

function SearchDemo() {
  const [keyword, setKeyword] = useState("");
  return (
    <>
      <div className="demo-toolbar">
        <input
          className="demo-input"
          value={keyword}
          placeholder="输入关键字，如 节点 1-2"
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button type="button" onClick={() => setKeyword("")}>
          清空
        </button>
      </div>
      <YTree
        datasource={basicData}
        expandAll
        searchValue={keyword}
        height={140}
      />
      <p className="demo-tip">
        {keyword
          ? `searchValue = "${keyword}"，仅渲染名称包含该关键字的节点`
          : "searchValue 为空，渲染全部节点"}
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. 节点事件                                                         */
/* ------------------------------------------------------------------ */

const eventsCode = `import YTree from "y-tree-react";

<YTree
  datasource={data}
  checkable
  expandAll
  onClick={(e) => console.log("click", e.id)}
  onDbClick={(e) => console.log("dbClick", e.id)}
  onContextMenu={(e) => console.log("contextMenu", e.id)}
  onExpandChange={(e) => console.log("expandChange", e.id, e.expand)}
  onCheckedChange={(e) => console.log("checkedChange", e.id, e.checked)}
/>;`;

function EventsDemo() {
  const [log, setLog] = useState(
    "（点击 / 双击 / 右键节点，或操作展开与勾选）",
  );
  const append = (msg: string) =>
    setLog((prev) => msg + "\n" + prev.slice(0, 300));

  return (
    <>
      <YTree
        datasource={basicData}
        checkable
        expandAll
        height={140}
        onClick={(e) => append(`onClick id=${e.id}`)}
        onDbClick={(e) => append(`onDbClick id=${e.id}`)}
        onContextMenu={(e) => append(`onContextMenu id=${e.id}`)}
        onExpandChange={(e) =>
          append(`onExpandChange id=${e.id} expand=${e.expand}`)
        }
        onCheckedChange={(e) =>
          append(`onCheckedChange id=${e.id} checked=${e.checked}`)
        }
      />
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */

export const interactionDemos: Array<DemoMeta> = [
  {
    id: "search",
    title: "搜索过滤",
    desc: "searchValue 按节点名称做关键字过滤，名称不匹配的节点及其子树都不会渲染。",
    code: searchCode,
    render: () => <SearchDemo />,
  },
  {
    id: "events",
    title: "节点事件",
    desc: "onClick / onDbClick / onContextMenu / onExpandChange / onCheckedChange，所有事件都携带节点 id 与原生事件对象。",
    code: eventsCode,
    render: () => <EventsDemo />,
  },
];
