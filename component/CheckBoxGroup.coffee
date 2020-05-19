m = require 'mithril'
{Checkbox} =require './index'
{pull} = require 'lodash'
# import debug from 'debug'
# see = debug('mmui').extend 'checkBoxGroup'

module.exports = class
  view:({attrs,children})->
    attrs.value ?= []
    m '.input-field',{
      class:attrs.class ? 'col s12'
    },[
      children.map (opt)->
        value = opt.value ? opt
        text = opt.text ? value
        m checkbox,{
          value:value
          checked:value in attrs.value
          onchange:({target})->
            if target.checked
              attrs.value.push target.value
            else
              pull attrs.value,target.value
        },text
      m 'label',attrs.label
    ]
