import React, { useState, useMemo, useRef } from "react";
import { FRAMEWORKS } from "../data/portal-data";
import { YTree } from "../../../react/src/components/y-tree";
import type { YTreeRef } from "../../../react/src/components/y-tree";
import type { YTreeNode, YTreeFlatNode } from "../../../common/model";

// 规范完整的真实前端工程树（35 节点）
const SAMPLE_TREE: YTreeNode[] = [
  {
    id: "packages",
    name: "组织架构",
    expanded: true,
    children: [
      {
        id: "core",
        name: "产品研发",
        expanded: true,
        children: [
          {
            id: "core-service",
            name: "前端组",
            checked: true,
            children: [],
          },
          {
            id: "core-view",
            name: "设计组",
            checked: true,
            children: [],
          },
          { id: "core-model", name: "测试组", children: [] },
          { id: "core-style", name: "发布组", children: [] },
        ],
      },
      {
        id: "react",
        name: "华东区",
        expanded: true,
        children: [
          {
            id: "react-comp",
            name: "上海分公司",
            checked: true,
            children: [],
          },
          {
            id: "react-props",
            name: "杭州分公司",
            children: [],
          },
          { id: "react-index", name: "南京分公司", children: [] },
        ],
      },
      {
        id: "vue",
        name: "华南区",
        expanded: true,
        children: [
          {
            id: "vue-comp",
            name: "广州分公司",
            children: [],
          },
          {
            id: "vue-props",
            name: "深圳分公司",
            children: [],
          },
        ],
      },
      {
        id: "angular",
        name: "华北区",
        expanded: false,
        children: [
          {
            id: "ng-comp",
            name: "北京分公司",
            children: [],
          },
          {
            id: "ng-module",
            name: "天津分公司",
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: "benchmarks",
    name: "权限",
    expanded: true,
    children: [
      {
        id: "bench-incremental",
        name: "管理员",
        children: [],
      },
      { id: "bench-virtual", name: "编辑", children: [] },
      { id: "bench-drag", name: "只读", children: [] },
    ],
  },
  {
    id: "docs",
    name: "资源",
    expanded: false,
    children: [
      { id: "doc-spec", name: "产品文档", children: [] },
      { id: "doc-api", name: "接口文档", children: [] },
    ],
  },
  { id: "cfg-package", name: "品牌物料", children: [] },
  { id: "cfg-tsconfig", name: "合同模板", children: [] },
  { id: "cfg-readme", name: "帮助中心", children: [] },
];

// 动态生成 100,000 个扁平节点
function generate100kNodes(): YTreeFlatNode[] {
  const list: YTreeFlatNode[] = [];
  const rootCount = 100;
  const leavesPerRoot = 1000;

  for (let r = 0; r < rootCount; r++) {
    const rootId = `dept-${r}`;
    list.push({
      id: rootId,
      pId: "",
      name: `部门 ${r + 1}`,
      expanded: r === 0,
    });
    for (let c = 0; c < leavesPerRoot; c++) {
      list.push({
        id: `${rootId}-leaf-${c}`,
        pId: rootId,
        name: `成员 ${r + 1}-${c + 1}`,
      });
    }
  }
  return list;
}

export const Hero: React.FC = () => {
  const treeRef = useRef<YTreeRef | null>(null);

  const [selectedFw, setSelectedFw] = useState<"react" | "vue" | "angular">(
    "react",
  );
  const [copied, setCopied] = useState(false);

  // 工作台状态
  const [isStressMode, setIsStressMode] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [checkable, setCheckable] = useState(true);
  const [draggable, setDraggable] = useState(true);
  const [showLine, setShowLine] = useState(true);
  const [checkStrictly, setCheckStrictly] = useState(false);

  const [lastAction, setLastAction] = useState<string>("就绪");
  const [lastLatency, setLastLatency] = useState<number | null>(null);

  const largeData = useMemo(() => {
    if (!isStressMode) return [];
    return generate100kNodes();
  }, [isStressMode]);

  const activeFw = FRAMEWORKS.find((f) => f.id === selectedFw)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFw.install);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleCheckAll = (checked: boolean) => {
    if (!treeRef.current) return;
    const t0 = performance.now();
    treeRef.current.checkAllNodes(checked);
    const t1 = performance.now();
    setLastAction(checked ? "全选" : "全不选");
    setLastLatency(Number((t1 - t0).toFixed(3)));
  };

  return (
    <section className="hero-epic" id="workbench">
      <div className="portal-container">
        <div className="hero-split">
          <div className="hero-copy">
            <p className="hero-kicker">React · Vue 3 · Angular</p>
            <h1 className="hero-epic-title">
              组织树、权限树、
              <br />
              目录树，装上就能用
            </h1>
            <p className="hero-epic-desc">
              勾选会联动，节点能拖，十万条也能滚。下面这棵就是真组件。
            </p>
            <div className="hero-fw-row">
              {FRAMEWORKS.map((fw) => (
                <button
                  key={fw.id}
                  type="button"
                  className={`hero-fw-btn ${
                    selectedFw === fw.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedFw(fw.id)}
                >
                  {fw.name}
                </button>
              ))}
            </div>
            <div className="hero-cta-cluster">
              <a
                href={activeFw.devUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-emerald-glow"
              >
                打开 {activeFw.name} 示例
              </a>
              <div className="cli-capsule">
                <span className="cli-prompt">$</span>
                <span>{activeFw.install}</span>
                <button
                  type="button"
                  className="copy-mini-btn"
                  onClick={handleCopy}
                >
                  {copied ? "已复制" : "复制"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="workbench-stage">
          <div className="console-pod">
            <div className="console-header">
              <div className="console-meta">
                <span className="console-title-text">试用</span>
              </div>

              <div className="console-search-shell">
                <input
                  type="text"
                  placeholder="过滤节点"
                  className="console-search-input"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
              </div>

              <div className="console-mode-switch">
                <button
                  type="button"
                  className={`console-btn ${
                    !isStressMode ? "btn-active-emerald" : ""
                  }`}
                  onClick={() => {
                    setIsStressMode(false);
                    setLastAction("35 节点");
                    setLastLatency(null);
                  }}
                >
                  35 节点
                </button>
                <button
                  type="button"
                  className={`console-btn ${
                    isStressMode ? "btn-active-emerald" : ""
                  }`}
                  onClick={() => {
                    setIsStressMode(true);
                    setLastAction("10 万节点");
                    setLastLatency(null);
                  }}
                >
                  10 万节点
                </button>
              </div>
            </div>

            <div className="console-controls-strip">
              <div className="console-action-btns">
                <button
                  type="button"
                  className="console-btn"
                  onClick={() => handleCheckAll(true)}
                >
                  全选
                </button>
                <button
                  type="button"
                  className="console-btn"
                  onClick={() => handleCheckAll(false)}
                >
                  清空
                </button>
              </div>

              <div className="console-toggles-row">
                <label className="console-check-label">
                  <input
                    type="checkbox"
                    checked={checkable}
                    onChange={(e) => setCheckable(e.target.checked)}
                  />
                  <span>复选框</span>
                </label>
                <label className="console-check-label">
                  <input
                    type="checkbox"
                    checked={draggable}
                    onChange={(e) => setDraggable(e.target.checked)}
                  />
                  <span>拖拽</span>
                </label>
                <label className="console-check-label">
                  <input
                    type="checkbox"
                    checked={showLine}
                    onChange={(e) => setShowLine(e.target.checked)}
                  />
                  <span>连线</span>
                </label>
                <label className="console-check-label">
                  <input
                    type="checkbox"
                    checked={checkStrictly}
                    onChange={(e) => setCheckStrictly(e.target.checked)}
                  />
                  <span>独立勾选</span>
                </label>
              </div>
            </div>

            <div className="console-viewport">
              <YTree
                ref={treeRef}
                datasource={isStressMode ? largeData : SAMPLE_TREE}
                height={380}
                checkable={checkable}
                draggable={draggable}
                showLine={showLine}
                checkStrictly={checkStrictly}
                searchValue={searchVal}
                expandAll={!isStressMode}
                onCheckedChange={() => {
                  setLastAction("勾选变更");
                  setLastLatency(null);
                }}
                onNodeChange={(e) => {
                  setLastAction(
                    `拖拽 ${e.sourceId} → ${e.targetId} (${e.position})`,
                  );
                  setLastLatency(null);
                }}
              />
            </div>

            <div className="console-statusbar">
              <span className="status-metric-item">
                <span>规模</span>
                <strong>{isStressMode ? "100,000" : "35"}</strong>
              </span>
              <span className="status-metric-item">
                <span>操作</span>
                <strong>{lastAction}</strong>
              </span>
              {lastLatency !== null && (
                <span className="status-metric-item">
                  <span>耗时</span>
                  <strong>{lastLatency} ms</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
