mq = require 'mithril-query'
brand = require '../element/Brand'

describe "brand", ->
  it 'brand-logo',->
    out = mq brand
    # console.log
    out.should.have 'a[class$=brand-logo]'
