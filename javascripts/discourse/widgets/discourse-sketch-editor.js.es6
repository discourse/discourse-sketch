import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-sketch-editor", {
  tagName: "div.editor",

  template: hbs`
    <fieldset>
      <legend>Fill</legend>
      <div class="buttonList">
        <label class="">
          {{attach
            widget="discourse-sketch-option-radio"
            attrs=(hash
              name="currentItemFillStyle"
              value="solid"
              checkedValue=attrs.sketchState.currentItemFillStyle
            )
          }}
          <span>Solid</span>
        </label>

        <label class="active">
          {{attach
            widget="discourse-sketch-option-radio"
            attrs=(hash
              name="currentItemFillStyle"
              value="hachure"
              checkedValue=attrs.sketchState.currentItemFillStyle
            )
          }}
          <span>Hachure</span>
        </label>

        <label class="">
          {{attach
            widget="discourse-sketch-option-radio"
            attrs=(hash
              name="currentItemFillStyle"
              value="cross-hatch"
              checkedValue=attrs.sketchState.currentItemFillStyle
            )
          }}
          <span>Cross-Hatch</span>
        </label>
      </div>
    </fieldset>
  `
});
