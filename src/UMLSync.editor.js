import { DiagramEditor } from './core/DiagramEditor.js';
import { DiagramThumbnailRenderer } from './core/DiagramThumbnailRenderer.js';
import * as tmp from './UMLSync.Core.js';


const UmlSync = {
    DiagramEditor,
    DiagramThumbnailRenderer,
    ...tmp
};

// Ensure both named and default exports
export { DiagramEditor, DiagramThumbnailRenderer};
export default UmlSync;