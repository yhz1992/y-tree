import type { ReactNode } from "react";

/** 单个功能点 demo 的元信息 */
export interface DemoMeta {
  /** 锚点 id（全局唯一） */
  id: string;
  /** 功能点标题 */
  title: string;
  /** 一句话说明 */
  desc: string;
  /** 核心用法代码，用于「显示代码」 */
  code: string;
  /** 实例渲染函数 */
  render: () => ReactNode;
}

/** 功能分组 */
export interface DemoGroup {
  id: string;
  title: string;
  demos: Array<DemoMeta>;
}
