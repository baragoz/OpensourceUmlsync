import { BaseDiagramItem } from '../core/BaseDiagramItem';

const LimitMode = {
  NONE: 0,
  CENTER: 1,
  HORIZONTAL: 2,
  VERTICAL: 3
};


const defaultOptions = {
  nameTemplate: 'baseConnector',
  selected: false
};

class BaseConnector extends BaseDiagramItem {
  constructor(options, jsonModel, diagram) {
    super({ ...defaultOptions, ...options }, "c" + jsonModel.id);
    this.diagram = diagram;
    this.jsonModel = jsonModel;

    //
    // Points
    //
    this.epoints = [];
    this.cleanOnNextTransform = false;

    //
    // Labels
    //
    this.label_count = 0;
    this.labels = [];

    this._create();
    this._baseInit(); // TODO: remove == there is nothing to _baseInit
    this._init();     // TODO: remove == there is nothing to _init

    this.diagram.onAddConnector(this);
  }

  _create() {
    var self = this;
    if (this.jsonModel.epoints != undefined) {
      $.each(this.jsonModel.epoints, function (idx, item) {
        self.epoints[idx] = { x: parseInt(item.x), y: parseInt(item.y) };
      });
    }

    //
    // Clone epoint from original jsonModel.epoints
    //
    var ep = (this.jsonModel.epoints || []).map(point => ({ ...point }));
    //
    // point to the same object
    //
    this.epoints = ep;

    // TODO(connector): add prefix to the options, then no need to lookup euid 
    //
    // Load diagram from JSON, find euid by id 
    //
    if (ep[0]['id'] || ep[ep.length - 1]['id'] != null) {
      if (ep[0]['id']) {
        const element = this.diagram.getElementById(ep[0]['id']);
        this.#attachElementToPoint(0, element);
      }

      if (ep[ep.length - 1]['id']) {
        const element = this.diagram.getElementById(ep[ep.length - 1]['id']);
        this.#attachElementToPoint(ep.length - 1, element);
      }
    }

    //
    // Errors handling:  via work-around.
    //
    if (ep.length < 2) {
      if (ep.length == 0) {
        // Draw a lost connector with defult potints
        this.jsonModel.epoints = [{ x: 40, y: 50 }, { x: 150, y: 50 }];
      } else {
        //
        // if we have one point, then let's assume that it is start point !!!!
        //
        if (ep[0]['euid']) {
          this.jsonModel.epoints.push({ x: ep[0].x + 200, y: ep[0].y + 200 });
        }
      }
      ep = this.jsonModel.epoints;
    }

    //
    // Connection helper - is runtime element, that's why use it via euid
    //
    if (ep[ep.length - 1]['euid'] == 'ConnectionHelper') {
      //
      // it is for a menus's DND
      //
      if (!ep[0]['euid']) {
        console.error('Error: Connection Helper is for icon menu only' + this.options.nameTemplate);
        return false;
      }
    }

    //
    // Update points + indentations
    //
    this.points = this._getConnectionPoints(ep, this.diagram.getDiagramOffset());

    //
    // Check if we could remove point on next transform
    // Uses to move connector in horizontal/vertical way
    //
    if (ep.length === 3) {
      //
      // Check if it is a helper point which support allow us to move conenctor
      // between 2 elements event if helper point on a straight line between elements
      //
      this.cleanOnNextTransform = this.canRemovePoint(this.points[0], this.points[2], this.points[1]);
    }

    //
    // Create a list of connector's labels at position
    //
    this.reloadLabels();
  }

  /**
   * Attach or detach an element to/from an epoint
   * @param {number} pointIndex - The index of the point in epoints array
   * @param {BaseElement|null} element - The element to attach, or null to detach
   */
  #attachElementToPoint(pointIndex, element) {
    if (pointIndex < 0 || pointIndex >= this.epoints.length) {
      return;
    }

