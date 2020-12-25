# 排序交互
#
import m from 'mithril'
import {mdiMenuDown, mdiMenuUp, mdiMenuSwap, MDIcon} from '../component/MDIcon'

export Sortable = (th)->
  # 增加点击事件
  # 返回排序

export SortIcon =
  view: ({attrs})->
    if attrs.asc
      m MDIcon, mdiMenuUp
    else if attrs.desc
      m MDIcon, mdiMenuDown
    else
      m MDIcon, mdiMenuSwap
