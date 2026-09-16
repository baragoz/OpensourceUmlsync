# SQSelfMessageConnector

A self message loops out of a lifeline, right, down, and back in - representing
a call an object (or one of its activations) makes to itself. This document
summarizes the shape model and every interactive use case the current
implementation supports, as a reference for future changes.

Related files:

- [SQSelfMessageConnector.js](SQSelfMessageConnector.js) - the connector itself.
- [../../elements/sequence/SQObjectInstanceElement.js](../../elements/sequence/SQObjectInstanceElement.js) -
  owns `findNearestAttachPoint()`, which the connector asks "what's at this
  (x, y) on your lifeline?".
- [../../diagrams/SequenceDiagram.js](../../diagrams/SequenceDiagram.js) -
  overrides `isConnectorRelatedToDrag()` and re-centers/redraws after a port
  is dropped onto an instance.
- [../BaseDiagram.js](../BaseDiagram.js) - `isConnectorRelatedToDrag()`'s
  default (non-sequence) implementation, and the generic element-drag/selection
  plumbing that calls it.

## Shape model

Exactly 4 points, always:

```
epoints[0]              epoints[1]
  (from-attach) ─────────── (top corner)
                                │
                                │ (middle segment)
                                │
  (to-attach) ─────────────── (bottom corner)
epoints[last]            epoints[2]
```

- `epoints[0]` ("from") and `epoints[last]` ("to") are the attach points -
  each independently bound (or not) to an element via `euid`/`id`/`limit`,
  same convention as every other connector.
- `epoints[1]`/`epoints[2]` are the 2 draggable "corners". They have no
  `euid` of their own - their position is derived from whichever attach
  point they're paired with.
- The top segment (`epoints[0]`-`epoints[1]`) and bottom segment
  (`epoints[2]`-`epoints[last]`) are always horizontal. The middle segment
  (`epoints[1]`-`epoints[2]`) is always vertical.
- Each corner's horizontal offset from its own attach point is clamped to
  `[CORNER_X_MIN, CORNER_X_MAX]` = `[40, 80]` px; the default offset for a
  freshly-created connector is `CORNER_X_DEFAULT` = `40`. The 2 corners'
  minimum vertical gap is `GAP_MIN` = `10` px (default `GAP_DEFAULT` = `30`).

## Attach point x: port vs. instance

An attach point's x depends on *what* it's bound to (`_getAttachX`):

- Bound to an **SQPortElement** (a narrow activation bar): x = the port's
  **right edge**. The loop visibly starts/ends flush with the port.
- Bound to an **SQObjectInstanceElement** directly (e.g. landing on the
  header, not one of its ports): x = the instance's **horizontal center**,
  where the lifeline itself runs.

This is re-derived from the live DOM on every redraw, so it tracks the
target moving/resizing without needing any extra bookkeeping.

## Resolving "what's at this position" (`SQObjectInstanceElement.findNearestAttachPoint`)

Sequence messages are always horizontal, so given `(x, y)`, the only real
question is *which row* of a lifeline is meant:

1. **y falls inside the instance's header** (`.us-instance`, the top 40px
   box) → attach to the instance itself, at its left border.
2. **y falls below the header, inside a port's own `[top, top+height]`**
   → attach to that port. If several ports overlap at this y (nested/stacked
   activations sharing the same lifeline column), pick whichever is pushed
   furthest toward the connector's own side (largest `indent` for a
   connector approaching from the right - which a self message always is;
   smallest/most negative for one approaching from the left).
3. **y falls below the header, but no port's own row contains it** → attach
   to the instance's own body (its horizontal center) - dragging past a
   port, but still inside the instance, falls through to the instance
   rather than clinging to whichever port happens to exist.
4. **y falls outside the instance's own rendered height entirely** (past
   its top or bottom) → returns `null`. Callers rely on this to mean
   *genuinely detached*, not "snap to whatever's closest anyway".

