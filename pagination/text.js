import m from "mithril";
import { defaultsDeep, template } from "lodash";

export let PaginationText = {
  oninit: ({ attrs, state }) => {
    defaultsDeep(attrs, {
      text: {
        template: "${current}/${total}",
      },
    });
    state.compiled = template(attrs.text.template);
    delete attrs.text.template;
  },
  view: ({ attrs, state }) => {
    return m(
      "div.mm-pagination_text",
      attrs.text,
      state.compiled(attrs.params)
    );
  },
};
