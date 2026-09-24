import { useRef, useState } from "react";
import YTree, { type YTreeRef } from "../../components/y-tree";
import type { DemoMeta } from "../types";
import type {
  YTreeModel,
  YTreeNode,
  YTreeAsyncEvent,
  YTreeAsyncSuccessEvent,
  YTreeAsyncErrorEvent,
} from "../../../../common/model";

/** 模拟后端接口：延迟返回子节点数据 */
function mockFetch(parentId: string | number): Promise<Array<YTreeNode>> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const prefix = String(parentId);
      const children = Array.from({ length: 3 }, (_, i) => ({
        id: `${prefix}-${i + 1}`,
        name: `子节点 ${prefix}-${i + 1}`,
        // 前两层再挂一批懒加载父节点，用于演示逐级加载
        isParent: prefix.split("-").length < 2,
        children: [],
      }));
      resolve(children);
    }, 600);
  });
}

/* ------------------------------------------------------------------ */
/* 1. 懒加载（lazy + loadData）                                        */
/* ------------------------------------------------------------------ */

const lazyCode = `import YTree from "y-tree-react";

// lazy：子节点在首次展开时才异步获取
// 数据上用 isParent: true 标记「有子节点但尚未加载」，组件据此渲染展开箭头
const data = [
  { id: "1", name: "节点 1", isParent: true, children: [] },
  { id: "2", name: "节点 2", isParent: true, children: [] },
];

const loadData = async (node) => {
  const res = await fetch(\`/api/children?parentId=\${node.id}\`);
  return res.json(); // 返回子节点数组即可
};

export default () => <YTree datasource={data} lazy loadData={loadData} showLine />;`;

const lazyData: Array<YTreeNode> = [
  { id: "1", name: "节点 1（展开触发加载）", isParent: true, children: [] },
  { id: "2", name: "节点 2（展开触发加载）", isParent: true, children: [] },
  { id: "3", name: "节点 3（叶子，无箭头）", children: [] },
];

function LazyDemo() {
  const [log, setLog] = useState("（点击展开箭头，观察懒加载过程）");

  return (
    <>
      <YTree
        datasource={lazyData}
        lazy
        loadData={(node) => mockFetch(node.id)}
        showLine
        height={260}
        beforeAsync={(e: YTreeAsyncEvent) => {
          setLog(`beforeAsync: id=${e.id}（from=${e.from}）→ 允许加载`);
          return true;
        }}
        onAsyncSuccess={(e: YTreeAsyncSuccessEvent) => {
          setLog(
            `onAsyncSuccess: id=${e.id}，加载到 ${e.children.length} 个子节点`,
          );
        }}
      />
      <p className="demo-tip">
        `isParent: true` 标记有子节点但尚未加载，首次展开时调用 `loadData`
        拉取数据；加载完成后自动展开。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. 加载中状态（isAjaxing + loading 图标）                            */
/* ------------------------------------------------------------------ */

const loadingCode = `import YTree from "y-tree-react";

// 加载期间节点的展开箭头会替换为旋转的 loading 图标
// 组件内部通过 node.isAjaxing 标记，样式类为 .y-tree-switcher-icon.is-ajaxing
<YTree
  datasource={data}
  lazy
  // 故意放慢接口，便于观察 loading 图标
  loadData={async (node) => {
    await new Promise((r) => setTimeout(r, 2000));
    return fetchChildren(node.id);
  }}
  showLine
/>;`;

const slowFetch = (parentId: string | number): Promise<Array<YTreeNode>> =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(
        Array.from({ length: 3 }, (_, i) => ({
          id: `${parentId}-${i + 1}`,
          name: `${parentId}-${i + 1}`,
          children: [],
        })),
      );
    }, 2000);
  });

const loadingData: Array<YTreeNode> = [
  { id: "A", name: "节点 A（加载需 2 秒）", isParent: true, children: [] },
];

