import { Blackboard } from "../utils/Blackboard";
import { DiagramContextMenu } from "./Plugins/DiagramContextMenu";
import { DiagramMouseEvents } from "./Plugins/DiagramMouseEvents";
import { DiagramScroll } from "./Plugins/DiagramScroll";
import { ElementResizeable } from "./Plugins/ElementResizeable";


class EditorRenderer {
    constructor() {
        this.plugins = [];
        this.blackboard = new Blackboard();
        alert("AAAAAAAAAAAAAAAAA");
    }

    
    onAddDiagram(diagram) {
      this.diagram = diagram;
      // diagram.addPlugin(new DiagramScroll(diagram));
      diagram.addPlugin(new DiagramMouseEvents(diagram, this.blackboard));
      // diagram.addPlugin(new DiagramContextMenu(diagram, this.blackboard));
      // notify observers
      this.blackboard.notify("diagram:add", diagram);
    }

    onAddConnector(connector) {
      this.blackboard.notify("connector:add", connector);
    }


    onAddElement(element) {
        this.wrapWithBorder(element);
        let nativeBorderRef = $('#' + element.euid  + '_Border');

        // make element resizeable
        element.addPlugin(new ElementResizeable(element, nativeBorderRef, this.blackboard));
        //this.initResizeable(element, nativeBorderRef);
        element.addPlugin(new ElementDraggable(element, nativeBorderRef, this.blackboard));
        // this.initDraggable(element, nativeBorderRef);
        console.log("IINIT DRAGGABLE SKIPPED");
        this.initContextMenu(element, nativeBorderRef);
        this.initMouseEvents(element, nativeBorderRef);

        // notify observers if any
        this.blackboard.notify("element:add", element);
    }

  //
  //  Show/hide element border on hover
  //
  wrapWithBorder(element) {
    var poz = "";
      if ((element.jsonModel['left'] != undefined)
        && (element.jsonModel['top'] != undefined)) {
        poz = " style='top:" +element.jsonModel['top'] + "px;left:" + element.jsonModel['left'] + "px;' ";
      }

      $(element.nativeRef).wrap('<div id="' + element.euid + '_Border"' + poz + ' class="us-element-border"></div>');
    }

    initCrossReferences(element, nativeBorderRef) {
        let refN = 0;
        element.jsonModel.references = this.element.references || new Array();
    
        var subDiagramPaths = element.jsonModel['subdiagrams'] || element.jsonModel['references'] || {};
        var subDiagramRefs =  "<div class='us-references us-list'><ul class='context-menu-3'><li id='reference-new'><a>new reference</a></li>";
        subDiagramRefs+="</ul></div>";

        element.nativeRef.append("\
            <img id='" + this.euid + "_REF' title='REFERENCE' src='./images/reference.png'\
             class='us-element-ref' style='z-index:99999;visibility:hidden;'></img>");
        
        nativeBorderRef
        .append(subDiagramRefs);
  
        for (var g in subDiagramPaths) {
           element.addReference({text:subDiagramPaths[g]}, true);
        }
  
        // Hide references by default and
        // prevent propagation of click event
        $('#' + element.euid  + '_Border .us-references')
          .hide()
          .click(function(e) {
            e.stopPropagation();
          });

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

    }
    
