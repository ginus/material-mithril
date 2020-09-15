echarts = require 'echarts'
echart = null
initOption =
  legend:
    data:[]
  grid:[
    {
      left: 50,
      right:50,
    }
  ]
  xAxis:
    splitNumber: 30
    splitLine:
      show:true
    data: []
  yAxis: {

  }
  tooltip:
    show:true
    trigger:'axis'
    formatter:(params)->
      rtn = []
      rtn.push '位置：'+params[0].dataIndex
      rtn.push '波数：'+params[0].name
      # for param in params
      #   rtn.push param.seriesName+'：'+param.value
      return rtn.join "<br/>"
  dataZoom: [
    {
      type: 'slider'
      start: 0
      end: 100
    }
  ]
  series: [
    {
      name: 'SK90#'
      type: 'line'
      # markLine:
      #   data:[
      #     {type: 'max', name: '最大值'}
      #     {type: 'min', name: '最小值'}
      #   ]
    }
    {
      name: '波峰'
      type: 'bar'
    }
    {
      name: '波谷'
      type: 'bar'
    }
    # {
    #   name: '平滑'
    #   type: 'line'
    #   markLine:
    #     data:[
    #       {type: 'max', name: '最大值'}
    #       {type: 'min', name: '最小值'}
    #     ]
    # }
  ]
m =require 'mithril'
export chart =
  setOption:(opt)->
    if echart
      echart.setOption opt
    else
      initOption = opt
  oninit:({attrs})->
    attrs.style.height ?= '500px'
  oncreate:({dom})->
    echart = echarts.init dom
    echart.setOption initOption
  view:({attrs})->
    m 'div',attrs,'chart here'
