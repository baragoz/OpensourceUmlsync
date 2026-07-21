import { loadDiagramInto } from "./viewer-loader.js";
import { mediumClassDiagram } from "./sample-diagrams.js";

const viewer = loadDiagramInto("#diagram-target", mediumClassDiagram, {
  fitToParent: true,
});

// With fitToParent:true, DiagramViewer re-reads #diagram-target's own
// bounding rect on updateDimention (the width/height passed in are ignored),
// but it never does that on its own — unlike DiagramEditor, DiagramViewer
// has no built-in window-resize subscription. A host page has to call
// setOption itself. Check that resizing the browser window keeps the
// diagram area filling #diagram-target.
window.addEventListener("resize", () => {
  viewer.setOption("dimention", {});
});
