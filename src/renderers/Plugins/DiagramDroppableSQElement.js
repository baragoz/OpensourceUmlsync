//
// Addon - DROPPABLE
// Allow to drop some elements on diagram, like classes or methods or packages
//
class DiagramDroppableSQElement {
    constructor(diagram, blackboard) {
        this.diagram = diagram;
        this.init(blackboard);
    }

    //
    // Trigger context menu events
    //
    init(blackboard) {
        blackboard.addEventListener('element:drag:stop', this.onElementDragStop.bind(this));
        blackboard.addEventListener('element:before:remove', this.onElementRemove.bind(this));
        blackboard.addEventListener('connector:drag:stop', this.onConnectorTransformEnd.bind(this));
    }

    #elementDetachParent(element) {
        if (element.parent && element.parent.droplist) {
          const rmIdx = element.parent.droplist.indexOf(element);
          // Detach element from previous parent
          if (rmIdx >= 0) {
            element.parent.droplist.splice(rmIdx, 1);
          }
        }
        element.parent = null;
    }

    onElementRemove(element) {
        //
        // Removed droppable element
        //
        if (element.options.droppable) {
            this.#elementDetachParent(element);
        }
        else if (element.options.accepdrop && element.droplist) {
            //
            // Removed parent element. now let's detach all dropped elememnts
            //
            for (let x in element.droplist) {
                this.#elementDetachParent(element.droplist[x]);
            }
        }
    }

    onElementDragStop(element) {
        // TODO: check for multiple selection

        if (element.options.droppable) {
            const parent = this.diagram.checkDroppableElement(element);
            if (parent) {
                const pz = parent.jsonModel['z-index'];
                const ez = element.jsonModel['z-index'];
                // parent on top of element
                if (pz > ez) {
                    parent._setOption('z-index', ez);
                    element._setOption('z-index', pz);
                }
            }

            if (element.parent != parent) {
                this.#elementDetachParent(element);
                if (parent) { // it could be null, when user pull out element
                  parent.droplist = parent.droplist || [];
                  parent.droplist.push(element);
                  element.parent = parent;
                }
            }

            // Re-align model after DND, otherwise user could place it anyway
            // inside parent element, after drop it first time
            if (parent) {
                  // middle of element + middle of parent
                  const align = parent.jsonModel.left + parent.jsonModel.width/2 - element.jsonModel.width/2;
                  element.nativeBorderRef.css('left', align);
                  element.jsonModel.left = align;
            }
        }
    }

    onConnectorTransformEnd(connector) {
        // Check end points
    }
}

export { DiagramDroppableSQElement }