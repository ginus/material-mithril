import m from 'mithril'
import radio from './radio'
import _ from 'lodash'
import debug from 'debug'
see = debug('mmui').extend 'radioGroup'

export default
  view:({attrs,children})->
    m '.input-field',{
      class:attrs.class ? 'col s12'
    },[
      # <i class="material-icons prefix">mode_edit</i>
      # m 'i.material-icons.prefi','mode_edit'
      children.map (opt)->
        value = opt.value ? opt
        text = opt.text ? value
        m radio,{
          value:value
          name:attrs.name
          checked:value is attrs.value
          onchange:attrs.onchange
        },text
      m 'label',attrs.label
    ]
