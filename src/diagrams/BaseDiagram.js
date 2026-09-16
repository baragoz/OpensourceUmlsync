import { BaseDiagramItem } from "../core/BaseDiagramItem.js";
import { BaseConnector } from "../connectors/BaseConnector.js";
import { BaseElement } from "../elements/BaseElement.js";
import { IDiagramObserver } from "../interfaces/IDiagramObserver.js";

const defaultOptions = {
  prefix: "dm",
  multicanvas: true,
  nameTemplate: "baseDiagram",
  editmode: false,
  type: "base",
  globalId: 1,
  maxZIndex: 5000,
  minZIndex: 5000,
  acceptElements: [],
};

const defaultModel = {
  width: 1200,
  height: 600,
};

class BaseDiagram extends BaseDiagramItem {
  // List of elements and connectors

  /**
   * @type {BaseElement[]}
   */
  elements = [];
  /**
   * @type {BaseConnector[]}
   */
  connectors = [];

  /**
   * @type {BaseDiagramItem[]}
   */
  selectedItems = [];

  /**
   * @type {BaseConnector}
   */
  transformConnector = null;

  /**
   * @type {BaseConnector}
   */
  highlightedConnector = null;

  /**
   * @type {boolean}
   */
  transformStarted = false;

  // Drop helper for editable only
  dropHelper = null;

  parentWidth = 600;
  parentHeight = 400;

  //
  //  Width/Height could be modified via options
  //
  constructor(
    overrideDefaultOptions,
    jsonModel,
    constructionOptions,
    observer,
  ) {
    super(
      { ...defaultOptions, ...overrideDefaultOptions, ...constructionOptions },
      "dm" + jsonModel.id,
    );

    /**
     * @type {IDiagramObserver}
     */
    this.observer = observer;

    // update model data
    this.jsonModel = { ...defaultModel, ...jsonModel };

    this.parentId = constructionOptions.parentId;
    //
    // we could not add it to chonfig, because w/h are changeable
    //
    this.parentHeight = constructionOptions.height || this.parentHeight;
    this.parentWidth = constructionOptions.width || this.parentWidth;

    //
    // Initial stub for error handler
    // it should be toast or popup on top of diagram area
    // with full list of errors
    //
    this.errorHandler = {
      show: function (error) {
        console.log(error);
      },
    };

    // Create HTML part
    this._create();
    // Init base html for a specific diagram if needed
    this._init();

    // Add plugins, notify observers
    if (this.observer) {
      this.observer.onAddDiagram(this);
    }

    // Create widgets - elements and connectors
    this._createWidgets();

    this.draw();
  }

  _create() {
    //
    // When we integrate viewer in markdown
    //
    if (this.options.multicanvas) {
      var p = this._getDiagramSize(this.options);
      // Scroll X and Y correspondingly
      var sx = false,
        sy = false;

      // Alignement of the parent frame by width and height
      var $par = $(this.parentId);
      $par.width(this.parentWidth);
      $par.height(this.parentHeight);
      $par.css("display", "flex");

      // Parent setup complete
      this.canvasEuid = this.euid + "_Canvas";
      this.element = $(this.parentId)
        //
        // Placeholder for diagram + canvas
        //
        .append(
          '<div id="' +
            this.euid +
            '" class="us-diagram" width="100%" height="100%">\
                <canvas id="' +
            this.euid +
            '_Canvas" class="us-canvas" width=' +
            p.width +
            "px height=" +
            p.height +
            'px>\
                <p>Unfortunately your browser doesn\'t support canvas.</p></canvas>\
                <div class="us-canvas-bg" style="width:100%;height:100%;">\
                </div></div>',
        );

      $("#" + this.euid + ".us-diagram").css({
        "overflow-x": sx ? "scroll" : "auto",
        "overflow-y": sy ? "scroll" : "auto",
      });
    } else {
      this.element = $(this.parentId).append(
        '<div id="' +
          this.euid +
          '" class="us-diagram" width="100%" height="100%">\
                <div class="us-canvas-bg" style="width:100%;height:100%;">\
                </div></div>',
      );
      this.canvasEuid = "SingleCanvas";
    }
    this.canvas = window.document.getElementById(this.canvasEuid);
    this.canvas.width = this.parentWidth - 250 - 12;
    this.canvas.height = this.parentHeight - 12;

    this.nativeRef = $("#" + this.euid);

    this.applyZoomIfNeeded();
  }

