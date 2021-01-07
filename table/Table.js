// 按照数据显示一个表格
import m from 'mithril';

import {
  defaultsDeep
} from 'lodash';

export var TR = {
  view: function({attrs, children}) {
    return m('tr', attrs, children);
  }
};


export var TD = {
  view: function({attrs, children}) {
    return m('td', attrs, children);
  }
};

export var TH = {
  view: function({attrs, children}) {
    return m('th', attrs, children);
  }
};

export var THead = {
  view: function({attrs, children}) {
    return m('thead', attrs, children);
  }
};

export var TBody = {
  view: function({attrs, children}) {
    return m('tbody', attrs, children);
  }
};

export var TFoot = {
  view: function({attrs, children}) {
    return m('tfoot', attrs, children);
  }
};

export var Table = {
  view: function({attrs, children}) {
    return m('table', attrs, childrens);
  }
};
