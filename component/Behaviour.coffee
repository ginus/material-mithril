#扩展组件行为
import m from 'mithril'

# 自动选中
# 使用mithril路由判断选中
export AutoSelectByRoute = (route, button)->
  button.element = m.route.Link
  button.selected = (route == button.url.href)
  return button

# 使用普通链接判断选中
export AutoSelectByHref = (button)->
  button.selected = (location.href == button.url.href)
  return button