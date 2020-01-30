import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";
import { distance } from "../lib/utils";

export default createWidget("discourse-sketch", {
  tagName: "div.sketch",

  buildKey: attrs => `sketch-${attrs.id}`,

  init() {
    Ember.run.schedule("afterRender", () => {
      this.canvas = document.getElementById("canvas");

      if (!this.canvas.getAttribute("setup")) {
        this.canvas.setAttribute("setup", 1);
        this._setupCanvas(this.canvas);
      }

      this.roughCanvas = window.rough.canvas(this.canvas);
    });
  },

  defaultState() {
    return {
      elements: [],
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
    this.state[property] = value;
  },

  onClearCanvas() {
    this.state.elements = [];
    this.renderScene();
  },

  newEditingElement(elementType) {
    this.setState({ property: "elementType", value: elementType });
  },

  mouseDownCanvas({ x, y } = coordinates) {
    if (this.state.elementType === "rectangle") {
      let element = {};
      element.id =
        "_" +
        Math.random()
          .toString(36)
          .substr(2, 9);
      element.elementType = this.state.elementType;
      element.width = 0;
      element.height = 0;
      element.strokeColor = this.state.currentItemStrokeColor;
      element.backgroundColor = this.state.currentItemBackgroundColor;
      element.fillStyle = this.state.currentItemFillStyle;
      element.strokeWidth = this.state.currentItemStrokeWidth;
      element.roughness = this.state.currentItemRoughness;
      element.opacity = this.state.currentItemOpacity;
      element.x = x;
      element.y = y;

      element.shape = this.roughCanvas.rectangle(
        element.x,
        element.y,
        element.width,
        element.height,
        {
          roughness: 2.8,
          fill: "blue",
          fillStyle: element.fillStyle
        }
      );

      this.setState({ property: "draggingElement", value: element });
      this.state.elements.push(element);

      this.renderScene();
    }
  },

  mouseUpCanvas({ x, y } = coordinates) {
    const draggingElement = this.state.draggingElement;
    if (draggingElement) {
      const element = this.state.elements.findBy(
        "id",
        this.state.draggingElement.id
      );
      element.width = distance(element.x, x);
      element.height = distance(element.y, y);

      this.setState({ property: "draggingElement", value: null });

      this.renderScene();
    }
  },

  mouseMoveCanvas({ x, y } = coordinates) {
    if (this.state.draggingElement) {
      const element = this.state.elements.findBy(
        "id",
        this.state.draggingElement.id
      );
      element.width = distance(element.x, x);
      element.height = distance(element.y, y);
      element.shape = this.roughCanvas.rectangle(
        element.x,
        element.y,
        element.width,
        element.height,
        {
          roughness: 2.8,
          fill: "blue",
          fillStyle: element.fillStyle
        }
      );

      this.renderScene();
    }
  },

  renderScene() {
    if (!this.canvas) {
      return;
    }

    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.state.elements.forEach(element => {
      this.renderElement(element, context);
    });
  },

  renderElement(element, context) {
    context.globalAlpha = element.opacity / 100;
    this.roughCanvas.draw(element.shape);
    context.globalAlpha = 1;
  },

  template: hbs`
    <b>{{state.name}}</b>

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
  `,

  _setupCanvas(canvas) {
    const ratio = window.devicePixelRatio || 1;
    let width = 690;
    let height = 400;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.getContext("2d").scale(ratio, ratio);
  }
});
