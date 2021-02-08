import m from 'mithril'
import Stream from 'mithril/stream'
import { UserButton } from './UserButton';
import { UserMenu } from './UserMenu';
import { merge, omit } from "lodash";

export let UserBar = {
  oninit: ({ state }) => {
    state.show = false;
    state.safeAttrs = () => ({

      // onmouseover: () => {
      //   state.show = true;
      //   console.log('onmouseover ' + state.show);
      // },
      userButton: {
        id: 'mm-user_button',
        dropdown: {
          open: false
        },
        events: {
          onmouseover: () => {
            state.show = true;
            console.log('onmouseover ' + state.show);
          },
          onclick: (e) => {
            state.show = true;
            console.log('click ' + state.show);



            // m.redraw();
          }
        }
      },
      userMenu: {
        target: '#mm-user_button',
        show: state.show,
        // show: true,
        didHide: () => {
          setTimeout(() => {
            state.show = false;
            console.log('didHide ' + state.show);
          }, 100);

          // m.redraw();
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
    let attrs2 = merge({}, state.defaultAttrs, attrs, state.safeAttrs());
    let _attrs = omit(attrs2, ['userButton', 'userMenu'])
    return m('.mm-user_bar', _attrs, [
      m(UserButton, attrs2.userButton),
      m(UserMenu, attrs2.userMenu)
    ]);
  }
}