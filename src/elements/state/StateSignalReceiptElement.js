import { BaseElement } from "../BaseElement";

class StateSignalReceiptElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            nameTemplate: "statesignalreceipt",
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

    _updateJsonModel( key, value ) {
        if (key === "color") {
            this.nativeRef.find(".grElement").css("background-color", value || "none");
            this.nativeRef.find("#us-triangle-top-colored>svg>polygon").css("fill", value || "none");
            this.nativeRef.find("#us-triangle-bottom-colored>svg>polygon").css("fill", value || "none");
            this.jsonModel[key] = value;
        } else {
            super._updateJsonModel(key, value);
        }
    }

    _create() {
        let innerHtml = '<div id="' + this.euid + '" class="us-state-signal-receipt us-element-resizable-area">\
                        <div class="us-state-signal-receipt-container">\
                            <div class="us-triangle-container">\
                                <div class="us-triangle-top">\
                                    <div id="us-triangle-top-black">\
                                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">\
                                            <polygon points="100,0 0,0 100,100" fill="black"></polygon>\
                                        </svg>\
                                        <div id="us-triangle-top-colored">\
                                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">\
                                                <polygon points="100,0 0,0 100,100" fill="white"></polygon>\
                                            </svg>\
                                        </div>\
                                    </div>\
                                </div>\
                                <div class="us-triangle-bottom">\
                                    <div id="us-triangle-bottom-black">\
                                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">\
                                            <polygon points="0,100 100,100 100,0" fill="black"></polygon>\
                                        </svg>\
                                        <div id="us-triangle-bottom-colored">\
                                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">\
                                                <polygon points="0,100 100,100 100,0" fill="white"></polygon>\
                                            </svg>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                            <a class="editablefield grElement us-state-signal-receipt-text" tabindex="1">' + this.jsonModel.name + '</a>\
                        </div>\
                        </div>';

        this.diagram.nativeRef.append(innerHtml);
    }
}

export { StateSignalReceiptElement }

