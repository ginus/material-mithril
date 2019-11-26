import m from 'mithril'

export default
  view:(vnode)->
    m '.metric',[
      m '.title',vnode.attrs.title
      m '.value',vnode.attrs.value
    ]
