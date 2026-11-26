import { PhysicalPosition } from "@tauri-apps/api/dpi";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef } from "react";

/**
 * Pointer-based window dragging for the undecorated overlay.
 *
 * The native `data-tauri-drag-region` was unreliable for this transparent,
 * always-on-top window, so we track the pointer ourselves and move the window
 * with `setPosition`. This REQUIRES `core:window:allow-set-position` for the
 * `guide-overlay` window (src-tauri/capabilities/overlay.json); without it every
 * move is rejected by the IPC layer and the window stays put.
 *
 * Attach `onPointerDown` to the drag handle (the title bar). Interactive children
 * matching NO_DRAG_SELECTOR never start a drag, so buttons in the bar still work.
 */
const NO_DRAG_SELECTOR = "button, a, input, textarea, select, [data-no-drag]";

type DragSession = {
  pointerId: number;
  startScreenX: number;
  startScreenY: number;
  lastScreenX: number;
  lastScreenY: number;
  originX: number;
  originY: number;
  scale: number;
  ready: boolean;
  inFlight: boolean;
  sentX: number;
  sentY: number;
};

function endDragStyles() {
  document.documentElement.classList.remove("overlay-dragging");
}

export function useOverlayDrag() {
  const session = useRef<DragSession | null>(null);
  const frame = useRef(0);

  // Stable scheduler: coalesces pointer moves to one setPosition per frame and
  // keeps a single IPC call in flight so moves stay ordered.
  const schedule = useRef(() => {});
  schedule.current = () => {
    if (frame.current) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      const drag = session.current;
      if (!drag || !drag.ready || drag.inFlight) return;
      const x = drag.originX + Math.round((drag.lastScreenX - drag.startScreenX) * drag.scale);
      const y = drag.originY + Math.round((drag.lastScreenY - drag.startScreenY) * drag.scale);
      if (x === drag.sentX && y === drag.sentY) return;
      drag.inFlight = true;
      drag.sentX = x;
      drag.sentY = y;
      getCurrentWindow()
        .setPosition(new PhysicalPosition(x, y))
        .catch((reason) => console.error("[overlay] setPosition failed", reason))
        .finally(() => {
          drag.inFlight = false;
          // Pick up any pointer movement that arrived during the IPC call.
          if (session.current === drag) schedule.current();
        });
    });
  };

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = session.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag.lastScreenX = event.screenX;
      drag.lastScreenY = event.screenY;
      schedule.current();
    };
    const stop = (event: PointerEvent) => {
      if (session.current?.pointerId !== event.pointerId) return;
      session.current = null;
      endDragStyles();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      if (frame.current) window.cancelAnimationFrame(frame.current);
      frame.current = 0;
      session.current = null;
      endDragStyles();
    };
  }, []);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest(NO_DRAG_SELECTOR)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    document.documentElement.classList.add("overlay-dragging");
    const drag: DragSession = {
      pointerId: event.pointerId,
      startScreenX: event.screenX,
      startScreenY: event.screenY,
      lastScreenX: event.screenX,
      lastScreenY: event.screenY,
      originX: 0,
      originY: 0,
      scale: window.devicePixelRatio || 1,
      ready: false,
      inFlight: false,
      sentX: Number.NaN,
      sentY: Number.NaN,
    };
    session.current = drag;
    const currentWindow = getCurrentWindow();
    Promise.all([currentWindow.outerPosition(), currentWindow.scaleFactor()])
      .then(([position, scale]) => {
        if (session.current !== drag) return;
        drag.originX = position.x;
        drag.originY = position.y;
        drag.sentX = position.x;
        drag.sentY = position.y;
        drag.scale = scale;
        drag.ready = true;
        // Apply movement that happened while the origin was loading instead of dropping it.
        schedule.current();
      })
      .catch((reason) => {
        console.error("[overlay] could not start window drag", reason);
        if (session.current === drag) session.current = null;
        endDragStyles();
      });
  }, []);

  return { onPointerDown };
}
