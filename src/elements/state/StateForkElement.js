import { BaseElement } from "../BaseElement";

class StateForkElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            'nameTemplate': "statefork",
            'droppable': false,
            iconMenu: "state",
            ...options
        };
        let defaultjsonModel = {
            'width': 230,
            'height': 15,
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
    }

    _create() {
        let innerHtml = '<div id="' + this.euid + '" class="us-forknode us-element-resizable-area"></div>';

        this.diagram.nativeRef.append(innerHtml);
    }
}

export {  StateForkElement }