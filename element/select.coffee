import debug from 'debug'
see = debug('mmui').extend 'select'

import _ from 'lodash'
import m from 'mithril'

ins = null
state =
  update:(vnode)->
    el = document.getElementById vnode.attrs.id
    opt =
      dropdownOptions:
        onCloseEnd:(ev)->
          see ev
          see ins.getSelectedValues()
    ins = M.FormSelect.init el,opt
    m.redraw()

export default
  oncreate:(vnode)->
    see 'create'
    el = document.getElementById vnode.attrs.id
    opt =
      dropdownOptions:
        onCloseEnd:(ev)->
          see ev
          see ins.getSelectedValues()
    ins = M.FormSelect.init el,opt

  view:({attrs,children})->
    if _.isArray attrs.value
      values = attrs.value
    else
      values = [attrs.value]

    m '.input-field',{
      class:attrs.class ? 'col s12'
    },[
      m 'select',{
        id:attrs.id
        multiple:attrs.multiple
        onchange:attrs.onchange
      },children.map (opt)->
        value = opt.value ? opt
        text = opt.text ? value
        see value,text
        m 'option',{
          value:value
          selected:value in values
        },text
      m 'label',attrs.label
    ]
