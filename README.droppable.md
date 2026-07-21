# Element drop (nesting) support

Dragging one element onto another can now nest it inside its new parent
(package-in-package, component-in-component), keeps the nested element visibly on top
via a z-index fix, and — for component ports — snaps the port onto the parent
component's border on drop.

## How it works

Two option flags on `BaseElement` drive the whole feature (already existed, no changes):

- `droppable` (bool) — *this* element, when dragged, should be checked against possible
  parents on drop.
- `acceptdrop` (list of `nameTemplate`s) — *this* element, as a container, accepts these
  child types dropped inside it.

Drag-stop handling is a hook on the diagram, not a plugin:

- `BaseDiagram.handleElementDragStop(element, ui)` ([BaseDiagram.js](src/diagrams/BaseDiagram.js))
  is a no-op by default, called at the end of `onElementDragStop` (after sibling
  elements/connectors have already been moved and updated). `BaseDiagram` also gained a
  matching `handleElementDragStart` no-op, called from `onElementDragStart` right after
  the multi-selection block marks other selected elements' `dragStart`.
- `ClassDiagram` and `StateDiagram` don't override either hook — none of their elements
  declare `droppable`/`acceptdrop`, so nothing changes for them.
- `PackageDiagram` and `ComponentsDiagram` override `handleElementDragStop` to nest a
  dropped element into whatever accepting parent's border fully contains it
  (`BaseDiagram.checkDroppableElement`, unchanged geometry check), then call the new
  shared helper `BaseDiagram.reparentDroppedElement(element, parent)`, which:
  - detaches the element from its previous parent's `droplist` and attaches it to the
    new one (or clears `element.parent` if dropped outside any container), and
  - applies the z-index rule: if the parent's z-index is above the (now nested)
    element's, swap them so the nested element renders on top.
- `SequenceDiagram` now follows the same pattern: it overrides `handleElementDragStop`
  to nest a dropped `sqport`/`sqdestroy`/`sqlost` into the object instance (lifeline) it
  was dropped on via `checkDroppableElement` + `reparentDroppedElement`, then re-centers
  it horizontally on the lifeline (same re-centering math as before, just relocated).

### Component ports snap to the border

`ComponentPortElement` is now `droppable: true`, and `ComponentElement` /
`ComponentSubsystemElement`'s `acceptdrop` now includes `"port"` alongside
`"component"`.

A port dropped near a component can't use the normal "fully contained" containment
check (it's meant to straddle the edge, not sit fully inside), so
`ComponentsDiagram.handleElementDragStop` branches on `nameTemplate === 'port'` and
instead uses a new `BaseDiagram.checkOverlappingElement(de)` — same accept-list logic
as `checkDroppableElement`, but matched on rect *overlap* instead of full containment.
Once the parent component is found, `ComponentsDiagram.#snapPortToBorder(element,
parent)` moves the port so its center lands exactly on the nearest of the parent's four
edges (clamped so it stays within that edge's span), then the port is reparented and
z-index-fixed the same way as a nested component.

Rotating the port glyph 90° when it snaps to a left/right edge (so it reads as flush
with the border) was left out of this pass.

## What changed

| File | Change |
|---|---|
| [BaseDiagram.js](src/diagrams/BaseDiagram.js) | Added `handleElementDragStart`/`handleElementDragStop` hooks (called from `onElementDragStart`/`onElementDragStop`), plus shared helpers `checkOverlappingElement` and `reparentDroppedElement`. |
| [PackageDiagram.js](src/diagrams/PackageDiagram.js) | `handleElementDragStop` override: nest dropped package/subsystem via `checkDroppableElement` + `reparentDroppedElement`. |
| [ComponentsDiagram.js](src/diagrams/ComponentsDiagram.js) | `handleElementDragStop` override: nests components the same way; branches to `#snapPortToBorder` for dropped ports. |
| [SequenceDiagram.js](src/diagrams/SequenceDiagram.js) | `handleElementDragStop` override: nests dropped `sqport`/`sqdestroy`/`sqlost` via `checkDroppableElement` + `reparentDroppedElement`, then re-centers it on the lifeline (logic moved here from the now-deleted `DiagramDroppableSQElement` plugin). |
| [ComponentPortElement.js](src/elements/component/ComponentPortElement.js) | `droppable: false` → `true`. |
| [ComponentElement.js](src/elements/component/ComponentElement.js), [ComponentSubsystemElement.js](src/elements/component/ComponentSubsystemElement.js) | `acceptdrop` gained `"port"`. |
| [DiagramDroppableElements.js](src/renderers/Plugins/DiagramDroppableElements.js) | Stripped to just the removal-cleanup listener (nesting logic moved to the diagrams above). Fixed a bug where it checked `element.options.accepdrop` (typo) instead of `acceptdrop`, so it never actually detached a removed container's children. Also switched it from listening on `element:remove` to `element:before:remove` — the former only carries a plain `{jsonModel, euid}` object with no `.options`, so the old handler could never have worked even once wired up. |
| `DiagramDroppableSQElement.js` | Deleted. Its nesting/re-center logic moved into `SequenceDiagram.handleElementDragStop`; its removal-cleanup logic is now redundant with the generic `DiagramDroppableElement` plugin below. |
| [EditorPluginManager.js](src/renderers/EditorPluginManager.js) | Wires a single `DiagramDroppableElement` cleanup plugin unconditionally for every diagram (previously: sequence-only, via the now-deleted SQ-specific plugin; package/components got nothing). It's a no-op for `ClassDiagram`/`StateDiagram` since their elements never declare `droppable`/`acceptdrop`. |

## Not done in this pass (possible follow-ups)

- No 90° rotation of the port glyph when it snaps to a left/right edge of a component.

## Verification

`npm run build:editor` passes. There is no automated test suite in this repo (`npm
test` reports no tests found), so this hasn't been exercised at runtime — please check
manually via `npm run dev`:

- [ ] Drag a small package fully inside a large package → nests, small package's
      z-index ends up above the large one, dragging the large package moves the small
      one with it.
- [ ] Drag a component fully inside another component → same as above.
- [ ] Drag a component port near any edge of a component → port snaps so its center
      lands exactly on that edge; dragging from a different edge re-snaps correctly.
- [ ] Remove a package/component that has nested children → children's `parent`/
      `droplist` links are cleaned up.
- [ ] Sequence diagram drop behavior (sqport onto lifeline, sqdestroy, sqlost) is
      unchanged.
- [ ] Class diagram and state diagram: no regressions (they hit the inherited no-op
      hooks and behave exactly as before).
