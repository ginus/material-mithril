import { Button } from "polythene-mithril";
import { clone, defaultsDeep, pick } from "lodash";
import m from "mithril";

export let SkipButton = {
  oninit: ({ attrs, state }) => {
    state.safeAttrs = (params) => {
      return {
        element: m.route.Link,
      };
    };
    state.defaultAttrs = (params) => {
      return {
        class: "mm-pagination_skip",
        label: params.current,
        url: {
          href: m.buildPathname(params.path, params.query),
        },
      };
    };
  },
  view: ({ attrs, state }) => {
    let params = attrs.params;
    return m(
      Button,
      defaultsDeep(
        state.safeAttrs(params),
        attrs.skipButton,
        state.defaultAttrs(params)
      )
    );
  },
};

export let SkipPrevButton = {
  oninit: function ({ attrs, state }) {
    state.safeAttrs = (params) => {
      return {
        disabled: params.disabled,
      };
    };
    state.defaultAttrs = (params) => {
      return {
        label: "上一页",
      };
    };
    state.params = (params) => {
      let query = params.query;
      let skip = query.skip - query.limit;
      if (skip < 0) skip = 0;
      return defaultsDeep(
        {
          query: { skip },
          disabled: skip == query.skip,
        },
        params
      );
    };
  },
  view: ({ attrs, state }) => {
    let params = state.params(attrs.params);
    return m(SkipButton, {
      skipButton: defaultsDeep(
        state.safeAttrs(params),
        attrs.skipPrevButton,
        state.defaultAttrs(params)
      ),
      params,
    });
  },
};

export let SkipNextButton = {
  oninit: ({ attrs, state }) => {
    state.defaultAttrs = (params) => {
      return {
        label: "下一页",
      };
    };
    state.safeAttrs = (params) => {
      return {
        disabled: params.disabled,
      };
    };
    state.params = (params) => {
      let query = params.query;
      let skip = query.skip + query.limit;
      return defaultsDeep(
        {
          query: { skip },
          disabled: skip > params.count,
        },
        params
      );
    };
  },
  view: ({ attrs, state }) => {
    let params = state.params(attrs.params);
    return m(SkipButton, {
      skipButton: defaultsDeep(
        state.safeAttrs(params),
        attrs.skipNextButton,
        state.defaultAttrs(params)
      ),
      params,
    });
  },
};

export let SkipFirstButton = {
  view: ({ attrs }) => {
    m(paginationButton, {
      label: attrs.label || "首页",
      href: attrs.href,
      skip: 0,
    });
  },
};

export let SkipLastButton = {
  oninit: ({ atts, state }) => {
    state.skip = attrs.total;
  },
  view: ({ attrs }) => {
    m(paginationButton, {
      label: attrs.label || "尾页",
      href: attrs.href,
      skip: state.skip,
    });
  },
};
