import { BaseElement } from "../BaseElement";

const defaultOptions = {
  nameTemplate: "component-subsystem",
  droppable: true,
  acceptdrop: ["component", "port"],
};

const defaultModel = {
  width: 200,
  height: 100,
};

class ComponentSubsystemElement extends BaseElement {
  constructor(options, jsonModel, diagram) {
    super(
      { ...defaultOptions, ...options },
      { ...defaultModel, ...jsonModel },
      diagram,
    );
  }

  _update() {
    super._update();
  }

  _updateJsonModel(key, value) {
    // No alignment handling - removed
    super._updateJsonModel(key, value);
  }

  _create() {
    let innerHtml =
      '<div id="' +
      this.euid +
      '" class="us-component-subsystem grElement">\
          <div class="us-component-subsystem-header">\
            <a id="name" data-key="name" class="editablefield us-component-subsystem-name">' +
      this.jsonModel.name +
      '</a>\
            <svg width="26" height="30" class="us-component-subsystem-svg" xmlns="http://www.w3.org/2000/svg">\
              <rect x="8" y="3" width="17" height="25" fill="none" stroke="black" stroke-width="1"/>\
              <rect x="4" y="7" width="10" height="5" fill="none" stroke="black" stroke-width="1"/>\
              <rect x="4" y="18" width="10" height="5" fill="none" stroke="black" stroke-width="1"/>\
            </svg>\
          </div>\
          <div class="us-component-subsystem-content">\
          </div>\
        </div>';
    this.diagram.nativeRef.append(innerHtml);
  }
}

export { ComponentSubsystemElement };
