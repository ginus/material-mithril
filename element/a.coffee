import m from 'mithril'

export default
  view:(vnode)->
    if vnode.attrs.href
      m m.route.Link,vnode.attrs,vnode.children
    else
      m 'a',vnode.attrs,vnode.children
