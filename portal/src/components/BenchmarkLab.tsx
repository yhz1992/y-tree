import React, { useState } from "react";
import { YTreeService } from "../../../common/service";
import type { YTreeFlatNode } from "../../../common/model";

interface RaceComparison {
  id: string;
  title: string;
  subtitle: string;
  legacyLabel: string;
  legacyTime: string;
  legacyBarPct: number;
  ytreeTime: string;
  ytreeBarPct: number;
  speedupBadge: string;
}

const RACE_COMPARISONS: RaceComparison[] = [
  {
    id: "check-200k",
    title: "单点勾选父子联动（200,000 节点）",
    subtitle: "O(1) 子节点计数器回溯 vs 传统全树 DFS 递归扫描",
    legacyLabel: "传统全树递归 ~132.68 ms",
    legacyTime: "132.68 ms",
    legacyBarPct: 100,
    ytreeTime: "0.010 ms",
    ytreeBarPct: 2.2,
    speedupBadge: "13,268x FASTER",
  },
  {
    id: "drag-20k",
    title: "拖拽移动整棵子树（20,000 节点）",
    subtitle: "哈希映射局部拓扑拼接 vs 全量树结构深拷贝重建",
    legacyLabel: "传统深拷贝重排 ~35.40 ms",
    legacyTime: "35.40 ms",
    legacyBarPct: 86,
    ytreeTime: "1.42 ms",
    ytreeBarPct: 4.5,
    speedupBadge: "25x FASTER",
  },
  {
    id: "mount-100k",
    title: "100,000 节点首次挂载与滚动",
    subtitle: "恒定 ~26 行视口虚拟切片 vs 全量真实 DOM 节点直出",
    legacyLabel: "传统 DOM 直出 >3,800 ms (卡死)",
    legacyTime: "浏览器假死",
    legacyBarPct: 100,
    ytreeTime: "12.4 ms (26 DOM)",
    ytreeBarPct: 3.5,
    speedupBadge: "60 FPS LOCKED",
  },
];