  //
  // Todo: sync up with setOption("zoom", value);
  //
  applyZoomIfNeeded() {
    if (this.options.zoom && this.options.zoom !== 1) {
      this.nativeRef.css({
        transform: "scale(" + this.options.zoom + ")",
        "transform-origin": "top left",
        overflow: "hidden",
      });
      // Note: no need to scale down the canvas, it is done via transform above
      // this.canvas.getContext('2d').scale(this.options.zoom, this.options.zoom);
    }
  }

  //
  // Each element of diagram should has a unique-id nunmber
  // Each diagram could has it's own unique-id,
  // if it is defined by Editor or ThumbnailRenderer
  //
  getNextUniqueId() {
    this.options.globalId = this.options.globalId + 1;
    console.log("getNextUniqueId : " + this.options.globalId);
    return this.options.globalId;
  }

  //
  // Diagram could be bigger then the space of the parent element
  // Canvas - should be the same size as parent
  //          and use offset value to re-draw connectors on scroll
  //
  _getDiagramSize() {
    var w = this.jsonModel.width;
    var h = this.jsonModel.height;

    if (this.jsonModel) {
      //
      // Check if all elements fits to the area
      //
      for (var v in this.jsonModel.elements) {
        var e = this.jsonModel.elements[v];
        var tmp = parseInt(e.left) + parseInt(e.width);
        if (w < tmp) {
          w = tmp;
        }
        tmp = parseInt(e.top) + parseInt(e.height);
        if (h < tmp) {
          h = tmp;
        }
      }
      //
      // Check if all connectors fits to the area
      //
      for (var v in this.jsonModel.connectors) {
        for (var c in this.jsonModel.connectors[v].epoints) {
          var p = this.jsonModel.connectors[v].epoints[c];
          if (w < parseInt(p["0"])) {
            w = parseInt(p["0"]);
          }
          if (h < parseInt(p["1"])) {
            h = parseInt(p["1"]);
          }
        }
      }
    } else {
      // TODO: redraw.
    }
    return { width: w, height: h };
  }

  _init() {}

  getDescription() {
    let result = {
      nameTemplate: this.options.nameTemplate,
      width: this.parentWidth, // TODO: replace on AABB of the contnet points
      height: this.parentHeight,
      elements: [],
      connectors: [],
    };

    //
    // list of connectors which is based on element's ids, which are unique because of
    // that globalId value
    //
    for (var c in this.connectors) {
      result.connectors.push(this.connectors[c].getDescription());
    }

    for (var e in this.elements) {
      result.elements.push(this.elements[e].getDescription());
    }

    return result;
  }

  isPointOnLine(x, y) {
    //
    // Do nothing if it is not an edit mode
    //
    if (!this.options.editmode) {
      return false;
    }

    //
    // TODO: Move out transformation of this method
    // If transform was started, just move the point
    //
    if (this.transformConnector) {
      this.transformConnector.TransformTo(Math.round(x), Math.round(y));
      this.draw();
      return true;
    }

    //
    // Check if there is any connector under the mouse cursor
    //
    for (var c in this.connectors) {
      if (this.connectors[c].isPointOnLine(x, y)) {
        if (this.connectors[c] != this.highlightedConnector) {
          //
          // Hide previously highlighted connector
          // Use-case:  move connector through the X of 2 connectors
          //
          if (this.highlightedConnector !== null) {
            this.highlightedConnector._setOption("highlighted", false);
          }
          //
          // Highlight a new connector
          //
          this.highlightedConnector = this.connectors[c];
          this.highlightedConnector._setOption("highlighted", true);
          //
          // Redraw connectors
          //
          this.draw();
          // for the connectors menus, or may be labels which attached to the connector
          // this.blackboard.notify("connector:highlightChange");
        }
        return true;
      }
    }

    //
    // Hide previously highlighted connector
    // because it is no longer highlited
    //
    if (this.highlightedConnector) {
      this.highlightedConnector._setOption("highlighted", false);
      //
      // for the connectors menus, or may be labels which attached to the connector
      //
      // this.blackboard.notify("connector:highlightChange");
      //if (this.highlightedConnector._showMenu != undefined) {
      //  this.highlightedConnector._showMenu(x,y, false);
      //}
      this.highlightedConnector = null;
      this.draw();
    }

    return false;
  }

