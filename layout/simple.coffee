m = require 'mithril'
{Nav,Brand,Menu,Footer} = require '../element/index'

export Simple =
  init:({attrs})->
    # attrs.brand ?= '111'
  view: ({attrs,children})->
    console.log 111111111111
    console.log attrs
    console.log children
    m '.simple',{
      id:attrs.pageId
    },[
      m 'header',{
        class:'navbar-fixed'
      },m Nav,{
        class:attrs.class
      },[
        m Brand,{},attrs.brand
        m Menu,{class:'menu'},attrs.menuItems
      ]
      m 'main',{

      },children
      m Footer,{
        copyright:attrs.copyright
      },attrs.footer
    ]
