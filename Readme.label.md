# Bug: "Add Label" on connector shows nothing

## Symptom

Right-click a connector → "Add Label" in the context menu → nothing appears
on screen. No label, no editable input field, no visible error to the user.

## Root cause

`BaseConnector.addLabel()` in
[src/connectors/BaseConnector.js:261-296](src/connectors/BaseConnector.js#L261-L296)
calls `this.getRandomSuffix()` on line 273:

```js
addLabel(opt) {
  opt.id = opt.id || this.diagram.getNextUniqueId();
  opt.prefix = this.options.prefix + "l" + opt.id;
  opt.zIndex = 19999;

  // uniqie label name to simplify revert editable
  let leuid = opt.prefix + "_" + this.getRandomSuffix();   // <-- throws

  var $item = $('<div ...>...</div>')
    .appendTo("#" + this.diagram.euid)   // <-- never reached
    ...
```

`getRandomSuffix` is not defined anywhere — not on `BaseConnector`, not on
its parent `BaseDiagramItem` (`src/core/BaseDiagramItem.js`), not anywhere
else in `src/`. It has apparently never existed (present since the initial
commit).

Calling it throws `TypeError: this.getRandomSuffix is not a function`
immediately, before the label `<div>` is built or appended to the diagram
DOM.

### Why the error is invisible

The full call chain is:

1. Context menu item ("Add Label") →
   [src/assets/configs/contextmenu/common.json:129-135](src/assets/configs/contextmenu/common.json#L129-L135),
   handler `command:connector:add_label`.
2. `EditorContextMenu.loadMenu()` click handler
   ([src/renderers/Plugins/EditorContextMenu.js:147](src/renderers/Plugins/EditorContextMenu.js#L147))
   calls `configLoader.executeCommand(...)`.
3. `ConfigLoader.executeCommand`
   ([src/utils/ConfigLoader.js:165-187](src/utils/ConfigLoader.js#L165-L187))
   wraps the handler in `try { f(...) } finally { opman.commit() }` — no
   `catch`, so the exception propagates up uncaught into the browser
   console instead of being reported anywhere in the UI.
4. → `addConnectorLabelCommandHandler`
   ([src/renderers/Commands/ConnectorCommandHandler.js:21-24](src/renderers/Commands/ConnectorCommandHandler.js#L21-L24))
   → `ConnectorLabels.onAddLabel()`
   ([src/renderers/Plugins/ConnectorLabels.js:49-61](src/renderers/Plugins/ConnectorLabels.js#L49-L61))
   → `BaseConnector.addLabel()` — crashes on line 273.

Because the crash happens before `$item` is created, nothing is appended to
`#<diagram.euid>`, `this.labels.push($item)` never runs, and
`#makeLabelInteractive(euid)` (which wires up drag/editable/context-menu
behavior on the new label) is never called either. That matches the
reported symptom exactly: the menu itself works, but the click silently
does nothing visible.

Note: the label DOM/CSS itself is fine — `.us-connector-label` styling in
`src/assets/css/base.css:885-893` is correct and not implicated. This is a
pure JS crash bug, not a rendering/CSS issue.

## Fix plan

1. **Add the missing method.** Add `getRandomSuffix()` to `BaseConnector`
   (or `BaseDiagramItem` if other subclasses may need it later — but scope
   it to `BaseConnector` unless proven otherwise, per YAGNI). Simplest
   correct implementation:

   ```js
   getRandomSuffix() {
     return Math.random().toString(36).slice(2, 8);
   }
   ```

   Alternative: since `opt.id` returned by `this.diagram.getNextUniqueId()`
   is already unique per diagram at this point, the suffix may be
   redundant — consider just dropping it and using `opt.prefix` alone as
   `leuid`, unless the "revert editable" comment on line 272 implies a
   collision scenario (e.g. re-adding a label with the same id after
   delete/undo) that specifically needs the extra randomness. Verify by
   reading how `leuid` is used downstream (`#makeLabelInteractive`,
   `.editable()` cleanup) before deciding.

2. **Harden `ConfigLoader.executeCommand`** so a thrown error in one
   command handler doesn't fail silently for users: change
   `try { f(...) } finally { opman.commit() }` to also `catch` and
   surface/log the error (e.g. `console.error` at minimum, or a toast if
   the app has one). This is a defensive fix for the *class* of bug (any
   future context-menu command that throws will otherwise fail silently
   the same way) — separate concern from item 1, do only if in scope.

3. **Verify the rest of the flow works once unblocked.** After fixing
   `getRandomSuffix`, manually test:
   - Right-click a connector → Add Label → label `<div>` appears at
     `data.left + offset.left + 30`, `data.top + offset.top + 10` with
     placeholder text "Add some ...".
   - Label is draggable/editable via `#makeLabelInteractive` →
     `.editable()` plugin (`src/assets/js/jquery.editable.js`) — click
     into it and confirm an editable input/contenteditable appears and
     text can be changed and submitted.
   - Label persists in `this.jsonModel.labels` (check save/reload of the
     diagram keeps the label).
   - Removing the connector / undo also removes the label correctly
     (`rmLabel`, right below `addLabel` in the same file).

4. **Regression check**: search for any other unused/undefined method
   references in `BaseConnector.js` and sibling connector files
   (`grep -rn "this\.[a-zA-Z]*(" src/connectors/`) in case this class of
   bug (dead call to a never-implemented method) exists elsewhere too.

## Files involved

- `src/connectors/BaseConnector.js` (the fix — add `getRandomSuffix`)
- `src/utils/ConfigLoader.js` (optional: error surfacing hardening)
- `src/renderers/Plugins/ConnectorLabels.js` (no change expected, but
  re-verify `onAddLabel`/`#makeLabelInteractive` once unblocked)
- `src/assets/configs/contextmenu/common.json` (no change; context menu
  wiring is correct)
