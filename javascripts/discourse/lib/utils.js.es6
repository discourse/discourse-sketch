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

function isElementDraggableFromInside(element) {
  return element.backgroundColor !== "transparent" || element.isSelected;
}

export function hitTest(element, x, y) {
  // For shapes that are composed of lines, we only enable point-selection when the distance
  // of the click is less than x pixels of any of the lines that the shape is composed of
  const lineThreshold = 10;

  if (element.type === "ellipse") {
    // https://stackoverflow.com/a/46007540/232122
    const px = Math.abs(x - element.x - element.width / 2);
    const py = Math.abs(y - element.y - element.height / 2);

    let tx = 0.707;
    let ty = 0.707;

    const a = Math.abs(element.width) / 2;
    const b = Math.abs(element.height) / 2;

    [0, 1, 2, 3].forEach(() => {
      const xx = a * tx;
      const yy = b * ty;

      const ex = ((a * a - b * b) * tx ** 3) / a;
      const ey = ((b * b - a * a) * ty ** 3) / b;

      const rx = xx - ex;
      const ry = yy - ey;

      const qx = px - ex;
      const qy = py - ey;

      const r = Math.hypot(ry, rx);
      const q = Math.hypot(qy, qx);

      tx = Math.min(1, Math.max(0, ((qx * r) / q + ex) / a));
      ty = Math.min(1, Math.max(0, ((qy * r) / q + ey) / b));
      const t = Math.hypot(ty, tx);
      tx /= t;
      ty /= t;
    });

    if (isElementDraggableFromInside(element)) {
      return (
        a * tx - (px - lineThreshold) >= 0 && b * ty - (py - lineThreshold) >= 0
      );
    } else {
      return Math.hypot(a * tx - px, b * ty - py) < lineThreshold;
    }
  } else if (element.type === "rectangle") {
    const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);

    if (isElementDraggableFromInside(element)) {
      return (
        x > x1 - lineThreshold &&
        x < x2 + lineThreshold &&
        y > y1 - lineThreshold &&
        y < y2 + lineThreshold
      );
    }

    // (x1, y1) --A-- (x2, y1)
    //    |D             |B
    // (x1, y2) --C-- (x2, y2)
    return (
      distanceBetweenPointAndSegment(x, y, x1, y1, x2, y1) < lineThreshold || // A
      distanceBetweenPointAndSegment(x, y, x2, y1, x2, y2) < lineThreshold || // B
      distanceBetweenPointAndSegment(x, y, x2, y2, x1, y2) < lineThreshold || // C
      distanceBetweenPointAndSegment(x, y, x1, y2, x1, y1) < lineThreshold // D
    );
  } else if (element.type === "diamond") {
    x -= element.x;
    y -= element.y;

    let [
      topX,
      topY,
      rightX,
      rightY,
      bottomX,
      bottomY,
      leftX,
      leftY
    ] = getDiamondPoints(element);

    if (isElementDraggableFromInside(element)) {
      // TODO: remove this when we normalize coordinates globally
      if (topY > bottomY) [bottomY, topY] = [topY, bottomY];
      if (rightX < leftX) [leftX, rightX] = [rightX, leftX];

      topY -= lineThreshold;
      bottomY += lineThreshold;
      leftX -= lineThreshold;
      rightX += lineThreshold;

      // all deltas should be < 0. Delta > 0 indicates it's on the outside side
      //  of the line.
      //
      //          (topX, topY)
      //     D  /             \ A
      //      /               \
      //  (leftX, leftY)  (rightX, rightY)
      //    C \               / B
      //      \              /
      //      (bottomX, bottomY)
      //
      // https://stackoverflow.com/a/2752753/927631
      return (
        // delta from line D
        (leftX - topX) * (y - leftY) - (leftX - x) * (topY - leftY) <= 0 &&
        // delta from line A
        (topX - rightX) * (y - rightY) - (x - rightX) * (topY - rightY) <= 0 &&
        // delta from line B
        (rightX - bottomX) * (y - bottomY) -
          (x - bottomX) * (rightY - bottomY) <=
          0 &&
        // delta from line C
        (bottomX - leftX) * (y - leftY) - (x - leftX) * (bottomY - leftY) <= 0
      );
    }

    return (
      distanceBetweenPointAndSegment(x, y, topX, topY, rightX, rightY) <
        lineThreshold ||
      distanceBetweenPointAndSegment(x, y, rightX, rightY, bottomX, bottomY) <
        lineThreshold ||
      distanceBetweenPointAndSegment(x, y, bottomX, bottomY, leftX, leftY) <
        lineThreshold ||
      distanceBetweenPointAndSegment(x, y, leftX, leftY, topX, topY) <
        lineThreshold
    );
  } else if (element.type === "arrow") {
    let [x1, y1, x2, y2, x3, y3, x4, y4] = getArrowPoints(element);
    // The computation is done at the origin, we need to add a translation
    x -= element.x;
    y -= element.y;

    return (
      //    \
      distanceBetweenPointAndSegment(x, y, x3, y3, x2, y2) < lineThreshold ||
      // -----
      distanceBetweenPointAndSegment(x, y, x1, y1, x2, y2) < lineThreshold ||
      //    /
      distanceBetweenPointAndSegment(x, y, x4, y4, x2, y2) < lineThreshold
    );
  } else if (element.type === "line") {
    const [x1, y1, x2, y2] = getLinePoints(element);
    // The computation is done at the origin, we need to add a translation
    x -= element.x;
    y -= element.y;

    return distanceBetweenPointAndSegment(x, y, x1, y1, x2, y2) < lineThreshold;
  } else if (element.type === "text") {
    const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);

    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  } else if (element.type === "selection") {
    console.warn("This should not happen, we need to investigate why it does.");
    return false;
  } else {
    throw new Error("Unimplemented type " + element.type);
  }
}

