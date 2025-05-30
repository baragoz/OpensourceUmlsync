import {BaseConnector} from '../../connectors/BaseConnector';
import {BaseDiagramItem} from '../../core/BaseDiagramItem';
import { BaseDiagram } from '../../diagrams/BaseDiagram';
import {BaseElement} from '../../elements/BaseElement';
import { Blackboard } from '../../utils/Blackboard';
import configLoader from '../../utils/ConfigLoader';

import {PreviewAlignComponent} from './components/PreviewAlignComonent';
import {PreviewColorPickerComponent} from './components/PreviewColorPickerComponent';
import {PreviewDiagramItemsDropdownComponent} from './components/PreviewDiagramItemsDropdownComponent';
import {PreviewStyleCarouselComponent} from './components/PreviewStyleCarouselComponent';
import {PreviewStyleComponent} from './components/PreviewStyleComponent';

const defaultState = {
  // toggle for select/default
  isSelectMode: false,
  // hideable elements
  showElementRow: false,
  showConnectorRow: false,
  showStyleRow: false,
  showStyleDefault: false,

  hasElement: true,
  hasConnector: true,

  showPinIcon: false,

  // pin rows
  pinRows: false,
};

class EditorDetachedToolbarMenu {
    /**
     * 
     * @param { string } placeholder 
     * @param { BaseDiagram } diagram 
     * @param { Blackboard } blackboard 
     * @param { Boolean } isDevMode 
     */
  constructor(placeholder, diagram, blackboard, isDevMode) {
    this.placeholder = placeholder;
    this.nativeRef = $(placeholder);

    this.diagram = diagram;
    this.blackboard = blackboard;
    this.toolbarElement = null;
    this.isDevMode = isDevMode;

    // clone state
    this.state = {...defaultState};

    /**
     * @type {BaseDiagramItem[]}
     */
    this.listOfItems = [];

    this.jsonFiles = [
      'componentDiagram',
      'classDiagram',
      'packageDiagram',
      'sequenceDiagram',
      'stateDiagram'
    ];

    // Reference on diagram
    this.setDiagram(diagram);

    this.blackboard.addEventListener(
        'storage:editmode', this.onEditModeChange.bind(this));

    this.blackboard.addEventListener(
        'diagram:item:select', this.onSelectItems.bind(this));
  }

  setDiagram(diagram) {
    this.diagram = diagram;
    if (!this.toolbarElement) this.loadToolbar();
  }

  async loadDropdowMenu(idx, filename) {
    const diagrams = await this.loadJSON(filename);
    diagrams.forEach(diagram => {
      //
      // Menu - elements
      //
      this.elementsPreview = new PreviewDiagramItemsDropdownComponent(
          this, this.diagram, '.us-dt-placeholder-elements-dropdown',
          diagram.elements);
      //
      // Menu - connectors
      //
      this.connectorsPreview = new PreviewDiagramItemsDropdownComponent(
          this, this.diagram, '.us-dt-placeholder-connectors-dropdown',
          diagram.connectors);
    });
  }

  async loadJSON(file) {
    try {
      var x = configLoader.getConfig(file);
      if (x) {
        return x;
      }
      const response = await fetch('assets/config/' + file + '.json');
      return await response.json();
    } catch (error) {
      console.error('Error loading JSON:', file, error);
      return [];
    }
  }

