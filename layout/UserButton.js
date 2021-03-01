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
    // state.defaultAttrs = {
    // }
  },
  view: ({ attrs, state }) => {
    return m(Button, merge({}, attrs, state.safeAttrs));
  }
}