import { createWidget } from "discourse/widgets/widget";
import { viewportCoordsToSceneCoords } from "../lib/utils";

const CANVAS_WIDTH = 690;
const CANVAS_HEIGHT = 400;

export default createWidget("discourse-sketch-canvas", {
  tagName: "canvas#canvas",

  buildAttributes() {
    return {
      style: `width: ${CANVAS_WIDTH}px; height: ${CANVAS_HEIGHT}px`,
      width: CANVAS_WIDTH * window.devicePixelRatio,
      height: CANVAS_HEIGHT * window.devicePixelRatio
    };
  },

  scheduleRerender() {
    return;
  },

  mouseDown(e) {
    this.sendWidgetAction(
      "onMouseDownCanvas",
      viewportCoordsToSceneCoords(e, { scrollX: 0, scrollY: 0 })
    );
  },

  mouseUp(e) {
    this.sendWidgetAction(
      "onMouseUpCanvas",
      viewportCoordsToSceneCoords(e, { scrollX: 0, scrollY: 0 })
    );
  },

  mouseMove(e) {
    const target = e.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    this.sendWidgetAction(
      "onMouseMoveCanvas",
      viewportCoordsToSceneCoords(e, { scrollX: 0, scrollY: 0 })
    );
  }
});
