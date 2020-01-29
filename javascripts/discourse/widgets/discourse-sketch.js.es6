import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";
import { distance } from "../lib/utils";

export default createWidget("discourse-sketch", {
  tagName: "div.sketch",

  buildKey: attrs => `sketch-${attrs.id}`,

  init() {
    this.didSetupCanvas = false;
  },

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

  drawingElement({ x, y } = coordinates) {
    // console.log(x, y);
  },

  endDrawingElement({ x, y } = coordinates) {
    const editingElement = this.state.editingElement;
    if (editingElement) {
      editingElement.width = distance(editingElement.x, x);
      editingElement.height = distance(editingElement.y, y);

      const canvas = document.getElementById("canvas");
      // const dpr = window.devicePixelRatio || 1;
      // canvas.getContext("2d").scale(dpr, dpr);

      if (!this.didSetupCanvas) {
        this.didSetupCanvas = true;
        const ratio = window.devicePixelRatio || 1;
        let width = 690;
        let height = 400;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        canvas.getContext("2d").scale(ratio, ratio);
      }

      const rc = window.rough.canvas(canvas);
      rc.rectangle(
        editingElement.x,
        editingElement.y,
        editingElement.width,
        editingElement.height,
        {
          roughness: 2.8,
          fill: "blue"
        }
      ); // x, y, width, height
    }
  },

  afterRender(element) {
    const canvas = element.querySelector("#canvas");
    const dpr = window.devicePixelRatio || 1;
    canvas.getContext("2d").scale(dpr, dpr);
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
