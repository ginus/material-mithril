import { defaultsDeep } from "lodash";
import m from "mithril";
import { Menu, Button, List, ListTile } from 'polythene-mithril'

export let UserMenu = {
  oninit: ({ state }) => {
    state.safeAttrs = {
      origin: 'top right',
      offsetV: '80px',
      // show: state.show,
      // show: true,
      // didHide: function () {
      //   state.show = false;
      // },
    };
    state.defaultAttrs = () => {

    };
  },
  view: ({ attrs, state }) => {
    console.log(attrs);
    let _attrs = defaultsDeep({}, state.safeAttrs, attrs, state.defaultAttrs)
    return m(Menu, _attrs);
  }
}