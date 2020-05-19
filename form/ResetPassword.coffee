import m from 'mithril'
import {DialogPane,IconButton,Icon,TextField} from "polythene-mithril"
import "polythene-css"

export ResetPassword =
  view:()->
    m DialogPane,{
      body:[
        m TextField,{
          label:'旧密码'
          type:'password'
          floatingLabel:true
          required:true
          minlength:4
        }
        m TextField,{
          label:'新密码'
          type:'password'
          floatingLabel:true
          required:true
          minlength:4
        }
        m TextField,{
          label:'确认密码'
          type:'password'
          floatingLabel:true
          required:true
          minlength:4
        }
      ]
      footerButtons:[
        m IconButton,{
          label:'保存'
        }
      ]
    }