m = require 'mithril'

module.exports = class
  view:(vnode)->
    m '.metric',[
      m '.title',vnode.attrs.title
      m '.value',vnode.attrs.value
    ]
