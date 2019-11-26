import m from 'mithril'
import icon from './icon'

export default
  view:(vnode)->
    m 'form',{class:vnode.attrs.class},
      m '.input-field',[
        m icon,{class:'prefix btn'},'search'
        m 'input[required]',{
          class:'validate'
          type:'search'
          oninput:m.withAttr 'value',(v)->
            vnode.attrs.oninput v if vnode.attrs.oninput
        }
        m 'label',vnode.attrs.label ? ''
        m icon,'close'
      ]
