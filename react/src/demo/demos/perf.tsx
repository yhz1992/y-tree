import { useRef, useState } from "react";
import YTree, { type YTreeRef } from "../../components/y-tree";
import type { DemoMeta } from "../types";
import { basicData, buildLargeData, collectIds } from "../data";
import type { YTreeNode } from "../../../../common/model";

const perfCode = `import { useRef, useState } from "react";
import YTree, { type YTreeRef } from "y-tree-react";

// 生成 6 层 7 叉共 137,256 个节点
function buildLargeData(depth = 6, perNode = 7) {
  let id = 0;
  const build = (level) => {
    const nodes = [];
    for (let i = 0; i < perNode; i++) {
      const node = { id: id++, name: \`节点 \${level}-\${i}\`, children: [] };
      if (level < depth) node.children = build(level + 1);
      nodes.push(node);
    }
    return nodes;
  };
  return build(1);
}

export default function App() {
  const treeRef = useRef<YTreeRef>(null);
  const [data] = useState(buildLargeData());

  return (
    <YTree
      ref={treeRef}
      datasource={data}
      // height 指定滚动容器高度，组件内部只渲染视口内的节点
      height={400}
      // 连接线 + 父子联动勾选，大数据量下同样可用
      showLine
      checkable
      expandAll
      onCheckedChange={(e) => {
        // 勾选联动是增量更新：只重算受影响的祖先链（O(depth)），
        // 不做全量重建，因此 13.7 万节点下勾选依然是毫秒级
        const list = treeRef.current?.getCheckedList() ?? [];
        console.log("联动后勾选节点数", list.length);
      }}
    />
  );
}`;

function LargeDataDemo() {
  const treeRef = useRef<YTreeRef>(null);
  const [data, setData] = useState<Array<YTreeNode>>(() => buildLargeData());
  const [log, setLog] = useState(
    "已加载 137,256 个节点（6 层 7 叉），全部展开",
  );
  const [checkLog, setCheckLog] = useState(
    "（勾选任意节点，观察父子联动范围与耗时）",
  );
  const [editLog, setEditLog] = useState(
    "（重命名 / 拖拽 / 按钮操作观察增量更新耗时）",
  );

  const loadLarge = () => {
    const start = performance.now();
    const large = buildLargeData();
    const buildCost = performance.now() - start;
    const total = collectIds(large).length;
    setData(large);
    setCheckLog("（勾选任意节点，观察父子联动范围与耗时）");
    requestAnimationFrame(() => {
      const renderCost = performance.now() - start;
      setLog(
        `已加载 ${total.toLocaleString()} 个节点（6 层 7 叉）｜构建数据 ${buildCost.toFixed(
          1,
        )}ms，含首次渲染共 ${renderCost.toFixed(1)}ms`,
      );
    });
  };

  return (
    <>
      <div className="demo-toolbar">
        <button type="button" onClick={loadLarge}>
          生成 13.7 万节点
        </button>
        <button
          type="button"
          onClick={() => {
            setData(basicData);
            setLog("已恢复为 6 个节点的小数据");
            setCheckLog("（勾选任意节点，观察父子联动范围与耗时）");
            setEditLog("（重命名 / 拖拽 / 按钮操作观察增量更新耗时）");
          }}
        >
          恢复小数据
        </button>
        <button
          type="button"
          onClick={() => {
            const tree = treeRef.current;
            const roots = tree?.getNodes() ?? [];
            if (!tree || roots.length === 0) {
              return;
            }
            const start = performance.now();
            tree.updateNode(roots[0].id, {
              name: `重命名 ${Date.now().toString().slice(-4)}`,
            });
            setEditLog(
              `程序化重命名 id=${roots[0].id}｜${(
                performance.now() - start
              ).toFixed(2)}ms`,
            );
          }}
        >
          重命名根节点
        </button>
        <button
          type="button"
          onClick={() => {
            const tree = treeRef.current;
            const roots = tree?.getNodes() ?? [];
            if (!tree || roots.length < 2) {
              return;
            }
            const start = performance.now();
            const ok = tree.moveNode(
              roots[roots.length - 1].id,
              roots[0].id,
              "next",
            );
            setEditLog(
              `程序化移动 ${String(roots[roots.length - 1].id)} → ${String(
                roots[0].id,
              )} next ${ok ? "成功" : "失败"}｜${(
                performance.now() - start
              ).toFixed(2)}ms`,
            );
          }}
        >
          移动末根到次位
        </button>
      </div>
      <YTree
        ref={treeRef}
        datasource={data}
        showLine
        checkable
        editable
        draggable
        expandAll
        height={400}
        onCheckedChange={(e) => {
          // 从事件时间戳起算：包含「联动重算」本身的耗时
          const cost = performance.now() - e.event.timeStamp;
          const list = treeRef.current?.getCheckedList() ?? [];
          const action = e.checked ? "勾选" : "取消勾选";
          setCheckLog(
            `${action} id=${
              e.id
            }｜父子联动后全树共 ${list.length.toLocaleString()} 个节点被勾选｜联动耗时 ${cost.toFixed(
              1,
            )}ms`,
          );
        }}
        onRename={(e) => {
          const cost = performance.now() - e.event.timeStamp;
          setEditLog(`行内重命名 id=${e.id}｜${cost.toFixed(2)}ms`);
        }}
        onAdd={(e) => {
          const cost = performance.now() - e.event.timeStamp;
          setEditLog(`新增子节点 id=${e.id}｜${cost.toFixed(2)}ms`);
        }}
        onRemove={(e) => {
          const cost = performance.now() - e.event.timeStamp;
          setEditLog(`删除节点 id=${e.id}｜${cost.toFixed(2)}ms`);
        }}
        onDrop={(e) => {
          const cost = performance.now() - e.event.timeStamp;
          setEditLog(
            `拖拽${e.moveType === "copy" ? "复制" : "移动"} ${String(
              e.sourceId,
            )} → ${String(e.targetId)} ${e.position}｜${cost.toFixed(2)}ms`,
          );
        }}
      />
      <p className="demo-tip">{log}</p>
      <p className="demo-tip">{checkLog}</p>
      <p className="demo-tip">{editLog}</p>
      <p className="demo-tip">
        虚拟滚动只渲染视口内的节点，DOM
        数量始终保持常量级；勾选联动走增量更新（只重算受影响的祖先链，O(depth)），
        拖拽/编辑只补丁可见列表，不做 13.7 万行全量
        DFS，因此十万级节点下依然流畅。
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */

export const perfDemos: Array<DemoMeta> = [
  {
    id: "large-data",
    title: "虚拟滚动 · 大数据量",
    desc: "height 指定滚动容器高度，组件只渲染视口内的节点。13.7 万节点全部展开时，实际 DOM 数量仍保持在几十个；勾选、拖拽、编辑都走增量更新，避免全量重建可见列表。",
    code: perfCode,
    render: () => <LargeDataDemo />,
  },
];
