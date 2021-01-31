import m from 'mithril'
import { } from 'polythene-mithril';
import { UserButton } from './UserButton';
import { UserMenu } from './UserMenu';
import { merge, omit, pick } from "lodash";

export let UserBar = {
  oninit: ({ state }) => {
    state.safeAttrs = {
    };
    state.defaultAttrs = {
      style: {
        position: "relative",
        height: "inherit"
      }
    };
  },
  view: ({ attrs, state }) => {
    attrs = merge({}, state.defaultAttrs, attrs, state.safeAttrs);
    let _attrs = omit(attrs, ['userButton', 'userMenu'])
    return m('.mm-user_bar', _attrs, [
      m(UserButton, attrs.userButton),
      m(UserMenu, attrs.userMenu)
    ]);
  }
}