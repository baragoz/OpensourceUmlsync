import { BaseElement } from "../BaseElement";

class SQLostElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            'nameTemplate': "sqlost",
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
            // always a black filled circle, color is not configurable
            return;
        }
        super._updateJsonModel(key, value);
    }

    _setOption( key, value ) {
        if (key === "color") {
            // always a black filled circle, color is not configurable
            return;
        }
        super._setOption(key, value);
    }

    _create() {
        // it is just X - SVG element, no coloring options, may be 
        // slighttly resizeable
        let innerHtml = '<div id="' + this.euid + '" class="us-full-svg" style="width:100%;">\
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\
              <circle cx="12" cy="12" r="10" fill="#000"/>\
            </svg></div>';
        this.diagram.nativeRef.append(innerHtml);
    }
}

export {  SQLostElement }