  startConnectorTransform(x, y) {
    if (this.highlightedConnector) {
      //
      // Selected === highlighted
      // because mouse over the connector
      //
      this.transformConnector = this.highlightedConnector;
      this.transformConnector._setOption("selected", true);
      this.transformConnector.startTransform(
        Math.round(x),
        Math.round(y),
        this.getDiagramOffset(),
      );
    }
  }
  /**
   * \class Function.
   * The connector transfomation function.
   */

  stopConnectorTransform(x, y) {
    if (this.transformConnector != null) {
      this.transformConnector.stopTransform(
        Math.round(x),
        Math.round(y),
        this.getDiagramOffset(),
      );
    }
    this.transformConnector = null;
  }

  _createWidgets() {
    // create an empty lists for connectors and elements
    this.connectors = [];
    this.elements = [];

    this.removedConnectors = [];
    this.removedElements = [];

    // For all elements in JSON description try to create an element
    for (var i in this.jsonModel["elements"]) {
      const tmp = this.jsonModel["elements"][i];
      // How to get options which described in menu JSON ?
      this.Element(tmp.nameTemplate, tmp);

      // Calculate helper indexes
      //
      // Note: It could be easier to save them to JSON model, BUT
      //       for another hand it could be the cause of multiple git merge conflicts
      this.options.maxZIndex = Math.max(
        this.options.maxZIndex,
        parseInt(tmp["z-index"]) || 1000,
      );
      this.options.minZIndex = Math.min(
        this.options.minZIndex,
        parseInt(tmp["z-index"]) || 35000,
      );
      this.options.globalId = Math.max(
        this.options.globalId,
        parseInt(tmp["id"]) || 1,
      );
    }

    // For all connectors in JSON description try to create a connector
    for (var i in this.jsonModel["connectors"]) {
      this.jsonModel["connectors"][i]["stored"] = true;
      const tmp = this.jsonModel["connectors"][i];
      this.Connector(tmp.nameTemplate, tmp);

      // Calculate helper indexes
      //
      // Note: It could be easier to save them to JSON model, BUT
      //       for another hand it could be the cause of multiple git merge conflicts
      this.options.maxZIndex = Math.max(
        this.options.maxZIndex,
        parseInt(tmp["z-index"]) || 1000,
      );
      this.options.minZIndex = Math.min(
        this.options.minZIndex,
        parseInt(tmp["z-index"]) || 35000,
      );
      this.options.globalId = Math.max(
        this.options.globalId,
        parseInt(tmp["id"]) || 1,
      );
    }

    // Load Complete
    --this.options.minZIndex;
    ++this.options.maxZIndex;
    ++this.options.globalId;

    /*
        //
        //  Update dropped dependencies for diagrams like package or components
        //
        for (var i in diag.elements) {
            var d = diag.elements[i].options['dropped'];
            if (d) {
              diag.elements[i]._dropped = {};
              for (var ii in d) {
                for (var iii in diag.elements) {
                  if (diag.elements[iii].options['id'] == d[ii]) {
                    var idd = diag.elements[iii].euid;
                    diag.elements[i]._dropped[idd] = idd;
                    break; // from the neares for
                  }
                } // iii
              } // ii
            } // d
        } // i
    */
  }

  isEditable() {
    return this.options.editable;
  }

  //
  // Rebuild the whole diagram (elements + connectors) from a JSON model
  // previously produced by getDescription(), e.g. for undo/redo. Reuses the
  // same construction path as the initial load, so element/connector
  // plugins (draggable, resizable, context menu, ...) get re-attached
  // automatically via onAddElement()/onAddConnector().
  //
  restoreFromDescription(json) {
    for (let i = this.connectors.length - 1; i >= 0; i--) {
      this.connectors[i].removeInstance();
    }
    for (let i = this.elements.length - 1; i >= 0; i--) {
      this.elements[i].removeInstance();
    }

    this.selectedItems = [];
    this.highlightedConnector = null;
    this.transformConnector = null;

    this.jsonModel = { ...defaultModel, ...json };
    this._createWidgets();

    if (this.observer) {
      this.observer.onSelectDiagramItem(this.selectedItems);
    }
    this.draw();
  }

  //
  // All elements belog to the same parent, that's why z-index could be negative too
  // when user want to send back some element.
  // That's why maxZIndex starts with 1000
  //
  getNextZIndex(isMax = true) {
    if (!isMax) {
      return this.options.minZIndex--;
    }
    return this.options.maxZIndex++;
  }

