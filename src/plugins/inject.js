/*
 * @Author: zhizhuo 
 * @Date: 2023-01-16 16:15:08 
 * @Last Modified by: zhizhuo
 * @Last Modified time: 2023-01-25 15:03:26
 */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */


// const getcookie = require('./comment/main')
console.log("This is injected into start")
// 发送消息
chrome.runtime.sendMessage({ cmd: "inject" }, function (response) { console.log('response', response); });//测试前台掉后台
//监听消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request)
  console.log(sender)
  sendResponse("OK")
});

console.log("This is injected into end")
