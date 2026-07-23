//
// Contract for a name-completion provider, editor-wide (like styleManager,
// not per-diagram). Pass an instance implementing this contract as the
// `completionProvider` option to DiagramEditor, or register one later via
// `editor.registerCompletionProvider(provider)`.
//
// Wired into every element's name-like field (anything rendered with class
// "editablefield" - class/package/component name, etc, see
// ElementEditable.js) and connector labels (see ConnectorLabels.js) through
// jquery.editable.js's existing `onAutocomplete` hook, which feeds the
// returned list straight into jQuery UI's `.autocomplete()` widget - so
// getSuggestions() must be synchronous and return the full candidate list;
// prefix filtering/highlighting/keyboard nav is handled by that widget, not
// by this contract.
//
class ICompletionProvider {
  constructor() {}

  /**
   * @param {{ key: string, elementType: string, currentValue: string }} context
   *   key - the jsonModel field being edited (usually "name"; "label" for
   *     connector labels).
   *   elementType - the element's nameTemplate (e.g. "class", "package"),
   *     or the connector's nameTemplate when key is "label".
   *   currentValue - the field's value before this edit started.
   * @returns {string[]} candidate values, unfiltered - the autocomplete
   *   widget matches them against what the user types.
   */
  getSuggestions(context) {
    throw new Error("ICompletionProvider.getSuggestions() not implemented");
  }
}

export { ICompletionProvider };
