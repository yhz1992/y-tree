import React from "react";
import { FRAMEWORKS } from "../data/portal-data";

export const Navbar: React.FC = () => {
  return (
    <div className="glass-nav-wrapper">
      <header className="glass-nav">
        <a href="#" className="nav-brand-logo">
          <div className="brand-gem">Y</div>
          <span className="brand-text">y-tree</span>
        </a>

        <nav>
          <ul className="nav-links-row">
            <li>
              <a href="#workbench" className="nav-link-btn">
                试用
              </a>
            </li>
            <li>
              <a href="#architecture" className="nav-link-btn">
                能力
              </a>
            </li>
            <li>
              <a href="#benchmark" className="nav-link-btn">
                性能
              </a>
            </li>
            <li>
              <a href="#code" className="nav-link-btn">
                接入
              </a>
            </li>
            <li>
              <a href="#gallery" className="nav-link-btn">
                示例
              </a>
            </li>
          </ul>
        </nav>

        <div className="nav-actions-group">
          <div className="fw-capsule-group">
            {FRAMEWORKS.map((fw) => (
              <a
                key={fw.id}
                href={fw.devUrl}
                target="_blank"
                rel="noreferrer"
                className="fw-capsule-item"
                title={`打开 ${fw.name} 示例`}
              >
                {fw.name}
              </a>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
};
