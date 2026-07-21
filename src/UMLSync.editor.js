import { DiagramEditor } from "./core/DiagramEditor.js";
import { DiagramViewer } from "./core/DiagramViewer.js";
import { DiagramThumbnailRenderer } from "./core/DiagramThumbnailRenderer.js";
import * as tmp from "./UMLSync.Core.js";

import "./assets/umlsync.css";

const UmlSync = {
  DiagramEditor,
  DiagramViewer,
  DiagramThumbnailRenderer,
  ...tmp,
};

// Ensure both named and default exports
export { DiagramEditor, DiagramViewer, DiagramThumbnailRenderer };
export default UmlSync;
