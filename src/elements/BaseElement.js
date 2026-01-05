import { BaseDiagramItem } from '../core/BaseDiagramItem.js';

const defaultOptions = {
  'drop': false,
  'nameTemplate': 'baseElement',
  'selected': false,
  'area': "none",
  'ctx_menu':"default",
  'editable':true,
  "acceptdrop": [],
  "droppable": false,
};


class BaseElement extends BaseDiagramItem {
  jsonModel = {
    'width': 140,
    'height': 200,
    'left': 140,
    'top': 200,
  };
     

  nativeRef = null;

  constructor(options, jsonModel, diagram) {
    // build common options and Generate unique id
    super({...defaultOptions, ...options}, "e" + jsonModel.id);

    // Keep the reference on diagram
    this.diagram = diagram;

    console.log("ELEMENT MODEL IS:", jsonModel);

    //
    // Extend the default jsonModel
    //
    this.jsonModel = {...this.jsonModel, ...jsonModel};

    //
    // Create element as DOM object and attach it to diagram
    //
    this._create();

    // Get element jQuery reference
    this.nativeRef = $("#" + this.euid);

    // DO NOT REVEMOVE !!!! 
    // Keep border for both, editor and viewer,
    // but for viewer it should be transparent
    this.wrapWithBorder();

    this.nativeBorderRef = $("#" + this.euid + "_Border");

    //
    // Init width/height/left/top
    //
    // And notify diagram
    //
    this._baseInit();

    // make an extra init, if needed
    this._init();

    //
    // now, we could notify diagram that element is ready
    //
    this.diagram.onAddElement(this);

  }

  getDiagram() {
    return this.diagram;
  }

  getId() {
    return this.jsonModel.id;
  }

  _create() {
    // if parent element is undefined, do nothing
    // create element at possition which described in jsonDesc
    alert("Failed to create a virtual element.");
  }


  //
  // Update base positions left, top, width, height
  // before save json
  //
  _update() {
    if (!this.nativeBorderRef)
      return;

    const offset = this.diagram.getDiagramOffset();

    var p = this.nativeBorderRef.position();
    this.jsonModel['left'] = p.left + offset.left;
    this.jsonModel['top'] = p.top + offset.top;
    this.jsonModel['width'] = this.nativeBorderRef.width();
    this.jsonModel['height'] = this.nativeBorderRef.height();

    //
    // If element has nested elements
    //


    //
    // TODO: REMOVE - no need to save droplist 
    //
    /*
    if (this.droplist && this.droplist.length > 0) {
      this.jsonModel['dropped'] = new Array();
      for (var euid in this.droplist) {
        // TODO: check if element still present
        this.jsonModel['dropped'].push(euid);
      }
    }
    */
  }

  //
  //  Show/hide element border on hover
  //
  wrapWithBorder() {
    this.nativeRef
      .wrap('<div id="' + this.euid + '_Border" class="us-element-border us-element-border-highlighter"></div>');
  }

  getDescription() {
    return {...this.jsonModel, nameTemplate: this.options.nameTemplate};
  }

