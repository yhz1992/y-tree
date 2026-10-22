import React, { useEffect, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";
import { CODE_SAMPLES, FRAMEWORKS } from "../data/portal-data";
import { FrameworkLogo } from "./FrameworkLogo";
import type { FrameworkId } from "../App";

interface CodeMatrixProps {
  activeFw: FrameworkId;
  onSelectFw: (fw: FrameworkId) => void;
}

const LANG_MAP = {
  react: "tsx",
  vue: "vue",
  angular: "typescript",
} as const;

const FILE_NAME_MAP = {
  react: "App.tsx",
  vue: "App.vue",
  angular: "app.component.ts",
} as const;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["dark-plus"],
      langs: ["tsx", "vue", "typescript"],
    });
  }
  return highlighterPromise;
}

export const CodeMatrix: React.FC<CodeMatrixProps> = ({
  activeFw,
  onSelectFw,
}) => {
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState("");

  const currentFw = FRAMEWORKS.find((f) => f.id === activeFw)!;

  useEffect(() => {
    let cancelled = false;
    const source = CODE_SAMPLES[activeFw];

    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return;
        setHighlightedHtml(
          highlighter.codeToHtml(source, {
            lang: LANG_MAP[activeFw],
            theme: "dark-plus",
          }),
        );
      })
      .catch(() => {
        if (!cancelled) setHighlightedHtml("");
      });

    return () => {
      cancelled = true;
    };
  }, [activeFw]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_SAMPLES[activeFw]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="section" id="code">
      <div className="portal-container">
        <div className="section-headline-group">
          <div className="section-serial-kicker">
            <span className="serial-num">04</span>
            <span className="serial-slash">/</span>
            <span className="serial-label">INSTANT INTEGRATION</span>
          </div>
          <h2 className="section-super-title">
            三端高度一致的声明式 API，复制即运行
          </h2>
          <p className="section-super-desc">
            无论是 React JSX、Vue 3 单文件模板还是 Angular 组件，属性命名与事件签名保持高度对齐，跨团队协作零心智负担。
          </p>
        </div>

        <div className="ide-holo-frame">
          <div className="ide-topbar">
            <div className="ide-left-cluster">
              <div className="console-window-dots">
                <span className="win-dot dot-red" />
                <span className="win-dot dot-amber" />
                <span className="win-dot dot-green" />
              </div>

              <div className="ide-tabs-row" role="tablist">
                {FRAMEWORKS.map((fw) => (
                  <button
                    key={fw.id}
                    type="button"
                    role="tab"
                    aria-selected={activeFw === fw.id}
                    className={`ide-tab-pill ${
                      activeFw === fw.id ? "active" : ""
                    }`}
                    onClick={() => onSelectFw(fw.id)}
                  >
                    <span className="ide-tab-logo">
                      <FrameworkLogo id={fw.id} />
                    </span>
                    <span>{FILE_NAME_MAP[fw.id]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="ide-right-actions">
              <span className="ide-pkg-hint">{currentFw.install}</span>
              <button
                type="button"
                className={`copy-holo-btn ${copied ? "is-copied" : ""}`}
                onClick={handleCopyCode}
              >
                {copied ? (
                  <>
                    <i className="fa-solid fa-check" /> 已复制源码
                  </>
                ) : (
                  <>
                    <i className="fa-regular fa-copy" /> 复制代码
                  </>
                )}
              </button>
            </div>
          </div>

          {highlightedHtml ? (
            <div
              className="terminal-code-area"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <pre className="terminal-code-area">
              <code>{CODE_SAMPLES[activeFw]}</code>
            </pre>
          )}
        </div>
      </div>
    </section>
  );
};
