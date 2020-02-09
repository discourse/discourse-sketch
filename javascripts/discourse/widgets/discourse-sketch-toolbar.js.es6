import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-sketch-toolbar", {
  tagName: "div.toolbar",

  transform(attrs) {
    return {
      savedDisabled: !attrs.sketchState.__isDirty
    };
  },

  template: hbs`
    {{attach widget="button"
      attrs=(hash
        icon="trash-alt"
        action="onClearCanvas"
      )
    }}
    {{attach widget="button"
      attrs=(hash
        icon="save"
        action="onSaveCanvas"
        disabled=this.transformed.savedDisabled
      )
    }}

    {{attach
      widget="discourse-sketch-shape-button"
      attrs=(hash
        sketchState=attrs.sketchState
        icon="mouse-pointer"
        action="onNewElement"
        actionParam="selection"
      )
    }}

    {{attach
      widget="discourse-sketch-shape-button"
      attrs=(hash
        sketchState=attrs.sketchState
        icon="square"
        action="onNewElement"
        actionParam="rectangle"
      )
    }}

    {{attach
      widget="discourse-sketch-shape-button"
      attrs=(hash
        sketchState=attrs.sketchState
        icon="circle"
        action="onNewElement"
        actionParam="ellipse"
      )
    }}
  `
});
