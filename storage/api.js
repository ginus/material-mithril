import { request } from 'mithril';
import { getToken } from './token';

let apiHost = localStorage.getItem("apiHost");
export let hostUrl = (path) => {
  return apiHost + path;
};
/**
 * 构造操作服务端文档的API
 * @param {object} options url为必须的，可传入host
 */
export let DocApi = (options) => {
  if (apiHost == undefined) apiHost = options.host || '';
  if (options.url == undefined) throw new Error("url是必须的");
  return {
    /**
     * 获取列表
     * @param {object} params query参数，具体数据结构参考服务端api文档
     */
    getList: (params) => {
      return request({
        method: "get",
        url: hostUrl(options.url),
        headers: {
          token: getToken(),
        },
        params,
      });
    },
    /**
     * 获取文档
     * @param {string} id 文档ID
     */
    get: (id) => {
      return request({
        method: "get",
        url: hostUrl(options.url + "/:id"),
        headers: {
          token: getToken(),
        },
        params: {
          id,
        },
      });
    },
    /**
     * 创建文档
     * @param {object} body 用于创建文档的数据
     */
    post: (body) => {
      return request({
        method: "post",
        url: hostUrl(options.url),
        headers: {
          token: getToken(),
        },
        body,
      });
    },
    /**
     * 更新文档
     * @param {*} id 文档ID
     * @param {*} body 新数据
     */
    put: (id, body) => {
      return request({
        method: "put",
        url: hostUrl(options.url + "/:id"),
        headers: {
          token: getToken(),
        },
        params: {
          id,
        },
        body,
      });
    },
  }
}

// export let Get = (url, params) => {
//   return request({
//     method: 'get',
//     url: hostUrl(url),
//     headers: {
//       token: getToken(),
//     },
//     params,
//   })
// }

// export let Post = (url, body) => {
//   return request({
//     method: "post",
//     url: hostUrl(url),
//     headers: {
//       token: getToken(),
//     },
//     body,
//   })
// }