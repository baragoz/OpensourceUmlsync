# Plan: VS Code–compatible theming (2 dark + 2 light modes)

## Goal

Ship umlsync's CSS so it looks native inside a VS Code webview, matching
whichever of VS Code's four theme "kinds" is active, while keeping today's
standalone look for non-VS Code hosts (browser demo, other embedding apps).

## How VS Code theming actually reaches a webview

- Every VS Code webview panel gets, automatically and without any extension
  JS: `<body class="vscode-light | vscode-dark | vscode-high-contrast |
  vscode-high-contrast-light">`, plus several hundred `--vscode-*` CSS
  custom properties injected into the webview root, reflecting the user's
  active color theme. No `postMessage` handshake is needed for this part.
- Those 4 body classes are exactly VS Code's 4 theme kinds — 2 dark, 2
  light:
  - `vscode-dark` — regular Dark theme
  - `vscode-high-contrast` — Dark High Contrast
  - `vscode-light` — regular Light theme
  - `vscode-high-contrast-light` — Light High Contrast

  This maps 1:1 onto the "2 dark modes / 2 light modes" ask.
- When the user switches theme while the webview stays open, VS Code swaps
  the body class and the `--vscode-*` values live — no reload. So the whole
  integration can be pure CSS cascade, no JS listener needed on umlsync's
  side.

## Current state of umlsync's CSS (why this is a real refactor, not just 4 new files)

- Entry point [src/assets/umlsync.css](src/assets/umlsync.css) `@import`s
  `base.css` (1302 lines), `elements.css` (empty), `toolbar.css` (683
  lines), `menu_theme.css` (empty), `menu_textalign.css`,
  `menu_colorpicker.css`, `completion.css`.
- [src/assets/css/base.css](src/assets/css/base.css) — the canvas/diagram
  element styling (classes, connectors, ports, notes) — is 100% hardcoded
  hex/rgba colors (~35 distinct literals: `#97F7A1`, `#87CEEB`, `#EEEEEE`,
  `rgba(0,0,0,0.1)`, etc.). Zero CSS custom properties.
- [src/assets/css/toolbar.css](src/assets/css/toolbar.css) already has a
  start: it `@import`s
  [theme_light.css](src/assets/css/theme_light.css) (defines
  `--color-primary-*`, `--color-secondary-*`, `--toolbar-bg-options`, etc.
  under `:root`) and consumes 14 of them via `var(--...)`. But roughly 40
  other literals in the same file are still hardcoded.
- `menu_colorpicker.css`, `completion.css` — hardcoded colors, no
  variables.
- [src/styles/icons.css](src/styles/icons.css) — a spritesheet
  (`background-image: url(/sprites/icons.png)`) of fixed-color raster
  connector/element icons. These can't be recolored by CSS alone.
- `examples/css/*` (`variables.css`, `style.css`, `examples.css`) style the
  demo/example pages only — not shipped in `dist/`, out of scope for this
  plan except as a manual test harness.
- Build: `src/UMLSync.js` / `src/UMLSync.editor.js` `import
  "...assets/umlsync.css"` directly, so Vite bundles it into one
  `dist/editor/style.css`. New theme files must **not** be pulled into that
  default import, or every consumer pays for all 5 themes and hits a
  "last-loaded-wins" cascade problem.

## File layout (per preference)

| File | Scope | Loaded when |
|---|---|---|
| `src/assets/css/themes/default.css` (rename target for today's look, aka `umlsync.css`) | current palette, unscoped (`:root`, no body-class gate) | non-VS Code hosts: browser demo, any other embedding app |
| `src/assets/css/themes/vscode.dark1.css` | `body.vscode-dark` | VS Code, Dark theme |
| `src/assets/css/themes/vscode.dark2.css` | `body.vscode-high-contrast` | VS Code, Dark High Contrast |
| `src/assets/css/themes/vscode.light1.css` | `body.vscode-light` | VS Code, Light theme |
| `src/assets/css/themes/vscode.light2.css` | `body.vscode-high-contrast-light` | VS Code, Light High Contrast |

Keep `umlsync.css` (plus `base.css`/`toolbar.css`/etc.) as the *structural*
stylesheet — layout, sizing, geometry, everything that is not a color — and
factor every color/shadow value out into a small set of semantic custom
properties. The 5 files above then become pure "variable value" files,
nothing else. That's what keeps them small and swappable.

## Steps

1. **Introduce a semantic variable layer (prerequisite).**
   Audit `base.css`, `toolbar.css`, `menu_colorpicker.css`, `completion.css`
   for every hardcoded color/shadow (~90 literals total) and replace each
   with a `var(--umlsync-*, <original value>)` reference, falling back to
   the original literal so nothing regresses before a theme file exists.
   Group the naming by *role*, not by hue, so it survives theme swaps, e.g.:
   - `--umlsync-canvas-bg`
   - `--umlsync-element-fill` / `--umlsync-element-border` / `--umlsync-element-text`
   - `--umlsync-connector-stroke` / `--umlsync-connector-label-bg`
   - `--umlsync-toolbar-bg` / `--umlsync-toolbar-fg` / `--umlsync-toolbar-hover-bg`
   - `--umlsync-selection-outline`
   - `--umlsync-note-bg` (the sticky-note yellow, `#FFFFAE`)

   This is the largest single piece of work in the plan — everything
   downstream depends on it. `toolbar.css`'s existing `--color-*` /
   `--toolbar-*` variables are a partial precedent; recommend folding them
   into the new `--umlsync-*` scheme so there's one naming convention, not
   two.

2. **Rename/restructure `theme_light.css` → `themes/default.css`.**
   It becomes the concrete value-set for every semantic variable defined in
   step 1 (not just the toolbar subset it covers today). This file's
   content **is** today's look — zero visual change for existing
   (non-VS Code) consumers.

3. **Write the 4 `vscode.*.css` files**, each scoped under its body-class
   selector, mapping semantic vars to the nearest `--vscode-*` token.
   Example shape for `vscode.dark1.css`:
   ```css
   body.vscode-dark {
     --umlsync-canvas-bg: var(--vscode-editor-background);
     --umlsync-element-fill: var(--vscode-editorWidget-background);
     --umlsync-element-border: var(--vscode-editorWidget-border);
     --umlsync-element-text: var(--vscode-editor-foreground);
     --umlsync-connector-stroke: var(--vscode-editor-foreground);
     --umlsync-toolbar-bg: var(--vscode-sideBar-background);
     --umlsync-toolbar-fg: var(--vscode-sideBar-foreground);
     --umlsync-selection-outline: var(--vscode-focusBorder);
     /* ... */
   }
   ```
   The two high-contrast files (`dark2` / `light2`) need extra care: VS
   Code's high-contrast themes assume flat fills and strong borders (no
   soft shadows, no low-opacity overlays) — anywhere `base.css` /
   `toolbar.css` uses `rgba(0,0,0,0.1)`-style translucency for depth, the
   HC files should override with a solid `var(--vscode-contrastBorder)`
   outline instead and drop `box-shadow`, matching how VS Code's own UI
   behaves in HC mode. Also add a `forced-colors: active` media-query
   fallback as a belt-and-suspenders check for OS-level (Windows) high
   contrast, independent of the VS Code-specific classes.

   Pick the actual `--vscode-*` token names by inspecting a real webview's
   computed styles — VS Code does not publish one canonical static list —
   see the testing step below.

