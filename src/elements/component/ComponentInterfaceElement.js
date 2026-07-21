import { BaseElement } from "../BaseElement";

class InterfaceElement extends BaseElement {
  constructor(options, jsonModel, diagram) {
    let defaultOptions = {
      nameTemplate: "interface",
      droppable: false,
      resizeable: "none",
      // midpoint: true,
      ...options,
    };
    let defaultjsonModel = {
      width: 34,
      height: 34,
      ...jsonModel,
    };

    super(defaultOptions, defaultjsonModel, diagram);
  }

  _update() {
    super._update();
    // Additional option for update
    this.jsonModel.height_b = $(
      "#" + this.euid + "_Border .us-package-body",
    ).height();
  }

  _create() {
    let innerHtml =
      '<div id="' +
      this.euid +
      '" style="width:100%;height:100%;">\
          <div id="Circle" class="us-interface grElement"></div>\
        </div>';
    $("#" + this.diagram.euid).append(innerHtml);
  }
}

export { InterfaceElement };
