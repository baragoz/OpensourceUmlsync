class DiagramScroll {
    constructor(diagram, blackboard) {
      this.init(diagram, blackboard);
      this.previousTime = new Date();
    }

    //
    // Trigger re-draw on scroll
    //
    init(iDiagram, blackboard) {
        $("#" + iDiagram.euid + ".us-diagram").scroll(function(a, b) {
            // May be it is possible to get a scroll start only event
            // but let's keep the current implementation for a while
            let currentTime = new Date();
            if (currentTime - this.previousTime > 1000) {
              blackboard.notify("diagram:scroll:start");
            }

            this.previousTime = currentTime;
            iDiagram.draw();
        });
    }
}

export { DiagramScroll }