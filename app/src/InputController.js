// PointerEvents unifies mouse / touch / pen. activePointers.size dispatches
// 1 = pan, 2 = pinch. The Camera emits change events that PixiMapApp listens
// to, so panBy/zoomAt automatically mark the app dirty — we only need to
// trigger a synchronous draw inside pointermove to avoid the one-frame rAF lag.
//
// Long-press attack gesture:
//   pointerdown → 300 ms timer fires → onLongPress(rec)
//   pointermove (while long-press active) → onDrag(rec)   [no pan]
//   pointerup                             → onDragEnd(rec)
// Moving more than LONG_PRESS_MOVE_CANCEL_PX before the timer fires cancels
// the gesture and falls back to normal pan behaviour.

const CLICK_MOVE_THRESHOLD_PX = 5;
const LONG_PRESS_MS = 300;
const LONG_PRESS_MOVE_CANCEL_PX = 8;

export class InputController {
  constructor(canvas, camera, app, hitTester, callbacks) {
    this.canvas = canvas;
    this.camera = camera;
    this.app = app;
    this.hitTester = hitTester;
    this.onHover = callbacks.onHover ?? (() => {});
    this.onClick = callbacks.onClick ?? (() => {});
    this.onRightClick = callbacks.onRightClick ?? (() => {});
    this.onLongPress = callbacks.onLongPress ?? (() => {});
    this.onDrag = callbacks.onDrag ?? (() => {});
    this.onDragEnd = callbacks.onDragEnd ?? (() => {});
    this.onTick = callbacks.onTick ?? (() => {});

    this.activePointers = new Map();   // pointerId -> {x, y}
    this.lastPinchDist = 0;
    this.lastPinchMid = null;
    this.downAt = null;                // {x, y, moved: number} for click detection
    this.hoverPending = null;

    this._longPressTimer = null;
    this._isLongPress = false;         // true after long-press confirmed
    this._longPressUsed = false;       // suppresses the subsequent click event

    this._loop = this._loop.bind(this);
    this._rafId = 0;
    this._bind();
    this.app.setRequestFrame(() => this._kick());
    this._kick();                      // initial draw
  }

