import m from 'mithril'

module.exports = class
  view:(vnode)->
    m 'i.material-icons',{class:vnode.attrs.class},vnode.children
