# y-tree 组件库 TODOLIST

> 维护说明：已完成项保持 `[x]`，未完成项 `[ ]`，每完成一项及时勾选。

---

## 一、功能补齐清单（按优先级）

### P0 · 假能力清理（必须先处理）

- [x] **落实 `draggable` 实现真实拖拽** ✅（2026-08 完成）：三框架均实现 HTML5 原生拖拽（prev/next/inner 三落点、落点高亮、`moveNode` 服务层、`onNodeChange` 回调、拖到自身/子孙拦截、disabled 节点拦截）；30 个单元用例 + 三框架浏览器实测全部通过

### P1 · 编辑能力

- [x] **节点重命名** ✅（2026-08 完成）：双击标题/笔按钮进入行内编辑，Enter 提交 / Esc 取消 / blur 提交，`beforeEditName`/`beforeRename`/`onRename` 回调
- [x] **节点删除** ✅：垃圾桶按钮 + 行内确认气泡（含"确认删除/取消"），`beforeRemove`/`onRemove` 回调
- [x] **节点新增** ✅：加号按钮（所有节点含叶子）追加子节点到末尾，服务层 `addNode(parentId, data, index?)` 支持位置下标，`beforeAdd`/`onAdd` 回调
- [x] **hover 操作按钮 + 自定义 DOM** ✅：hover 显示 笔/加号/垃圾桶 三按钮；`renderNodeExtra`（React）/ `#nodeExtra` 插槽（Vue）/ `ng-template#nodeExtra`（Angular）

### P2 · 拖拽能力

- [x] **拖拽移动** ✅：`isMove`，支持 prev / next / inner 三种落点（已实现，含落点高亮）
- [x] **拖拽复制** ✅（2026-08 完成）：`isCopy` + Ctrl/Meta 键拖拽时 `copyNode` 深拷贝整棵子树（含 id 重映射、父子关系重建、勾选状态保留）
- [x] **基础拖拽限制** ✅：disabled 节点不可拖/不可作为目标、拖到自身/子孙的拦截（已实现）；`allowDrag`/`allowDrop` 按节点精细控制（2026-08 完成）；`minMoveSize` 最小拖拽距离（2026-08 完成）
- [x] **拖拽回调** ✅（2026-08 完成）：`beforeDrag`（返回 false 取消拖拽）、`beforeDrop`（返回 false 取消落点）、`onDrag`（dragstart 时）、`onDragMove`（dragover 时，含 sourceId/targetId/position/isCopy）、`onDrop`（drop 后，含 moveType: "move"|"copy"）
- [x] **拖拽 API** ✅（2026-08 完成）：`moveNode`/`copyNode` 通过 ref 暴露，支持程序化调用

> 设计建议：编辑 + 拖拽共用一套「节点变更」服务层逻辑（common/service.ts），一次设计三框架复用

### P3 · 异步加载

- [x] **懒加载模式** ✅（2026-09 完成）：`lazy: true` + `loadData(node)` 在节点首次展开时触发，数据上用 `isParent: true` 标记「有子节点但未加载」；加载完成后自动展开。服务层 `hasChildren()` / `isLazyParent()` / `setNodeChildren()`（复用 `addNode` 的增量勾选传播，支持嵌套 `children` 递归展开）
- [x] **加载中状态** ✅：`node.isAjaxing` 标记 + 共享样式 `.y-tree-switcher-icon.is-ajaxing`（旋转 loading 图标，`@keyframes y-tree-ajaxing-spin`）；加载中重复点击不重复发起请求
- [x] **异步回调** ✅：`beforeAsync`（返回 false 取消本次加载）、`onAsyncSuccess`（含 `children` 数据）、`onAsyncError`（含 `error`）；失败时节点保持收起、箭头复位可重试
- [x] **刷新子节点** ✅：`reAsyncChildNodes(id)` 经 ref / 实例暴露，返回 `Promise<boolean>`，原有子树被整体替换
- [x] **根节点异步** ✅：datasource 为空时组件自动加载根节点，`loadData` 收到 id 为 `__yt_root__` 的虚拟根节点（`YTreeService.createLazyRootNode()`）
- 验证：`node --experimental-strip-types scripts/verify-lazy-load.ts`（54 断言：标记判定 / 替换与追加 / 嵌套展开 / 空加载归一化为叶子 / 加载后勾选联动与全量重建一致 / 逐级加载 / 一万节点分批评加载）

### P4 · 勾选增强

- [x] **radio 单选模式** ✅（2026-09 完成）：`chkStyle: 'radio'` + `radioType`（`all` 整树互斥 / `level` 同级兄弟互斥）；radio 不联动子孙，避免破坏互斥
- [x] **全选/全不选** ✅：`checkAllNodes(checked)` / `cancelAllNodes()`；radio 模式下全选返回 false
- [x] **勾选变化列表** ✅：`getChangeCheckedNodes()` 对比 init 时快照，返回勾选状态发生变化的节点
- [x] **程序化勾选 API** ✅：`checkNode(id, checked, linkage?)` 走 API 通道，可改 disabled 节点
- [x] **联动方向配置** ✅：`chkboxType { Y, N }`（`p`=祖先、`s`=子孙）；`checkStrictly` 映射为 `{ Y: "", N: "" }`
- 验证：`node --experimental-strip-types scripts/verify-check-enhance.ts`（39 断言）+ 增量勾选回归全通过 + 三框架浏览器实测

