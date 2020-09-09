import m from 'mithril'

module.exports = class Table
  view:(vnode)->
    m 'table',{
      class:vnode.attrs.class ? 'highlight striped responsive-table'
    },[
      m 'thead',
        m 'tr',
          vnode.attrs.th.map (th)->
            m 'th',th
      m 'tbody',{

      },vnode.attrs.data.map (data)->
        m 'tr',vnode.attrs.td.map (td)->
          m 'td',{class:td},data[td]
    ]
