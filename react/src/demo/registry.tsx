import type { DemoGroup } from "./types";
import { docsDemos } from "./demos/docs";
import { basicDemos } from "./demos/basic";
import { stateDemos } from "./demos/state";
import { interactionDemos } from "./demos/interaction";
import { asyncDemos } from "./demos/async";
import { checkDemos } from "./demos/check";
import { viewDemos } from "./demos/view";
import { editDemos } from "./demos/edit";
import { dragDemos } from "./demos/drag";
import { perfDemos } from "./demos/perf";
import { apiDemos } from "./demos/api";

/**
 * 全量 demo 分组清单：一个功能点一张卡片，按能力域分组
 */
export const demoGroups: Array<DemoGroup> = [
  { id: "group-api-docs", title: "API 参考", demos: docsDemos },
  { id: "group-basic", title: "基础", demos: basicDemos },
  { id: "group-state", title: "节点状态", demos: stateDemos },
  { id: "group-interaction", title: "数据与交互", demos: interactionDemos },
  { id: "group-async", title: "异步加载 · P3", demos: asyncDemos },
  { id: "group-check", title: "勾选增强 · P4", demos: checkDemos },
  { id: "group-view", title: "展示增强 · P5", demos: viewDemos },
  { id: "group-api", title: "查询与操作 · P6", demos: apiDemos },
  { id: "group-edit", title: "编辑 · P1", demos: editDemos },
  { id: "group-drag", title: "拖拽 · P2", demos: dragDemos },
  { id: "group-perf", title: "性能 · P7", demos: perfDemos },
];
