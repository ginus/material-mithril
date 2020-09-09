import m from 'mithril'
import {Icon} from '../index'

module.exports = class
  view:(vnode)->
    m '.input-field',{
      class:vnode.attrs.class ? 'col s12 offset-s2'
    },vnode.children.map (btn)->
      m 'button.btn.waves-effect',{
        class:btn.class ? 'waves-yellow'
        type:btn.type ? 'button'
        onclick:btn.onclick
      },[
        m Icon,{class:'left'},btn.icon if btn.icon
        btn.text
      ]
