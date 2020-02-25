mq = require 'mithril-query'
drawer = load 'layout/drawer'

describe "drawer", ->
  it 'default',->
    out = mq drawer
    out.should.have 'div[class=simple]'
  it 'no herf',->
    out = mq drawer,{},[]
    # console.log out
    out.should.not.have 'div[class=simple]'
