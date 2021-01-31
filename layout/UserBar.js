import m from 'mithril'
import { UserButton } from './UserButton';
import { UserMenu } from './UserMenu';
import { merge, omit } from "lodash";

export let UserBar = {
  oninit: ({ state }) => {
    state.show = false;
    state.safeAttrs = () => ({
      userButton: {
        id: 'mm-user_button',
        dropdown: {
          open: state.show
        },
        events: {
          onclick: (e) => {
            state.show = !state.show;
          }
        }
      },
      userMenu: {
        target: '#mm-user_button',
        show: state.show,
        didHide: () => {
          state.show = false;
        }
      }
    });
    state.defaultAttrs = {
      style: {
        position: "relative",
        height: "inherit"
      }
    };
  },
  view: ({ attrs, state }) => {
    attrs = merge({}, state.defaultAttrs, attrs, state.safeAttrs());
    let _attrs = omit(attrs, ['userButton', 'userMenu'])
    return m('.mm-user_bar', _attrs, [
      m(UserButton, attrs.userButton),
      m(UserMenu, attrs.userMenu)
    ]);
  }
}