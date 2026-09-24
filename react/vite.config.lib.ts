import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// y-tree-react 库构建（npm 发布用）
// 关键点：
// - common/service.ts、common/model.ts 不 external，Vite 自动打进产物
// - vite-plugin-dts 的 rollupTypes 把 common 类型合并进单一 d.ts，消除跨目录相对路径
// - 组件 CSS 里的 @import base.css 在构建时被解析合并，产物自包含
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/components/y-tree", "../common"],
      rollupTypes: true,
      tsconfigPath: "./tsconfig.json",
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/components/y-tree/index.ts"),
      name: "YTreeReact",
      formats: ["es", "umd"],
      fileName: (format) => `y-tree-react.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      // react 不进产物，走使用方的 peerDependencies
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
    },
  },
});
