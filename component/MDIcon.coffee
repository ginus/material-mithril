#svg icon
import m from 'mithril'
import {defaultsDeep} from 'lodash'
export * from '@mdi/js'

export MDIcon =
  view:({attrs,children})->
    defaultsDeep attrs,{

    }
    children = [children] if typeof children is 'string'
    m 'svg',attrs, children.map (child)->
      m 'path',{d:child}

