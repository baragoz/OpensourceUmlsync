import configLoader from '../../utils/ConfigLoader';

class EditorContextMenu {
  constructor(diagram, blackboard, editorConfig) {
    this.diagram = diagram;
    this.blackboard = blackboard;
    this.editorConfig = editorConfig;

    this.init();
  }

  //
  // Trigger context menu events
  //
  init() {
    // TODO: Pre-load context menu data for diagram

    // Add menu preload logic here

    // Show menu
    this.blackboard.addEventListener(
        'diagram:contextmenu', this.onDiagramContextMenu.bind(this));
    this.blackboard.addEventListener(
        'element:contextmenu', this.onElementContextMenu.bind(this));
    this.blackboard.addEventListener(
        'connector:contextmenu', this.onConnectorContextMenu.bind(this));
    this.blackboard.addEventListener(
        'connector:label:contextmenu', this.onConnectorLabelContextMenu.bind(this));


    // Class menu
    this.blackboard.addEventListener(
      'class:method:contextmenu', this.onClassMethodContextMenu.bind(this));
    this.blackboard.addEventListener(
      'class:field:contextmenu', this.onClassFieldContextMenu.bind(this));

    // Hide menu on regular click
    this.blackboard.addEventListener(
        'diagram:click', this.onHideMenu.bind(this));
    this.blackboard.addEventListener(
        'diagram:scroll:start', this.onHideMenu.bind(this));
    this.blackboard.addEventListener(
        'diagram:dbclick', this.onHideMenu.bind(this));
  
    this.blackboard.addEventListener(
        'element:click', this.onHideMenu.bind(this));
    this.blackboard.addEventListener(
        'connector:click', this.onHideMenu.bind(this));

    // Hide menu on element resize
    this.blackboard.addEventListener(
        'element:resize:start', this.onHideMenu.bind(this));

    // Hide menu on drag start
    this.blackboard.addEventListener(
        'element:drag:start', this.onHideMenu.bind(this));
    this.blackboard.addEventListener(
        'connector:drag:start', this.onHideMenu.bind(this));

    // Disable/enable sortable and resizeable areas
    this.isEditMode = this.blackboard.getStorageValue("editmode");
    this.blackboard.addEventListener(
          'storage:editmode', this.onEditModeChange.bind(this));
    
  }

  onEditModeChange(change) {
    if (this.isEditMode == change.newValue)
      // nothing change
      return;

    this.isEditMode = change.newValue;
    if (!this.isEditMode) {
      this.onHideMenu();
    }
  }


  loadMenu(menuJson) {
    const menu_id = menuJson.id;
    if ($('#' + this.diagram.euid + ' .ctx-menu-' + menu_id).is('div')) {
      return menu_id;
    }

    var htmlIcons = [];
    for (var c in menuJson['commands']) {
      let item = menuJson['commands'][c];
      if (item.title == "---") {
        htmlIcons.push('<hr class="divider"></hr>');
      } else {
        htmlIcons.push(
            '<li data-handler=' + item['handler'] + '>' + item['title'] + '</li>');
      }
    }

    var menuItems = htmlIcons.join('');

    // Append menu to the diagram
    $('#' + this.diagram.euid)
        .append(
            '<div class=\'us-context-menu ctx-menu-' +
            menu_id + '\'><ul>' + menuItems + '</ul></div>');
    
    let self = this;
    $('#' + this.diagram.euid + ' .ctx-menu-' + menu_id + '>ul>li').on('click', function () {
        var handlerName = $(this).data('handler'); // Get the handler name
        console.log("CLICKED ON THE CONTEXT MENU " + handlerName);
        if (handlerName && handlerName !== "" && self.currentElement != null) {
          console.log("CLICKED ON THE CONTEXT MENU OK, got to command ", self.currentElement);
          console.log("Current Data is ",  self.currentData);
          configLoader.executeCommand(handlerName, self.currentElement, self.currentData);
        }
    });
    // TODO: add command send on click
    return menu_id;
  }

  onDiagramContextMenu(diagram, data) {
    this.onCommonContextMenu("diagram", diagram, null, data);
  }

  onElementContextMenu(element, data) {
    this.onCommonContextMenu("element", element, null, data);
  }

  onConnectorContextMenu(connector, data) {
    this.onCommonContextMenu("connector", connector, null, data);
  }

  onConnectorLabelContextMenu(connector, data) {
    this.onCommonContextMenu("connector:label", connector, null, data);
  }

  //
  // Class specific context menus
  //
  onClassMethodContextMenu(element, data) {
    this.onCommonContextMenu("element", element, "class:method" , data);
  }

  onClassFieldContextMenu(element, data) {
    this.onCommonContextMenu("element", element, "class:field", data)
  }

  getContextMenuFor(defaultTarget, elementTarget, subTarget) {
    console.log("GET CONTEXT MENU FOR: " + defaultTarget + "  " + elementTarget + "  " + subTarget);
    return configLoader.getTargetContextMenu(defaultTarget, elementTarget, subTarget);
    /*
    if (target == "element") {
        return configLoader.getElementContextMenu(diagramItem.options.nameTemplate);
    } else if (target == "connector") {
      return configLoader.getConnectorContextMenu(diagramItem.options.nameTemplate);
    } else if (target == "diagram") {
      return configLoader.getDiagramContextMenu(diagramItem.options.nameTemplate);
    } */
  }


  onCommonContextMenu(baseTarget, element, subTartget, data) {
    //
    // Do nothing if it is ctrl + cotext menu
    // TODO: no idea if we need to show menu in that case
    // 
    // TODO: remove !isEditMode, if we define an 
    //
    if ((data && data.ctrl) || !this.isEditMode) {
      this.onHideMenu();
      return;
    }

    // Cache clicked element
    this.currentElement = element;
    this.currentData = data;
    this.currentElementId = element.jsonModel['id'];
    //
    // User should select element to see connectors icon menu
    //
    // if (!element.options.selected) {
    //  return;
    // }

    // Load menu if it is available in the configuration
    const menuJson = this.getContextMenuFor(baseTarget, element.options.nameTemplate, subTartget);
    if (menuJson) {
      console.log("DRAWING CONTEXT MENU:", menuJson);
      let menuId = this.loadMenu(menuJson);
      if (menuId) {
        $('.us-context-menu').hide();

        console.log("DRAWING CONTEXT MENU + " + menuId);
        // Relay on provided data position
        $('.ctx-menu-' + menuId)
            .stop()
            .css('left', data.x)
            .css('top', data.y)
            .animate({opacity: '1'});

        // Hide another menu type, otherwise user could see 2 menus
        if (this.activeMenuId && this.activeMenuId != menuId) {
          this.onDisableMenu();
        }
        // Cached menu id to hide by id
        this.activeMenuId = menuId;

        this.onEnableMenu();
      }
    }
  }

  onEnableMenu() {
    if (!this.activeMenuId) return;
    $('.ctx-menu-' + this.activeMenuId).show();
  }

  onDisableMenu() {
    if (!this.activeMenuId) return;
    $('.ctx-menu-' + this.activeMenuId).hide();
    this.activeMenuId = null;
  }

  onHideMenu() {
    // Let's hide icon menu
    $('.us-context-menu').hide();
    // Reset data
    this.currentElement = null;
    this.currentData = null;
    this.currentElementId = -1;
  }

}

export {EditorContextMenu};
