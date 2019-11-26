import m from 'mithril'

export default
  view:(vnode)->
    m '.switch',{
      class:vnode.attrs.class
    },m 'label',[
      vnode.attrs.off ? '关'
      m 'input',{
        type:'checkbox'
        oninput:vnode.attrs.oninput
        value:vnode.attrs.value
      }
      m 'span.lever'
      vnode.attrs.on ? '开'
    ]