  async loadToolbar() {
    this.toolbarElement = $(`
<div class="us-dt-toolbar-wrapper">
  <div class="us-dt-title-bar">
    <div class="us-dt-title">Default</div>
    <div class="us-dt-style-icons">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"/></svg>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M160-120q-33 0-56.5-23.5T80-200v-280h80v280h360v80H160Zm160-160q-33 0-56.5-23.5T240-360v-280h80v280h360v80H320Zm160-160q-33 0-56.5-23.5T400-520v-240q0-33 23.5-56.5T480-840h320q33 0 56.5 23.5T880-760v240q0 33-23.5 56.5T800-440H480Zm0-80h320v-160H480v160Z"/></svg>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m438-400 198-198-57-56-141 141-57-57-57 57 114 113ZM200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z"/></svg>
    </div>
    <div class="us-dt-pin">
       <span class="us-dt-pinned">
         <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M680-840v80h-40v327l-80-80v-247H400v87l-87-87-33-33v-47h400ZM480-40l-40-40v-240H240v-80l80-80v-46L56-792l56-56 736 736-58 56-264-264h-6v240l-40 40ZM354-400h92l-44-44-2-2-46 46Zm126-193Zm-78 149Z"/></svg>
       </span>
       <span class="us-dt-unpinned">
         <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m640-480 80 80v80H520v240l-40 40-40-40v-240H240v-80l80-80v-280h-40v-80h400v80h-40v280Zm-286 80h252l-46-46v-314H400v314l-46 46Zm126 0Z"/></svg>
       </span>
    </div>
  </div>
  <!-- theme select carousel -->
  <div class="us-ds-carousel-container">
    <div class="us-pin-carousel">pin</div>
    <div class="us-ds-carousel-arrow us-ds-carousel-left">◀</div>
    <div class="us-ds-carousel-arrow us-ds-carousel-right">▶</div>
    <div class="us-ds-carousel-track" id="us-ds-carousel-track"></div>
  </div>
  <!-- element style row -->
  <div class="us-dt-style-row" style="display: none;">
    <select id="us-text-font-style">
      <option value="Arial">Arial</option>
      <option value="Times New Roman">Times New Roman</option>
      <option value="Courier New">Courier New</option>
      <option value="Georgia">Georgia</option>
    </select>

    <div class="us-div-separator"></div>

    <select id="us-text-font-size">
      <option value="1">8px</option>
      <option value="2">10px</option>
      <option value="3" selected>12px</option>
      <option value="4">14px</option>
      <option value="5">18px</option>
      <option value="6">24px</option>
      <option value="7">36px</option>
    </select>

    <div class="us-div-separator"></div>

    <button id="us-text-color-picker">🎨</button>
    <div class="us-div-separator"></div>

    <button class="us-font-style-btn us-bold" id="us-text-bold">B</button>
    <button class="us-font-style-btn us-italic" id="us-text-italic">I</button>
    <button class="us-font-style-btn us-underline" id="us-text-underline">U</button>

    <div class="us-div-separator"></div>
    <div id="us-text-align"></div>
  </div>

  <!-- connector style row -->
  <div class="us-dt-connector-style-row" style="display: none;">
    <span>Arrow</span>
    <div class="us-div-separator"></div>
    <button id="us-arrow-color-picker">🎨</button>
    <div class="us-div-separator"></div>
    <select id="us-arrow-line-width">
      <option value="1" selected>1px</option>
      <option value="2">2px</option>
      <option value="3">3px</option>
      <option value="4">4px</option>
      <option value="5">5px</option>
      <option value="6">6px</option>
      <option value="7">7px</option>
    </select>
    <div class="us-div-separator"></div>
    <div class="us-div-separator"></div>
    <span>Label</span>
    <div class="us-div-separator"></div>
    <select id="us-label-font-style">
      <option value="Arial">Arial</option>
      <option value="Times New Roman">Times New Roman</option>
      <option value="Courier New">Courier New</option>
      <option value="Georgia">Georgia</option>
    </select>

    <div class="us-div-separator"></div>

    <select id="us-label-font-size">
      <option value="1">8px</option>
      <option value="2">10px</option>
      <option value="3" selected>12px</option>
      <option value="4">14px</option>
      <option value="5">18px</option>
      <option value="6">24px</option>
      <option value="7">36px</option>
    </select>

    <div class="us-div-separator"></div>
    <button id="us-label-color-picker">🎨</button>
    <div class="us-div-separator"></div>

    <button class="us-font-style-btn us-bold" id="us-label-bold">B</button>
    <button class="us-font-style-btn us-italic" id="us-label-italic">I</button>
    <button class="us-font-style-btn us-underline" id="us-label-underline">U</button>
    <div class="us-div-separator"></div>
  </div>


  <div class="us-dt-toolbar">
    <div class="us-dt-drag-handle">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#aaa" xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="5" r="1.5"/>
        <circle cx="12" cy="5" r="1.5"/>
        <circle cx="19" cy="5" r="1.5"/>
        <circle cx="5" cy="12" r="1.5"/>
        <circle cx="12" cy="12" r="1.5"/>
        <circle cx="19" cy="12" r="1.5"/>
      </svg>
    </div>

    <div class="us-dt-placeholder-elements-dropdown"></div>
    <div class="us-div-separator"></div>
    <div class="us-dt-placeholder-connectors-dropdown"></div>
    <div class="us-div-separator"></div>

    <button id="us-text-undo">↶</button>
    <button id="us-text-redo">↷</button>

    <div class="us-div-separator"></div>

    <div style="background-color:green; padding: 3px; border-radius: 5px;display: inline-flex; column-gap: 6px; align-items: center;">
      <button id="us-dt-toggle-element">E</button>
      <button id="us-dt-toggle-connector">C</button>
      <button id="us-dt-toggle-style">S</button>
      <span class="us-sds-default" style="color: white;">Default</span>
      <span class="us-sds-selected" style="color: white;display:none;">Selected</span>
    </div>

    <div class="us-div-separator"></div>
    <button id="us-text-save-button">SAVE</button>
  </div>

  <div class="us-dt-style-preview-wrapper">
    <div class="us-dt-style-preview">
    </div>
    <div class="ui-resizable-handle ui-resizable-n-u" style="z-index: 9999990; "></div>
    <div class="ui-resizable-handle ui-resizable-e-u" style="z-index: 9999990; "></div>
    <div class="ui-resizable-handle ui-resizable-s-u" style="z-index: 9999990; "></div>
    <div class="ui-resizable-handle ui-resizable-w-u" style="z-index: 9999990; "></div>
    <div class="ui-resizable-handle ui-resizable-nw-u" style="z-index: 9999990; "></div>
    <div class="ui-resizable-handle ui-resizable-sw-u" style="z-index: 9999990; "></div>
    <div class="ui-resizable-handle ui-resizable-ne-u" style="z-index: 9999990; "></div>
    <div class="ui-resizable-handle ui-resizable-se-u" style="z-index: 9999990; "></div>
  </div>
</div>`);

    $(this.placeholder).empty();
    $(this.placeholder).append(this.toolbarElement);

    this.loadDropdowMenu(1, this.diagram.options.nameTemplate);

    this.initToolbar();

    this.render();

    //
    // Post values on blackboard
    //
    this.postDefaultStylesOnBlackboard();
  }

