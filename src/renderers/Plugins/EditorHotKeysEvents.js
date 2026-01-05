import configLoader from '../../utils/ConfigLoader';

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
      this.handleSelectAll();
      return;
    }

    // Handle Ctrl+X (Cut)
    if (ctrlKey && key === 'x') {
      event.preventDefault();
      event.stopPropagation();
      this.handleCut();
      return;
    }

    // Handle Ctrl+C (Copy)
    if (ctrlKey && key === 'c') {
      event.preventDefault();
      event.stopPropagation();
      this.handleCopy();
      return;
    }

    // Handle Ctrl+V (Paste)
    if (ctrlKey && key === 'v') {
      event.preventDefault();
      event.stopPropagation();
      this.handlePaste();
      return;
    }

    // Handle Delete key
    if (key === 'delete' || key === 'backspace') {
      // Only prevent default if an element is selected
      if (this.hasSelectedElement()) {
        event.preventDefault();
        event.stopPropagation();
        this.handleDelete();
      }
      return;
    }

    // Handle Ctrl+Z (Undo)
    if (ctrlKey && key === 'z' && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      this.handleUndo();
      return;
    }

    // Handle Ctrl+Y or Ctrl+Shift+Z (Redo)
    if ((ctrlKey && key === 'y') || (ctrlKey && key === 'z' && event.shiftKey)) {
      event.preventDefault();
      event.stopPropagation();
      this.handleRedo();
      return;
    }
  }

  handleSelectAll() {
    // Post select all command to blackboard
    this.blackboard.notify('hotkey:selectall', this.diagram);
    this.diagram.selectAll();
  }

  handleCut() {
    const selectedElement = this.getSelectedElement();
    if (selectedElement) {
      configLoader.executeCommand('command:element:cut', selectedElement, null);
    }
  }

  handleCopy() {
    const selectedElement = this.getSelectedElement();
    if (selectedElement) {
      configLoader.executeCommand('command:element:copy', selectedElement, null);
    }
  }

  handlePaste() {
    // Paste command expects diagram as first parameter
    configLoader.executeCommand('command:diagram:paste', this.diagram, null);
  }

  handleDelete() {
    const selectedItem = this.getSelectedItem();
    if (selectedItem) {
      // Check if it's a connector or element
      if (selectedItem.constructor.name === 'BaseConnector') {
        configLoader.executeCommand('command:connector:remove', selectedItem, null);
      } else {
        configLoader.executeCommand('command:element:remove', selectedItem, null);
      }
    }
  }

  handleUndo() {
    // Post undo command to blackboard or execute if command exists
    this.blackboard.notify('hotkey:undo', this.diagram);
    // Optionally try to execute command if registered
    // configLoader.executeCommand('command:undo', this.diagram, null);
  }

  handleRedo() {
    // Post redo command to blackboard or execute if command exists
    this.blackboard.notify('hotkey:redo', this.diagram);
    // Optionally try to execute command if registered
    // configLoader.executeCommand('command:redo', this.diagram, null);
  }

  getSelectedItem() {
    // Get the first selected item from the diagram (can be element or connector)
    if (this.diagram && this.diagram.selectedItems && this.diagram.selectedItems.length > 0) {
      return this.diagram.selectedItems[0];
    }
    return null;
  }

  getSelectedElement() {
    // Get the first selected element (filter out connectors)
    const selectedItem = this.getSelectedItem();
    // Check if it's an element (not a connector)
    if (selectedItem && selectedItem.constructor.name !== 'BaseConnector') {
      return selectedItem;
    }
    return null;
  }

  hasSelectedElement() {
    return this.getSelectedItem() !== null;
  }

  // Cleanup method to unbind events when plugin is destroyed
  destroy() {
    $(document).off('keydown.' + this.diagram.euid);
  }
}

export { EditorHotKeysEvents };

