import element from './element'

coms ={}
add =(subComs)->
  for key, value of subComs
    coms[key] = value
#以下为自动加载组件
add element
#以下为自定义组件
# coms['test']= 'test'
export default coms
