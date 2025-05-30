import { BaseElement } from "../BaseElement";

class SQActorElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            nameTemplate: "sqactor",
            droppable: false,
            ...options
        };
        let defaultjsonModel = {
            width: 100,
            height: 160,
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
    }

    _create() {
        let innerHtml = '<div id="' + this.euid + '" class="us-note grElement us-element-note">\
          <svg width="100" height="160" xmlns="http://www.w3.org/2000/svg">\
            <circle cx="50" cy="20" r="14" stroke="black" stroke-width="2" fill="white" />\
            <line x1="50" y1="34" x2="50" y2="80" stroke="black" stroke-width="2" />\
            <line x1="20" y1="50" x2="80" y2="50" stroke="black" stroke-width="2" />\
            <line x1="50" y1="80" x2="30" y2="120" stroke="black" stroke-width="2" />\
            <line x1="50" y1="80" x2="70" y2="120" stroke="black" stroke-width="2" />\
            <text x="50" y="145" font-size="14" text-anchor="middle" font-family="Arial">Actor</text>\
          </svg>\
          <a id="name" data-key="name" class="editablefield Name">' + this.jsonModel['name'] + '</a>\
        </div>';
        this.diagram.nativeRef.append(innerHtml);
    }
}

export {  SQActorElement }