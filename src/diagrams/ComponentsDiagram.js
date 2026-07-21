import { BaseDiagram } from "./BaseDiagram.js";
import { NoteElement } from "../elements/NoteElement.js";
import { ComponentElement } from "../elements/component/ComponentElement.js";
import { ComponentSubsystemElement } from "../elements/component/ComponentSubsystemElement.js";
import { PackageElement } from "../elements/PackageElement.js";
import { PortElement } from "../elements/component/ComponentPortElement.js";
import { InterfaceElement } from "../elements/component/ComponentInterfaceElement.js";
import { InstanceSpecificationElement } from "../elements/InstanceSpecificationElement.js";
import { AssemblyConnector } from "../connectors/AssemblyConnector.js";
import { AssociationConnector } from "../connectors/AssociationConnector.js";
import { RealizationConnector } from "../connectors/RealizationConnector.js";
import { DependencyConnector } from "../connectors/DependencyConnector.js";
import { AnchorConnector } from "../connectors/AnchorConnector.js";
import { NestedConnector } from "../connectors/NestedConnector.js";

const defaultOptions = {
  nameTemplate: "componentsDiagram",
  type: "component",
  acceptElements: [
    "component",
    "component_subsystem",
    "port",
    "interface",
    "instance_specification",
    "note",
  ],
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
    if (elementType == "component") {
      object = new ComponentElement({}, jsonModel, this);
    } else if (elementType == "component_subsystem") {
      object = new ComponentSubsystemElement({}, jsonModel, this);
    } else if (elementType == "port") {
      object = new PortElement({}, jsonModel, this);
    } else if (elementType == "interface") {
      object = new InterfaceElement({}, jsonModel, this);
    } else if (elementType == "instance_specification") {
      object = new InstanceSpecificationElement({}, jsonModel, this);
    } else if (elementType == "note") {
      object = new NoteElement({}, jsonModel, this);
    }
    return object;
  }

  createConnector(connectorType, jsonModel, options) {
    let object = null;
    if (connectorType == "association") {
      object = new AssociationConnector(options, jsonModel, this);
    } else if (connectorType == "realization") {
      object = new RealizationConnector(options, jsonModel, this);
    } else if (connectorType == "dependency") {
      object = new DependencyConnector(options, jsonModel, this);
    } else if (connectorType == "assembly") {
      object = new AssemblyConnector(options, jsonModel, this);
    } else if (connectorType == "nested") {
      object = new NestedConnector(options, jsonModel, this);
    }
    // Connector for the note
    else if (connectorType == "anchor") {
      object = new AnchorConnector(options, jsonModel, this);
    }
    return object;
  }

  //
  // Nest a component/subsystem dropped fully inside another component,
  // or snap a port onto the border of the component it was dropped on.
  //
  handleElementDragStop(element, ui) {
    if (!element.options.droppable) {
      return;
    }

    if (element.options.nameTemplate === "port") {
      const parent = this.checkOverlappingElement(element);
      if (parent) {
        this.#snapPortToBorder(element, parent);
      }
      this.reparentDroppedElement(element, parent);
      return;
    }

    const parent = this.checkDroppableElement(element);
    this.reparentDroppedElement(element, parent);
  }

  //
  // Move the port so its center lands on the nearest edge of the
  // parent component's border.
  //
  #snapPortToBorder(element, parent) {
    const dp = element.nativeBorderRef.position();
    const ds = {
      width: element.nativeBorderRef.width(),
      height: element.nativeBorderRef.height(),
    };
    const p = parent.nativeBorderRef.position();
    const sz = {
      width: parent.nativeBorderRef.width(),
      height: parent.nativeBorderRef.height(),
    };

    const cx = dp.left + ds.width / 2;
    const cy = dp.top + ds.height / 2;

    const distTop = Math.abs(cy - p.top);
    const distBottom = Math.abs(cy - (p.top + sz.height));
    const distLeft = Math.abs(cx - p.left);
    const distRight = Math.abs(cx - (p.left + sz.width));
    const nearest = Math.min(distTop, distBottom, distLeft, distRight);

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    let newCenterX = cx;
    let newCenterY = cy;

    if (nearest === distTop) {
      newCenterY = p.top;
      newCenterX = clamp(cx, p.left, p.left + sz.width);
    } else if (nearest === distBottom) {
      newCenterY = p.top + sz.height;
      newCenterX = clamp(cx, p.left, p.left + sz.width);
    } else if (nearest === distLeft) {
      newCenterX = p.left;
      newCenterY = clamp(cy, p.top, p.top + sz.height);
    } else {
      newCenterX = p.left + sz.width;
      newCenterY = clamp(cy, p.top, p.top + sz.height);
    }

    const newLeft = newCenterX - ds.width / 2;
    const newTop = newCenterY - ds.height / 2;

    element.nativeBorderRef.css({ left: newLeft, top: newTop });
    element.jsonModel.left = newLeft;
    element.jsonModel.top = newTop;
  }
}

export { ComponentsDiagram };
