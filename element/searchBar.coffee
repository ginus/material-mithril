import m from 'mithril'
import icon from './icon'

state =
  getId:(id)->id ? 'search'
export default
  view:(vnode)->
    m 'form.searchBar',
      m '.input-field',[
        m icon,{class:'prefix'},'search'
        m 'input[required]',{
          class:'validate'
          id:state.getId vnode.attrs.id
        }
        # m 'label.label-icon',{
        #
        #   for:state.getId vnode.attrs.id
        # },
      ]
