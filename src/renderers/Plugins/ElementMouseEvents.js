import { BaseDiagram } from "../../diagrams/BaseDiagram";

class ElementMouseEvents {
    constructor(element, nativeBorderRef, blackboard) {
        this.init(element, nativeBorderRef, blackboard);
      }
  
      //
      // Add element's context menu catcher
      //
      init(element, nativeBorderRef, blackboard) {
        let self = this;

        nativeBorderRef
        .click(self, function(event) {
          element.diagram.onMouseClick(element, event);
         
          blackboard.notify("element:click", element);

          event.stopPropagation();
        })       
        .mouseenter(self, function (event) {
          /*
          if (!element.options.selected && !element.highlighted) {
            element.highlighted = true;
            var $bw = $('#' + this.id +'_Border').css({'border-width':'3px'});
            var bw = $bw.css('border-left-width');
            $bw.css({left:'-=' + bw, top:'-='+bw});
          }
          */

          element.diagram.onMouseEnter(element);
          blackboard.notify("element:mouse:enter", element);
        })
        .mouseleave(self, function (event) {
          /*
          if (!element.options.selected && element.highlighted) {
            var $bw = $('#' + self.euid +'_Border');
            var bw = $bw.css('border-left-width');
            $bw.css({'border-width':'0px'}).css({left:'+=' + bw, top:'+='+bw});
            element.highlighted = false;
          }
            */

          element.diagram.onMouseLeave(element);
          blackboard.notify("element:mouse:leave", element);
          // self.toggleElementRefs(element, false);
        });
      }
}

export { ElementMouseEvents }