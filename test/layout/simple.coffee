mq = require 'mithril-query'
Simple = load 'layout/Simple'

describe "simple", ->
  it 'default',->
    out = mq Simple
    # console.log out
    out.should.have 'div[class=simple]'
  it 'no herf',->
    out = mq Simple,{},[]
    # console.log out
    out.should.not.have 'div[class=simple]'
