// 排序交互

import m from 'mithril';

import {
  mdiMenuDown,
  mdiMenuUp,
  mdiMenuSwap,
  MDIcon
} from '../component/MDIcon';

export var Sortable = function(th) {};

// 增加点击事件
// 返回排序
export var SortIcon = {
  view: function({attrs}) {
    if (attrs.asc) {
      return m(MDIcon, mdiMenuUp);
    } else if (attrs.desc) {
      return m(MDIcon, mdiMenuDown);
    } else {
      return m(MDIcon, mdiMenuSwap);
    }
  }
};
