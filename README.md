# UMLSync

A JavaScript library for viewing and editing UML diagrams in the browser.
It ships as two bundles: a full **editor** and a lightweight read-only **viewer**.

## Features

- Diagram types: class, component, package, state and sequence diagrams
- Connectors: association, aggregation, composition, generalization,
  realization, dependency, assembly, transition, nested, anchor and self-association
- Interactive editor with undo/redo, hotkeys (Ctrl+A/X/C/V, Delete, Ctrl+Z/Y),
  drag & drop and autocomplete
- Read-only viewer and thumbnail renderer for embedding diagrams in pages
- Themes, including VS Code light/dark/high-contrast previews

## Installation

```sh
npm install umlsync
```

Or build from source:

```sh
git clone https://github.com/umlsynco/umlsync.git
cd umlsync
npm install
npm run build
```

## Usage

### Editor

```js
import UMLSync from "umlsync";

const editor = new UMLSync.DiagramEditor("#placeholder", { width: 1000, height: 500 });
```

### Viewer

```js
import UMLSync from "umlsync/viewer";
```

See [README.editor.api.md](docs/README.editor.api.md) for the full editor API and options.

## Development

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with the editor |
| `npm run build:editor` | Build the editor bundle into `dist/editor` |
| `npm run build:viewer` | Build the viewer bundle into `dist/viewer` |
| `npm run build` | Build both bundles |
| `npm test` | Run the Jest tests |
| `npm run lint` | Run ESLint with auto-fix |

Demo pages are in [examples/](examples/).

## Documentation

Internal plans and design notes live in [docs/](docs/).

- [Editor API](docs/README.editor.api.md)
- [Hotkeys](docs/README.hotkeys.md)
- [Droppable elements](docs/README.droppable.md)
- [Self connector](docs/README.self_connector.md)
- [Labels](docs/Readme.label.md)
- [VS Code integration](docs/Readme.vscode.md)
- [TODO: editor/viewer split](docs/README.TODO.md)

## License

[MIT](LICENSE)
