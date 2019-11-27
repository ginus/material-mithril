import m from 'mithril'
import {nav,brand,menu,footer} from '../element/index'

export default
  view:({attrs,children})->
    m '.simple',{
      id:attrs.pageId
    },[
      m 'header',{
        class:'navbar-fixed'
      },m nav,{
        class:attrs.class
      },[
        m brand,{},attrs.brand
        m menu,{class:'menu'},attrs.menuItems
      ]
      m 'main',{

      },children
      m footer,{
        copyright:attrs.copyright
      },attrs.footer
    ]
