import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";
import { viewportCoordsToSceneCoords } from "../lib/utils";

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
      style: "width:690px;height:400px",
      width: 690 * window.devicePixelRatio,
      height: 400 * window.devicePixelRatio
    };
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
    // console.log("mouseMove", e);
  }
});