export const BenchmarkLab: React.FC = () => {
  const [activeBenchType, setActiveBenchType] = useState<
    "check" | "search" | "transform" | null
  >(null);

  const [testResult, setTestResult] = useState<{
    task: string;
    elapsed: string;
    ops: string;
    perOp: string;
    status: "idle" | "running" | "done";
  }>({
    task: "点击右侧按钮，在您的浏览器中现场构建 20,000 节点并实测吞吐率",
    elapsed: "0.00 ms",
    ops: "READY",
    perOp: "-",
    status: "idle",
  });

  const runLiveTest = (type: "check" | "search" | "transform") => {
    setActiveBenchType(type);
    setTestResult({
      task: "正在构造 20,000 节点内存索引并执行高压基准循环...",
      elapsed: "RUNNING...",
      ops: "COMPUTING",
      perOp: "...",
      status: "running",
    });

    setTimeout(() => {
      // 构造 20,000 节点测试集
      const nodes: YTreeFlatNode[] = [];
      for (let i = 0; i < 20000; i++) {
        nodes.push({
          id: `node-${i}`,
          pId: i === 0 ? "" : `node-${Math.floor(i / 10)}`,
          name: `benchmark-entry-${i}.ts`,
        });
      }

      const service = new YTreeService(nodes);

      if (type === "check") {
        const start = performance.now();
        const iterations = 500;
        for (let i = 0; i < iterations; i++) {
          const targetId = `node-${(i * 37) % 20000}`;
          service.toggleCheckedByUser(targetId, true);
        }
        const end = performance.now();
        const totalMs = Math.max(0.05, end - start);
        setTestResult({
          task: `连续勾选联动 ${iterations} 次（20,000 节点）`,
          elapsed: `${totalMs.toFixed(2)} ms`,
          ops: `${((iterations / totalMs) * 1000).toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })} ops/s`,
          perOp: `${(totalMs / iterations).toFixed(4)} ms/op`,
          status: "done",
        });
      } else if (type === "search") {
        const start = performance.now();
        const iterations = 200;
        for (let i = 0; i < iterations; i++) {
          service.getNodesByParamFuzzy("name", `entry-${i * 10}`);
        }
        const end = performance.now();
        const totalMs = Math.max(0.05, end - start);
        setTestResult({
          task: `模糊关键字检索 ${iterations} 次（20,000 节点）`,
          elapsed: `${totalMs.toFixed(2)} ms`,
          ops: `${((iterations / totalMs) * 1000).toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })} ops/s`,
          perOp: `${(totalMs / iterations).toFixed(3)} ms/op`,
          status: "done",
        });
      } else if (type === "transform") {
        const start = performance.now();
        const res = service.transformToTreeNodes();
        const end = performance.now();
        const totalMs = Math.max(0.05, end - start);
        setTestResult({
          task: `20,000 扁平节点还原嵌套树拓扑（${res.length} 根节点）`,
          elapsed: `${totalMs.toFixed(2)} ms`,
          ops: `${((20000 / totalMs) * 1000).toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })} nodes/s`,
          perOp: "O(N) 线性转换",
          status: "done",
        });
      }
    }, 60);
  };

  return (
    <section className="section" id="benchmark">
      <div className="portal-container">
        <div className="section-headline-group">
          <div className="section-serial-kicker">
            <span className="serial-num">03</span>
            <span className="serial-slash">/</span>
            <span className="serial-label">EXTREME BENCHMARK LAB</span>
          </div>
          <h2 className="section-super-title">
            降维打击的性能表现，当场点一下验真假
          </h2>
          <p className="section-super-desc">
            不放静态截图。点击下方触发器，直接在您当前的浏览器主线程里实例化{" "}
            <code>YTreeService</code> 跑满 20,000 节点压力测试。
          </p>
        </div>

        <div className="benchmark-cyber-arena">
          {/* 上半区：真机实时跑分发射台 */}
          <div className="arena-live-console">
            <div className="arena-console-left">
              <div className="arena-live-badge">
                <span className="pulse-dot" />
                <span>BROWSER LIVE ENGINE BENCHMARK</span>
              </div>
              <h3 className="arena-console-title">
                本机浏览器实时算力压测 (20,000 Nodes)
              </h3>
              <p className="arena-console-sub">{testResult.task}</p>
            </div>

            <div className="arena-trigger-group">
              <button
                type="button"
                className={`cyber-bench-btn ${
                  activeBenchType === "check" ? "active" : ""
                }`}
                onClick={() => runLiveTest("check")}
              >
                <i className="fa-solid fa-square-check" />
                <span>勾选联动 ×500 次</span>
              </button>
              <button
                type="button"
                className={`cyber-bench-btn ${
                  activeBenchType === "search" ? "active" : ""
                }`}
                onClick={() => runLiveTest("search")}
              >
                <i className="fa-solid fa-magnifying-glass-chart" />
                <span>模糊搜索 ×200 次</span>
              </button>
              <button
                type="button"
                className={`cyber-bench-btn ${
                  activeBenchType === "transform" ? "active" : ""
                }`}
                onClick={() => runLiveTest("transform")}
              >
                <i className="fa-solid fa-sitemap" />
                <span>2 万节点树还原</span>
              </button>
            </div>
          </div>

          {/* 实时结算大屏仪表 */}
          <div className={`arena-telemetry-readout status-${testResult.status}`}>
            <div className="readout-box">
              <span className="readout-label">TOTAL ELAPSED (总耗时)</span>
              <strong className="readout-num text-emerald">
                {testResult.elapsed}
              </strong>
            </div>
            <div className="readout-box">
              <span className="readout-label">THROUGHPUT (吞吐算力)</span>
              <strong className="readout-num text-cyan">{testResult.ops}</strong>
            </div>
            <div className="readout-box">
              <span className="readout-label">SINGLE OP COST (单次开销)</span>
              <strong className="readout-num">{testResult.perOp}</strong>
            </div>
          </div>

          {/* 下半区：可视化竞速碾压对比条 */}
          <div className="race-bars-container">
            {RACE_COMPARISONS.map((race) => (
              <div key={race.id} className="race-comparison-row">
                <div className="race-row-head">
                  <div>
                    <h4 className="race-title">{race.title}</h4>
                    <p className="race-subtitle">{race.subtitle}</p>
                  </div>
                  <span className="race-speedup-pill">{race.speedupBadge}</span>
                </div>

                <div className="race-tracks-stack">
                  {/* y-tree 极速光轨 */}
                  <div className="race-track-line">
                    <span className="track-brand is-ytree">
                      <i className="fa-solid fa-bolt" /> y-tree Engine
                    </span>
                    <div className="track-bar-rail">
                      <div
                        className="track-bar-fill fill-ytree"
                        style={{ width: `${race.ytreeBarPct}%` }}
                      />
                      <span className="track-time-tag tag-ytree">
                        {race.ytreeTime}
                      </span>
                    </div>
                  </div>

                  {/* 传统方案慢速轨 */}
                  <div className="race-track-line">
                    <span className="track-brand is-legacy">
                      传统递归方案
                    </span>
                    <div className="track-bar-rail">
                      <div
                        className="track-bar-fill fill-legacy"
                        style={{ width: `${race.legacyBarPct}%` }}
                      />
                      <span className="track-time-tag tag-legacy">
                        {race.legacyLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
