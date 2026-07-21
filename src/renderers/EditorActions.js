import configLoader from '../utils/ConfigLoader';

//
// Public editor action surface. Hotkey managers (default or custom) should
// call into these instead of dispatching commands directly, so any other
// trigger (toolbar button, context menu, a user-supplied hotkey manager)
// gets the exact same behavior for free.
//
// Every action re-checks edit mode itself, independent of whatever gated
// the call that reached it.
//

function isEditMode(diagram) {
  const blackboard = diagram && diagram.getUserData("blackboard");
  return !!(blackboard && blackboard.getStorageValue("editmode"));
}

function getSelectedItem(diagram) {
  if (diagram && diagram.selectedItems && diagram.selectedItems.length > 0) {
    return diagram.selectedItems[0];
  }
  return null;
}

function getSelectedElement(diagram) {
  const selectedItem = getSelectedItem(diagram);
  if (selectedItem && selectedItem.constructor.name !== 'BaseConnector') {
    return selectedItem;
  }
  return null;
}

function selectAll(diagram) {
  if (!isEditMode(diagram)) {
    return;
  }
  diagram.selectAll();
}

function copy(diagram) {
  if (!isEditMode(diagram)) {
    return;
  }
  const selectedElement = getSelectedElement(diagram);
  if (selectedElement) {
    configLoader.executeCommand('command:element:copy', selectedElement, null);
  }
}

function cut(diagram) {
  if (!isEditMode(diagram)) {
    return;
  }
  const selectedElement = getSelectedElement(diagram);
  if (selectedElement) {
    configLoader.executeCommand('command:element:cut', selectedElement, null);
  }
}

function paste(diagram, data) {
  if (!isEditMode(diagram)) {
    return;
  }
  configLoader.executeCommand('command:diagram:paste', diagram, data);
}

function deleteSelection(diagram) {
  if (!isEditMode(diagram)) {
    return;
  }
  const selectedItem = getSelectedItem(diagram);
  if (!selectedItem) {
    return;
  }
  if (selectedItem.constructor.name === 'BaseConnector') {
    configLoader.executeCommand('command:connector:remove', selectedItem, null);
  } else {
    configLoader.executeCommand('command:element:remove', selectedItem, null);
  }
}

function undo(diagram) {
  if (!isEditMode(diagram)) {
    return;
  }
  if (diagram.opman) {
    diagram.opman.undo();
  }
  const blackboard = diagram.getUserData("blackboard");
  if (blackboard) {
    blackboard.notify('hotkey:undo', diagram);
  }
}

function redo(diagram) {
  if (!isEditMode(diagram)) {
    return;
  }
  if (diagram.opman) {
    diagram.opman.redo();
  }
  const blackboard = diagram.getUserData("blackboard");
  if (blackboard) {
    blackboard.notify('hotkey:redo', diagram);
  }
}

const EditorActions = {
  isEditMode,
  getSelectedItem,
  getSelectedElement,
  selectAll,
  copy,
  cut,
  paste,
  deleteSelection,
  undo,
  redo
};

export { EditorActions };
