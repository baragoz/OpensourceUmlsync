import { BaseConnector } from "./BaseConnector";

const defaultOptions = {
  nameTemplate: "selfassociation",
};

//
// Constraint ranges (px), all relative to the source element's border
// rect. The loop is a 3-point orthogonal "hook": epoints[0] sticks out
// above the element, epoints[2] sticks out to its right, and epoints[1]
// is the corner joining them at a right angle (epoints[0].y ===
// epoints[1].y, epoints[1].x === epoints[2].x).
//
const ABOVE_MIN = 15; // epoints[0]/corner: min gap above the top edge
const ABOVE_MAX = 60; // epoints[0]/corner: max gap above the top edge
const RIGHT_MIN = 10; // corner/epoints[2]: min gap right of the right edge
const RIGHT_MAX = 60; // corner/epoints[2]: max gap right of the right edge
const P1_RIGHT_MARGIN = 10; // epoints[0].x never closer than this to the right edge
const P3_TOP_MARGIN = 10; // epoints[2].y never closer than this above the top edge
// Dragging the corner directly moves it along the diagonal ray running
// top-right from the element's top-right corner, at a distance (r) kept
// within this range - not a free 2D box like epoints[0]/epoints[2] get.
const CENTER_MIN_R = 20;
const CENTER_MAX_R = 120;

function clamp(v, lo, hi) {
  return Math.min(Math.max(v, lo), hi);
}

// Shortest distance from (px,py) to the segment (ax,ay)-(bx,by).
function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

class SelfAssociationConnector extends BaseConnector {
  constructor(options, jsonModel, diagram) {
    super({ ...defaultOptions, ...options }, jsonModel, diagram);
  }

  draw(context2, points, color) {
    if (points == null || points.length < 2) {
      return;
    }
    var ep = points.length - 1;
    context2.beginPath();
    context2.fillStyle = color;
    context2.strokeStyle = color;
    context2.moveTo(points[0].x, points[0].y);
    for (var i = 1; i <= ep; ++i) {
      context2.lineTo(points[i].x, points[i].y);
    }
    context2.stroke();
    context2.closePath();
  }

  _getBorderRect(euid) {
    var $border = $("#" + euid + "_Border");
    var pos = $border.position();
    if (!pos) {
      return null;
    }
    var width = $border.width();
    var height = $border.height();
    return {
      left: pos.left,
      top: pos.top,
      right: pos.left + width,
      centerX: pos.left + width / 2,
      centerY: pos.top + height / 2,
    };
  }

  //
  // Seed a brand-new connector's default loop shape, centered in each
  // point's allowed range. Only used once, from _init() - by construction
  // time epoints[1]/epoints[2] don't exist yet, so this can't reuse
  // _recalculatePoints() (which reads the "other" points to leave them
  // untouched, see below).
  //
  _seedDefaultShape(euid) {
    var rect = this._getBorderRect(euid);
    if (!rect) {
      return;
    }

    var id = this.epoints[0]["id"];
    var limit = this.epoints[0]["limit"];

    var defaultR = (CENTER_MIN_R + CENTER_MAX_R) / 2;
    var cornerX = rect.right + defaultR / Math.SQRT2;
    var cornerY = rect.top - defaultR / Math.SQRT2;
    var p1x = (rect.centerX + (rect.right - P1_RIGHT_MARGIN)) / 2;
    var p3y = (rect.top - P3_TOP_MARGIN + rect.centerY) / 2;

    this.epoints[0] = { x: p1x, y: cornerY, euid, id, limit };
    this.epoints[1] = { x: cornerX, y: cornerY };
    this.epoints[2] = { x: cornerX, y: p3y, euid, id, limit };

    this._lastRect = rect;
  }

  //
  // Keep the loop's shape valid as the element moves and/or resizes. Each
  // epoint is stored as a page-absolute position, but it really means
  // "offset from a specific edge/corner of the element" - the same
  // offsets enforced during dragging in _recalculatePoints. Re-derive
  // those offsets against the last-seen rect, reapply them to the
  // current one, and re-clamp with the same bounds so a resize can't
  // leave a point outside its allowed range (e.g. a shrunk element
  // pulling its center past P1, or shrinking the diagonal band under the
  // corner's current distance).
  //
  _syncPointsToRect(rect) {
    const last = this._lastRect;
    if (!last) {
      this._lastRect = rect;
      return;
    }

    if (
      rect.left === last.left &&
      rect.top === last.top &&
      rect.right === last.right &&
      rect.centerY === last.centerY
    ) {
      return;
    }

    const p1 = this.epoints[0];
    const corner = this.epoints[1];
    const p3 = this.epoints[2];

    // Corner: preserve its diagonal distance from the top-right corner.
    const r = clamp(
      Math.hypot(last.right - corner.x, last.top - corner.y),
      CENTER_MIN_R,
      CENTER_MAX_R,
    );
    const sharedX = rect.right + r / Math.SQRT2;
    const sharedY = rect.top - r / Math.SQRT2;

    // P1: preserve its own offset from the (old) right edge - the same
    // degree of freedom eppos===0 dragging grants it, independent of the
    // corner.
    const p1OffRight = last.right - p1.x;
    const p1x = clamp(
      rect.right - p1OffRight,
      rect.centerX,
      rect.right - P1_RIGHT_MARGIN,
    );

    // P3: preserve its own offset from the (old) top edge - the same
    // degree of freedom eppos===2 dragging grants it, independent of the
    // corner.
    const p3OffTop = p3.y - last.top;
    const p3y = clamp(
      rect.top + p3OffTop,
      rect.top - P3_TOP_MARGIN,
      rect.centerY,
    );

    corner.x = sharedX;
    corner.y = sharedY;
    p1.x = p1x;
    p1.y = sharedY;
    p3.x = sharedX;
    p3.y = p3y;

    this._lastRect = rect;
  }

