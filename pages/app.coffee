import m from 'mithril'
import {loginSimple} from './form/loginSimple'
import {resetPassword} from './form/resetPassword'
import drawer from './layout/drawer'

m.route document.body,'/form/loginSimple',{
  # "/",
  "/layout/drawer": drawer
  "/form/loginSimple": loginSimple
  "/form/resetPassword": resetPassword

}
