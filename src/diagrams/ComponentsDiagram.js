import { BaseDiagram } from './BaseDiagram.js';
import { NoteElement } from '../elements/NoteElement.js';
import { ComponentElement } from '../elements/component/ComponentElement.js';
import { ComponentSubsystemElement } from '../elements/component/ComponentSubsystemElement.js';
import { PackageElement } from '../elements/PackageElement.js';
import { PortElement } from '../elements/component/ComponentPortElement.js';
import { InterfaceElement } from '../elements/component/ComponentInterfaceElement.js';
import { InstanceSpecificationElement } from '../elements/InstanceSpecificationElement.js';
import { AssemblyConnector } from '../connectors/AssemblyConnector.js';
import { AssociationConnector } from '../connectors/AssociationConnector.js';
import { RealizationConnector } from '../connectors/RealizationConnector.js';
import { DependencyConnector } from '../connectors/DependencyConnector.js';
import { AnchorConnector } from '../connectors/AnchorConnector.js';
import { NestedConnector } from '../connectors/NestedConnector.js';

const defaultOptions = {
    nameTemplate: 'componentsDiagram',
    type: 'component',
    acceptElements: ['component', 'component_subsystem', 'port', 'interface', 'instance_specification', 'note']
};

class ComponentsDiagram extends BaseDiagram {
    //
    //  Width/Height could be modified via jsonModel options
    //
    constructor(jsonModel, parentId, observer) {
        super(defaultOptions, jsonModel, parentId, observer);
    }

    createElement(elementType, jsonModel) {
        let object = null;
        if (elementType == 'component') {
            object = new ComponentElement({}, jsonModel, this);
        } else if (elementType == 'component_subsystem') {
            object = new ComponentSubsystemElement({}, jsonModel, this);
        } else if (elementType == 'port') {
            object = new PortElement({}, jsonModel, this);
        } else if (elementType == 'interface') {
            object = new InterfaceElement({}, jsonModel, this);
        } else if (elementType == 'instance_specification') {
            object = new InstanceSpecificationElement({}, jsonModel, this);
        } else if (elementType == 'note') {
            object = new NoteElement({}, jsonModel, this);
        }
        return object;
    }

    createConnector(connectorType, jsonModel, options) {
        let object = null;
        if (connectorType == 'association') {
            object = new AssociationConnector(options, jsonModel, this);
        } else if (connectorType == 'realization') {
            object = new RealizationConnector(options, jsonModel, this);
        } else if (connectorType == 'dependency') {
            object = new DependencyConnector(options, jsonModel, this);
        } else if (connectorType == 'assembly') {
            object = new AssemblyConnector(options, jsonModel, this);
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

export { ComponentsDiagram }