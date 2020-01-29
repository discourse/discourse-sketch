import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";
import { viewportCoordsToSceneCoords } from "../lib/utils";

const CANVAS_WIDTH = 690;
const CANVAS_HEIGHT = 400;

export default createWidget("discourse-sketch-canvas", {
  tagName: "canvas#canvas",

  // click(e) {
  //   // this.sendWidgetAction(
  //   //   "newEditingElement",
  //   //   viewportCoordsToSceneCoords(e, { scrollX: 0, scrollY: 0 })
  //   // );
  //   console.log("click", e);
  // },
  //
  // doubleClick(e) {
  //   console.log("doubleClick", e);
  // },
  buildAttributes() {
    return {
      style: `width: ${CANVAS_WIDTH}px; height: ${CANVAS_HEIGHT}px`,
      width: CANVAS_WIDTH * window.devicePixelRatio,
      height: CANVAS_HEIGHT * window.devicePixelRatio,
      "data-random": Math.random()
    };
  },

  scheduleRerender() {
    console.log("scheduleRerender");
    return;
  },

  mouseDown(e) {
    this.sendWidgetAction(
      "startDrawingElement",
      viewportCoordsToSceneCoords(e, { scrollX: 0, scrollY: 0 })
    );
  },

  mouseUp(e) {
    this.sendWidgetAction(
      "endDrawingElement",
      viewportCoordsToSceneCoords(e, { scrollX: 0, scrollY: 0 })
    );
  },

  mouseMove(e) {
    this.sendWidgetAction(
      "drawingElement",
      viewportCoordsToSceneCoords(e, { scrollX: 0, scrollY: 0 })
    );
  }
});
