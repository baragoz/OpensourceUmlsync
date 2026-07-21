//
// Addon - DROPPABLE cleanup
// Detaches a droppable element from its parent's droplist (and vice versa)
// when either side is removed from the diagram. Drag-stop nesting/z-index
// logic itself lives on the diagram classes (BaseDiagram.handleElementDragStop
// and its per-diagram overrides), not here.
//
class DiagramDroppableElement {
    constructor(diagram, blackboard) {
        this.diagram = diagram;
        this.init(blackboard);
    }

    init(blackboard) {
        blackboard.addEventListener('element:before:remove', this.onElementRemove.bind(this));
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
        else if (element.options.acceptdrop && element.droplist) {
            //
            // Removed parent element. now let's detach all dropped elememnts
            //
            for (let x in element.droplist) {
                this.#elementDetachParent(element.droplist[x]);
            }
        }
    }
}

export { DiagramDroppableElement }
