import m from "mithril";

export let PaginationContainer = {
  oninit: ({ state }) => {
    state.params = (params) => {
      params.total = Math.ceil(params.count / params.limit);
      params.current = Math.ceil(params.skip / params.limit);
    };
  },
  view: ({ attrs, state, children }) => {
    state.params(attrs.params);
    return m("div.mm-pagination_container", attrs.container, children);
  },
};
