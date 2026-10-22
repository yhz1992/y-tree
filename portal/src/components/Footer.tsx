import React from "react";
import { FRAMEWORKS } from "../data/portal-data";
import { FrameworkLogo } from "./FrameworkLogo";

export const Footer: React.FC = () => {
  return (
    <footer className="epic-footer">
      <div className="portal-container">
        <div className="footer-content-row">
          <div className="footer-brand">
            <div className="brand-gem-holo footer-gem">
              <span className="gem-core">Y</span>
            </div>
            <div>
              <div className="footer-name">
                y-tree · Cross-Framework High-Performance Tree Engine
              </div>
              <div className="footer-note">
                O(1) Incremental Check · Constant Viewport Slice · MIT Licensed
              </div>
            </div>
          </div>

          <div className="footer-links">
            {FRAMEWORKS.map((fw) => (
              <a
                key={fw.id}
                href={fw.devUrl}
                target="_blank"
                rel="noreferrer"
                className="footer-link-pill"
              >
                <span className="fw-logo-mini">
                  <FrameworkLogo id={fw.id} />
                </span>
                <span>{fw.name} 演练场</span>
                <i className="fa-solid fa-arrow-up-right-from-square" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
