import { BaseElement } from "../BaseElement";

class SQParticipantElement extends BaseElement {
  constructor(options, jsonModel, diagram) {
    let defaultOptions = {
      nameTemplate: "sqport",
      droppable: false,
      ...options,
    };
    let defaultjsonModel = {
      width: 40,
      height: 40,
      ...jsonModel,
    };

    super(defaultOptions, defaultjsonModel, diagram);
  }

  _update() {
    super._update();
  }

  _create() {
    // it is just a filled circle, black colored, non-resizeable/ or slightly resizabel
    let innerHtml =
      '<div id="' +
      this.euid +
      '" class="us-element-circle" style="width:100%;"></div>';
    this.diagram.nativeRef.append(innerHtml);
  }
}

export { SQParticipantElement };
