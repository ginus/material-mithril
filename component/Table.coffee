import m from 'mithril'
import { defaultsDeep } from 'lodash'
# 表格标题
export TCol =
  view:({attrs})->

    m 'tr',attrs.row,

# 根据集合输出表格
export Table =
  oninit:({attrs,state})->

  view:({attrs,state})->
    defaultsDeep attrs,{

    }
    # if attrs.col
    m 'table',attrs.table,[
      m 'thead',
        m 'tr',
          attrs.th.map (th)->
            m 'th',th
      m 'tbody',{

      },vnode.attrs.data.map (data)->
        m 'tr',vnode.attrs.td.map (td)->
          m 'td',{class:td},data[td]

      # m 'tfooter',
      #   m 'tr',
      #     vnode.attrs.th.map (th)->
      #       m 'th',th
    ]

export DataTable =
  view:({attrs})->

