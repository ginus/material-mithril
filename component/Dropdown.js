import {
  Menu,
  Button,
  List,
  ListTile
} from 'polythene-mithril';

import m from 'mithril';

export let Dropdown = {
  oninit: function ({ attrs, state }) {
    state.menuOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) {
      return {
        title: `Menu item ${n}`,
        key: n
      };
    });
    state.buttonId = "id-demo";
    state.show = true;
    state.selectedIndex = 0;
  },
  view: function ({ attrs, state }) {
    var selectedIndex;
    selectedIndex = state.selectedIndex;
    return m("div", {
      style: {
        position: "relative",
        height: "inherit"
      }
    }, [
      m(Menu,
        {
          target: '#' + state.buttonId,
          show: state.show,
          didHide: function () {
            return state.show = false;
          },
          hideDelay: .180,
          width: 3,
          height: attrs.height,
          scrollTarget: `#item-${selectedIndex}`,
          origin: "top",
          backdrop: true,
          content: m(List,
            {
              compact: true,
              tiles: state.menuOptions.map(function (item,
                index) {
                return m(ListTile,
                  {
                    title: item.title,
                    id: `item-${index}`,
                    selected: index === state.selectedIndex,
                    ink: true,
                    hoverable: true,
                    events: {
                      onclick: function () {
                        state.selectedIndex = index;
                        return state.show = false;
                      }
                    }
                  });
              })
            })
        }),
      m(Button,
        {
          id: state.buttonId,
          label: state.menuOptions[selectedIndex].title,
          dropdown: {
            open: state.show
          },
          events: {
            onclick: function () {
              console.log(state);
              return state.show = !state.show;
            }
          }
        })
    ]);
  }
};
