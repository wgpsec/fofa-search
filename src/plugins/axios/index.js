/*
 * @Author: zhizhuo 
 * @Date: 2023-01-22 15:18:56 
 * @Last Modified by: zhizhuo
 * @Last Modified time: 2023-02-02 13:40:56
 */

/**axios封装
 * 请求拦截、相应拦截、错误统一处理
 */
import axios from 'axios';
import Cookies from "js-cookie";
//qs.stringify()是将对象 序列化成URL的形式，以&进行拼接
// axios.defaults.baseURL = 'https://fofa.info/'


axios.defaults.withCredentials = true;//携带cookie

axios.interceptors.request.use( //响应拦截
    async config => {
        // 每次发送请求之前判断vuex中是否存在token        
        // 如果存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况
        // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断 
        config.headers.authorization = Cookies.get('token') || 'Bearer '+sessionStorage.getItem('Token')
        return config;
    },
    error => {
        return Promise.error(error);
    })
// 响应拦截器
axios.interceptors.response.use(

    response => {
        if (response.status === 200) {
            return Promise.resolve(response); //进行中        
        } else {
            return Promise.reject(response); //失败       
        }
    },
    // 服务器状态码不是200的情况    
    error => {
        if (error.response.status) {
            switch (error.response.status) {
                // 401: 未登录                
                // 未登录则跳转登录页面，并携带当前页面的路径                
                // 在登录成功后返回当前页面，这一步需要在登录页操作。                
                case 401:
                    window.location.href = "https://fofa.info/f_login"
                    break            
                // 跳转登录页面                
                case 403:
                    window.location.href = "https://fofa.info/f_login"
                    break
                // 404请求不存在                
                case 404:
                    break;
                // 其他错误，直接抛出错误提示                
                default:

            }
            return Promise.reject(error.response);
        }
    }
);
/** 
 * get方法，对应get请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
const $get = (url, params) => {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params: params,
        })
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject(err.data)
            })
    });
}
/** 
 * post方法，对应post请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
const $post = (url, params) => {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-undef
        axios.post(url, qs.stringify(params)) //是将对象 序列化成URL的形式，以&进行拼接   
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject(err.data)
            })
    });
}

export default {
    install: (app) => {
        app.config.globalProperties['$get'] = $get;
        app.config.globalProperties['$post'] = $post;
        app.config.globalProperties['$axios'] = axios;
    }
}