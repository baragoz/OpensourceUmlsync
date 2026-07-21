import { ClassElement } from "../../UMLSync.Core";
import { ClassExtras } from "../Plugins/ClassExtras";

/**
 * Retrieves the ClassExtras instance associated with a ClassElement.
 * @param {ClassElement} element - The ClassElement instance.
 * @returns {ClassExtras|null} - The ClassExtras instance, or null if not found.
 */
function getClassExtra(element) {
  if (element) {
    return element.getUserData("plugin-element-class-extra");
  }
  return null;
}

/**
 * Adds a field to a class element.
 * @param {ClassElement} element - The ClassElement instance.
 * @param {object} data - The data containing field information.
 */
function classAddFieldCommandHandler(element, data = {}) {
  // When user click on class menu, there is no information about index
  // we need to add it, but when user click on concreate attribute
  // index=1 should be overwritten
  let extraData = { index: 0, title: "New Attribute", ...data };
  let extra = getClassExtra(element);
  if (extra) {
    extra.onAddAttribute(extraData);
  }
}

function classEditFieldCommandHandler(element, data) {
  let extra = getClassExtra(element);
  if (extra) {
    extra.onEditAttribute(data);
  }
}

function classRemoveFieldCommandHandler(element, data) {
  // notify to refresh sortable, if needed
  let extra = getClassExtra(element);
  if (extra) {
    extra.onRemoveAttribute(data);
  }
}

function classAddMethodCommandHandler(element, data = {}) {
  //
  // data contain click coordinates like left, top
  // but we do not need them
  //
  let extraData = { index: 0, title: "New Operation", ...data };
  let extra = getClassExtra(element);
  if (extra) {
    extra.onAddOperation(extraData);
  }
}

function classEditMethodCommandHandler(element, data) {
  let extra = getClassExtra(element);
  if (extra) {
    extra.onEditOperation(data);
  }
}

function classRemoveMethodCommandHandler(element, data) {
  // Refresh sortable, if needed
  let extra = getClassExtra(element);
  if (extra) {
    extra.onRemoveOperation(data);
  }
}

export {
  // UI input requered
  classAddMethodCommandHandler,
  classEditMethodCommandHandler,
  classAddFieldCommandHandler,
  classEditFieldCommandHandler,
  // No ui changes needed, just remove sortable element ???
  classRemoveMethodCommandHandler,
  classRemoveFieldCommandHandler,
};
