import m from 'mithril'
import {a} from './index'

appendActive=(items)->
  current = m.route.get()
  for item in items
    if item.a?.href is current
      if item.class
        item.class = item.class + ' active'
      else
        item.class = 'active'

module.exports =
  view:({attrs,children})->
    appendActive children
    m 'ul',{
      class:attrs.class
    },children.map (item)->
      return unless item.a
      m 'li',{
        class:item.class
        click:item.click
      },m a,item.a,item.children
