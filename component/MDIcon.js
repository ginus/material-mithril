import m from 'mithril';
import { defaultsDeep, map } from 'lodash';
import { Icon, SVG } from 'polythene-mithril'
export * from '@mdi/js';
//pe-icon
export let MDIcon = {
  view: ({ attrs, children }) => {
    return m(Icon, attrs, m(MDSvg, children));
  }
};
//pe-svg
export let MDSvg = {
  view: ({ attrs, children }) => {
    return m(SVG, attrs, m(multiPathSvg, children));
  }
}
//生成svg标签
export let multiPathSvg = {
  view: ({ attrs, children }) => {
    if (typeof children === 'string') {
      children = [children];
    }
    return m('svg', attrs, map(children, (child) => {
      return m('path', {
        d: child
      });
    }));
  }
}
