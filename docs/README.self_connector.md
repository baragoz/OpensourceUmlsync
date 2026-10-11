# Self-association connector via the icon menu

Status: **not yet implemented** — this is a plan written before implementation,
describing how to make the "self-association" icon in the class-diagram icon
menu actually usable.

## The problem

Every other connector icon (`association`, `aggregation`, `composition`, ...)
connects **two** elements: the element the icon menu is attached to, and
whatever the user drops the icon on. `EditorIconMenu.loadMenu()`
([src/renderers/Plugins/EditorIconMenu.js](src/renderers/Plugins/EditorIconMenu.js))
implements that as a single generic jQuery UI `.draggable()` wired to every
icon:

- `start` ([EditorIconMenu.js:185](src/renderers/Plugins/EditorIconMenu.js#L185)):
  creates a **temporary** connector from the source element to a synthetic
  `ConnectionHelper` div (the `[ x ]` helper), so the line follows the mouse.
- `drag` ([EditorIconMenu.js:225](src/renderers/Plugins/EditorIconMenu.js#L225)):
  just forces a redraw each frame (the helper div moving is what actually
  changes the line, via `BaseConnector._getConnectionPoints` special-casing
  `euid == "ConnectionHelper"`, [BaseConnector.js:97](src/connectors/BaseConnector.js#L97)).
- `stop` ([EditorIconMenu.js:231](src/renderers/Plugins/EditorIconMenu.js#L231)):
  removes the temp connector, finds a drop-target element via
  `diagram._dropConnector(ui)` ([BaseDiagram.js:702](src/diagrams/BaseDiagram.js#L702))
  or creates a brand-new element if nothing was under the cursor, then creates
  the *real* connector between the two elements.

Self-association has no second element — the source *is* the target. Forcing
it through this flow means either dropping on empty canvas (which today would
create a stray new `class` element and connect to that) or dropping back on
the same element (untested, and still built around the wrong mental model).
The code already knows this is unfinished: see the shouting comment left in
place at [EditorIconMenu.js:169-173](src/renderers/Plugins/EditorIconMenu.js#L169-L173):

> THERE ARE TWO CALL's HERE FOR DRAGGABLE!!!!! IT IS NECESSARY TO JOIN THEM -
> OR DESCRIBE THE DIFFERENCE :) ONE FOR USUAL MENU AND ANOTHER ONE FOR
> SELF-CONNECTABLE ITEMS WHICH DOESN'T REQUIRE THE 2-nd ELEMENT

There's also a live bug blocking this today: the icon's id in
[class.json:20](src/assets/configs/iconsmenu/class.json#L20) is
`"self-association"`, but `ClassDiagram.createConnector`
([ClassDiagram.js:65](src/diagrams/ClassDiagram.js#L65)) only matches the
string `"selfassociation"` (no dash). Dragging that icon today silently fails
to create a connector at all.

## What already exists (don't rebuild)

`SelfAssociationConnector` ([src/connectors/SelfAssociationConnector.js](src/connectors/SelfAssociationConnector.js))
already knows how to bootstrap itself from a single attached element:

- `_init()` ([SelfAssociationConnector.js:28](src/connectors/SelfAssociationConnector.js#L28)):
  if constructed with fewer than 3 `epoints`, computes a default 3-point loop
  (`p11.left+20/top-20`, `p11.left+180/top-20`, `p11.left+180/top+20`) purely
  from the attached element's border position.
- `_getConnectionPoints()` re-derives the two end segments against the live
  element position on every redraw, leaving the middle point alone.

Separately, `BaseConnector` already has a full "grab and drag one point of an
already-placed connector" mechanism, used today when a user clicks-drags a
midpoint of any connector to reshape it:

- `BaseDiagram.startConnectorTransform(x, y)` ([BaseDiagram.js:341](src/diagrams/BaseDiagram.js#L341)):
  takes `this.highlightedConnector`, marks it `selected`, calls
  `connector.startTransform(x, y, offset)`.
- `BaseConnector.startTransform()` ([BaseConnector.js:490](src/connectors/BaseConnector.js#L490)):
  resolves which point index (`eppos`) is nearest `(x,y)` via
  `getNearestPointIndex()`.
- `BaseDiagram.isPointOnLine(x, y)` ([BaseDiagram.js:274](src/diagrams/BaseDiagram.js#L274)):
  called from the diagram's native `mousemove` handler
  ([DiagramMouseEvents.js:74](src/renderers/Plugins/DiagramMouseEvents.js#L74)); if
  `this.transformConnector` is set, it just calls `TransformTo(x, y)` every
  move and redraws — no hit-testing needed once a transform is in progress.
- `BaseDiagram.stopConnectorTransform(x, y)` ([BaseDiagram.js:361](src/diagrams/BaseDiagram.js#L361)),
  called from the native `mouseup` handler
  ([DiagramMouseEvents.js:84](src/renderers/Plugins/DiagramMouseEvents.js#L84)):
  finalizes the point, commits the undo/redo step.

Crucially, `DiagramMouseEvents`'s `mousemove`/`mouseup` are bound directly on
`#{diagram.euid}` — and the icon menu's jQuery-UI helper div is `appendTo`
that same element ([EditorIconMenu.js:177](src/renderers/Plugins/EditorIconMenu.js#L177)).
Native mouse events still bubble through that container while jQuery UI drags
the helper, so **once `diagram.transformConnector` is set, the existing
mousemove/mouseup handlers drive the rest of the gesture automatically** — no
new listeners needed, in either drag library.

## The plan

Make picking the self-association icon skip the two-element flow entirely and
instead: create the connector immediately (already attached to the source
element, no target needed), then synthetically start the exact same
point-drag transform used to reshape an existing connector's midpoint — so
the user's ongoing mouse-down feels like they grabbed the loop's elbow point
and are dragging it, with no `[ x ]` helper or drop target involved.

### 1. Fix and flag the config

[class.json](src/assets/configs/iconsmenu/class.json)
- Fix `"connector": "self-association"` → `"connector": "selfassociation"`
  (line 20) to match `ClassDiagram.createConnector`.
- Add a flag to that entry, e.g. `"self": true`, so the icon menu can tell
  this icon apart from a normal two-element connector without string-matching
  on the connector name.

### 2. Thread the flag through icon HTML

[EditorIconMenu.loadMenu()](src/renderers/Plugins/EditorIconMenu.js#L113)
- Alongside the existing `data-force_create` attribute
  ([EditorIconMenu.js:130](src/renderers/Plugins/EditorIconMenu.js#L130)), emit
  `data-self='true'` when `item["cs"][r].self` is set, for both the SVG and
  sprite icon branches.

### 3. Branch in the shared `.draggable()` `start` callback

[EditorIconMenu.js:185](src/renderers/Plugins/EditorIconMenu.js#L185)
- Read `var isSelf = $(this).data("self");` at the top.
- If `isSelf`:
  - Still `opman.begin()` as today.
  - Skip creating the `ConnectionHelper` temp connector entirely.
  - Create the real connector directly, attached only to the source element:
    ```js
    var connector = iconMenuBuilder.diagram.Connector(this.id, {
      epoints: [{ id: iconMenuBuilder.currentElementId, x: 0, y: 0 }],
      ...iconMenuBuilder.connectorStyle,
    });
    ```
    `_init()` (already in `SelfAssociationConnector`) computes the default
    3-point loop the moment this constructs — no extra glue code needed.
  - Immediately hand off to the native reshape machinery, targeting the
    middle point (`connector.points[1]`, the loop's top elbow, already
    computed by the constructor):
    ```js
    iconMenuBuilder.diagram.highlightedConnector = connector;
    iconMenuBuilder.diagram.startConnectorTransform(
      connector.points[1].x,
      connector.points[1].y,
    );
    ```
  - Stash `connector` in an outer-scoped variable (parallel to the existing
    `connetorHelperEuid`) so `stop` can reach it if needed, and return early
    from `start` before the generic temp-connector code runs.
  - Suppress the `[ x ]` helper visual for this icon (e.g. have the `helper`
    factory return an empty/`display:none` div when `isSelf`) — nothing is
    being dropped on, so a floating helper following the cursor would be
    confusing rather than useful.

### 4. `drag` callback — no changes needed

Once `transformConnector` is set in step 3, `DiagramMouseEvents`'s own
`mousemove` handler already calls `TransformTo` + redraws on every move (see
mechanism above). The existing `drag` callback's redundant `diagram.draw()`
is harmless either way.

### 5. Branch in `stop`

[EditorIconMenu.js:231](src/renderers/Plugins/EditorIconMenu.js#L231)
- If `isSelf`: skip the entire `_dropConnector`/create-element/`handleConnector`
  block (that's the two-element logic). Call
  `iconMenuBuilder.diagram.stopConnectorTransform(x, y)` defensively as a
  fallback in case the native `mouseup` on the diagram surface didn't fire
  (e.g. released outside the diagram bounds). The unconditional
  `opman.commit()` at the end of `stop` already covers both paths, so no
  change needed there.

### Files touched

| File | Change |
|---|---|
| [class.json](src/assets/configs/iconsmenu/class.json) | Fix `self-association` → `selfassociation`; add `"self": true`. |
| [EditorIconMenu.js](src/renderers/Plugins/EditorIconMenu.js) | Emit `data-self`; branch in `start`/`stop`/helper factory for self-flagged icons. |
| `SelfAssociationConnector.js`, `BaseConnector.js`, `BaseDiagram.js`, `DiagramMouseEvents.js` | **No changes** — the plan reuses the existing point-transform and `_init()` machinery unmodified. |

## Open questions to confirm before implementing

1. **Click with no drag.** jQuery UI `.draggable()` only fires `start` after
   the mouse moves past its `distance` threshold (default 1px), so a true
   zero-movement click on the icon won't create anything today. Since a
   self-loop doesn't strictly need a drag gesture at all (there's no second
   element to pick), should a plain click also add the connector with its
   default computed shape (skipping the transform hand-off)? Recommend yes,
   via a `click` handler alongside `.draggable()` — jQuery UI suppresses the
   native `click` after an actual drag, so the two won't double-fire.
2. **Multiple self-loops on one element.** Each click on the icon would add a
   new `selfassociation` connector at the same default position, stacking
   exactly on top of the previous one until dragged apart. Worth deciding
   whether repeat clicks should offset the default position, or if that's
   fine to leave as-is (matches how other connectors behave today — dropping
   twice on the same pair of elements also stacks them).
3. **Reusability for other diagrams.** The `self` flag mechanism is generic
   and could later cover self-transitions on state diagrams, self-messages on
   sequence diagrams (`SQSelfMessageConnector`
   ([src/connectors/Sequence/SQSelfMessageConnector.js](src/connectors/Sequence/SQSelfMessageConnector.js))
   already exists but isn't wired to any icon menu either), etc. Note if it's
   ever used as a template: its `draw()` has a pre-existing bug at
   [SQSelfMessageConnector.js:42](src/connectors/Sequence/SQSelfMessageConnector.js#L42) —
   `context2.lineTo(...)` references an undefined `context2` instead of the
   `c` parameter. Out of scope for this pass, just noting the pattern
   generalizes.

## Manual verification checklist (once implemented)

- [ ] Select a class element, click its self-association icon without
      dragging — behavior matches whatever open question 1 resolves to.
- [ ] Click-drag the icon — a loop appears anchored to the element, and its
      elbow follows the mouse live until release.
- [ ] Release finalizes the shape; `Ctrl+Z` undoes the whole add-and-shape as
      one step; `Ctrl+Y` redoes it.
- [ ] No new `class` element is ever created by this icon.
- [ ] Reload via `getDescription()`/`loadDiagram()` round-trips the connector
      and its epoints correctly.
- [ ] Existing two-element connector icons (association, aggregation, ...)
      are unaffected.
