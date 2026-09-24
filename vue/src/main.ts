import { createApp } from 'vue';

import App from './App.vue';
import YTreeModule from './components/y-tree/y-tree.module';
import './assets/main.css';

const app = createApp(App);

app.use(YTreeModule);

app.mount('#app');
