export DataTable =
  view:({attrs})->

export Table2 =
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