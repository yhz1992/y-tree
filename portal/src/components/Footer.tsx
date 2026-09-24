import React from "react";
import { FRAMEWORKS } from "../data/portal-data";

export const Footer: React.FC = () => {
  return (
    <footer className="epic-footer">
      <div className="portal-container">
        <div className="footer-content-row">
          <div className="footer-brand">
            <div className="brand-gem footer-gem">Y</div>
            <div>
              <div className="footer-name">y-tree</div>
              <div className="footer-note">MIT License</div>
            </div>
          </div>

          <div className="footer-links">
            {FRAMEWORKS.map((fw) => (
              <a
                key={fw.id}
                href={fw.devUrl}
                target="_blank"
                rel="noreferrer"
                className="footer-link"
              >
                {fw.name} :{fw.defaultPort}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
