# 按照数据显示一个表格
import m from 'mithril'
import { defaultsDeep } from 'lodash'

export TR =
  view: ({attrs, children})->
    m 'tr',attrs, children
#
export TD =
  view: ({attrs, children})->
    m 'td',attrs, children

export TH =
  view: ({attrs, children})->
    m 'th',attrs, children

export THead =
  view: ({attrs, children})->
    m 'thead',attrs, children

export TBody =
  view: ({attrs, children})->
    m 'tbody', attrs, children

export TFoot =
  view: ({attrs, children})->
    m 'tfoot', attrs, children

export Table =
  view: ({attrs, children})->
    m 'table', attrs, childrens