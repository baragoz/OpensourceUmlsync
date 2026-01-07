// Base diagram
import { BaseDiagram } from './BaseDiagram.js';
// Connectors
import {AggregationConnector} from '../connectors/AggregationConnector.js';
import {AnchorConnector} from '../connectors/AnchorConnector.js';
import {AssociationConnector} from '../connectors/AssociationConnector.js';
import { CompositionConnector } from '../connectors/CompositionConnector.js';
import { DependencyConnector } from '../connectors/DependencyConnector.js';
import { GeneralizationConnector } from '../connectors/GeneralizationConnector.js';
import { NestedConnector } from '../connectors/NestedConnector.js';
import { RealizationConnector } from '../connectors/RealizationConnector.js';
// Elements
import { NoteElement } from '../elements/NoteElement.js';
import { PackageElement } from '../elements/PackageElement.js';
import { PackageSubsystemElement } from '../elements/PackageSubsystemElement.js';

const defaultOptions = {
    nameTemplate: 'packageDiagram',
    type: 'package',
    acceptElements: ['package', 'subsystem', 'note']
};

class PackageDiagram extends BaseDiagram {
    //
    //  Width/Height could be modified via jsonModel options
    //
    constructor(jsonModel, parentId, observer) {
        super(defaultOptions, jsonModel, parentId, observer);
    }

    createElement(elementType, jsonModel) {
        let object = null;
        if (elementType == 'package') {
            object = new PackageElement({}, jsonModel, this);
        } else if (elementType == 'subsystem') {
          alert("subsystem");
            object = new PackageSubsystemElement({}, jsonModel, this);
        } else if (elementType == 'note') {
            object = new NoteElement({}, jsonModel, this);
        }
        return object;
    }

    createConnector(connectorType, jsonModel, options) {
        let object = null;
        if (connectorType == 'aggregation') {
          object = new AggregationConnector(options, jsonModel, this);
        } else if (connectorType == 'association') {
          object = new AssociationConnector(options, jsonModel, this);
        } else if (connectorType == 'realization') {
          object = new RealizationConnector(options, jsonModel, this);
        } else if (connectorType == 'composition') {
          object = new CompositionConnector(options, jsonModel, this);
        } else if (connectorType == 'dependency') {
          object = new DependencyConnector(options, jsonModel, this);
        } else if (connectorType == 'generalization') {
          object = new GeneralizationConnector(options, jsonModel, this);
        } else if (connectorType == 'nested') {
          object = new NestedConnector(options, jsonModel, this);
        }
        // Connector for the note
        else if (connectorType == 'anchor') {
          object = new AnchorConnector(options, jsonModel, this);
        }
        return object;
      }
}

export { PackageDiagram }