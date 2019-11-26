import m from 'mithril'
import a from './a'

export default
  view:(vnode)->
    m 'nav',{class:vnode.attrs.class},
        m '.nav-wrapper',[
          m a,{
            class:'brand-logo'
            href:vnode.attrs.href ? '/'
          },vnode.children
          vnode.attrs.left if vnode.attrs.left
          vnode.attrs.right if vnode.attrs.right
        ]
