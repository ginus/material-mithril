import m from 'mithril'
{A}  = require './index'

appendActive=(items)->
  current = m.route.get()
  for item in items
    if item.a?.href is current
      if item.class
        item.class = item.class + ' active'
      else
        item.class = 'active'

export class Menu
  view:({attrs,children})->
    appendActive children
    m 'ul',{
      class:attrs.class
    },children.map (item)->
      return unless item.a
      m 'li',{
        class:item.class
        click:item.click
      }, m A, item.a, item.children
