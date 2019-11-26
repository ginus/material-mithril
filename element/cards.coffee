import m from 'mithril'
import a from './a'
export default
  view:(vnode)->
    m '.row',vnode.children.map (card)->
      m '.col',{class:vnode.attrs.col ? 's12 m6 l3'},
        m '.card',{class:vnode.attrs.card ? ''},[
          m '.card-content',{class:vnode.attrs.card_content ? ''},[
            m 'span.card-title',card.title
            m 'p',m.trust card.content
          ]
          m '.card-action',card.actions.map (action)->
            m a,{href:action.href},action.text
        ]
