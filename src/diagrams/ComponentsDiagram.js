import { BaseDiagram } from './BaseDiagram.js';
import { NoteElement } from '../elements/NoteElement.js';
import { ComponentElement } from '../elements/component/ComponentElement.js';
import { PackageElement } from '../elements/PackageElement.js';
import { PortElement } from '../elements/component/ComponentPortElement.js';
import { InterfaceElement } from '../elements/component/ComponentInterfaceElement.js';
import { InstanceSpecificationElement } from '../elements/InstanceSpecificationElement.js';

const defaultOptions = {
    nameTemplate: 'componentsDiagram',
    type: 'component',
    acceptElements: ['component', 'port', 'interface', 'instance_specification', 'note']
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
}

export { ComponentsDiagram }