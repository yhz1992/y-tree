import React from "react";

interface ArchFeature {
  num: string;
  title: string;
  desc: string;
  snippet: string;
}

const ARCH_FEATURES: ArchFeature[] = [
  {
    num: "01",
    title: "跨端内核下沉 (Core Engine)",
    desc: "将所有扁平化索引、父子拓扑映射、环路检测与视口切片算法下沉至 common/service.ts，三大框架仅实现纯净视图层，彻底消灭端间行为漂移。",
    snippet: `// common/service.ts\nexport class YTreeService {\n  private flatNodesMap: Map<NodeId, YTreeModel>;\n  private childStateCountMap: Map<NodeId, ChildStateCount>;\n}`,
  },
  {
    num: "02",
    title: "O(1) 增量勾选状态机 (Incremental Check)",
    desc: "非叶子节点维护其直接子节点状态计数器。单点勾选时，状态在 O(1) 时间内完成判定并单向向上回溯父链，彻底规避全树递归 DFS 遍历。",
    snippet: `// 子节点计数器：O(1) 解析父级三态\ntype ChildStateCount = {\n  checked: number;\n  unchecked: number;\n};`,
  },
  {
    num: "03",
    title: "HTML5 原生拖拽与克隆 (Drag Protocol)",
    desc: "支持 prev、next、inner 三落点精细磁吸。内置祖先链防环拦截，支持 Ctrl/Meta 按键触发整棵子树深度克隆并重构层级拓扑。",
    snippet: `// 落点指示器与深拷贝\ntreeRef.current.moveNode(sourceId, targetId, "inner");\ntreeRef.current.copyNode(sourceId, targetId, "prev");`,
  },
  {
    num: "04",
    title: "双向受控与插槽扩展 (Extensibility)",
    desc: "原生支持受控（expandIds, checkedIds, selectedIds）与非受控模式。提供 React renderNodeExtra、Vue #nodeExtra、Angular ng-template 扩展槽位。",
    snippet: `<YTree\n  checkable\n  renderNodeExtra={(node) => (\n    <ActionMenu node={node} />\n  )}\n/>`,
  },
  {
    num: "05",
    title: "按需异步懒加载 (Lazy Load Engine)",
    desc: "支持首次展开 loadData 按需抓取，内置优雅的加载指示。支持空树虚拟根节点异步装载，以及 reAsyncChildNodes 程序化子树刷新。",
    snippet: `// 异步加载与程序化局部刷新\n<YTree\n  lazy\n  loadData={async (node) => fetchChildren(node.id)}\n/>`,
  },
  {
    num: "06",
    title: "恒定视口切片 (Virtual Slice)",
    desc: "十万级与百万级数据下，DOM 仅渲染可视区内的 ~25 行元素与前后缓冲行。内存占用保持恒定，连续滚动始终锁定 60 FPS 满帧。",
    snippet: `// 恒定 DOM 渲染开销\nconst ROW_HEIGHT = 28;\nconst OVERSCAN = 5;\n// DOM Elements: ~26-30 rows constant`,
  },
];

export const BentoGrid: React.FC = () => {
  return (
    <section className="section" id="architecture">
      <div className="shell">
        <div className="section-head">
          <div className="section-label">Architecture &amp; Algorithms</div>
          <h2 className="section-heading">严谨工程设计，直面极端场景</h2>
          <p className="section-sub">
            为复杂企业级产品量身定制的核心算法架构，在兼顾跨框架通用性的同时，彻底根治大规模树形数据的渲染与交互瓶颈。
          </p>
        </div>

        <div className="arch-grid">
          {ARCH_FEATURES.map((item) => (
            <div key={item.num} className="arch-card">
              <div className="arch-number">{item.num} / SPEC</div>
              <h3 className="arch-title">{item.title}</h3>
              <p className="arch-desc">{item.desc}</p>
              <pre className="arch-code-preview">
                <code>{item.snippet}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
