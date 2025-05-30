import { BaseElement } from "../BaseElement";

class PortElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            'nameTemplate': "port",
            'droppable': false,
            resizeable: "none",
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
        // Additional option for update
        this.jsonModel.height_b = $("#" + this.euid + "_Border .us-package-body").height();
    }

    _create() {
        let innerHtml = '<div id="' + this.euid + '"  class="us-port grElement"></div>';

        this.diagram.nativeRef.append(innerHtml);
    }
}

export {  PortElement }