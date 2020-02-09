import { hitTest } from "./collision";

const CANVAS_WINDOW_OFFSET_LEFT = 0;
const CANVAS_WINDOW_OFFSET_TOP = 0;

export function viewportCoordsToSceneCoords(
  { clientX, clientY },
  { scrollX, scrollY }
) {
  const canvas = event.target;
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left - CANVAS_WINDOW_OFFSET_LEFT - scrollX;
  const y = clientY - rect.top - CANVAS_WINDOW_OFFSET_TOP - scrollY;
  return { x: Math.max(x, 0), y: Math.max(y, 0) };
}

export function distance(x, y) {
  return Math.abs(x - y);
}

export function applyPixelRatio(canvas, width, height) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  canvas.getContext("2d").scale(ratio, ratio);
}

export function getElementAtPosition(elements, x, y) {
  let hitElement = null;
  // We need to to hit testing from front (end of the array) to back (beginning of the array)
  for (let i = elements.length - 1; i >= 0; --i) {
    if (hitTest(elements[i], x, y)) {
      hitElement = elements[i];
      break;
    }
  }

  return hitElement;
}
