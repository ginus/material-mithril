import m from 'mithril'
import { Toolbar, ToolbarTitle, Tabs, IconButton, SVG} from "polythene-mithril"

import { addLayoutStyles } from "polythene-css"
import { defaultsDeep } from 'lodash'
addLayoutStyles()
import {MDIcon, mdiAccount} from '../component/MDIcon'


export AdminLayout =
  init:({attrs})->

  view: ({attrs, children})->
    defaultsDeep attrs,{
      navTabs:{tabs:[]}
      user:
        icon:
          svg:
            content: m MDIcon, mdiAccount
    }

    m '.admin.layout.vertical.pe-fullbleed',{
      id: attrs.pageId
    },[
      m Toolbar,[
        m ToolbarTitle, attrs.title
        m Tabs, attrs.navTabs
        m IconButton, attrs.user
      ]
      m '.main.flex.one',{
        style:
          'background-color': '#eee'
      }, children
    ]
