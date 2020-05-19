import m from 'mithril'
import {DialogPane,IconButton,Icon,TextField} from "polythene-mithril"
import "polythene-css"

export LoginSimple =
  view:()->
    m DialogPane,{
      body:[
        m TextField,{
          label:'账号'
          name:'account'
          floatingLabel:true
          required:true
          maxlength:11
          minlength:11
          # pattern:/^1[0-9](10)$/
        }
        m TextField,{
          label:'密码'
          type:'password'
          floatingLabel:true
          required:true
          minlength:4
        }
      ]
      footerButtons:[
        m IconButton,{
          label:'登录'
        }
      ]
    }