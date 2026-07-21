import {
  copyCommandHandler,
  cutCommandHandler,
  deleteCommandHandler,
  editCommandHandler,
  pasteCommandHandler,
} from "../renderers/Commands/CopyPasteCommandHandlers";
import { EditorPluginManager } from "../renderers/EditorPluginManager";
import { ClassDiagram } from "../diagrams/ClassDiagram";
import configLoader from "../utils/ConfigLoader";
import {
  addConnectorLabelCommandHandler,
  removeConnectorCommandHandler,
  removeConnectorLabelCommandHandler,
} from "../renderers/Commands/ConnectorCommandHandler";
import {
  zindexBackCommandHandler,
  zindexFrontCommandHandler,
} from "../renderers/Commands/ZindexCommandHandlers";
import {
  classAddFieldCommandHandler,
  classAddMethodCommandHandler,
  classEditFieldCommandHandler,
  classEditMethodCommandHandler,
  classRemoveFieldCommandHandler,
  classRemoveMethodCommandHandler,
} from "../renderers/Commands/ClassExtraCommandHandler";
import { PackageDiagram } from "../diagrams/PackageDiagram";
import { ComponentsDiagram } from "../diagrams/ComponentsDiagram";
import { StateDiagram } from "../diagrams/StateDiagram";
import { SequenceDiagram } from "../diagrams/SequenceDiagram";
import { DefaultStyleManager } from "../styles/DefaultStyleManager";

class DiagramEditor {
  // Listeners registered via onUndoRedoChange(), fanned out on every
  // undo/redo stack change and re-attached to each newly loaded diagram.
  #undoRedoListeners = [];

  constructor(domSelector, overrideOptions) {
    this.parentSelector = domSelector;

    this.options = {
      id: 1,
      globalId: 1,
      devmode: false,
      width: 1000,
      height: 500,
      ...overrideOptions,
    };
    this.prefix = "e" + this.options.id;

    $(domSelector).append(
      '<div id="dw-uml-toolbar"></div>\
                <div id="dw-uml-area"><div id="dw-uml-sidebar"></div></div>',
    );
    //
    // Placholder for a side menu
    //
    this.sideMenu = $(domSelector + " #dw-uml-sidebar");

    //
    // Add default editor commands to the config loader API
    //
    this.#registerDefaultCommand();
    //
    // Update dimentions of the editor if hardcoded by page.
    //
    this.#updateDimention(this.options.width, this.options.height);
    //
    // Subscribe to parent selector resize events
    //
    this.#subscribeToResize();

    //
    // Style manager: system/user style catalog + default style, shared by
    // every diagram loaded into this editor (unlike hotKeyManager, it is
    // NOT re-created per loadDiagram() call - styles are editor-wide, not
    // diagram-scoped). `styleManager` option unset -> default
    // DefaultStyleManager (localStorage-backed); a class -> instantiated
    // once instead, given `{ storageKey }`.
    //
    const StyleManagerClass = this.options.styleManager || DefaultStyleManager;
    this.styleManager = new StyleManagerClass({
      storageKey: `umlsync:styles:${this.options.id}`,
    });
  }

  getNextGlobalId() {
    return this.options.globalId++;
  }

  registerCommand(name, handler) {
    configLoader.addCommand(name, handler);
  }

  extendContextMenu(path, title, command) {
    configLoader.extendContextMenu(path, title, command);
  }

  #registerDefaultCommand() {
    // Base copy-paste implementation
    this.registerCommand("command:element:cut", cutCommandHandler);
    this.registerCommand("command:element:copy", copyCommandHandler);
    this.registerCommand("command:diagram:paste", pasteCommandHandler);
    this.registerCommand("command:element:remove", deleteCommandHandler);
    this.registerCommand("command:element:edit", editCommandHandler);

    // Connector's command handler
    this.registerCommand(
      "command:connector:add_label",
      addConnectorLabelCommandHandler,
    );
    this.registerCommand(
      "command:connector:edit_label",
      removeConnectorLabelCommandHandler,
    );
    this.registerCommand(
      "command:connector:remove_label",
      removeConnectorLabelCommandHandler,
    );
    // Connector Remove
    this.registerCommand(
      "command:connector:remove",
      removeConnectorCommandHandler,
    );

