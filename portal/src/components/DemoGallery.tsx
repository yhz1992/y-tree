import React, { useState } from "react";
import { DEMO_CATEGORIES, FRAMEWORKS } from "../data/portal-data";

export const DemoGallery: React.FC = () => {
  const [activeFw, setActiveFw] = useState<"react" | "vue" | "angular">(
    "react",
  );

  const currentFw = FRAMEWORKS.find((f) => f.id === activeFw)!;

  return (
    <section className="section" id="gallery">
      <div className="portal-container">
        <div className="section-headline-group">
          <h2 className="section-super-title">打开完整示例</h2>
          <p className="section-super-desc">
            勾选、拖拽、懒加载、自定义节点都有独立页面。选框架后直接跳转。
          </p>

          <div className="gallery-fw-switch">
            <div className="fw-capsule-group">
              {FRAMEWORKS.map((fw) => (
                <button
                  key={fw.id}
                  type="button"
                  className={`fw-capsule-item ${
                    activeFw === fw.id ? "active" : ""
                  }`}
                  onClick={() => setActiveFw(fw.id)}
                >
                  {fw.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="atomic-gallery-grid">
          {DEMO_CATEGORIES.map((cat) => (
            <div key={cat.id} className="atomic-card">
              <div className="atomic-head-row">
                <span className="atomic-title">{cat.title}</span>
                <span className="atomic-badge-count">{cat.badge}</span>
              </div>

              <p className="atomic-desc">{cat.desc}</p>

              <div className="atomic-items-box">
                {cat.items.map((item) => (
                  <div key={item.id} className="atomic-sub-item">
                    <span className="atomic-item-name">{item.title}</span>
                    <span className="atomic-item-tag">{item.tag}</span>
                  </div>
                ))}
              </div>

              <div className="atomic-launch-bar">
                <a
                  href={`${currentFw.devUrl}#${cat.items[0]?.id || ""}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-launch-demo"
                >
                  在 {currentFw.name} 中打开
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
