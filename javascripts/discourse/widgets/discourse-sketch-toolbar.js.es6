import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-sketch-toolbar", {
  tagName: "div.toolbar",

  template: hbs`
    {{attach widget="button"
      attrs=(hash
        icon="trash-alt"
        action="onClearCanvas"
      )
    }}

    {{attach
      widget="discourse-sketch-shape-button"
      attrs=(hash
        icon="square"
        action="onNewElement"
        actionParam="rectangle"
        type="rectangle"
      )
    }}
  `
});
