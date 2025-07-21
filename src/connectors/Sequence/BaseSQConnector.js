import { BaseConnector } from '../BaseConnector';



const defaultOptions = {
  nameTemplate: 'baseSQConnector',
  selected: false
};

//
// Sequence diagram connectors - HORIZONTAL
//

class BaseSQConnector extends BaseConnector {
  constructor(options, jsonModel, diagram) {
    super({ ...defaultOptions, ...options }, jsonModel, diagram);
  }

  _create() {
    var self = this;
    // TODO: remove it? 
    if (this.jsonModel.epoints != undefined) {
      $.each(this.jsonModel.epoints, function (idx, item) {
        item.x = parseInt(item.x);
        item.y = parseInt(item.y);
      });
    }

    //
    // Find elements from diagram for connector
    //
    var ep = this.jsonModel.epoints;

    var localFromElement = null;
    var localToElement = null;

    //
    // Load diagram from JSON, find euid by id 
    //
    if (ep[0]['id'] || ep[ep.length - 1]['id'] != null) {
      for (var i in this.diagram.elements) {
        if (this.diagram.elements[i].jsonModel['id'] == ep[0]['id']) {
          ep[0]['euid'] = this.diagram.elements[i].euid;
          localFromElement = this.diagram.elements[i];
          ep[0]['limit'] = this.diagram.elements[i].options.midpoint || 0;
        }

        if (this.diagram.elements[i].jsonModel['id'] == ep[ep.length - 1]['id']) {
          ep[ep.length - 1]['euid'] = this.diagram.elements[i].euid;
          localToElement = this.diagram.elements[i];
          ep[ep.length - 1]['limit'] = this.diagram.elements[i].options.midpoint || 0;
        }
      }
    }

    //
    // We need 2 points minimum to show the line
    // - make a random line
    //
    if (ep.length < 3) {
      if (ep.length == 0) {
        // Draw a lost points
        this.jsonModel.epoints = [{ x: 40, y: 150 }, { x: 100, y:150 }, { x: 150, y:150 }];
      } else if (ep.length == 1) {
        //
        // if we have one point, then let's assume that it is start point !!!!
        //
        if (ep[0]['euid']) {
          this.jsonModel.epoints.push({ x: ep[0].x + 200, y: ep[0].y });
        }
      } 
      // Keep 2 points if one point is detached OR 
      // if it is the connection helper element
      // otherwise adding an extra point
      else if (ep.length == 2 && ep[0]['euid'] && ep[1]['euid'] && ep[1]['euid'] !== "ConnectionHelper") {
        this.jsonModel.epoints.splice(1, 0, {x: (ep[1].x + ep[0].x)/2, y: ep[1].y});
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
    // point to the same object
    //
    this.epoints = ep;

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
    // Check if mouse is near to the end points
    //

    if ((Math.abs(this.points[0].x - x) < 12 && Math.abs(this.epoints[0].y - y) < 12)
      || (Math.abs(this.points[this.points.length - 1].x - x) < 12 && Math.abs(this.epoints[this.points.length - 1].y - y) < 12)) {
      return true;
    }

    //
    // THIS IS THE MAIN DIFFERENCE
    //
    // take in account only 2 points
    var dx1 = x - this.points[0].x,
        dy1 = y - this.points[0].y,
        dx = this.points[this.points.length - 1].x - x, 
        dy = this.points[this.points.length - 1].y - y,
        dx2 = this.points[this.points.length - 1].x - this.points[0].x, 
        dy2 = this.points[this.points.length - 1].y - this.points[0].y,
        gip1 = Math.sqrt(dx1 * dx1 + dy1 * dy1),
        gip = Math.sqrt(dx * dx + dy * dy),
        gip2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    if (((gip1 + gip) - gip2) < 0.2) {
      return true;
    }

    return false;
  }

  startTransform(x1, y1, scrollOffset) {
    if (!this.diagram.isEditable()) return;

    // var opman = this.diagram.opman;
    // opman.startTransaction();

    // Clean extra point position
    this.eppos = -1;
    this.label_start_y = y1;

    // Some scrolling stuff, do not take in account
    var x = x1 + scrollOffset.left;
    var y = y1 + scrollOffset.top;

    this.eppos = this.getNearestPointIndex(x, y);
    // is start point
    this.isStartPoint = (this.eppos === 0 || this.eppos === this.epoints.length - 1);
    //
    // firt or last point - return
    //
    if (!this.isStartPoint) {
      this.eppos = 1;
      // add point if needed
      if (this.epoints.length < 3) {
        this.epoints.splice(1, 0, { x: x1, y: y1 });
      } else {
        this.epoints[1] = { x: x1, y: y1 };
      }
    } else {
      if (this.epoints.length >= 3) {
        // remove middle point
        this.epoints.splice(1,1);
      }
      this.epoints[this.eppos]["euid"] = null;
      
    }

    // cache labels for dnd
    if (this.labels && this.labels.length > 0) {
      this.labels_drag = [];
      for (var i in this.labels) {
        var p = this.labels[i].position();
        this.labels_drag[i] = { x: p.left, y: p.top };
      }
    }

    this.onStartTransform(x, y);
  }

  stopTransform(x1, y1, scrollOffset) {
    //
    //
    //
    if (this.eppos < 0) {
      return;
    }

    var x = x1 + $('#' + this.diagram.euid).scrollLeft(),
      y = y1 + $('#' + this.diagram.euid).scrollTop();

    // change x for start points only
    if (this.isStartPoint) {
      this.epoints[this.eppos].x = x;
    }

    // apply y for all points
    for (let t = 0; t < this.epoints.length; ++t) {
      this.epoints[t].y = y;
    }

    //
    // Check the position of start point
    //
    let start = this.diagram._dropConnector({ position: { top: y, left: this.epoints[0].x } });
    this.epoints[0]["euid"] = start ? start.euid : null;
    this.epoints[0]["limit"] = start ? start.options.midpoint : 0;

    //
    // Check the end point drop position
    //
    let end = this.diagram._dropConnector({ position: { top: y, left: this.epoints[this.epoints.length - 1].x } });
    this.epoints[this.epoints.length-1]["euid"] = end ? end.euid : null;
    this.epoints[this.epoints.length-1]["limit"] = end ? end.options.midpoint : 0;

    //
    // has both ends attached => add an extra point in the middle
    //
    if (this.epoints[0]["euid"] && this.epoints[1]["euid"]) {
      if (this.epoints.length == 2) {
        this.epoints.splice(1,0, {x: (this.epoints[0].x + this.epoints[1].x)/2, y: y});
      }
    } else {
      //
      // One end detached -> remove the middle point
      //
      if (this.epoints.length === 3)
        this.epoints.splice(1,1);
    }

    this.labels_drag = [];
    this.label_start_y =  0;
    this.eppos = -1;
    this.onStopTransform(x, y);
  }

  TransformTo(x1, y1) {
    if (this.eppos < 0) {
      return;
    }
    var x = x1 + $('#' + this.diagram.euid).scrollLeft(),
      y = y1 + $('#' + this.diagram.euid).scrollTop();

    // change x for start points only
    if (this.isStartPoint) {
      this.epoints[this.eppos].x = x;
    }

    // apply y for all points
    for (let t = 0; t < this.epoints.length; ++t) {
      this.epoints[t].y = y;
    }

    // Move labels
    var dx = y1 - this.label_start_y;
    for (var i in this.labels_drag) {
      this.labels[i].css({
        left: this.labels_drag[i].x,
        top: this.labels_drag[i].y + dx
      });
    }

    // not needed ??? 
    this.onTransform(x, y);
  }



  _getConnectionPoints(epoints, scrollOffset) {
    const scrollTop = scrollOffset.top;
    const scrollLeft = scrollOffset.left;

    console.log("GET POINTS:", epoints);

    if (epoints.length == 2 && epoints[1]["euid"] === "ConnectionHelper") {
      var ch = $("#ConnectionHelper_Border");
      var p1 = ch.position();
      var fe = $("#" + epoints[0]["euid"] + "_Border");
      var p2 = fe.position();

      if (p1 && p2) {
          return [{x: p2.left + fe.width()/2, y: p1.top}, {x: p1.left, y: p1.top}];
      }
    }

    // TODO: Throw an exception
    if (epoints.length < 2) {
      return [];
    }

    var startElement = null;
    var endElement = null;
    //
    // refresh x position of strart element
    //
    if (epoints[0]['euid']) {
      var fe = $("#" + epoints[0]["euid"] + "_Border");
      var fp = fe.position();
      
      if (fp) {
        startElement = fe;
        epoints[0].x = fp.left + fe.width()/2 + 4;
      }
    }

    //
    // refresh end element x position
    //
    if (epoints[epoints.length -1]["euid"]) {
        var te = $("#" + epoints[epoints.length -1]["euid"] + "_Border");
        var tp = te.position();
      if (tp) {
        endElement = te;
        epoints[epoints.length -1].x = tp.left + te.width()/2 + 4;
      }
    }

    if (epoints[epoints.length -1].x  > epoints[0].x) {
      // regular point, not mid point
      if (startElement && !epoints[0]['limit']) {
          epoints[0].x += startElement.width()/2;
      }
      if (endElement && !epoints[epoints.length -1]['limit']) {
        epoints[epoints.length -1].x -= endElement.width()/2;
      }
    } else {
      // regular point, not mid point
      if (startElement && !epoints[0]['limit']) {
          epoints[0].x -= startElement.width()/2;
      }
      if (endElement && !epoints[epoints.length -1]['limit']) {
        epoints[epoints.length -1].x += endElement.width()/2;
      }
    }


    if (epoints.length === 3) {
        return [
          {x: epoints[0].x, y: epoints[1].y},
          {x: epoints[2].x, y: epoints[1].y}
        ];
    }

    if (epoints.length == 2) {
      //
      // start point has a fixed element, then points to the end element
      //
      if (this.epoints[0]['euid'] || !this.epoints[1]['euid']) {
        return [
          {x: epoints[0].x,  y: epoints[1].y},
          {x: epoints[1].x,  y: epoints[1].y}
        ];
      }

      // start point detached => will be the main point for Y
      return [
          {x: epoints[0].x,  y: epoints[0].y},
          {x: epoints[1].x,  y: epoints[0].y}
        ];
    }

    const newpoints = [];
    for (let i = 0; i < epoints.length; ++i) {
      newpoints.push({
        x: epoints[i].x - scrollLeft,
        y: epoints[i].y - scrollTop
      });
    }

    return newpoints;
  }



}

export { BaseSQConnector }