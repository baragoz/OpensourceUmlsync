# Editor API

Public API surface of `DiagramEditor`, the class a host page uses to embed the
editor. Exported from `src/UMLSync.editor.js` (default export `UmlSync.DiagramEditor`,
or named `{ DiagramEditor }`). Two related classes are exported alongside it but are
out of scope here: `DiagramViewer` (read-only rendering, no editing/undo API) and
`DiagramThumbnailRenderer`.

```js
import UMLSync from "umlsync";
const editor = new UMLSync.DiagramEditor("#placeholder", { devmode: true });
```

## Construction

```js
new DiagramEditor(domSelector, options)
```

`domSelector` is a jQuery selector string for the container element. `options`:

| Option | Default | Meaning |
|---|---|---|
| `id` | `1` | Instance id, used to build the internal element/diagram id prefix. Set this explicitly if you have more than one `DiagramEditor` on the same page. |
| `globalId` | `1` | Starting counter for generated element/connector ids (see `getNextGlobalId()`). |
| `devmode` | `false` | Passed through to `EditorPluginManager`; enables extra dev-only UI/logging. |
| `width`, `height` | `1000`, `500` | Initial editor size. |
| `fitToParent` | `false` | If set, the editor ignores `width`/`height` and always resizes to match the parent element's bounding rect (also re-applied on window resize). |
| `shareCanvas` | `false` | If set, diagrams don't allocate their own `<canvas>` (`multicanvas: false`) — for multi-tab setups sharing one canvas. |
| `hotKeyManager` | unset | `unset` → default `EditorHotKeysEvents` (Ctrl+A/X/C/V, Delete, Ctrl+Z/Y); `false` → no hotkey manager at all; a class → instantiated instead of the default, given `(diagram, blackboard, editorConfig)`. See [README.hotkeys.md](README.hotkeys.md). |
| `styleManager` | unset | `unset` → default `DefaultStyleManager` (localStorage-backed); a class → instantiated once instead, given `{ storageKey }`. Unlike `hotKeyManager`, it is built once per `DiagramEditor` and shared across every `loadDiagram()`/`createDiagram()` call, since styles are editor-wide rather than diagram-scoped. See "Styles" below. |

## Loading a diagram

```js
editor.createDiagram(nameTemplate, extraOptions)   // new, empty diagram, edit mode by default
editor.loadDiagram(jsonModel, extraOptions)         // existing diagram (jsonModel.nameTemplate required), view mode by default
```

