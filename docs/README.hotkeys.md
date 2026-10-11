# Hotkey manager

Status: **implemented** (undo/redo excepted — see below). This document started as a
plan written before implementation; it's now updated to describe what actually
shipped.

## Goal

1. A default hotkey manager (select all, copy/cut/paste/delete selection, undo/redo).
2. A public "editor API" that the hotkey manager calls into — not logic trapped inside
   the key listener — so the same actions are reusable from toolbar buttons, context
   menus, or a user-supplied hotkey manager.
3. All of the above disabled/no-op in view mode (`editmode: false`).
4. A way for a host app to swap in its own hotkey manager instead of the default one.

## What already exists (don't rebuild)

- **A hotkey plugin already implements most of the key handling**:
  [EditorHotKeysEvents.js](src/renderers/Plugins/EditorHotKeysEvents.js) binds
  `keydown` on `document` (namespaced per diagram `euid`), handles
  Ctrl/Cmd+A/X/C/V, Delete/Backspace, Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z, and skips
  `INPUT`/`TEXTAREA`/`contentEditable` targets.
- **Edit/view mode already exists** as `editmode`, set via
  `DiagramEditor.setOption('editmode', value)`
  ([DiagramEditor.js:153](src/core/DiagramEditor.js#L153)), propagated through
  `Blackboard` as `storage:editmode`. `EditorHotKeysEvents` already subscribes to it
  and no-ops when not in edit mode
  ([EditorHotKeysEvents.js:17-19,36-38](src/renderers/Plugins/EditorHotKeysEvents.js#L17)).
- **A command registry already exists**: `configLoader.addCommand()` /
  `executeCommand()` in [ConfigLoader.js:154](src/utils/ConfigLoader.js#L154), backing
  cut/copy/paste/delete/edit handlers in
  [CopyPasteCommandHandlers.js](src/renderers/Commands/CopyPasteCommandHandlers.js),
  registered by `DiagramEditor.#registerDefaultCommand()`
  ([DiagramEditor.js:54](src/core/DiagramEditor.js#L54)). `EditorHotKeysEvents`
  already calls through this registry for cut/copy/paste/delete.
- **Selection model exists**: `BaseDiagram.selectedItems` array, `selectAll()`
  ([BaseDiagram.js:735](src/diagrams/BaseDiagram.js#L735)).

## What's missing today

- `EditorHotKeysEvents.handleCut/handleCopy/handlePaste/handleDelete/handleSelectAll`
  contain the action logic directly, inline in the key handler
  ([EditorHotKeysEvents.js:110-145](src/renderers/Plugins/EditorHotKeysEvents.js#L110)) —
  there's no standalone, importable "editor actions" surface. A custom hotkey manager
  today would have to reimplement this dispatch itself.
- Undo/redo only `blackboard.notify('hotkey:undo'/'hotkey:redo', ...)` — no real
  handler. `src/core/OperationManager.js` exists but is empty.
- `EditorHotKeysEvents` is hard-instantiated, unconditionally, in
  `EditorPluginManager.onAddDiagram`
  ([EditorPluginManager.js:106](src/renderers/EditorPluginManager.js#L106)) — no
  override point.

## What changed

| File | Change |
|---|---|
| [EditorActions.js](src/renderers/EditorActions.js) (new) | Public action surface: `isEditMode`, `getSelectedItem`, `getSelectedElement`, `selectAll`, `copy`, `cut`, `paste`, `deleteSelection`, `undo`, `redo`. Built on the existing `configLoader` commands and `diagram.selectedItems` — no new business logic. Every action re-checks `editmode` itself via the diagram's blackboard, independent of whatever gated the call that reached it. |
| [EditorHotKeysEvents.js](src/renderers/Plugins/EditorHotKeysEvents.js) | Reduced to a thin key→action mapper. Same keydown bindings, same input/textarea/contentEditable guard, but the `handleXxx` bodies are gone — it now calls straight into `EditorActions`. |
| [EditorPluginManager.js](src/renderers/EditorPluginManager.js) | Two changes: (1) `onAddDiagram` now syncs the blackboard's `editmode` from the just-added diagram's actual `options.editmode` (see bug note below). (2) New `hotKeyManager` option, following the constructor's existing `{...defaults, ...overrideDefaultValues}` convention: unset → built-in `EditorHotKeysEvents`; `false` → no hotkey manager is instantiated; a class → instantiated instead of the default, given the same `(diagram, blackboard, editorConfig)` constructor signature. |
| [DiagramEditor.js](src/core/DiagramEditor.js) | `loadDiagram` now passes `hotKeyManager: this.options.hotKeyManager` through to `EditorPluginManager`, so it's settable via the editor's own constructor options (e.g. `new DiagramEditor(sel, { hotKeyManager: false })`). |

### Bug fix folded into this pass

`EditorPluginManager.setupDefaultValues()` unconditionally set the blackboard's
`editmode` to `true` at construction time — before the diagram (and its real
`options.editmode`) even existed. Since `DiagramEditor.loadDiagram()` defaults to
`editmode: false` (view mode) and nothing else synced the blackboard afterward, hotkeys
were actually **active in view mode** before this change, contradicting point 3 of the
original plan. Fixed by syncing `blackboard.setStorageValue('editmode', ...)` from
`diagram.options.editmode` in `onAddDiagram`, once the diagram's real option is known.

### Why `EditorActions` and not just an opt-out flag

The original open question was boolean-only (`useDefaultHotKeyManager: false`) vs.
pluggable. Went with pluggable, because a bare opt-out only lets a host app stop the
default keybindings — it doesn't give them anything to reuse. With `EditorActions`
exposed as a stable, standalone export, a custom hotkey manager (or a toolbar button,
or a context menu item) can call `EditorActions.deleteSelection(diagram)` etc. directly
instead of reimplementing command dispatch from scratch.

## Undo/redo — not implemented in this pass

`EditorActions.undo`/`redo` exist but only `blackboard.notify('hotkey:undo'/'redo',
diagram)` — same placeholder behavior as before. `src/core/OperationManager.js` is
still an empty stub. Real undo/redo needs a command history stack touching every
mutation path (element add/remove/move/resize/edit), not just the hotkey trigger, so
it's scoped as its own follow-up.

## Not in scope for this pass

- Real undo/redo (see above).
- Multi-item select-all copy/paste (current copy/paste commands operate on a single
  element — `getSelectedElement()` only looks at `selectedItems[0]`).
- Configurable key bindings (remapping which key triggers which action) — swapping the
  whole manager is supported; per-key customization within the default one is not.

## Verification

`npm run build:editor` passes. There is no automated test suite in this repo (`npm
test` reports no tests found), so this hasn't been exercised at runtime — please check
manually via `npm run dev`:

- [ ] Edit mode: Ctrl+A selects all elements/connectors; Ctrl+C/X/V copy/cut/paste the
      selected element; Delete/Backspace removes the selected item (element or
      connector); none of this fires while focus is in a text input or an
      editable/contentEditable field.
- [ ] View mode (`editmode: false`, e.g. via `loadDiagram` without `editmode: true`):
      none of the above hotkeys do anything — this is the case the editmode-sync bug
      fix targets, worth double-checking specifically.
- [ ] Toggling edit mode at runtime via `DiagramEditor.setOption('editmode', ...)`
      correctly enables/disables the hotkeys live.
- [ ] `new DiagramEditor(selector, { hotKeyManager: false })` results in no hotkey
      plugin being attached (no `plugin-editor-hotkeys` user data on the diagram, no
      keydown handler bound).
- [ ] Passing a custom class as `hotKeyManager` gets instantiated instead of
      `EditorHotKeysEvents`.
