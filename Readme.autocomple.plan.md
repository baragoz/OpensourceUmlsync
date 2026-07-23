# Plan: AST → diagram drag-and-drop, and a public completion-provider API

This plan spans two repos:
- `umlsync` (this repo) — the diagram editor/library.
- `umlsync_website/umlsync_website` — the Angular website embedding `umlsync`, with the AST tree preview on the left.

## Context that shapes both steps

- `umlsync` has no DOM/Angular awareness — it's jQuery + jQuery-UI, and its diagrams expose one key seam: `diagram.Element(elementType, jsonModel)` / `diagram.Connector(...)` on `src/diagrams/BaseDiagram.js` (~line 499). Every concrete diagram (`ClassDiagram`, `PackageDiagram`, `ComponentsDiagram`, `SequenceDiagram`) just dispatches that string to its own element classes.
- `umlsync_website` already has the AST tree (`AstTreeComponent`/`AstEntryComponent`, backed by `AstTreePackage`/`AstClass` types in `src/app/services/common-ast.ts`) and a single `DiagramComponent` that hosts whichever diagram type is active via `UMLSync.DiagramEditor`.
- Neither DnD nor autocompletion exists today in either repo — both are greenfield, but each has a strong in-repo precedent to model from (dead code + live code, detailed below).

---

## Step 1 — Drag AST node → diagram

**Design decision (recommended):** use **native HTML5 drag-and-drop** (`draggable`, `dragstart`, `dragover`, `drop`) end-to-end, not jQuery-UI `.draggable()/.droppable()`. The Angular tree is plain Angular templates (no jQuery/CDK involved), and the diagram's host `<div>` is a regular DOM node the `DiagramComponent` already controls — native DnD lets the website own the whole interaction without reaching into umlsync's jQuery internals. This mirrors the *intent* of the dead `src/renderers/Plugins/DiagramDroppableDynatree.js` (tree node → `diagram.Element(type, {...})`) but implemented on the website side only, since umlsync doesn't need to know the source is an AST tree.

1. **Make tree nodes draggable** — in `ast-entry.component.html/.ts` and `ast-tree.component.ts` (website repo), add `draggable="true"` + a `dragstart` handler on class/package nodes. Payload in `dataTransfer` (JSON): `{ kind: 'class'|'interface'|'enum'|'struct'|'package', name, attributes?, methods?, packageName? }` — reusing `AstClass`/`AstTreePackage` fields already in the tree data.
2. **Make the diagram surface a drop target** — in `DiagramComponent`, add `dragover`/`drop` listeners on the diagram host element (the `#{{uniqueId}}` div `DiagramEditor` mounts into). Compute drop coordinates relative to the diagram surface (reference the positioning math in `src/renderers/Plugins/EditorIconMenu.js` lines ~174-366, the live analog of "drag something → `diagram.Element(...)`").
3. **Map AST node → diagram element type**, keyed by the *current diagram's type* (already known to `DiagramComponent`/`LayoutComponent` since `NewDiagramComponent` picks one of `classDiagram|packageDiagram|componentsDiagram|sequenceDiagram`):

   | Diagram | AST source | Call |
   |---|---|---|
   | Class UML | `AstClass` | `diagram.Element("class", { name, aux: kindToAux(kind), attributes, operations })` |
   | Sequence | `AstClass` | `diagram.Element("sqobject_instance", { name, classname: name })` |
   | Component | `AstTreePackage` (namespace) | `diagram.Element("component", { name: packageName })` |
   | Package | `AstTreePackage` | `diagram.Element("package", { name: packageName })` |

   (Element type strings and required `jsonModel` fields confirmed against each diagram's `acceptElements`/`createElement` and the `src/assets/configs/*.json` catalogs.)
4. **Reject invalid drops** — e.g. dragging a package onto a sequence diagram, or a class onto a package diagram — grey out / block via `dragover` `preventDefault` gating, checked against the map above.
5. **Nice-to-have (stretch):** if a class is dropped inside an already-placed package/component element, reuse `BaseDiagram.checkDroppableElement`/`reparentDroppedElement` so it nests automatically, matching the existing droppable-nesting feature (`README.droppable.md`).
6. **Manual test pass**: parse a sample file, drag each AST node kind into each of the 4 diagram types, verify correct/rejected behavior, undo/redo still works (elements created this way go through `diagram.Element`, so they're already undo-tracked via `opman`).

No changes needed inside `umlsync` itself for this step — `DiagramComponent` already has a live `diagram` instance with `.Element()` available.

---

## Step 2 — Public completion-provider API + website name autocompletion

**Where completion needs to hook in:** all inline text editing in umlsync (class name, attribute/operation text, connector labels) goes through one custom jQuery plugin, `src/assets/js/jquery.editable.js`, invoked from `src/renderers/Plugins/ElementEditable.js` (~line 20) and `src/renderers/Plugins/ClassExtras.js` (`.find(".editablefield").editable({...})`). This is the one seam to extend, not N separate ones.

1. **Design the provider interface in umlsync**, following the existing pluggable-manager pattern already used for styles (`IStyleManager`/`DefaultStyleManager`, see `src/styles/IStyleManager.js`):
   ```ts
   interface ICompletionProvider {
     getSuggestions(context: { key: string; elementType: string; currentValue: string }): string[] | Promise<string[]>;
   }
   ```
   `key` distinguishes name/attribute/operation/label fields; `elementType` is `"class"|"package"|"component"|...`.
2. **Expose registration on `DiagramEditor`**: `editor.setOption("completionProvider", provider)` (mirrors the existing `setOption("editmode", ...)`/`registerCommand` pattern) or a dedicated `editor.registerCompletionProvider(provider)`. Store it where `styleManager` currently lives so it's reachable from `jquery.editable.js`'s edit-session code.
3. **Wire it into `jquery.editable.js`**: when `toEditable()` creates the `<input>`, attach a `keyup`/`input` listener that calls the registered provider, renders a lightweight suggestion dropdown positioned under the field, and on selection replaces the field value before `onSubmit` fires (which already exists in `ElementEditable.js` and records the change through `diagram.opman`, so undo/redo keeps working for free).
4. **Fix the export gap so this is actually a public API**: today `UMLSync.editor.js` only re-exports `ClassDiagram, DiagramEditor, DiagramViewer, DiagramThumbnailRenderer`, and `package.json`'s `types` field points at a non-existent `dist/editor/index.d.ts` (no `.d.ts` is generated despite `vite-plugin-dts` being present) — this is already flagged in `README.TODO.md`. Add the new completion types to `UMLSync.editor.js`'s exports and get `.d.ts` generation actually producing output, otherwise the website can't consume this with types.
5. **Website side — provide a name-completion provider**: in `DiagramComponent` (or a small new `AstCompletionProvider` service, website repo), implement `ICompletionProvider` by scanning `LayoutComponent.jsonData` (`AstTreePackage[]`) for class/interface/enum names — reusing the exact data already populating the AST tree — and register it via `editor.setOption("completionProvider", provider)` right after `loadDiagram`/`createDiagram`.
6. **Manual test pass**: type a partial class name into an attribute-type field or association target and confirm suggestions from the parsed AST tree appear and are selectable.

---

**Sequencing recommendation:** do Step 1 first — it's isolated to the website and has no upstream umlsync API changes, so it ships independently. Step 2 requires touching umlsync's public surface and fixing its broken `.d.ts` generation, which is riskier/slower, so treat it as its own follow-on piece of work.
