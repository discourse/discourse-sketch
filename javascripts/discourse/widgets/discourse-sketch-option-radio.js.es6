import { createWidget } from "discourse/widgets/widget";

export default createWidget("discourse-sketch-option-radio", {
  tagName: "input",

  buildAttributes(attrs) {
    const attributes = {
      type: "radio",
      name: attrs.name,
      value: attrs.value
    };

    if (attrs.checkedValue === attrs.value) {
      attributes.checked = "";
    }

    return attributes;
  },

  change(e) {
    if (e.target.checked) {
      this.sendWidgetAction("setEditorFilling", e.target.value);
    }
  },

  scheduleRerender() {
    return;
  }
});
