// Manually import JSON files
import classDiagram from "../assets/configs/mainmenu/classDiagram.json";
import componentsDiagram from "../assets/configs/mainmenu/componentsDiagram.json";
import packageDiagram from "../assets/configs/mainmenu/packageDiagram.json";
import sequenceDiagram from "../assets/configs/mainmenu/sequenceDiagram.json";
import stateDiagram from "../assets/configs/mainmenu/stateDiagram.json";

// Icons Menu configuration
import classIcons from "../assets/configs/iconsmenu/class.json";
import noteIcons from "../assets/configs/iconsmenu/note.json";
// bad name for the node-based project
import packageIcons from "../assets/configs/iconsmenu/packageIconsMenu.json";
import stateIcons from "../assets/configs/iconsmenu/state.json";
import stateStartIcons from "../assets/configs/iconsmenu/statestart.json";

import componentIcons from "../assets/configs/iconsmenu/component.json";


// Context Menu configuration
import contextMenuConfig from "../assets/configs/contextmenu/common.json"

class ConfigLoader {
  constructor() {
    // Store all imported JSONs inside an object
    this.sideMenuConfig = {
      classDiagram,
      componentsDiagram,
      packageDiagram,
      sequenceDiagram,
      stateDiagram
    };

    this.iconsMenuConfig = {
      class: classIcons,
      note: noteIcons,
      package: packageIcons,
      component: componentIcons,
      state: stateIcons,
      statestart: stateStartIcons
    }

    this.contextMenuConfig = contextMenuConfig;

  }

  /**
   * Retrieves a configuration JSON by name.
   * @param {string} name - The name of the JSON file (without extension).
   * @returns {Object|null} The parsed JSON object or null if not found.
   */
  getConfig(name) {
    return this.sideMenuConfig[name] || null;
  }

  getElementIconsMenu(name) {
    return this.iconsMenuConfig[name] || null;
  }

  getTargetContextMenu(baseItem, exectItem, subItemOfExectItem) {
    let menu =  null;

    //
    // Check for sub-context menu for methods and fields of class element
    //
    if (subItemOfExectItem) {
      menu = this.#getContextMenuFor(subItemOfExectItem);
    }

    //
    // Check element/diagram specific menu
    //
    if (!menu && exectItem) {
      menu = this.#getContextMenuFor(exectItem);
    }

    //
    // Element does not have own menu, use default menu
    //
    if (!menu && baseItem) {
      menu = this.#getContextMenuFor(baseItem);
    }

    //
    // TODO: Make a recursion in the future,
    //       but for a while, it is enough to have a single level of extend
    //
    if (menu && menu.extend !== "") {
          // Get the list of command which it is extend
          let tmp2 = this.#getContextMenuFor(menu.extend, false);
          // Extend the list of commands
          menu.commands = [...tmp2.commands, {
            "title": "---",
            "handler": ""
          }, ...menu.commands];
    }
    return menu;
  }

  #getContextMenuFor(target, addSuffix = true) {
    let compare = target + (addSuffix ? ":contextmenu": "");
    for (let i = 0; i < this.contextMenuConfig.items.length; i++) {
      if (this.contextMenuConfig.items[i]["event"] == compare) {
        let tmp = this.contextMenuConfig.items[i];
        // clone tmp
        tmp = {...tmp};
        return tmp;
      }
    }
    return null;
  }

  getElementContextMenu(name) {
    const compare = name + ":contextmenu";
    const defaultMenu = "element:contextmenu";
    let cached = null;
    for (let i = 0; i < this.contextMenuConfig.items.length; i++) {
      if (this.contextMenuConfig.items[i]["event"] == compare) {
        let tmp = this.contextMenuConfig.items[i];

        if (tmp.extend !== "") {
          // Get the list of command which it is extend
          let tmp2 = this.getElementContextMenu(tmp.extend);
          // Extend the list of commands
          tmp.commands = [...tmp2.commands, {
            "title": "---",
            "handler": ""
          }, ...tmp.commands];
        }
        return tmp;
      }
      if (this.contextMenuConfig.items[i]["event"] == defaultMenu) {
        cached = this.contextMenuConfig.items[i];
      }
    }
    return cached;
  }

  //
  // Add command handler
  //
  registerdCommands = new Map();
  addCommand(name, handler) {
     this.registerdCommands[name] = handler;
  }

  executeCommand(name, data, extraData) {
    if (!this.registerdCommands[name]) {
      console.log("Unregistered command name:", name);
      return;
    }
    let f = this.registerdCommands[name];
    if (typeof f === "function") {
      f(data, extraData);
    } else {
      console.log("Command is not a function:", name);
    }
  }

  extendContextMenu(path, title, command) {
     // TODO: implement an extension point for the context menu
  }
}

// Create a singleton instance (optional)
const configLoader = new ConfigLoader();

export default configLoader;
