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

function clamp(v, lo, hi) {
  return Math.min(Math.max(v, lo), hi);
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

  _getBorderRect(euid) {
    var $border = $("#" + euid + "_Border");
    var pos = $border.position();
    if (!pos) {
      return null;
    }
    var width = $border.width();
    var height = $border.height();
    return {
      right: pos.left + width,
      centerX: pos.left + width / 2,
      centerY: pos.top + height / 2,
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
  // Only the 2 corners (index 1/2) are draggable - grab whichever is
  // closer.
  //
  getNearestPointIndex(x, y) {
    if (!this.points || this.points.length < 4) {
      return 1;
    }
    var d1 = Math.hypot(x - this.points[1].x, y - this.points[1].y);
    var d2 = Math.hypot(x - this.points[2].x, y - this.points[2].y);
    return d1 <= d2 ? 1 : 2;
  }

  //
  // eppos 1 (top corner): moves epoints[1] and epoints[0].y together
  //   (the horizontal segment from the "from" attach to the corner).
  // eppos 2 (bottom corner): moves epoints[2] and epoints[3].y together
  //   (the horizontal segment from the corner to the "to" attach).
  // In both cases the corner's x is shared - dragging either corner also
  // moves the other one's x so the loop's vertical segment stays vertical.
  //
  _recalculatePoints(x, y) {
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

    this.eppos = this.getNearestPointIndex(x, y);

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
    this.onStopTransform(x, y);

    if (this.diagram.opman) {
      this.diagram.opman.commit();
    }
  }

  //
  // Re-derive which element an attach point (epoints[0]/"from" or
  // epoints[last]/"to") should actually be bound to - the port stacked at
  // that y on its lifeline may have changed since it was last attached.
  // Sequence messages are always horizontal, so ask the owning
  // SQObjectInstance which row (header vs which of its ports) that y
  // belongs to, rather than doing a blind bounding-box hit test over
  // every element in the diagram.
  //
  _findAttachTarget(attach) {
    const currentElement =
      attach.id != null ? this.diagram.getElementById(attach.id) : null;
    const instance =
      currentElement &&
      currentElement.options.nameTemplate === "sqobject_instance"
        ? currentElement
        : currentElement && currentElement.parent
          ? currentElement.parent
          : null;

    if (instance && instance.findNearestAttachPoint) {
      // A self message always loops out to and back from the right.
      const result = instance.findNearestAttachPoint(attach.x, attach.y, true);
      return result ? result.element : null;
    }

    // No known lifeline to ask (e.g. this end was never attached) - fall
    // back to a generic bounding-box hit test.
    return this.diagram._dropConnector({
      position: { top: attach.y, left: attach.x },
    });
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
    // the mouse is released.
    //
    if (this.eppos === 1) {
      const found = this._findAttachTarget(from);
      from.euid = found ? found.euid : null;
      from.id = found ? found.getId() : null;
      from.limit = found ? found.options.midpoint || 0 : 0;
    } else if (this.eppos === 2) {
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

    return epoints.map((pt) => ({
      x: pt.x - scrollLeft,
      y: pt.y - scrollTop,
    }));
  }
}

export { SQSelfMessageConnector };