    // Z-index command handlers
    this.registerCommand("command:element:moveback", zindexBackCommandHandler);
    this.registerCommand(
      "command:element:moveforward",
      zindexFrontCommandHandler,
    );

    // class extra commands
    // TODO: For class diagram only, but ... it for another hand it is too small
    this.registerCommand(
      "command:class:add_field",
      classAddFieldCommandHandler,
    );
    this.registerCommand(
      "command:class:edit_field",
      classEditFieldCommandHandler,
    );
    this.registerCommand(
      "command:class:remove_field",
      classRemoveFieldCommandHandler,
    );

    this.registerCommand(
      "command:class:add_method",
      classAddMethodCommandHandler,
    );
    this.registerCommand(
      "command:class:edit_method",
      classEditMethodCommandHandler,
    );
    this.registerCommand(
      "command:class:remove_method",
      classRemoveMethodCommandHandler,
    );
  }

  //
  // Create a new diagram - edit mode by default
  //
  createDiagram(nameTemplate, extraOptions = {}) {
    return this.loadDiagram(
      { width: 500, height: 400, nameTemplate: nameTemplate },
      { editmode: true, ...extraOptions },
    );
  }

  //
  // Load an existing digaram - view mode by default
  //
  loadDiagram(jsonModel, extraOptions = { editmode: false }) {
    //
    // remove the previous one
    //
    if (this.digram) {
      this.digram.removeInstance(); // Remove previous instance of the diagram
      this.sideMenu.empty(); // Clear side menu area too
      delete this.digram;
      this.digram = null;
    }

    // e1-d1-e5-o3 - make a complex prefix,based on hierarchy, to make a unique ids
    // e1 -editor 1 - instance
    // d1 - diagram, first loaded
    // e5 - element - 5th loaded
    // o3 - operations inside class element 3-rd instance
    jsonModel.id = this.getNextGlobalId();
    let prefix = this.prefix + "dm" + jsonModel.id;

    //
    // at this point we should provide a custom config
    // which is different for editor and viewer
    //
    let pm = new EditorPluginManager({
      devmode: this.options.devmode,
      hotKeyManager: this.options.hotKeyManager,
      styleManager: this.styleManager,
    });

    const diagramMap = {
      classDiagram: ClassDiagram,
      packageDiagram: PackageDiagram,
      componentsDiagram: ComponentsDiagram,
      stateDiagram: StateDiagram,
      sequenceDiagram: SequenceDiagram,
    };

    const DiagramRef = diagramMap[jsonModel.nameTemplate];

    if (DiagramRef) {
      const options = {
        width: this.options.width,
        height: this.options.height,
        // Check if editor do not want to allocate multiple canvas,
        // Uses for multi-tabs mode
        multicanvas: !this.options.shareCanvas,
        prefix: prefix,
        parentId: "#dw-uml-area",
        ...extraOptions,
      };

      this.digram = new DiagramRef(jsonModel, options, pm);
      this.digram.setUserData("plugin-manager", pm);
    }

    // Sync-up edit mode - hide/show side menu
    this.options.editmode = extraOptions.editmode;

    // Re-attach undo/redo tracking to the newly loaded diagram and let
    // subscribers know where its (fresh) history stands.
    this.#attachUndoRedoListener();
    this.#notifyUndoRedoListeners();

    return this.digram;
  }

  //
  // Undo/redo API
  //
  undo() {
    if (this.digram && this.digram.opman) {
      this.digram.opman.undo();
    }
  }

  redo() {
    if (this.digram && this.digram.opman) {
      this.digram.opman.redo();
    }
  }

  canUndo() {
    return !!(this.digram && this.digram.opman && this.digram.opman.canUndo());
  }

  canRedo() {
    return !!(this.digram && this.digram.opman && this.digram.opman.canRedo());
  }

  //
  // Subscribe to undo/redo availability changes, e.g. to enable/disable
  // toolbar buttons. callback is invoked immediately with the current
  // {canUndo, canRedo} state, then again on every change - including
  // across loadDiagram()/createDiagram() calls, since the listener is
  // re-attached to whichever diagram is currently loaded.
  //
  // Returns an unsubscribe function.
  //
  onUndoRedoChange(callback) {
    this.#undoRedoListeners.push(callback);
    callback(this.#getUndoRedoState());
    return () => {
      this.#undoRedoListeners = this.#undoRedoListeners.filter(
        (cb) => cb !== callback,
      );
    };
  }

  #getUndoRedoState() {
    return { canUndo: this.canUndo(), canRedo: this.canRedo() };
  }

  #notifyUndoRedoListeners() {
    const state = this.#getUndoRedoState();
    this.#undoRedoListeners.forEach((callback) => callback(state));
  }

  #attachUndoRedoListener() {
    if (!this.digram) {
      return;
    }
    const blackboard = this.digram.getUserData("blackboard");
    if (!blackboard) {
      return;
    }
    blackboard.addEventListener("opman:changed", () =>
      this.#notifyUndoRedoListeners(),
    );
  }

  //
  // Style API - see src/styles/IStyleManager.js
  //
  getSystemStyles() {
    return this.styleManager.getSystemStyles();
  }

  getUserStyles() {
    return this.styleManager.getUserStyles();
  }

  saveUserStyle(style) {
    return this.styleManager.saveUserStyle(style);
  }

  removeUserStyle(id) {
    return this.styleManager.removeUserStyle(id);
  }

  getPinnedStyleIds() {
    return this.styleManager.getPinnedStyleIds();
  }

  pinStyle(id) {
    this.styleManager.pinStyle(id);
  }

  unpinStyle(id) {
    this.styleManager.unpinStyle(id);
  }

  getDefaultStyle() {
    return this.styleManager.getDefaultStyle();
  }

  setDefaultStyle(style) {
    this.styleManager.setDefaultStyle(style);
  }

  setOption(key, value) {
    if (key === "dimention") {
      this.#updateDimention(value.width, value.height);
    } else if (key === "editmode") {
      this.#updateEditMode(key, value);
      this.#updateDimention();
    }
  }

  #updateDimention(width, height) {
    if (this.options.fitToParent) {
      // Always read size from the parent. Ignore passed width/height
      const rect = $(this.parentSelector)[0].getBoundingClientRect();
      width = rect.width;
      height = rect.height;
    } else {
      // Update UI
      var $par = $(this.parentSelector);
      $par.width(width);
      $par.height(height);
    }

    // Side menu OR bottom menu.
    this.sideMenu.height(height);

    // TODO: replace the parent selector's width/height
    //       reduce width on side menu size, if edit mode
    //       and update diagram area finally
    if (this.digram) {
      let diagramWidth = width;

      // take in account sidemenu if editmode
      if (this.digram.options.editmode && this.sideMenu)
        diagramWidth -= this.sideMenu.width();

      this.digram.updateDimention(diagramWidth, height);
    }
  }

  #updateEditMode(key, value) {
    if (!this.digram) return;

    this.digram._setOption(key, value);

    //
    // Broadcast value to the extensions via blackboard
    //
    const bb = this.digram.getUserData("blackboard");
    if (bb && bb.getStorageValue(key) != value) {
      bb.setStorageValue(key, value);
    }

    // TODO: resize diagram beacause of show/hide side menu
    // this.#updateDimention();
  }

  #subscribeToResize() {
    const $parent = $(this.parentSelector);
    if (!$parent.length) {
      return;
    }

    // Store initial dimensions to detect changes
    let lastWidth = $parent.width();
    let lastHeight = $parent.height();

    // Subscribe to window resize events and check if parent element size changed
    $(window).on("resize." + this.prefix, () => {
      console.log("RESIZE EVENT FIRED " + this.parentSelector);
      const currentWidth = $parent.width();
      const currentHeight = $parent.height();

      // Only update if dimensions actually changed
      if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
        lastWidth = currentWidth;
        lastHeight = currentHeight;
        this.#updateDimention();
      }
    });
  }
}

export { DiagramEditor };
