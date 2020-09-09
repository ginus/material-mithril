import m from 'mithril'
{Icon}  = require './index'

module.exports = class
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
