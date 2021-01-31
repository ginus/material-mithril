import m from 'mithril'
import { Button, IconButton } from 'polythene-mithril'
import { MDIcon, mdiAccount } from '../component/MDIcon'
import { merge, pick } from 'lodash'

export let UserButton = {
  oninit: ({ state }) => {
    state.safeAttrs = {
      id: 'mm-user_button',
      icon: {
        svg: m(MDIcon, mdiAccount)
      },
      // content: [
      //   m(MDIcon, mdiAccount)
      // ],
      dropdown: {
        show: state.show
      },
      events: {
        onclick: (e) => {
          state.show = !state.show;
        }
      }
    };
    state.defaultAttrs = {
      // content: [m(MDIcon, mdiAccount)]
    }
  },
  view: ({ attrs, state }) => {
    console.log(attrs);
    attrs = merge({}, state.defaultAttrs, attrs, state.safeAttrs);
    // return m(Button, attrs, m(IconButton, pick(attrs, ['label'])));
    return m(IconButton, attrs);
  }
}