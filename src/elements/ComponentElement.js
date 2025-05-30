import { BaseElement } from "./BaseElement";

const defaultOptions = {
    'nameTemplate': "Package",
    'droppable': true,
    'acceptdrop': "package",
};

const defaultModel = {
    'height': 102,
};


class ComponentElement extends BaseElement {
    constructor(options,jsonModel, diagram) {
       super({...defaultOptions,...options }, {...defaultModel, ...jsonModel}, diagram);
    }

    _update() {
        super._update();
    }

    _create() {
        var aux = (this.jsonModel.aux != undefined && this.jsonModel.aux != "") ?
           "<a>&lt&lt" + this.jsonModel.aux + "&gt&gt</a><br><b>" : "";
        let innerHtml = '<div id="' + this.euid + '" class="us-package">\
                                  <div class="us-package-tab grElement"></div>\
              <div class="us-package-body grElement">'
              + aux + 
              '<a id="name" class="editablefield">'+ this.jsonModel["name"] + '</a></div>\
                                  </div>';
        $("#" + this.diagram.euid).append(innerHtml);
    }
}

export {  ComponentElement }