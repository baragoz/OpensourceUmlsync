class ContextMenuBuilder {
  diagram = null;
  constructor() {}

  // Blackboard listener
  onBlackboardChang(key, data) {
    if (key == "diagram:add") {
      this.diagram = data;
    } else if (key == "element:add") {
      this.preloadMenu(element.options.nameTemplate, this.diagram);
    }
    //
    // hide current menu, because use clicked outside on diagram's empty space
    //
    else if (key in ["dialog:click", "dialog:dblclick"]) {
      this.#resetCurrentMenu();
    }
  }

  preloadMenu(nameTemplate, diagram) {
    this.diagram = diagram;
    var name = this.#getMenuId(
      nameTemplate,
      diagram ? diagram.options.nameTemplate : null,
    );
    if (this.menus[name] == undefined) this.createContextMenu(name);
  }

  createContextMenu(name) {}

  #getMenuId(nameTemplate, diagramNameTemplate) {
    //
    // All acceptable elements should be in config
    //
    if (this.config[nameTemplate]) {
      return this.config[nameTemplate].menu;
    }
    //
    // All connectors has the same context menu
    //
    if (nameTemplate.indexOf("Connector") > 0) {
      return "connector";
    }
    // most of the elements has a default menu
    return "default";
  }

  show(element, subelement, left, top) {
    // show context menu for element
  }

  #resetCurrentMenu() {
    if (!this.currentMenu) {
      this.currentMenu.hide();
      this.currentMenu = null;
      this.currentElement = null;
    }
  }

  appendMenu(key, value) {
    this.menus[key] = value;
  }

  visit(element, x, y) {
    //
    // Do nothing, user is on the same element. Is it possible ?
    //
    if (this.currentElement == element) {
      return;
    }
    // hide previous element
    this.#resetCurrentMenu();

    const diagramName = this.diagram ? this.diagram.options.nameTemplate : null;
    var name = this.#getMenuId(element.options.nameTemplate, diagramName);

    //
    // menu was not loaded or has some issues
    //
    if (this.menus[name] == undefined) return;

    this.currentMenu = this.menus[name];
    this.currentElement = element;
    this.currentMenu.show(element, x, y);
  }

  hide(element, subelement) {
    // hide
  }

  hideAll() {
    if (this.currentMenu != undefined) this.currentMenu["hide"]();
    this.currentMenu = undefined;
    this.currentElement = undefined;
  }
}

export { ContextMenuBuilder };
