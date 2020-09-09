# 用户身份、状态、带身份的数据请求
import m from 'mithril'
import Promise from 'bluebird'
import {defaultsDeep} from 'lodash'

export login = (data)->
  Promise.resolve data
  .then m.request
  .tap (rs)->
    if rs.code == 0
      setToken rs.data.authToken
      authed = true
  .catch console.error

export logout = (data)->


export request = (options)->
  defaultsDeep options,
    headers:
      authToken: getToken()
  Promise.resolve options
  .then m.request
  .tap (rs)->
    if rs.code == -22
      back = location.href
      location.href = 'index.html#!/login?back='+back if authed
      authed = false
      setToken()
  .catch console.error

export getToken = ->
  localStorage.getItem 'authToken'
export setToken = (authToken)->
  localStorage.setItem 'authToken', authToken