import { BaseDiagram } from './BaseDiagram.js';
// Elements
import { NoteElement } from '../elements/NoteElement.js';
import { SQPortElement } from '../elements/sequence/SQPortElement.js';
import { SQActorElement } from '../elements/sequence/SQActorElement.js';
import { SQAltElement } from '../elements/sequence/SQAltElement.js';
import { SQDestroyElement } from '../elements/sequence/SQDestroyElement.js';

// Connectors
import { SQObjectInstanceElement } from '../elements/sequence/SQObjectInstanceElement.js';
import { SQAsyncMessageConnector } from '../connectors/Sequence/SQAsyncMessageConnector.js';
import { SQSyncMessageConnector } from '../connectors/Sequence/SQSyncMessageConnector.js';
import { SQSelfMessageConnector } from '../connectors/Sequence/SQSelfMessageConnector.js';
import { SQReturnMessageConnector } from '../connectors/Sequence/SQReturnMessageConnector.js';
import { SQParticipantElement } from '../elements/sequence/SQParticipantElement.js';

// Common Connectors
import { AnchorConnector } from '../connectors/AnchorConnector.js';

const defaultOptions = {
    nameTemplate: 'sequenceDiagram',
    type: 'sequence',
    acceptElements: ['note', 'sqport', 'sqactor', 'sqobject_instance',
    'sqalt', 'sqdestroy', 'sqparticipant'],
    acceptConnectors: ['lllink', 'llref']
};

class SequenceDiagram extends BaseDiagram {
    //
    //  Width/Height could be modified via jsonModel options
    //
    constructor(jsonModel, parentId, observer) {
        super(defaultOptions, jsonModel, parentId, observer);
    }

    //
    // Whitelist of acceptable elements
    //
    createElement(elementType, jsonModel = {}) {
        console.log("CREAGTE ELEMETN " + elementType);
        let object = null;
        if (elementType == 'sqport') {
            object = new SQPortElement({}, jsonModel, this);
        } else if (elementType == 'sqactor') {
            object = new SQActorElement({}, jsonModel, this);
        } else if (elementType == 'sqobject_instance') {
            object = new SQObjectInstanceElement({}, jsonModel, this);
        } else if (elementType == 'sqalt') {
            object = new SQAltElement({}, jsonModel, this);
        } else if (elementType == 'sqdestroy') {
            object = new SQDestroyElement({}, jsonModel, this);
        } else if (elementType == 'sqparticipant') {
            object = new SQParticipantElement({}, jsonModel, this);
        } else if (elementType == 'note') {
            object = new NoteElement({}, jsonModel, this);
        }
        return object;
    }

    //
    // Whitelist of acceptable connectors
    //
    createConnector(connectorType, jsonModel) {
        let object = null;
        if (connectorType == 'sqsyncmessage') {
            object = new SQSyncMessageConnector({}, jsonModel, this);
        } else if (connectorType == 'sqasyncmessage') {
            object = new SQAsyncMessageConnector({}, jsonModel, this);
        } else if (connectorType == 'sqselfmessage') {
            object = new SQSelfMessageConnector({}, jsonModel, this);
        } else if (connectorType == 'sqreturnmessage') {
            object = new SQReturnMessageConnector({}, jsonModel, this);
        }
        // Connector for the note
        else if (connectorType == 'anchor') {
            object = new AnchorConnector(options, jsonModel, this);
        }
  
        return object;
    }
}

export { SequenceDiagram }