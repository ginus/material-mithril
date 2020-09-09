import m from 'mithril'
import { Icon, TextField } from "polythene-mithril"
import "polythene-css"
import { defaultsDeep } from 'lodash'
# import userIcon from '../zondicons/user.svg'
export Input =
  view:({attrs})->
    m TextField, defaultsDeep attrs, {
      floatingLabel: true
      # fullWidth: true
      # todo 增加图标支持
      # before: m Icon,{svg:content:userIcon}
    }

export AccountInput =
  view:({attrs})->
    m Input, defaultsDeep attrs, {
      label: '账号'
      required: true
      error: '请输入账号'
    }

export MobileInput =
  view:({attrs})->
    m Input, defaultsDeep attrs, {
      label: '手机号'
      required: true
      error: '请输入手机号'
      maxlength: 11
      minlength: 11
      pattern: /^1[0-9](10)$/
    }

export PasswordInput =
  view:({attrs})->
    m Input, defaultsDeep attrs, {
      label: '密码'
      required: true
      type: 'password'
      error: '请输入密码'
    }