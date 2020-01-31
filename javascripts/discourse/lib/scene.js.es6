import { renderElement } from "./element";
import { getElementAbsoluteCoords } from "./utils";
import { handlerRectangles } from "./handler-rectangles";

export function renderScene(canvas, roughCanvas, elements) {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  elements.forEach(element => {
    renderElement(roughCanvas, element, context);
  });

  const selectedElements = elements.filter(el => el.isSelected);
  selectedElements.forEach(element => {
    const margin = 4;

    const [
      elementX1,
      elementY1,
      elementX2,
      elementY2
    ] = getElementAbsoluteCoords(element);
    const lineDash = context.getLineDash();
    context.setLineDash([8, 4]);
    context.strokeRect(
      elementX1 - margin + 0,
      elementY1 - margin + 0,
      elementX2 - elementX1 + margin * 2,
      elementY2 - elementY1 + margin * 2
    );
    context.setLineDash(lineDash);
  });

  if (selectedElements.length === 1 && selectedElements[0].type !== "text") {
    const handlers = handlerRectangles(selectedElements[0], {
      scrollX: 0,
      scrollY: 0
    });
    Object.values(handlers).forEach(handler => {
      context.strokeRect(handler[0], handler[1], handler[2], handler[3]);
    });
  }
}
