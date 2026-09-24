// 构建前把 common/style/base.css 同步为 Angular 库内的 base.scss（CSS 即合法 SCSS）
// 用法：node scripts/sync-styles.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "common/style/base.css");
const dest = resolve(
  root,
  "angular/projects/y-tree/src/common/style/base.scss",
);

const css = readFileSync(src, "utf8");
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, css);
console.log(
  `✔ synced: common/style/base.css -> angular/projects/y-tree/src/common/style/base.scss`,
);
