import { defaultsDeep } from "lodash";
import m from "mithril";
import { Menu, Button, List, ListTile } from 'polythene-mithril'

export let UserMenu = {
  oninit: ({ state }) => {
    state.safeAttrs = {
      target: '#mm_user_button',
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
    return m(Menu, defaultsDeep(state.safeAttrs, attrs, state.defaultAttrs));
  }
}