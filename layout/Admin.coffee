import m from 'mithril'
import { Toolbar, ToolbarTitle, Tabs, IconButton, SVG} from "polythene-mithril"
import { addLayoutStyles } from "polythene-css"
import { defaultsDeep } from 'lodash'
addLayoutStyles()
import {mdiAccount} from '@mdi/js'
import MDI from '../component/MDI'
export AdminLayout =
  init:({attrs})->

  view: ({attrs, children})->
    defaultsDeep attrs,{
      tabs:{}
      user:
        icon:
          svg:
            content: m MDI, mdiAccount
    }
    m '.admin.layout.vertical.pe-fullbleed',{
      id: attrs.pageId
    },[
      m Toolbar,[
        m ToolbarTitle, attrs.title
        m Tabs, attrs.tabs
        m IconButton, attrs.user
      ]
      m '.main.flex.one',{
        style:
          'background-color': '#eee'
      }, children
    ]
