import React from "react";
import { FRAMEWORKS } from "../data/portal-data";
import { FrameworkLogo } from "./FrameworkLogo";
import type { FrameworkId } from "../App";

interface NavbarProps {
  activeFw: FrameworkId;
  onSelectFw: (fw: FrameworkId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeFw, onSelectFw }) => {
  return (
    <div className="floating-nav-dock">
      <header className="glass-pill-nav">
        <a href="#" className="nav-brand-logo">
          <div className="brand-gem-holo">
            <span className="gem-core">Y</span>
          </div>
          <span className="brand-text">y-tree</span>
          <span className="brand-version-slash">/ 2.4</span>
        </a>

        <nav aria-label="主导航">
          <ul className="nav-links-row">
            <li>
              <a href="#workbench" className="nav-link-btn">
                工作台
              </a>
            </li>
            <li>
              <a href="#architecture" className="nav-link-btn">
                架构
              </a>
            </li>
            <li>
              <a href="#specs" className="nav-link-btn">
                内核规格
              </a>
            </li>
            <li>
              <a href="#benchmark" className="nav-link-btn">
                性能基准
              </a>
            </li>
            <li>
              <a href="#code" className="nav-link-btn">
                快速接入
              </a>
            </li>
            <li>
              <a href="#gallery" className="nav-link-btn">
                示例库
              </a>
            </li>
          </ul>
        </nav>

        <div className="nav-actions-group">
          <div
            className="fw-capsule-group"
            role="tablist"
            aria-label="全局框架切换"
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
      </header>
    </div>
  );
};