  Element(elementType, jsonModel = {}) {
    //
    // Pre-check that element name in a list of supported
    //
    if (this.options.acceptElements) {
      if (this.options.acceptElements.indexOf(elementType) < 0) {
        this.errorHandler.show(
          elementType + " is not in the list of acceptable elements",
        );
        return;
      }
    }

    // Clone the model
    jsonModel = { ...jsonModel };
    jsonModel["z-index"] = this.getNextZIndex();
    jsonModel.id = jsonModel.id || this.getNextUniqueId();

    //
    // [WIP]: it is just an idea of a unique prefix for each
    //        diagram item
    //
    // let prefix = this.options.prefix + "e" + jsonModel.id + "-";

    //
    // It is allow us to do not write an entire list of possible elements
    // in the import list on top...
    //
    // For example: if class diagram should support class, package and note,
    //              then ClassDiagram.js is responsible for import of that elements
    //
    let objIntance = this.createElement(elementType, jsonModel, {
      prefix: this.options.prefix,
    });

    console.log(
      "Created element:" + objIntance.euid + " ID: " + objIntance.jsonModel.id,
    );
    //
    // Show error, via error handler, if we failed to create element
    //
    if (!objIntance) {
      this.errorHandler.show(
        "Failed to create: " +
          elementType +
          " for diagram " +
          this.options.nameTemplate,
      );
      return;
    }
    return objIntance;
  }

  //
  // Override in an implementation class
  //
  createElement(elementType, jsonModel, options) {}

  /**
   * Find an element by its id
   * @param {number|string} id - The element id to search for
   * @returns {BaseElement|null} - The element with matching id, or null if not found
   */
  getElementById(id) {
    for (var i in this.elements) {
      if (this.elements[i].getId() == id) {
        return this.elements[i];
      }
    }
    return null;
  }

  removeElement(euid, id) {
    //
    // Go from the end, which allow us to avoid an iterator issue
    //
    for (let i = this.connectors.length - 1; i >= 0; i--) {
      const [id1, id2] = this.connectors[i].getEndPointIds();
      if (id === id1 || id === id2) {
        // notify observer about connector removal
        this.observer.onJsonModelChange(
          "remove:connector",
          this.connectors[i].getDescription(),
        );
        // Remove instance
        this.connectors[i].removeInstance();
        // Remove from array
        this.connectors.splice(i, 1);
      }
    }

    for (var i in this.elements) {
      if (this.elements[i].euid === euid) {
        // Notify observer about connector removal
        this.observer.onJsonModelChange(
          "remove:element",
          this.elements[i].getDescription(),
        );
        // remove visual part
        this.elements[i].removeInstance();
        // remove from array
        this.elements.splice(i, 1);
        return;
      }
    }
  }

  //
  // Indeed it is on add element finished successfull
  //
  onAddElement(element) {
    //
    // Define hover/resize/draggable etc
    //
    if (this.observer) {
      this.observer.onJsonModelChange("add:element", { element });
    }

    this.elements.push(element);
  }

  onJsonModelChange(itemType, data) {
    this.observer.onJsonModelChange("change:" + itemType, data);
  }

  Connector(connectorType, jsonModel = {}) {
    // Clone the model
    jsonModel = { ...jsonModel };
    jsonModel["z-index"] = jsonModel["z-index"] || this.getNextZIndex();
    jsonModel.id = jsonModel.id || this.getNextUniqueId();
    let prefix = this.options.prefix + "c" + jsonModel.id + "-";

    let objIntance = this.createConnector(connectorType, jsonModel, {
      prefix: prefix,
    });

    if (!objIntance) {
      console.log("Failed to create connector:", jsonModel);
      objIntance = this.createConnector(connectorType, jsonModel, {
        prefix: prefix,
      });
    }

    //
    // Show error, via error handler, if we failed to create element
    //
    if (!objIntance) {
      this.errorHandler.show(
        "Failed to create: " +
          connectorType +
          " for diagram " +
          this.options.nameTemplate,
      );
      return;
    }
    return objIntance;
  }

  createConnector(connectorType, jsonModel) {
    // this.observer.onJsonModelChange("remove:connector", this.connectors[i].getDescription());
  }

