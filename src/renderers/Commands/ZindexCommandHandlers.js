import { BaseDiagram } from "../../diagrams/BaseDiagram";
import { BaseElement } from "../../elements/BaseElement";

/**
 *
 * @param {BaseElement} element
 * @param {*} data
 */
function zindexBackCommandHandler(element, data) {
  if (element) {
    /**
     * @type {BaseDiagram} diagram;
     */
    const diagram = element.diagram;
    element._setOption("z-index", diagram.getNextZIndex(false));
  }
}

/**
 *
 * @param {BaseElement} element
 * @param {*} data
 */
function zindexFrontCommandHandler(element, data) {
  if (element) {
    /**
     * @type {BaseDiagram} diagram;
     */
    const diagram = element.diagram;
    element._setOption("z-index", diagram.getNextZIndex());
  }
}

export { zindexBackCommandHandler, zindexFrontCommandHandler };
