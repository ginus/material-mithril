m = require 'mithril'

export class A
  view:({attrs,children})->
    if attrs.href
      m m.route.Link,attrs,children
    else
      m 'a',attrs,children