`nameTemplate` is one of `classDiagram`, `packageDiagram`, `componentsDiagram`,
`stateDiagram`, `sequenceDiagram`. `extraOptions` commonly includes `{ editmode: true|false }`.
Both return the underlying diagram instance (also kept as `editor.digram`), which
carries the diagram-level surface used by the examples: `diagram.getDescription()`
(current JSON model — what you'd persist), `diagram.selectAll()`, `diagram.options.editmode`,
`diagram.getUserData("blackboard")` (the diagram's event bus — see `Blackboard`
in `src/utils/Blackboard.js`).

Calling `loadDiagram`/`createDiagram` again tears down the previously loaded diagram
first, and re-attaches undo/redo tracking (see below) to the new one.

## Options at runtime

```js
editor.setOption("editmode", true | false)              // toggle edit/view mode live
editor.setOption("dimention", { width, height })         // resize
```

## Commands and context menu

```js
editor.registerCommand(name, handler)                    // handler(data, extraData)
editor.extendContextMenu(path, title, command)            // not yet implemented (stub)
```

Registers into the shared `configLoader` command registry
(`command:element:remove`, `command:connector:remove`, `command:class:add_field`, etc.
— see `src/utils/ConfigLoader.js` and `src/renderers/Commands/`). A handful of
default commands are pre-registered by the editor itself (copy/cut/paste/delete,
connector labels, z-index, class fields/methods).

## Undo / redo

Each loaded diagram gets its own `OperationManager` (`diagram.opman`,
`src/core/OperationManager.js`), grouping logical user actions (drag, resize, add/
remove element or connector, style edits, class field/method edits, etc.) as
whole-diagram JSON snapshots rather than per-field inverse operations. The editor
exposes it directly so host pages don't need to reach into `editor.digram` at all:

```js
editor.undo()                     // no-op if nothing to undo
editor.redo()                     // no-op if nothing to redo
editor.canUndo()                  // boolean
editor.canRedo()                  // boolean

const unsubscribe = editor.onUndoRedoChange(({ canUndo, canRedo }) => {
  $("#undo-btn").prop("disabled", !canUndo);
  $("#redo-btn").prop("disabled", !canRedo);
});
```

`onUndoRedoChange` calls back immediately with the current state, then again on
every change — including across `loadDiagram()`/`createDiagram()` calls, since the
listener is transparently re-attached to whichever diagram is currently loaded (a
fresh diagram always starts with `canUndo`/`canRedo` both `false`). Ctrl+Z / Ctrl+Y
(via the default hotkey manager) already call through this same API, so a page only
needs `onUndoRedoChange` for toolbar button state, not to make the hotkeys work.

See `examples/jsm/example.js` (`#us-ex-undo`/`#us-ex-redo`) for a working example.

## Styles

A `style` is `{ id, connector: {...}, element: {...} }` (`connector`/`element` use the
same option keys as the toolbar's style editing rows - `color`, `font-family`,
`font-size`, `font-color`, `bold`, etc.). Style storage/retrieval is delegated to a
`styleManager` (see `styleManager` option above and `src/styles/IStyleManager.js`),
built once per `DiagramEditor` and shared across every diagram loaded into it:

```js
editor.getSystemStyles()          // -> [{ id, connector, element }, ...] read-only presets
editor.getUserStyles()            // -> [{ id, connector, element }, ...] user-saved styles
editor.saveUserStyle(style)       // persists { connector, element }, returns the new id
editor.removeUserStyle(id)        // -> boolean, true if a user style was removed

editor.getDefaultStyle()          // -> { connector, element } applied to newly created items
editor.setDefaultStyle(style)     // persist a new default style

editor.getPinnedStyleIds()        // -> string[] ids of pinned styles (system or user)
editor.pinStyle(id)               // pin a style - it sorts first within its own list (system/user)
editor.unpinStyle(id)             // unpin a style
```

The default implementation, `DefaultStyleManager` (`src/styles/DefaultStyleManager.js`),
persists user styles and the default style to `localStorage`, namespaced per editor
`id` option, seeded with the built-in presets in `src/styles/defaultSystemStyles.js`.
Pass a class implementing `IStyleManager` as `styleManager` to back styles with
something else (e.g. a server-backed store) instead.

## Reusable editor actions

`EditorActions` (`src/renderers/EditorActions.js`) is a standalone module — not a
method on `DiagramEditor`, and **not currently re-exported from the built `umlsync`
package** (`src/UMLSync.editor.js` only exports `DiagramEditor`/`DiagramViewer`/
`DiagramThumbnailRenderer`) — used internally by the default hotkey manager. It's
safe to call directly from a toolbar button, context menu, or a custom hotkey
manager if you're building from this source tree (`import { EditorActions } from
"./src/renderers/EditorActions.js"`); consuming it from the published package would
need it added to `UMLSync.editor.js`'s exports first. Every function takes the
diagram instance (`editor.digram`) as its first argument and re-checks edit mode
itself:

```js
EditorActions.selectAll(diagram);
EditorActions.copy(diagram);
EditorActions.cut(diagram);
EditorActions.paste(diagram, data);
EditorActions.deleteSelection(diagram);   // removes every selected element/connector as one undo step
EditorActions.undo(diagram);
EditorActions.redo(diagram);
EditorActions.getSelectedItem(diagram);
EditorActions.getSelectedElement(diagram); // null if the current selection is a connector
```

Note: `copy`/`cut`/`getSelectedElement` still operate on a single selected item
(`selectedItems[0]`) — only `deleteSelection` was extended to the whole selection.
