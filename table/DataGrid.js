export var DataTable = {
  view: function({attrs}) {}
};

export var Table2 = {
  oninit: function({attrs, state}) {},
  view: function({attrs, state}) {
    defaultsDeep(attrs, {});
    // if attrs.col
    return m('table', attrs.table, [
      m('thead',
      m('tr',
      attrs.th.map(function(th) {
        return m('th',
      th);
      }))),
      m('tbody',
      {},
      vnode.attrs.data.map(function(data) {
        return m('tr',
      vnode.attrs.td.map(function(td) {
          return m('td',
      {
            class: td
          },
      data[td]);
        }));
      }))
    ]);
  }
};

// m 'tfooter',
//   m 'tr',
//     vnode.attrs.th.map (th)->
//       m 'th',th
