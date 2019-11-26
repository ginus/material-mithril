import element from './element'
import layout from './layout'

coms ={}
add =(subComs)->
  for key, value of subComs
    coms[key] = value
#以下为自动加载组件
add element
add layout
#以下为自定义组件
# coms['test']= 'test'
export default coms
