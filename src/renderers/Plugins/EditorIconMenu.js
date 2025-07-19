import configLoader from '../../utils/ConfigLoader';

class EditorIconMenu {
  constructor(diagram, blackboard) {
    this.diagram = diagram;
    this.blackboard = blackboard;

    this.elementStyle = {};
    this.connectorStyle = {};

    // subscribe for events
    this.init(diagram, blackboard);
  }

  //
  // Add common icon menu for diagram
  //
  init(diagram, blackboard) {
    //
    // TODO: Preload config data
    //
    this.blackboard.addEventListener(
        'element:click', this.onShowMenu.bind(this));

    this.blackboard.addEventListener(
        'diagram:contextmenu', this.onHideMenu.bind(this));
    this.blackboard.addEventListener(
        'element:contextmenu', this.onHideMenu.bind(this));
    this.blackboard.addEventListener(
        'connector:contextmenu', this.onHideMenu.bind(this));

    // Changed selection => menu should be disabled
    this.blackboard.addEventListener(
        'diagram:click', this.onDisableMenu.bind(this));
    this.blackboard.addEventListener(
        'connector:click', this.onDisableMenu.bind(this));

    // Hide menu on element resize
    this.blackboard.addEventListener(
        'element:resize:start', this.onHideMenu.bind(this));

    // Hide menu on drag start
    this.blackboard.addEventListener(
        'element:drag:start', this.onHideMenu.bind(this));
    this.blackboard.addEventListener(
        'connector:drag:start', this.onHideMenu.bind(this));

    // Hide menu on drag/resize Start
    // and update icon menu position on Stop
    this.blackboard.addEventListener(
        'element:resize:stop', this.onElementReposition.bind(this));
    this.blackboard.addEventListener(
        'element:drag:stop', this.onElementReposition.bind(this));

    this.isEditMode = blackboard.getStorageValue("editmode");
    // Disable/enable sortable and resizeable areas
    blackboard.addEventListener(
      'storage:editmode', this.onEditModeChange.bind(this));

    blackboard.addEventListener(
      'storage:element:style', this.onElementStyleChange.bind(this));
    blackboard.addEventListener(
      'storage:connector:style', this.onConnectorStyleChange.bind(this));
  }

  onConnectorStyleChange(dataDiff) {
    this.connectorStyle = dataDiff.newValue || {};
  }

  onElementStyleChange(dataDiff) {
    this.elementStyle = dataDiff.newValue || {};
  }

  onEditModeChange(change) {
    if (this.isEditMode == change.newValue)
      // nothing change
      return;

    this.isEditMode = change.newValue;
    if (!this.isEditMode) {
      this.onDisableMenu();
    }
  }

