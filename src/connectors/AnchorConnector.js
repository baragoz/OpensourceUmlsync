
import {BaseConnector} from './BaseConnector';

const defaultOptions = {
  nameTemplate: 'anchor'
}

class AnchorConnector extends BaseConnector {
  constructor(options, jsonModel, diagram) {
    super({...defaultOptions, ...options}, jsonModel, diagram);
  }

  draw(c, points, color) {
    if ((points == null) || (points.length < 2)) {
      return;
    }
    for (var i = 0; i < points.length - 1; ++i) {
      c.beginPath();
      c.fillStyle = color;
      c.strokeStyle = color;

      this.dashedLine(points[i], points[i + 1], c);
      c.stroke();
      c.closePath();
    }
  }
}

export {AnchorConnector}