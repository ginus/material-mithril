import m from 'mithril'
import { Button } from 'polythene-mithril'
import { MDIcon, mdiAccount } from '../component/MDIcon'
import { merge } from 'lodash'

export let UserButton = {
  oninit: ({ attrs, state }) => {
    state.safeAttrs = {
      content: [
        m(MDIcon, mdiAccount),
        attrs.label
      ],
    };
    state.defaultAttrs = {
      // content: [m(MDIcon, mdiAccount)]
    }
  },
  view: ({ attrs, state }) => {
    attrs = merge({}, state.defaultAttrs, attrs, state.safeAttrs);
    return m(Button, attrs);
  }
}