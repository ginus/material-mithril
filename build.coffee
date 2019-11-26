fs = require 'fs'
#从目录里读取文件名 加上前缀
coms={}

genIndex =(path)->
  fs.readdir path,(err,files)->
    return console.log err if err
    importComs = []
    exportComs = ['','export default']
    for file in files
      name = file.slice 0,-7
      importComs.push "import #{name} from './#{name}'"
      exportComs.push "  '#{name}': #{name}"
    comStr = importComs.join("\n")+exportComs.join("\n")
    console.log comStr
    fs.writeFile path+'/index.coffee',comStr,(err)->
      throw err if err
      console.log 'The file has been saved!'
genIndex './element'
