import { BaseElement } from "./BaseElement";

class NoteElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            'nameTemplate': "note",
            'droppable': false,
            ...options
        };
        let defaultjsonModel = {
            'width': 200,
            'height': 76,
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
        // Additional option for update
        this.jsonModel.height_b = $("#" + this.euid + "_Border .us-package-body").height();
    }

    _create() {
        let innerHtml = '<div id="' + this.euid + '" class="us-note grElement us-element-note">\
        <a id="name" data-key="name" class="editablefield Name">' + this._getNoteDescription() + '</a>\
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> \
            <polygon points="0,0 20,0 0,20" fill="#000000" />\
            <polygon points="1,1 19,1 1,19" fill="#DDDDDD" />\
            <polygon points="20,20 20,0 0,20" fill="#FFFFFF" />\
          </svg>\
        </div>';
        $("#" + this.diagram.euid).append(innerHtml);
    }

    _getNoteDescription() {
        return this.jsonModel.name || "&nbsp;&nbsp;&nbsp;&nbsp;";
    }
}

export {  NoteElement }