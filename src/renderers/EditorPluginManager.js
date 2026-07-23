import { BaseConnector } from "../connectors/BaseConnector";
import { BaseDiagram } from "../diagrams/BaseDiagram";
import { BaseElement } from "../elements/BaseElement";
import { IDiagramObserver } from "../interfaces/IDiagramObserver";
import { Blackboard } from "../utils/Blackboard";
import { OperationManager } from "../core/OperationManager";

import { ClassExtras } from "./Plugins/ClassExtras";
import { ConnectorLabels } from "./Plugins/ConnectorLabels";
import { DiagramContextMenuEvents } from "./Plugins/DiagramContextMenuEvents";
import { DiagramDroppableElement } from "./Plugins/DiagramDroppableElements";
import { DiagramMouseEvents } from "./Plugins/DiagramMouseEvents";
import { DiagramScrollStartEvent } from "./Plugins/DiagramScrollStartEvent";
import { EditorContextMenu } from "./Plugins/EditorContextMenu";
import { EditorDetachedToolbarMenu } from "./Plugins/EditorDetachedToolbarMenu";
import { EditorHotKeysEvents } from "./Plugins/EditorHotKeysEvents";
import { EditorIconMenu } from "./Plugins/EditorIconMenu";
import { ElementContextMenu } from "./Plugins/ElementContextMenu";
import { ElementDraggable } from "./Plugins/ElementDraggable";
import { ElementEditable } from "./Plugins/ElementEditable";
import { ElementMouseEvents } from "./Plugins/ElementMouseEvents";
import { ElementResizeable } from "./Plugins/ElementResizeable";

class EditorPluginManager extends IDiagramObserver {
  constructor(overrideDefaultValues = {}) {
    super();

    this.options = {
      sidebarSelector: "#dw-uml-sidebar",
      toolbarSelector: "#dw-uml-toolbar",
      devmode: false,
      ...overrideDefaultValues,
    };

    this.plugins = [];
    this.blackboard = new Blackboard();
    //
    // It is not config, it is runtime values,
    // but default values on start could be taken from config loader
    //
    this.setupDefaultValues(overrideDefaultValues);
  }

  //
  // TODO: make it possible to override default values
  //
  setupDefaultValues(overrideDefaultValues) {
    // Switch between edit/view modes
    this.blackboard.setStorageValue("editmode", true);

    // Notify about multiple select in effect
    this.blackboard.setStorageValue("multiple_select", false);
  }

  onJsonModelChange(action, data) {
    if (action === "add:element") {
      this.onAddElement(data.element);
    } else if (action === "add:connector") {
      this.onAddConnector(data.connector);
    } else if (action === "change:element") {
      this.onChangeElement(data);
    } else if (action === "change:connector") {
      this.onChangeConnector(data);
    }
  }

  /**
   *
   * @param {BaseDiagram} diagram
   */
  onAddDiagram(diagram) {
    this.diagram = diagram;

    // bind blackboard to the diagram
    this.diagram.setUserData("blackboard", this.blackboard);

    // undo/redo history for this diagram (editor only)
    this.diagram.opman = new OperationManager(this.diagram);

    // Sync edit mode with the actual diagram option - setupDefaultValues()
    // only sets a startup default before the diagram (and its editmode
    // option) exists yet.
    this.blackboard.setStorageValue("editmode", !!diagram.options.editmode);

    //
    // Diagram plugins
    //
    diagram.setUserData(
      "plugin-mouse",
      new DiagramMouseEvents(diagram, this.blackboard),
    );
    //
    // droppable cleanup (detach parent/droplist links on element removal);
    // nesting/z-index/snap-on-drop itself is handled by each diagram's
    // handleElementDragStop override (see BaseDiagram.js). Harmless no-op
    // for diagrams whose elements never declare droppable/acceptdrop
    // (ClassDiagram, StateDiagram).
    //
    diagram.setUserData(
      "plugin-droppable",
      new DiagramDroppableElement(diagram, this.blackboard),
    );
    diagram.setUserData(
      "plugin-scroll",
      new DiagramScrollStartEvent(diagram, this.blackboard),
    );
    diagram.setUserData(
      "plugin-contextmenu",
      new DiagramContextMenuEvents(diagram, this.blackboard),
    );

    //
    // Editor Plugins
    //
    diagram.setUserData(
      "plugin-editor-iconmenu",
      new EditorIconMenu(diagram, this.blackboard),
    );
    //diagram.setUserData("plugin-editor-sidemenu", new EditorSideMenu(
    //    this.getSidebarPlaceholder(diagram), diagram, this.blackboard));
    diagram.setUserData(
      "plugin-editor-contextmenu",
      new EditorContextMenu(diagram, this.blackboard, null),
    );

    //
    // Hotkey manager: `hotKeyManager` in the constructor's overrideDefaultValues
    // is `false` to skip the default one entirely, a class (same constructor
    // signature: diagram, blackboard, editorConfig) to use a custom one instead,
    // or unset to use the built-in EditorHotKeysEvents. A custom manager should
    // dispatch through EditorActions to get the same select/copy/cut/paste/
    // delete/undo/redo behavior instead of reimplementing it.
    //
    if (this.options.hotKeyManager !== false) {
      const HotKeyManager = this.options.hotKeyManager || EditorHotKeysEvents;
      diagram.setUserData(
        "plugin-editor-hotkeys",
        new HotKeyManager(diagram, this.blackboard, null),
      );
    }

    //
    // NOTE: must be initiliazed after the icon menu, because icon menu is subscribed on
    //       the default style values
    //
    diagram.setUserData(
      "plugin-editor-toolbar",
      new EditorDetachedToolbarMenu(
        this.getToolbarPlaceholder(diagram),
        diagram,
        this.blackboard,
        this.options.devmode,
        this.options.styleManager,
      ),
    );

    // notify observers
    this.blackboard.notify("diagram:add", diagram);
  }