  loadMenu(menuJson) {
    const menu_id = menuJson.id;
    if ($('#' + this.diagram.euid + ' .elmenu-' + menu_id).is('div')) {
      return menu_id;
    }

    var htmlIcons = [];
    const items = menuJson.items;
    for (var c in items) {
      let item = items[c];
      for (var r in item['cs'])  // connector descriptor
        if (item['cs'][r].svg) {
          htmlIcons.push(
            '<div  id=\'' +
            item['cs'][r].connector +  // unique ID == connection type
            '\' title=\'' + (item['cs'][r]['alt'] || item['cs'][r].connector) +  // hover tip
            '\' element=\'' + item['el'] +             // element to create
            '\' class="us-icon-menu-svg-wrapper">' + item['cs'][r].svg + '</div>');

        } else {
          htmlIcons.push(
            '<div class=\'icons-sprite ' +
            item['cs'][r].css +  // Sprite icon css
            '\' id=\'' +
            item['cs'][r].connector +  // unique ID == connection type
            '\' title=\'' + item['cs'][r].connector +  // hover tip
            '\' element=\'' + item['el'] +             // element to create
            '\'></div>');
        }
    }

    var cells = htmlIcons.join('');

    // Append menu to the diagram
    $('#' + this.diagram.euid)
        .append(
            '<div style=\'position:absolute;top:0px;left:0px;z-index:19999998;display:flex;\' class=\'elmenu-' +
            menu_id + '\'>' + cells + '</div>');

    var iconMenuBuilder = this;

    // Make it possible to click + drag images
    // ==========================================================================
    //               THERE ARE TWO CALL's HERE FOR DRAGGABLE!!!!!
    //               IT IS NECESSARY TO JOIN THEM - OR DESCRIBE THE DIFFERENCE
    //               :) ONE FOR USUAL MENU AND ANOTHER ONE FOR SELF-CONNECTABLE
    //               ITEMS WHICH DOESN'T REQUIRE THE 2-nd ELEMENT
    var kl;
    $('#' + this.diagram.euid + ' .elmenu-' + menu_id + ' div')
        .draggable({
          'appendTo': '#' + this.diagram.euid,
          'helper': function(event) {
            // Use the double wrapper because of element's structrure
            return $(
                '<div id=\'ConnectionHelper_Border\' style=\'border:solid black;border-width:1px;\'>' +
                '<div id=\'ConnectionHelper\' style=\'border:solid yellow;border-width:1px;\'> [ x ]</div></div>');
          },
          'start': function(event) {
            if (iconMenuBuilder.diagram) {
              var tid = $(this).attr('element');

              var element = tid,  // iconMenuBuilder.dmb.getElementById(tid),
                  lcon =
                      this.id;  // iconMenuBuilder.dmb.getConnectorById(this.id);

              // Do not need to pre-load element
              // if (element != undefined)
              //  dm.dm.loader.LoadElement(element);
              //			if ((lcon != undefined) &&
              //(lcon['oneway'])) {
              //		  $.log("CONNECTOR: " + lcon.connector);
              //	  iconMenuBuilder.diagram.Connector(lcon.connector,
              //	  {'fromId': iconMenuBuilder.currentElement,
              //'toId': iconMenuBuilder.currentElement});
              //			} else {
              iconMenuBuilder.diagram.Connector(this.id, {
                epoints: [
                  {x: 0, y: 0, euid: iconMenuBuilder.currentElementEuid, id:iconMenuBuilder.currentElementId},
                  {x: 100, y: 100, euid: 'ConnectionHelper'}
                ]
              });
              //		}
            } else {
              return false;
            }
          },
          'drag': function(event, ui) {
            // Force diagram to re-draw connectors
            if (iconMenuBuilder.diagram) {
              iconMenuBuilder.diagram.draw();
            }
          },
          'stop': function(event, ui) {
            if (!iconMenuBuilder.diagram) return false;

            var tid = $(this).attr('element'),
                jsonModel = {},  //$.extend({},
                                 //iconMenuBuilder.dmb.getElementById(tid)),
                lcon =
                    this.id;  // iconMenuBuilder.dmb.getConnectorById(this.id);

            if ((iconMenuBuilder.currentElement != undefined) &&
                ((lcon == undefined) || (!lcon['oneway']))) {
              // Remove the temporary connector
              iconMenuBuilder.diagram.removeConnector(
                  iconMenuBuilder.currentElement.euid, 'ConnectionHelper',
                  this.id);
              jsonModel.left = ui.position.left;
              jsonModel.top = ui.position.top;
              var fromElement = iconMenuBuilder.currentElement;
              var thisid = this.id;
              var expected_type = tid;

              //
              // Local helper method
              //
              var handleConnector = function(toElement, isElFound) {

                iconMenuBuilder.diagram.Connector(
                    thisid,
                    {
                      epoints: [
                        {x: 100, y: 100, id: fromElement.jsonModel["id"], euid: fromElement.euid},
                        {x: 100, y: 200, id: toElement.jsonModel["id"], euid: toElement.euid},
                      ],
                      ...iconMenuBuilder.connectorStyle
                    },
                    // {'fromId': fromElement.jsonModel["id"], 'toId': toElement.jsonModel["id"], ...iconMenuBuilder.connectorStyle},
                    function(connector) {
                      if (fromElement.dropHelper)
                        fromElement.dropHelper(
                            ui, connector, {isElFound: true});
                      if (toElement.dropHelper)
                        toElement.dropHelper(
                            ui, connector,
                            {isElFound: isElFound, expected: expected_type});
                      if (connector._updateEPoints)
                        connector._updateEPoints(ui);
                    });  // Connector
              };
              // Create an element or get element which was drop on
              var el = iconMenuBuilder.diagram._dropConnector(ui);
              if (!el) {

                
                let clone =  {...jsonModel, ...iconMenuBuilder.elementStyle};
                console.log("CREATING ELEMENT: " +tid, clone);
                el = iconMenuBuilder.diagram.Element(tid, clone);
              }

              handleConnector(el, true);

              //
              // Force Re-draw connectors
              //
              iconMenuBuilder.diagram.draw();
            }
          }
        })
        .parent()
        .mouseenter(function() {
          $(this).stop().animate({opacity: '1'});
        })
        .mouseleave(function() {
          $(this).stop().animate({opacity: '0'});
        });

    return menu_id;
    // Hide the element
    // $(' .elmenu-' + menu_id).css({opacity:"0"});
  }

