import React from "react";
import { DEMO_CATEGORIES, FRAMEWORKS } from "../data/portal-data";
import { FrameworkLogo } from "./FrameworkLogo";
import type { FrameworkId } from "../App";

interface DemoGalleryProps {
  activeFw: FrameworkId;
  onSelectFw: (fw: FrameworkId) => void;
}

export const DemoGallery: React.FC<DemoGalleryProps> = ({
  activeFw,
  onSelectFw,
}) => {
  const currentFw = FRAMEWORKS.find((f) => f.id === activeFw)!;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <section className="section" id="gallery">
      <div className="portal-container">
        <div className="gallery-top-bar">
          <div className="section-headline-group" style={{ marginBottom: 0 }}>
            <div className="section-serial-kicker">
              <span className="serial-num">05</span>
              <span className="serial-slash">/</span>
              <span className="serial-label">40+ ATOMIC PLAYGROUNDS</span>
            </div>
            <h2 className="section-super-title">
              全场景原子示例矩阵，点击直达演练场
            </h2>
            <p className="section-super-desc">
              涵盖嵌套/扁平数据源、父子联动、Radio 单选、异步懒加载、行内编辑、三落点拖拽与十万级虚拟滚动，全部配备独立在线沙盒。
            </p>
          </div>

          <div className="gallery-fw-switch">
            <div className="fw-capsule-group" role="tablist">
              {FRAMEWORKS.map((fw) => (
                <button
                  key={fw.id}
                  type="button"
                  role="tab"
                  aria-selected={activeFw === fw.id}
                  className={`fw-capsule-item ${
                    activeFw === fw.id ? "active" : ""
                  }`}
                  onClick={() => onSelectFw(fw.id)}
                >
                  <span className="fw-logo-mini">
                    <FrameworkLogo id={fw.id} />
                  </span>
                  <span>{fw.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="atomic-gallery-grid">
          {DEMO_CATEGORIES.map((cat, idx) => (
            <div
              key={cat.id}
              className="atomic-holo-card"
              onMouseMove={handleMouseMove}
            >
              <div className="atomic-head-row">
                <div className="atomic-title-wrap">
                  <span className="atomic-idx">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="atomic-title">{cat.title}</h3>
                </div>
                <span className="atomic-badge-count">{cat.badge}</span>
              </div>

              <p className="atomic-desc">{cat.desc}</p>

              <div className="atomic-items-box">
                {cat.items.map((item) => (
                  <a
                    key={item.id}
                    href={`${currentFw.devUrl}#${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="atomic-sub-item"
                  >
                    <span className="atomic-item-name">
                      <i className="fa-solid fa-angle-right item-arrow" />
                      {item.title}
                    </span>
                    <code className="atomic-item-tag">{item.tag}</code>
                  </a>
                ))}
              </div>

              <div className="atomic-launch-bar">
                <a
                  href={`${currentFw.devUrl}#${cat.items[0]?.id || ""}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-launch-demo"
                >
                  <span>在 {currentFw.name} 沙盒中打开</span>
                  <i className="fa-solid fa-arrow-up-right-from-square" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