  /**
   *
   * @param {BaseDiagram} diagram
   */
  onRemoveDiagram(diagram) {
    // Empty
  }

  onSelectDiagramItem(listOfItems) {
    console.log("NOTIFY DATA", listOfItems);
    this.blackboard.notify("diagram:item:select", listOfItems);
  }

  /**
   *
   * @param {BaseConnector} connector
   */
  onAddConnector(connector) {
    //
    // Initialize plugins
    //

    // Mainly uses for the context menu commands
    connector.setUserData(
      "plugin-connector-labels",
      new ConnectorLabels(
        connector,
        this.blackboard,
        this.options.completionProvider,
      ),
    );

    //
    // Notify subscribers on connector add
    //
    this.blackboard.notify("connector:add", connector);
  }

  onChangeElement(data) {
    // Updated JSON model of element:
    // width/height/color/font-size/edit-text
    //
    // For class extra fields/methods
  }

  onChangeConnector(data) {
    // Updated json model of connector
    // epoints/labels
  }

  onRemoveElement(data) {
    this.blackboard.notify("element:remove", data);
  }

  onRemoveConnector(data) {
    this.blackboard.notify("connector:remove", data);
  }

  /**
   *
   * @param {BaseElement} element
   */
  onAddElement(element) {
    // this.wrapWithBorder(element);
    let nativeBorderRef = $("#" + element.euid + "_Border");

    // make element resizeable
    element.setUserData(
      "plugin-element-draggable",
      new ElementDraggable(element, nativeBorderRef, this.blackboard),
    );
    element.setUserData(
      "plugin-element-contextmenu",
      new ElementContextMenu(element, nativeBorderRef, this.blackboard),
    );
    element.setUserData(
      "plugin-element-mouse",
      new ElementMouseEvents(element, nativeBorderRef, this.blackboard),
    );
    //
    // Component's diagram intrface and port are not resizeable
    //
    if (element.options.resizeable !== "none") {
      console.log("TEMPLATE NAME IS:", element.options);
      element.setUserData(
        "plugin-element-resizeable",
        new ElementResizeable(element, nativeBorderRef, this.blackboard),
      );
    }
    element.setUserData(
      "plugin-element-editable",
      new ElementEditable(
        element,
        nativeBorderRef,
        this.blackboard,
        this.options.completionProvider,
      ),
    );

    if (element.options.nameTemplate == "class") {
      // operations and attributes handler
      element.setUserData(
        "plugin-element-class-extra",
        new ClassExtras(element, this.blackboard),
      );
    }

    // notify observers if any
    this.blackboard.notify("element:add", element);
  }

  getToolbarPlaceholder(diagram) {
    if (this.options.toolbarSelector) {
      return this.options.toolbarSelector;
    }

    return this.blackboard.getStorageValue("storage:toolbar-selector");
  }

  getSidebarPlaceholder(diagram) {
    //
    // TODO: hmm.... should it be more configurable, or configurable via
    //               config loader?
    //
    if (this.options.sidebarSelector) {
      return this.options.sidebarSelector;
    }

    return this.blackboard.getStorageValue("storage:sidebar-selector");
  }

  initCrossReferences(element, nativeBorderRef) {
    let refN = 0;
    element.jsonModel.references = this.element.references || new Array();

    var subDiagramPaths =
      element.jsonModel["subdiagrams"] || element.jsonModel["references"] || {};
    var subDiagramRefs =
      "<div class='us-references us-list'><ul class='context-menu-3'><li id='reference-new'><a>new reference</a></li>";
    subDiagramRefs += "</ul></div>";

    element.nativeRef.append(
      "\
            <img id='" +
        this.euid +
        "_REF' title='REFERENCE' src='./images/reference.png'\
             class='us-element-ref' style='z-index:99999;visibility:hidden;'></img>",
    );

    nativeBorderRef.append(subDiagramRefs);

    for (var g in subDiagramPaths) {
      element.addReference({ text: subDiagramPaths[g] }, true);
    }

    // Hide references by default and
    // prevent propagation of click event
    $("#" + element.euid + "_Border .us-references")
      .hide()
      .click(function (e) {
        e.stopPropagation();
      });
    /*
            $('#' + element.euid + "_Border #reference-new a").editable({
              onSubmit:function(data){
               if (data["current"] == data["previous"])
                  return;

               $(this).text("new reference");
               if (data["current"] == "")
                   return;

                element.addReference({text:data["current"]});
                return true;
              }
            });
    */
  }

  toggleElementRefs(element, isShow) {
    $("#" + this.id + "_REF").css({ visibility: "hidden" });
    $("#" + element.euid + "_REF").css({
      visibility: isShow ? "visible" : "hidden",
    });
  }

  showElementRefs() {
    // toggleElementRefs(element, true);
  }

  hideAllRefs() {
    $("#" + this.diagram.euid + " .us-references").hide();
  }

  hideAllEditable() {
    // Do nothing for  a while
  }

  getBlackBoard() {
    return this.blackboard;
  }
}

export { EditorPluginManager };
