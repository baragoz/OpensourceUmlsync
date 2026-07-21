import { loadDiagramInto, elementSize } from "./viewer-loader.js";
import { largeClassDiagram } from "./sample-diagrams.js";

// The diagram model is 1595x918 — deliberately larger than the fixed box
// below, so the diagram area has to scroll.
const size = elementSize("#diagram-target");
loadDiagramInto("#diagram-target", largeClassDiagram, size);