A port doesn't have to belong to an instance at all - it can be standalone
on the canvas, never dropped onto one. `SQSelfMessageConnector._findAttachTarget`
tries the instance-aware lookup above first, and falls back to a direct,
inclusive bounding-box test (`_findElementAt`) against ports/instances
directly when there's no owning instance to ask.

## Use case: dragging a corner while at least one end is attached

Grabbing near a corner and dragging it:

- Moves that corner (and levels its paired attach point's y to match, so
  the segment stays horizontal), with the segment's x-length re-clamped to
  `[40, 80]`.
- Copies the corner's new x onto the *other* corner too, so the middle
  segment stays vertical no matter which corner is being dragged.
- **Live re-attach while dragging**: on every redraw during the drag, the
  moved end's target is re-resolved via `findNearestAttachPoint` (or the
  standalone fallback) - so as you drag past a different (stacked) port,
  or past the instance's own bounds entirely, the loop visibly snaps to the
  new target, or detaches, before you even release the mouse. This is
  intentional: a corner-drag's y is a deliberate signal from the user.
- If the drag ends up outside the owning instance's own rendered height,
  that end detaches (`euid`/`id`/`limit` cleared).
- Bringing a detached end's corner back within range re-attaches it, via
  the same live-resolve mechanism - now correctly, since resolution no
  longer depends on the frozen x sitting exactly on a boundary, and no
  longer requires `element.parent` (which is session-only and never
  restored from a loaded diagram).

## Use case: dragging the attached element (a port, or its instance)

`SequenceDiagram.isConnectorRelatedToDrag` makes a self message follow the
drag whenever **either** of its 2 ends is among the currently-dragged
elements - not just when both move together, because the corners are free
points that don't self-correct from a live element rect the way an attached
endpoint does (`BaseDiagram`'s own default is stricter: both ends must move
together, or the other end must already be fully detached).

- **Both ends on the element being dragged** (e.g. a self message fully on
  one port, or 2 ports being dragged together as a selected group): the
  whole loop translates along, corners included.
- **Only one end's element is part of this drag** (e.g. a message from a
  port to a different, static port or instance; or 2 ports in the same
  instance, dragging just one): the *other*, uninvolved end is detached at
  drag-start (`onDragStart`), instead of being incorrectly shifted by a
  translation delta that doesn't apply to it. It stays detached after the
  drag - its post-drag position is incidental (a side effect of the
  uniform shift), not a deliberate placement, so it is **not**
  auto-reconnected. Reattaching it is a corner-drag (above), or the
  opportunistic check below.

## Use case: dropping a port onto an instance

`SequenceDiagram.handleElementDragStop` re-centers a dropped port on its new
parent instance. Since nothing else redraws after that CSS change, this
step also:

1. **Redraws the diagram** so every connector attached to the moved port
   (or its new parent) re-derives its points from the port's new position,
   instead of visibly pointing at empty space until some unrelated redraw
   happens to come along.
