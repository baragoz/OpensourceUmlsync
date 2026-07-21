import { loadDiagramInto, elementSize } from "./viewer-loader.js";
import {
  mediumClassDiagram,
  smallPackageDiagram,
  largeClassDiagram,
} from "./sample-diagrams.js";

const tabs = [
  { id: "tab-class", panel: "panel-class", target: "#diagram-class", json: mediumClassDiagram, loaded: false },
  { id: "tab-package", panel: "panel-package", target: "#diagram-package", json: smallPackageDiagram, loaded: false },
  { id: "tab-large", panel: "panel-large", target: "#diagram-large", json: largeClassDiagram, loaded: false },
];

function activate(tab) {
  tabs.forEach((t) => {
    document.getElementById(t.id).classList.toggle("active", t === tab);
    document.getElementById(t.panel).classList.toggle("active", t === tab);
  });

  // Lazy-create the viewer the first time a tab is shown: creating a
  // DiagramViewer inside a display:none panel would size it against a
  // zero-width/zero-height container, so each diagram is only loaded once
  // its panel is actually visible.
  if (!tab.loaded) {
    tab.loaded = true;
    loadDiagramInto(tab.target, tab.json, elementSize(tab.target));
  }
}

tabs.forEach((tab) => {
  document.getElementById(tab.id).addEventListener("click", () => activate(tab));
});

activate(tabs[0]);
