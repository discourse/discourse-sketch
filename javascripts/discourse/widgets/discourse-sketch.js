import { schedule } from "@ember/runloop";
import { ajax } from "discourse/lib/ajax";
import { cookAsync } from "discourse/lib/text";
import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";
import I18n from "discourse-i18n";
import {
  generateElement,
  newElement,
  updateElementOptions,
} from "../lib/element";
import {
  getCursorForResizingElement,
  getElementWithResizeHandler,
} from "../lib/resize-test";
import { renderScene } from "../lib/scene";
import { defaultSketchState } from "../lib/sketch-state";
import { applyPixelRatio, getElementAtPosition } from "../lib/utils";

export default createWidget("discourse-sketch", {
  tagName: "div.sketch",

  buildKey: (attrs) => `sketch-${attrs.id}`,

  buildAttributes() {
    return {
      id: this.key,
    };
  },

  init() {
    schedule("afterRender", () => {
      this.canvas = document
        .getElementById(this.key)
        .querySelector("canvas#canvas");

      if (!this.canvas.getAttribute("setup")) {
        this.canvas.setAttribute("setup", 1);
        applyPixelRatio(this.canvas, 690, 400);
      }

      this.roughCanvas = window.rough.canvas(this.canvas);

      this.renderScene();
    });
  },

  defaultState(attrs) {
    let elements = [];
    const matches = attrs.raw.match(/\[wrap=sketch\](.*?)\[\/wrap\]/ms);
    if (matches[1] && matches[1].length > 1) {
      elements = JSON.parse(matches[1]).elements || [];
    }
    return Object.assign(
      { resizeDirection: null, lastY: null, lastX: null },
      defaultSketchState(),
      {
        elements,
      }
    );
  },

  setState({ property, value }) {
    this.state[property] = value;
  },

  onClearCanvas() {
    this.state.elements = [];
    this.state.elementType = null;
    this.renderScene();
  },

  onSaveCanvas() {
    const serialized = JSON.stringify(
      {
        type: "discourse-sketch",
        version: 1,
        source: window.location.origin,
        elements: this.state.elements.map((element) => {
          delete element.shape;
          delete element.isSelected;
          return element;
        }),
        sketchState: {},
      },
      null,
      2
    );

    ajax(`/posts/${this.attrs.post.id}`, { type: "GET", cache: false }).then(
      (result) => {
        const newRaw = result.raw.replace(
          /\[wrap=sketch\].*?\[\/wrap\]/gims,
          () => `[wrap=sketch]\n${serialized}\n[/wrap]`
        );

        cookAsync(newRaw).then((cooked) => {
          this.state.__isDirty = false;

          this.attrs.post.save({
            cooked: cooked.string,
            raw: newRaw,
            edit_reason: I18n.t("checklist.edit_reason"),
          });
        });
      }
    );
  },

  onNewElement(elementType) {
    this.state.elements.forEach((e) => (e.isSelected = false));

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

    this.state.__isDirty = true;
    this.state.resizingElement = null;
    this.state.draggingElement = null;
    this.state.editingElement = editingElement;
    this.state.elementType = elementType;
  },

  onMouseDownCanvas({ x, y }) {
    let editingElement = this.state.editingElement;
    const creatingElement = editingElement && !editingElement.shape;

    if (creatingElement) {
      editingElement = generateElement(editingElement, this.roughCanvas);
      this.state.lastX = editingElement.x = x;
      this.state.lastY = editingElement.y = y;
      editingElement.isSelected = true;

      this.state.elements.push(editingElement);
      this.state.resizingElement = editingElement;
      this.state.draggingElement = null;
      this.renderScene();
      return;
    }

    const hitElement = getElementAtPosition(this.state.elements, x, y);
    if (hitElement) {
      this.state.elements.forEach((e) => (e.isSelected = false));
      this.setEditingElement(hitElement);
    } else {
      this.state.elements.forEach((e) => (e.isSelected = false));
      this.setEditingElement(null);
      this.state.draggingElement = null;
      this.state.resizingElement = null;
      this.state.elementType = "selection";
      this.renderScene();
      return;
    }

    if (this.state.elementType === "selection") {
      const resizeElement = getElementWithResizeHandler(
        this.state.elements,
        { x, y },
        { scrollX: 0, scrollY: 0 }
      );

      if (resizeElement) {
        this.state.resizingElement = resizeElement
          ? resizeElement.element
          : null;

        document.documentElement.style.cursor =
          getCursorForResizingElement(resizeElement);

        this.state.lastX = x;
        this.state.lastY = y;
      } else {
        this.state.draggingElement = hitElement;
        this.state.resizingElement = null;
        this.state.elementType = "selection";
        this.renderScene();
      }
    }
  },

  onMouseMoveCanvas({ x, y }) {
    const resizingElement = this.state.resizingElement;
    if (resizingElement && resizingElement.shape) {
      const resizeElement = getElementWithResizeHandler(
        this.state.elements,
        { x, y },
        { scrollX: 0, scrollY: 0 }
      );

      if (resizeElement || this.state.resizeDirection) {
        document.documentElement.style.cursor = resizeElement
          ? getCursorForResizingElement(resizeElement)
          : this.state.resizeDirection;

        const resizeHandle = resizeElement
          ? resizeElement.resizeHandle
          : this.state.resizeDirection;
        this.state.resizeDirection = resizeHandle;
        const deltaX = x - (this.state.lastX || x);
        const deltaY = y - (this.state.lastY || y);

        switch (resizeHandle) {
          case "nw":
            resizingElement.width -= deltaX;
            resizingElement.x += deltaX;
            resizingElement.height -= deltaY;
            resizingElement.y += deltaY;
            break;
          case "ne":
            resizingElement.width += deltaX;
            resizingElement.height -= deltaY;
            resizingElement.y += deltaY;
            break;
          case "sw":
            resizingElement.width -= deltaX;
            resizingElement.x += deltaX;
            resizingElement.height += deltaY;
            break;
          case "se":
            resizingElement.width += deltaX;
            resizingElement.height += deltaY;
            break;
          case "n":
            resizingElement.height -= deltaY;
            resizingElement.y += deltaY;
            break;
          case "w":
            resizingElement.width -= deltaX;
            resizingElement.x += deltaX;
            break;
          case "s":
            resizingElement.height += deltaY;
            break;
          case "e":
            resizingElement.width += deltaX;
            break;
        }

        this.state.lastX = x;
        this.state.lastY = y;
      }

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
      this.state.__isDirty = true;
      this.renderScene();
      return;
    }

    if (this.state.elementType === "selection") {
      const resizeElement = getElementWithResizeHandler(
        this.state.elements,
        { x, y },
        { scrollX: 0, scrollY: 0 }
      );

      if (resizeElement) {
        document.documentElement.style.cursor =
          getCursorForResizingElement(resizeElement);
      }
    }
  },

  onMouseUpCanvas() {
    this.state.resizingElement = null;
    this.state.draggingElement = null;
    this.state.elementType = "selection";
    this.state.lastX = null;
    this.state.lastY = null;
    this.state.resizeDirection = null;

    this.renderScene();
    this.scheduleRerender();
  },

  setEditingElement(element) {
    this.state.editingElement = element;

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
  `,
});