  postDefaultStylesOnBlackboard() {
    this.blackboard.setStorageValue("element:style", this.getDefaultElementOptions());
    this.blackboard.setStorageValue("connector:style", this.getDefaultConnectorOptions());
  }

  setOptionForElement(key, value) {
    if (this.state.isSelectMode) {
      this.listOfItems.forEach((item) => {
        //
        // item is element
        //
        if (item instanceof BaseElement) {
          item._setOption(key, value);
        }
      });
    } else {
        this.defaultStylePreview.updateElementOption(key, value);
        this.blackboard.setStorageValue("element:style", this.getDefaultElementOptions());
    }
  }

  setOptionForConnector(key, value) {
    if (this.state.isSelectMode) {
      this.listOfItems.forEach((item) => {
        //
        // item is connector
        //
        if (item instanceof BaseConnector) {
          item._setOption(key, value);
        }
      });
    } else {
        this.defaultStylePreview.updateConnectorOption(key, value);
        this.blackboard.setStorageValue("connector:style", this.getDefaultConnectorOptions());
    }
  }

  hideAllRows() {
    // Hide style carousel in any case
    this.nativeRef.find('.us-ds-carousel-container').hide();
    // Hide connector's row
    this.nativeRef.find('.us-dt-connector-style-row').hide();
    // Hide element's row
    this.nativeRef.find('.us-dt-style-row').hide();
  }

