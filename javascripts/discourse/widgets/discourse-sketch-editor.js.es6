import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-sketch-editor", {
  tagName: "div.editor",

  template: hbs`
    <fieldset>
      <legend><b>Fill</b></legend>
      <div class="buttonList">
        {{attach
          widget="discourse-sketch-option-radio"
          attrs=(hash
            label="Solid"
            name="currentItemFillStyle"
            value="solid"
            checkedValue=attrs.sketchState.editingElement.fillStyle
          )
        }}

        {{attach
          widget="discourse-sketch-option-radio"
          attrs=(hash
            label="Hachure"
            name="currentItemFillStyle"
            value="hachure"
            checkedValue=attrs.sketchState.editingElement.fillStyle
          )
        }}

        {{attach
          widget="discourse-sketch-option-radio"
          attrs=(hash
            label="Cross Hatch"
            name="currentItemFillStyle"
            value="cross-hatch"
            checkedValue=attrs.sketchState.editingElement.fillStyle
          )
        }}
      </div>
    </fieldset>
  `
});
