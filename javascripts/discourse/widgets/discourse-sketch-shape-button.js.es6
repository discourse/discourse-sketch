import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-sketch-shape-button", {
  tagName: "div.shape-button",

  onCreateShape(type) {
    this.sendWidgetAction("newEditingElement", type);
  },

  template: hbs`
    {{attach widget="button"
      attrs=(hash
        icon="square"
        action="onCreateShape"
        actionParam="rectangle"
      )
    }}
  `
});
