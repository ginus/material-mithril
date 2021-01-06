// 分页交互
// 布局 元素
// 输出分页列表
// 分页跳转
// 分页路由处理
import m from "mithril";
import { SkipPrevButton, SkipNextButton } from "./skip";
// import { TextLimit } from "./limit";
import { defaultsDeep, pick } from "lodash";
import { PaginationText } from "./text";
import { PaginationContainer } from "./container";
// 上一页 页码/总页数 下一页
export let ShortPagination = {
  view: ({ attrs }) => {
    return m(PaginationContainer, pick(attrs, ["container", "params"]), [
      m(SkipPrevButton, pick(attrs, ["skipPrevButton", "params"])),
      m(PaginationText, pick(attrs, ["text", "params"])),
      m(SkipNextButton, pick(attrs, ["skipNextButton", "params"])),
    ]);
  },
};
// 标准分页
export let Pagination = {
  oninit: ({ attrs, state }) => {
    attrs.total = Math.ceil(attrs.count / attrs.limit);
    attrs.current = Math.ceil(attrs.skip / attrs.limit);
    // state.Pagination = pickBy(attrs, (value, key) => {
    //   ["skip", "limit"];
    // });
    defaultsDeep(state.Pagination, {
      class: "mm-Pagination",
    });
  },
  view: ({ attrs, state, children }) => {
    console.log(this);
    return m("div", state.Pagination, children);
  },
};
