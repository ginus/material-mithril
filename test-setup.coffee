jsdom = require('jsdom')
dom = new (jsdom.JSDOM)('', pretendToBeVisual: true)
# Fill in the globals Mithril needs to operate. Also, the first two are often
# useful to have just in tests.
global.window = dom.window
global.document = dom.window.document
global.requestAnimationFrame = dom.window.requestAnimationFrame
global.load = (path)->
  module = require('./'+path)

pe = require('pretty-error').start()
pe.skipNodeFiles()
pe.skipPackage('lib','material-mithril')
# pe.skipPath('loader.js')
pe.skip (item)->item.addr.startsWith('internal')
pe.skip (item)->not item.file
# And now, make sure JSDOM ends when the tests end.
after ->
  window.close()