export function getElementAbsoluteCoords(element) {
  return [
    element.width >= 0 ? element.x : element.x + element.width, // x1
    element.height >= 0 ? element.y : element.y + element.height, // y1
    element.width >= 0 ? element.x + element.width : element.x, // x2
    element.height >= 0 ? element.y + element.height : element.y // y2
  ];
}

export function getDiamondPoints(element) {
  // Here we add +1 to avoid these numbers to be 0
  // otherwise rough.js will throw an error complaining about it
  const topX = Math.floor(element.width / 2) + 1;
  const topY = 0;
  const rightX = element.width;
  const rightY = Math.floor(element.height / 2) + 1;
  const bottomX = topX;
  const bottomY = element.height;
  const leftX = topY;
  const leftY = rightY;

  return [topX, topY, rightX, rightY, bottomX, bottomY, leftX, leftY];
}

export function getArrowPoints(element) {
  const x1 = 0;
  const y1 = 0;
  const x2 = element.width;
  const y2 = element.height;

  const size = 30; // pixels
  const distanceBetweenPoints = Math.hypot(x2 - x1, y2 - y1);
  // Scale down the arrow until we hit a certain size so that it doesn't look weird
  const minSize = Math.min(size, distanceBetweenPoints / 2);
  const xs = x2 - ((x2 - x1) / distanceBetweenPoints) * minSize;
  const ys = y2 - ((y2 - y1) / distanceBetweenPoints) * minSize;

  const angle = 20; // degrees
  const [x3, y3] = rotate(xs, ys, x2, y2, (-angle * Math.PI) / 180);
  const [x4, y4] = rotate(xs, ys, x2, y2, (angle * Math.PI) / 180);

  return [x1, y1, x2, y2, x3, y3, x4, y4];
}

export function getLinePoints(element) {
  const x1 = 0;
  const y1 = 0;
  const x2 = element.width;
  const y2 = element.height;

  return [x1, y1, x2, y2];
}

export function getCommonBounds(elements) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  elements.forEach(element => {
    const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);
    minX = Math.min(minX, x1);
    minY = Math.min(minY, y1);
    maxX = Math.max(maxX, x2);
    maxY = Math.max(maxY, y2);
  });

  return [minX, minY, maxX, maxY];
}

// https://stackoverflow.com/a/6853926/232122
function distanceBetweenPointAndSegment(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSquare = C * C + D * D;
  let param = -1;
  if (lenSquare !== 0) {
    // in case of 0 length line
    param = dot / lenSquare;
  }

  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.hypot(dx, dy);
}

function rotate(x1, y1, x2, y2, angle) {
  // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
  // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
  // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
  return [
    (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
    (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2
  ];
}
