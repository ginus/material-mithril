// Generated by CoffeeScript 2.5.1
  // import debug from 'debug'
  // see = debug('mmui').extend 'select'

// import _ from 'lodash'
var ins, state,
  indexOf = [].indexOf;

import m from 'mithril';

ins = null;

state = {
  update: function(vnode) {
    var el, opt;
    el = document.getElementById(vnode.attrs.id);
    opt = {
      dropdownOptions: {
        onCloseEnd: function(ev) {
          see(ev);
          return see(ins.getSelectedValues());
        }
      }
    };
    ins = M.FormSelect.init(el, opt);
    return m.redraw();
  }
};

module.exports = class {
  oncreate(vnode) {
    var el, opt;
    see('create');
    el = document.getElementById(vnode.attrs.id);
    opt = {
      dropdownOptions: {
        onCloseEnd: function(ev) {
          see(ev);
          return see(ins.getSelectedValues());
        }
      }
    };
    return ins = M.FormSelect.init(el, opt);
  }

  view({attrs, children}) {
    var ref, values;
    if (_.isArray(attrs.value)) {
      values = attrs.value;
    } else {
      values = [attrs.value];
    }
    return m('.input-field', {
      class: (ref = attrs.class) != null ? ref : 'col s12'
    }, [
      m('select',
      {
        id: attrs.id,
        multiple: attrs.multiple,
        onchange: attrs.onchange
      },
      children.map(function(opt) {
        var ref1,
      ref2,
      text,
      value;
        value = (ref1 = opt.value) != null ? ref1 : opt;
        text = (ref2 = opt.text) != null ? ref2 : value;
        see(value,
      text);
        return m('option',
      {
          value: value,
          selected: indexOf.call(values,
      value) >= 0
        },
      text);
      })),
      m('label',
      attrs.label)
    ]);
  }

};