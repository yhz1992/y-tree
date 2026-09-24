import React, { useState } from "react";
import { FRAMEWORKS } from "../data/portal-data";
import { FrameworkLogo } from "./FrameworkLogo";

export const ArchitectureVisualizer: React.FC = () => {
  const [activeFw, setActiveFw] = useState<"react" | "vue" | "angular">(
    "react",
  );

  const activeObj = FRAMEWORKS.find((f) => f.id === activeFw)!;

  return (
    <section className="arch-showcase-section" id="architecture">
      <div className="portal-container">
        <div className="section-headline-group">
          <span className="section-glow-tag">能力</span>
          <h2 className="section-super-title">勾选、拖拽、大数据</h2>
          <p className="section-super-desc">
            组织树、权限树、资源目录这类场景，React、Vue、Angular 都能直接装。
          </p>
        </div>

        <div className="nexus-board">
          <div
            className="fw-capsule-group nexus-fw-switch"
            role="tablist"
            aria-label="选择框架"
          >
            {FRAMEWORKS.map((fw) => (
              <button
                key={fw.id}
                type="button"
                role="tab"
                aria-selected={activeFw === fw.id}
                className={`fw-capsule-item ${
                  activeFw === fw.id ? "active" : ""
                }`}
                onClick={() => setActiveFw(fw.id)}
              >
                <FrameworkLogo id={fw.id} />
                {fw.name}
              </button>
            ))}
          </div>

          <div className="nexus-core-capsule" key={activeObj.id}>
            <div className="core-pulse-badge">
              <code>{activeObj.install}</code>
            </div>

            <h3 className="core-title">在 {activeObj.name} 里用</h3>

            <p className="core-desc">{activeObj.desc}</p>
          </div>
        </div>

        <ul className="spec-list">
          <li>
            <strong>勾选联动</strong>
            <span>点父节点，子节点一起变。半选会自动跟上。</span>
          </li>
          <li>
            <strong>拖拽排序</strong>
            <span>拖到前面、后面或里面。按住 Ctrl 可复制整枝。</span>
          </li>
          <li>
            <strong>大数据</strong>
            <span>十万节点也能滚动、勾选、搜索，页面不会跟着卡死。</span>
          </li>
        </ul>
      </div>
    </section>
  );
};
