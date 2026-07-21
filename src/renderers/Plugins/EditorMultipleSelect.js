class EditorMultipleSelect {
  constructor(diagram, blackboard) {
    this.diagram = diagram;

    // subscribe for events
    this.init(diagram, blackboard);
  }

  //
  // Add common icon menu for diagram
  //
  init(diagram, blackboard) {
    //
    // TODO: Preload config data
    //
    // Hide menu on regular click
    this.blackboard.addEventListener("diagram:click", this.onCancel.bind(this));
    this.blackboard.addEventListener(
      "connector:click",
      this.onCancel.bind(this),
    );
    this.blackboard.addEventListener(
      "element:click",
      this.onElementClick.bind(this),
    );

    // Hide menu on element resize
    this.blackboard.addEventListener(
      "element:resize:start",
      this.onCancel.bind(this),
    );

    // Hide menu on drag start
    this.blackboard.addEventListener(
      "element:drag:start",
      this.onElementDragStart.bind(this),
    );
    this.blackboard.addEventListener(
      "connector:drag:start",
      this.onConnectorDragStart.bind(this),
    );
  }

  onElementClick(element, data) {}

  onElementDragStart(element, dragData) {}

  onConnectorDragStart(element, dragData) {}

  // Cancel multyselection
  onCancel() {}
}

export { EditorMultipleSelect };
