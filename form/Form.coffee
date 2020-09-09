import m from 'mithril'
import stream from 'mithril/stream'
import { DialogPane, Icon } from "polythene-mithril"
import {Shadow} from 'polythene-mithril'
import {AccountInput, PasswordInput} from './Input'
import {PrimaryButton} from './Button'
import { defaultsDeep } from 'lodash'
import { addTypography } from "polythene-css"
addTypography()

export Form =
  view:({attrs})->
    m DialogPane, defaultsDeep attrs

export InlineForm =
  view: ({attrs})->
    m 'form.inline'

export LoginForm =
  view:({attrs})->
    m Form, {
      body:[
        m AccountInput, attrs.account
        m PasswordInput, attrs.password
      ]
      footer: [
        m PrimaryButton, defaultsDeep attrs.login,{
          label: '登录'
        }
        m 'a', defaultsDeep attrs.reg, {
          text: '没有账号 去注册'
          # url: m.route.link '/reg'
        }
      ]
    }

export RegForm =
  view: ({attrs})->
    m Form, {
      body:[
        m AccountInput, attrs.account
        m PasswordInput, attrs.password
        m PasswordInput, attrs.passwordRepeat
      ]
      footerButtons:[
        m PrimaryButton, attrs.regButton
      ]
    }

export ChangePasswordForm =
  view: ({attrs})->
    m Form,{
      body:[
        m PasswordInput, attrs.oldPassword
        m PasswordInput, attrs.password
        m PasswordInput, attrs.passwordRepeat
      ]
      footerButtons:[
        m saveButton, attrs.save
      ]
    }

export searchForm =
  view: ({attrs})->
