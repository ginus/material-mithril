import m from 'mithril'
import {Toolbar,IconButton,Drawer,List,ListTile,Icon} from "polythene-mithril"
import "polythene-css"

iconMenuSVG = '<svg width="24" height="24" viewBox="0 0 24 24">
  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>'

export default
  oninit: ({state,attrs})->
    state.showDrawer = false
    state.navList = attrs.navList or []
  view: ({state,attrs,children})->
    m '.warp',{

    },[
      m Toolbar,{
        border:true
      },[
        m IconButton,
          {
            icon: { svg: { content: m.trust(iconMenuSVG) } },
            events: {
              onclick: -> state.showDrawer = !state.showDrawer
            }
          }
        m "div",
          { className: "pe-toolbar__title" },
          attrs.title
        m '.right','uc' if attrs.right
      ]
      m '',{
        style:
          position: "relative"
          # overflow: "hidden"
      },[
        m '.drawer-warp',{
          style:
            display: "flex",
            height: "100%"
            background: "#fff"
            # color: "#333"
        },[
          m Drawer,
            push: true,
            border: true,
            mini: true,
            className:"small-screen-cover-drawer medium-screen-mini-drawer
             large-screen-floating-drawer"
            show: state.showDrawer,
            content:
              m List,
                tiles:state.navList.map ({title,icon})->
                  m ListTile,
                    title:title,
                    front: m(Icon, {
                      svg: { content: m.trust(icon) }
                    }),
                    hoverable: true,
                    navigation: true,
                    # events: {
                    #   onclick: navItemClick
                    # }
            #   navigationList({
            #   handleClick: () -> state.showDrawer = false
            # }),
            didHide: () -> state.showDrawer = false

          m ".content",{
            style:
              overflow: "hidden",
              flexShrink: 0,
              flexGrow: 0,
              width: "100%"
          },children
        ]
      ]
    ]
