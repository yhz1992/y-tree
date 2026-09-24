export interface FrameworkItem {
  id: "react" | "vue" | "angular";
  name: string;
  version: string;
  badge: string;
  desc: string;
  install: string;
  defaultPort: number;
  devUrl: string;
  accentColor: string;
  iconBg: string;
}

export const FRAMEWORKS: FrameworkItem[] = [
  {
    id: "react",
    name: "React",
    version: "v18+",
    badge: "npm i y-tree-react",
    desc: "JSX 直接接入。勾选、拖拽、搜索和自定义节点都有现成写法。",
    install: "npm i y-tree-react",
    defaultPort: 5174,
    devUrl: "http://localhost:5174",
    accentColor: "#0ea5e9",
    iconBg: "rgba(14, 165, 233, 0.1)",
  },
  {
    id: "vue",
    name: "Vue 3",
    version: "v3.2+",
    badge: "npm i y-tree-vue",
    desc: "按 Vue 3 组件来用。支持 v-model，节点内容可用插槽自定义。",
    install: "npm i y-tree-vue",
    defaultPort: 5175,
    devUrl: "http://localhost:5175",
    accentColor: "#10b981",
    iconBg: "rgba(16, 185, 129, 0.1)",
  },
  {
    id: "angular",
    name: "Angular",
    version: "v15+",
    badge: "npm i y-tree",
    desc: "按 Angular 组件来用。模板插槽可扩展节点内容。",
    install: "npm i y-tree",
    defaultPort: 4200,
    devUrl: "http://localhost:4200",
    accentColor: "#ef4444",
    iconBg: "rgba(239, 68, 68, 0.1)",
  },
];

export interface DemoCategory {
  id: string;
  title: string;
  badge: string;
  desc: string;
  count: number;
  items: {
    id: string;
    title: string;
    tag: string;
  }[];
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  {
    id: "basic",
    title: "基础展示与交互",
    badge: "4 个示例",
    desc: "数据源嵌套与扁平双模式、层级连线、尺寸模式与初始全部展开。",
    count: 4,
    items: [
      { id: "demo-basic-nested", title: "嵌套数据源", tag: "children" },
      { id: "demo-basic-flat", title: "扁平数据源", tag: "pId" },
      { id: "demo-basic-line", title: "层级连线", tag: "showLine" },
      { id: "demo-basic-expand-all", title: "初始全展开", tag: "expandAll" },
    ],
  },
  {
    id: "state",
    title: "节点状态管理",
    badge: "7 个示例",
    desc: "复选框勾选、半选联动、单选互斥、文本选中与节点禁用/隐藏。",
    count: 7,
    items: [
      { id: "demo-state-checkable", title: "复选框基础", tag: "checkable" },
      { id: "demo-state-strict", title: "严格独立勾选", tag: "checkStrictly" },
      { id: "demo-state-selected", title: "文本选中控制", tag: "selected" },
      { id: "demo-state-disabled", title: "节点完全禁用", tag: "disabled" },
      {
        id: "demo-state-chk-disabled",
        title: "仅禁用勾选框",
        tag: "checkboxDisabled",
      },
      { id: "demo-state-nocheck", title: "部分无勾选框", tag: "nocheck" },
      { id: "demo-state-hide", title: "动态节点隐藏", tag: "hide" },
    ],
  },
  {
    id: "interaction",
    title: "数据与过滤检索",
    badge: "2 个示例",
    desc: "实时关键词检索过滤、关键字高亮匹配与动态数据更新响应。",
    count: 2,
    items: [
      { id: "demo-filter-search", title: "搜索与高亮", tag: "filter" },
      { id: "demo-data-dynamic", title: "动态数据源切换", tag: "reactive" },
    ],
  },
  {
    id: "async",
    title: "异步加载",
    badge: "5 个示例",
    desc: "懒加载模式、旋转加载动画、根节点异步、子节点动态刷新及拦截器。",
    count: 5,
    items: [
      { id: "demo-async-basic", title: "首次展开懒加载", tag: "loadData" },
      { id: "demo-async-loading", title: "加载状态与动画", tag: "isAjaxing" },
      { id: "demo-async-refresh", title: "程序化刷新子节点", tag: "reAsync" },
      { id: "demo-async-root", title: "空数据根节点异步", tag: "rootAsync" },
      { id: "demo-async-before", title: "异步加载拦截", tag: "beforeAsync" },
    ],
  },
  {
    id: "check",
    title: "勾选增强",
    badge: "5 个示例",
    desc: "Radio 单选模式（整树/层级互斥）、全选/全不选、勾选差异对比与方向控制。",
    count: 5,
    items: [
      {
        id: "demo-check-radio-all",
        title: "单选：整树互斥",
        tag: "radio: all",
      },
      {
        id: "demo-check-radio-level",
        title: "单选：同级互斥",
        tag: "radio: level",
      },
      { id: "demo-check-all-cancel", title: "一键全选与反选", tag: "checkAll" },
      { id: "demo-check-diff", title: "勾选变更差异捕获", tag: "getChange" },
      {
        id: "demo-check-direction",
        title: "自定义联动方向",
        tag: "chkboxType",
      },
    ],
  },
  {
    id: "view",
    title: "展示增强",
    badge: "6 个示例",
    desc: "自定义图标/皮肤、动态字体样式、Hover Title、双击展开与平滑过渡动画。",
    count: 6,
    items: [
      { id: "demo-view-icon-custom", title: "自定义节点图标", tag: "iconSkin" },
      { id: "demo-view-font-css", title: "高亮字体样式", tag: "fontCss" },
      { id: "demo-view-title", title: "悬停 Title 提示", tag: "title" },
      { id: "demo-view-dblclick", title: "双击触发展开", tag: "dblClick" },
      { id: "demo-view-speed", title: "平滑过渡速度", tag: "expandSpeed" },
      {
        id: "demo-view-multi-select",
        title: "Ctrl 多选聚焦",
        tag: "selectedMulti",
      },
    ],
  },
  {
    id: "edit",
    title: "节点编辑",
    badge: "5 个示例",
    desc: "双击行内快速重命名、任意位置新增子节点、气泡删除确认及自定义操作条。",
    count: 5,
    items: [
      { id: "demo-edit-rename", title: "双击行内重命名", tag: "rename" },
      { id: "demo-edit-add", title: "新增子节点", tag: "addNode" },
      { id: "demo-edit-remove", title: "气泡确认删除", tag: "removeNode" },
      { id: "demo-edit-hover-actions", title: "悬停操作栏", tag: "actions" },
      { id: "demo-edit-custom-slot", title: "自定义 DOM 插槽", tag: "slot" },
    ],
  },
  {
    id: "drag",
    title: "拖拽与复制",
    badge: "5 个示例",
    desc: "HTML5 原生拖拽移动（前/后/内）、按键拖拽复制、防环限制、回调守卫与 API。",
    count: 5,
    items: [
      { id: "demo-drag-move", title: "三落点自由拖拽", tag: "isMove" },
      { id: "demo-drag-copy", title: "Ctrl/Cmd 拖拽复制", tag: "isCopy" },
      { id: "demo-drag-guard", title: "节点拖拽权限守卫", tag: "allowDrop" },
      { id: "demo-drag-events", title: "全生命周期拖拽回调", tag: "onDrop" },
      {
        id: "demo-drag-programmatic",
        title: "程序化移动/克隆",
        tag: "moveNode",
      },
    ],
  },
  {
    id: "perf",
    title: "大规模渲染",
    badge: "1 个示例",
    desc: "十万节点也能打开，滚动时只画看得见的行。",
    count: 1,
    items: [
      {
        id: "demo-perf-virtual",
        title: "十万节点滚动",
        tag: "virtual",
      },
    ],
  },
];

