//
// Contract for a system-wide (editor-level, not per-diagram) style manager.
// A "style" is { id, connector: {...}, element: {...} } - see
// PreviewStyleComponent's defaultOptions for the connector/element shape.
//
// Pass a class implementing this contract as the `styleManager` option to
// DiagramEditor to replace the built-in DefaultStyleManager (localStorage-backed).
//
class IStyleManager {
  constructor() {}

  // Read-only, editor-provided presets.
  getSystemStyles() { throw new Error("IStyleManager.getSystemStyles() not implemented"); }

  // Styles saved by the user.
  getUserStyles() { throw new Error("IStyleManager.getUserStyles() not implemented"); }

  // Persist `style` (no id needed - it is generated), returns the new id.
  saveUserStyle(style) { throw new Error("IStyleManager.saveUserStyle() not implemented"); }

  // Returns true if a user style with `id` was found and removed.
  removeUserStyle(id) { throw new Error("IStyleManager.removeUserStyle() not implemented"); }

  // Pinning: keeps a style (system or user, identified by id) at the front
  // of its own list. Pure presentation state - it doesn't move a style
  // between the system/user lists, it only marks it as pinned within
  // whichever list it already belongs to.
  getPinnedStyleIds() { throw new Error("IStyleManager.getPinnedStyleIds() not implemented"); }
  pinStyle(id) { throw new Error("IStyleManager.pinStyle() not implemented"); }
  unpinStyle(id) { throw new Error("IStyleManager.unpinStyle() not implemented"); }

  // The style currently applied to newly created elements/connectors.
  getDefaultStyle() { throw new Error("IStyleManager.getDefaultStyle() not implemented"); }
  setDefaultStyle(style) { throw new Error("IStyleManager.setDefaultStyle() not implemented"); }
}

export { IStyleManager }
