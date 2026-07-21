class ElementDraggable {
  constructor(element, nativeBorderRef, blackboard) {
    this.element = element;
    this.diagram = element.diagram;
    this.init(element, nativeBorderRef, blackboard);
    blackboard.addEventListener(
      'storage:editmode', this.onEditModeChange.bind(this));
  }

  //
  // Add element's resizeable options
  //
  init(element, nativeBorderRef, blackboard) {
    //
    // Check element has a DND limitations
    //
    const axisDirections = element.options['axis'] || false;

    this.diagram = element.diagram;

    // Keep ref on self
    let self = this;


    // Make element draggable
    nativeBorderRef.draggable({
      // to prevent jumping of element on resize start
      'containment': "#" + self.diagram.euid,
      'grid': [2, 2],
      'scroll': true,
      'start': function (event, ui) {
        console.log("ElementDraggable START callback called", {
          elementEuid: element.euid,
          dropHelper: self.diagram.dropHelper
        });
        self.operation_start = { left: ui.position.left, top: ui.position.top };
        //
        // drop helper - create uml element directly from connector type icons menu above element 
        //
        if (self.diagram.dropHelper) {
          console.log("START: dropHelper is set! Creating connector and returning early", element.euid);
          self.diagram.Connector(self.diagram.dropHelper, {
            epoints: [
              { x: 0, y: 0, euid: element.euid },
              { x: 100, y: 100, euid: "ConnectionHelper" }
            ]
          });
          console.log("START: About to return early - drag should still proceed");
          return;
        }

        // Notify element
        self.diagram.onElementDragStart(element, ui);

        // broadcast
        blackboard.notify("element:drag:start", element);
      },
      'drag': function (event, ui) {
        // re-draw connectors
        self.diagram.draw();

        // do nothing if element is helper icon
        if (self.diagram.dropHelper) {
          return;
        }

        // TODO: what a hack is it ?? May be test automation ?
        if (element.$moveit != undefined) {
          $("#" + element.$moveit).css("left", 200);
        }
        self.diagram.onElementDragMove(element,
          {
            left: ui.position.left - self.operation_start.left,
            top: ui.position.top - self.operation_start.top
          });
      },
      'stop': function (event, ui) {
        console.log("ElementDraggable STOP callback called", {
          elementEuid: element.euid,
          dropHelper: self.diagram.dropHelper,
          position: { left: ui.position.left, top: ui.position.top }
        });

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

        // Notify diagram on drag stop to
        // stop multiple elements DND process.
        self.diagram.onElementDragStop(element,
          {
            left: ui.position.left - self.operation_start.left,
            top: ui.position.top - self.operation_start.top
          });

        element._update();
        // Notify another plugins ....
        blackboard.notify("element:drag:stop", element);
      },
      'scope': element.options['droppable'],
      'axis': axisDirections
    });
  }

  onEditModeChange(change) {
    this.element.nativeBorderRef.draggable(change.newValue ? "enable" : "disable");
  }
}

export { ElementDraggable }