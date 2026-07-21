import { loadDiagramInto } from "./viewer-loader.js";
import { mediumClassDiagram } from "./sample-diagrams.js";

// No width/height passed in viewer options at all — DiagramViewer should
// fall back to its own internal default (1000x500) and resize
// #diagram-target to that, without the caller having to size it.
loadDiagramInto("#diagram-target", mediumClassDiagram);
