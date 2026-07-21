import { loadDiagramInto, elementSize } from "./viewer-loader.js";
import { smallPackageDiagram, mediumClassDiagram } from "./sample-diagrams.js";

// #diagram-1 and #diagram-3 load the *same* diagram model twice, at
// different points in the article. Each call still gets a fresh JSON.parse
// and a distinct viewer id (see loadDiagramInto), which is what should keep
// the two instances from colliding in the DOM.
function load(selector, jsonString) {
  loadDiagramInto(selector, jsonString, elementSize(selector));
}

load("#diagram-1", smallPackageDiagram);
load("#diagram-2", mediumClassDiagram);
load("#diagram-3", smallPackageDiagram);