  dispatch(target, action) {
    //
    // Clicked on element/connector/style
    //
    if (action === 'toggle-row') {
      //
      // Hide row if it was enabled: element/connector/style
      //
      if (this.state[target]) {
        this.state[target] = false;
      } else {
        //
        // Hide all rows, except an active row
        //
        ['showConnectorRow', 'showElementRow', 'showStyleRow'].forEach(
            (item) => {
              this.state[item] = item == target;
            });
      }
    } else if (target === 'isSelectMode') {
      //
      // Select mode change
      //
      let next = action === 'enabled';
      //
      // Hide Rows, when user clicked on diagram area
      // if rows were not pinned
      //
      if (!next && !this.state.pinRows) {
        this.state.showConnectorRow = false;
        this.state.showElementRow = false;
        this.state.showStyleRow = false;
      }
      this.state.isSelectMode = next;
      //
      // Switch to select mode?
      //
      if (this.state.isSelectMode) {
        //
        // At these method we shold read values for all elements and connectors
        // to update rows ....
        // OR we can do that as soon as user show/hide the rows ???
        //

        // enable/disable [E] and [C] buttons
        this.state.hasConnector = this.syncConnectorsInSelected();
        this.state.hasElement = this.syncElementsInSelected();

        // hide an opened row if listOfItems do not have element/connector in it
        // OR if rows was not pinned
        this.state.showConnectorRow &&= (this.state.hasConnector || this.state.pinRows);
        this.state.showElementRow &&= (this.state.hasElement || this.state.pinRows);
      } else {
        // enable [E] and [C] buttons
        this.state.hasConnector = true;
        this.state.hasElement = true;
      }
    } else if (action === 'pin' || action === 'unpin') {
      // User could pin one of the row, to do not hide/show on select change
      this.state.pinRows = action === 'pin';
    }

    //
    // show default box and pin icon if one of the rows is visible only
    //
    const isRowVisible = this.state.showConnectorRow || this.state.showElementRow || this.state.showStyleRow;
    this.state.showPinIcon = isRowVisible
    this.state.showStyleDefault = isRowVisible;

    //
    // Update ui elements visibility
    //
    this.render();
  }

  //
  // TODO: Update the Connector row with values....
  //
  syncConnectorsInSelected() {
    for (let i = 0; i < this.listOfItems.length; ++i) {
      if (this.listOfItems[i] instanceof BaseConnector) {
        return true;
      }
    }
    return false;
  }

  //
  // TODO: Update the Elements row with values....
  //
  syncElementsInSelected() {
    for (let i = 0; i < this.listOfItems.length; ++i) {
      if (this.listOfItems[i] instanceof BaseElement) {
        return true;
      }
    }
    return false;
  }

  render() {
    //
    // Switch between Selected/Default
    //
    this.nativeRef.find('.us-sds-selected').toggle(this.state.isSelectMode);
    this.nativeRef.find('.us-sds-default').toggle(!this.state.isSelectMode);

    //
    // Disable/Enable buttons [ E ] and [ C ]
    //
    this.nativeRef.find('#us-dt-toggle-element')
        .prop('disabled', !this.state.hasElement);
    this.nativeRef.find('#us-dt-toggle-connector')
        .prop('disabled', !this.state.hasConnector);

    //
    // Show/hide rows
    //
    this.nativeRef.find('.us-ds-carousel-container')
        .toggle(this.state.showStyleRow);
    this.nativeRef.find('.us-dt-style-row')
        .toggle(this.state.showElementRow);
    this.nativeRef.find('.us-dt-connector-style-row')
        .toggle(this.state.showConnectorRow);
    //
    // Show icons on top of rows
    //
    this.nativeRef.find('.us-dt-style-icons')
      .toggle(this.state.showStyleRow);

    //
    // show/hide side box and icons
    //
    this.nativeRef.find('.us-dt-style-preview-wrapper')
        .toggleClass('us-dt-style-preview-scale', !this.state.showStyleDefault);

    //
    // Unselect
    //
    this.nativeRef.find('.ui-resizable-handle')
        .toggle(!this.state.isSelectMode);
    
    //
    // Show/hide pinned....
    //
    this.nativeRef.find('.us-dt-pin')
        .toggleClass("us-dt-state-pinned", this.state.pinRows)
        .toggle(this.state.showPinIcon);
  }

  initToolbar() {
    let self = this;

    if (this.isDevMode) {
      this.nativeRef.addClass('us-dev-mode');
    }

    this.nativeRef.find('#us-dt-toggle-element').on('click', () => {
      this.dispatch('showElementRow', 'toggle-row');
    });

    this.nativeRef.find('#us-dt-toggle-connector').on('click', () => {
      this.dispatch('showConnectorRow', 'toggle-row');
    });

    this.nativeRef.find('#us-dt-toggle-style').on('click', () => {
      this.dispatch('showStyleRow', 'toggle-row');
    });


    this.initElementRow();
    this.initConnectorRow();
    this.initStyleCarouselRow();

    this.nativeRef.find('#us-text-save-button').on('click', function() {
      if (self.selectedItem && self.selectedItem.diagram) {
        let d = self.selectedItem.diagram.getDescription();
        console.log('DESCRIPTION:');
        console.log(JSON.stringify(d));
      }
    });

    this.defaultStylePreview =
        new PreviewStyleComponent(this.nativeRef.find('.us-dt-style-preview'));

    //
    // PIN / UN-PIN ROW
    //
    this.nativeRef.find('.us-dt-pin').on('click', () => {
        this.dispatch('pinRows', this.state.pinRows ? 'unpin': 'pin');
    });
    
  }

