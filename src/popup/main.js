/* eslint-disable no-undef */
import { createApp } from 'vue'
import App from './components/App.vue'
//引入第三方组件
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
//引入axios
import axios from '../plugins/axios'

const app = createApp(App)

app.use(Antd).use(axios)

app.mount('#app')


//监听消息事件
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request)
  console.log(sender)
  sendResponse("OK")
});

chrome.runtime.sendMessage(
  { cmd: 'popup', click: "do" },
  function (response) {
    console.log(response)
  }
)

