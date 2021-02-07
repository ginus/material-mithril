import { indexOf } from "lodash";
/**
 * 保存授权项
 * @param {string} key 键
 * @param {string} value 值
 * @param {boolean} remember 是否记住
 */
export let setItem = (key, value, remember) => {
  if (remember) {
    localStorage.setItem("auth_remembered", true);
    localStorage.setItem(key, value);
    sessionStorage.removeItem(key);
  } else {
    localStorage.setItem("auth_remembered", false);
    localStorage.removeItem(key);
    sessionStorage.setItem(key, value);
  }
}
/**
 * 读取是否记住
 * @return {boolean} 是否记住
 */
export let isRemembered = () => Boolean(localStorage.getItem("auth_remembered"));
/**
 * 读取授权项
 * @param {string} key 键
 */
export let getItem = (key) => {
  let storage = (isRemembered()) ? localStorage : sessionStorage;
  return storage.getItem(key);
}
/**
 * 获取令牌
 * @return {string} 令牌
 */
export let getToken = () => getItem("auth_token");
/**
 * 保存令牌
 * @param {string} token 令牌
 * @param {boolean} remember 是否记住
 */
export let setToken = (token, remember) => setItem("auth_token", token, remember);
/**
 * 删除令牌
 */
export let delToken = () => setToken('', isRemembered());
/**
 * 获取用户名
 * @return {string} 用户名
 */
export let getUserName = () => getItem("auth_name");
/**
 * 保存用户名
 * @param {string} name 用户名
 * @param {boolean} remember 是否记住
 */
export let setUserName = (name, remember) => setItem("auth_name", name, remember);
/**
 * 删除用户名
 */
export let delUserName = () => setUserName('', isRemembered());
/**
 * 获取角色
 * @return {[string]} 角色
 */
export let getUserRole = () => JSON.parse(getItem("auth_role"));
/**
 * 是否拥有角色
 * @param {string} role 角色
 * @return {boolean} 是否拥有
 */
export let hasUserRole = (role) => indexOf(getUserRole(), role) >= 0;
/**
 * 保存角色
 * @param {[string]} roleArray 角色数组
 * @param {boolean} remember 是否记住
 */
export let setUserRole = (roleArray, remember) => setItem("auth_role", JSON.stringify(roleArray), remember);
/**
 * 删除角色
 */
export let delUserRole = () => setUserRole([], isRemembered());