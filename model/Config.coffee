# 配置
import m from 'mithril'
import Promise from 'bluebird'
import {safeload} from 'js-yaml'

export load = (path)->
  config = safeload path
export default (path)->
  # if config

