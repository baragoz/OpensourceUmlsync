class IconMenuBuilder {
    isEnabled = true;
    constructor(diagram) {
      this.diagram = diagram;
    }

    load(elementType) {
      // Make a stub for element type
    }
  
    show(element) {
      if (!this.isEnabled) {
        return;
      }
      // show context menu for element
    }
  
    hide(element, subelement) {
      // hide
    }

    enable() {
        this.isEnabled = true;
    }

    //
    // Stop showing menus by show request
    //
    disable() {
        this.isEnabled = false;
        // TODO: Hide currently visible element
    }
  }
  
  export {IconMenuBuilder}