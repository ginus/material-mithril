import m from 'mithril'
# import debug from 'debug'
# see = debug('mmui').extend 'checkBox'

export class CheckBox
  view:({attrs,children})->
    m 'label.checkbox',{
      onchange:attrs.onchange
    },[
      m 'input',{
        type:'checkbox'
        value:attrs.value
        checked:attrs.checked
      }
      m 'span',{
      },children
    ]
