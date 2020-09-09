import m from 'mithril'
{Icon}  = require './index'

state =
  getId:(id)->id ? 'search'
module.exports = class
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
