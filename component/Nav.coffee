import m from 'mithril'

module.exports = class
  view:({attrs,children})->
    m 'nav',{
      class:attrs.class
    },m '.nav-wrapper',children
