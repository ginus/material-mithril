import m from 'mithril'

export default
  view:({attrs,children})->
    m 'nav',{
      class:attrs.class
    },m '.nav-wrapper',children
