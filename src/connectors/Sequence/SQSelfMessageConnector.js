import { BaseConnector } from "../BaseConnector";

const defaultOptions = {
  nameTemplate: "sqselfmessage",
};

//
// A self message loops out from a port's lifeline, right, down, and back
// in - 4 points: [0]=from-attach, [1]=top corner, [2]=bottom corner,
// [3]=to-attach. Only the 2 corners (the "extra points") are user
// draggable; each corner drag also carries the y of the attach point on
// its own side, since that segment must stay horizontal.
//
const CORNER_X_DEFAULT = 40; // default corner offset right of the lifeline
const CORNER_X_MIN = 40; // min corner offset while dragging
const CORNER_X_MAX = 80; // max corner offset while dragging
const GAP_DEFAULT = 30; // default vertical gap between the 2 corners
const GAP_MIN = 10; // min vertical gap - top/bottom can never cross

// Sentinel returned by getNearestPointIndex (never a valid epoints index)
// meaning "drag the whole connector", not a specific point.
const WHOLE_DRAG = "whole";

function clamp(v, lo, hi) {
  return Math.min(Math.max(v, lo), hi);
}

// Shortest distance from (px,py) to the segment a-b.
function distanceToSegment(px, py, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((px - a.x) * dx + (py - a.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return Math.hypot(px - cx, py - cy);
}

class SQSelfMessageConnector extends BaseConnector {
  constructor(options, jsonModel, diagram) {
    super({ ...defaultOptions, ...options }, jsonModel, diagram);
  }

  draw(c, points, color) {
    if (points == null || points.length < 4) {
      return;
    }
    var ep = points.length - 1;
    var x2 = points[ep].x,
      x1 = points[ep - 1].x,
      y2 = points[ep].y,
      y1 = points[ep - 1].y;

    c.beginPath();
    c.fillStyle = color;
    c.strokeStyle = color;
    c.moveTo(points[0].x, points[0].y);
    for (var i = 1; i <= ep; ++i) {
      c.lineTo(points[i].x, points[i].y);
    }
    c.stroke();
    c.closePath();

    var x = 10,
      dx = x2 - x1,
      dy = y2 - y1,
      gip = Math.sqrt(dx * dx + dy * dy);

    if (gip < x) {
      return;
    }

    var sina = dy / gip,
      cosa = dx / gip,
      x3 = x2 - Math.sqrt((x * x * 3) / 4) * cosa,
      y3 = y2 - Math.sqrt((x * x * 3) / 4) * sina,
      x4 = x3 + (x * sina) / 2,
      y4 = y3 - (x * cosa) / 2,
      x5 = x3 - (x * sina) / 2,
      y5 = y3 + (x * cosa) / 2;

    c.beginPath();
    c.fillStyle = color;
    c.strokeStyle = color;
    c.moveTo(x3, y3);
    c.lineTo(x4, y4);
    c.lineTo(x2, y2);
    c.lineTo(x5, y5);
    c.lineTo(x3, y3);
    c.fill();
    c.stroke();
    c.closePath();
  }

  //
  // jQuery's .position() is relative to the current scroll (it's meant
  // for CSS placement against the canvas' own sticky top:0/left:0), but
  // every coordinate this connector stores or compares against -
  // epoints[].x/y, mouse input via startTransform/onTransform - is
  // document-space (unaffected by scroll; only ever converted to
  // viewport-space once, in _getConnectionPoints's final step). Adding
  // the live scroll straight back here keeps that the ONLY place scroll
  // enters the picture - anywhere else ends up comparing document-space
  // against viewport-space, which drifts by exactly the scroll amount on
  // whichever axis it's read raw (this bit both _getBorderRect's x and,
  // before this fix, _getConnectionPoints's own final step).
  //
  _getBorderRect(euid) {
    var $border = $("#" + euid + "_Border");
    var pos = $border.position();
    if (!pos) {
      return null;
    }
    var offset = this.diagram.getDiagramOffset();
    var left = pos.left + offset.left;
    var top = pos.top + offset.top;
    var width = $border.width();
    var height = $border.height();
    return {
      left,
      top,
      right: left + width,
      bottom: top + height,
      centerX: left + width / 2,
      centerY: top + height / 2,
    };
  }

  //
  // An attach point's x depends on what it's actually bound to: a port
  // (a narrow activation bar) attaches at its right edge, so the loop
  // visibly starts/ends flush with it - but the object instance itself
  // (attaching directly to the lifeline header, not one of its ports) is
  // a wide box, and the lifeline runs through its horizontal center, so
  // the attach point belongs there instead.
  //
  _getAttachX(attach) {
    const rect = attach.euid ? this._getBorderRect(attach.euid) : null;
    if (!rect) {
      return null;
    }
    const element =
      attach.id != null ? this.diagram.getElementById(attach.id) : null;
    const isInstance =
      element && element.options.nameTemplate === "sqobject_instance";
    return isInstance ? rect.centerX : rect.right;
  }

  //
  // Seed a brand-new connector's default loop shape from whatever the 2
  // attach points already carry (both from() and to() may point at the
  // same port, or - representing a call into a nested activation on the
  // same lifeline - 2 different, vertically stacked ports). epoints[].y
  // at this point is just creation-plumbing leftover (e.g. the mouse-drop
  // position, or 0 for the self-icon path) - anchor the default shape on
  // the attached port's own live position instead of trusting it.
  //
  _seedDefaultShape() {
    var from = { ...this.epoints[0] };
    var to = { ...this.epoints[this.epoints.length - 1] };

    var fromRect = from.euid ? this._getBorderRect(from.euid) : null;

    var fromX = this._getAttachX(from) ?? from.x;
    var toX = this._getAttachX(to) ?? to.x;

    var y0 = fromRect ? fromRect.centerY - GAP_DEFAULT / 2 : from.y;
    var y1 = y0 + GAP_DEFAULT;
    var cornerX = Math.max(fromX, toX) + CORNER_X_DEFAULT;

    this.epoints = [
      { ...from, x: fromX, y: y0 },
      { x: cornerX, y: y0 },
      { x: cornerX, y: y1 },
      { ...to, x: toX, y: y1 },
    ];
  }

  _init() {
    if (!this.epoints || this.epoints.length === 0) {
      return;
    }

    if (this.epoints.length < 4) {
      this._seedDefaultShape();
    }

    // _create() computed this.points from the pre-init epoints - refresh
    // it now that epoints holds the real 4-point loop shape.
    this.points = this._getConnectionPoints(
      this.epoints,
      this.diagram.getDiagramOffset(),
    );
  }

  //
  // Which "zone" of the shape (x, y) is nearest to.
  //
  // Normally (at least one end still attached) only the 2 corners are
  // meaningful to grab - the attach points aren't free, so there's no
  // "whole connector" to drag as a unit.
  //
  // Once BOTH ends are detached, though, the connector is just a free
  // 4-point shape floating on the canvas - so all 3 segments become
  // grabbable: the top segment (epoints[0]-epoints[1]) drags the top
  // corner, the bottom segment (epoints[length-2]-epoints[length-1])
  // drags the bottom corner, and the middle segment (the 2 corners
  // themselves) - having nothing left to reshape - drags the whole
  // connector as a unit instead.
  //
  getNearestPointIndex(x, y) {
    if (!this.points || this.points.length < 4) {
      return 1;
    }

    if (this._isFullyDetached()) {
      const last = this.points.length - 1;
      const dTop = distanceToSegment(x, y, this.points[0], this.points[1]);
      const dMiddle = distanceToSegment(x, y, this.points[1], this.points[2]);
      const dBottom = distanceToSegment(
        x,
        y,
        this.points[last - 1],
        this.points[last],
      );

      if (dMiddle <= dTop && dMiddle <= dBottom) {
        return WHOLE_DRAG;
      }
      return dTop <= dBottom ? 1 : 2;
    }

    var d1 = Math.hypot(x - this.points[1].x, y - this.points[1].y);
    var d2 = Math.hypot(x - this.points[2].x, y - this.points[2].y);
    return d1 <= d2 ? 1 : 2;
  }

  _isFullyDetached() {
    return (
      !this.epoints[0].euid && !this.epoints[this.epoints.length - 1].euid
    );
  }

  //
  // eppos 1 (top corner): moves epoints[1] and epoints[0].y together (the
  //   segment from the "from" attach to the corner stays horizontal),
  //   with the segment's length clamped to [CORNER_X_MIN, CORNER_X_MAX]
  //   relative to epoints[0].x.
  // eppos 2 (bottom corner): the same, symmetrically, for the segment
  //   from the corner to the "to" attach (epoints[last]).
  // In both cases the corner's x is also copied onto the OTHER corner, so
  // the loop's middle segment (epoints[1]-epoints[2]) stays vertical
  // regardless of which corner is being dragged. _getAttachX naturally
  // reduces to epoints[0].x / epoints[last].x once that end is detached,
  // so the horizontal/range/vertical constraints above all keep applying
  // the same way whether attached or not.
  //
  // Whole-connector dragging (both ends detached, middle segment grabbed)
  // just translates every point together instead.
  //
  _recalculatePoints(x, y) {
    if (this.wholeDrag) {
      const dx = x - this._dragStart.x;
      const dy = y - this._dragStart.y;
      for (let i = 0; i < this.epoints.length; ++i) {
        this.epoints[i].x = this._dragSnapshot[i].x + dx;
        this.epoints[i].y = this._dragSnapshot[i].y + dy;
      }
      return;
    }

    if (this.eppos === 1) {
      var from = this.epoints[0];
      var refX = this._getAttachX(from) ?? from.x;
      var sharedX = clamp(x, refX + CORNER_X_MIN, refX + CORNER_X_MAX);
      var y0 = Math.min(y, this.epoints[3].y - GAP_MIN);

      from.y = y0;
      this.epoints[1] = { x: sharedX, y: y0 };
      this.epoints[2].x = sharedX;
    } else if (this.eppos === 2) {
      var to = this.epoints[3];
      var refX2 = this._getAttachX(to) ?? to.x;
      var sharedX2 = clamp(x, refX2 + CORNER_X_MIN, refX2 + CORNER_X_MAX);
      var y1 = Math.max(y, this.epoints[0].y + GAP_MIN);

      to.y = y1;
      this.epoints[2] = { x: sharedX2, y: y1 };
      this.epoints[1].x = sharedX2;
    }
  }

  //
  // Both ends are always attached (to a port), and there are exactly 4
  // points - none of BaseConnector's detach-on-grab / add-a-new-point /
  // collinear-point-removal logic applies here.
  //
  startTransform(x1, y1, scrollOffset) {
    if (!this.diagram.isEditable()) return;

    if (this.diagram.opman) {
      this.diagram.opman.begin();
    }

    var x = x1 + scrollOffset.left;
    var y = y1 + scrollOffset.top;

    const zone = this.getNearestPointIndex(x, y);
    this.wholeDrag = zone === WHOLE_DRAG;
    // eppos just needs to be a valid, harmless index while wholeDrag is
    // active - BaseConnector's TransformTo writes epoints[eppos] before
    // calling onTransform, and _recalculatePoints ignores it anyway.
    this.eppos = this.wholeDrag ? 1 : zone;

    if (this.wholeDrag) {
      this._dragStart = { x, y };
      this._dragSnapshot = this.epoints.map((p) => ({ x: p.x, y: p.y }));
    }

    this.onStartTransform(x, y);
  }

  onStartTransform(x, y) {
    this._recalculatePoints(x, y);
  }

  onTransform(x, y) {
    this._recalculatePoints(x, y);
  }

  stopTransform(x1, y1, scrollOffset) {
    if (this.eppos < 0) {
      if (this.diagram.opman) {
        this.diagram.opman.commit();
      }
      return;
    }

    var x = x1 + scrollOffset.left;
    var y = y1 + scrollOffset.top;
    this._recalculatePoints(x, y);

    // _getConnectionPoints already re-resolves the dragged end's attach
    // point live (see below) - this final call just makes sure it's
    // fresh for the exact mouse-up position before we commit.
    this.points = this._getConnectionPoints(this.epoints, scrollOffset);

    this.eppos = -1;
    this.wholeDrag = false;
    this._dragStart = null;
    this._dragSnapshot = null;
    this.onStopTransform(x, y);

    if (this.diagram.opman) {
      this.diagram.opman.commit();
    }
  }

  //
  // BaseConnector's generic element-drag handling (onDragMove) translates
  // every epoint by the same delta, uniformly - correct when both ends'
  // elements are moving together (e.g. this self message's single port,
  // or 2 ports being dragged as a selected group), but wrong when only
  // ONE end's element is part of this drag: the OTHER (static) end would
  // get shifted by a delta that doesn't apply to it, dragging it away
  // from the element it's still supposedly attached to. So detach any end
  // whose element isn't actually being dragged right now, and leave it
  // detached - its post-drag position is just an incidental side effect
  // of the uniform shift, not a deliberate placement, so auto-reconnecting
  // it there (the way a deliberate corner-drag does) would silently
  // re-glue it back and make the detach invisible. Reattaching a
  // genuinely detached end is what dragging a corner (see
  // _getConnectionPoints) is for.
  //
  onDragStart(ui) {
    for (const attach of [this.epoints[0], this.epoints[this.epoints.length - 1]]) {
      if (!attach.euid) {
        continue;
      }
      const element =
        attach.id != null ? this.diagram.getElementById(attach.id) : null;
      if (!element || !element.options["dragStart"]) {
        attach.euid = null;
        attach.id = null;
        attach.limit = null;
      }
    }
    super.onDragStart(ui);
  }

  //
  // Which SQObjectInstance an attach point belongs to. Preferring the
  // live `element.parent` link is not enough on its own: it's only ever
  // set by an actual drag-and-drop reparent in this session (see
  // BaseDiagram.reparentDroppedElement) and is never restored when a
  // diagram is loaded from saved JSON, and it doesn't exist at all once
  // an end has been fully detached (euid/id nulled). So fall back to
  // whichever instance's own horizontal span (its lifeline column)
  // actually contains this x - a self message's x never changes on its
  // own (only re-glued once re-attached), so this reliably finds the
  // same lifeline the point visually sits over.
  //
  _resolveInstance(attach) {
    const currentElement =
      attach.id != null ? this.diagram.getElementById(attach.id) : null;
    if (currentElement) {
      if (currentElement.options.nameTemplate === "sqobject_instance") {
        return currentElement;
      }
      if (currentElement.parent) {
        return currentElement.parent;
      }
    }

    for (const el of this.diagram.elements) {
      if (el.options.nameTemplate !== "sqobject_instance") {
        continue;
      }
      const rect = this._getBorderRect(el.euid);
      if (rect && attach.x >= rect.left && attach.x <= rect.right) {
        return el;
      }
    }

    return null;
  }

  //
  // Re-derive which element an attach point (epoints[0]/"from" or
  // epoints[last]/"to") should actually be bound to - the port stacked at
  // that y on its lifeline may have changed since it was last attached,
  // or it may have been dragged past the lifeline's own vertical extent
  // entirely (genuinely detached - see SQObjectInstanceElement's own
  // bounds check). Sequence messages are always horizontal, so ask the
  // owning instance which row (header vs which of its ports) that y
  // belongs to, rather than doing a bounding-box hit test against each
  // individual (often narrow/overlapping) port.
  //
  // A port doesn't have to belong to any instance at all, though - it can
  // sit standalone on the canvas (never dropped onto one). With no
  // instance to resolve, fall back to a direct, inclusive bounding-box
  // test against the port (or instance) itself.
  //
  _findAttachTarget(attach) {
    const instance = this._resolveInstance(attach);
    if (instance && instance.findNearestAttachPoint) {
      // A self message always loops out to and back from the right.
      const result = instance.findNearestAttachPoint(attach.x, attach.y, true);
      if (result) {
        return result.element;
      }
    }

    return this._findElementAt(attach.x, attach.y);
  }

  _findElementAt(x, y) {
    for (const el of this.diagram.elements) {
      if (
        el.options.nameTemplate !== "sqport" &&
        el.options.nameTemplate !== "sqobject_instance"
      ) {
        continue;
      }
      const rect = this._getBorderRect(el.euid);
      if (!rect) {
        continue;
      }
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return el;
      }
    }
    return null;
  }

  //
  // Try to attach whichever ends are currently unattached. Meant to be
  // called opportunistically (e.g. right after some port was just
  // dropped/repositioned elsewhere on the diagram) rather than on every
  // redraw - unlike the live re-resolve during an active corner-drag,
  // where the y being dragged to is a deliberate signal, a floating
  // end's frozen position is easy to land on by coincidence, so this
  // should only run at meaningful checkpoints, not continuously.
  //
  reattachDetachedEnds() {
    let changed = false;
    for (const attach of [this.epoints[0], this.epoints[this.epoints.length - 1]]) {
      if (attach.euid) {
        continue;
      }
      const found = this._findAttachTarget(attach);
      if (found) {
        attach.euid = found.euid;
        attach.id = found.getId();
        attach.limit = found.options.midpoint || 0;
        changed = true;
      }
    }
    return changed;
  }

  //
  // Keep the 2 corners within their valid offset range of whatever the
  // attach points are currently glued to. Only the point actively being
  // corner-dragged gets re-clamped as part of _recalculatePoints - but an
  // attach point can also move for reasons that have nothing to do with
  // dragging this connector at all (e.g. its port got re-centered after
  // being dropped onto an instance), and passively re-deriving the
  // corner's x from the live rect (see below) doesn't by itself pull a
  // now-out-of-range corner back into range. Preserves the user's chosen
  // offset from CORNER_X_DEFAULT as much as possible, just re-clamped.
  //
  _reclampCorners() {
    const from = this.epoints[0];
    const to = this.epoints[this.epoints.length - 1];
    const ref = Math.max(from.x, to.x);
    const offset = clamp(this.epoints[1].x - ref, CORNER_X_MIN, CORNER_X_MAX);
    const sharedX = ref + offset;
    this.epoints[1].x = sharedX;
    this.epoints[2].x = sharedX;
  }

  _getConnectionPoints(epoints, scrollOffset) {
    const scrollLeft = scrollOffset.left;
    const scrollTop = scrollOffset.top;

    if (epoints.length < 4) {
      return epoints.map((pt) => ({
        x: pt.x - scrollLeft,
        y: pt.y - scrollTop,
      }));
    }

    const from = epoints[0];
    const to = epoints[epoints.length - 1];

    //
    // While a corner is being actively dragged, the attach point on its
    // side just moved vertically and may now belong to a different port
    // on the same lifeline - re-resolve it on every redraw so the shape
    // visibly snaps to the right target as the user drags, not only once
    // the mouse is released. Not while whole-connector-dragging a fully
    // detached shape though - that's a deliberate reposition of the
    // whole free-floating loop, not a reshape, and shouldn't suddenly
    // glue an end mid-drag.
    //
    if (!this.wholeDrag && this.eppos === 1) {
      const found = this._findAttachTarget(from);
      from.euid = found ? found.euid : null;
      from.id = found ? found.getId() : null;
      from.limit = found ? found.options.midpoint || 0 : 0;
    } else if (!this.wholeDrag && this.eppos === 2) {
      const found = this._findAttachTarget(to);
      to.euid = found ? found.euid : null;
      to.id = found ? found.getId() : null;
      to.limit = found ? found.options.midpoint || 0 : 0;
    }

    // Keep each attach point glued to what it's bound to - a port's right
    // edge, or the object instance's own horizontal center - independently,
    // since a self message may span 2 different (stacked) ports, or a
    // port and the instance itself, on the same lifeline.
    const fromX = this._getAttachX(from);
    const toX = this._getAttachX(to);

    if (fromX != null) from.x = fromX;
    if (toX != null) to.x = toX;

    // With at least one end attached, the corners must stay within their
    // valid offset of it - re-clamp on every redraw so an attach point
    // that moved for some unrelated reason (its port got re-centered,
    // etc.) doesn't leave the corners stranded out of range. A fully
    // detached shape has no such reference to clamp against - it's a
    // free-form loop the user positions directly (see _recalculatePoints).
    if (!this._isFullyDetached()) {
      this._reclampCorners();
    }

    return epoints.map((pt) => ({
      x: pt.x - scrollLeft,
      y: pt.y - scrollTop,
    }));
  }
}

export { SQSelfMessageConnector };
