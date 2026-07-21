import { EditorActions } from '../EditorActions';

//
// Default hotkey manager: maps keydown combinations to EditorActions calls.
// Carries no action logic of its own - see EditorActions for the actual
// select all / copy / cut / paste / delete / undo / redo behavior. A custom
// hotkey manager (see EditorPluginManager's `hotKeyManager` option) can
// follow the same pattern against the same actions.
//
class EditorHotKeysEvents {
  constructor(diagram, blackboard, editorConfig) {
    this.diagram = diagram;
    this.blackboard = blackboard;
    this.editorConfig = editorConfig;

    this.init();
  }

  //
  // Initialize hotkey event listeners
  //
  init() {
    // Check edit mode state
    this.isEditMode = this.blackboard.getStorageValue("editmode");
    this.blackboard.addEventListener(
      'storage:editmode', this.onEditModeChange.bind(this));

    // Bind keyboard events to the diagram element
    // Use keydown event to catch key combinations
    $(document).on('keydown.' + this.diagram.euid, this.onKeyDown.bind(this));
  }

  onEditModeChange(change) {
    if (this.isEditMode == change.newValue) {
      // nothing changed
      return;
    }
    this.isEditMode = change.newValue;
  }

  onKeyDown(event) {
    // Only process hotkeys in edit mode
    if (!this.isEditMode) {
      return;
    }

    // Check if we're focused on the diagram or its elements
    // Prevent hotkeys when typing in input fields or text areas
    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const ctrlKey = event.ctrlKey || event.metaKey; // Support both Ctrl (Windows/Linux) and Cmd (Mac)
    const key = event.key.toLowerCase();

    // Handle Ctrl+A (Select All)
    if (ctrlKey && key === 'a') {
      event.preventDefault();
      event.stopPropagation();
      this.blackboard.notify('hotkey:selectall', this.diagram);
      EditorActions.selectAll(this.diagram);
      return;
    }

    // Handle Ctrl+X (Cut)
    if (ctrlKey && key === 'x') {
      event.preventDefault();
      event.stopPropagation();
      EditorActions.cut(this.diagram);
      return;
    }

    // Handle Ctrl+C (Copy)
    if (ctrlKey && key === 'c') {
      event.preventDefault();
      event.stopPropagation();
      EditorActions.copy(this.diagram);
      return;
    }

    // Handle Ctrl+V (Paste)
    if (ctrlKey && key === 'v') {
      event.preventDefault();
      event.stopPropagation();
      EditorActions.paste(this.diagram);
      return;
    }

    // Handle Delete key
    if (key === 'delete' || key === 'backspace') {
      // Only prevent default if an element is selected
      if (EditorActions.getSelectedItem(this.diagram)) {
        event.preventDefault();
        event.stopPropagation();
        EditorActions.deleteSelection(this.diagram);
      }
      return;
    }

    // Handle Ctrl+Z (Undo)
    if (ctrlKey && key === 'z' && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      EditorActions.undo(this.diagram);
      return;
    }

    // Handle Ctrl+Y or Ctrl+Shift+Z (Redo)
    if ((ctrlKey && key === 'y') || (ctrlKey && key === 'z' && event.shiftKey)) {
      event.preventDefault();
      event.stopPropagation();
      EditorActions.redo(this.diagram);
      return;
    }
  }

  // Cleanup method to unbind events when plugin is destroyed
  destroy() {
    $(document).off('keydown.' + this.diagram.euid);
  }
}

export { EditorHotKeysEvents };
