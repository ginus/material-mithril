import m from 'mithril'

export default
  view:({attrs,children})->
    m 'footer.page-footer',[
      m '.container',children
      m '.footer-copyright',
        m '.container',
          m attrs.copyright
    ]