    if (element) {
      // Attach element
      this.epoints[pointIndex]['id'] = element.getId();
      this.epoints[pointIndex]['euid'] = element.euid;
      this.epoints[pointIndex]['limit'] = element.options.midpoint ? LimitMode.CENTER : LimitMode.NONE;
    } else {
      // Detach element
      this.epoints[pointIndex]['id'] = null;
      this.epoints[pointIndex]['euid'] = null;
      this.epoints[pointIndex]['limit'] = null;
    }
  }

  _baseInit() {
    //
    // TODO: add error handling if some mandatory items not available
    //
    ['line-width', 'color',  // Arrow
      'font-bg', 'font-color', 'font-family', 'font-size' // Label
    ].forEach((item) => {
      if (this.jsonModel[item])
        this._setOption(item, this.jsonModel[item]);
    });
  }

  //
  // Override in the implementation
  //
  _init() {
    // Empty
  }

  _setOption(key, value) {
    if (value == undefined) {
      delete this.options[key];
      return;
    }

    if (key == 'epoints') {
      for (var i in value) {
        this.epoints[i].x = value[i].x;
        this.epoints[i].y = value[i].y;
      }
    } else if (key == 'labels') {
      for (var i in value) {
        this.labels[i].css({ left: value[i].x, top: value[i].y });
      }
    } else if (key == 'editable') {
      for (var i in this.labels) {
        $.each(this.labels[i], function (index, item) {
          $(item)
            .draggable('option', 'disabled', !value)
            .editable(value ? 'enable' : 'disable');
        });
      }
    } else if (key === 'font-bg') {
      this.labels.forEach((label) => {
        label.css("background-color", value);
      });
    } else if (key === 'font-color') {
      this.labels.forEach((label) => {
        label.find(".editablefield").css("color", value);
      });
    } else if (['font-family', 'font-size', 'font-weight', 'font-decoration', 'font-style'].indexOf(key) >= 0) {
      this.labels.forEach((label) => {
        label.find(".editablefield").css(key, value);
      });
    } else if (key === 'highlighted' || key === 'selected') {
      this.options[key] = value;

      for (var i in this.labels) {
        if (this.labels[i]) {
          if (value) {
            $(this.labels[i]).addClass('us-connector-hover')
          } else {
            $(this.labels[i]).removeClass('us-connector-hover')
          }
        }
      }
      // force to re-draw diagram
      this.diagram.draw();
    } else {
      this.options[key] = value;
      this.diagram.draw();
    }
  }


  reloadLabels() {
    for (var i in this.jsonModel['labels']) {
      var l = this.jsonModel['labels'][i];
      this.addLabel(l);
    }
  }

  //
  // Add text label
  //
  addLabel(opt) {
    opt.id = opt.id || this.diagram.getNextUniqueId();

    // For example, prefix: "e1d1c5l19"
    //  editor.id - 1
    //  diagram.id - 1
    //  connector.id - 5
    //  label,id - 19
    opt.prefix = this.options.prefix + 'l' + opt.id;
    opt.zIndex = 19999;

    // uniqie label name to simplify revert editable
    let leuid = opt.prefix + '_' + this.getRandomSuffix();

    var $item =
      $('<div id="' + leuid + '" data-label-id="' + opt.id +
        '" data-connector-id="' + this.jsonModel.id +
        '" class="us-connector-label"><a class="editablefield" >' + opt.text + '</a></div>')
        .appendTo('#' + this.diagram.euid)
        .css('left', opt.left)
        .css('top', opt.top)
        .css("z-index", opt.zIndex);

    this.labels.push($item);
    this.jsonModel.labels = this.jsonModel.labels || [];
    this.jsonModel.labels.push(opt);

    return leuid;
  }

  rmLabel(opt) {
    // Option know about label id
    if (opt.id) {
      this.#removeLabelById(opt.id);
    }

    // TODO: option could know about label's euid 
    //       because we return label.euid on addLabel

    //this.diagram.opman.reportShort(
    //    '-label', this.euid,
    //    {idx: opt.idx, left: l.css('left'), top: l.css('top')});
    // (this.labels.splice(opt.idx, 1)).x.remove();
  }

  #removeLabelById(labelId) {
    // Find the label in this.labels array
    let $label = this.labels.find($item => $item.attr("data-label-id") == labelId);

    if (!$label) return; // If not found, exit early

    // Remove from DOM
    $label.remove();

    // Remove from jsonModel.labels
    this.jsonModel.labels = this.jsonModel.labels.filter(label => label.id !== labelId);

    // Remove from this.labels
    this.labels = this.labels.filter($item => $item.attr("data-label-id") != labelId);
  }

  moveLabel(opt) {
    this.labels[opt.idx].css({ left: opt.left, top: opt.top });
  }

  //
  // Helper method, to highlight selected line
  //
  drawSelected(c, points, color) {
    c.beginPath();
    c.fillStyle = color;
    c.strokeStyle = color;

    c.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; ++i) {
      c.lineTo(points[i].x, points[i].y);
    }
    c.stroke();
    c.closePath();
  }

  //
  // Override in the implementation
  //
  draw(ctx, points, color) {
    // empty, should be redefined by inherited class
  }

  //
  // Recalculate points before re-draw
  //
  redraw(ctx, scrollOffset, color) {
    var context = ctx;
    var col = color || 'rgba(0,0,0,1)';
    if (!ctx) {
      // TODO: identify context by this.diagram if needed
      return;
    }
    //
    // Re-calculate porint and gips before drawing.
    // We need these steps for all connectors.
    //
    this.points = this._getConnectionPoints(
      this.epoints, scrollOffset);

    this.gip = [];
    for (var i = 0; i < this.points.length - 1; ++i) {
      let dy = this.points[i].y - this.points[i + 1].y,
        dx = this.points[i].x - this.points[i + 1].x;
      this.gip[i] = Math.sqrt(dx * dx + dy * dy);
    }

    this.draw(context, this.points, col);
  }

  //
  // Check if point is on a straight line
  //
  isPointOnLine(x, y) {
    //
    // No points, at all, but it should never happen
    //
    if (!this.points) {
      return false;
    }

    //
    // Check if mouse is near to some extra point
    //
    for (var c = 0; c < this.epoints.length; ++c) {
      if ((this.epoints[c].x - 12 < x) && (this.epoints[c].x + 12 > x) &&
        (this.epoints[c].y - 12 < y) && (this.epoints[c].y + 12 > y)) {
        // dm.at.cs.mouseover = {euid: this.euid, idx: c};
        return true;
      }
    }

    for (var i = 0; i < this.points.length - 1; ++i) {
      var dx1 = x - this.points[i].x, dy1 = y - this.points[i].y,
        dx = this.points[i + 1].x - x, dy = this.points[i + 1].y - y,
        gip1 = Math.sqrt(dx1 * dx1 + dy1 * dy1),
        gip = Math.sqrt(dx * dx + dy * dy);

      if (((gip1 + gip) - this.gip[i]) < 0.2) {
        // dm.at.cs.mouseover = {euid: this.euid};
        return true;
      }
    }
    return false;
  }

  //
  // check if we rp is between p1 and p2 then could remove it
  // if it is on a line
  //
  canRemovePoint(p1, p2, rp) {
    if ((p1 == undefined) || (p2 == undefined)) {
      return false;
    }
    var dx = p1.x - p2.x, dy = p1.y - p2.y, dx1 = p1.x - rp.x,
      dy1 = p1.y - rp.y, dx2 = p2.x - rp.x, dy2 = p2.y - rp.y,
      gip1 = Math.sqrt(dx1 * dx1 + dy1 * dy1),
      gip2 = Math.sqrt(dx2 * dx2 + dy2 * dy2),
      gip = Math.sqrt(dx * dx + dy * dy);
    if (((gip1 + gip2) - gip) < 0.5) {
      return true;
    }
    return false;
  }

  //
  // Start moving an extra point for the connector
  //
  // Extra point position
  eppos = -1
  //
  // Could be override
  //0-
  getNearestPointIndex(x, y) {
    //
    // Check if mouse is near to some extra point ?
    //
    for (var c = 0; c < this.points.length; ++c) {
      if ((this.points[c].x - 12 < x) && (this.points[c].x + 12 > x) &&
        (this.points[c].y - 12 < y) && (this.points[c].y + 12 > y)) {
        return c;
      }
    }

    return -1;
  }

  startTransform(x1, y1, scrollOffset) {
    if (!this.diagram.isEditable()) return;

    // var opman = this.diagram.opman;
    // opman.startTransaction();

    // Clean extra point position
    this.eppos = -1;

    // Some scrolling stuff, do not take in account
    var x = x1 + scrollOffset.left;
    var y = y1 + scrollOffset.top;

    //
    // TODO: no need for this code, just override getNearestEPointIndex
    //       for self-connector and sequence diagram connectors
    //
    // cleanOnNextTransform allow us to move vertical and horizontal
    //                      lines between elements.
    //                      It is single extra point which should be removed on
    //                      next DND
    if ((this.cleanOnNextTransform) && (this.epoints.length == 3)) {
      this.cleanOnNextTransform = false;
      this.eppos = 1;
    } else {
      this.eppos = this.getNearestPointIndex(x, y);
    }

    let newPoint = { x: x1, y: y1 };

    // TODO(connector): add prefix to the options, then no need to use euid
    //
    // Detach first or last point if being transformed
    //
    if ((this.eppos === 0 || this.eppos === this.epoints.length - 1) && this.epoints[this.eppos]['euid']) {
      this.#attachElementToPoint(this.eppos, null);
    }



    //
    // No Point found let's add a new one
    //

    if (this.eppos < 0) {
      //
      // Don't need to identify position if there is no extra points
      //
      if (this.epoints.length == 2) {
        // in array for the first element
        this.eppos = 1;
        this.epoints.splice(this.eppos, 0, newPoint);
      } else {
        //
        // Point - is not one of the extra points, that's why
        // we need to identify where to place a new point
        // So, we have to check each interval to know if point belong to it
        //

        // Get the list of connection points
        this.points = this._getConnectionPoints(this.epoints, scrollOffset);

        for (let zi = 1; zi < this.points.length; ++zi) {
          // TODO: we could keep the state from mouse move events
          if (this.canRemovePoint(
            this.points[zi - 1], this.points[zi], newPoint)) {
            this.eppos = zi;
            //
            // if connector detached, shift point
            //
            this.epoints.splice(this.eppos, 0, newPoint);
            break;
          }
        }

        //
        // It should never happen
        //
        if (this.eppos < 0) {
          console.log("ERROR: failed to find a triggered point. ");
          this.eppos = 1;
          this.epoints.splice(this.eppos, 0, newPoint);
        }

      }
    }

    this.onStartTransform(x, y);
  }

  onStartTransform(x, y) {
    // override if needed
  }

  onStopTransform(x, y) {
    // override if needed
  }

  onTransform(x, y) {
    // override if needed
  }

  #joinEpoitsIfNeeded() {
    var isEqualPoint = function (p1, p2) {
      return Math.abs(p1.x - p2.x) < 12 && Math.abs(p1.y - p2.y) < 12;
    };

    var hasSliced = false;

    //
    // Join a new point with the next point, if it is too close
    //
    if ((this.eppos + 1 < this.epoints.length) &&
      isEqualPoint(this.points[this.eppos], this.points[this.eppos + 1])) {
      // eppos + 1 = could be the last point
      //             that's why remove eppos point
      this.epoints.splice(this.eppos, 1);
      // this.eppos--; NOW NEXT ELEMENT IS ON
      return true;
    }

    //
    // Join a new point with the previous point, if it is too close
    //
    if ((this.eppos > 0) &&
      isEqualPoint(this.points[this.eppos], this.points[this.eppos - 1])) {
      //
      // it could be the first point, which contain euid
      //
      this.epoints.splice(this.eppos, 1);
      this.eppos--;
      return true;
    }
    return hasSliced;
  }

  stopTransform(x1, y1, scrollOffset) {
    //
    //
    //
    if (this.eppos < 0) {
      return;
    }

    // this.diagram.opman.reportStop(
    //     this.report, this.euid, {idx: this.eppos, value: [x, y]});


    this.epoints[this.eppos].x = x1 + scrollOffset.left;
    this.epoints[this.eppos].y = y1 + scrollOffset.top;

    let x = this.epoints[this.eppos].x,
      y = this.epoints[this.eppos].y;


    let needToRefreshPoints = false;
    //
    // Join points if it is dropped on the next or prev point
    //
    needToRefreshPoints = this.#joinEpoitsIfNeeded();

    //
    // need to check drop
    //
    // on previous step we handled the middle points only
    // on current step we need to check end points
    //
    if (!needToRefreshPoints) {
      if (this.eppos === 0 || this.eppos === this.epoints.length - 1) {
        let val = this.diagram._dropConnector({ position: { top: y, left: x } });
        // TODO(connector): add prefix to the options, then no need to use euid
        this.#attachElementToPoint(this.eppos, val);
        needToRefreshPoints ||= (val != null);
      }
    }

    if (needToRefreshPoints) {
      //
      // Refresh connection points, because one or more epoint was drapped
      // TODO: we could remove items from points too, without re-calculation
      //
      this.points = this._getConnectionPoints(
        this.epoints, scrollOffset);
      needToRefreshPoints = false;
    }

    //
    // Check if a new point is on a line
    //
    if (this.points.length > 3  // for 3 points - clean on next transfiormation 
      // for 2 points - the shortest path
      && this.eppos !== 0 // not first point
      && this.eppos !== this.points.length - 1  // nor the last point
      && this.canRemovePoint(
        this.points[this.eppos - 1], this.points[this.eppos + 1],
        this.points[this.eppos])) {
      // dropped point on a straight line of points. Means we can remove it
      this.epoints.splice(this.eppos, 1);
    } else if (this.points.length === 3) {
      this.cleanOnNextTransform = this.canRemovePoint(this.points[0], this.points[2], this.points[1]);
    }

    this.eppos = -1;
    this.onStopTransform(x, y);
  }

  TransformTo(x1, y1) {
    if (this.eppos < 0) {
      return;
    }
    var x = x1 + $('#' + this.diagram.euid).scrollLeft(),
      y = y1 + $('#' + this.diagram.euid).scrollTop();
    this.epoints[this.eppos].x = x;
    this.epoints[this.eppos].y = y;
    this.onTransform(x, y);
  }

  getDescription() {
    // type == nameTemplate
    // epoints - the latest e-points

    // Deep clone epoints, excluding euid and limit, and id if null
    const clonedEpoints = this.epoints.map(point => {
      const cloned = { ...point };
      // Remove runtime properties
      delete cloned.euid;
      delete cloned.limit;
      // Remove id if null
      if (cloned.id === null) {
        delete cloned.id;
      }
      return cloned;
    });

    return {
      ...this.jsonModel,
      nameTemplate: this.options.nameTemplate,
      epoints: clonedEpoints
    };
  }

  getCenterEdgePoint(pos, width, height, otherX, otherY) {
    const centerX = pos.left + width / 2;
    const centerY = pos.top + height / 2;
    const dx = otherX - centerX;
    const dy = otherY - centerY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
      // Horizontal edge (left or right)
      return {
        x: dx > 0 ? pos.left + width : pos.left,
        y: centerY
      };
    } else {
      // Vertical edge (top or bottom)
      return {
        x: centerX,
        y: dy > 0 ? pos.top + height : pos.top
      };
    }
  }

  _getConnectionPoints(epoints, scrollOffset) {
    const scrollTop = scrollOffset.top;
    const scrollLeft = scrollOffset.left;

    const hasFrom = epoints[0]["euid"] != null;
    const hasTo = epoints[epoints.length - 1]["euid"] != null;

    //
    // Detached connectors -> move connector's points only
    //
    if (!hasFrom && !hasTo) {
      return epoints.map(pt => ({
        x: pt.x - scrollLeft,
        y: pt.y - scrollTop
      }));
    }

    const p1 = hasFrom ? $('#' + epoints[0]["euid"] + '_Border').position() : null;
    if (p1) {
      p1.left += 3;
      p1.top += 3;
    }
    const fromBorder = hasFrom ? $('#' + epoints[0]["euid"] + '_Border') : null;
    const fromW = hasFrom ? fromBorder.width() + 6 : 0;
    const fromH = hasFrom ? fromBorder.height() + 6 : 0;

    const p2 = hasTo ? $('#' + epoints[epoints.length - 1]["euid"] + '_Border').position() : null;
    if (p2) {
      p2.left += 3;
      p2.top += 3;
    }
    const toBorder = hasTo ? $('#' + epoints[epoints.length - 1]["euid"] + '_Border') : null;
    const toW = hasTo ? toBorder.width() + 6 : 0;
    const toH = hasTo ? toBorder.height() + 6 : 0;

    const limit = epoints[0]['limit'] || 0;
    const limit2 = epoints[epoints.length - 1]['limit'] || 0;

    if ((hasFrom && !p1) || (hasTo && !p2)) {
      return [];
    }

    //
    // Find the shortes line between 2 elements
    //
    if (epoints.length === 2 && hasFrom && hasTo) {
      // if (!hasFrom || !hasTo) return [];

      let x1, y1, x2, y2;

      if (limit === LimitMode.CENTER) {
        const center = this.getCenterEdgePoint(p1, fromW, fromH, p2.left, p2.top);
        x1 = center.x;
        y1 = center.y;
      } else {
        x1 = this._getRValue(p1.left, p2.left, fromW);
        y1 = this._getRValue(p1.top, p2.top, fromH);
      }

      if (limit2 === LimitMode.CENTER) {
        const center = this.getCenterEdgePoint(p2, toW, toH, p1.left, p1.top);
        x2 = center.x;
        y2 = center.y;
      } else {
        x2 = this._getRValue(p2.left, p1.left, toW);
        y2 = this._getRValue(p2.top, p1.top, toH);
      }
      return [
        { x: x1, y: y1 },
        { x: x2, y: y2 }
      ];
    } else {
      const lln = epoints.length - 1;
      let x1, y1, x2, y2;

      //
      // Refresh first point position
      //
      if (hasFrom) {
        if (limit === LimitMode.CENTER) {
          const center = this.getCenterEdgePoint(
            p1, fromW, fromH,
            epoints[1].x - scrollLeft, epoints[1].y - scrollTop
          );
          x1 = center.x;
          y1 = center.y;
        } else {
          x1 = this._getRValue(p1.left, epoints[1].x - scrollLeft, fromW);
          y1 = this._getRValue(p1.top, epoints[1].y - scrollTop, fromH);
        }
      }

      //
      // Refresh last point position
      //
      if (hasTo) {
        //
        // Recalculate the end point, to the nearest border of element
        //
        if (limit2 === LimitMode.CENTER) {
          const center = this.getCenterEdgePoint(
            p2, toW, toH,
            epoints[lln - 1].x - scrollLeft,
            epoints[lln - 1].y - scrollTop
          );
          x2 = center.x;
          y2 = center.y;
        } else {
          x2 = this._getRValue(p2.left, epoints[lln - 1].x - scrollLeft, toW);
          y2 = this._getRValue(p2.top, epoints[lln - 1].y - scrollTop, toH);
        }
      }

      const newpoints = [];
      for (let i = 0; i < epoints.length; ++i) {
        if (hasFrom && i === 0) {
          newpoints.push({ x: x1, y: y1 });
        } else if (hasTo && i === epoints.length - 1) {
          newpoints.push({ x: x2, y: y2 });
        } else {
          newpoints.push({
            x: epoints[i].x - scrollLeft,
            y: epoints[i].y - scrollTop
          });
        }
      }

      return newpoints;
    }
  }

  _getRValue(x1, x2, w) {
    var diffx = x2 - x1;
    if (diffx > 0) {
      if (diffx > w) return x1 + w;
      return x2;
    }
    return x1;
  }


  //
  // This part is related to multiple elements DND
  // When user select both: fromId and toId elements
  //
  epoints_drag = [];
  labels_drag = [];
  onDragStart(ui) {
    //
    // Clone points on drag start
    //
    if (this.epoints.length > 0) {
      this.epoints_drag = [];
      for (var i in this.epoints) {
        this.epoints_drag[i] = { x: this.epoints[i].x, y: this.epoints[i].y };
      }
    }
    //
    // Clone labels on drag start
    //
    if (this.labels && this.labels.length > 0) {
      this.labels_drag = [];
      for (var i in this.labels) {
        var p = this.labels[i].position();
        this.labels_drag[i] = { x: p.left, y: p.top };
      }
    }

    this.options.dragStart = true;

    // this.diagram.opman.reportStart("option", this.euid, {'epoints':
    // this.epoints_drag, 'labels':this.labels_drag});
  }

  onDragMove(ui) {
    if (!this.options.dragStart) {
      return;
    }
    //
    // Move points on dx/dy relative to original position
    //
    for (var i in this.epoints_drag) {
      this.epoints[i].x = this.epoints_drag[i].x + ui.left;
      this.epoints[i].y = this.epoints_drag[i].y + ui.top;
    }
    //
    // Move labels on dx/dy relative to original position
    //
    for (var i in this.labels_drag) {
      this.labels[i].css({
        left: this.labels_drag[i].x + ui.left,
        top: this.labels_drag[i].y + ui.top
      });
    }
  }

  onDragStop(ui) {
    if (ui) {
      // Update the final position of points
      this.onDragMove(ui);
    }

    // this.diagram.opman.reportStop("option", this.euid, {'epoints':
    // this.epoints.slice(0), 'labels':this.labels.slice(0)});

    //
    // Reset state and cached data
    //
    this.options.dragStart = false;
    this.epoints_drag = [];
    this.labels_drag = [];
  }

  removeInstance() {
    if (this.labels.length > 0) {
      for (let i = 0; i < this.labels.length; ++i) {
        this.labels[i].remove();
      }
      this.labels = [];
    }

    // avoid data loop:
    // remove user data which are binded
    // to the current instance and have a references on it
    super.removeInstance();
  }

  update(changes) {
    let appliedChanges = {}; // Stores new values
    let revertedChanges = {}; // Stores old values

    for (const key in changes) {
      if (Array.isArray(changes[key]) && Array.isArray(this.jsonModel[key])) {
        // Handle array updates (like labels)
        appliedChanges[key] = [];
        revertedChanges[key] = [];

        this.jsonModel[key] = this.jsonModel[key].map(item => {
          let updatedItem = changes[key].find(changeItem => changeItem.id === item.id);
          if (updatedItem) {
            appliedChanges[key].push({ id: item.id, ...updatedItem });
            revertedChanges[key].push({ id: item.id, ...item }); // Store old state
            return { ...item, ...updatedItem }; // Apply changes
          }
          return item;
        });
      } else {
        // Directly update primitive values or non-array objects
        appliedChanges[key] = changes[key];
        revertedChanges[key] = this.jsonModel[key];
        this.jsonModel[key] = changes[key];
      }
    }

    return { apply: appliedChanges, revert: revertedChanges };
  }

  dashedLine(p1, p2, c) {
    var x2 = p2.x, x1 = p1.x, y2 = p2.y, y1 = p1.y;

    var x = 10,  // dash length
      dashf = 5, dashe = 3, dx = x2 - x1, dy = y2 - y1,
      gip = Math.sqrt(dx * dx + dy * dy);

    if (gip < x)  // Nothing to draw
      return;

    var sina = dy / gip, cosa = dx / gip, fx = dashf * cosa, fy = dashf * sina,
      ex = dashe * cosa, ey = dashe * sina;

    for (let i = 0; i < (gip / (dashf + dashe)); ++i) {
      c.moveTo(x1, y1);

      c.lineTo(x1 + fx, y1 + fy);
      x1 += (ex + fx);
      y1 += (ey + fy);
    }
  }
}

export { BaseConnector }