  //
  // User dropped draggable icon on some element
  //
  handleConnector(element, flag) {}


  activeMenuId = null;
  onShowMenu(element, data) {
    //
    // It is not an edit mode. Do not show any icon menu, just exit
    //
    if (data.ctrl || !this.isEditMode) {
      this.onHideMenu();
      return;
    }

    // Cache clicked element
    this.currentElement = element;
    this.currentElementId = element.jsonModel["id"];
    this.currentElementEuid = element.euid;
    //
    // User should select element to see connectors icon menu
    //
    // if (!element.options.selected) {
    //  return;
    // }

    // Load menu if it is available in the configuration
    let menuJson =
        configLoader.getElementIconsMenu(element.options.nameTemplate);

    // Sate machine diagram has the same menu for almost all elements
    // no need to make a multiple instances of the the icon row and corresponding JSONs
    if (!menuJson && element.options.iconMenu) {
      menuJson =
        configLoader.getElementIconsMenu(element.options.iconMenu);
    }
    if (menuJson) {
      let menuId = this.loadMenu(menuJson);
      if (menuId) {
        // Hide another menu type, otherwise user could see 2 menus
        if (this.activeMenuId && this.activeMenuId != menuId) {
          this.onDisableMenu();
        }
        // Cached menu id to hide by id
        this.activeMenuId = menuId;

        this.onElementReposition(element);

        this.onEnableMenu();
      }
    }

    // User does not press ctrl button
    // let's load icon menu
  }

  onElementReposition(element) {
    // another element was changed
    if (!this.activeMenuId || this.currentElement !== element) {
      return;
    }

    let offset = this.diagram.getDiagramOffset();
    var $el = $('#'+ element.euid + "_Border");
        var pz = $el.position(),
			  x = pz.left + 20,
			  y = pz.top;
        $(".elmenu-" + this.activeMenuId).stop().css("left", x + offset.left).css("top", y + offset.top - 30).animate({opacity:"1"});
  }

  onEnableMenu() {
    if (!this.activeMenuId)
      return;
    $(".elmenu-" + this.activeMenuId).show();
  }

  onDisableMenu() {
    if (!this.activeMenuId)
      return;
    $(".elmenu-" + this.activeMenuId).hide();
    this.activeMenuId = null;
  }

  onHideMenu() {
    if (!this.activeMenuId)
      return;
    // Let's hide icon menu
    $(".elmenu-" + this.activeMenuId).animate({opacity:"0"});
  }
}

export {EditorIconMenu}