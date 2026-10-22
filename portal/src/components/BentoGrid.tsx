import React from "react";

interface ArchFeature {
  num: string;
  tag: string;
  title: string;
  desc: string;
  snippet: string;
  span?: "wide" | "normal";
}

const ARCH_FEATURES: ArchFeature[] = [
  {
    num: "01",
    tag: "O(1) INCREMENTAL CHECK",
    title: "O(1) 增量勾选状态机",
    desc: "非叶子节点维护直接子节点状态计数器（ChildStateCount）。单点勾选时，在 O(1) 时间内完成三态判定并仅沿祖先链单向回溯，彻底告别全树递归 DFS 遍历。",
    snippet: `type ChildStateCount = { checked: number; unchecked: number };\n// 仅回溯祖先链，200,000 节点勾选耗时 ~0.010ms`,
    span: "wide",
  },
  {
    num: "02",
    tag: "VIRTUAL SLICE",
    title: "恒定视口切片虚拟滚动",
    desc: "十万级与二十万级节点下，DOM 树恒定只渲染可视区内的 ~26 行元素与上下缓冲行，内存占用呈水平直线，连续滚动始终锁死 60 FPS。",
    snippet: `const ROW_HEIGHT = 28;\nconst OVERSCAN = 5;\n// DOM Nodes: ~26 rows constant`,
    span: "normal",
  },
  {
    num: "03",
    tag: "DRAG & CLONE PROTOCOL",
    title: "三落点原生拖拽与子树克隆",
    desc: "支持 prev、next、inner 精细磁吸落点指示器。内置祖先链防环检测拦截，按住 Ctrl / Cmd 键即可触发整棵子树深度克隆并重构拓扑。",
    snippet: `treeRef.current.moveNode(srcId, dstId, "inner");\ntreeRef.current.copyNode(srcId, dstId, "prev");`,
    span: "normal",
  },
  {
    num: "04",
    tag: "UNIFIED KERNEL",
    title: "跨端零漂移算法内核下沉",
    desc: "将扁平化索引、父子拓扑映射、模糊检索与生命周期拦截器统一收敛至 common/service.ts，三大框架仅实现薄视图层，消弭端间差异。",
    snippet: `export class YTreeService {\n  private flatNodesMap: Map<NodeId, YTreeModel>;\n  private childStateCountMap: Map<NodeId, ChildStateCount>;\n}`,
    span: "wide",
  },
  {
    num: "05",
    tag: "ASYNC LAZY ENGINE",
    title: "按需异步懒加载与局部重刷",
    desc: "支持首次展开 loadData 异步拉取、空树虚拟根节点装载，以及 reAsyncChildNodes 程序化局部刷新子树，内置流畅旋转指示。",
    snippet: `<YTree lazy loadData={async (node) => fetchChildren(node.id)} />`,
    span: "normal",
  },
  {
    num: "06",
    tag: "EXTENSIBLE SLOTS",
    title: "双向受控与全能插槽扩展",
    desc: "原生支持受控（expandIds / checkedIds / selectedIds）与非受控模式。提供 React renderNodeExtra、Vue #nodeExtra、Angular ng-template 扩展槽位。",
    snippet: `<YTree checkable renderNodeExtra={(node) => <Badge node={node} />} />`,
    span: "normal",
  },
];

export const BentoGrid: React.FC = () => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <section className="section" id="specs">
      <div className="portal-container">
        <div className="section-headline-group">
          <div className="section-serial-kicker">
            <span className="serial-num">02</span>
            <span className="serial-slash">/</span>
            <span className="serial-label">ARCHITECTURE &amp; ALGORITHMS</span>
          </div>
          <h2 className="section-super-title">
            硬核工程设计，直面极端业务场景
          </h2>
          <p className="section-super-desc">
            拒绝拼凑式封装。从底层数据结构到 DOM 渲染管线，每一处细节都为超大规模企业级应用量身锻造。
          </p>
        </div>

        <div className="bento-hairline-matrix">
          {ARCH_FEATURES.map((item) => (
            <div
              key={item.num}
              className={`bento-matrix-cell ${
                item.span === "wide" ? "bento-span-2" : ""
              }`}
              onMouseMove={handleMouseMove}
            >
              <div className="bento-cell-top">
                <span className="bento-serial-code">{item.num}</span>
                <span className="bento-spec-tag">{item.tag}</span>
              </div>

              <h3 className="bento-title">{item.title}</h3>
              <p className="bento-desc">{item.desc}</p>

              <div className="bento-code-window">
                <pre className="bento-code-pre">
                  <code>{item.snippet}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
