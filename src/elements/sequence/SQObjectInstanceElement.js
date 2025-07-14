import { BaseElement } from "../BaseElement";

class SQObjectInstanceElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            'nameTemplate': "sqobject_instance",
            'droppable': false,
            'accept_drop': ['sqport', 'sqdestroy'],
            ...options
        };
        let defaultjsonModel = {
            'width': 176,
            'height': 400,
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
        // Additional option for update
        
    }

    _create() {
        let innerHtml = '<div id="' + this.euid + '" class="us-element-resizable-area" style="width:100%;">\
          <div class="us-instance-line"></div>\
          <div id="' + this.euid + '_NEXT" class="us-instance grElement" style="height:40px;">\
          <div><a id="name" data-key="name" class="editablefield Name">:' + this.options.name+ '</a></div></div></div>';
        this.diagram.nativeRef.append(innerHtml);
    }
}

export {  SQObjectInstanceElement }