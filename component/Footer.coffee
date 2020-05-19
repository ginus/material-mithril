m = require 'mithril'

module.exports = class
  view:({attrs,children})->
    m 'footer.page-footer',[
      m '.container',children
      m '.footer-copyright',
        m '.container',
          m attrs.copyright
    ]
