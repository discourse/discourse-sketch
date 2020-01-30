import { renderElement } from "./element";

export function renderScene(canvas, roughCanvas, elements) {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  elements.forEach(element => {
    renderElement(roughCanvas, element, context);
  });
}
