import {BaseConnector} from './BaseConnector';

const defaultOptions = {
  nameTemplate: 'selfassociation'
}

class SelfAssociationConnector extends BaseConnector {
  constructor(options, jsonModel, diagram) {
    super({...defaultOptions, ...options}, jsonModel, diagram);
  }

  draw(context2, points, color) {
    if ((points == null) || (points.length < 2)) {
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
    var p11 = $('#'+ this['from'] + "_Border").position();

    if (!p11) {
       alert("Not found " + this['from']);
       return;
    }
    
    this.dleft = 40;
    this.dtop = 20;
    this.dright = 20;
    this.epoints[0] = [];
    this.epoints[1] = [];
    this.epoints[2] = [];
    this.epoints[0][0] = p11.left + 20; //this.dleft;
    this.epoints[0][1] = p11.top - 20; //this.dtop;
    this.epoints[1][0] = p11.left + 140 + 40; //this.dright;
    this.epoints[1][1] = p11.top - 20;
    this.epoints[2][0] = p11.left + 180;
    this.epoints[2][1] = p11.top + 20;
  }

  _getConnectionPoints(fromId, toId, epoints) {
     if (fromId != toId)
       alert("SELF-CONNECTION suppose the same source and destination element");
     //alert(" Get connection points: " + fromId + "  " + toId);

    var p11 = $('#'+ this['fromId'] + "_Border").position();
    if (!p11) {
       alert("Not found " + this['fromId']);
       return;
    }

    this.epoints.splice(3, this.epoints.length-3);
    this.epoints[0].x = p11.left + 40;
    this.epoints[0].y = p11.top - 20;
    this.epoints[1].x = p11.left + 180;
    this.epoints[1].y = p11.top - 20;
    this.epoints[2].x = p11.left + 180;
    this.epoints[2].y = p11.top + 20;

     var p1 = $('#'+ fromId).position();
     var p2 = p1;

     var p21 = p11;
     var scrollTop = 0,//$("#" + this.parrent.euid).scrollTop(),
         scrollLeft = 0;//$("#" + this.parrent.euid).scrollLeft();

     
     if ((epoints == undefined) || (epoints.length ==0)) {
       var x1 = this._getRValue(p1.left + p11.left, p2.left + p21.left, $('#'+ fromId).width()) ;
       var y1 = this._getRValue(p1.top + p11.top, p2.top + p21.top, $('#'+ fromId).height()) ;
       var x2 = this._getRValue(p2.left + p21.left, p1.left + p11.left, $('#' + toId).width());
       var y2 = this._getRValue(p2.top + p21.top, p1.top + p11.top,  $('#' + toId).height());
       var newpoints = [{x: x1 + scrollLeft, y: y1 - scrollTop}, {x: x2 + scrollLeft, y: y2 - scrollTop}];
      return newpoints;
     }
     else {
       var lln = epoints.length -1;
       var x1 = this._getRValue(p1.left + p11.left, epoints[0][0], $('#'+ fromId).width()) ;
       var y1 = this._getRValue(p1.top + p11.top, epoints[0][1], $('#'+ fromId).height()) ;

       var x2 = this._getRValue(p2.left + p21.left, epoints[lln][0], $('#' + toId).width());
       var y2 = this._getRValue(p2.top + p21.top, epoints[lln][1], $('#' + toId).height());

      var newpoints = [];
      newpoints[0] = {x: x1 + scrollLeft, y: y1 - scrollTop};
      for (i=1;i<=epoints.length;++i) {
        newpoints[i] = epoints[i-1];          
      }
      newpoints[epoints.length + 1] = { x: x2 + scrollLeft, y: y2 - scrollTop };
      return newpoints;
     }
  }
}

export {SelfAssociationConnector}