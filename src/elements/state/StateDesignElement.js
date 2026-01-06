import { BaseElement } from "../BaseElement";

class StateDesignElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            nameTemplate: "statedesign",
            droppable: false,
            midpoint: true,
            iconMenu: "state",
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
                            <div class="us-outer-diamond"></div>\
                            <div class="us-inner-diamond grElement"></div>\
                          </div>';

        this.diagram.nativeRef.append(innerHtml);
    }

    _updateJsonModel( key, value ) {
        if (key === "color") {
            this.nativeRef.find(".grElement").css("background-color", value || "none");
            this.jsonModel[key] = value;
        } else {
            super._updateJsonModel(key, value);
        }
    }

}

export {  StateDesignElement }