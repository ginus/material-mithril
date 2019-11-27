import m from 'mithril'

export default
  view:({attrs,children})->
    if attrs.href
      m m.route.Link,attrs,children
    else
      m 'a',attrs,children
