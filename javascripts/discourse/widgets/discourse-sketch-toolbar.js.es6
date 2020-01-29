import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-sketch-toolbar", {
  tagName: "div.toolbar",

  template: hbs`
    {{attach
      widget="discourse-sketch-shape-button"
      attrs=(hash
        type="rectangle"
      )
    }}
  `
});
