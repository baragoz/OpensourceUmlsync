import { BaseDiagram } from "../../diagrams/BaseDiagram";
import { Blackboard } from "../../utils/Blackboard";

class DiagramMouseEvents {
  constructor(diagram, blackboard) {
    this.init(diagram, blackboard);
  }

  //
  // Trigger re-draw on scroll
  /**
   *
   * @param {BaseDiagram} iDiagram
   * @param {Blackboard} blackboard
   */
  init(iDiagram, blackboard) {
    $("#" + iDiagram.euid)
      .dblclick(function (e) {
        e.preventDefault();
        e.stopPropagation();
        iDiagram.onMouseClick(null, e, true);

        // Same selectedconnector-based inference the .click() handler below
        // already relies on (set during mousedown/mousemove hit-testing,
        // same file) - a connector has no per-item DOM binding of its own
        // to double-click on directly, unlike an element (see
        // ElementMouseEvents' own .dblclick()).
        if (iDiagram.selectedconnector) {
          blackboard.notify("connector:dblclick", iDiagram.selectedconnector);
        } else {
          blackboard.notify("diagram:dblclick");
        }
      })
      .click(function (evt) {
        // it could be undefined !!!
        //$("#tabs #us-editable").hide();
        // iDiagram._setWidgetsOption("selected", false);
        iDiagram.onMouseClick(null, evt, false /* is double click */);

        //
        // TODO: if ctrl on? => it could be multiple selection => how to handle ?
        //
        if (iDiagram.selectedconnector) {
          blackboard.notify("connector:click", iDiagram.selectedconnector);
        } else {
          blackboard.notify("diagram:click", iDiagram);
        }

        // Work-around for references
        // $("#" + iDiagram.euid + " .us-references").hide();
        // hide all context menus
        // $(".context-menu").hide();
        // hide the color picker's menu
        // $(".us-context-toolbox").hide();
        /*            
               // Hide elements selectors on click
               //$(".ui-resizable-handle").css({'visibility':'hidden'});
    
               // Hack to notify about click
               //if (diag.clickedconntector) {
                 diag.clickedconntector.selected = false;
               }
    
               if (diag.selectedconntector) {
                 if (diag.clickedconntector != diag.selectedconntector) {
                   diag.clickedconntector = diag.selectedconntector;
                 }
    
                 diag.selectedconntector.selected = true;
    
                 if (diag.selectedconntector._showMenu)
                   diag.selectedconntector._showMenu(x, y, true, diag.selectedconntector);
               } else {
                 diag.clickedconntector = undefined;
               }
               this.selectedElement = undefined;
           */
        iDiagram.draw();
        evt.stopPropagation();
      })
      //
      //  TRANSFORM CONNECTORS:
      //
      .mousemove(function (e) {
        // DEBUG FUNCTIONALITY.
        var p = $(this).offset(),
          x = Math.round(e.pageX - p.left),
          y = Math.round(e.pageY - p.top);
        var status = iDiagram.isPointOnLine(x, y);
        if (status) {
          e.stopPropagation();
        }
      })
      .mouseup(function (e) {
        var p = $(this).offset(),
          x = Math.round(e.pageX - p.left),
          y = Math.round(e.pageY - p.top);
        iDiagram.stopConnectorTransform(x, y);
      })
      .mousedown(function (e) {
        var p = $(this).offset(),
          x = Math.round(e.pageX - p.left),
          y = Math.round(e.pageY - p.top);

        if (e.which != 3 && !e.ctrlKey) {
          //
          // This handler is bound on the whole diagram surface, so a
          // mousedown that lands on an element (about to start a drag)
          // bubbles up here too. Only pre-process/deselect when the
          // mousedown actually originated on empty canvas - otherwise
          // this wipes a multi-selection before ElementDraggable's own
          // 'start' handler ever gets a chance to see it, and only the
          // element under the mouse ends up moving.
          //
          if ($(e.target).closest(".us-element-border").length === 0) {
            iDiagram.onMouseClick(null, e);
          }
          iDiagram.startConnectorTransform(x, y);
        }
      });
  }
}

export { DiagramMouseEvents };
