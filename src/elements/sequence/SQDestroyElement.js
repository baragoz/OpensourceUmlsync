import { BaseElement } from "../BaseElement";

class SQDestroyElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            'nameTemplate': "sqdestroy",
            'droppable': true,
           // 'midpoint': 2,
            ...options
        };
        let defaultjsonModel = {
            'width': 30,
            'height': 30,
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
    }

    _updateJsonModel( key, value ) {
        if (key === "color") {
            // always black X lines, color is not configurable
            return;
        }
        super._updateJsonModel(key, value);
    }

    _setOption( key, value ) {
        if (key === "color") {
            // always black X lines, color is not configurable
            return;
        }
        super._setOption(key, value);
    }

    _create() {
        // it is just X - SVG element, no coloring options, may be 
        // slighttly resizeable
        let innerHtml = '<div id="' + this.euid + '" class="us-full-svg" style="width:100%;">\
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"xmlns="http://www.w3.org/2000/svg">\
              <line x1="4" y1="4" x2="20" y2="20" stroke="#000" stroke-width="2"/>\
              <line x1="20" y1="4" x2="4" y2="20" stroke="#000" stroke-width="2"/>\
            </svg></div>';
        this.diagram.nativeRef.append(innerHtml);
    }
}

export {  SQDestroyElement }