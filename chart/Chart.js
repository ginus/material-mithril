var echarts = require('echarts');
var m = require('mithril');
var echart = null;

var initOption = {
  legend: {
    data: []
  },
  grid: [
    {
      left: 50,
      right: 50
    }
  ],
  xAxis: {
    splitNumber: 30,
    splitLine: {
      show: true
    },
    data: []
  },
  yAxis: {},
  tooltip: {
    show: true,
    trigger: 'axis',
    formatter: function(params) {
      var rtn;
      rtn = [];
      rtn.push('位置：' + params[0].dataIndex);
      rtn.push('波数：' + params[0].name);
      // for param in params
      //   rtn.push param.seriesName+'：'+param.value
      return rtn.join("<br/>");
    }
  },
  dataZoom: [
    {
      type: 'slider',
      start: 0,
      end: 100
    }
  ],
  series: [
    {
      name: 'SK90#',
      type: 'line'
    },
    {
      // markLine:
      //   data:[
      //     {type: 'max', name: '最大值'}
      //     {type: 'min', name: '最小值'}
      //   ]
      name: '波峰',
      type: 'bar'
    },
    {
      name: '波谷',
      type: 'bar'
    }
  ]
};

// {
//   name: '平滑'
//   type: 'line'
//   markLine:
//     data:[
//       {type: 'max', name: '最大值'}
//       {type: 'min', name: '最小值'}
//     ]
// }


export var chart = {
  setOption: function(opt) {
    if (echart) {
      return echart.setOption(opt);
    } else {
      return initOption = opt;
    }
  },
  oninit: function({attrs}) {
    var base;
    return (base = attrs.style).height != null ? base.height : base.height = '500px';
  },
  oncreate: function({dom}) {
    echart = echarts.init(dom);
    return echart.setOption(initOption);
  },
  view: function({attrs}) {
    return m('div', attrs, 'chart here');
  }
};
