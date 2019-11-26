m = require 'mithril'
import a from './a'

state =
  appendActive:(items)->
    current = m.route.get()
    for item in items
      if item.a?.href is current
        if item.class
          item.class = item.class + ' active'
        else
          item.class = 'active'

module.exports =
  view:(vnode)->
    state.appendActive vnode.children
    m 'ul',{
      class:vnode.attrs.class
    },vnode.children.map (item)->
      return unless item.a
      m 'li',{
        class:item.class
        click:item.click
      },m a,item.a,item.children
