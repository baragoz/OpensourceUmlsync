import { BaseElement } from "../BaseElement";

class SQPortElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            'nameTemplate': "sqport",
            'droppable': ftrue,
            'resizable_h': 's-u,n-u',
            ...options
        };
        let defaultjsonModel = {
            'width': 18,
            'height': 80,
            'level': -1,
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
    }

    _create() {
        // it is just a vertical rectangle
        let innerHtml = '<div id="' + this.euid + '" class="us-sqd-port us-element-resizable-area grElement"></div>';
        this.diagram.nativeRef.append(innerHtml);
    }
}

export {  SQPortElement }