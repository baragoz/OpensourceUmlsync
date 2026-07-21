import { BaseElement } from "../BaseElement";

class StateSignalSendElement extends BaseElement {
  constructor(options, jsonModel, diagram) {
    let defaultOptions = {
      nameTemplate: "statesignalsend",
      droppable: false,
      midpoint: true,
      ...options,
    };
    let defaultjsonModel = {
      width: 130,
      height: 35,
      ...jsonModel,
    };

    super(defaultOptions, defaultjsonModel, diagram);
  }

  _update() {
    super._update();
  }

  _create() {
    let innerHtml =
      '<div id="' +
      this.euid +
      '" class="us-state-signal-send us-element-resizable-area">\
                        <div class="us-state-signal-send-container">\
                            <a class="editablefield grElement us-state-signal-send-text" tabindex="1">' +
      this.jsonModel.name +
      '</a>\
                            <div id="us-triangle-black">\
                                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">\
                                    <polygon points="0,0 100,50 0,100" fill="black"></polygon>\
                                </svg>\
                                <div id="us-triangle-colored">\
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">\
                                        <polygon points="0,0 100,50 0,100" fill="white"></polygon>\
                                    </svg>\
                                </div>\
                            </div>\
                        </div>\
                        </div>';

    this.diagram.nativeRef.append(innerHtml);
  }

  _updateJsonModel(key, value) {
    if (key === "color") {
      this.nativeRef
        .find(".grElement")
        .css("background-color", value || "none");
      this.nativeRef
        .find("#us-triangle-colored>svg>polygon")
        .css("fill", value || "none");
      this.jsonModel[key] = value;
    } else {
      super._updateJsonModel(key, value);
    }
  }
}

export { StateSignalSendElement };
