import { BaseElement } from "../BaseElement";

class StateStartElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            nameTemplate: "statestart",
            droppable: false,
            resizeable: "none",
            midpoint: true,
            ...options
        };
        let defaultjsonModel = {
            width: 35,
            height: 35,
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
    }

    _create() {
        let innerHtml = '<div id="' + this.euid + '" class="us-interaaction-start us-element-resizable-area">\
                           <div class="us-start-circle"></div>\
                         </div>';

        this.diagram.nativeRef.append(innerHtml);
    }

    _updateJsonModel( key, value ) {
        if (key === "color") {
            // ignore color update
        } else {
            super._updateJsonModel(key, value);
        }
    }
}

export {  StateStartElement }