  _setOption( key, value ) {
    console.log("SET OPTION: " + key + " " + value);
    this.options[key] = value;
    if (key == "font-color") {
      this.nativeBorderRef.find("a").css("color", value);
    } else if (key == "color") {
      this.nativeRef.css("background-color", value || "");
    } else if (key == "text-decoration") {
      this.nativeRef.css("text-decoration", value || "");
      this.nativeRef.find(".editablefield").css("text-decoration", value || "");
    } else if (["font-family", "font-size", "font-weight", "font-style"].indexOf(key) >= 0) {
      this.nativeRef.css(key, value || "");
    } else if (key == "selected") {
      //
      // Show/hide resizeable helpers and toggle element border
      //
      if (value) {
        $('#' + this.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'visible'});
        $('#' + this.euid +'_Border').addClass("us-element-border-selected")
        this.highlighted = true;
      }
      else {
        $('#' + this.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'hidden'});
        $('#' + this.euid +'_Border').removeClass("us-element-border-selected")
        this.highlighted = false;
      }
    } else if (key === "z-index") {
      this.jsonModel[key] = value;
      this.nativeBorderRef.css(key, value);
    }
  }

  _updateJsonModel( key, value ) {
    this.jsonModel[key] = value;
    if (key == "font-color") {
      this.nativeRef.css("color", value);
    } else if (key == "left") {
      this.nativeBorderRef.css(key, value);
    } else if (key == "top") {
      this.nativeBorderRef.css(key, value);
    } else if (key == "color") {
      this.nativeRef.css("background-color", value || "");
    } else if (key == "width") {
      $("#" + this.euid + "_Border").css("width", value);
    } else if (key == "height") {

      this.nativeBorderRef.css("height", value );
      // $("#" + this.euid).css("height", value);
      /*
      if (old_val && value != old_val) {
        var v = parseInt(value) - parseInt(old_val);
        var inc=(v>0)? ("+=" + v) : ("-=" + Math.abs(v));
        if (v != 0)
          $("#" + this.euid + "_Border .us-element-resizable-area").css("height", inc);
      }
        */
    } if (key == "font-color") {
      this.nativeBorderRef.find("a").css("color", value);
    } else if (key == "color") {
      this.nativeRef.css("background-color", value || "");
    } else if (key == "text-decoration") {
      this.nativeRef.css("text-decoration", value || "");
      this.nativeRef.find(".editablefield").css("text-decoration", value || "");
    } else if (["font-family", "font-size", "font-weight", "font-style"].indexOf(key) >= 0) {
      this.nativeRef.css(key, value || "");
    } else if (key == "z-index") {
      this.nativeBorderRef.css(key, value|| "");
    }
  }

  //
  // Initialize only base parametes of element
  //
  _baseInit() {

    //
    // TODO: add error handling if some mandatory items not available
    //
    ['width', 'height', 'left', 'top', 'z-index',  // Must-have items
     'color', 'font-color', 'font-family', 'font-size' // Optional items
    ].forEach((item) => {
      if (this.jsonModel[item])
        this._updateJsonModel(item, this.jsonModel[item]);
    });
  }

  _init() {
    // Empty
  }

  //
  // References API. 
  // Note: uses for cross-references between diagrams
  //
  addReference(data, isInit) {
    // TODO: handle add reference
  }

  rmReference(data, isInit) {
    // TODO: handle remove reference
  }

  //
  //  Element RESIZE observer API
  //
  onResizeStart() {
    // Empty
  }

  onResizeComplete() {
    // Empty
  }

  onResizeProgress() {
    // Empty
  }

  //
  // Remove the ui instance of the element
  //
  removeInstance() {
    this.nativeBorderRef.remove();
    this.nativeBorderRef = null;
    this.nativeRef = null;

    //
    // Remove a list of binded user data
    //
    super.removeInstance();
  }


  //
  //
  // Droppagbale + multiple DND
  //
  onDragStart(ui, skipDropped = false) {

      //
      // Could be drag-started as dropped element
      //
      if (this.options.dragStart) {
        return;
      }

      if (skipDropped) {
        // Do nothing with dropped elements
      } else {
        //
        // Toggle drag start for dropped elements
        //
        console.log("DROPLIST !!", this.droplist);
        for (var i in this.droplist) {
          if (this.droplist[i]) {
            this.droplist[i].onDragStart(ui);
          }
        }
      }

      this.options.dragStart = true;

//    if (isbase == undefined) {
//      var p = $("#" + this.euid + "_Border").position(),
  //    scrollLeft = $("#" + this.parrent.euid).scrollLeft(),
    //  scrollTop = $("#" + this.parrent.euid).scrollTop();

      //this.options.left = p.left + scrollLeft;
     // this.options.top = p.top + scrollTop;

      this.start_operation = {left:this.jsonModel.left, top: this.jsonModel.top};
//    }
    }
    
    onDragMove(ui, skipModelChange = false) {
      if (!this.options.dragStart || !this.start_operation) {
        return;
      }

      if (!skipModelChange) {
        this.nativeBorderRef
          .css({'left':this.start_operation.left + ui.left, 'top':this.start_operation.top + ui.top});
      }

      this.jsonModel.left = this.start_operation.left + ui.left;
      this.jsonModel.top = this.start_operation.top + ui.top;
    }
    
    onDragStop(ui, skipModelChange = false) {
      //
      // Update UI position
      //
      this.onDragMove(ui, skipModelChange = false);

      // Droppable
      /*
      if (this.options['droppable']) {
            this.diagram._dropElement(this,
              {
                position: {
                  'left':this.jsonModel.left, 
                  'top':this.jsonModel.top
                }}); 
      } // droppable
*/
      
      this.options.dragStart = false;
      delete this.start_operation;            
    }
}

export { BaseElement }