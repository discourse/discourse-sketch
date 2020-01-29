const CANVAS_WINDOW_OFFSET_LEFT = 0;
const CANVAS_WINDOW_OFFSET_TOP = 0;

export function viewportCoordsToSceneCoords(
  { clientX, clientY } = event,
  { scrollX, scrollY } = state
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
