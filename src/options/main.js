import { createApp } from 'vue'
import App from './components/App.vue'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App)

app.use(Antd)

app.mount('#app')
