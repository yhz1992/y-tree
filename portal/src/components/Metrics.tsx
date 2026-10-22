import React from "react";

interface MetricCardData {
  value: string;
  unit: string;
  title: string;
  desc: string;
  spec: string;
}

const METRICS_DATA: MetricCardData[] = [
  {
    value: "0.010",
    unit: "ms",
    title: "O(1) 增量勾选状态机",
    desc: "告别全树 DFS 遍历，单点勾选仅沿祖先链局部更新计数器，响应提速 13,268 倍。",
    spec: "INCREMENTAL STATE",
  },
  {
    value: "~26",
    unit: "DOM",
    title: "恒定视口切片渲染",
    desc: "无论 10 万还是 20 万节点，DOM 树恒定只保留可视窗口约 26 行切片，满帧 60 FPS。",
    spec: "VIRTUAL SLICE",
  },
  {
    value: "100",
    unit: "%",
    title: "三端共享同源算法内核",
    desc: "一套零依赖 TypeScript 引擎下沉至 common/，React、Vue 3、Angular 行为完全同步。",
    spec: "UNIFIED KERNEL",
  },
  {
    value: "40",
    unit: "+",
    title: "生产级原子特性全覆盖",
    desc: "三落点原生拖拽、按住 Ctrl 克隆子树、异步懒加载拦截器与双向受控扩展插槽。",
    spec: "ATOMIC SPECS",
  },
];

export const Metrics: React.FC = () => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <section className="metrics-hairline-band">
      <div className="portal-container">
        <div className="hairline-grid-4">
          {METRICS_DATA.map((m, idx) => (
            <div
              key={idx}
              className="hairline-metric-cell"
              onMouseMove={handleMouseMove}
            >
              <div className="cell-top-meta">
                <span className="cell-serial">0{idx + 1}</span>
                <span className="cell-spec-label">{m.spec}</span>
              </div>

              <div className="cell-giant-figure">
                <span className="figure-num">{m.value}</span>
                <span className="figure-unit">{m.unit}</span>
              </div>

              <h3 className="cell-title">{m.title}</h3>
              <p className="cell-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
