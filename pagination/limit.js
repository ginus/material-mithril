// 控制limit参数
import m from "mithril";
import { defaultsDeep, pick, remove } from "lodash";

export let TextLimit = {
  oninit: ({ attrs, state }) => {
    state = remove(pick(attrs, "TextLimit"), {
      class: "mm-textlimit",
    });
  },
  view: ({ attrs, state }) => {
    console.log(state);
    return m(
      "div.mm-pagination_limit",
      state.TextLimit,
      "每页" + attrs.limit + "行"
    );
  },
};

export let DropdowmLimit = {};
