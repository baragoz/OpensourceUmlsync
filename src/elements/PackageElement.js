import { BaseElement } from "./BaseElement";

const defaultOptions = {
    'nameTemplate': "package",
    'droppable': true,
    'acceptdrop': "package",
};

const defaultModel = {
    'height': 102,
};


class PackageElement extends BaseElement {
    constructor(options,jsonModel, diagram) {
       super({...defaultOptions,...options }, {...defaultModel, ...jsonModel}, diagram);
    }

    _update() {
        super._update();
        // Additional option for update
        this.jsonModel.height_b = $("#" + this.euid + "_Border .us-package-body").height();
    }

    _create() {
        var aux = (this.jsonModel.aux != undefined && this.jsonModel.aux != "") ?
           "<a>&lt&lt" + this.jsonModel.aux + "&gt&gt</a><br><b>" : "";
        let innerHtml = '<div id="' + this.euid + '" class="us-package">\
                                  <div class="us-package-tab grElement"></div>\
              <div class="us-package-body grElement">'
              + aux + 
              '<a id="name" data-key="name" class="editablefield">'+ this.jsonModel["name"] + '</a></div>\
               </div>';
        this.diagram.nativeRef.append(innerHtml);
    }

    _setOption(key, value) {
        if (key === "color") {
            this.nativeRef.children("div").css("background-color", value || "");
        } else {
            super._setOption(key, value);
        }
    }
}

export {  PackageElement }