  initStyleCarouselRow() {
    this.styleCarousel = new PreviewStyleCarouselComponent(
        this.nativeRef.find('.us-ds-carousel-container'));

    this.styleCarousel.setListener((options) => {

      if (!this.state.pinRows)
        this.dispatch('showStyleRow', 'toggle-row');
      //
      // It is mapping of the preview box options -> diagrams options
      // TODO: sync-up option's key names => no need to map them
      //
      if (this.state.isSelectMode) {
        Object.entries(options.element).forEach(([key, value]) => {
          this.setOptionForElement(key, value);
        });

        Object.entries(options.connector).forEach(([key, value]) => {
          this.setOptionForConnector(key, value);
        });
      } else {
        //
        // No need to update the default options one by one !!!!
        //
        let clone = {
            element: {...options.element},
            connector: {...options.connector}
        };
        delete clone.element.text;
        delete clone.connector.text;
        this.defaultStylePreview.updateOptions(clone);

        //
        // TODO: Sync up element/connector rows!!!!
        //
        this.postDefaultStylesOnBlackboard();
      }
    });
  }

  initConnectorRow() {
    let self = this;
    ///////////////////////////// ARROW PART //////////////////
    //
    // Color Pickers
    //
    this.arrowColorPicker = new PreviewColorPickerComponent(
        this.nativeRef.find('#us-arrow-color-picker'),
        ['Line Color']);

    this.arrowColorPicker.onSelect((index, color) => {
        console.log("SET COLOR FOR CONNECTOR: " + color);
        self.setOptionForConnector('color', color);
    });

    this.nativeRef.find('#us-arrow-line-width').on('change', function() {
      const value = $(this).val();
      const x = [1, 2, 3, 4, 5, 6, 7];
      console.log("SET LINE WIDTH FOR CONNECTOR: " + value + " " + x[value]);
      self.setOptionForConnector('line-width', x[value]);
    });



    //////////////////////////// LABEL PART ///////////////////
    //
    // FONT-FAMILY
    //
    this.nativeRef.find('#us-label-font-style').on('change', function() {
      const value = $(this).val();
      self.setOptionForConnector('font-family', value);
    });

    //
    // FONT-SIZE
    //
    this.nativeRef.find('#us-label-font-size').on('change', function() {
      const value = $(this).val();
      const x = [8, 10, 12, 14, 18, 24, 36];
      self.setOptionForConnector('font-size', x[value]);
    });

    //
    // B U I - bold/italic/underline
    //
    this.nativeRef.find('#us-label-bold').on('click', function() {
      if ($(this).hasClass('us-text-biu-active')) {
        $(this).removeClass('us-text-biu-active');
        self.setOptionForConnector('font-weight', 'normal');
      } else {
        $(this).addClass('us-text-biu-active');
        self.setOptionForConnector('font-weight', 'bold');
      }
    });
    this.nativeRef.find('#us-label-italic').on('click', function() {
      if ($(this).hasClass('us-text-biu-active')) {
        $(this).removeClass('us-text-biu-active');
        self.setOptionForConnector('font-style', 'normal');
      } else {
        $(this).addClass('us-text-biu-active');
        self.setOptionForConnector('font-style', 'italic');
      }
    });
    this.nativeRef.find('#us-label-underline').on('click', function() {
      if ($(this).hasClass('us-text-biu-active')) {
        $(this).removeClass('us-text-biu-active');
        self.setOptionForConnector('text-decoration', 'none');
      } else {
        $(this).addClass('us-text-biu-active');
        self.setOptionForConnector('text-decoration', 'underline');
      }
    });
    //
    // Color picker
    //
    this.labelColorPicker = new PreviewColorPickerComponent(
        this.nativeRef.find('#us-label-color-picker'),
        ['Text Color', 'Background Color']);

    this.labelColorPicker.onSelect((index, color) => {
      let key = index === 1 ? 'font-bg' : 'font-color';
      self.setOptionForConnector(key, color);
    });
  }

