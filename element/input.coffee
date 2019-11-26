import m from 'mithril'
import icon from './icon'
export default
  view:(vnode)->
    m '.input-field',{
      class:vnode.attrs.class ? 'col s12'
    },[
      m icon,{class:'prefix'},vnode.attrs.icon if vnode.attrs.icon
      m 'input.validate',{
        id:vnode.attrs.id
        type:vnode.attrs.type ? 'text'
        oninput:vnode.attrs.oninput
        value:vnode.attrs.value
      }
      m 'label',{
        for:vnode.attrs.id
        class:if vnode.attrs.value then 'active'
      },vnode.attrs.label
    ]
