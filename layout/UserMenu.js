import { merge, omit } from "lodash";
import m from "mithril";
import { Menu, List, ListTile } from 'polythene-mithril'

export let UserMenu = {
  oninit: ({ state }) => {
    state.safeAttrs = {
      // reposition: true,
      // offsetV: '80%',
      // width: 'auto'
    };
    // state.defaultAttrs = {

    // };
    state.transformAttrs = (attrs) => {
      if (attrs.items) {
        attrs.content = m(List, attrs.items.map((item) => {
          return m(ListTile, merge({ hoverable: true }, item))
        }))
      }
      return omit(attrs, ['items']);
    }
  },
  view: ({ attrs, state }) => {
    // console.log(attrs);
    let _attrs = merge({}, state.transformAttrs(attrs), state.safeAttrs)
    console.log('menu ' + _attrs.show);
    return m(Menu, _attrs);
  }
}