function LoadingDemo() {
  const [log, setLog] = useState("（点击展开箭头，观察 loading 图标）");

  return (
    <>
      <YTree
        datasource={loadingData}
        lazy
        loadData={(node) => slowFetch(node.id)}
        showLine
        height={200}
        onAsyncSuccess={(e: YTreeAsyncSuccessEvent) =>
          setLog(`onAsyncSuccess: id=${e.id}，加载完成`)
        }
      />
      <p className="demo-tip">
        加载期间箭头变为旋转 loading 图标，该状态下重复点击不会重复发起请求。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 3. 异步回调（beforeAsync / onAsyncSuccess / onAsyncError）           */
/* ------------------------------------------------------------------ */

const callbackCode = `import YTree from "y-tree-react";

<YTree
  datasource={data}
  lazy
  loadData={loadData}
  // 返回 false 可取消本次加载（权限控制场景）
  beforeAsync={(e) => {
    console.log("即将加载", e.id, e.from);
    return true;
  }}
  onAsyncSuccess={(e) => {
    console.log("加载成功", e.id, e.children.length);
  }}
  onAsyncError={(e) => {
    console.error("加载失败", e.id, e.error);
  }}
/>;`;

/** 按节点 id 决定成功或失败，用于演示错误回调 */
function flakyFetch(
  parentId: string | number,
  fail: boolean,
): Promise<Array<YTreeNode>> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (fail) {
        reject(new Error(`加载「${parentId}」子节点失败：网络超时`));
        return;
      }
      resolve(
        Array.from({ length: 2 }, (_, i) => ({
          id: `${parentId}-${i + 1}`,
          name: `${parentId}-${i + 1}`,
          children: [],
        })),
      );
    }, 700);
  });
}

const callbackData: Array<YTreeNode> = [
  { id: "OK", name: "节点 OK（会加载成功）", isParent: true, children: [] },
  { id: "ERR", name: "节点 ERR（会加载失败）", isParent: true, children: [] },
];

