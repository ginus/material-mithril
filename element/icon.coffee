import m from 'mithril'

export default
  view:(vnode)->
    m 'i.material-icons',{class:vnode.attrs.class},vnode.children
