import { BaseElement } from "../BaseElement";

class StateSignalSendElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            nameTemplate: "statesignalsend",
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
        let innerHtml = '<div id="' + this.euid + '" class="us-state-signal-send grElement us-element-resizable-area">\
                        <a class="editablefield" style="text-align:left;position:relative;top:30%">' + this.jsonModel.name + '</a>\
                        </div>';

        this.diagram.nativeRef.append(innerHtml);
    }
}

export { StateSignalSendElement }