### P5 · 展示增强

- [x] **节点自定义图标** ✅（2026-09 完成）：`icon`/`iconOpen`/`iconClose`/`iconSkin`（文件夹/文档语义）；`showIcon` 控制显隐；未指定时父节点文件夹、叶子文档
- [x] **节点自定义字体样式** ✅：`fontCss`（对象或按节点函数，用于高亮/标记）
- [x] **title 提示** ✅：节点 `title` 透传悬停提示，缺省回退 `name`；`showTitle=false` 关闭
- [x] **双击展开** ✅：`dblClickExpand` 默认 true；开启编辑时双击优先进入重命名
- [x] **展开动画** ✅：`expandSpeed`（fast=200 / slow=400 / 数字毫秒 / 0 关闭，默认关闭以免虚拟滚动抖动）
- [x] **多选文本选中** ✅：`selectedMulti` 控制 Ctrl/Cmd 追加；组件内部维护选中，ref 暴露 `selectNode`/`cancelSelectedNode`/`getSelectedNodes`
- 验证：`node --experimental-strip-types scripts/verify-view-enhance.ts`（42 断言）+ 三框架浏览器实测（2026-09）

### P6 · 节点查询与操作 API（ref 补齐）

- [x] **批量查询**：`getNodesByParam`/`getNodesByParamFuzzy`/`getNodeIndex`/`getNodes`
- [x] **结构转换**：`transformToArray`/`transformToTreeNodes`（嵌套 ↔ 扁平互转）
- [x] **节点更新**：`updateNode`（数据热更新后刷新视图）
- [x] **精确展开控制**：`expandNode(id, expand)`/`expandCollapseParentNode`
- [x] **选中控制** ✅（随 P5 落地）：`selectNode`/`cancelSelectedNode`/`getSelectedNodes`
- [x] **before\* 拦截回调**：`beforeClick`/`beforeExpand`/`beforeCollapse`/`beforeCheck`（返回 false 取消操作，权限控制场景）

### P7 · 性能与体验（y-tree 差异化优势，保持领先）

- [x] 虚拟滚动（10 万节点毫秒级渲染）✅ 已完成
- [x] 大数据模式下拖拽/编辑的增量更新性能验证（避免全量重建）

---

## 二、npm 发布流程待办

- [ ] **`git init` + 建立 `main` 分支**：changesets 依赖 git 检测变更，当前仓库未初始化
- [ ] 首次发布前确认包名占用：`y-tree` / `y-tree-react` / `y-tree-vue`
- [ ] `npx changeset` 记录首个版本变更
- [ ] 三包 `npm publish` 发布（Angular 在 `dist/y-tree` 目录下发布）
- [ ] 发布后 smoke test：临时项目安装三包验证渲染
- [ ] 补充 README：使用文档（props/事件/ref API/样式引入方式）

---

## 三、已完成里程碑

- [x] 三框架组件核心：渲染、展开/折叠、勾选（联动+半选+严格模式）、选中、禁用、隐藏、搜索过滤、连线、大小模式
- [x] 共享服务层 `common/service.ts`（嵌套/扁平双模式、勾选状态机、汇总）
- [x] 共享样式 `common/style/base.css`（唯一权威源）+ Angular 自动同步脚本
- [x] npm 包发布配置：React/Vue Vite lib mode（产物自包含、类型内联）、Angular ng-packagr
- [x] changesets 版本管理配置（待 git init 后启用）
- [x] **三框架 demo 站点重构（2026-09）**：按功能点拆分为 **40 个独立示例**（每个功能点一个 demo，只演示该功能点），左侧分组菜单 + 锚点平滑滚动 + 滚动高亮当前项 + 每例「显示代码」展开区；三框架结构完全对齐
  - 分组：基础（4）/ 节点状态（7）/ 数据与交互（2）/ 异步加载 P3（5）/ 勾选增强 P4（5）/ 展示增强 P5（6）/ 查询与操作 P6（5）/ 编辑 P1（5）/ 拖拽 P2（5）/ 性能 P7（1）
  - React：`react/src/demo/`（`registry.tsx` 携带元数据 + 渲染函数，`demos/*.tsx` 按分组建文件）
  - Vue：`vue/src/demo/`（`registry.ts` 存元数据，`groups/*.vue` 用 `v-bind="demoMeta('id')"` + slot 实现）
  - Angular：`angular/src/app/demo/`（`registry.ts` 存元数据，`groups/*.component.ts` 用 `[meta]` 输入 + `ng-content`）

---

## 四、补齐建议顺序

1. P0：处理 `draggable` 假能力
2. P1 + P2：编辑 + 拖拽（共用节点变更服务层，一次设计三框架复用）
3. P3：异步加载
4. P4 → P5 → P6：勾选增强 → 展示增强 → API 补齐
5. 穿插推进发布流程待办