2. Calls `reattachDetachedEnds()` on every connector - an opportunistic,
   one-time check (not continuous, unlike the corner-drag's live resolve)
   for whether a currently-detached end can now bind to whatever was just
   dropped/repositioned.
3. **Re-clamps the 2 corners** (`_reclampCorners`) back into their valid
   `[40, 80]` offset range, preserving the user's chosen offset as much as
   possible. An attach point moving for a reason unrelated to dragging
   *this* connector (its port got re-centered) doesn't by itself pull an
   out-of-range corner back in - the corner-drag clamp only runs while
   actively dragging that corner, so this passive re-clamp runs on every
   redraw instead, whenever at least one end is attached.

## Use case: both ends fully detached (free-floating loop)

Once both `epoints[0]` and `epoints[last]` have no `euid`, the connector
becomes a free 4-point shape with no lifeline to reference, and
`getNearestPointIndex` switches from "nearest corner point" to "nearest of
the 3 segments":

- **Top segment** (`epoints[0]`-`epoints[1]`) or **bottom segment**
  (`epoints[2]`-`epoints[last]`) grabbed → drags that corner exactly like
  the attached case above (segment stays horizontal, length clamped to
  `[40, 80]`, middle segment kept vertical) - `_getAttachX` naturally falls
  back to the attach point's own frozen `x` when it's detached, so the same
  math applies whether attached or not.
- **Middle segment** (`epoints[1]`-`epoints[2]`) grabbed → since there's
  nothing left to reshape, this drags the **whole connector** as a rigid
  unit instead: all 4 points snapshot at drag-start and translate together
  by the mouse delta (`wholeDrag` mode). The live re-attach check is
  skipped in this mode - translating the whole shape is a deliberate
  reposition, not a reshape, and shouldn't suddenly glue an end mid-drag.

## Constants (top of [SQSelfMessageConnector.js](SQSelfMessageConnector.js))

| Constant           | Value | Meaning                                                        |
|--------------------|-------|-----------------------------------------------------------------|
| `CORNER_X_DEFAULT`  | 40    | Default corner offset right of the attach point on creation.    |
| `CORNER_X_MIN`      | 40    | Minimum corner offset while dragging.                            |
| `CORNER_X_MAX`      | 80    | Maximum corner offset while dragging.                            |
| `GAP_DEFAULT`       | 30    | Default vertical gap between the 2 corners on creation.          |
| `GAP_MIN`           | 10    | Minimum vertical gap - the 2 corners can never cross.            |

# BaseSQConnector

Base class for the other 3 message connectors - `SQSyncMessageConnector`,
`SQAsyncMessageConnector`, `SQReturnMessageConnector`. `SQSelfMessageConnector`
(above) is a sibling, not a subclass: it extends `BaseConnector` directly and
implements its own 4-point loop shape from scratch. Everything below is about
an ordinary message between two lifelines (or a lifeline and nothing).

## Shape model

- `epoints` is normalized to exactly 2 or 3 points on creation, never more:
  - both ends attached to an element → 3 points, where the middle one is an
    implicit "elbow" that exists only to carry a Y value - it never bends the
    line.
  - one end detached, or the special "dropped from the icon menu" connection
    helper case → 2 points.
- Whatever the epoints shape, the connector always **renders as a single
  horizontal segment** - 2 drawn points sharing one Y. The elbow's X never
  reaches the drawn line, only its Y does. This is the class's one
  structural idea: since sequence messages are always horizontal, a
  "waypoint" here is just plumbing for picking which row (time) the message
  is drawn at, never a real geometric bend.

## Attach points

- Each end independently tracks whether it's bound to an element, via the
  same `id` (persisted)/`euid` (live)/`limit` convention every connector in
  the app uses.
- An attached end's X isn't stored - it's re-derived from that element's
  live position on every redraw, so it tracks the element moving or
  resizing without any extra bookkeeping.
- An attached end lands on the element's edge rather than its center,
  oriented toward whichever side its neighboring point sits on, so the
  arrow visibly stops at the target's border instead of piercing to its
  middle. Landing on an instance's header box is special-cased the same
  way, so a message aimed at the header also stops at a border rather than
  reaching for the lifeline underneath.

## Dragging

- Only the X of the grabbed end point changes while dragging; Y is shared
  across every point at once - moving a message vertically means moving it
  to a different row/time, never bending it.
- Dropping re-resolves both ends against whatever element (if any) is
  under them, independent of what they were bound to before - so a single
  drag can attach, detach, or re-target either end. Because a rendered
  endpoint sits exactly on an element's border rather than comfortably
  inside it, the drop check is given a bit of tolerance around the
  element's box - without it, an ordinary small drag would very easily
  read as "missed the box" and detach unintentionally.

## Known gap

`cleanOnNextTransform` is computed on every re-creation the same way the
generic connector base class does, meant to make the invisible elbow
grabbable without aiming precisely at it. For this class it doesn't
currently work: the rendered points always collapse to 2 entries (per the
"always horizontal" point above), so the check behind it is fed a missing
point and never succeeds - and even if it did, this class's own drag-start
logic doesn't consult the flag the way the generic implementation does. The
elbow can only be grabbed today by aiming at it directly.
