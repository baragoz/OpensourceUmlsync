import { BaseElement } from "./BaseElement";

const defaultOptions = {
  nameTemplate: "packagesubsystem",
  droppable: true,
  acceptdrop: "package",
};

const defaultModel = {
  height: 102,
  name: "Subsystem",
};

class PackageSubsystemElement extends BaseElement {
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

  _create() {
    let innerHtml =
      '\
            <div id="' +
      this.euid +
      '" class="us-package us-subsystem-package">\
              <div class="us-subsystem-tab grElement">\
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 11V17C22 21 21 22 17 22H7C3 22 2 21 2 17V7C2 3 3 2 7 2H8.5C10 2 10.33 2.44 10.9 3.2L12.4 5.2C12.78 5.7 13 6 14 6H17C21 6 22 7 22 11Z" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10"/><path d="M11.7339 10L6.83008 18H16.8301L11.9262 10" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\
                <a id="name" data-key="name" class="editablefield">' +
      this.jsonModel["name"] +
      '</a>\
              </div>\
              <div class="us-subsystem-body grElement"></div>\
            </div>';
    this.diagram.nativeRef.append(innerHtml);
  }

  _updateJsonModel(key, value) {
    if (key === "color") {
      this.nativeRef
        .find(".grElement")
        .css("background-color", value || "none");
      this.jsonModel[key] = value;
    } else {
      super._updateJsonModel(key, value);
    }
  }
}

export { PackageSubsystemElement };
