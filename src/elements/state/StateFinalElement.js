import { BaseElement } from "../BaseElement";

class StateFinalElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            nameTemplate: "statefinal",
            droppable: false,
            resizeable: "none",
            midpoint: true,
            ...options
        };
        let defaultjsonModel = {
            'width': 35,
            'height': 35,
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
    }

    _create() {
        let innerHtml = '<div id="' + this.euid + '" style="width:100%;height:100%;">\
                            <div class="us-outer-circle">\
                              <div class="us-inner-circle"></div>\
                            </div>\
                          </div>';

        this.diagram.nativeRef.append(innerHtml);
    }
}

export {  StateFinalElement }