#svg icon
import m from 'mithril'

export default
  view:({children})->
    children = [children] if typeof children is 'string'
    path = children.map (child)->
      m 'path',{d:child}
    m 'svg',{
      rotate:90
    },path

