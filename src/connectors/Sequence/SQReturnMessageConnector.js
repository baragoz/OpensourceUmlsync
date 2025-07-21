import { BaseSQConnector } from './BaseSQConnector';

const defaultOptions = {
  nameTemplate: 'sqreturnmessage'
}

class SQReturnMessageConnector extends BaseSQConnector {
  constructor(options, jsonModel, diagram) {
    super({...defaultOptions, ...options}, jsonModel, diagram);
  }

  draw(c, points, color) {
    if ((points == null) || (points.length < 2)) {
      return;
    }
    var ep = points.length - 1, x = 10;
    var x2 = points[ep].x, x1 = points[ep - 1].x, y2 = points[ep].y,
        y1 = points[ep - 1].y;

    var dx = x2 - x1, dy = y2 - y1, gip = Math.sqrt(dx * dx + dy * dy);

    var sina = dy / gip, cosa = dx / gip,
        x3 = x2 - Math.sqrt(x * x * 3 / 4) * cosa,
        y3 = y2 - Math.sqrt(x * x * 3 / 4) * sina,
        x4 = x3 + x * sina/2,
        y4 = y3 - x * cosa / 2, x5 = x3 - x * sina / 2, y5 = y3 + x * cosa / 2;

    c.beginPath();
    c.fillStyle = color;
    c.strokeStyle = color;
    for (let i = 0; i < points.length - 1; ++i) {
      this.dashedLine(points[i], points[i + 1], c);
    }

    c.moveTo(x4, y4);
    c.lineTo(x2, y2);
    c.lineTo(x5, y5);
    c.stroke();
    c.closePath();
  }
}

export {SQReturnMessageConnector}