import { IDiagramObserver } from '../interfaces/IDiagramObserver';
import {Blackboard} from '../utils/Blackboard';

import {ClassExtras} from './Plugins/ClassExtras';
import {DiagramContextMenu} from './Plugins/DiagramContextMenu';
import {DiagramMouseEvents} from './Plugins/DiagramMouseEvents';
import {DiagramScroll} from './Plugins/DiagramScroll';
import {EditorContextMenu} from './Plugins/EditorContextMenu';
import {EditorIconMenu} from './Plugins/EditorIconMenu';
import {EditorSideMenu} from './Plugins/EditorSideMenu';
import {ElementContextMenu} from './Plugins/ElementContextMenu';
import {ElementDraggable} from './Plugins/ElementDraggable';
import {ElementMouseEvents} from './Plugins/ElementMouseEvents';
import {ElementResizeable} from './Plugins/ElementResizeable';


class ThumbnailPluginManager extends IDiagramObserver {
  constructor(overrideDefaultValues = {}) {
    super();
  }

  onJsonModelChange(action, data) {
    // do nothing
  }

  onAddDiagram(diagram) {
    // do nothing
  }

  onRemoveDiagram(diagram) {
    // Empty
  }

  onSelectDiagramItem(item) {
    // Empty
  }
}

export {ThumbnailPluginManager}