export function newElement(
  type,
  x,
  y,
  originX,
  originY,
  strokeColor,
  backgroundColor,
  fillStyle,
  strokeWidth,
  roughness,
  opacity,
  width = 0,
  height = 0
) {
  return {
    id: "_" + Math.random().toString(36).substr(2, 9),
    type,
    x,
    y,
    originX,
    originY,
    width,
    height,
    strokeColor,
    backgroundColor,
    fillStyle,
    strokeWidth,
    roughness,
    opacity,
    isSelected: false,
    shape: null,
  };
}

export function renderElement(roughCanvas, element, context) {
  if (!element.shape) {
    element = generateElement(element, roughCanvas);
  }

  context.globalAlpha = element.opacity / 100;
  roughCanvas.draw(element.shape);
  context.globalAlpha = 1;
}

export function generateElement(element, roughCanvas) {
  switch (element.type) {
    case "rectangle":
      element.shape = roughCanvas.rectangle(
        element.x,
        element.y,
        element.width,
        element.height,
        {
          stroke: element.strokeColor,
          fill:
            element.backgroundColor === "transparent"
              ? undefined
              : element.backgroundColor,
          fillStyle: element.fillStyle,
          strokeWidth: element.strokeWidth,
          roughness: element.roughness,
        }
      );
      break;
    case "ellipse":
      element.shape = roughCanvas.ellipse(
        element.x + element.width / 2,
        element.y + element.height / 2,
        element.width,
        element.height,
        {
          stroke: element.strokeColor,
          fill:
            element.backgroundColor === "transparent"
              ? undefined
              : element.backgroundColor,
          fillStyle: element.fillStyle,
          strokeWidth: element.strokeWidth,
          roughness: element.roughness,
          curveFitting: 1,
        }
      );
      break;
  }

  return element;
}

export function updateElementOptions(element, state, roughCanvas) {
  element.strokeColor = state.currentItemStrokeColor;
  element.backgroundColor = state.currentItemBackgroundColor;
  element.fillStyle = state.currentItemFillStyle;
  element.strokeWidth = state.currentItemStrokeWidth;
  element.roughness = state.currentItemRoughness;
  element.opacity = state.currentItemOpacity;
  return generateElement(element, roughCanvas);
}