  removeConnectorByEuid(euid) {
    for (var i in this.connectors) {
      if (this.connectors[i].euid === euid) {
        // Notify observer about connector removal
        this.observer.onJsonModelChange(
          "remove:connector",
          this.connectors[i].getDescription(),
        );
        // remove visual part
        this.connectors[i].removeInstance();
        // remove from array
        this.connectors.splice(i, 1);
        break;
      }
    }

    // redraw
    this.draw();
  }

  updateDimention(width, height) {
    this.parentWidth = width;
    this.parentHeight = height;

    var $par = $(this.parentId);
    $par.width(this.parentWidth);
    $par.height(this.parentHeight);

    this.nativeRef.width(this.parentWidth);
    this.nativeRef.height(this.parentHeight);

    // TODO: RESIZE CANVAS
    this.canvas.width = this.parentWidth - 12;
    this.canvas.height = this.parentHeight - 12;

    this.draw();
  }

  //
  // Check if user dropped icon menu on some element
  //
  _dropConnector(ui, padding = 0) {
    var result = null,
      scrollLeft = $("#" + this.euid).scrollLeft(),
      scrollTop = $("#" + this.euid).scrollTop();

    var mazi = -1;
    for (var i in this.elements) {
      if (this.elements[i].options.single) continue;

      var e = this.elements[i].nativeBorderRef;
      var p = e.position(),
        w = e.width(),
        h = e.height();

      if (
        ui.position.left > p.left + scrollLeft - padding &&
        ui.position.left < p.left + w + scrollLeft + padding &&
        ui.position.top > p.top + scrollTop - padding &&
        ui.position.top < p.top + h + scrollTop + padding
      ) {
        //
        // get max z-index
        //
        if (this.elements[i].jsonModel["z-index"] > mazi) {
          result = this.elements[i];
          mazi = this.elements[i].jsonModel["z-index"];
        }
      }
    }
    return result;
  }

  getDiagramOffset() {
    return {
      top: this.nativeRef.scrollTop(),
      left: this.nativeRef.scrollLeft(),
    };
  }

  //
  // Redraw all connectors
  //
  draw() {
    if (!this.canvas) return;
    var ctx = this.canvas.getContext("2d");

    ctx.fillStyle = "#EEEEEE"; //"rgba(140,140,140,1)";
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (Object.keys(this.connectors).length > 0) {
      // Re-draw with offset
      const scrollOffset = this.getDiagramOffset();

      for (var c in this.connectors) {
        ctx.lineWidth = 1;

        if (this.connectors[c].options["line-width"] != undefined) {
          ctx.lineWidth = this.connectors[c].options["line-width"];
        }

        //
        // 1. Selected
        // 2. Highlighted
        // 3. Normal
        //
        if (this.connectors[c].options["selected"]) {
          ctx.lineWidth += 2;
          this.connectors[c].redraw(ctx, scrollOffset, "#43EC28");
          ctx.lineWidth -= 2;
          // TODO: simplify code ???? do not copy-past from the 3-rd else ???
          if (this.connectors[c].options["color"]) {
            this.connectors[c].redraw(
              ctx,
              scrollOffset,
              this.connectors[c].options["color"],
            );
          } else this.connectors[c].redraw(ctx, scrollOffset);
        } else if (
          this.connectors[c].options["highlighted"] ||
          this.highlightedConnector == this.connectors[c]
        ) {
          this.connectors[c].redraw(ctx, scrollOffset, "#43EC28");
        } else {
          //
          //  Not sure if we need to support a custom colors
          //
          if (this.connectors[c].options["color"]) {
            this.connectors[c].redraw(
              ctx,
              scrollOffset,
              this.connectors[c].options["color"],
            );
          } else this.connectors[c].redraw(ctx, scrollOffset);
        }
      }
      ctx.lineWidth = 1;
    }
  }

  snippetMode = false;
  showSnippetBubble(element) {
    alert("Show snippet bubble. Not implemented");
  }

  _setWidgetsOption(key, value) {
    if (key == "selected") {
      for (var i in this.elements) {
        this.elements[i]._setOption(key, value);
      }
      for (var i in this.connectors) {
        this.connectors[i]._setOption(key, value);
      }

      // TODO: Select ALL
      this.selectedItems = [];
      this.observer.onSelectDiagramItem(this.selectedItems);
    }
  }

