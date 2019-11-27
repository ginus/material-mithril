import m from 'mithril'
import {assign} from 'lodash'
import {a} from './index'

export default
  view:({attrs,children})->
    defaultAttrs=
      class: 'brand-logo'
    m a,assign(defaultAttrs,attrs),children
