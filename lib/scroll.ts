/*  ═══════════════════════════════════════════════════════════════════
    THE SCROLL DRIVER — one source, many instruments.

    PART 8.1: the heat ramp, the maze, the spine and the dial all read
    the smoothed Lenis position rather than window.scrollY, or they
    desync from the page by a frame or two and the whole instrument
    panel starts to lie.

    Everything here is deliberately outside React. Sixty notifications
    a second through state would re-render the tree sixty times a
    second; subscribers write to the DOM directly instead.
    ═══════════════════════════════════════════════════════════════════ */

export type ScrollState = {
  /** smoothed scroll offset in px */
  y: number;
  /** 0..1 through the document */
  p: number;
  /** px per frame, signed */
  v: number;
  /** scrollable distance in px */
  limit: number;
};

type Listener = (s: ScrollState) => void;

const listeners = new Set<Listener>();

export const state: ScrollState = { y: 0, p: 0, v: 0, limit: 1 };

export function onScroll(fn: Listener): () => void {
  listeners.add(fn);
  /* hand the newcomer the current position so it paints correctly on
     mount rather than waiting for the visitor to move */
  fn(state);
  return () => {
    listeners.delete(fn);
  };
}

export function publish(y: number, limit: number, v: number) {
  state.y = y;
  state.limit = Math.max(1, limit);
  state.p = Math.min(1, Math.max(0, y / state.limit));
  state.v = v;
  for (const fn of listeners) fn(state);
}
