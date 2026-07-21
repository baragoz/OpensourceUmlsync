import { BaseConnector } from "./BaseConnector";

const defaultOptions = {
  nameTemplate: "selfassociation",
};

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

  _init() {
    if (
      !this.epoints ||
      this.epoints.length === 0 ||
      !this.epoints[0]["euid"]
    ) {
      return;
    }

    var euid = this.epoints[0]["euid"];
    var p11 = $("#" + euid + "_Border").position();

    if (!p11) {
      alert("Not found " + euid);
      return;
    }

    this.dleft = 40;
    this.dtop = 20;
    this.dright = 20;

    // Initialize epoints if needed
    if (this.epoints.length < 3) {
      this.epoints[0] = { x: p11.left + 20, y: p11.top - 20 };
      this.epoints[1] = { x: p11.left + 140 + 40, y: p11.top - 20 };
      this.epoints[2] = { x: p11.left + 180, y: p11.top + 20 };
    } else {
      this.epoints[0].x = p11.left + 40;
      this.epoints[0].y = p11.top - 20;
      this.epoints[1].x = p11.left + 180;
      this.epoints[1].y = p11.top - 20;
      this.epoints[2].x = p11.left + 180;
      this.epoints[2].y = p11.top + 20;
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

    var p11 = $("#" + euid + "_Border").position();
    if (!p11) {
      alert("Not found " + euid);
      return [];
    }

    var p1 = $("#" + euid).position();
    var p2 = p1;
    var p21 = p11;

    // Ensure we have at least 3 points for self-association
    if (epoints.length < 3) {
      // If we don't have enough points, create default self-association shape
      var x1 = this._getRValue(
        p1.left + p11.left,
        p2.left + p21.left,
        $("#" + euid).width(),
      );
      var y1 = this._getRValue(
        p1.top + p11.top,
        p2.top + p21.top,
        $("#" + euid).height(),
      );
      var x2 = this._getRValue(
        p2.left + p21.left,
        p1.left + p11.left,
        $("#" + euid).width(),
      );
      var y2 = this._getRValue(
        p2.top + p21.top,
        p1.top + p11.top,
        $("#" + euid).height(),
      );
      return [
        { x: x1 - scrollLeft, y: y1 - scrollTop },
        { x: (x1 + x2) / 2 - scrollLeft, y: y1 - 20 - scrollTop },
        { x: x2 - scrollLeft, y: y2 - scrollTop },
      ];
    } else {
      // Use existing epoints but adjust first and last based on element position
      var lln = epoints.length - 1;
      var x1 = this._getRValue(
        p1.left + p11.left,
        epoints[1].x,
        $("#" + euid).width(),
      );
      var y1 = this._getRValue(
        p1.top + p11.top,
        epoints[1].y,
        $("#" + euid).height(),
      );
      var x2 = this._getRValue(
        p2.left + p21.left,
        epoints[lln - 1].x,
        $("#" + euid).width(),
      );
      var y2 = this._getRValue(
        p2.top + p21.top,
        epoints[lln - 1].y,
        $("#" + euid).height(),
      );

      var newpoints = [];
      newpoints[0] = { x: x1 - scrollLeft, y: y1 - scrollTop };
      for (let i = 1; i < epoints.length - 1; i++) {
        newpoints[i] = {
          x: epoints[i].x - scrollLeft,
          y: epoints[i].y - scrollTop,
        };
      }
      newpoints[epoints.length - 1] = { x: x2 - scrollLeft, y: y2 - scrollTop };
      return newpoints;
    }
  }
}

export { SelfAssociationConnector };
