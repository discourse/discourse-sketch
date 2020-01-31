import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";
import { distance, applyPixelRatio, getElementAtPosition } from "../lib/utils";
import {
  newElement,
  generateElement,
  updateElementOptions
} from "../lib/element";
import { renderScene } from "../lib/scene";
import { defaultSketchState } from "../lib/sketch-state";
import {
  getCursorForResizingElement,
  getElementWithResizeHandler
} from "../lib/resize-test";

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
    this.setState({ property: "elements", value: [] });
    this.setState({ property: "elementType", value: null });
    this.renderScene();
  },

  onNewElement(elementType) {
    this.state.elements.forEach(e => (e.isSelected = false));

    const editingElement = newElement(
      elementType,
      0,
      0,
      0,
      0,
      this.state.currentItemStrokeColor,
      this.state.currentItemBackgroundColor,
      this.state.currentItemFillStyle,
      this.state.currentItemStrokeWidth,
      this.state.currentItemRoughness,
      this.state.currentItemOpacity
    );

    this.setState({ property: "resizingElement", value: null });
    this.setState({ property: "draggingElement", value: null });
    this.setState({ property: "editingElement", value: editingElement });
    this.setState({ property: "elementType", value: elementType });
  },

  onMouseDownCanvas({ x, y }) {
    let editingElement = this.state.editingElement;
    const creatingElement = editingElement && !editingElement.shape;

    if (creatingElement) {
      editingElement = generateElement(editingElement, this.roughCanvas);
      editingElement.x = editingElement.originX = x;
      editingElement.y = editingElement.originY = y;
      editingElement.isSelected = true;

      this.state.elements.push(editingElement);
      this.state.resizingElement = editingElement;
      this.state.draggingElement = null;
      this.renderScene();
      return;
    }

    if (this.state.elementType === "selection") {
      const resizeElement = getElementWithResizeHandler(
        this.state.elements,
        { x, y },
        { scrollX: 0, scrollY: 0 }
      );
      this.state.resizingElement = resizeElement ? resizeElement.element : null;

      if (resizeElement) {
        document.documentElement.style.cursor = getCursorForResizingElement(
          resizeElement
        );
      }
      this.renderScene();
    } else {
      const hitElement = getElementAtPosition(this.state.elements, x, y);
      if (hitElement) {
        this.state.elements.forEach(e => (e.isSelected = false));
        this.setEditingElement(hitElement);
        this.state.draggingElement = hitElement;
        this.state.resizingElement = null;
        this.state.elementType = "selection";
        this.renderScene();
      } else {
        this.state.elements.forEach(e => (e.isSelected = false));
        this.state.draggingElement = null;
        this.setEditingElement(null);
        this.state.resizingElement = null;
        this.state.elementType = "selection";
        this.renderScene();
      }
    }
  },

  onMouseMoveCanvas({ x, y }) {
    const resizingElement = this.state.resizingElement;
    if (resizingElement && resizingElement.shape) {
      const xDistance = distance(resizingElement.originX, x);
      if (x < resizingElement.originX) {
        resizingElement.x = x;
      }
      resizingElement.width = xDistance;

      const yDistance = distance(resizingElement.originY, y);
      if (y < resizingElement.originY) {
        resizingElement.y = y;
      }
      resizingElement.height = yDistance;

      generateElement(resizingElement, this.roughCanvas);

      this.renderScene();
      return;
    }

    const hitElement = getElementAtPosition(this.state.elements, x, y);
    document.documentElement.style.cursor = hitElement ? "move" : "";

    const draggingElement = this.state.draggingElement;
    if (draggingElement) {
      let element = this.state.elements.findBy("id", draggingElement.id);
      element.x = x - element.width / 2;
      element.y = y - element.height / 2;
      generateElement(element, this.roughCanvas);
      this.renderScene();
      return;
    }
  },

  onMouseUpCanvas() {
    this.state.resizingElement = null;
    this.state.draggingElement = null;
    this.state.elementType = "selection";

    this.renderScene();
    this.scheduleRerender();
  },

  setEditingElement(element) {
    this.setState({ property: "editingElement", value: element });

    if (element) {
      element.isSelected = true;
      this.state.currentItemStrokeColor = element.strokeColor;
      this.state.currentItemBackgroundColor = element.backgroundColor;
      this.state.currentItemFillStyle = element.fillStyle;
      this.state.currentItemStrokeWidth = element.strokeWidth;
      this.state.currentItemRoughness = element.roughness;
      this.state.currentItemOpacity = element.opacity;
      this.state.currentItemFont = element.font;
    } else {
      this.setState(defaultSketchState());
    }

    this.scheduleRerender();
  },

  setOption([value, property]) {
    this.setState({ property, value });

    if (this.state.editingElement) {
      updateElementOptions(
        this.state.editingElement,
        this.state,
        this.roughCanvas
      );
      this.renderScene();
    }
  },

  renderScene() {
    renderScene(this.canvas, this.roughCanvas, this.state.elements);
  },

  template: hbs`
    {{attach
      widget="discourse-sketch-toolbar"
      attrs=(hash
        sketchState=state
      )
    }}

    {{attach
      widget="discourse-sketch-canvas"
    }}

    {{#if state.editingElement}}
      {{attach
        widget="discourse-sketch-editor"
        attrs=(hash
          sketchState=state
        )
      }}
    {{/if}}
  `
});
