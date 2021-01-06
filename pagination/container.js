import m from "mithril";

export let PaginationContainer = {
  oninit: ({ state }) => {
    state.params = (params) => {
      let query = params.query;
      params.total = Math.ceil(params.count / query.limit);
      params.current = Math.floor(query.skip / query.limit) + 1;
    };
  },
  view: ({ attrs, state, children }) => {
    state.params(attrs.params);
    return m("div.mm-pagination_container", attrs.container, children);
  },
};
