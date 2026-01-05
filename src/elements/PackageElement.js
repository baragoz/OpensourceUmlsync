import { BaseElement } from "./BaseElement";

const defaultOptions = {
    'nameTemplate': "package",
    'droppable': true,
    'acceptdrop': "package",
};

const defaultModel = {
    'height': 102,
    'name': 'Package'
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

    _updateJsonModel( key, value ) {
        if (key === "color") {
            this.nativeRef.children("div").css("background-color", value || "none");
            this.jsonModel[key] = value;
        } else if (key === "alignment") {
            // Remove all existing alignment classes
            const alignmentClasses = [
                'us-package-align-left-top',
                'us-package-align-left-center',
                'us-package-align-left-bottom',
                'us-package-align-center-top',
                'us-package-align-center-center',
                'us-package-align-center-bottom',
                'us-package-align-right-top',
                'us-package-align-right-center',
                'us-package-align-right-bottom'
            ];
            const packageBody = this.nativeRef.find('.us-package-body');
            alignmentClasses.forEach(cls => packageBody.removeClass(cls));
            
            // Add the new alignment class if value is provided
            if (value) {
                const alignmentClass = 'us-package-align-' + value;
                packageBody.addClass(alignmentClass);
            }
            this.jsonModel[key] = value;
        } else {
            super._updateJsonModel(key, value);
        }
    }
}

export {  PackageElement }