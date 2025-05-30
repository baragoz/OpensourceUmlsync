class IDiagramObserver {
  constructor() {}


  onAddDiagram(diagram) {}
  onAddConnector(connector) {}
  onAddElement(element) {}

  onRemoveDiagram(diagram) {}
  onRemoveConnector(connector) {}
  onRemoveElement(element) {}
}

export {IDiagramObserver}