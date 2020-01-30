import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-sketch-toolbar", {
  tagName: "div.toolbar",

  onTrashButton() {
    this.sendWidgetAction("onClearCanvas");
  },

  template: hbs`
    {{attach widget="button"
      attrs=(hash
        icon="trash-alt"
        action="onTrashButton"
      )
    }}

    {{attach
      widget="discourse-sketch-shape-button"
      attrs=(hash
        icon="square"
        action="newEditingElement"
        actionParam="rectangle"
        type="rectangle"
      )
    }}
  `
});
