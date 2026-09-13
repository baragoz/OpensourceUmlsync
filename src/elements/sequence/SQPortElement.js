import { BaseElement } from "../BaseElement";

class SQPortElement extends BaseElement {
  constructor(options, jsonModel, diagram) {
    let defaultOptions = {
      nameTemplate: "sqport",
      droppable: true,
      resizable_h: "s-u,n-u",
      ...options,
    };
    let defaultjsonModel = {
      width: 18,
      height: 80,
      level: -1,
      // Horizontal offset step from the parent lifeline's center, in units
      // of 10px (indent: 2 => +20px). Only meaningful once dropped onto an
      // SQObjectInstance - see SequenceDiagram.handleElementDragStop and
      // SQPortIndentControls.
      indent: 0,
      ...jsonModel,
    };

    super(defaultOptions, defaultjsonModel, diagram);
  }

  _update() {
    super._update();
  }

  _create() {
    // it is just a vertical rectangle
    let innerHtml =
      '<div id="' +
      this.euid +
      '" class="us-sqd-port us-element-resizable-area grElement"></div>';
    this.diagram.nativeRef.append(innerHtml);
  }
}

export { SQPortElement };
