import { BaseElement } from "./BaseElement";

class ClassElement extends BaseElement {

    constructor(options, jsonModel, diagram) {
      // update super class
      super({
         nameTemplate: "class",
         ...options 
        }, {
            operations: [],
            attributes: [],
            width: "150px",
            height: "auto",
            ...jsonModel 
        },
        diagram);
    }

    _create() {
            var templateHeader = "",
                aux = "";
     
            //
            // Top-template prefix like Interface/Template/ORM etc...
            //
            if (this.jsonModel['aux'] && (this.jsonModel['aux'] != "")) {
                var aux2 = this._getAux(this.jsonModel['aux']);
                if (aux2 != "") {
                  aux = "&lt&lt " + aux2 + " &gt&gt";
                  templateHeader = (this.options['aux'] != 'Template') ? "" : "<div id='template' data-key='aux' class='editablefield us-class-template'>" + (this.jsonModel['template'] || "T")+"</div>";
                }
            }
     
            //
            // Make a list of fields and methods:
            //
            var operations = "",
                attributes = "";

            // Keep local counters
            this.atrN = 0;
            this.opN = 0;
    
            for (var i in this.jsonModel['operations']) {
                const tmp = this.jsonModel['operations'][i];
                operations += '<li id="operation"><a id="operation-' + tmp.id + '" data-uid="' + tmp.id + '" class="operation">' + tmp.text + '</a></li>';
                //
                // Count max operation id 
                //
                if (this.opN < tmp.id) {
                  this.opN = tmp.id + 1;
                }
             }
         
             for (var i in this.jsonModel['attributes']) {
                const tmp = this.jsonModel['attributes'][i];
                attributes += '<li id="attribute"><a id="attribute-'+ tmp.id + '" data-uid="' + tmp.id + '" class="attribute">' + tmp.text +'</a></li>';

                //
                // Count max attribute id
                //
                if (this.atrN < tmp.id) {
                  this.atrN = tmp.id + 1;
                }

             }
     
           //
           //  Make a final class element
           //
           let innerHtmlClassInfo = '\
             <div id="' + this.euid + '" class="us-class grElement">'+ templateHeader +'\
             <div class="us-class-header">\
             <a id="name" data-key="name" class="editablefield us-class-name">' + this.jsonModel['name'] + '</a><br>\
             <a id="aux" class="us-class-aux">'+ aux +'</a>\
             </div>\
             <div class="us-class-attributes"><ul class="us-sortable">' +  attributes + '</ul></div>\
             <div class="us-class-operations us-element-resizable-area"><ul class="us-sortable">' +  operations + '</ul></div>\
             </div>\
           ';

           //
           // Add class to diagram
           //
           this.diagram.nativeRef.append(innerHtmlClassInfo);
    }

    addAttribute(data, index = 0) {
      const uid = this.atrN++;
      const attributeId = `attribute-${uid}`;
      const newAttribute = $(`<li id="attribute"><a id="${attributeId}" data-uid="${uid}" class="attribute">${data.title}</a></li>`);
      const attributeList = this.nativeRef.find(".us-class-attributes .us-sortable");
      const attributeItems = attributeList.children('li');

      // Insert a new element at index
      this.jsonModel.attributes.splice(index, 0, {id: uid, text: data.title});
  
      if (index >= attributeItems.length) {
        attributeList.append(newAttribute);
      } else {
        attributeItems.eq(index).before(newAttribute);
      }
  
      return newAttribute;
    }
  
    addOperation(data, index = 0) {
      const uid = this.opN++;
      const operationId = `operation-${uid}`;
      const newOperation = $(`<li id="operation"><a id="${operationId}" data-uid="${uid}" class="operation">${data.title}</a></li>`);
      const operationList = this.nativeRef.find(".us-class-operations .us-sortable");
      const operationItems = operationList.children('li');
  
      // Insert a new element at index
      this.jsonModel.operations.splice(index, 0, {id: uid, text:data.title});
  
      if (index >= operationItems.length) {
        operationList.append(newOperation);
      } else {
        operationItems.eq(index).before(newOperation);
      }
  
      return newOperation;
    }
  
    
    //
    // TODO: move it to the renderer extension or plugin
    //       Because this code is related to editor functionality only
    //       and not needed at all for viewer
    _init() {
        if (!this.diagram.isEditable()) {
          return;
        }
    }

  _getAux(aux) {
    if (!aux)
      return "";

    const auxmap = Object.freeze({
        Class: "",
        Interface: "interface",
        Enumeration: "enum",
        Primitive: "primitive",
        ORM: "ORM",
        ORMComponent: "ORMComponent",
        Template: "Template"
    });

    return auxmap[aux] || "";
  }

  //
  // We do not update JSON values unless data should be saved
  //
  _update() {
    //
    // Save width/height
    //
    super._update();
    //
    // Extra elements: height_a and height_o
    //
    this.jsonModel['height_a'] = parseInt($("#" + this.euid + "_Border .us-class-attributes").height());
  }

  _baseInit() {
    //
    // Position + width/height
    //
    super._baseInit();
    //
    // height_a - is class specific size
    //
    this._updateJsonModel("height_a", this.jsonModel["height_a"]);
  }

  _updateJsonModel( key, value ) {
    super._updateJsonModel( key, value );

    //
    // Class specific values
    // Note: height for operations takes the rest of the element, no need to save it.
    //       Height for operations area is based on css's flex-grow:1
    //
    if (key == "height_a") {
      $("#" + this.euid + "_Border .us-class-attributes").css(key, value);
    }
  }

  //////////////////// Fields and methods APIs

  addField(title) {
    this.diagram.onJsonModelChange("element:attribute", { index: 1, value: title, action: "add"});
  }

  removeField(index) {
    this.diagram.onJsonModelChange("element:attribute", { index: 1, action: "remove"});
  }

  addMethod(title) {
    this.diagram.onJsonModelChange("element:operation", { index: 1, value: title, action: "add"});
  }

  removeMethod(index) {
    this.diagram.onJsonModelChange("element:operation", { index: 1, action: "remove"});
  }
}

export { ClassElement }