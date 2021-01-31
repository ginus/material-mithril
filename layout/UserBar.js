import m from 'mithril'
import { } from 'polythene-mithril';
import { UserButton } from './UserButton';
// import { UserMenu } from './UserMenu';
import { merge, omit } from "lodash";

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
    console.log(attrs);
    attrs = merge({}, state.defaultAttrs, attrs, state.safeAttrs);
    console.log(attrs);
    let childrenAttrs = omit(attrs, ['userButton', 'userMenu']);
    console.log(attrs);
    return m('.mm-user_bar', attrs, [
      m(UserButton, childrenAttrs.userButton),
      // m(UserMenu, attrs.userMenu)
    ]);
  }
}