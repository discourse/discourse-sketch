import hbs from "discourse/widgets/hbs-compiler";
import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-sketch-option-radio", {
  tagName: "div.option-radio",

  transform(attrs) {
    return {
      icon: attrs.value === attrs.checkedValue ? "check-square" : "square",
    };
  },

  onClickOption({ value, name }) {
    this.sendWidgetAction("setOption", [value, name]);
  },

  template: hbs`
    <span>{{attrs.label}}</span>
    {{attach widget="button"
      attrs=(hash
        icon=this.transformed.icon
        action="onClickOption"
        actionParam=attrs
      )
    }}
  `,
});
