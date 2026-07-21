# Plan: element drop (nesting) support

Goal: dragging one element on top of another can nest it inside (package-in-package,
component-in-component), fix z-index so the nested element stays visible, and — for
component ports — snap onto the parent's border on drop.

## Current state (as of this branch)

The data model already has droppable options on `BaseElement`:

- `droppable` (bool) — *this* element, when dragged, should be tested against possible
  parents on drop.
- `acceptdrop` (list of `nameTemplate`s) — *this* element, when acting as a container,
  accepts these child types dropped inside it.

Declared today:

| Element | droppable | acceptdrop |
|---|---|---|
| `PackageElement` | true | `"package"` |
| `PackageSubsystemElement` | true | `"package"` |
| `ComponentElement` | true | `["component"]` |
| `ComponentSubsystemElement` | true | `["component"]` |
| `PortElement` (component) | **false** | — |
| `SQPortElement`, `SQDestroyElement`, `SQLostElement` | true | — |
| `SQObjectInstanceElement` | false | `["sqport", "sqdestroy"]` |

`BaseDiagram.checkDroppableElement(de)` ([BaseDiagram.js:867](src/diagrams/BaseDiagram.js#L867))
already does the geometry: iterate `this.elements`, skip ones that don't accept `de`'s
`nameTemplate`, and return the accepting element whose border **fully contains** `de`'s
border rect, picking the highest z-index if several match. This part is diagram-agnostic
and needs no changes.

The gap is in wiring, not geometry:

- Containment-check + z-index-swap + parent/`droplist` bookkeeping on drop currently
  lives in two near-duplicate plugin classes, not in the diagrams:
  [DiagramDroppableElements.js](src/renderers/Plugins/DiagramDroppableElements.js) (generic)
  and [DiagramDroppableSQElement.js](src/renderers/Plugins/DiagramDroppableSQElement.js)
  (sequence-only, adds lifeline re-centering).
- `EditorPluginManager.onAddDiagram` ([EditorPluginManager.js:87](src/renderers/EditorPluginManager.js#L87))
  only ever instantiates the **sequence** variant (`if diagram.options.nameTemplate ===
  'sequenceDiagram'`). The generic `DiagramDroppableElement` is imported but **never
  constructed anywhere** — dead code. Net effect: `PackageDiagram` and `ComponentsDiagram`
  declare `droppable`/`acceptdrop` on their elements, but nothing ever calls
  `checkDroppableElement` for them, so package-in-package / component-in-component drop
  currently does nothing.
- Both plugin files have the same bug: `onElementRemove` checks
  `element.options.accepdrop` (typo) instead of `acceptdrop`, so detaching a removed
  container's children from `droplist` never actually runs.
- Component ports aren't wired for drop at all: `PortElement.droppable` is `false`, and
  `ComponentElement`/`ComponentSubsystemElement.acceptdrop` doesn't include `"port"`.
- `checkDroppableElement`'s "fully contained" test can't be reused as-is for ports,
  since a port sitting on a border is only ever *partially* inside the component rect.

## Decisions (confirmed with user)

1. **Override pattern**: add empty hook methods on `BaseDiagram`, not another plugin
   class. `PackageDiagram`, `ComponentsDiagram`, `SequenceDiagram` override them;
   `ClassDiagram`/`StateDiagram` inherit the no-op (none of their elements declare
   `droppable`/`acceptdrop` today, confirmed — no change needed there).
2. **Port snap scope**: only `ComponentPortElement` dropped on `ComponentElement` /
   `ComponentSubsystemElement` gets border-snap logic now. `SequenceDiagram`'s existing
   `sqport`-on-lifeline centering ([DiagramDroppableSQElement.js:74-79](src/renderers/Plugins/DiagramDroppableSQElement.js#L74))
   stays as-is for now; migrating it into the new hook is an optional follow-up (Phase 2
   below), not required for this pass.

## Phase 1 — BaseDiagram hooks

In `BaseDiagram.js`:

```js
// no-op by default; diagrams with nested/droppable elements override this
handleElementDragStart(element, ui) {}

// no-op by default; diagrams with nested/droppable elements override this
handleElementDragStop(element, ui) {}
```

Call sites:

- `onElementDragStart` ([BaseDiagram.js:990](src/diagrams/BaseDiagram.js#L990)): call
  `this.handleElementDragStart(element, ui)` right after the multi-selection block
  (`if (this.selectedItems.length > 1) {...}`) marks the other selected elements'
  `dragStart`, and before the draggable/connector list bookkeeping that follows.
- `onElementDragStop` ([BaseDiagram.js:1071](src/diagrams/BaseDiagram.js#L1071)): call
  `this.handleElementDragStop(element, ui)` at the very end, after sibling elements and
  connectors have already been stopped/updated, so containment checks see final
  positions.

## Phase 2 — PackageDiagram

Override `handleElementDragStop(element, ui)`:

```js
handleElementDragStop(element, ui) {
  if (!element.options.droppable) return;

  const parent = this.checkDroppableElement(element);
  this.#reparent(element, parent);   // detach from old parent.droplist, attach to new
  this.#fixZIndex(element, parent);  // see "z-index rule" below
}
```

`#reparent` / `#fixZIndex` can be small private helpers duplicated across the three
diagrams, or lifted onto `BaseDiagram` as protected helpers if the logic ends up
identical for Package/Components (likely — port snapping is the only thing that's
different for Components). Prefer putting the shared bits on `BaseDiagram` and calling
them from each diagram's override, rather than copy-pasting three times.

No `handleElementDragStart` override needed for packages.

## Phase 3 — ComponentsDiagram

### Model changes

- `ComponentPortElement.js`: `droppable: false` → `true`.
- `ComponentElement.js` and `ComponentSubsystemElement.js`:
  `acceptdrop: ["component"]` → `["component", "port"]`.

### `handleElementDragStop(element, ui)`

Two cases, branch on `element.options.nameTemplate`:

- **`"component"` / `"component-subsystem"`** (element dropped on another component):
  identical to `PackageDiagram` — full-containment via `checkDroppableElement`,
  reparent, z-index fix.
- **`"port"`**: full containment doesn't apply (the port is meant to straddle the
  border, not sit fully inside). Use a separate overlap-based lookup instead of
  `checkDroppableElement`:
  1. Candidates = elements whose `acceptdrop` includes `"port"` and whose border rect
     *intersects* the port's rect (not full containment) — this needs a small
     `checkOverlappingElement(de)` alongside `checkDroppableElement` in `BaseDiagram`
     (or local to `ComponentsDiagram` if it's not reusable elsewhere).
  2. Tie-break same as today: highest z-index wins.
  3. Snap the port's center onto the nearest edge of the chosen parent (see algorithm
     below), then reparent + z-index fix same as the component case (so the port
     renders above its parent).

### Border-snap algorithm

Given port center `(cx, cy)` and parent rect `{left, top, width, height}`:

```
distTop    = |cy - top|
distBottom = |cy - (top + height)|
distLeft   = |cx - left|
distRight  = |cx - (left + width)|
edge = argmin(distTop, distBottom, distLeft, distRight)

if edge is top/bottom:
    newCenterY = top (or top + height)
    newCenterX = clamp(cx, left, left + width)
else: # left/right
    newCenterX = left (or left + width)
    newCenterY = clamp(cy, top, top + height)

element.left = newCenterX - element.width / 2
element.top  = newCenterY - element.height / 2
```

Apply both to `nativeBorderRef.css(...)` and `jsonModel` (same pattern as the existing
sequence re-centering code), then trigger a `draw()` so connectors attached to the port
re-route.

Out of scope for this pass (flag as follow-up if wanted): rotating the port glyph 90°
when snapped to a left/right edge so it reads as "flush" with the border.

## Phase 4 — SequenceDiagram

No functional change required — existing `DiagramDroppableSQElement` plugin keeps
working as-is.

Optional cleanup (do only if we want consistency across diagrams, not required for this
plan): move its `onElementDragStop` body into `SequenceDiagram.handleElementDragStop`,
delete the plugin, and remove the `nameTemplate === 'sequenceDiagram'` special case from
`EditorPluginManager.onAddDiagram` ([EditorPluginManager.js:87](src/renderers/EditorPluginManager.js#L87)).

## Phase 5 — plugin cleanup

Once containment/z-index/snap logic lives on the diagrams:

- Delete `DiagramDroppableElements.js` (dead code today, superseded by Phase 2/3).
- `DiagramDroppableSQElement.js` keeps only the `onElementRemove` detach-from-`droplist`
  logic (drag-stop logic moved to `SequenceDiagram` per Phase 4, if that optional step
  is taken) — or, if Phase 4 stays deferred, leave the plugin mostly as-is but:
  - fix the `accepdrop` → `acceptdrop` typo in `onElementRemove`.
  - register the same removal-detach handling for `PackageDiagram`/`ComponentsDiagram`
    too (currently only wired for sequence), since `PackageElement`/`ComponentElement`
    now need their `droplist` cleaned up on removal as well. Simplest: keep one
    generic plugin for removal-cleanup only, wired for all three diagram types in
    `EditorPluginManager`, independent of the new drag-stop hooks.

## z-index rule (used by Package and Components)

> If a smaller element is dropped on top of a larger one, bump the smaller (now
> nested) element's z-index above the parent's, so it renders on top.

```js
const pz = parent.jsonModel['z-index'];
const ez = element.jsonModel['z-index'];
if (pz > ez) {
  parent._setOption('z-index', ez);
  element._setOption('z-index', pz);
}
```

This already exists in both current plugins — just needs to move into the new
per-diagram `handleElementDragStop` overrides unchanged. Apply the same rule for the
port-on-component case (Phase 3) so a dropped port isn't hidden behind its parent.

## Verification checklist

- [ ] Drag a small package fully inside a large package → nests, small package's
      z-index ends up above the large one, dragging the large package moves the small
      one with it (`droplist` propagation in `BaseElement.onDragStart` already handles
      this, unchanged).
- [ ] Drag a component fully inside another component → same as above.
- [ ] Drag a component port near any edge of a component → port snaps so its center
      lands exactly on that edge; dragging from a different edge re-snaps correctly.
- [ ] Remove a package/component that has nested children → children's `parent`/
      `droplist` links are cleaned up (exercises the typo fix).
- [ ] Sequence diagram drop behavior (sqport onto lifeline, sqdestroy, sqlost) is
      unchanged.
- [ ] Class diagram and state diagram: confirm no regressions (they should hit the
      inherited no-op hooks and behave exactly as before).
