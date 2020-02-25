mq = require 'mithril-query'
a = require '../element/A'

describe "A", ->
  it 'herf',->
    out = mq a,{href:'aa'}
    out.should.have 'a[href$=aa]'
  it 'no herf',->
    out = mq a
    out.should.have 'a'
    out.should.not.have 'a[href]'
