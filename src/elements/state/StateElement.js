import { BaseElement } from "../BaseElement";

class StateElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            nameTemplate: "state",
            droppable: false,
            midpoint: true,
            ...options
        };
        let defaultjsonModel = {
            'width': 130,
            'height': 35,
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
    }

    _create() {
        let innerHtml = '<div id="' + this.euid + '" class="us-state grElement us-element-resizable-area">\
                        <a class="editablefield" style="text-align:left;position:relative;top:30%">' + this.jsonModel.name + '</a>\
                        </div>';

        this.diagram.nativeRef.append(innerHtml);
    }
}

export {  StateElement }