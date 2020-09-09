import m from 'mithril'
import { defaultsDeep } from 'lodash'
import {A} from '../index'

export class brand
  view:({attrs, children})->
    m A, defaultsDeep({}, attrs, {
      class: 'brand-logo'
    }), children
