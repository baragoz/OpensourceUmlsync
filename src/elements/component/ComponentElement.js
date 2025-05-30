import { BaseElement } from "../BaseElement";

const defaultOptions = {
    'nameTemplate': "component",
    'droppable': true,
    'acceptdrop': ["component"],
};

const defaultModel = {
    'width': 200,
    'height': 100
};


class ComponentElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
       super({ ...defaultOptions, ...options }, { ...defaultModel, ...jsonModel}, diagram);
    }

    _update() {
        super._update();
    }

    _create() {
        let innerHtml = '<div id="' + this.euid + '" class="us-component grElement">\
          <svg width="26" height="30" class="us-component-svg" xmlns="http://www.w3.org/2000/svg">\
           <rect x="8" y="3" width="17" height="25" fill="none" stroke="black" stroke-width="1"/>\
           <rect x="4" y="7" width="10" height="5" fill="none" stroke="black" stroke-width="1"/>\
           <rect x="4" y="18" width="10" height="5" fill="none" stroke="black" stroke-width="1"/>\
          </svg>\
          <a id="stereotype" class="editablefield" style="text-align:left;position:relative;top:30%">&laquo;interface&raquo;</a><br>\
          <a id="name" data-key="name" class="editablefield Name" style="text-align:left;position:relative;top:30%">' + this.jsonModel.name + '</a></div>';
          this.diagram.nativeRef.append(innerHtml);
    }
}

export {  ComponentElement }