    initResizeable(element, nativeBorderRef) {
        //
        // Get a Wrapped element
        //
        let self = this;
        nativeBorderRef.resizable({
            'containment': "#" + this.diagram.euid, // to prevent jumping of element on resize start
            'scroll': true,                         // Scroll container on resize
            'handles': element.options['resizable_h'] || 'n-u,e-u,s-u,w-u,nw-u,sw-u,ne-u,se-u',
            'alsoResize': '#' + element.euid + '_Border .us-element-resizable-area', 
            'start': function() {
                // TODO:  hide all editable fields on diagram
                // element._update();
                // self.operation_start = {top:self.options.top, left:self.options.left, width:self.options.width, height:self.options.height};

                // Hide all editable fields
                self.hideAllEditable();

            },
            'stop': function() {
               
               // TODO: report to the operation manager on resize change - diff between element states
               /* 
               // element._update();
               self.diagram.opman.reportShort("option",
                  element.euid,
                  self.operation_start,
                  {top:self.options.top, left:self.options.left, width:self.options.width, height:self.options.height});
                  delete self.operation_start;
                  */

    
                // if element has a handler on resize complete to align all elements correctly
                if (element.onResizeComplete) {
                  element.onResizeComplete();
                }
                $('#' + element.euid + '_Border .us-element-resizable-area').css('width', '');
                self.diagram.draw();
            },
            'resize': function(event, ui) {
               var dh = ui.size.height - $(this).css("height");
               $(this).css("height", ui.size.height);
               // work-around for synchronization of resizeAlso area
               $('#' + element.euid + '_Border .us-element-resizable-area').width($('#' + element.euid + "_Border").width());
               // TODO: not sure if we need this method    
               if (element.onResizeComplete) {
                element.onResizeComplete();
               }
               self.diagram.draw();
               event.stopPropagation();
            }
        })
        // TODO: Check if we really eed to fix position,
        //       because resizeable add an extra wrapper
        .css({'position':'absolute'})
        .css('top', element.jsonModel['pageY'])
        .css('left', element.jsonModel['pageX']);


        // Hide element resize points which was
        // added on the previous step
        $('#' + element.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'hidden'});
    }

    initDraggable(element, nativeBorderRef) {
        //
        // Check element has a DND limitations
        //
        const axisDirections = element.options['axis'] || false;
        
        // Keep ref on self
        let self = this;

        // Make element draggable
        nativeBorderRef.draggable({
            'containment': "#" + self.diagram.euid,// to prevent jumping of element on resize start
            'grid': [2,2],
            'scroll': true,
            'start': function(event, ui) {
                self.operation_start = {left: ui.position.left, top: ui.position.top};
    
                //
                // drop helper - create uml element directly from connector type icons menu above element 
                //
                if (self.diagram.dropHelper) {
                  self.diagram.Connector(self.diagram.dropHelper, 
                    {
                      epoints: [
                      {x:0,   y: 0,   euid:  element.euid},
                      {x:100, y: 100, euid: "ConnectionHelper"}
                    ]});
                  return;
                }
    
                // Notify element
                element.onElementDragStart(ui);

                // hide all editable
                self.hideAllEditable()
            },
            'drag': function(event, ui) {
                // re-draw connectors
                self.diagram.draw();
    
                // do nothing if element is helper icon
                if (self.diagram.dropHelper) {
                    return;
                }
    
                // TODO: what is it ??
                if (element.$moveit != undefined) {
                    $("#" + element.$moveit).css("left", 200);
                }
                element.onElementDragMove({left:ui.position.left - self.operation_start.left, top:ui.position.top - self.operation_start.top});
            },
            'stop': function(event, ui) {

                //
                // Check boundaries. It is possible to scroll right and bottom
                // but it is not possible to scroll up or left
                //
                if (ui.position.top < 0) {
                    $(elmt).css("top", 3);
                    ui.position.top = 3;
                }
      
                if (ui.position.left < 0) {
                    $(elmt).css("left", 0);
                    ui.position.left = 0;
                }
  
               element.onElementDragStop({left:ui.position.left - self.operation_start.left, top:ui.position.top - self.operation_start.top});
              },
              'scope': element.options['droppable'],
              'axis': axisDirections
              });
    }

    initContextMenu(element, nativeBorderRef) {
        let self = this;
        nativeBorderRef.bind('contextmenu', function(e) {
            e.preventDefault();

            // hide all editable fields
            self.hideAllEditable();


            // diagram should select which context menu to show
            self.diagram.showContextMenu(element, null /* sub-element */, e.pageX , e.pageY);
          })
    }

    initMouseEvents(element, nativeBorderRef) {
        let self = this;

        element.nativeRef
        .click(self, function(event) {
          self.diagram.onMouseClick(element);
          event.stopPropagation();
  
          // Hide previous references
          self.hideAllRefs();
        })       
        .mouseenter(self, function (event){
          if (!element.options.selected && !element.highlighted) {
            element.highlighted = true;
            var $bw = $('#' + this.id +'_Border').css({'border-width':'3px'});
            var bw = $bw.css('border-left-width');
            $bw.css({left:'-=' + bw, top:'-='+bw});
          }

          self.diagram.onMouseEnter(element);
        })
        .mouseleave(self, function (event){
          if (!element.options.selected && element.highlighted) {
            var $bw = $('#' + self.euid +'_Border');
            var bw = $bw.css('border-left-width');
            $bw.css({'border-width':'0px'}).css({left:'+=' + bw, top:'+='+bw});
            element.highlighted = false;
          }

          self.diagram.onMouseLeave(element);
          self.toggleElementRefs(element, false);
        })
    }

    toggleElementRefs(element, isShow) {
      
      $('#' + this.id +'_REF').css({'visibility':'hidden'});
      $('#' + element.euid +'_REF').css({'visibility': (isShow ? 'visible': 'hidden')});
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

}

export { EditorRenderer }