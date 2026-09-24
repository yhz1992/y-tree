import React, { useState } from "react";
import { YTreeService } from "../../../common/service";
import type { YTreeFlatNode } from "../../../common/model";

export const BenchmarkLab: React.FC = () => {
  const [testResult, setTestResult] = useState<{
    task: string;
    elapsed: string;
    ops: string;
    status: "idle" | "running" | "done";
  }>({
    task: "待命",
    elapsed: "-",
    ops: "-",
    status: "idle",
  });

  const runLiveTest = (type: "check" | "search" | "transform") => {
    setTestResult({
      task: "压测计算中...",
      elapsed: "计算中...",
      ops: "...",
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
        const totalMs = end - start;
        setTestResult({
          task: `勾选 ${iterations} 次（20,000 节点）`,
          elapsed: `${totalMs.toFixed(2)} ms`,
          ops: `${((iterations / totalMs) * 1000).toFixed(0)} ops/sec`,
          status: "done",
        });
      } else if (type === "search") {
        const start = performance.now();
        const iterations = 200;
        for (let i = 0; i < iterations; i++) {
          service.getNodesByParamFuzzy("name", `entry-${i * 10}`);
        }
        const end = performance.now();
        const totalMs = end - start;
        setTestResult({
          task: `搜索 ${iterations} 次（20,000 节点）`,
          elapsed: `${totalMs.toFixed(2)} ms`,
          ops: `${((iterations / totalMs) * 1000).toFixed(0)} ops/sec`,
          status: "done",
        });
      } else if (type === "transform") {
        const start = performance.now();
        const res = service.transformToTreeNodes();
        const end = performance.now();
        const totalMs = end - start;
        setTestResult({
          task: `还原成树（${res.length} 个根节点）`,
          elapsed: `${totalMs.toFixed(2)} ms`,
          ops: "单次完成",
          status: "done",
        });
      }
    }, 25);
  };

  return (
    <section className="section" id="benchmark">
      <div className="portal-container">
        <div className="section-headline-group">
          <h2 className="section-super-title">在这页点一下就知道快不快</h2>
          <p className="section-super-desc">
            现场构造 20,000 个节点，测勾选和搜索。下面表格是对照样例。
          </p>
        </div>

        {/* 主基准评测竞技场 */}
        <div className="benchmark-arena">
          <div className="arena-top-row">
            <div>
              <div className="arena-title">本机实测</div>
              <div className="arena-hint">
                勾选 500 次、搜索 200 次，或把扁平数据还原成树。
              </div>
            </div>

            <div className="arena-actions">
              <button
                type="button"
                className="console-btn btn-active-emerald"
                onClick={() => runLiveTest("check")}
              >
                勾选 500 次
              </button>
              <button
                type="button"
                className="console-btn"
                onClick={() => runLiveTest("search")}
              >
                搜索 200 次
              </button>
              <button
                type="button"
                className="console-btn"
                onClick={() => runLiveTest("transform")}
              >
                还原成树
              </button>
            </div>
          </div>

          {/* 实时反馈跑马条 */}
          {testResult.status !== "idle" && (
            <div className="live-result-bar">
              <span>
                <strong>本次:</strong> {testResult.task}
              </span>
              <div className="live-result-nums">
                <span>
                  耗时 <strong>{testResult.elapsed}</strong>
                </span>
                <span>
                  吞吐 <strong>{testResult.ops}</strong>
                </span>
              </div>
            </div>
          )}

          {/* 权威实测对照表 */}
          <table className="benchmark-table-clean">
            <thead>
              <tr>
                <th>场景</th>
                <th>常见做法</th>
                <th>y-tree</th>
                <th>对照</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>勾选一个节点（20 万）</strong>
                </td>
                <td>
                  ~132.68 ms{" "}
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>
                    (整棵扫一遍)
                  </span>
                </td>
                <td>
                  <strong className="table-speedup">0.010 ms</strong>
                </td>
                <td>
                  <span className="table-speedup">约 99.9%</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>拖动一枝（2 万）</strong>
                </td>
                <td>~35.40 ms</td>
                <td>
                  <strong
                    style={{ color: "#059669", fontFamily: "var(--font-mono)" }}
                  >
                    1.42 ms
                  </strong>
                </td>
                <td>
                  <span className="table-speedup">~25x 提速</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>打开 10 万节点</strong>
                </td>
                <td>难以挂载</td>
                <td>
                  <strong
                    style={{ color: "#059669", fontFamily: "var(--font-mono)" }}
                  >
                    12.4 ms
                  </strong>
                </td>
                <td>
                  <span className="table-speedup">可挂载</span>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>页面实际渲染行数</strong>
                </td>
                <td>十万行一起画</td>
                <td>
                  <strong
                    style={{ color: "#059669", fontFamily: "var(--font-mono)" }}
                  >
                    大约 26 行
                  </strong>
                </td>
                <td>
                  <span className="table-speedup">只画可见行</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
