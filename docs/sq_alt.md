# Plan: SQAlt element changes

All three points touch `src/elements/sequence/SQAltElement.js`, plus two shared plugin files.

## 1. Color only on `us-alt-tab`

Currently `SQAltElement` has no `_updateJsonModel` override, so it falls through to `BaseElement._updateJsonModel` (`src/elements/BaseElement.js:179-180`), which paints `background-color` on the whole `nativeRef` (i.e. both tab and body). Fix: override it in `SQAltElement.js`, following the same pattern already used by `PackageSubsystemElement.js:44-53`:

```js
_updateJsonModel(key, value) {
  if (key === "color") {
    this.nativeRef.find(".us-alt-tab").css("background-color", value || "");
    this.jsonModel[key] = value;
  } else {
    super._updateJsonModel(key, value);
  }
}
```

`_baseInit()` already calls this on load if `jsonModel.color` is set, so no extra wiring needed.

## 2. Select/drag only via `us-alt-tab`

This needs two independent fixes, since dragging and click-selection are wired separately and both currently listen on the *whole* element wrapper:

- **Dragging** — `ElementDraggable.js:27` calls `.draggable({...})` on `nativeBorderRef` with no `handle` restriction, so mousedown anywhere (including the body) starts a drag. jQuery UI's `draggable` has a built-in `handle` option for exactly this. Add:
  ```js
  handle: element.options["dragHandle"] || undefined,
  ```
  (mirroring how `axis` is already read from `element.options` on line 19), then set `dragHandle: ".us-alt-tab"` in `SQAltElement.js`'s `defaultOptions`.

- **Selection (click)** — `ElementMouseEvents.js:14-21` binds `.click()` on `nativeBorderRef`, which fires on any click bubbling up from a child, tab or body alike. jQuery UI's `handle` doesn't apply here since this is a plain click handler, so add an equivalent guard:
  ```js
  const clickHandle = element.options["clickHandle"];
  nativeBorderRef.click(self, function (event) {
    if (clickHandle && !$(event.target).closest(clickHandle).length) return;
    ...
  })
  ```
  and set `clickHandle: ".us-alt-tab"` alongside `dragHandle` in `SQAltElement.js`.

**Note:** we are *not* relying on CSS `pointer-events: none` on `.us-alt-body` for this — it wouldn't actually work here. Because `us-alt-body`'s parent (`us-package`) sits inside `nativeBorderRef`, a `pointer-events:none` click still resolves to that parent and bubbles up to the same `nativeBorderRef` listener, so it wouldn't stop selection/drag on its own. The JS-level `handle`/`clickHandle` options above are what actually restrict things to the tab. This also keeps the "if/else/condition" editable text inside the body clickable for editing (that's wired independently in `ElementEditable.js`, unaffected by this change).

Both options are opt-in and read generically from `element.options`, so other elements can adopt the same tab-only behavior later without touching the shared plugins again.

## 3. Default size 350×250

`SQAltElement.js:10-15` currently defaults to `width: 26, height: 80` (looks like a stale placeholder). Change to `width: 350, height: 250`. Note this default is shared by all fragment titles (Alt/Loop/Parallel/Option/Break/Strict) since they're all the same class — that should be fine since it's just the initial size before a user resizes.
