import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-sketch-shape-button", {
  tagName: "div.shape-button",

  onButtonShapeAction(type) {
    this.sendWidgetAction(this.attrs.action, type);
  },

  template: hbs`
    {{attach widget="button"
      attrs=(hash
        icon=attrs.icon
        action="onButtonShapeAction"
        actionParam=attrs.actionParam
      )
    }}
  `
});
