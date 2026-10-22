import React from "react";
import { FRAMEWORKS } from "../data/portal-data";
import { FrameworkLogo } from "./FrameworkLogo";
import type { FrameworkId } from "../App";

interface ArchitectureVisualizerProps {
  activeFw: FrameworkId;
  onSelectFw: (fw: FrameworkId) => void;
}

const CORE_MODULES = [
  {
    code: "flatNodesMap",
    label: "O(1) 哈希索引池",
    detail: "Map<NodeId, YTreeModel> 瞬时寻址",
  },
  {
    code: "childStateCount",
    label: "增量三态计数器",
    detail: "单向回溯父链，零递归开销",
  },
  {
    code: "virtualSlice",
    label: "恒定视窗切片器",
    detail: "Overscan 双缓冲，锁定 26 DOM",
  },
  {
    code: "dragTopology",
    label: "拓扑防环守卫",
    detail: "prev / next / inner + Ctrl 克隆",
  },
];

export const ArchitectureVisualizer: React.FC<ArchitectureVisualizerProps> = ({
  activeFw,
  onSelectFw,
}) => {
  const activeObj = FRAMEWORKS.find((f) => f.id === activeFw)!;

  return (
    <section className="section" id="architecture">
      <div className="portal-container">
        <div className="section-headline-group">
          <div className="section-serial-kicker">
            <span className="serial-num">01</span>
            <span className="serial-slash">/</span>
            <span className="serial-label">CROSS-FRAMEWORK NEXUS</span>
          </div>
          <h2 className="section-super-title">
            一核驱动三端，彻底消灭多框架行为漂移
          </h2>
          <p className="section-super-desc">
            将所有高复杂度树形算法下沉至纯 TypeScript 核心层{" "}
            <code>common/service.ts</code>，React、Vue 3、Angular
            仅作为轻量级响应式视图壳，共享同一套状态机与数据结构。
          </p>
        </div>

        {/* 全息架构星图面板 */}
        <div className="nexus-holo-stage">
          <div className="nexus-diagram-grid">
            {/* 左侧：底层算法能量核 */}
            <div className="nexus-core-reactor">
              <div className="reactor-header">
                <span className="reactor-badge">
                  <span className="pulse-dot" /> ZERO-DEPENDENCY KERNEL
                </span>
                <code className="reactor-file">common/service.ts</code>
              </div>

              <div className="reactor-orb-wrap">
                <div className="reactor-orbit orbit-1" />
                <div className="reactor-orbit orbit-2" />
                <div className="reactor-center-core">
                  <span className="core-logo-y">Y</span>
                  <span className="core-sub-text">YTreeService</span>
                </div>
              </div>

              <div className="reactor-modules-grid">
                {CORE_MODULES.map((m) => (
                  <div key={m.code} className="reactor-mod-chip">
                    <code>{m.code}</code>
                    <strong>{m.label}</strong>
                    <span>{m.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 中间：动态 SVG 光纤脉冲总线 */}
            <div className="nexus-fiber-bus" aria-hidden="true">
              <svg
                viewBox="0 0 220 300"
                className="fiber-svg"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="beam-react"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                  <linearGradient
                    id="beam-vue"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient
                    id="beam-angular"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </linearGradient>
                </defs>

                {/* 底层暗轨 */}
                <path
                  d="M 0 150 C 90 150, 110 55, 220 55"
                  className="fiber-track"
                />
                <path
                  d="M 0 150 C 90 150, 110 150, 220 150"
                  className="fiber-track"
                />
                <path
                  d="M 0 150 C 90 150, 110 245, 220 245"
                  className="fiber-track"
                />

                {/* 动态流光脉冲轨 */}
                <path
                  d="M 0 150 C 90 150, 110 55, 220 55"
                  stroke="url(#beam-react)"
                  className={`fiber-pulse ${
                    activeFw === "react" ? "is-active" : ""
                  }`}
                />
                <path
                  d="M 0 150 C 90 150, 110 150, 220 150"
                  stroke="url(#beam-vue)"
                  className={`fiber-pulse ${
                    activeFw === "vue" ? "is-active" : ""
                  }`}
                />
                <path
                  d="M 0 150 C 90 150, 110 245, 220 245"
                  stroke="url(#beam-angular)"
                  className={`fiber-pulse ${
                    activeFw === "angular" ? "is-active" : ""
                  }`}
                />
              </svg>
            </div>

            {/* 右侧：三大框架响应式适配舱 */}
            <div className="nexus-adapters-col" role="tablist">
              {FRAMEWORKS.map((fw) => {
                const isSelected = activeFw === fw.id;
                return (
                  <div
                    key={fw.id}
                    role="tab"
                    tabIndex={0}
                    aria-selected={isSelected}
                    className={`nexus-adapter-pod fw-${fw.id} ${
                      isSelected ? "active" : ""
                    }`}
                    onClick={() => onSelectFw(fw.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onSelectFw(fw.id);
                    }}
                  >
                    <div className="adapter-pod-head">
                      <div className="adapter-logo-box">
                        <FrameworkLogo id={fw.id} />
                      </div>
                      <div className="adapter-meta">
                        <div className="adapter-name-row">
                          <h4>{fw.name}</h4>
                          <span className="adapter-ver">{fw.version}</span>
                        </div>
                        <code className="adapter-pkg">{fw.badge}</code>
                      </div>
                      <a
                        href={fw.devUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="adapter-go-btn"
                        onClick={(e) => e.stopPropagation()}
                        title={`打开 ${fw.name} 实时演练场`}
                      >
                        ↗
                      </a>
                    </div>
                    <p className="adapter-desc">{fw.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="nexus-bridge-footer">
            <div className="bridge-status">
              <span className="bridge-dot" />
              <span>
                ACTIVE PIPELINE: <strong>{activeObj.name}</strong> (
                <code>{activeObj.install}</code>)
              </span>
            </div>
            <div className="bridge-tags">
              <span className="spec-chip">双向受控 Props / v-model</span>
              <span className="spec-chip">自定义插槽 / Render Prop</span>
              <span className="spec-chip">共享 base.css 样式源</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