export const CODE_SAMPLES = {
  react: `import { useState } from 'react';
import { YTree } from 'y-tree-react';
import 'y-tree-react/style.css';

export default function App() {
  const [data] = useState([
    { id: '1', name: '研发总部', children: [
      { id: '1-1', name: '前端架构组', checked: true },
      { id: '1-2', name: '核心算法组' }
    ]},
    { id: '2', name: '产品运营中心', children: [
      { id: '2-1', name: '体验设计实验室' }
    ]}
  ]);

  return (
    <div style={{ height: 400 }}>
      <YTree
        datasource={data}
        checkable
        draggable
        expandAll
        showLine
        onNodeChange={(e) => console.log('拖拽变更:', e)}
      />
    </div>
  );
}`,
  vue: `<template>
  <div style="height: 400px">
    <y-tree
      :datasource="treeData"
      checkable
      draggable
      expandAll
      showLine
      @nodeChange="handleNodeChange"
    >
      <!-- 自定义节点后置操作 -->
      <template #nodeExtra="{ node }">
        <span class="badge">{{ node.name.length }}</span>
      </template>
    </y-tree>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { YTree } from 'y-tree-vue';
import 'y-tree-vue/style.css';

const treeData = ref([
  { id: '1', name: '研发总部', children: [
    { id: '1-1', name: '前端架构组', checked: true },
    { id: '1-2', name: '核心算法组' }
  ]}
]);

const handleNodeChange = (event: any) => {
  console.log('节点移动:', event);
};
</script>`,
  angular: `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <div style="height: 400px">
      <y-tree
        [datasource]="data"
        [checkable]="true"
        [draggable]="true"
        [expandAll]="true"
        [showLine]="true"
        (nodeChange)="onNodeChange($event)">
      </y-tree>
    </div>
  \`
})
export class AppComponent {
  data = [
    { id: '1', name: '研发总部', children: [
      { id: '1-1', name: '前端架构组', checked: true },
      { id: '1-2', name: '核心算法组' }
    ]}
  ];

  onNodeChange(event: any) {
    console.log('节点变更:', event);
  }
}`,
};
