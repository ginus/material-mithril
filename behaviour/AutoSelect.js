import m from "mithril";
/**
 * 使用mithril路由判断选中
 * @param {string} route mithril路由
 * @param {object} button 菜单项按钮参数
 * @returns object
 */
export let AutoSelectByRoute = (route, button) => {
  button.element = m.route.Link;
  button.selected = route === button.url.href;
  return button;
};
/**
 * 使用普通链接判断选中
 * @param {object} button 菜单项按钮参数
 */
export let AutoSelectByHref = (button) => {
  button.selected = location.href === button.url.href;
  return button;
};
