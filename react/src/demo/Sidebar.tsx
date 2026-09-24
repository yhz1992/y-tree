import { useEffect, useState } from "react";
import type { DemoGroup } from "./types";

interface SidebarProps {
  groups: Array<DemoGroup>;
}

/**
 * 左侧功能菜单：点击平滑滚动到锚点，滚动时自动高亮当前 demo。
 * 小屏改为抽屉，由「目录」按钮打开。
 */
export function Sidebar({ groups }: SidebarProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [navOpen, setNavOpen] = useState(false);

  // 滚动监听：取「顶部已越过阈值」的最后一个 demo 作为当前项
  useEffect(() => {
    const onScroll = () => {
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>(".demo-card"),
      );
      let current = cards[0]?.id ?? "";
      for (const card of cards) {
        if (card.getBoundingClientRect().top <= 120) {
          current = card.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [groups]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 24;
    setNavOpen(false);
    window.setTimeout(() => {
      window.scrollTo(0, top);
      setActiveId(id);
    }, 0);
  };

  return (
    <div className={`demo-nav${navOpen ? " is-open" : ""}`}>
      <button
        type="button"
        className="demo-sidebar-toggle"
        aria-expanded={navOpen}
        aria-controls="demo-sidebar"
        onClick={() => setNavOpen(true)}
      >
        目录
      </button>
      <button
        type="button"
        className="demo-sidebar-mask"
        aria-label="关闭目录"
        onClick={() => setNavOpen(false)}
      />
      <aside
        id="demo-sidebar"
        className={`demo-sidebar${navOpen ? " is-open" : ""}`}
      >
        <div className="demo-sidebar-title">
          y-tree
          <span className="demo-sidebar-sub">React</span>
          <button
            type="button"
            className="demo-sidebar-close"
            aria-label="关闭目录"
            onClick={() => setNavOpen(false)}
          >
            ×
          </button>
        </div>
        <nav className="demo-sidebar-nav">
          {groups.map((group) => (
            <div className="demo-sidebar-group" key={group.id}>
              <div className="demo-sidebar-group-title">{group.title}</div>
              <ul className="demo-sidebar-list">
                {group.demos.map((demo) => (
                  <li key={demo.id}>
                    <button
                      type="button"
                      className={`demo-sidebar-link${
                        activeId === demo.id ? " is-active" : ""
                      }`}
                      onClick={() => handleClick(demo.id)}
                    >
                      {demo.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
