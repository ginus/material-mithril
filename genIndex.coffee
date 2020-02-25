fs = require 'fs'
#从目录里读取文件名 加上前缀
coms={}

genIndex =(path)->
  fs.readdir path,(err,files)->
    return console.log err if err
    exports = ['module.exports =']
    for file in files
      name = file.slice 0,-7
      continue if name is 'index'
      exports.push "  '#{name}': require './#{name}'"
    comStr = exports.join("\n")
    console.log comStr
    fs.writeFile path+'/index.coffee',comStr,(err)->
      throw err if err
      console.log path,'/index.coffee has been saved!'
genIndex './element'
genIndex './layout'
