// Base
import {BaseDiagram} from '../diagrams/BaseDiagram.js';
// Connectors
import {AggregationConnector} from '../connectors/AggregationConnector.js';
import {AnchorConnector} from '../connectors/AnchorConnector.js';
import {AssociationConnector} from '../connectors/AssociationConnector.js';
import { CompositionConnector } from '../connectors/CompositionConnector.js';
import { DependencyConnector } from '../connectors/DependencyConnector.js';
import { GeneralizationConnector } from '../connectors/GeneralizationConnector.js';
import { NestedConnector } from '../connectors/NestedConnector.js';
import { RealizationConnector } from '../connectors/RealizationConnector.js';
import { SelfAssociationConnector } from '../connectors/SelfAssociationConnector.js';
// Elements
import {ClassElement} from '../elements/ClassElement.js';
import {NoteElement} from '../elements/NoteElement.js';
import {PackageElement} from '../elements/PackageElement.js';
import {PackageSubsystemElement} from '../elements/PackageSubsystemElement.js';


const overrideDefaultOptions = {
  nameTemplate: 'classDiagram',
  type: 'class',
  acceptElements: ['class', 'package', 'subsystem', 'note'],
  acceptConnectors: ['aggregation', 'association', 'selfassociation',
    'realization', 'composition', 'dependency', 'generalization', 'anchor'],
  editable: true
};

class ClassDiagram extends BaseDiagram {
  //
  //  Width/Height could be modified via jsonModel options,
  //  or updated via setDimention
  //
  constructor(jsonModel, constructorOptions, observer) {
    super(overrideDefaultOptions, jsonModel, constructorOptions, observer);
    
  }

  createElement(elementType, jsonModel, options) {
    let object = null;
    if (elementType == 'class') {
      object = new ClassElement(options, jsonModel, this);
    } else if (elementType == 'package') {
      object = new PackageElement(options, jsonModel, this);
    } else if (elementType == 'subsystem') {
      object = new PackageSubsystemElement(options, jsonModel, this);
    } else if (elementType == 'note') {
      object = new NoteElement(options, jsonModel, this);
    }
    return object;
  }

  createConnector(connectorType, jsonModel, options) {
    let object = null;
    if (connectorType == 'aggregation') {
      object = new AggregationConnector(options, jsonModel, this);
    } else if (connectorType == 'association') {
      object = new AssociationConnector(options, jsonModel, this);
    } else if (connectorType == 'selfassociation') {
      object = new SelfAssociationConnector(options, jsonModel, this);
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

export {ClassDiagram}