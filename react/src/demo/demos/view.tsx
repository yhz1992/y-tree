import { useRef, useState } from "react";
import YTree, { type YTreeRef } from "../../components/y-tree";
import type { DemoMeta } from "../types";
import type { YTreeNode } from "../../../../common/model";

const iconData: Array<YTreeNode> = [
  {
    id: "1",
    name: "项目文档",
    expanded: true,
    iconSkin: "p5",
    children: [
      {
        id: "1-1",
        name: "README.md",
        icon: "fa-brands fa-markdown",
        children: [],
      },
      {
        id: "1-2",
        name: "设计稿.png",
        icon: "fa-regular fa-image",
        children: [],
      },
    ],
  },
  {
    id: "2",
    name: "源码",
    iconOpen: "fa-solid fa-folder-open",
    iconClose: "fa-solid fa-folder",
    expanded: true,
    children: [
      { id: "2-1", name: "index.ts", icon: "fa-solid fa-code", children: [] },
      { id: "2-2", name: "utils.ts", icon: "fa-solid fa-code", children: [] },
    ],
  },
];

const fontData: Array<YTreeNode> = [
  {
    id: "1",
    name: "普通节点",
    expanded: true,
    children: [
      { id: "1-1", name: "高亮节点", children: [] },
      { id: "1-2", name: "警告节点", children: [] },
    ],
  },
  { id: "2", name: "叶子", children: [] },
];

const titleData: Array<YTreeNode> = [
  {
    id: "1",
    name: "部门 A",
    title: "总部 · 研发中心",
    expanded: true,
    children: [
      { id: "1-1", name: "A-1", title: "前端组", children: [] },
      { id: "1-2", name: "A-2", children: [] },
    ],
  },
  { id: "2", name: "部门 B", children: [] },
];

