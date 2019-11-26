import m from 'mithril'
import materializeCSS from 'materialize-css'
# import materializeCSS from 'materialize-css'
import {nav,menu,icon} from '../element'

adminMenuItems = [
  {
    a:
      href:'/lession/admin'
    children:'管理课程'
  }
  {
    a:
      href:'/teacher'
    children:'管理老师'
  }
  {
    a:
      href:'/item'
    children:'管理训练内容'
  }
]

teacherMenuItems = [
  {
    a:
      href:'/lession/teacher'
    children:'管理课程'
  }
  {
    a:
      href:'/item'
    children:'管理训练内容'
  }
]

export default
  oninit:({state,attrs})->
    attrs.nav.class ?= 'lime accent-3'
    # if user.info.isRoleAdmin
    #   state.userLable = '管理员'
    #   state.menuItems = adminMenuItems
    # else
    #   state.userLable = '教师'
    #   state.menuItems = teacherMenuItems
  view:({state,attrs,children})->
    m 'div',{
      id:attrs.id
    },[
      m nav,{
        class:attrs.nav.class
        left:m '.main',m menu,{

        },state.menuItems
        right:m '.right',{

        },[
          attrs.right
          m 'button.btn',[
            user.info.name
            ' '
            state.userLable
          ]
          m 'button.btn.waves-effect.waves-light',{onclick:logout},[
            ' 退出>'
            # m icon,{class:'right'},'right'
          ]
        ]
      },'华思备课系统'
      children
    ]