4. **Decide the load strategy for a VS Code extension host.**
   All 5 files are safe to load simultaneously (`default.css` unscoped + 4
   body-class-scoped files), since only one of the 4 classes is present on
   `body` at a time, so the cascade self-selects the right theme with zero
   JS. Document this as the recommended integration: the extension's
   webview HTML includes all 5 `<link>` tags (or one concatenated bundle) —
   no runtime detection required. The one edge case to flag: outside VS
   Code, `body` has none of the 4 classes, so only `default.css` rules
   apply — which is correct.

5. **Icons ([src/styles/icons.css](src/styles/icons.css) sprite).**
   Raster sprite icons don't recolor via CSS. Options, lowest effort first:
   (a) leave as-is for `default.css` and accept they look slightly off
   against dark VS Code backgrounds; (b) wrap the sprite container with
   `filter: invert(1) hue-rotate(180deg)` in the two dark theme files only,
   as a cheap approximation; (c) regenerate an actual dark-mode sprite
   sheet from source assets (correct, but highest effort — likely a
   separate follow-up). Recommend (a) for v1, (b) as a fast follow only if
   dark mode ships and visibly looks bad.

6. **Build/export wiring.**
   Today `UMLSync.js` / `UMLSync.editor.js` hard-`import` `umlsync.css`,
   which is why it currently bundles into one `dist/.../style.css`. Change
   that import to pull in only the structural CSS + `default.css` (today's
   behavior — zero change for existing consumers), and expose the 4
   `vscode.*.css` files as separate static assets under `dist/themes/`
   (via `publicDir` or an explicit copy step in
   [vite.config.editor.js](vite.config.editor.js), similar to the existing
   `rollup-plugin-copy` block for `jquery.editable.js`) so a VS Code
   extension can reference them independently without pulling in the whole
   bundle.

7. **Testing plan** (manual — no automated visual-regression harness exists
   in this repo today).
   - Add an `examples/index.vscode-theme-preview.html` (or extend
     `examples/index.html`) that toggles `body` between the 4 `vscode-*`
     classes plus "none" (→ default), so all 5 states are checkable without
     an actual VS Code host.
   - Additionally verify inside a real VS Code webview (a throwaway
     extension using `vscode.window.createWebviewPanel`) against one
     built-in preset per kind: Dark+ (dark1), Dark High Contrast (dark2),
     Light+ (light1), Light High Contrast (light2). This is also how you
     read the actual `--vscode-*` variable names/values for step 3, since
     there's no static reference — inspect computed styles on
     `document.body` in the webview's dev tools.
   - Check theme switching *while the webview stays open* (Settings → Color
     Theme, cycle all 4) to confirm no JS/reload is needed and the
     cascade-only approach in step 4 actually works live.

## Files involved

- `src/assets/css/base.css`, `toolbar.css`, `menu_colorpicker.css`,
  `completion.css` — hardcode → `var(--umlsync-*, ...)` migration (step 1)
- `src/assets/css/theme_light.css` → `src/assets/css/themes/default.css`
  (step 2)
- New: `src/assets/css/themes/vscode.dark1.css`, `vscode.dark2.css`,
  `vscode.light1.css`, `vscode.light2.css` (step 3)
- `src/styles/icons.css` — icon color-adaptation follow-up (step 5)
- `src/UMLSync.js`, `src/UMLSync.editor.js`, `vite.config.js`,
  `vite.config.editor.js` — import/build wiring (step 6)
- `examples/` — manual theme-preview harness (step 7)

## Sequencing recommendation

Do step 1 (variable extraction) first and land it alone — it's a pure
refactor where `default.css` matches today's colors exactly, so it's safe
to ship independently with no visual risk. Steps 2–4 (the actual VS Code
theme files) are the next, self-contained chunk. Steps 5 (icons) and 7
(test harness) can follow in either order or in parallel; step 6 (build
wiring) just needs to land before anyone tries to consume this from an
actual VS Code extension.