  #resetSelectedItems() {
    this.selectedItems.forEach((item) => {
      item._setOption("selected", false);
    });
    this.selectedItems = [];
  }

  selectAll() {
    // Reset current selection first
    this.#resetSelectedItems();

    // Build array with all elements and connectors
    this.selectedItems = [...this.elements, ...this.connectors];

    // Set selected option to true for each item
    this.selectedItems.forEach((item) => {
      item._setOption("selected", true);
    });

    // Notify observer about selection change
    this.observer.onSelectDiagramItem(this.selectedItems);

    // Redraw the diagram to reflect selection changes
    this.draw();
  }

  _setOption(key, value) {
    this.options[key] = value;
    if (key == "editmode") {
      if (!value) {
        //
        // Reset connectors states
        //
        this.transformConnector = null;
        this.highlightedConnector = null;

        // reset selection
        this.#resetSelectedItems();

        this.observer.onSelectDiagramItem(this.selectedItems);
        this.draw();
      }
    } else if (key == "zoom") {
      $("#" + this.euid).css("zoom", value);
    }
  }

  #toggleSelectItem(item, ctrlDown, isSelect = true) {
    if (ctrlDown) {
      if (!item) return;
      //
      // Add or remove item to the list of selected
      //
      if (item.options.selected) {
        this.selectedItems = this.selectedItems.filter((elem) => {
          return elem != item;
        });
      } else {
        this.selectedItems.push(item);
      }
      item._setOption("selected", item.options.selected ? false : true);
    } else {
      //
      // Hide previously selected items
      // it could be 1 item or multiple
      //
      this.#resetSelectedItems();

      //
      // No new item
      //
      if (item != null) {
        //
        // isSelect should always be true
        //
        if (isSelect) {
          this.selectedItems = [item];
        } else {
          this.selectedItems = [];
        }
        item._setOption("selected", isSelect);
      }
    }
  }

  /**
   *
   * @param {BaseElement | null} refElement
   * @param {Event} evt
   * @param {boolean} isDoubleClick
   * @returns
   */
  onMouseClick(refElement, evt, isDoubleClick) {
    if (!this.options.editmode) {
      // Do nothing if it is not an edit mode
      return;
    }

    // Check if control button on
    var ctrlDown = evt.ctrlKey;

    // User clicked on some connector
    if (this.highlightedConnector) {
      this.#toggleSelectItem(this.highlightedConnector, ctrlDown);
    } else {
      // There is no selected connector //

      // There is no element too, but ctrl ON
      if (ctrlDown && !refElement) {
        return;
      }

      this.#toggleSelectItem(refElement, ctrlDown);
    }

    //
    // TODO: skip notification if user clicked on the same element
    //
    this.observer.onSelectDiagramItem(this.selectedItems);

    // redraw the connectors
    this.draw();
  }

  onMouseEnter(element) {
    // TODO: do not forget this.options.editmode if you decide to add something to this method
    // Show "REFERENCE" for viewer mode   - MOVE TO PLUGIN
    // if (!this.isEditable() && (element.options.subdiagrams)) {
    //  this.observer.showElementRefs(element);
    //  }
    //    this.observer.showElementRefs(element)
  }

  onMouseLeave(element) {
    // TODO: do not forget this.options.editmode if you decide to add something to this method
  }

  checkDroppableElement(de /* dropped_element */) {
    //
    // Could not relay on jsonModel at this point
    //
    const dp = de.nativeBorderRef.position();
    const ds = {
      width: de.nativeBorderRef.width(),
      height: de.nativeBorderRef.height(),
    };

    var zindex = -100;
    var result = null;

    for (var d in this.elements) {
      const item = this.elements[d];
      if (
        item === de || // the same element
        !item.options.acceptdrop || // do not accept any elements for drop
        // do not accept an element type as drop
        item.options.acceptdrop.indexOf(de.options.nameTemplate) < 0
      ) {
        continue;
      }

      var p = item.nativeBorderRef.position();
      var sz = {
        width: item.nativeBorderRef.width(),
        height: item.nativeBorderRef.height(),
      };

      //
      // Check if dropped element inside current
      //
      if (
        dp.left > p.left &&
        dp.left + ds.width < p.left + sz.width &&
        dp.top > p.top &&
        dp.top + ds.height < p.top + sz.height
      ) {
        const zi = parseInt(item.jsonModel["z-index"]);
        if (zi > zindex) {
          zindex = zi;
          result = item;
        }
      }
    }
    return result;
  }

  //
  // Find an accepting element whose border the dropped element merely
  // overlaps (rather than being fully contained by), e.g. a component
  // port that should sit on the parent's border rather than inside it.
  //
  checkOverlappingElement(de /* dropped_element */) {
    const dp = de.nativeBorderRef.position();
    const ds = {
      width: de.nativeBorderRef.width(),
      height: de.nativeBorderRef.height(),
    };

    var zindex = -100;
    var result = null;

    for (var d in this.elements) {
      const item = this.elements[d];
      if (
        item === de ||
        !item.options.acceptdrop ||
        item.options.acceptdrop.indexOf(de.options.nameTemplate) < 0
      ) {
        continue;
      }

      const p = item.nativeBorderRef.position();
      const sz = {
        width: item.nativeBorderRef.width(),
        height: item.nativeBorderRef.height(),
      };

      //
      // Check if dropped element's rect overlaps the accepting element's rect
      //
      const overlaps =
        dp.left < p.left + sz.width &&
        dp.left + ds.width > p.left &&
        dp.top < p.top + sz.height &&
        dp.top + ds.height > p.top;

      if (overlaps) {
        const zi = parseInt(item.jsonModel["z-index"]);
        if (zi > zindex) {
          zindex = zi;
          result = item;
        }
      }
    }
    return result;
  }

  //
  // Detach element from its previous parent's droplist (if any) and
  // attach it to the new parent (if any), then apply the z-index rule:
  // a nested element must render above its parent.
  //
  reparentDroppedElement(element, parent) {
    if (element.parent !== parent) {
      if (element.parent && element.parent.droplist) {
        const rmIdx = element.parent.droplist.indexOf(element);
        if (rmIdx >= 0) {
          element.parent.droplist.splice(rmIdx, 1);
        }
      }

      element.parent = parent;
      if (parent) {
        parent.droplist = parent.droplist || [];
        parent.droplist.push(element);
      }
    }

    if (parent) {
      const pz = parseInt(parent.jsonModel["z-index"]);
      const ez = parseInt(element.jsonModel["z-index"]);
      // parent on top of element - bump the nested element above it
      if (pz > ez) {
        parent._setOption("z-index", ez);
        element._setOption("z-index", pz);
      }
    }
  }

  //
  // indeed on add connector finished successfull
  //
  onAddConnector(connector) {
    // Notify rendrer's addon's if needed
    if (this.observer) {
      this.observer.onJsonModelChange("add:connector", { connector });
    }
    // Add to the list
    this.connectors.push(connector);
  }

  //
  // Check if there is any element in the dropped position
  //
  checkDropAtPosition(x, y) {
    for (var d in this.elements) {
      let elm = $("#" + this.elements[d].euid + "_Border");
      var p = elm.position();
      var sz = elm.size();

      if (
        x > p.left &&
        x < p.left + sz.width &&
        y > p.top &&
        y < p.top + sz.height
      ) {
        return this.elements[d].euid;
      }
    }
    return null;
  }

  //
  // Show [ x ] with connector when user click on icon menu on top of any uml element
  //
  setDropHelper(dropHelper) {
    if (!dropHelper) {
      delete this.dropHelper;
      $("#" + this.euid + " .us-element-border").draggable(
        "option",
        "helper",
        "original",
      );
      return;
    }
    this.dropHelper = dropHelper;
    $("#" + this.euid + " .us-element-border").draggable(
      "option",
      "helper",
      function (event) {
        return $(
          "<div id='ConnectionHelper_Border' style='border:solid black;border-width:1px;'>\
          <div id='ConnectionHelper' style='border:solid yellow;border-width:1px;'> [ x ]</div></div>",
        );
      },
    );
  }

  removeInstance() {
    //
    // Remove all connectors
    //
    for (var i in this.connectors) {
      this.connectors[i].removeInstance();
    }
    this.connectors = [];

    //
    // Remove all elements
    //
    for (var i in this.elements) {
      this.elements[i].removeInstance();
    }
    this.elements = [];

    //
    // Remove UI instance (canvas mainly)
    //
    this.nativeRef.remove();

    //
    // notify observer about completion
    //
    if (this.observer) {
      this.observer.onRemoveDiagram(this);
    }
  }

  //
  // Element DND observer API
  //
  onElementDragStart(element, ui) {
    console.log("ON ELEMENT DRAG START: ", element.euid);
    //
    //
    //
    element.onDragStart(ui);
    //
    // Multiple elements selected
    //
    if (this.selectedItems.length > 1) {
      for (var i in this.elements) {
        var ee = this.elements[i];
        if (ee.options["selected"] && !ee.options["dragStart"]) {
          ee.onDragStart(ui);
        }
      } // elements
    }

    // Diagram-specific drag-start handling (e.g. nested/droppable elements)
    this.handleElementDragStart(element, ui);

    // Update the list of draggable elements
    var draggable = [];
    //
    // Push all draggable elements to the list
    //
    for (var i in this.elements) {
      const ee = this.elements[i];
      if (ee.options["dragStart"]) {
        // add euid to the list
        draggable.push(ee.getId());
      }
    }

    //
    // Update list of connectors to DND
    //
    let selectionChanged = false;
    for (var i in this.connectors) {
      var tmpConnector = this.connectors[i];

      const [id1, id2] = tmpConnector.getEndPointIds();
      console.log("CONNECTOR END POINTS: ", id1, id2);
      const id1InDraggable = id1 !== null && draggable.indexOf(id1) >= 0;
      const id2InDraggable = id2 !== null && draggable.indexOf(id2) >= 0;

      if (
        this.isConnectorRelatedToDrag(
          tmpConnector,
          id1,
          id2,
          id1InDraggable,
          id2InDraggable,
        )
      ) {
        this.connectors[i].onDragStart(ui);
      } else if (tmpConnector.options["selected"]) {
        //
        // A connector can still be marked selected here even though the
        // user is now dragging an unrelated element: selection is only
        // cleared on the connector/element "click" (mouseup), which fires
        // after jQuery UI's draggable "start" (mousemove-threshold) has
        // already triggered onElementDragStart. Since this connector has
        // nothing to do with the element being dragged, drop the stale
        // selection now instead of letting it tag along.
        //
        this.selectedItems = this.selectedItems.filter(
          (item) => item !== tmpConnector,
        );
        tmpConnector._setOption("selected", false);
        selectionChanged = true;
      }
    } // connectors

    if (selectionChanged) {
      this.observer.onSelectDiagramItem(this.selectedItems);
    }
  }

  onElementDragMove(element, ui) {
    // Elements
    for (var i in this.elements) {
      if (
        this.elements[i].options["dragStart"] &&
        this.elements[i] != element
      ) {
        // Drag move updates the css of the element
        // Skip draggable element to avoid infinite loop
        this.elements[i].onDragMove(ui);
      }
    }
    // Connectors
    for (var i in this.connectors) {
      if (this.connectors[i].options["dragStart"]) {
        this.connectors[i].onDragMove(ui);
      }
    }
  }

  onElementDragStop(element, ui) {
    element.onDragStop(ui, true);

    // In case of multiple elements DND.
    for (var i in this.elements) {
      var ee = this.elements[i];
      if (ee.options["dragStart"] && ee != element) {
        ee.onDragStop(ui);
        ee._update();
      }
    }

    // stop connector's move
    for (var i in this.connectors)
      if (this.connectors[i].options["dragStart"])
        this.connectors[i].onDragStop(ui);

    // Diagram-specific drag-stop handling (e.g. nested/droppable elements)
    this.handleElementDragStop(element, ui);
  }

  //
  // Hook for diagrams that support nested/droppable elements
  // (e.g. PackageDiagram, ComponentsDiagram). No-op by default.
  //
  handleElementDragStart(element, ui) {}

  //
  // Hook for diagrams that support nested/droppable elements
  // (e.g. PackageDiagram, ComponentsDiagram). No-op by default.
  //
  handleElementDragStop(element, ui) {}

  //
  // Decide whether `connector` should be dragged along with the elements
  // currently being moved (id1/id2 are its 2 end-point ids, already
  // resolved into id1InDraggable/id2InDraggable against the set of
  // elements taking part in this drag). Default: both ends move together,
  // or one end moves while the other is fully unattached - i.e. the
  // connector's own shape is always fully derived from its attached
  // element(s), so it never needs its free points manually translated
  // unless everything relevant is already moving. See SequenceDiagram for
  // why that's too strict there.
  //
  isConnectorRelatedToDrag(connector, id1, id2, id1InDraggable, id2InDraggable) {
    return (
      (id1InDraggable && id2InDraggable) ||
      (id1InDraggable && id2 === null) ||
      (id2InDraggable && id1 === null)
    );
  }
}

export { BaseDiagram };