const basicData: Array<YTreeNode> = [
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

function namesOfSelected(ref: React.RefObject<YTreeRef | null>): string {
  const list = ref.current?.getSelectedNodes() ?? [];
  return list.map((n) => n.name).join("、") || "（无）";
}

/* ------------------------------------------------------------------ */
/* 1. 自定义图标                                                       */
/* ------------------------------------------------------------------ */

const iconCode = `const data = [
  {
    id: "1",
    name: "项目文档",
    iconSkin: "p5",
    children: [
      { id: "1-1", name: "README.md", icon: "fa-brands fa-markdown", children: [] },
    ],
  },
  {
    id: "2",
    name: "源码",
    iconOpen: "fa-solid fa-folder-open",
    iconClose: "fa-solid fa-folder",
    children: [],
  },
];

<YTree datasource={data} showIcon />;`;

function IconDemo() {
  const [showIcon, setShowIcon] = useState(true);
  return (
    <>
      <div className="demo-toolbar" style={{ marginBottom: 8 }}>
        <button type="button" onClick={() => setShowIcon((v) => !v)}>
          showIcon={String(showIcon)}
        </button>
      </div>
      <YTree datasource={iconData} showIcon={showIcon} height={168} />
      <p className="demo-tip">
        `icon` 指定 class / 图片 URL；父节点可用 `iconOpen` /
        `iconClose`；`iconSkin` 渲染为 `y-tree-icon-skin-${"{skin}"}
        `。`showIcon={"{false}"}` 关闭图标。
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. 自定义字体                                                       */
/* ------------------------------------------------------------------ */

const fontCode = `<YTree
  datasource={data}
  fontCss={(node) => {
    if (node.id === "1-1") return { color: "#1677ff", fontWeight: "700" };
    if (node.id === "1-2") return { color: "#fa541c" };
    return {};
  }}
/>;`;

function FontDemo() {
  return (
    <>
      <YTree
        datasource={fontData}
        height={140}
        fontCss={(node): Record<string, string> => {
          if (node.id === "1-1") return { color: "#1677ff", fontWeight: "700" };
          if (node.id === "1-2") return { color: "#fa541c" };
          return {};
        }}
      />
      <p className="demo-tip">
        `fontCss` 按节点返回样式，可用于搜索命中高亮、标记异常节点。
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3. title 提示                                                       */
/* ------------------------------------------------------------------ */

const titleCode = `const data = [
  { id: "1", name: "部门 A", title: "总部 · 研发中心", children: [] },
];

<YTree datasource={data} showTitle />;`;

function TitleDemo() {
  return (
    <>
      <YTree datasource={titleData} height={140} />
      <p className="demo-tip">
        鼠标悬停标题显示 `title`；未设置时回退为 `name`。`showTitle={"{false}"}`
        关闭提示。
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. 双击展开                                                         */
/* ------------------------------------------------------------------ */

const dblClickCode = `// 默认 true：双击标题展开/折叠
<YTree datasource={data} dblClickExpand />

// false：双击只触发 onDbClick，不改变展开状态
<YTree datasource={data} dblClickExpand={false} />`;

function DblClickDemo() {
  const [enabled, setEnabled] = useState(true);
  const [log, setLog] = useState("（双击标题观察是否展开）");
  return (
    <>
      <div className="demo-toolbar" style={{ marginBottom: 8 }}>
        <button type="button" onClick={() => setEnabled((v) => !v)}>
          dblClickExpand={String(enabled)}
        </button>
      </div>
      <YTree
        key={String(enabled)}
        datasource={basicData}
        dblClickExpand={enabled}
        height={140}
        onDbClick={(e) => setLog(`dbClick ${e.id}`)}
        onExpandChange={(e) => setLog(`expandChange ${e.id} => ${e.expand}`)}
      />
      <p className="demo-tip">
        `dblClickExpand` 默认 true。开启编辑时双击优先进入重命名，不会折叠。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. 展开动画                                                         */
/* ------------------------------------------------------------------ */

const expandSpeedCode = `<YTree datasource={data} expandSpeed="fast" />  // 200ms
<YTree datasource={data} expandSpeed="slow" />  // 400ms
<YTree datasource={data} expandSpeed={0} />     // 关闭（默认）`;

function ExpandSpeedDemo() {
  const [speed, setSpeed] = useState<"fast" | "slow" | 0>("fast");
  return (
    <>
      <div className="demo-toolbar" style={{ marginBottom: 8 }}>
        <button type="button" onClick={() => setSpeed("fast")}>
          fast{speed === "fast" ? " ✓" : ""}
        </button>
        <button type="button" onClick={() => setSpeed("slow")}>
          slow{speed === "slow" ? " ✓" : ""}
        </button>
        <button type="button" onClick={() => setSpeed(0)}>
          关闭{speed === 0 ? " ✓" : ""}
        </button>
      </div>
      <YTree
        key={String(speed)}
        datasource={basicData}
        expandSpeed={speed}
        height={140}
      />
      <p className="demo-tip">
        `expandSpeed` 控制展开/折叠过渡；默认关闭，避免大数据虚拟滚动抖动。
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 6. 多选文本选中                                                     */
/* ------------------------------------------------------------------ */

const selectedMultiCode = `// 默认 true：点击替换选中，Ctrl/Cmd 追加
<YTree datasource={data} selectedMulti />

// false：始终单选，Ctrl 也不追加
<YTree datasource={data} selectedMulti={false} />`;

function SelectedMultiDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [multi, setMulti] = useState(true);
  const [log, setLog] = useState("（点击节点选中，Ctrl/Cmd 追加）");
  return (
    <>
      <div className="demo-toolbar" style={{ marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => {
            setMulti((v) => !v);
            treeRef.current?.cancelSelectedNode();
            setLog("已清空选中");
          }}
        >
          selectedMulti={String(multi)}
        </button>
        <button
          type="button"
          onClick={() => {
            treeRef.current?.selectNode("1-1", true);
            setLog(
              `selectNode("1-1", true)｜当前：${namesOfSelected(treeRef)}`,
            );
          }}
        >
          追加选中 1-1
        </button>
        <button
          type="button"
          onClick={() => {
            treeRef.current?.cancelSelectedNode();
            setLog("cancelSelectedNode()");
          }}
        >
          清空选中
        </button>
      </div>
      <YTree
        ref={treeRef}
        datasource={basicData}
        selectedMulti={multi}
        height={140}
        onClick={() => setLog(`当前：${namesOfSelected(treeRef)}`)}
      />
      <p className="demo-tip">
        点击节点高亮选中；`selectedMulti={"{true}"}` 时 Ctrl/Cmd
        追加。组件内部维护选中，不再需要外部同步 `selectedIds`。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */

export const viewDemos: Array<DemoMeta> = [
  {
    id: "node-icon",
    title: "自定义图标",
    desc: "icon / iconOpen / iconClose / iconSkin 自定义节点图标；showIcon 控制显隐。未指定时父节点显示文件夹、叶子显示文档。",
    code: iconCode,
    render: () => <IconDemo />,
  },
  {
    id: "font-css",
    title: "自定义字体",
    desc: "fontCss 按节点返回标题样式，用于高亮、标记。",
    code: fontCode,
    render: () => <FontDemo />,
  },
  {
    id: "node-title",
    title: "title 提示",
    desc: "节点 title 透传到标题悬停提示，缺省回退为 name；showTitle=false 关闭。",
    code: titleCode,
    render: () => <TitleDemo />,
  },
  {
    id: "dblclick-expand",
    title: "双击展开",
    desc: "dblClickExpand 控制双击标题是否展开/折叠，默认 true。开启编辑时双击优先进入重命名。",
    code: dblClickCode,
    render: () => <DblClickDemo />,
  },
  {
    id: "expand-speed",
    title: "展开动画",
    desc: "expandSpeed 控制展开/折叠过渡：fast=200ms、slow=400ms、0 关闭（默认）。",
    code: expandSpeedCode,
    render: () => <ExpandSpeedDemo />,
  },
  {
    id: "selected-multi",
    title: "多选文本选中",
    desc: "selectedMulti 控制 Ctrl/Cmd 是否追加选中；组件内部维护选中高亮，ref 暴露 selectNode / cancelSelectedNode / getSelectedNodes。",
    code: selectedMultiCode,
    render: () => <SelectedMultiDemo />,
  },
];
