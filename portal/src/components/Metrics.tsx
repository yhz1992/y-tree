import React from "react";

export const Metrics: React.FC = () => {
  return (
    <section className="metrics-section">
      <div className="container">
        <div className="metrics-glass-box">
          <div className="metric-item">
            <div className="metric-number-wrapper">
              <span className="metric-number">3</span>
              <span className="metric-unit">大技术栈</span>
            </div>
            <div className="metric-title">React · Vue 3 · Angular</div>
            <p className="metric-desc">
              三端共享一套算法核心与基础样式源，零心智负担迁移。
            </p>
          </div>

          <div className="metric-item">
            <div className="metric-number-wrapper">
              <span className="metric-number">200K</span>
              <span className="metric-unit">+</span>
            </div>
            <div className="metric-title">超巨量节点流式渲染</div>
            <p className="metric-desc">
              自研虚拟滚动视窗切片算法，内存占用极低，稳定保持 60 FPS。
            </p>
          </div>

          <div className="metric-item">
            <div className="metric-number-wrapper">
              <span className="metric-number">0.01</span>
              <span className="metric-unit">ms</span>
            </div>
            <div className="metric-title">增量更新状态机</div>
            <p className="metric-desc">
              精准局部重算，彻底摆脱全树递归遍历，性能提升 99.9%。
            </p>
          </div>

          <div className="metric-item">
            <div className="metric-number-wrapper">
              <span className="metric-number">40</span>
              <span className="metric-unit">+</span>
            </div>
            <div className="metric-title">场景化原子功能演示</div>
            <p className="metric-desc">
              从拖拽、懒加载到复杂联动，每一个特性都经过严格验证。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
