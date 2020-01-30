import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";
import { distance, applyPixelRatio } from "../lib/utils";
import { newElement, generateElement } from "../lib/element";
import { renderScene } from "../lib/scene";
import { defaultSketchState } from "../lib/sketch-state";

export default createWidget("discourse-sketch", {
  tagName: "div.sketch",

  buildKey: attrs => `sketch-${attrs.id}`,

  buildAttributes() {
    return {
      id: this.key
    };
  },

  init() {
    Ember.run.schedule("afterRender", () => {
      this.canvas = document
        .getElementById(this.key)
        .querySelector("canvas#canvas");

      if (!this.canvas.getAttribute("setup")) {
        this.canvas.setAttribute("setup", 1);
        applyPixelRatio(this.canvas, 690, 400);
      }

      this.roughCanvas = window.rough.canvas(this.canvas);
    });
  },

  defaultState() {
    return defaultSketchState();
  },

  setState({ property, value }) {
    this.state[property] = value;
  },

  onClearCanvas() {
    this.state.elements = [];
    this.renderScene();
  },

  onNewElement(elementType) {
    this.setState({ property: "elementType", value: elementType });
  },

  onMouseDownCanvas({ x, y }) {
    if (this.state.elementType) {
      let element = newElement(
        this.state.elementType,
        x,
        y,
        x,
        y,
        this.state.currentItemStrokeColor,
        this.state.currentItemBackgroundColor,
        this.state.currentItemFillStyle,
        this.state.currentItemStrokeWidth,
        this.state.currentItemRoughness,
        this.state.currentItemOpacity
      );
      element = generateElement(element, this.roughCanvas);

      this.setState({ property: "draggingElement", value: element });
      this.state.elements.push(element);

      this.renderScene();
    }
  },

  onMouseUpCanvas({ x, y }) {
    if (this.state.draggingElement) {
      const element = this.state.elements.findBy(
        "id",
        this.state.draggingElement.id
      );
      element.width = distance(element.x, x);
      element.height = distance(element.y, y);

      this.renderScene();

      this.setState({ property: "draggingElement", value: null });
    }
  },

  onMouseMoveCanvas({ x, y }) {
    if (this.state.draggingElement) {
      let element = this.state.elements.findBy(
        "id",
        this.state.draggingElement.id
      );

      const xDistance = distance(element.originX, x);
      if (x < element.originX) {
        element.x = x;
      }
      element.width = xDistance;

      const yDistance = distance(element.originY, y);
      if (y < element.originY) {
        element.y = y;
      }
      element.height = yDistance;

      element = generateElement(element, this.roughCanvas);

      this.renderScene();
    }
  },

  renderScene() {
    renderScene(this.canvas, this.roughCanvas, this.state.elements);
  },

  template: hbs`
    {{attach
      widget="discourse-sketch-toolbar"
    }}

    {{attach
      widget="discourse-sketch-canvas"
    }}

    {{attach
      widget="discourse-sketch-editor"
      attrs=(hash
        sketchState=state
      )
    }}
  `
});
