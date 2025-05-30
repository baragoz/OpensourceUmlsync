class ElementContextMenu {
  //
  // Could be active on editmode change, it is up to conext menu build
  // what to show in edit/view mode
  //
    constructor(element, nativeBorderRef, blackboard) {
        this.init(element, nativeBorderRef, blackboard);

      }
  
      //
      // Add element's context menu catcher
      //
      init(element, nativeBorderRef, blackboard) {
        let self = this;
        nativeBorderRef.bind('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();

            console.log("GOE CONTEEXT MENU:", e);

            // hide all editable fields
            // self.hideAllEditable();

            blackboard.notify("element:contextmenu", element, {x: e.pageX, y: e.pageY});


            // diagram should select which context menu to show
            // self.diagram.showContextMenu(element, null /* sub-element */, e.pageX , e.pageY);
          });
      }
}

export { ElementContextMenu }