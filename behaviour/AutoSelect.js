//自动选中
import m from "mithril";

// 使用mithril路由判断选中
export var AutoSelectByRoute = (route, button) => {
  button.element = m.route.Link;
  button.selected = route === button.url.href;
  return button;
};

// 使用普通链接判断选中
export var AutoSelectByHref = (button) => {
  button.selected = location.href === button.url.href;
  return button;
};
