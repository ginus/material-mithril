import m from 'mithril'
# import debug from 'debug'
# see = debug('mmui').extend 'radio'

module.exports = class
  view:({attrs,children})->
    m 'label.radio',{
      onchange:attrs.onchange
    },[
      m 'input',{
        type:'radio'
        value:attrs.value
        checked:attrs.checked
        name:attrs.name
        class:'with-gap'
      }
      m 'span',{
      },children
    ]