  //
  // Reshape the loop from a drag at (x,y), driven by which of the 3
  // points is being dragged (this.eppos, set by getNearestPointIndex):
  //   eppos 0 - epoints[0] (and the element<->epoints[0] segment): moves
  //             freely within its own range; the corner's y follows to
  //             keep the right angle, everything else is untouched.
  //   eppos 2 - epoints[2] (and the element<->epoints[2] segment): moves
  //             freely within its own range; the corner's x follows,
  //             everything else untouched.
  //   eppos 1 (default) - the corner, or either of the two hook segments:
  //             moves along the diagonal ray running top-right from the
  //             element's top-right corner, kept at a distance between
  //             CENTER_MIN_R and CENTER_MAX_R from it; both epoints[0].y
  //             and epoints[2].x follow to keep both right angles.
  // In every case the "shared" coordinate is clamped into the tighter of
  // the two points' ranges so the two ends of a segment always end up
  // exactly equal, never just close.
  //
  _recalculatePoints(x, y) {
    const euid = this.epoints[0] && this.epoints[0]["euid"];
    if (!euid) {
      return;
    }

    const rect = this._getBorderRect(euid);
    if (!rect) {
      return;
    }

    const id = this.epoints[0]["id"];
    const limit = this.epoints[0]["limit"];

    if (this.eppos === 0) {
      const p1x = clamp(x, rect.centerX, rect.right - P1_RIGHT_MARGIN);
      const sharedY = clamp(y, rect.top - ABOVE_MAX, rect.top - ABOVE_MIN);
      this.epoints[0] = { x: p1x, y: sharedY, euid, id, limit };
      this.epoints[1] = { x: this.epoints[1].x, y: sharedY };
      // epoints[2] left untouched
    } else if (this.eppos === 2) {
      const sharedX = clamp(x, rect.right + RIGHT_MIN, rect.right + RIGHT_MAX);
      const p3y = clamp(y, rect.top - P3_TOP_MARGIN, rect.centerY);
      this.epoints[2] = { x: sharedX, y: p3y, euid, id, limit };
      this.epoints[1] = { x: sharedX, y: this.epoints[1].y };
      // epoints[0] left untouched
    } else {
      // Project (x,y) onto the diagonal ray from the top-right corner and
      // clamp the distance along it, so the corner always ends up exactly
      // on that ray rather than free within a 2D box.
      const r = clamp(
        ((x - rect.right) - (y - rect.top)) / Math.SQRT2,
        CENTER_MIN_R,
        CENTER_MAX_R,
      );
      const sharedX = rect.right + r / Math.SQRT2;
      const sharedY = rect.top - r / Math.SQRT2;
      this.epoints[1] = { x: sharedX, y: sharedY };
      this.epoints[0] = { x: this.epoints[0].x, y: sharedY, euid, id, limit };
      this.epoints[2] = { x: sharedX, y: this.epoints[2].y, euid, id, limit };
    }

    this._lastRect = rect;
  }

  _init() {
    if (
      !this.epoints ||
      this.epoints.length === 0 ||
      !this.epoints[0]["euid"]
    ) {
      return;
    }

    var euid = this.epoints[0]["euid"];
    var rect = this._getBorderRect(euid);

    if (!rect) {
      alert("Not found " + euid);
      return;
    }

    if (this.epoints.length < 3) {
      this._seedDefaultShape(euid);
    } else {
      // Reloaded connector: keep the previously saved/dragged shape,
      // just establish the movement-tracking baseline.
      this._lastRect = rect;
    }

    // _create() computed this.points from the pre-init epoints (which,
    // on fresh creation, is just the single attached point) - refresh it
    // now that epoints holds the real 3-point shape.
    this.points = this._getConnectionPoints(
      this.epoints,
      this.diagram.getDiagramOffset(),
    );
  }

