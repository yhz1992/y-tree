import { Sidebar } from "./demo/Sidebar";
import { DemoCard } from "./demo/DemoCard";
import { demoGroups } from "./demo/registry";
import "./demo/demo.css";

export default function App() {
  const total = demoGroups.reduce((sum, group) => sum + group.demos.length, 0);

  return (
    <div className="demo-layout">
      <Sidebar groups={demoGroups} />
      <main className="demo-main">
        <header className="demo-header">
          <h1>y-tree · React</h1>
          <p>
            一个树组件，共 {total} 个功能点演示。
            左侧按能力域分组，点击可跳转到对应示例。
          </p>
        </header>

        {demoGroups.map((group) => (
          <div key={group.id}>
            {group.demos.map((demo) => (
              <DemoCard
                key={demo.id}
                id={demo.id}
                title={demo.title}
                desc={demo.desc}
                code={demo.code}
              >
                {demo.render()}
              </DemoCard>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
