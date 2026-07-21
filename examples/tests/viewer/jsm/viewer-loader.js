import UMLSync from "umlsync";

//
// Every DiagramViewer instance derives its DOM id prefix from
// options.id (see DiagramViewer's constructor: this.prefix = "e" + options.id).
// Two instances that don't get distinct ids collide in the DOM, which is
// exactly what test case 4 (duplicate diagram in an article) checks for.
//
let nextViewerId = 1;

export function elementSize(selector) {
  const $el = $(selector);
  return { width: $el.width(), height: $el.height() };
}

export function loadDiagramInto(selector, jsonString, viewerOptions = {}, loadOptions = {}) {
  const viewer = new UMLSync.DiagramViewer(selector, {
    id: nextViewerId++,
    ...viewerOptions,
  });

  // Parse a fresh copy per call: loadDiagram() mutates the model it is given
  // (it writes an "id" onto it), so sharing one parsed object across two
  // viewer instances would let one call's mutation bleed into the other.
  const model = JSON.parse(jsonString);
  viewer.loadDiagram(model, { editmode: false, ...loadOptions });

  return viewer;
}