  //
  // Which point the drag controls depends on which of the 4 visual
  // segments (element<->epoints[0], epoints[0]<->corner,
  // corner<->epoints[2], epoints[2]<->element) is closest to (x,y) -
  // grabbing near/on epoints[0] or its element-side segment drags
  // epoints[0] (eppos 0); near/on epoints[2] or its segment drags
  // epoints[2] (eppos 2); near/on the corner or either hook segment
  // drags the corner (eppos 1). points[] is [anchorTop, epoints[0],
  // corner, epoints[2], anchorRight] (see _getConnectionPoints).
  //
  getNearestPointIndex(x, y) {
    if (!this.points || this.points.length < 5) {
      return 1;
    }

    // The element<->epoints[0] and epoints[2]<->element segments are
    // short, near-degenerate stubs (epoints[0]/epoints[2] barely offset
    // from the border), while the two segments on either side of the
    // corner run much further across the canvas. Pure nearest-segment
    // distance would let those long corner-side segments win over a
    // click that's merely a few px off-axis from epoints[0]/epoints[2]
    // themselves, making the point hard to grab directly. So check point
    // proximity first - grabbing at/near an actual point always wins -
    // and only fall back to segment distance for a click genuinely in
    // the middle of a segment, away from either of its endpoints.
    const POINT_RADIUS = 15;
    const pointChecks = [
      { pt: this.points[1], eppos: 0 },
      { pt: this.points[2], eppos: 1 },
      { pt: this.points[3], eppos: 2 },
    ];
    for (const check of pointChecks) {
      if (Math.hypot(x - check.pt.x, y - check.pt.y) <= POINT_RADIUS) {
        return check.eppos;
      }
    }

    const segments = [
      { a: this.points[0], b: this.points[1], eppos: 0 },
      { a: this.points[1], b: this.points[2], eppos: 1 },
      { a: this.points[2], b: this.points[3], eppos: 1 },
      { a: this.points[3], b: this.points[4], eppos: 2 },
    ];

    let best = 1;
    let bestDist = Infinity;
    for (const seg of segments) {
      const d = distanceToSegment(x, y, seg.a.x, seg.a.y, seg.b.x, seg.b.y);
      if (d < bestDist) {
        bestDist = d;
        best = seg.eppos;
      }
    }
    return best;
  }

  //
  // Both ends are permanently attached to the same element - the whole
  // loop is derived from that element's live border rect via euid (see
  // _getConnectionPoints/_recalculatePoints). BaseConnector.startTransform
  // would detach epoints[0]/epoints[length-1] as soon as either is
  // grabbed, which for this connector is indices 0 and 2 - i.e. every
  // drag. So override it here without that detach step; there's also no
  // "add a new point" branch to keep since getNearestPointIndex always
  // resolves to 0, 1 or 2.
  //
  startTransform(x1, y1, scrollOffset) {
    if (!this.diagram.isEditable()) return;

    if (this.diagram.opman) {
      this.diagram.opman.begin();
    }

    const x = x1 + scrollOffset.left;
    const y = y1 + scrollOffset.top;

    this.eppos = this.getNearestPointIndex(x, y);

    this.onStartTransform(x, y);
  }

  onStartTransform(x, y) {
    this._recalculatePoints(x, y);
  }

  onTransform(x, y) {
    this._recalculatePoints(x, y);
  }

  //
  // Bypass BaseConnector's generic finalize logic entirely (point-merge,
  // collinear-point removal, drop-target re-attachment on endpoints) -
  // none of it fits a connector that always has exactly 3 points with
  // both ends permanently attached to the same element.
  //
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

    // Refresh this.points immediately so the next drag's zone detection
    // (getNearestPointIndex) sees the just-finalized shape rather than
    // whatever the last mousemove happened to leave behind.
    this.points = this._getConnectionPoints(this.epoints, scrollOffset);

    this.eppos = -1;
    this.onStopTransform(x, y);

    if (this.diagram.opman) {
      this.diagram.opman.commit();
    }
  }

  _getConnectionPoints(epoints, scrollOffset) {
    const scrollTop = scrollOffset.top;
    const scrollLeft = scrollOffset.left;

    // For self-association, both endpoints should be the same element
    const fromEuid = epoints[0] && epoints[0]["euid"];
    const toEuid =
      epoints[epoints.length - 1] && epoints[epoints.length - 1]["euid"];

    if (fromEuid && toEuid && fromEuid !== toEuid) {
      alert("SELF-CONNECTION suppose the same source and destination element");
      return [];
    }

    const euid = fromEuid || toEuid;
    if (!euid) {
      // Detached connector
      return epoints.map((pt) => ({
        x: pt.x - scrollLeft,
        y: pt.y - scrollTop,
      }));
    }

    const rect = this._getBorderRect(euid);
    if (!rect) {
      alert("Not found " + euid);
      return [];
    }

    // Keep the loop's shape valid as the element moves and/or resizes.
    this._syncPointsToRect(rect);

    // The 3 epoints all sit off the element's border by design (see the
    // constraint ranges above), so draw two extra segments carrying the
    // line the rest of the way to the border itself: straight up into
    // epoints[0] from the top edge, and straight out to epoints[2] from
    // the right edge - otherwise the loop reads as floating disconnected
    // from the class box.
    const anchorTop = { x: epoints[0].x - scrollLeft, y: rect.top - scrollTop };
    const anchorRight = {
      x: rect.right - scrollLeft,
      y: epoints[2].y - scrollTop,
    };

    return [
      anchorTop,
      ...epoints.map((pt) => ({ x: pt.x - scrollLeft, y: pt.y - scrollTop })),
      anchorRight,
    ];
  }
}

export { SelfAssociationConnector };
