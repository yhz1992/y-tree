import { useState, type ReactNode } from "react";

interface DemoCardProps {
  /** 锚点 id */
  id: string;
  /** 功能点标题 */
  title: string;
  /** 一句话说明 */
  desc: string;
  /** 核心用法代码 */
  code: string;
  /** 实例区内容 */
  children: ReactNode;
}

/**
 * 单个功能点演示卡片：标题 + 说明 + 带边框实例区 + 可展开代码
 */
export function DemoCard({ id, title, desc, code, children }: DemoCardProps) {
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <section className="demo-card" id={id}>
      <h3 className="demo-card-title">{title}</h3>
      <p className="demo-card-desc">{desc}</p>
      <div className="demo-card-body">{children}</div>
      <div className="demo-card-code-bar">
        <button
          type="button"
          className="demo-card-code-btn"
          onClick={() => setCodeOpen((open) => !open)}
        >
          <span className={`demo-card-code-caret${codeOpen ? " is-open" : ""}`}>
            ▸
          </span>
          {codeOpen ? "隐藏代码" : "显示代码"}
        </button>
      </div>
      {codeOpen && (
        <pre className="demo-card-code">
          <code>{code}</code>
        </pre>
      )}
    </section>
  );
}
