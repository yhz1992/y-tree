import type { App } from 'vue';
import YTreeComponent from './y-tree.component.vue';

export default {
	install(app: App) {
		app.component('y-tree', YTreeComponent);
		return app;
	}
};
