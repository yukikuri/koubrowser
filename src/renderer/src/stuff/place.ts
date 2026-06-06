const DEBUG = false;

const debug = (...args: any[]) => {
  if (DEBUG) console.debug("[place]", ...args);
};

// ----------------------------------------------------------------------------------
// direction
export enum Direction {
  RightDown, //  → ↓
  RightUp,   // → ↑
  LeftDown,  // ← ↓
  LeftUp     // ← ↑
}

export function getDirection(x1: number, y1: number, x2: number, y2: number): Direction {
  if (x2 >= x1) {
    // 右方向
    if (y2 >= y1) {
      return Direction.RightDown;
    } else {
      return Direction.RightUp;
    }
  } else {
    // 左方向
    if (y2 >= y1) {
      return Direction.LeftDown;
    } else {
      return Direction.LeftUp;
    }
  }
}

// ----------------------------------------------------------------------------------
// pad
export interface Pad {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const rectsOverlap = (a: DOMRect, b: DOMRect, pad: number): boolean => {
  // pad: 見た目の余白（ピクセル）
  return !(
    a.right + pad <= b.left ||
    a.left >= b.right + pad ||
    a.bottom + pad <= b.top ||
    a.top >= b.bottom + pad
  );
}

const withinContainer = (r: DOMRect, c: DOMRect, pad: Pad): boolean => {

  return (
    r.left >= c.left + pad.left &&
    r.top >= c.top + pad.top &&
    r.right <= c.right - pad.right &&
    r.bottom <= c.bottom - pad.bottom
  );
}

/**
 * 要素がコンテナ外にはみ出している場合、コンテナ内に収まるよう
 * left/top を調整して配置する。offsetParent を考慮して相対位置を計算する。
 *
 * @param el  対象要素（position: absolute / relative 想定）
 * @param container コンテナ要素
 * @param pad 内側マージン（px）
 */
function ensureWithinContainerA(el: HTMLElement, container: HTMLElement, pad: Pad, propName: {top: string, left: string} ): void {
  const cRect = container.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const style = getComputedStyle(el);

  debug('ensureWithinContainer:', container, el, cRect, elRect);

  // check top
  if (elRect.top < (cRect.top + pad.top)) {
    const diff = cRect.top - elRect.top + pad.top;
    const currentTop = style.getPropertyValue(propName.top);
    const newTop = parseFloat(currentTop) + diff;
    el.style.setProperty(propName.top, `${newTop}px`);
    debug('adjust top overflow:', currentTop, newTop);
  }

  // check bottom
  if (elRect.bottom > (cRect.bottom - pad.bottom)) {
    const diff = elRect.bottom - cRect.bottom + pad.bottom;
    const currentTop = style.getPropertyValue(propName.top);
    const newTop = parseFloat(currentTop) - diff;
    el.style.setProperty("--top", `${newTop}px`);
    debug('adjust bottom overflow:', currentTop, newTop);
  }

  // check left
  if (elRect.left < (cRect.left + pad.left)) {
    const diff = cRect.left - elRect.left + pad.left;
    const currentLeft = style.getPropertyValue(propName.left);
    const newLeft = parseFloat(currentLeft) + diff;
    el.style.setProperty(propName.left, `${newLeft}px`);
    debug('adjust left overflow:', currentLeft, newLeft);
  }

  // check right
  if (elRect.right > (cRect.right - pad.right)) {
    const diff = elRect.right - cRect.right + pad.right;
    const currentLeft = style.getPropertyValue(propName.left);
    const newLeft = parseFloat(currentLeft) - diff;
    el.style.setProperty(propName.left, `${newLeft}px`);
    debug('adjust right overflow:', currentLeft, newLeft);
  }

}

export function ensureWithinContainerBySelector(container: HTMLElement, selector, pad: Pad, propName: {top: string, left: string} ) {
  const elems = Array.from<HTMLElement>(container.querySelectorAll(selector));
  const cRect = container.getBoundingClientRect();

  // レイアウト確定後に衝突回避
  let i = 0;
  for (const el of elems) {
    const elRect = el.getBoundingClientRect();
    if (!withinContainer(elRect, cRect, pad)) {
      debug(i, 'out of container:', elRect, cRect, el, container);
      ensureWithinContainerA(el, container, pad, propName);
    }
    ++i
  }
}

export function ensureWithinContainer(
  container: HTMLElement, 
  list: NodeListOf<HTMLElement>, 
  propName: {top: string, left: string},
  pad: Pad
 ) {
  const elems = Array.from<HTMLElement>(list);
  const cRect = container.getBoundingClientRect();

  // レイアウト確定後に衝突回避
  let i = 0;
  for (const el of elems) {
    const elRect = el.getBoundingClientRect();
    if (!withinContainer(elRect, cRect, pad)) {
      debug(i, 'out of container:', elRect, cRect, el, container);
      ensureWithinContainerA(el, container, pad, propName);
    }
    ++i
  }
}