  // Schedule a frame only if one isn't already pending. Idle code does NOT keep
  // rAF spinning — a 60Hz no-op loop burns 1-2% CPU continuously and on weak
  // devices is visibly more janky than firing on demand.
  _kick() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(this._loop);
  }

  _clearLongPress() {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  }

  _pickWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const { x, y } = this.camera.screenToWorld(clientX - rect.left, clientY - rect.top);
    return this.hitTester.pick(x, y);
  }

  _bind() {
    const c = this.canvas;

    c.addEventListener("pointerdown", (e) => {
      c.setPointerCapture(e.pointerId);
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.activePointers.size === 2) {
        this._initPinch();
        this._clearLongPress();   // two-finger gesture cancels long-press
      }
      this.downAt = { x: e.clientX, y: e.clientY, moved: 0 };
      this._isLongPress = false;
      this._longPressUsed = false;

      // Start long-press timer only for single-pointer down.
      this._clearLongPress();
      if (this.activePointers.size === 1) {
        const rec = this._pickWorld(e.clientX, e.clientY);
        this._longPressTimer = setTimeout(() => {
          this._longPressTimer = null;
          this._isLongPress = true;
          this._longPressUsed = true;
          this.onLongPress(rec);
        }, LONG_PRESS_MS);
      }
      this._kick();
    });

    c.addEventListener("pointermove", (e) => {
      this.hoverPending = { x: e.clientX, y: e.clientY };
      const prev = this.activePointers.get(e.pointerId);
      if (!prev) {
        // Pure hover: don't redraw the map, just kick the rAF so the loop can
        // run hover hit-test once. The map itself stays clean.
        this._kick();
        return;
      }
      const cur = { x: e.clientX, y: e.clientY };
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      this.activePointers.set(e.pointerId, cur);
      if (this.downAt) this.downAt.moved += Math.abs(dx) + Math.abs(dy);

      // Cancel long-press if the pointer moved too much before the timer fired.
      if (this._longPressTimer && this.downAt &&
          this.downAt.moved > LONG_PRESS_MOVE_CANCEL_PX) {
        this._clearLongPress();
      }

      // While long-press is active: route to onDrag instead of panning.
      if (this._isLongPress && this.activePointers.size === 1) {
        const rec = this._pickWorld(e.clientX, e.clientY);
        this.onDrag(rec);
        this.app.draw();
        return;
      }

      if (this.activePointers.size === 1) {
        this.camera.panBy(dx, dy);
      } else if (this.activePointers.size === 2) {
        this._handlePinch();
      }
      // Synchronous draw inside pointermove: skips the rAF queue so the cursor
      // doesn't lag the map by one frame. Camera.onChange already dirtied the app.
      this.app.draw();
    });

    const release = (e) => {
      if (this._isLongPress) {
        const rec = this._pickWorld(e.clientX, e.clientY);
        this.onDragEnd(rec);
        this._isLongPress = false;
      }
      this._clearLongPress();

      this.activePointers.delete(e.pointerId);
      if (this.activePointers.size < 2) {
        this.lastPinchDist = 0;
        this.lastPinchMid = null;
      }
      if (this.activePointers.size === 1) this._initPinch();
      this._kick();
    };
    c.addEventListener("pointerup", release);
    c.addEventListener("pointercancel", release);

    c.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const factor = Math.exp(-e.deltaY * 0.0015);
      this.camera.zoomAt(sx, sy, factor);
      this._kick();
    }, { passive: false });

    c.addEventListener("click", (e) => {
      // Suppress click that follows a completed long-press gesture.
      if (this._longPressUsed) {
        this._longPressUsed = false;
        this.downAt = null;
        return;
      }
      // Only treat as click if the pointer didn't move much between down and up.
      if (this.downAt && this.downAt.moved > CLICK_MOVE_THRESHOLD_PX) {
        this.downAt = null;
        return;
      }
      this.downAt = null;
      const rect = c.getBoundingClientRect();
      const { x, y } = this.camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const rec = this.hitTester.pick(x, y);
      this.onClick(rec);
    });

    c.addEventListener("pointerleave", () => {
      this.hoverPending = null;
      this.onHover(null, { x: 0, y: 0 });
    });

    c.addEventListener("contextmenu", (e) => {
      // Suppress the browser menu; right-click attack is handled via long-press now.
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const { x, y } = this.camera.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const rec = this.hitTester.pick(x, y);
      this.onRightClick(rec);
    });
  }

  _initPinch() {
    if (this.activePointers.size < 2) return;
    const [a, b] = [...this.activePointers.values()];
    this.lastPinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    this.lastPinchMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  _handlePinch() {
    if (this.activePointers.size < 2) return;
    const [a, b] = [...this.activePointers.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    if (this.lastPinchDist > 0 && this.lastPinchMid) {
      const rect = this.canvas.getBoundingClientRect();
      this.camera.zoomAt(mid.x - rect.left, mid.y - rect.top, dist / this.lastPinchDist);
      this.camera.panBy(mid.x - this.lastPinchMid.x, mid.y - this.lastPinchMid.y);
    }
    this.lastPinchDist = dist;
    this.lastPinchMid = mid;
  }

  _loop(_now) {
    this._rafId = 0;

    if (this.hoverPending && this.activePointers.size === 0) {
      const rect = this.canvas.getBoundingClientRect();
      const { x, y } = this.camera.screenToWorld(
        this.hoverPending.x - rect.left,
        this.hoverPending.y - rect.top,
      );
      const rec = this.hitTester.pick(x, y);
      this.onHover(rec, this.hoverPending);
      this.hoverPending = null;
    }

    this.app.draw();
    this.onTick();

    // Keep rAF alive only while still interacting or another dirty frame is
    // pending; otherwise stop until the next user event calls _kick().
    if (this.app.dirty || this.activePointers.size > 0) {
      this._kick();
    }
  }
}
