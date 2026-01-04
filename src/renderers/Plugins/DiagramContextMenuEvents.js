class DiagramContextMenuEvents {
    constructor(diagram, blackboard) {
        this.init(diagram, blackboard);
    }

    //
    // Trigger context menu events
    //
    init(iDiagram, blackboard) {
        $("#" + iDiagram.euid + ".us-diagram")
        .bind('contextmenu', function(e) {
            if (iDiagram.highlightedConnector) {
              blackboard.notify("connector:contextmenu", iDiagram.highlightedConnector, 
                { 
                  x: e.pageX,
                  y: e.pageY,
                  left: e.offsetX,
                  top: e.offsetY
                });
            } else {
              blackboard.notify("diagram:contextmenu", iDiagram, {
                x: e.pageX,
                y: e.pageY
              });
            }

            console.log("DATA1 : ", e);
            // Do not propagate menu request
            e.preventDefault();
            e.stopPropagation();

          });
    }
}

export { DiagramContextMenuEvents }