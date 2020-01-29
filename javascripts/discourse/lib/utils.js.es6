const CANVAS_WINDOW_OFFSET_LEFT = 0;
const CANVAS_WINDOW_OFFSET_TOP = 0;

export function viewportCoordsToSceneCoords(
  { clientX, clientY } = event,
  { scrollX, scrollY } = state
) {
  const x = clientX - CANVAS_WINDOW_OFFSET_LEFT - scrollX;
  const y = clientY - CANVAS_WINDOW_OFFSET_TOP - scrollY;
  return { x, y };
}
