/**
 * 获取令牌
 * @return {string} 令牌
 */
export let getToken = () => {
  let remembered = localStorage.getItem("auth_token_remembered");
  if (remembered) return localStorage.getItem("auth_token");
  return sessionStorage.getItem("auth_token");
};
/**
 * 保存登录令牌
 * @param {string} value 值
 * @param {boolean} remember 是否记住
 */
export let setToken = (value, remember) => {
  if (remember) {
    localStorage.setItem("auth_token_remembered", true);
    localStorage.setItem("auth_token", value);
    sessionStorage.removeItem("auth_token");
  } else {
    localStorage.setItem("auth_token_remembered", false);
    localStorage.removeItem("auth_token");
    sessionStorage.setItem("auth_token", value);
  }
};
