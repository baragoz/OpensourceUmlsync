import { BaseElement } from "../BaseElement";

class StateCircleElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            nameTemplate: "statecircle",
            droppable: false,
            resizeable: "none",
            midpoint: true,
            ...options
        };
        let defaultjsonModel = {
            width: 35,
            height: 35,
            state: "",
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
        // Update the content based on state
        this._updateStateContent();
    }

    _updateStateContent() {
        const circleDiv = this.nativeRef.find('.us-state-circle');
        if (circleDiv.length === 0) return;

        const state = this.jsonModel.state || "";
        let content = '';

        if (state === "h") {
            content = '<div class="us-state-circle-h">H</div>';
        } else if (state === "h*") {
            content = '<div class="us-state-circle-h">H<span class="us-state-circle-star">*</span></div>';
        } else if (state === "x") {
            content = '<div class="us-state-circle-x"></div>';
        }
        // state === "" shows just the circle, no content

        circleDiv.html(content);
    }

    _create() {
        const state = this.jsonModel.state || "";
        let content = '';

        if (state === "h") {
            content = '<div class="us-state-circle-h">H</div>';
        } else if (state === "h*") {
            content = '<div class="us-state-circle-h">H<span class="us-state-circle-star">*</span></div>';
        } else if (state === "x") {
            content = '<div class="us-state-circle-x"></div>';
        }
        // state === "" shows just the circle, no content

        let innerHtml = '<div id="' + this.euid + '" class="us-interaaction-statecircle us-element-resizable-area">\
                           <div class="us-state-circle grElement">' + content + '</div>\
                         </div>';

        this.diagram.nativeRef.append(innerHtml);
    }
}

export { StateCircleElement }

