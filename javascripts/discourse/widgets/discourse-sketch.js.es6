import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-sketch", {
  tagName: "div.sketch",

  buildKey: attrs => `sketch-${attrs.id}`,

  defaultState() {
    return {
      draggingElement: null,
      resizingElement: null,
      editingElement: null,
      elementType: "selection",
      elementLocked: false,
      exportBackground: true,
      currentItemStrokeColor: "#000000",
      currentItemBackgroundColor: "transparent",
      currentItemFillStyle: "hachure",
      currentItemStrokeWidth: 1,
      currentItemRoughness: 1,
      currentItemOpacity: 100,
      currentItemFont: "20px Virgil",
      viewBackgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      cursorX: 0,
      cursorY: 0,
      name: "sketch"
    };
  },

  setState({ property, value } = params) {
    console.log("setState", property, value);
    this.state[property] = value;
  },

  newEditingElement(elementType) {
    const editingElement = {
      elementType,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      currentItemStrokeColor: this.state.currentItemStrokeColor,
      currentItemBackgroundColor: this.state.currentItemBackgroundColor,
      currentItemFillStyle: this.state.currentItemFillStyle,
      currentItemStrokeWidth: this.state.currentItemStrokeWidth,
      currentItemRoughness: this.state.currentItemRoughness,
      currentItemOpacity: this.state.currentItemOpacity
    };

    this.setState({ property: "editingElement", value: editingElement });
  },

  startDrawingElement({ x, y } = coordinates) {
    const editingElement = this.state.editingElement;
    if (editingElement) {
      editingElement.x = x;
      editingElement.y = y;
    }
  },

  endDrawingElement({ x, y } = coordinates) {
    const editingElement = this.state.editingElement;
    if (editingElement) {
      editingElement.x = x;
      editingElement.y = y;

      const rc = window.rough.canvas(document.getElementById("canvas"));
      console.log(rc, editingElement);
      rc.rectangle(
        editingElement.x - 250 / 2,
        editingElement.y - 250 / 2,
        250,
        250,
        {
          roughness: 2.8,
          fill: "blue"
        }
      ); // x, y, width, height
    }
  },

  template: hbs`
    <b>{{state.name}}</b>

    {{attach
      widget="discourse-sketch-toolbar"
    }}

    {{attach
      widget="discourse-sketch-canvas"
    }}
  `
});
