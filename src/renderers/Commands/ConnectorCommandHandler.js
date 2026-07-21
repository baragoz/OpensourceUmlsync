import { BaseConnector } from "../../connectors/BaseConnector";
import { ConnectorLabels } from "../Plugins/ConnectorLabels";

/**
 * Adds a field to a class element.
 * @param {BaseConnector} connector - an instance of any class which extend the BaseConnector
 * @return {ConnectorLabels | null} data - The data containing field information.
 */
function getConnectorLabelsPlugin(connector) {
  if (connector) {
    return connector.getUserData("plugin-connector-labels");
  }
  return null;
}

/**
 * Adds a field to a class element.
 * @param {BaseConnector} connector - an instance of any class which extend the BaseConnector
 * @param {object} data - The data containing field information.
 */
function addConnectorLabelCommandHandler(connector, data) {
  let cc = getConnectorLabelsPlugin(connector);
  if (cc) cc.onAddLabel(data);
}

/**
 * Trigger an edit of connector's label
 * @param {BaseConnector} connector - an instance of any class which extend the BaseConnector
 * @data {any}
 **/
function editConnectorLabelCommandHandler(connector, data) {
  let cc = getConnectorLabelsPlugin(connector);
  if (cc) cc.onEditLabel(data);
}

/**
 * Remove connector's label
 * @param {BaseConnector} connector - an instance of any class which extend the BaseConnector
 * @data {any}
 **/
function removeConnectorLabelCommandHandler(connector, data, extraData) {
  let cc = getConnectorLabelsPlugin(connector);
  if (cc) cc.onRemoveLabel(data, extraData);
}

/**
 * Remove connector with all labels
 * @param {BaseConnector} connector - an instance of any class which extend the BaseConnector
 * @data {any}
 **/
function removeConnectorCommandHandler(connector, data) {
  if (connector && connector.diagram) {
    let tmp = connector.diagram;
    tmp.removeConnectorByEuid(connector.euid, data);
  }
}

export {
  // Remove connector
  removeConnectorCommandHandler,

  // Add/Edit/Remove connector's label
  addConnectorLabelCommandHandler,
  editConnectorLabelCommandHandler,
  removeConnectorLabelCommandHandler,
};
