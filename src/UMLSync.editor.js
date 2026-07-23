import { DiagramEditor } from "./core/DiagramEditor.js";
import { DiagramViewer } from "./core/DiagramViewer.js";
import { DiagramThumbnailRenderer } from "./core/DiagramThumbnailRenderer.js";
import { ICompletionProvider } from "./completion/ICompletionProvider.js";
import * as tmp from "./UMLSync.Core.js";

import "./assets/umlsync.css";

const UmlSync = {
  DiagramEditor,
  DiagramViewer,
  DiagramThumbnailRenderer,
  ICompletionProvider,
  ...tmp,
};

// Ensure both named and default exports
export {
  DiagramEditor,
  DiagramViewer,
  DiagramThumbnailRenderer,
  ICompletionProvider,
};
export default UmlSync;
