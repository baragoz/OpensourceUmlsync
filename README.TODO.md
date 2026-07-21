# TODO: Editor / Viewer API split

Context: the build already produces two bundles (`dist/editor`, `dist/viewer`),
but the split is only skin-deep — shared core classes still assume jQuery UI
is present, the viewer entry point isn't wired to `DiagramViewer` at all, and
neither package has a defined public surface. This doc tracks the work to make
the split real.

## 1. Move `.draggable()` / jQuery UI calls out of the shared core, into the editor

Viewer is supposed to depend on jQuery only, but these **shared** classes
(used by both `DiagramEditor` and `DiagramViewer` via `ClassDiagram` /
`BaseDiagram` inheritance) call jQuery UI plugins directly:

- [ ] `src/diagrams/BaseDiagram.js:946,950` — `.draggable("option", "helper", ...)` in `setDropHelper()`
- [ ] `src/connectors/BaseConnector.js:189` — `.draggable('option', 'disabled', ...)`
- [ ] `src/connectors/Sequence/BaseSQConnector.js:161` — `.draggable('option', 'disabled', ...)`

These currently ship inside `dist/viewer/*.js` (confirmed: 3 occurrences of
`.draggable(` in a fresh viewer build) even though jquery-ui is never loaded
by a viewer-only consumer. Today it's silently unreachable because the viewer
entry point is broken (see #3), but it becomes a real runtime crash
(`$(...).draggable is not a function`) as soon as the viewer entry is fixed
and these code paths are reached from view-mode.

Plan:
- Move drag/resize wiring (`.draggable(`, `.resizable(`, etc.) out of the base
  diagram/connector classes and into editor-only plugins
  (`src/renderers/Plugins/ElementDraggable.js`, `ElementResizeable.js` already
  exist and do this correctly for elements — follow the same pattern for
  `setDropHelper` and connector drag-disable).
- Base classes should expose hooks/state (e.g. `dropHelper` data, a
  `disabled` flag) that editor plugins react to via the `Blackboard` event bus,
  instead of calling jQuery UI methods directly.
- Audit `src/elements/sequence/SQAltElement.js:54` — currently a commented-out
  `.resizable(` call; decide whether to delete or move to an editor plugin
  before it gets uncommented by accident.

## 2. Split editor API into internal vs. public

`DiagramEditor` (`src/core/DiagramEditor.js`) currently exposes everything as
public instance methods/properties (`registerCommand`, `extendContextMenu`,
`#updateDimention`, `#subscribeToResize`, direct access to `this.digram`,
`this.sideMenu`, etc.) with no explicit boundary.

- [ ] Define the public surface: `createDiagram`, `loadDiagram`, `setOption`,
      `registerCommand`, `extendContextMenu`, listener registration on the
      `Blackboard` (currently internal-only, wired through
      `EditorPluginManager`).
- [ ] Everything else (`EditorPluginManager`, `Blackboard` internals, the
      `renderers/Plugins/*` command handlers, `ConfigLoader`) should move
      under a clearly internal namespace/folder, or at minimum not be
      re-exported from `UMLSync.editor.js`.
- [ ] Decide whether `Blackboard.addEventListener` becomes the public
      listener-registration API mentioned in #3, or whether `DiagramEditor`
      wraps it with a narrower `on()`/`off()` method.
- [ ] Document which diagram/element/connector methods are safe for host
      apps to call directly vs. internal-only (currently nothing is marked
      either way).

## 3. Split library entry files: `UMLSync.{editor,viewer,core}.js`

Current state is inconsistent and partly broken:

- [ ] `src/UMLSync.viewer.js` does **not** export `DiagramViewer` — it's a
      stale copy of `src/UMLSync.Core.js` (only re-exports `ClassDiagram`,
      `ClassElement`, `PackageElement`). Confirmed in a fresh build:
      `dist/viewer/UMLSync.viewer.es.js` has zero occurrences of
      `loadDiagram`. Fix: import and export `DiagramViewer` from
      `./core/DiagramViewer.js`, plus the full diagram/element/connector set
      (currently missing `PackageDiagram`, `ComponentsDiagram`,
      `StateDiagram`, `SequenceDiagram` and their elements/connectors from
      the public exports).
- [ ] `src/UMLSync.editor.js` should be the superset: `DiagramEditor` +
      everything `UMLSync.viewer.js` exports (view mode is a subset of edit
      mode).
- [ ] `src/UMLSync.Core.js` should hold only what's truly shared
      (diagram/element/connector model classes, no `DiagramEditor` /
      `DiagramViewer` wrapper), and both `UMLSync.editor.js` and
      `UMLSync.viewer.js` should build on top of it — not duplicate it.
- [ ] `src/UMLSync.js` at repo root is orphaned (no vite config references
      it) and duplicates `UMLSync.Core.js` — remove it or make it the actual
      shared core and have the other two import from it, to avoid a third
      copy of the same export list.
- [ ] Once the exports are correct, add a minimal smoke test/build check that
      fails if `DiagramViewer` is missing from the viewer bundle or
      `DiagramEditor` is missing from the editor bundle (see #4).

## 4. Update build process to exclude jQuery UI from viewer dependencies

- [ ] `vite.config.viewer.js` already externalizes only `jquery` — keep, but
      it's currently ineffective because nothing in the shared core should
      *reference* jQuery UI in the first place (depends on #1).
- [ ] Add `jquery` / `jquery-ui` as `peerDependencies` in `package.json`
      (currently declared nowhere — not even as a regular dependency), scoped
      correctly:
      - root/editor entry (`.`): `jquery` + `jquery-ui`
      - `./viewer` entry: `jquery` only
      - `peerDependenciesMeta` marking `jquery-ui` optional so viewer-only
        consumers don't get warnings.
- [ ] Add a post-build check (script or CI step) that fails the build if
      `dist/viewer/*.js` contains any jQuery UI plugin call
      (`.draggable(`, `.resizable(`, `.sortable(`, `.selectable(`,
      `.droppable(`, `.dialog(`, etc.) — regression guard for #1.
- [ ] Update `examples/index.view.html` to drop the jQuery UI `<script>`/CSS
      tags once the viewer no longer needs them, so the example actually
      proves the viewer is jQuery-only instead of masking the dependency.