  initElementRow() {
    let self = this;
    //
    // FONT-FAMILY
    //
    this.nativeRef.find('#us-text-font-style').on('change', function() {
      const value = $(this).val();
      self.setOptionForElement('font-family', value);
    });

    //
    // FONT-SIZE
    //
    this.nativeRef.find('#us-text-font-size').on('change', function() {
      const value = $(this).val();
      const x = [8, 10, 12, 14, 18, 24, 36];
      self.setOptionForElement('font-size', x[value]);
    });

    //
    //  TEXT - ALIGN
    //
    let textAlign = this.nativeRef.find('#us-text-align');
    this.textAlignComponent = new PreviewAlignComponent(textAlign);

    //
    // B U I - bold/italic/underline
    //
    this.nativeRef.find('#us-text-bold').on('click', function() {
      if ($(this).hasClass('us-text-biu-active')) {
        $(this).removeClass('us-text-biu-active');
        self.setOptionForElement('font-weight', 'normal');
      } else {
        $(this).addClass('us-text-biu-active');
        self.setOptionForElement('font-weight', 'bold');
      }
    });
    this.nativeRef.find('#us-text-italic').on('click', function() {
      if ($(this).hasClass('us-text-biu-active')) {
        $(this).removeClass('us-text-biu-active');
        self.setOptionForElement('font-style', 'normal');
      } else {
        $(this).addClass('us-text-biu-active');
        self.setOptionForElement('font-style', 'italic');
      }
    });
    this.nativeRef.find('#us-text-underline').on('click', function() {
      if ($(this).hasClass('us-text-biu-active')) {
        $(this).removeClass('us-text-biu-active');
        self.setOptionForElement('text-decoration', 'none');
      } else {
        $(this).addClass('us-text-biu-active');
        self.setOptionForElement('text-decoration', 'underline');
      }
    });
    //
    // Color picker
    //
    this.elementColorPicker = new PreviewColorPickerComponent(
        this.nativeRef.find('#us-text-color-picker'),
        ['Background Color', 'Text Color']);

    this.elementColorPicker.onSelect((index, color) => {
      let key = index === 0 ? 'color' : 'font-color';
      self.setOptionForElement(key, color);
    });
  }

  showColorPicker(show = true) {
    this.loadColorPicker();

    if (!this.colorPicker) {
      return;
    }

    if (show) {
      this.colorPicker.show();
    } else {
      this.colorPicker.hide();
    }
  }

  loadColorPicker() {
    if (this.colorPicker) return;

    this.colorPicker = $(`
          <div class="us-color-picker" style="display: none;" onclick="event.stopPropagation()">
            <div class="us-color-labels">
              <span>Text Color</span>
              <button onclick="this.closest('.us-color-picker').style.display='none'">✕</button>
            </div>
            <div class="us-color-grid">
              <div class="us-color-cell" style="background-color: black;" onclick="applyColor('black')"></div>
              <div class="us-color-cell" style="background-color: red;" onclick="applyColor('red')"></div>
              <div class="us-color-cell" style="background-color: green;" onclick="applyColor('green')"></div>
              <div class="us-color-cell" style="background-color: blue;" onclick="applyColor('blue')"></div>
              <div class="us-color-cell" style="background-color: orange;" onclick="applyColor('orange')"></div>
              <div class="us-color-cell" style="background-color: purple;" onclick="applyColor('purple')"></div>
              <div class="us-color-cell" style="background-color: gray;" onclick="applyColor('gray')"></div>
              <div class="us-color-cell" style="background-color: white;" onclick="applyColor('white')"></div>
            </div>
          </div>`);

    $(this.placeholder).append(this.colorPicker);
  }

  //
  // @valuePair - oldValue/newValue
  //
  onEditModeChange(valueChange) {
    //
    // Show/hide an entire menu
    //
    this.nativeRef.toggle(valueChange.newValue)
  }

  onSelectItems(listOfItems) {
    this.listOfItems = listOfItems ? listOfItems : [];
    this.dispatch(
        'isSelectMode', (listOfItems.length > 0 ? 'enabled' : 'disabled'))
  }

  getDefaultConnectorOptions() {
    return Object.assign({}, this.defaultStylePreview.options.connector);
  }

  getDefaultElementOptions() {
    let tmp = Object.assign({}, this.defaultStylePreview.options.element);
    return tmp;
  }
}

export {EditorDetachedToolbarMenu}
