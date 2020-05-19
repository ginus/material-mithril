m = require 'mithril'
{assign} = require 'lodash'
{A}  = require './index'

module.exports = class
  view:({attrs,children})->
    console.log attrs,children
    defaultAttrs=
      class: 'brand-logo'
    m A,assign(defaultAttrs,attrs),children
