import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

// y-tree-vue 库构建（npm 发布用）
// 关键点：
// - common/service.ts、common/model.ts 不 external，Vite 自动打进产物
// - vite-plugin-dts 的 rollupTypes 把 common 类型合并进单一 d.ts，消除跨目录相对路径
// - .vue 组件里的样式 @import base.css 在构建时被解析合并，产物自包含
export default defineConfig({
	plugins: [
		vue(),
		dts({
			include: ['src/components/y-tree', '../common'],
			rollupTypes: true,
			tsconfigPath: './tsconfig.lib.json'
		})
	],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/components/y-tree/index.ts'),
			name: 'YTreeVue',
			formats: ['es', 'umd'],
			fileName: format => `y-tree-vue.${format === 'es' ? 'mjs' : 'cjs'}`
		},
		rollupOptions: {
			// vue 不进产物，走使用方的 peerDependencies
			external: ['vue'],
			output: {
				globals: { vue: 'Vue' }
			}
		}
	}
});
