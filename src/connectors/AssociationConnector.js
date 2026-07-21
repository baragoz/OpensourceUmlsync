import { BaseConnector } from "./BaseConnector";

const defaultOptions = {
  nameTemplate: "association",
};

class AssociationConnector extends BaseConnector {
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
}

export { AssociationConnector };
