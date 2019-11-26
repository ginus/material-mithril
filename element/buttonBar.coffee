import m from 'mithril'
import icon from './icon'

export default
  view:(vnode)->
    m '.input-field',{
      class:vnode.attrs.class ? 'col s12 offset-s2'
    },vnode.children.map (btn)->
      m 'button.btn.waves-effect',{
        class:btn.class ? 'waves-yellow'
        type:btn.type ? 'button'
        onclick:btn.onclick
      },[
        m icon,{class:'left'},btn.icon if btn.icon
        btn.text
      ]
