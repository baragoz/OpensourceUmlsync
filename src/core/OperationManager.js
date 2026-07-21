const defaultOptions = {
  maxSize: 100
};

//
// Undo/redo history for a diagram, based on whole-diagram JSON snapshots
// (diagram.getDescription()) rather than per-operation inverse logic.
//
// Usage: bracket a logical user operation with begin()/commit() (nested
// calls collapse into the outermost pair), or use record(fn) for one-shot
// mutations. undo()/redo() rebuild the diagram via
// diagram.restoreFromDescription().
//
class OperationManager {
  constructor(diagram, options = {}) {
    this.diagram = diagram;
    this.options = { ...defaultOptions, ...options };

    this.undoStack = [];
    this.redoStack = [];

    this.pending = null;
    this.depth = 0;
  }

  begin() {
    this.depth++;
    if (this.depth === 1) {
      this.pending = this._snapshot();
    }
  }

  commit() {
    if (this.depth === 0) {
      return;
    }
    this.depth--;
    if (this.depth > 0) {
      return;
    }

    const before = this.pending;
    this.pending = null;

    if (!before) {
      return;
    }

    const after = this.diagram.getDescription();
    if (JSON.stringify(before) === JSON.stringify(after)) {
      // nothing actually changed - do not pollute the history
      return;
    }

    this.undoStack.push(before);
    if (this.undoStack.length > this.options.maxSize) {
      this.undoStack.shift();
    }
    this.redoStack = [];

    this._notify();
  }

  //
  // Convenience wrapper for one-shot mutations with no separate
  // start/stop interaction (e.g. a single property change).
  //
  record(fn) {
    this.begin();
    try {
      fn();
    } finally {
      this.commit();
    }
  }

  undo() {
    if (!this.canUndo()) {
      return;
    }
    const before = this.undoStack.pop();
    this.redoStack.push(this._snapshot());
    this.diagram.restoreFromDescription(before);
    this._notify();
  }

  redo() {
    if (!this.canRedo()) {
      return;
    }
    const after = this.redoStack.pop();
    this.undoStack.push(this._snapshot());
    this.diagram.restoreFromDescription(after);
    this._notify();
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  //
  // getDescription() is only a shallow copy at the top level - nested
  // structures that mutation handlers update in place (e.g. a class
  // element's jsonModel.attributes/operations arrays via Array.splice)
  // are shared with the live model. Anything we keep in the undo/redo
  // stacks must be fully independent of the live model, so deep-clone it.
  //
  _snapshot() {
    return JSON.parse(JSON.stringify(this.diagram.getDescription()));
  }

  _notify() {
    const blackboard = this.diagram.getUserData("blackboard");
    if (blackboard) {
      blackboard.notify("opman:changed", {
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      });
    }
  }
}

export { OperationManager }
