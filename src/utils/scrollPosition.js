function getScrollEl() {
  const layout = document.querySelector(".layout");
  if (layout) {
    const oy = getComputedStyle(layout).overflowY;
    if (oy && oy !== "visible") return layout;
  }
  return document.scrollingElement || document.documentElement;
}

function isDocEl(el) {
  const docEl = document.scrollingElement || document.documentElement;
  return el === docEl || el === document.documentElement || el === document.body;
}

export function getAppScrollY() {
  const el = getScrollEl();
  return isDocEl(el) ? window.scrollY || 0 : el.scrollTop || 0;
}

export function setAppScrollY(y = 0) {
  const el = getScrollEl();
  if (isDocEl(el)) {
    window.scrollTo(0, y);
    return;
  }
  el.scrollTop = y;
}