function CallbackDemo() {
  const [log, setLog] = useState("（展开 OK / ERR 节点，对比成功与失败日志）");
  const append = (msg: string) =>
    setLog((prev) => msg + "\n" + prev.slice(0, 400));

  return (
    <>
      <YTree
        datasource={callbackData}
        lazy
        loadData={(node) => flakyFetch(node.id, String(node.id) === "ERR")}
        showLine
        height={220}
        beforeAsync={(e: YTreeAsyncEvent) => {
          append(`beforeAsync id=${e.id} from=${e.from}`);
          return true;
        }}
        onAsyncSuccess={(e: YTreeAsyncSuccessEvent) =>
          append(`onAsyncSuccess id=${e.id} children=${e.children.length}`)
        }
        onAsyncError={(e: YTreeAsyncErrorEvent) =>
          append(`onAsyncError id=${e.id} error=${(e.error as Error).message}`)
        }
      />
      <p className="demo-tip">
        `beforeAsync` 返回 false 可取消加载；失败时节点不展开，箭头复位可重试。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. 刷新子节点（reAsyncChildNodes）                                   */
/* ------------------------------------------------------------------ */

const refreshCode = `import { useRef } from "react";
import YTree, { type YTreeRef } from "y-tree-react";

export default function App() {
  const treeRef = useRef<YTreeRef>(null);

  return (
    <>
      <YTree ref={treeRef} datasource={data} lazy loadData={loadData} />

      <button
        onClick={async () => {
          // 重新拉取指定节点的子节点，替换原有子树
          const ok = await treeRef.current?.reAsyncChildNodes("1");
          console.log("重新加载完成", ok);
        }}
      >
        刷新「节点 1」的子节点
      </button>
    </>
  );
}`;

const refreshData: Array<YTreeNode> = [
  { id: "1", name: "节点 1", isParent: true, children: [] },
  { id: "2", name: "节点 2", isParent: true, children: [] },
];

function RefreshDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [log, setLog] = useState("（先展开节点 1，再点击刷新按钮）");
  const [round, setRound] = useState(0);

  return (
    <>
      <YTree
        ref={treeRef}
        datasource={refreshData}
        lazy
        loadData={(node: YTreeModel) =>
          new Promise<Array<YTreeNode>>((resolve) => {
            window.setTimeout(() => {
              resolve(
                Array.from({ length: 3 }, (_, i) => ({
                  id: `${node.id}-${round}-${i + 1}`,
                  name: `第 ${round + 1} 批 · 子节点 ${i + 1}`,
                  children: [],
                })),
              );
            }, 500);
          })
        }
        showLine
        height={240}
      />
      <div className="demo-toolbar" style={{ marginTop: 10, marginBottom: 0 }}>
        <button type="button" onClick={() => setRound((r) => r + 1)}>
          换一批数据（第 {round + 1} 批）
        </button>
        <button
          type="button"
          onClick={async () => {
            const ok = await treeRef.current?.reAsyncChildNodes("1");
            setLog(`reAsyncChildNodes("1") => ${ok}`);
          }}
        >
          刷新「节点 1」的子节点
        </button>
      </div>
      <p className="demo-tip">
        先展开节点
        1，再点「换一批数据」改变数据源，最后点刷新即可看到子树被整体替换。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. 根节点异步（datasource 为空）                                     */
/* ------------------------------------------------------------------ */

const rootCode = `import YTree from "y-tree-react";

// datasource 为空 + lazy：组件会自动调用 loadData 加载根节点数据，
// 此时 loadData 收到的是 id 为 "__yt_root__" 的虚拟根节点
<YTree
  datasource={[]}
  lazy
  loadData={async (node) => {
    console.log("加载根节点，虚拟根 id =", node.id);
    const res = await fetch("/api/roots");
    return res.json();
  }}
/>;`;

function RootAsyncDemo() {
  const [log, setLog] = useState(
    "（初始 datasource 为空，自动异步加载根节点）",
  );

  return (
    <>
      <YTree
        datasource={[]}
        lazy
        loadData={(node: YTreeModel) =>
          new Promise<Array<YTreeNode>>((resolve) => {
            setLog(
              `loadData 收到虚拟根节点：id="${node.id}", name="${node.name}", isRoot=${node.isRoot}`,
            );
            window.setTimeout(() => {
              resolve([
                { id: "r1", name: "根节点 1", isParent: true, children: [] },
                { id: "r2", name: "根节点 2", children: [] },
              ]);
            }, 700);
          })
        }
        showLine
        height={200}
        onAsyncSuccess={(e: YTreeAsyncSuccessEvent) =>
          setLog(
            (prev) => `${prev}\n加载完成，得到 ${e.children.length} 个根节点`,
          )
        }
      />
      <p className="demo-tip">
        datasource 为空时组件自动加载根节点，`loadData` 收到 id 为 `__yt_root__`
        的虚拟根节点；加载到的数组即为树的根节点集合。
      </p>
      <pre className="demo-log">{log}</pre>
    </>
  );
}

/* ------------------------------------------------------------------ */

export const asyncDemos: Array<DemoMeta> = [
  {
    id: "lazy-load",
    title: "懒加载",
    desc: "lazy 开启懒加载，数据上用 isParent: true 标记「有子节点但未加载」，首次展开时调用 loadData 异步获取子节点，加载完成后自动展开。",
    code: lazyCode,
    render: () => <LazyDemo />,
  },
  {
    id: "async-loading",
    title: "加载中状态",
    desc: "加载期间节点的展开箭头替换为旋转的 loading 图标（node.isAjaxing），且同一节点不会重复发起请求。",
    code: loadingCode,
    render: () => <LoadingDemo />,
  },
  {
    id: "async-callbacks",
    title: "异步回调",
    desc: "beforeAsync 返回 false 可取消本次加载；onAsyncSuccess / onAsyncError 分别处理成功与失败，失败时节点保持收起可重试。",
    code: callbackCode,
    render: () => <CallbackDemo />,
  },
  {
    id: "async-refresh",
    title: "刷新子节点",
    desc: "通过 ref 的 reAsyncChildNodes(id) 重新加载指定节点的子节点，返回 Promise<boolean>，原有子树会被整体替换。",
    code: refreshCode,
    render: () => <RefreshDemo />,
  },
  {
    id: "async-root",
    title: "根节点异步",
    desc: "datasource 为空时组件自动异步加载根节点，loadData 收到 id 为 __yt_root__ 的虚拟根节点，返回的数组即为根节点集合。",
    code: rootCode,
    render: () => <RootAsyncDemo />,
  },
];
