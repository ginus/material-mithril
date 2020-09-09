import m from 'mithril'
import { Icon, Button } from "polythene-mithril"
import "polythene-css"
import { defaultsDeep } from 'lodash'

export DefaultButton =
  view:({attrs})->
    m Button, defaultsDeep attrs, {
      border: true
    }

export PrimaryButton =
  view:({attrs})->
    m DefaultButton, defaultsDeep attrs, {
      rised: true
      # element: "button"
    }

export saveButton =
  view:({attrs})->
    m PrimaryButton, {
      label: '保存'
    }