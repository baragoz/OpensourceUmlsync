import { BaseElement } from "../BaseElement";

class SQDestroyElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            'nameTemplate': "sqdestroy",
            'droppable': true,
            ...options
        };
        let defaultjsonModel = {
            'width': 40,
            'height': 40,
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
    }

    _create() {
        // it is just X - SVG element, no coloring options, may be 
        // slighttly resizeable
        let innerHtml = '<div id="' + this.euid + '" style="width:100%;">X</div>';
        this.diagram.nativeRef.append(innerHtml);
    }
}

export {  SQDestroyElement }