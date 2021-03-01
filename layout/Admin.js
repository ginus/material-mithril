// Generated by CoffeeScript 2.5.1
import m from 'mithril';

import {
  Toolbar,
  ToolbarTitle,
  Tabs,
} from "polythene-mithril";

import {
  addLayoutStyles
} from "polythene-css";

import {
  defaultsDeep
} from 'lodash';

addLayoutStyles();

import { UserBar } from './UserBar';

export var AdminLayout = {
  oninit: function ({ attrs, state }) {
    state.defaultNav = {
      tabs: [],
      activeSelected: true,
    };
  },
  view: function ({ attrs, state, children }) {
    return m('.admin.layout.vertical.pe-fullbleed', [
      m(Toolbar, [
        m(ToolbarTitle, attrs.title),
        m(Tabs, defaultsDeep(
          attrs.nav,
          state.defaultNav,
        )),
        m(UserBar, attrs.userBar)
      ]),
      m('.main.flex.one', defaultsDeep(
        attrs.main,
        state.defaultMain
      ), children)
    ]);
  }
};
