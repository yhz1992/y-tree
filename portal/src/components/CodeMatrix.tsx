import React, { useEffect, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";
import { CODE_SAMPLES, FRAMEWORKS } from "../data/portal-data";

const LANG_MAP = {
  react: "tsx",
  vue: "vue",
  angular: "typescript",
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

export const CodeMatrix: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"react" | "vue" | "angular">(
    "react",
  );
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    const source = CODE_SAMPLES[activeTab];

    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return;
        setHighlightedHtml(
          highlighter.codeToHtml(source, {
            lang: LANG_MAP[activeTab],
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
  }, [activeTab]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_SAMPLES[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="section" id="code">
      <div className="portal-container">
        <div className="section-headline-group">
          <h2 className="section-super-title">复制就能跑</h2>
          <p className="section-super-desc">
            选你现在用的框架，装上就能渲染一棵可勾选、可拖拽的树。
          </p>
        </div>

        <div className="dark-terminal-frame">
          <div className="terminal-topbar">
            <div className="terminal-tabs-cluster">
              {FRAMEWORKS.map((fw) => (
                <button
                  key={fw.id}
                  type="button"
                  className={`terminal-tab-pill ${
                    activeTab === fw.id ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(fw.id)}
                >
                  {fw.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="copy-mini-btn copy-on-dark"
              onClick={handleCopyCode}
            >
              {copied ? "已复制" : "复制"}
            </button>
          </div>

          {highlightedHtml ? (
            <div
              className="terminal-code-area"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <pre className="terminal-code-area">
              <code>{CODE_SAMPLES[activeTab]}</code>
            </pre>
          )}
        </div>
      </div>
    </section>
  );
};
