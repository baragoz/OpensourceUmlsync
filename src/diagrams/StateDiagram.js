import {BaseDiagram} from '../diagrams/BaseDiagram.js';
// Connectors
import {AnchorConnector} from '../connectors/AnchorConnector.js';
import { TransitionConnector } from '../connectors/TransitionConnector.js';
// Elements
import { NoteElement } from '../elements/NoteElement.js';
import { StateElement } from '../elements/state/StateElement.js';
import { StateStartElement } from '../elements/state/StateStartElement.js';
import { StateFinalElement } from '../elements/state/StateFinalElement.js';
import { StateForkElement } from '../elements/state/StateForkElement.js';
import { StateDesignElement } from '../elements/state/StateDesignElement.js';


const defaultOptions = {
  nameTemplate: 'stateDiagram',
  type: 'state',
  acceptElements: ['note', 'state', 'statestart', 'statefinal',
      'statefork', 'statedesign'],
  acceptConnectors: ['aggregation', 'association', 'anchor'],
  editable: true
};

class StateDiagram extends BaseDiagram {
  //
  //  Width/Height could be modified via jsonModel options,
  //  or updated via setDimention
  //
  constructor(jsonModel, parentOptions, observer) {
    super(defaultOptions, jsonModel, parentOptions, observer);
    
  }

  createElement(elementType, jsonModel, options) {

    console.log("LOOOKING FOR ELEMENT: " + elementType);

    let object = null;
    if (elementType == 'state') {
      object = new StateElement(options, jsonModel, this);
    } else if (elementType == 'statestart') {
      object = new StateStartElement(options, jsonModel, this);
    } else if (elementType == 'statefinal') {
      object = new StateFinalElement(options, jsonModel, this);
    } else if (elementType == 'statefork') {
      object = new StateForkElement(options, jsonModel, this);
    } else if (elementType == 'statedesign') {
      object = new StateDesignElement(options, jsonModel, this);
    } else if (elementType == 'note') {
        object = new NoteElement(options, jsonModel, this);
    }

    return object;
  }

  createConnector(connectorType, jsonModel, options) {
    let object = null;
    //
    // There is only one connector between state machine elements
    //
    if (connectorType == 'transition') {
      object = new TransitionConnector(options, jsonModel, this);
    }
    //
    // While anchor is always a single connector for the note
    //
    else if (connectorType == 'anchor') {
      object = new AnchorConnector(options, jsonModel, this);
    }
    return object;
  }
}

export {StateDiagram}