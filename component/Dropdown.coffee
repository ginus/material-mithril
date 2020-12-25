import { Menu, Button, List, ListTile } from 'polythene-mithril'
import m from 'mithril'

export Dropdown = {
  oninit: ({ attrs, state }) ->
    state.menuOptions = [1..10].map (n) ->
      {
        title: "Menu item #{n}"
        key: n
      }
    state.buttonId = "id-demo"
    state.show = true
    state.selectedIndex = 0
  view: ({ attrs, state }) ->
    selectedIndex = state.selectedIndex
    m "div", {
      style: {
        position: "relative"
        height: "inherit"
      }
    }, [
      m Menu, {
        target: '#' + state.buttonId
        show: state.show
        didHide: () ->
          state.show = false
        hideDelay: .180,
        width: 3,
        height: attrs.height,
        scrollTarget: "#item-#{selectedIndex}",
        origin: "top",
        backdrop: true,
        content: m(List, {
          compact: true,
          tiles: state.menuOptions.map((item, index) ->
            m(ListTile, {
              title: item.title,
              id: "item-#{index}",
              selected: index == state.selectedIndex,
              ink: true,
              hoverable: true,
              events: {
                onclick: () ->
                  state.selectedIndex = index
                  state.show = false
              }
            })
          )
        })
      }
      m Button, {
        id: state.buttonId
        label: state.menuOptions[selectedIndex].title
        dropdown: {
          open: state.show
        }
        events: {
          onclick: () ->
            console.log state
            state.show = not state.show
        }
      }
    ]
}
