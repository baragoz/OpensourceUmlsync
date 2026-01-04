import { BaseDiagram } from "../../diagrams/BaseDiagram";
import { Blackboard } from "../../utils/Blackboard";

class DiagramMouseEvents {
    constructor(diagram, blackboard) {
        this.init(diagram, blackboard)
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
        .dblclick(function(e) {
          e.preventDefault();
          e.stopPropagation();
          iDiagram.onMouseClick(null, e, true);
          blackboard.notify("diagram:dblclick");
        })
        .click(function(evt) {
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
        .mousemove(function(e) {  // DEBUG FUNCTIONALITY.
          var p = $(this).offset(),
          x = Math.round(e.pageX - p.left),
          y = Math.round(e.pageY - p.top);
          var status = iDiagram.isPointOnLine(x,y);
          if (status) {
            e.stopPropagation();
          }
        })
        .mouseup(function(e) {
          var p = $(this).offset(),
          x = Math.round(e.pageX - p.left),
          y = Math.round(e.pageY - p.top);
          iDiagram.stopConnectorTransform(x,y);
        })
        .mousedown(function(e) { 
    
          var p = $(this).offset(),
          x = Math.round(e.pageX - p.left),
          y = Math.round(e.pageY - p.top);
    
          if (e.which != 3 && !e.ctrlKey) {
            // Pre-process selection
            iDiagram.onMouseClick(null, e);
            iDiagram.startConnectorTransform(x,y);
          }
        })
    }
}

export { DiagramMouseEvents }