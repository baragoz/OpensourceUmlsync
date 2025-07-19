import { BaseConnector } from './BaseConnector';

const defaultOptions = {
    nameTemplate: 'assembly'
}

class AssemblyConnector extends BaseConnector {
    constructor(options, jsonModel, diagram) {
        super({ ...defaultOptions, ...options }, jsonModel, diagram);
    }

    draw(c, points, color) {
        if ((points == null) || (points.length < 2)) {
            return;
        }
        var ep = points.length - 1;
        var x2 = points[ep].x, x1 = points[ep - 1].x, y2 = points[ep].y,
            y1 = points[ep - 1].y;

        var x = 16, dx = x2 - x1, dy = y2 - y1, gip = Math.sqrt(dx * dx + dy * dy);

        if (gip < x) return;

        var sina = dy / gip, cosa = dx / gip,
            x3 = x2 + Math.sqrt(x * x * 3 / 4) * cosa,
            y3 = y2 + Math.sqrt(x * x * 3 / 4) * sina,
            x6 = x1 - Math.sqrt(x * x * 3) * cosa,
            y6 = y1 - Math.sqrt(x * x * 3) * sina, x4 = x3 + x * sina / 2,
            y4 = y3 - x * cosa / 2, x5 = x3 - x * sina / 2, y5 = y3 + x * cosa / 2;

        c.beginPath();
        c.fillStyle = color;
        c.strokeStyle = color;
        c.moveTo(points[0].x, points[0].y);
        for (let i = 1; i <= ep; ++i) {
            c.lineTo(points[i].x, points[i].y);
        }
        c.stroke();

        // Now draw the arc
        c.beginPath();
        let asin = Math.acos(sina);
        if (cosa > 0) asin = -asin;
        c.arc(x3, y3, x, asin, asin + Math.PI, true);
        c.stroke();
    }
}

export { AssemblyConnector }