import { BaseConnector } from "../../connectors/BaseConnector";
import { BaseDiagramItem } from "../../core/BaseDiagramItem";
import { BaseDiagram } from "../../diagrams/BaseDiagram";
import { BaseElement } from "../../elements/BaseElement";
import { Blackboard } from "../../utils/Blackboard";
import configLoader from "../../utils/ConfigLoader";

import { PreviewAlignComponent } from "./components/PreviewAlignComonent";
import { PreviewColorPickerComponent } from "./components/PreviewColorPickerComponent";
import { PreviewDiagramItemsDropdownComponent } from "./components/PreviewDiagramItemsDropdownComponent";
import { PreviewStyleCarouselComponent } from "./components/PreviewStyleCarouselComponent";
import { PreviewStyleComponent } from "./components/PreviewStyleComponent";

// Empty-state icon for the "used in this project" styles tab.
const PROJECT_EMPTY_ICON = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z" fill="#EEEFF8"></path>
    <path d="M20.2743 7.6333L17.466 18.9083C17.266 19.75 16.516 20.3333 15.6493 20.3333H4.69929C3.44096 20.3333 2.54097 19.0999 2.91597 17.8916L6.4243 6.625C6.66597 5.84167 7.39098 5.29993 8.20765 5.29993H18.4576C19.2493 5.29993 19.9076 5.78326 20.1826 6.44993C20.341 6.80826 20.3743 7.21663 20.2743 7.6333Z" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10"></path>
    <path d="M15.334 20.3333H19.3173C20.3923 20.3333 21.234 19.425 21.159 18.35L20.334 7" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M10.0664 7.31663L10.9331 3.71667" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M15.6504 7.32501L16.4337 3.70837" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M8.41602 12H15.0827" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M7.58398 15.3334H14.2507" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>`;

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
   * @param { import("../../styles/IStyleManager").IStyleManager } styleManager
   * @param { import("../../utils/ThemeDetector").ThemeDetector } themeDetector
   */
  constructor(placeholder, diagram, blackboard, isDevMode, styleManager, themeDetector) {
    this.placeholder = placeholder;
    this.nativeRef = $(placeholder);

    this.diagram = diagram;
    this.blackboard = blackboard;
    this.toolbarElement = null;
    this.isDevMode = isDevMode;
    this.styleManager = styleManager;
    this.themeDetector = themeDetector;

    // clone state
    this.state = { ...defaultState };

    /**
     * @type {BaseDiagramItem[]}
     */
    this.listOfItems = [];

    this.jsonFiles = [
      "componentDiagram",
      "classDiagram",
      "packageDiagram",
      "sequenceDiagram",
      "stateDiagram",
    ];

    // Reference on diagram
    this.setDiagram(diagram);

    this.blackboard.addEventListener(
      "storage:editmode",
      this.onEditModeChange.bind(this),
    );

    this.blackboard.addEventListener(
      "diagram:item:select",
      this.onSelectItems.bind(this),
    );
  }

  setDiagram(diagram) {
    this.diagram = diagram;
    if (!this.toolbarElement) this.loadToolbar();
  }

  async loadDropdowMenu(idx, filename) {
    const diagrams = await this.loadJSON(filename);
    diagrams.forEach((diagram) => {
      //
      // Menu - elements
      //
      this.elementsPreview = new PreviewDiagramItemsDropdownComponent(
        this,
        this.diagram,
        ".us-dt-placeholder-elements-dropdown",
        diagram.elements,
      );
      //
      // Menu - connectors
      //
      this.connectorsPreview = new PreviewDiagramItemsDropdownComponent(
        this,
        this.diagram,
        ".us-dt-placeholder-connectors-dropdown",
        diagram.connectors,
      );
    });
  }

  async loadJSON(file) {
    try {
      var x = configLoader.getConfig(file);
      if (x) {
        return x;
      }
      const response = await fetch("assets/config/" + file + ".json");
      return await response.json();
    } catch (error) {
      console.error("Error loading JSON:", file, error);
      return [];
    }
  }

  getHtmlTopIcons() {
    return `
  <!-- top icons to switch between style select mode -->
  <div class="us-dt-title-bar">
    <div class="us-dt-title">Default</div>
    <div class="us-dt-style-icons">
    <!-- icon for system style list -->
    <div id="us-icon-system" class="us-dt-style-icon">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z" fill="#EEEFF8"/>
  <path d="M4.5 9.59163V14.4C4.5 16.1666 4.5 16.1666 6.16667 17.2916L10.75 19.9416C11.4417 20.3416 12.5667 20.3416 13.25 19.9416L17.8333 17.2916C19.5 16.1666 19.5 16.1666 19.5 14.4083V9.59163C19.5 7.8333 19.5 7.8333 17.8333 6.7083L13.25 4.0583C12.5667 3.6583 11.4417 3.6583 10.75 4.0583L6.16667 6.7083C4.5 7.8333 4.5 7.8333 4.5 9.59163Z" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    </div>
<!-- icon for saved style list (user styles, via the style API) -->
    <div id="us-icon-saved" class="us-dt-style-icon">
<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z"
    fill="#EEEFF8"
  />

  <path
    d="M5.5 4.75C5.5 4.06 6.06 3.5 6.75 3.5H17.25C17.94 3.5 18.5 4.06 18.5 4.75V20L12 16.45L5.5 20V4.75Z"
    stroke="#54577A"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <path
    d="M9 6.75H15"
    stroke="#54577A"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</svg>
    </div>
<!-- icon for styles used in this diagram (not the API; computed from applied styles - not implemented yet) -->
    <div id="us-icon-used" class="us-dt-style-icon">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z" fill="#EEEFF8"/>
  <path d="M20.2743 7.6333L17.466 18.9083C17.266 19.75 16.516 20.3333 15.6493 20.3333H4.69929C3.44096 20.3333 2.54097 19.0999 2.91597 17.8916L6.4243 6.625C6.66597 5.84167 7.39098 5.29993 8.20765 5.29993H18.4576C19.2493 5.29993 19.9076 5.78326 20.1826 6.44993C20.341 6.80826 20.3743 7.21663 20.2743 7.6333Z" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10"/>
  <path d="M15.334 20.3333H19.3173C20.3923 20.3333 21.234 19.425 21.159 18.35L20.334 7" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.0664 7.31663L10.9331 3.71667" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M15.6504 7.32501L16.4337 3.70837" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8.41602 12H15.0827" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.58398 15.3334H14.2507" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    </div>
<!-- icon for editing current style -->
    <div id="us-icon-edit" class="us-dt-style-icon">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z" fill="#EEEFF8"/>
  <path d="M9.49935 20.3333H14.4993C18.666 20.3333 20.3327 18.6666 20.3327 14.5V9.49996C20.3327 5.33329 18.666 3.66663 14.4993 3.66663H9.49935C5.33268 3.66663 3.66602 5.33329 3.66602 9.49996V14.5C3.66602 18.6666 5.33268 20.3333 9.49935 20.3333Z" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8.45898 12.0001L10.8173 14.3584L15.5423 9.64172" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    </div>
    </div>
  </div>`;
  }

  getHtmlThemeSelectCarousel() {
    return `
  <!-- theme select carousel -->
  <div class="us-ds-carousel-container">
    <div class="us-pin-carousel"></div>
    <div class="us-dt-style-preview-wrapper">
      <div class="us-dt-style-preview"></div>
    </div>
    <div class="us-ds-carousel-arrow us-ds-carousel-left">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.9998 19.9201L8.47984 13.4001C7.70984 12.6301 7.70984 11.3701 8.47984 10.6001L14.9998 4.08008" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="us-ds-carousel-arrow us-ds-carousel-right">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.91016 19.9201L15.4302 13.4001C16.2002 12.6301 16.2002 11.3701 15.4302 10.6001L8.91016 4.08008" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="us-ds-carousel-track" id="us-ds-carousel-track">
      <div class="us-ds-carousel-wrapper" id="us-ds-carousel-wrapper"></div>
    </div>
    <!-- saved (user) styles track, hidden until the saved tab is selected -->
    <div class="us-ds-carousel-track" id="us-ds-saved-carousel-track" style="display: none;">
      <div class="us-ds-carousel-wrapper" id="us-ds-saved-carousel-wrapper"></div>
    </div>
    <!-- styles used in this diagram, hidden until the used tab is selected -->
    <div class="us-ds-carousel-track" id="us-ds-used-carousel-track" style="display: none;">
      <div class="us-ds-carousel-wrapper" id="us-ds-used-carousel-wrapper"></div>
    </div>
    <!-- edit container for editing current style -->
    <div class="us-dt-edit-container" id="us-dt-edit-container" style="display: none;">
      <div class="us-dt-edit-row">
        <span class="us-dt-edit-label">Label:</span>
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
      <button class="us-label-color-picker">🎨</button>
      <div class="us-div-separator"></div>

    <button class="us-font-style-btn us-bold" id="us-label-bold">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.06641 3.74992C4.06641 2.83325 4.81641 2.08325 5.73307 2.08325H9.99974C12.1831 2.08325 13.9581 3.85825 13.9581 6.04159C13.9581 8.22492 12.1831 9.99992 9.99974 9.99992H4.06641V3.74992Z" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.06641 10H11.9831C14.1664 10 15.9414 11.775 15.9414 13.9583C15.9414 16.1417 14.1664 17.9167 11.9831 17.9167H5.73307C4.81641 17.9167 4.06641 17.1667 4.06641 16.25V10V10Z" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="us-font-style-btn us-italic" id="us-label-italic">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.01758 2.5H15.7259" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.26758 17.5H11.9759" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11.875 2.5L8.125 17.5" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="us-font-style-btn us-underline" id="us-label-underline">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.16602 17.5H15.8327" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.16602 2.5V8.33333C4.16602 11.5583 6.77435 14.1667 9.99935 14.1667C13.2243 14.1667 15.8327 11.5583 15.8327 8.33333V2.5" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
      </div>
      <div class="us-dt-edit-row">
        <span class="us-dt-edit-label">Connector:</span>
              <button id="us-arrow-color-picker">🎨</button>
              <div class="us-div-separator"></div>
              <div id="us-arrow-line-width">
                  <div class="us-connector-line-preview">
                    <svg width="64" height="6" viewBox="0 0 64 6" xmlns="http://www.w3.org/2000/svg">
                      <line x1="2" y1="3" x2="62" y2="3" stroke="black" stroke-width="2" /> 
                      <circle cx="2" cy="3" r="2" fill="black" />
                     <circle cx="62" cy="3" r="2" fill="black" />
                    </svg>
                  </div>
                  <div class="us-svg-icon">
                    <svg width="10" height="5" viewBox="0 0 10 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.4097 3.21257e-07C9.93455 3.40375e-07 10.1974 0.567797 9.82627 0.899872L5.41657 4.84561C5.1865 5.05146 4.8135 5.05146 4.58343 4.84561L0.173729 0.899871C-0.197393 0.567796 0.0654508 -1.91181e-08 0.590298 0L9.4097 3.21257e-07Z" fill="#54577A"/>
                    </svg>
                  </div>
              </div>
              <div class="us-div-separator"></div>
      </div>
      <div class="us-dt-edit-row">
        <span class="us-dt-edit-label">Element:</span>
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

    <button class="us-text-color-picker">🎨</button>
    <div class="us-div-separator"></div>

    <button class="us-font-style-btn us-bold" id="us-label-bold">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.06641 3.74992C4.06641 2.83325 4.81641 2.08325 5.73307 2.08325H9.99974C12.1831 2.08325 13.9581 3.85825 13.9581 6.04159C13.9581 8.22492 12.1831 9.99992 9.99974 9.99992H4.06641V3.74992Z" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.06641 10H11.9831C14.1664 10 15.9414 11.775 15.9414 13.9583C15.9414 16.1417 14.1664 17.9167 11.9831 17.9167H5.73307C4.81641 17.9167 4.06641 17.1667 4.06641 16.25V10V10Z" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="us-font-style-btn us-italic" id="us-label-italic">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.01758 2.5H15.7259" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.26758 17.5H11.9759" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M11.875 2.5L8.125 17.5" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="us-font-style-btn us-underline" id="us-label-underline">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.16602 17.5H15.8327" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.16602 2.5V8.33333C4.16602 11.5583 6.77435 14.1667 9.99935 14.1667C13.2243 14.1667 15.8327 11.5583 15.8327 8.33333V2.5" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <div class="us-div-separator"></div>
    <div id="us-text-align"></div>

      </div>
    </div>
  </div>`;
  }

  getHtmlElementStyleRow() {
    return `
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

    <button class="us-text-color-picker">🎨</button>
    <div class="us-div-separator"></div>

    <button class="us-font-style-btn us-bold" id="us-text-bold">B</button>
    <button class="us-font-style-btn us-italic" id="us-text-italic">I</button>
    <button class="us-font-style-btn us-underline" id="us-text-underline">U</button>

    <div class="us-div-separator"></div>
    <div id="us-text-align"></div>
    <div class="us-div-separator"></div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_4358_8625)">
       <path d="M15.3248 6.12525L15.8554 5.59519V5.59519L15.3248 6.12525ZM17.8934 8.69643L17.3628 9.22649L17.8934 8.69643ZM9.2823 18.1909L8.7517 18.721H8.7517L9.2823 18.1909ZM5.85173 14.7568L6.38233 14.2268H6.38233L5.85173 14.7568ZM16.6394 14.4953L16.3757 13.7933L16.6394 14.4953ZM15.0418 15.0956L15.3056 15.7977L15.0418 15.0956ZM8.94382 8.98489L8.2396 8.72687L8.2396 8.72687L8.94382 8.98489ZM9.52254 7.40538L10.2268 7.6634L9.52254 7.40538ZM6.87119 10.8946L7.07053 11.6177H7.07053L6.87119 10.8946ZM8.08505 10.446L7.64684 9.83736L7.64684 9.83736L8.08505 10.446ZM8.39684 10.1587L8.96767 10.6452L8.96767 10.6452L8.39684 10.1587ZM13.8762 15.6505L14.3671 16.2175L14.3671 16.2175L13.8762 15.6505ZM13.1508 17.1677L12.4277 16.9688V16.9688L13.1508 17.1677ZM13.5977 15.9556L12.9884 15.5183L12.9884 15.5183L13.5977 15.9556ZM4.26571 12.6294L3.51572 12.6342L3.51572 12.6342L4.26571 12.6294ZM4.44237 11.9601L3.79245 11.5858L3.79245 11.5858L4.44237 11.9601ZM11.4214 19.786L11.4225 19.036H11.4225L11.4214 19.786ZM12.0781 19.6123L11.7063 18.9609L11.7063 18.9609L12.0781 19.6123ZM11.748 3.6968L11.9096 4.42919L11.748 3.6968ZM3.13639 19.8034C2.84365 20.0964 2.84389 20.5713 3.13693 20.864C3.42997 21.1568 3.90485 21.1565 4.19759 20.8635L3.13639 19.8034ZM8.07528 16.9818C8.36802 16.6888 8.36778 16.2139 8.07474 15.9212C7.7817 15.6284 7.30682 15.6287 7.01408 15.9217L8.07528 16.9818ZM15.3248 6.12525L14.7942 6.65531L17.3628 9.22649L17.8934 8.69643L18.424 8.16637L15.8554 5.59519L15.3248 6.12525ZM9.2823 18.1909L9.8129 17.6609L6.38233 14.2268L5.85173 14.7568L5.32113 15.2869L8.7517 18.721L9.2823 18.1909ZM16.6394 14.4953L16.3757 13.7933L14.778 14.3935L15.0418 15.0956L15.3056 15.7977L16.9032 15.1974L16.6394 14.4953ZM8.94382 8.98489L9.64804 9.24291L10.2268 7.6634L9.52254 7.40538L8.81832 7.14737L8.2396 8.72687L8.94382 8.98489ZM6.87119 10.8946L7.07053 11.6177C7.65434 11.4567 8.13187 11.3365 8.52325 11.0547L8.08505 10.446L7.64684 9.83736C7.52521 9.92492 7.36451 9.98064 6.67186 10.1716L6.87119 10.8946ZM8.94382 8.98489L8.2396 8.72687C7.99224 9.40201 7.92339 9.558 7.82601 9.67226L8.39684 10.1587L8.96767 10.6452C9.28042 10.2782 9.43951 9.81206 9.64804 9.24291L8.94382 8.98489ZM8.08505 10.446L8.52325 11.0547C8.68732 10.9366 8.83654 10.7991 8.96767 10.6452L8.39684 10.1587L7.82601 9.67226C7.77312 9.73432 7.71296 9.78975 7.64684 9.83736L8.08505 10.446ZM15.0418 15.0956L14.778 14.3935C14.2126 14.606 13.7491 14.7684 13.3852 15.0835L13.8762 15.6505L14.3671 16.2175C14.4803 16.1195 14.6349 16.0497 15.3056 15.7977L15.0418 15.0956ZM13.1508 17.1677L13.8739 17.3667C14.0642 16.6753 14.1197 16.5146 14.2071 16.3928L13.5977 15.9556L12.9884 15.5183C12.7078 15.9094 12.5881 16.3858 12.4277 16.9688L13.1508 17.1677ZM13.8762 15.6505L13.3852 15.0835C13.2364 15.2124 13.1032 15.3584 12.9884 15.5183L13.5977 15.9556L14.2071 16.3928C14.2534 16.3283 14.3071 16.2694 14.3671 16.2175L13.8762 15.6505ZM5.85173 14.7568L6.38233 14.2268C5.8417 13.6856 5.48267 13.3246 5.25118 13.0337C5.0187 12.7417 5.01579 12.64 5.01569 12.6247L4.26571 12.6294L3.51572 12.6342C3.51906 13.162 3.78163 13.5961 4.07754 13.9679C4.37444 14.3409 4.8067 14.772 5.32113 15.2869L5.85173 14.7568ZM6.87119 10.8946L6.67186 10.1716C5.97048 10.365 5.38185 10.5261 4.93956 10.7036C4.49871 10.8806 4.05597 11.1283 3.79245 11.5858L4.44237 11.9601L5.09229 12.3345C5.09981 12.3214 5.15222 12.2346 5.49839 12.0956C5.84312 11.9572 6.33338 11.8209 7.07053 11.6177L6.87119 10.8946ZM4.26571 12.6294L5.01569 12.6247C5.01505 12.5228 5.04151 12.4226 5.09229 12.3345L4.44237 11.9601L3.79245 11.5858C3.60889 11.9046 3.5134 12.2664 3.51572 12.6342L4.26571 12.6294ZM9.2823 18.1909L8.7517 18.721C9.26939 19.2392 9.70276 19.6747 10.0778 19.9734C10.4516 20.2711 10.8886 20.5352 11.4202 20.536L11.4214 19.786L11.4225 19.036C11.4077 19.036 11.306 19.034 11.0124 18.8001C10.7199 18.5672 10.357 18.2055 9.8129 17.6609L9.2823 18.1909ZM13.1508 17.1677L12.4277 16.9688C12.2234 17.7113 12.0862 18.2053 11.9469 18.5525C11.8069 18.9012 11.7194 18.9534 11.7063 18.9609L12.0781 19.6123L12.4498 20.2637C12.9114 20.0003 13.1609 19.5548 13.3389 19.1112C13.5176 18.6661 13.6795 18.0733 13.8739 17.3667L13.1508 17.1677ZM11.4214 19.786L11.4202 20.536C11.7813 20.5366 12.1362 20.4427 12.4498 20.2637L12.0781 19.6123L11.7063 18.9609C11.6198 19.0103 11.522 19.0362 11.4225 19.036L11.4214 19.786ZM17.8934 8.69643L17.3628 9.22649C18.2519 10.1165 18.8569 10.725 19.2263 11.2235C19.5878 11.7113 19.6054 11.9392 19.5716 12.0957L20.3046 12.2542L21.0377 12.4127C21.2072 11.6287 20.8907 10.9502 20.4315 10.3304C19.9802 9.72138 19.2779 9.02119 18.424 8.16637L17.8934 8.69643ZM16.6394 14.4953L16.9032 15.1974C18.0338 14.7726 18.9626 14.4258 19.6252 14.058C20.2995 13.6838 20.8681 13.1968 21.0377 12.4127L20.3046 12.2542L19.5716 12.0957C19.5378 12.252 19.4278 12.4521 18.8973 12.7465C18.3551 13.0474 17.5529 13.3509 16.3757 13.7933L16.6394 14.4953ZM15.3248 6.12525L15.8554 5.59519C14.9951 4.73402 14.2908 4.02616 13.6786 3.57171C13.0563 3.10965 12.374 2.79067 11.5865 2.96441L11.748 3.6968L11.9096 4.42919C12.0651 4.39489 12.2932 4.4113 12.7845 4.77607C13.286 5.14843 13.8986 5.75882 14.7942 6.65531L15.3248 6.12525ZM9.52254 7.40538L10.2268 7.6634C10.6629 6.47314 10.9624 5.66144 11.2611 5.11245C11.5538 4.57457 11.7541 4.46351 11.9096 4.42919L11.748 3.6968L11.5865 2.96441C10.7991 3.13813 10.3141 3.71451 9.94355 4.39549C9.57903 5.06535 9.23726 6.00393 8.81832 7.14737L9.52254 7.40538ZM3.66699 20.3334L4.19759 20.8635L8.07528 16.9818L7.54468 16.4518L7.01408 15.9217L3.13639 19.8034L3.66699 20.3334Z" fill="#54577A"/>
      </g>
      <defs>
        <clipPath id="clip0_4358_8625">
          <rect width="20" height="20" fill="white" transform="translate(2 2)"/>
        </clipPath>
      </defs>
    </svg>
  </div>`;
  }

  getHtmlConnectorStyleRow() {
    return `
  <!-- connector style row -->
  <div class="us-dt-connector-style-row" style="display: none;">
    <span>Connector</span>
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
    <button class="us-label-color-picker">🎨</button>
    <div class="us-div-separator"></div>

    <button class="us-font-style-btn us-bold" id="us-label-bold">B</button>
    <button class="us-font-style-btn us-italic" id="us-label-italic">I</button>
    <button class="us-font-style-btn us-underline" id="us-label-underline">U</button>
    <div class="us-div-separator"></div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_4358_8625)">
       <path d="M15.3248 6.12525L15.8554 5.59519V5.59519L15.3248 6.12525ZM17.8934 8.69643L17.3628 9.22649L17.8934 8.69643ZM9.2823 18.1909L8.7517 18.721H8.7517L9.2823 18.1909ZM5.85173 14.7568L6.38233 14.2268H6.38233L5.85173 14.7568ZM16.6394 14.4953L16.3757 13.7933L16.6394 14.4953ZM15.0418 15.0956L15.3056 15.7977L15.0418 15.0956ZM8.94382 8.98489L8.2396 8.72687L8.2396 8.72687L8.94382 8.98489ZM9.52254 7.40538L10.2268 7.6634L9.52254 7.40538ZM6.87119 10.8946L7.07053 11.6177H7.07053L6.87119 10.8946ZM8.08505 10.446L7.64684 9.83736L7.64684 9.83736L8.08505 10.446ZM8.39684 10.1587L8.96767 10.6452L8.96767 10.6452L8.39684 10.1587ZM13.8762 15.6505L14.3671 16.2175L14.3671 16.2175L13.8762 15.6505ZM13.1508 17.1677L12.4277 16.9688V16.9688L13.1508 17.1677ZM13.5977 15.9556L12.9884 15.5183L12.9884 15.5183L13.5977 15.9556ZM4.26571 12.6294L3.51572 12.6342L3.51572 12.6342L4.26571 12.6294ZM4.44237 11.9601L3.79245 11.5858L3.79245 11.5858L4.44237 11.9601ZM11.4214 19.786L11.4225 19.036H11.4225L11.4214 19.786ZM12.0781 19.6123L11.7063 18.9609L11.7063 18.9609L12.0781 19.6123ZM11.748 3.6968L11.9096 4.42919L11.748 3.6968ZM3.13639 19.8034C2.84365 20.0964 2.84389 20.5713 3.13693 20.864C3.42997 21.1568 3.90485 21.1565 4.19759 20.8635L3.13639 19.8034ZM8.07528 16.9818C8.36802 16.6888 8.36778 16.2139 8.07474 15.9212C7.7817 15.6284 7.30682 15.6287 7.01408 15.9217L8.07528 16.9818ZM15.3248 6.12525L14.7942 6.65531L17.3628 9.22649L17.8934 8.69643L18.424 8.16637L15.8554 5.59519L15.3248 6.12525ZM9.2823 18.1909L9.8129 17.6609L6.38233 14.2268L5.85173 14.7568L5.32113 15.2869L8.7517 18.721L9.2823 18.1909ZM16.6394 14.4953L16.3757 13.7933L14.778 14.3935L15.0418 15.0956L15.3056 15.7977L16.9032 15.1974L16.6394 14.4953ZM8.94382 8.98489L9.64804 9.24291L10.2268 7.6634L9.52254 7.40538L8.81832 7.14737L8.2396 8.72687L8.94382 8.98489ZM6.87119 10.8946L7.07053 11.6177C7.65434 11.4567 8.13187 11.3365 8.52325 11.0547L8.08505 10.446L7.64684 9.83736C7.52521 9.92492 7.36451 9.98064 6.67186 10.1716L6.87119 10.8946ZM8.94382 8.98489L8.2396 8.72687C7.99224 9.40201 7.92339 9.558 7.82601 9.67226L8.39684 10.1587L8.96767 10.6452C9.28042 10.2782 9.43951 9.81206 9.64804 9.24291L8.94382 8.98489ZM8.08505 10.446L8.52325 11.0547C8.68732 10.9366 8.83654 10.7991 8.96767 10.6452L8.39684 10.1587L7.82601 9.67226C7.77312 9.73432 7.71296 9.78975 7.64684 9.83736L8.08505 10.446ZM15.0418 15.0956L14.778 14.3935C14.2126 14.606 13.7491 14.7684 13.3852 15.0835L13.8762 15.6505L14.3671 16.2175C14.4803 16.1195 14.6349 16.0497 15.3056 15.7977L15.0418 15.0956ZM13.1508 17.1677L13.8739 17.3667C14.0642 16.6753 14.1197 16.5146 14.2071 16.3928L13.5977 15.9556L12.9884 15.5183C12.7078 15.9094 12.5881 16.3858 12.4277 16.9688L13.1508 17.1677ZM13.8762 15.6505L13.3852 15.0835C13.2364 15.2124 13.1032 15.3584 12.9884 15.5183L13.5977 15.9556L14.2071 16.3928C14.2534 16.3283 14.3071 16.2694 14.3671 16.2175L13.8762 15.6505ZM5.85173 14.7568L6.38233 14.2268C5.8417 13.6856 5.48267 13.3246 5.25118 13.0337C5.0187 12.7417 5.01579 12.64 5.01569 12.6247L4.26571 12.6294L3.51572 12.6342C3.51906 13.162 3.78163 13.5961 4.07754 13.9679C4.37444 14.3409 4.8067 14.772 5.32113 15.2869L5.85173 14.7568ZM6.87119 10.8946L6.67186 10.1716C5.97048 10.365 5.38185 10.5261 4.93956 10.7036C4.49871 10.8806 4.05597 11.1283 3.79245 11.5858L4.44237 11.9601L5.09229 12.3345C5.09981 12.3214 5.15222 12.2346 5.49839 12.0956C5.84312 11.9572 6.33338 11.8209 7.07053 11.6177L6.87119 10.8946ZM4.26571 12.6294L5.01569 12.6247C5.01505 12.5228 5.04151 12.4226 5.09229 12.3345L4.44237 11.9601L3.79245 11.5858C3.60889 11.9046 3.5134 12.2664 3.51572 12.6342L4.26571 12.6294ZM9.2823 18.1909L8.7517 18.721C9.26939 19.2392 9.70276 19.6747 10.0778 19.9734C10.4516 20.2711 10.8886 20.5352 11.4202 20.536L11.4214 19.786L11.4225 19.036C11.4077 19.036 11.306 19.034 11.0124 18.8001C10.7199 18.5672 10.357 18.2055 9.8129 17.6609L9.2823 18.1909ZM13.1508 17.1677L12.4277 16.9688C12.2234 17.7113 12.0862 18.2053 11.9469 18.5525C11.8069 18.9012 11.7194 18.9534 11.7063 18.9609L12.0781 19.6123L12.4498 20.2637C12.9114 20.0003 13.1609 19.5548 13.3389 19.1112C13.5176 18.6661 13.6795 18.0733 13.8739 17.3667L13.1508 17.1677ZM11.4214 19.786L11.4202 20.536C11.7813 20.5366 12.1362 20.4427 12.4498 20.2637L12.0781 19.6123L11.7063 18.9609C11.6198 19.0103 11.522 19.0362 11.4225 19.036L11.4214 19.786ZM17.8934 8.69643L17.3628 9.22649C18.2519 10.1165 18.8569 10.725 19.2263 11.2235C19.5878 11.7113 19.6054 11.9392 19.5716 12.0957L20.3046 12.2542L21.0377 12.4127C21.2072 11.6287 20.8907 10.9502 20.4315 10.3304C19.9802 9.72138 19.2779 9.02119 18.424 8.16637L17.8934 8.69643ZM16.6394 14.4953L16.9032 15.1974C18.0338 14.7726 18.9626 14.4258 19.6252 14.058C20.2995 13.6838 20.8681 13.1968 21.0377 12.4127L20.3046 12.2542L19.5716 12.0957C19.5378 12.252 19.4278 12.4521 18.8973 12.7465C18.3551 13.0474 17.5529 13.3509 16.3757 13.7933L16.6394 14.4953ZM15.3248 6.12525L15.8554 5.59519C14.9951 4.73402 14.2908 4.02616 13.6786 3.57171C13.0563 3.10965 12.374 2.79067 11.5865 2.96441L11.748 3.6968L11.9096 4.42919C12.0651 4.39489 12.2932 4.4113 12.7845 4.77607C13.286 5.14843 13.8986 5.75882 14.7942 6.65531L15.3248 6.12525ZM9.52254 7.40538L10.2268 7.6634C10.6629 6.47314 10.9624 5.66144 11.2611 5.11245C11.5538 4.57457 11.7541 4.46351 11.9096 4.42919L11.748 3.6968L11.5865 2.96441C10.7991 3.13813 10.3141 3.71451 9.94355 4.39549C9.57903 5.06535 9.23726 6.00393 8.81832 7.14737L9.52254 7.40538ZM3.66699 20.3334L4.19759 20.8635L8.07528 16.9818L7.54468 16.4518L7.01408 15.9217L3.13639 19.8034L3.66699 20.3334Z" fill="#54577A"/>
      </g>
      <defs>
        <clipPath id="clip0_4358_8625">
          <rect width="20" height="20" fill="white" transform="translate(2 2)"/>
        </clipPath>
      </defs>
    </svg>
  </div>`;
  }

  getHtmlToolbar() {
    return `
  <div class="us-dt-toolbar">
    <div class="us-dt-drag-handle">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.5401 8.31001C18.8987 8.31001 20.0001 7.20863 20.0001 5.85001C20.0001 4.49139 18.8987 3.39001 17.5401 3.39001C16.1814 3.39001 15.0801 4.49139 15.0801 5.85001C15.0801 7.20863 16.1814 8.31001 17.5401 8.31001Z" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.46001 8.31001C7.81863 8.31001 8.92 7.20863 8.92 5.85001C8.92 4.49139 7.81863 3.39001 6.46001 3.39001C5.10139 3.39001 4 4.49139 4 5.85001C4 7.20863 5.10139 8.31001 6.46001 8.31001Z" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17.5401 20.6101C18.8987 20.6101 20.0001 19.5087 20.0001 18.1501C20.0001 16.7914 18.8987 15.6901 17.5401 15.6901C16.1814 15.6901 15.0801 16.7914 15.0801 18.1501C15.0801 19.5087 16.1814 20.6101 17.5401 20.6101Z" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.46001 20.6101C7.81863 20.6101 8.92 19.5087 8.92 18.1501C8.92 16.7914 7.81863 15.6901 6.46001 15.6901C5.10139 15.6901 4 16.7914 4 18.1501C4 19.5087 5.10139 20.6101 6.46001 20.6101Z" stroke="#54577A" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <div class="us-dt-placeholder-elements-dropdown"></div>
    <div class="us-div-separator"></div>
    <div class="us-dt-placeholder-connectors-dropdown"></div>
    <div class="us-div-separator"></div>

    <div style="display: inline-flex; column-gap: 6px; align-items: center; margin-left: auto;">
      <button id="us-dt-toggle-style">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z" fill="#EEEFF8"/>
          <path d="M20.1746 5.28323C18.8913 8.48323 15.6746 12.8332 12.9829 14.9916L11.3413 16.3082C11.1329 16.4582 10.9246 16.5916 10.6913 16.6832C10.6913 16.5332 10.6829 16.3666 10.6579 16.2082C10.5663 15.5082 10.2496 14.8582 9.69128 14.2999C9.12461 13.7332 8.43294 13.3999 7.72461 13.3082C7.55794 13.2999 7.39128 13.2832 7.22461 13.2999C7.31628 13.0416 7.45794 12.7999 7.63294 12.5999L8.93294 10.9582C11.0829 8.26656 15.4496 5.03323 18.6413 3.75823C19.1329 3.5749 19.6079 3.70823 19.9079 4.01656C20.2246 4.3249 20.3746 4.7999 20.1746 5.28323Z" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10.6917 16.6834C10.6917 17.6001 10.3417 18.4751 9.6834 19.1417C9.17507 19.6501 8.4834 20.0001 7.6584 20.1084L5.6084 20.3334C4.49173 20.4584 3.5334 19.5084 3.66673 18.3751L3.89173 16.3251C4.09173 14.5001 5.61673 13.3334 7.2334 13.3001C7.40007 13.2917 7.57507 13.3001 7.7334 13.3084C8.44173 13.4001 9.1334 13.7251 9.70006 14.3001C10.2584 14.8584 10.5751 15.5084 10.6667 16.2084C10.6751 16.3667 10.6917 16.5251 10.6917 16.6834Z" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13.8665 14.0584C13.8665 11.8834 12.0998 10.1167 9.9248 10.1167" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="us-sds-default">Style</span>
      </button>
    </div>
  </div>`;
  }

  async loadToolbar() {
    this.toolbarElement = $(`
<div class="us-dt-toolbar-wrapper">
${this.getHtmlTopIcons()}
${this.getHtmlThemeSelectCarousel()}
${this.getHtmlToolbar()}
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
    this.blackboard.setStorageValue(
      "element:style",
      this.getDefaultElementOptions(),
    );
    this.blackboard.setStorageValue(
      "connector:style",
      this.getDefaultConnectorOptions(),
    );
  }

  setOptionForElement(key, value) {
    if (this.state.isSelectMode) {
      const applyToItems = () => {
        this.listOfItems.forEach((item) => {
          //
          // item is element
          //
          if (item instanceof BaseElement) {
            item._updateJsonModel(key, value);
          }
        });
      };
      if (this.diagram && this.diagram.opman) {
        this.diagram.opman.record(applyToItems);
      } else {
        applyToItems();
      }
    } else {
      this.defaultStylePreview.updateElementOption(key, value);
      this.blackboard.setStorageValue(
        "element:style",
        this.getDefaultElementOptions(),
      );
    }
  }

  setOptionForConnector(key, value) {
    if (this.state.isSelectMode) {
      const applyToItems = () => {
        this.listOfItems.forEach((item) => {
          //
          // item is connector
          //
          if (item instanceof BaseConnector) {
            item._setOption(key, value);
          }
        });
      };
      if (this.diagram && this.diagram.opman) {
        this.diagram.opman.record(applyToItems);
      } else {
        applyToItems();
      }
    } else {
      this.defaultStylePreview.updateConnectorOption(key, value);
      this.blackboard.setStorageValue(
        "connector:style",
        this.getDefaultConnectorOptions(),
      );
    }
  }

  hideAllRows() {
    // Hide style carousel in any case
    this.nativeRef.find(".us-ds-carousel-container").hide();
    // Hide connector's row
    this.nativeRef.find(".us-dt-connector-style-row").hide();
    // Hide element's row
    this.nativeRef.find(".us-dt-style-row").hide();
  }

  dispatch(target, action) {
    //
    // Clicked on element/connector/style
    //
    if (action === "toggle-row") {
      //
      // Hide row if it was enabled: element/connector/style
      //
      if (this.state[target]) {
        this.state[target] = false;
      } else {
        //
        // Hide all rows, except an active row
        //
        ["showConnectorRow", "showElementRow", "showStyleRow"].forEach(
          (item) => {
            this.state[item] = item == target;
          },
        );
      }
    } else if (target === "isSelectMode") {
      //
      // Select mode change
      //
      let next = action === "enabled";
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
        this.state.showConnectorRow &&=
          this.state.hasConnector || this.state.pinRows;
        this.state.showElementRow &&=
          this.state.hasElement || this.state.pinRows;
      } else {
        // enable [E] and [C] buttons
        this.state.hasConnector = true;
        this.state.hasElement = true;
      }
    } else if (action === "pin" || action === "unpin") {
      // User could pin one of the row, to do not hide/show on select change
      this.state.pinRows = action === "pin";
    }

    //
    // show default box and pin icon if one of the rows is visible only
    //
    const isRowVisible =
      this.state.showConnectorRow ||
      this.state.showElementRow ||
      this.state.showStyleRow;
    this.state.showPinIcon = isRowVisible;
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
    // Disable/Enable buttons [ E ] and [ C ]
    //
    this.nativeRef
      .find("#us-dt-toggle-element")
      .prop("disabled", !this.state.hasElement);
    this.nativeRef
      .find("#us-dt-toggle-connector")
      .prop("disabled", !this.state.hasConnector);

    //
    // Show/hide rows
    //
    this.nativeRef
      .find(".us-ds-carousel-container")
      .toggle(this.state.showStyleRow);
    this.nativeRef.find(".us-dt-style-row").toggle(this.state.showElementRow);
    this.nativeRef
      .find(".us-dt-connector-style-row")
      .toggle(this.state.showConnectorRow);
    //
    // Show icons on top of rows
    //
    this.nativeRef.find(".us-dt-style-icons").toggle(this.state.showStyleRow);

    //
    // show/hide side box and icons
    //
    this.nativeRef
      .find(".us-dt-style-preview-wrapper")
      .toggleClass("us-dt-style-preview-scale", !this.state.showStyleDefault);

    //
    // Unselect
    //
    this.nativeRef
      .find(".ui-resizable-handle")
      .toggle(!this.state.isSelectMode);

    //
    // Show/hide pinned....
    //
    this.nativeRef
      .find(".us-dt-pin")
      .toggleClass("us-dt-state-pinned", this.state.pinRows)
      .toggle(this.state.showPinIcon);
  }

  initToolbar() {
    let self = this;

    if (this.isDevMode) {
      this.nativeRef.addClass("us-dev-mode");
    }

    this.nativeRef.find("#us-dt-toggle-element").on("click", () => {
      this.dispatch("showElementRow", "toggle-row");
    });

    this.nativeRef.find("#us-dt-toggle-connector").on("click", () => {
      this.dispatch("showConnectorRow", "toggle-row");
    });

    this.nativeRef.find("#us-dt-toggle-style").on("click", () => {
      this.dispatch("showStyleRow", "toggle-row");
    });

    // Initialize style icon click handlers
    this.initStyleIcons();
    this.initElementRow();
    this.initConnectorRow();
    this.initStyleCarouselRow();

    this.nativeRef.find("#us-text-save-button").on("click", function () {
      if (self.selectedItem && self.selectedItem.diagram) {
        let d = self.selectedItem.diagram.getDescription();
        console.log("DESCRIPTION:");
        console.log(JSON.stringify(d));
      }
    });

    this.defaultStylePreview = new PreviewStyleComponent(
      this.nativeRef.find(".us-dt-style-preview"),
      this.styleManager.getDefaultStyle(),
    );

    //
    // PIN / UN-PIN ROW
    //
    this.nativeRef.find(".us-dt-pin").on("click", () => {
      this.dispatch("pinRows", this.state.pinRows ? "unpin" : "pin");
    });
  }

  initStyleIcons() {
    const systemContainer = this.nativeRef.find("#us-ds-carousel-track");
    const savedContainer = this.nativeRef.find("#us-ds-saved-carousel-track");
    const usedContainer = this.nativeRef.find("#us-ds-used-carousel-track");
    const arrows = this.nativeRef.find(".us-ds-carousel-arrow");
    const editContainer = this.nativeRef.find("#us-dt-edit-container");
    const systemIcon = this.nativeRef.find("#us-icon-system");
    // Backed by the style API's user styles (getUserStyles/saveUserStyle/removeUserStyle).
    const savedIcon = this.nativeRef.find("#us-icon-saved");
    // Not backed by the style API - computed on the fly from the current
    // diagram's elements/connectors (see #extractProjectStyles()).
    const usedIcon = this.nativeRef.find("#us-icon-used");
    const editIcon = this.nativeRef.find("#us-icon-edit");

    const hideAllTracks = () => {
      systemContainer.hide();
      savedContainer.hide();
      usedContainer.hide();
      editContainer.hide();
    };

    // Handle icon clicks
    systemIcon.on("click", () => {
      hideAllTracks();
      systemContainer.show();
      arrows.show();
      this.updateIconSelection("system");
    });

    savedIcon.on("click", () => {
      hideAllTracks();
      savedContainer.show();
      arrows.show();
      this.updateIconSelection("saved");
    });

    usedIcon.on("click", () => {
      hideAllTracks();
      usedContainer.show();
      arrows.show();
      this.usedStyleCarousel.refresh(this.#extractProjectStyles());
      this.updateIconSelection("used");
    });

    editIcon.on("click", () => {
      hideAllTracks();
      editContainer.show();
      arrows.hide();
      this.updateIconSelection("edit");
    });
  }

  updateIconSelection(selectedIcon) {
    // Remove active class from all icons
    this.nativeRef
      .find(".us-dt-style-icon")
      .removeClass("us-dt-style-icon-active");

    // Add active class to selected icon
    this.nativeRef
      .find(`#us-icon-${selectedIcon}`)
      .addClass("us-dt-style-icon-active");
  }

  initStyleCarouselRow() {
    const $carouselContainer = this.nativeRef.find(".us-ds-carousel-container");

    this.styleCarousel = new PreviewStyleCarouselComponent(
      $carouselContainer,
      this.#getSortedSystemStyles(),
      {
        trackId: "us-ds-carousel-track",
        onPin: (style) =>
          this.#togglePin(style, this.styleCarousel, () =>
            this.#getSortedSystemStyles(),
          ),
      },
    );

    this.savedStyleCarousel = new PreviewStyleCarouselComponent(
      $carouselContainer,
      this.#getSortedUserStyles(),
      {
        trackId: "us-ds-saved-carousel-track",
        onRemove: (id) => {
          this.styleManager.removeUserStyle(id);
          this.savedStyleCarousel.refresh(this.#getSortedUserStyles());
        },
        onPin: (style) =>
          this.#togglePin(style, this.savedStyleCarousel, () =>
            this.#getSortedUserStyles(),
          ),
        emptyState: {
          title: "Saved styles will be visible here",
          message:
            "Save a style from the Style panel to quickly access it here.",
        },
      },
    );

    this.usedStyleCarousel = new PreviewStyleCarouselComponent(
      $carouselContainer,
      this.#extractProjectStyles(),
      {
        trackId: "us-ds-used-carousel-track",
        onSave: (style) => {
          if (this.#isStyleAlreadySaved(style)) {
            return;
          }
          this.styleManager.saveUserStyle(style);
          this.savedStyleCarousel.refresh(this.#getSortedUserStyles());
        },
        emptyState: {
          icon: PROJECT_EMPTY_ICON,
          title: "No styles in this project yet",
          message: "Create your first uml element to see style here.",
        },
      },
    );

    // Initialize carousel scroll functionality
    this.initCarouselScroll();

    const onStyleSelected = (options) => {
      if (!this.state.pinRows) this.dispatch("showStyleRow", "toggle-row");
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
          element: { ...options.element },
          connector: { ...options.connector },
        };
        delete clone.element.text;
        delete clone.connector.text;
        this.defaultStylePreview.updateOptions(clone);

        this.styleManager.setDefaultStyle(this.defaultStylePreview.options);

        //
        // TODO: Sync up element/connector rows!!!!
        //
        this.postDefaultStylesOnBlackboard();
      }
    };

    this.styleCarousel.setListener(onStyleSelected);
    this.savedStyleCarousel.setListener(onStyleSelected);
    this.usedStyleCarousel.setListener(onStyleSelected);
  }

  initCarouselScroll() {
    const track = this.nativeRef.find("#us-ds-carousel-track");
    const wrapper = this.nativeRef.find("#us-ds-carousel-wrapper");
    const leftArrow = this.nativeRef.find(".us-ds-carousel-left");
    const rightArrow = this.nativeRef.find(".us-ds-carousel-right");

    if (
      !track.length ||
      !wrapper.length ||
      !leftArrow.length ||
      !rightArrow.length
    ) {
      return;
    }

    const scrollAmount = 130; // Width of one item (120px) + margin (10px)
    let currentTransform = 0;

    // Calculate max transform (total width - visible width)
    const updateMaxTransform = () => {
      const wrapperElement = wrapper[0];
      const trackElement = track[0];
      // Get the actual content width of the wrapper
      const totalWidth = wrapperElement.scrollWidth;
      const visibleWidth = trackElement.clientWidth;
      return Math.max(0, totalWidth - visibleWidth);
    };

    // Apply transform to move wrapper
    const applyTransform = (transformValue) => {
      wrapper.css("transform", `translateX(-${transformValue}px)`);
      currentTransform = transformValue;
      updateArrowVisibility();
    };

    // Left arrow click - move left
    leftArrow.on("click", () => {
      const newTransform = Math.max(0, currentTransform - scrollAmount);
      applyTransform(newTransform);
    });

    // Right arrow click - move right
    rightArrow.on("click", () => {
      const maxTransform = updateMaxTransform();
      const newTransform = Math.min(
        maxTransform,
        currentTransform + scrollAmount,
      );
      applyTransform(newTransform);
    });

    // Update arrow visibility based on transform position
    const updateArrowVisibility = () => {
      const maxTransform = updateMaxTransform();

      // Show/hide left arrow
      if (currentTransform <= 0) {
        leftArrow.css("opacity", "0.5");
        leftArrow.css("pointer-events", "none");
      } else {
        leftArrow.css("opacity", "1");
        leftArrow.css("pointer-events", "auto");
      }

      // Show/hide right arrow
      if (currentTransform >= maxTransform) {
        rightArrow.css("opacity", "0.5");
        rightArrow.css("pointer-events", "none");
      } else {
        rightArrow.css("opacity", "1");
        rightArrow.css("pointer-events", "auto");
      }
    };

    // Initial update
    updateArrowVisibility();
  }

  initConnectorRow() {
    let self = this;
    ///////////////////////////// ARROW PART //////////////////
    //
    // Color Pickers
    //
    this.arrowColorPicker = new PreviewColorPickerComponent(
      this.nativeRef.find("#us-arrow-color-picker"),
      ["Line Color"],
      null,
      this.themeDetector,
    );

    this.arrowColorPicker.onSelect((index, color) => {
      console.log("SET COLOR FOR CONNECTOR: " + color);
      self.setOptionForConnector("color", color);
    });

    this.nativeRef.find("#us-arrow-line-width").on("change", function () {
      const value = $(this).val();
      const x = [1, 2, 3, 4, 5, 6, 7];
      console.log("SET LINE WIDTH FOR CONNECTOR: " + value + " " + x[value]);
      self.setOptionForConnector("line-width", x[value]);
    });

    //////////////////////////// LABEL PART ///////////////////
    //
    // FONT-FAMILY
    //
    this.nativeRef.find("#us-label-font-style").on("change", function () {
      const value = $(this).val();
      self.setOptionForConnector("font-family", value);
    });

    //
    // FONT-SIZE
    //
    this.nativeRef.find("#us-label-font-size").on("change", function () {
      const value = $(this).val();
      const x = [8, 10, 12, 14, 18, 24, 36];
      self.setOptionForConnector("font-size", x[value]);
    });

    //
    // B U I - bold/italic/underline
    //
    this.nativeRef.find("#us-label-bold").on("click", function () {
      if ($(this).hasClass("us-text-biu-active")) {
        $(this).removeClass("us-text-biu-active");
        self.setOptionForConnector("font-weight", "normal");
      } else {
        $(this).addClass("us-text-biu-active");
        self.setOptionForConnector("font-weight", "bold");
      }
    });
    this.nativeRef.find("#us-label-italic").on("click", function () {
      if ($(this).hasClass("us-text-biu-active")) {
        $(this).removeClass("us-text-biu-active");
        self.setOptionForConnector("font-style", "normal");
      } else {
        $(this).addClass("us-text-biu-active");
        self.setOptionForConnector("font-style", "italic");
      }
    });
    this.nativeRef.find("#us-label-underline").on("click", function () {
      if ($(this).hasClass("us-text-biu-active")) {
        $(this).removeClass("us-text-biu-active");
        self.setOptionForConnector("text-decoration", "none");
      } else {
        $(this).addClass("us-text-biu-active");
        self.setOptionForConnector("text-decoration", "underline");
      }
    });
    //
    // Color picker
    //
    this.labelColorPicker = new PreviewColorPickerComponent(
      this.nativeRef.find(".us-label-color-picker"),
      ["Text Color", "Background Color"],
      null,
      this.themeDetector,
    );

    this.labelColorPicker.onSelect((index, color) => {
      let key = index === 1 ? "font-bg" : "font-color";
      self.setOptionForConnector(key, color);
    });
  }

  initElementRow() {
    let self = this;
    //
    // FONT-FAMILY
    //
    this.nativeRef.find("#us-text-font-style").on("change", function () {
      const value = $(this).val();
      self.setOptionForElement("font-family", value);
    });

    //
    // FONT-SIZE
    //
    this.nativeRef.find("#us-text-font-size").on("change", function () {
      const value = $(this).val();
      const x = [8, 10, 12, 14, 18, 24, 36];
      self.setOptionForElement("font-size", x[value]);
    });

    //
    //  TEXT - ALIGN
    //
    let textAlign = this.nativeRef.find("#us-text-align");
    this.textAlignComponent = new PreviewAlignComponent(textAlign);
    this.textAlignComponent.onSelect((alignmentString) => {
      self.setOptionForElement("alignment", alignmentString);
    });

    //
    // B U I - bold/italic/underline
    //
    this.nativeRef.find("#us-text-bold").on("click", function () {
      if ($(this).hasClass("us-text-biu-active")) {
        $(this).removeClass("us-text-biu-active");
        self.setOptionForElement("font-weight", "normal");
      } else {
        $(this).addClass("us-text-biu-active");
        self.setOptionForElement("font-weight", "bold");
      }
    });
    this.nativeRef.find("#us-text-italic").on("click", function () {
      if ($(this).hasClass("us-text-biu-active")) {
        $(this).removeClass("us-text-biu-active");
        self.setOptionForElement("font-style", "normal");
      } else {
        $(this).addClass("us-text-biu-active");
        self.setOptionForElement("font-style", "italic");
      }
    });
    this.nativeRef.find("#us-text-underline").on("click", function () {
      if ($(this).hasClass("us-text-biu-active")) {
        $(this).removeClass("us-text-biu-active");
        self.setOptionForElement("text-decoration", "none");
      } else {
        $(this).addClass("us-text-biu-active");
        self.setOptionForElement("text-decoration", "underline");
      }
    });
    //
    // Color picker
    //
    this.elementColorPicker = new PreviewColorPickerComponent(
      this.nativeRef.find(".us-text-color-picker"),
      ["Background Color", "Text Color"],
      null,
      this.themeDetector,
    );

    this.elementColorPicker.onSelect((index, color) => {
      let key = index === 0 ? "color" : "font-color";
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
    this.nativeRef.toggle(valueChange.newValue);
  }

  onSelectItems(listOfItems) {
    this.listOfItems = listOfItems ? listOfItems : [];
    this.dispatch(
      "isSelectMode",
      listOfItems.length > 0 ? "enabled" : "disabled",
    );
  }

  getDefaultConnectorOptions() {
    return Object.assign({}, this.defaultStylePreview.options.connector);
  }

  getDefaultElementOptions() {
    let tmp = Object.assign({}, this.defaultStylePreview.options.element);
    return tmp;
  }

  //
  // Private: pinning support for the system/saved style carousels. Pinned
  // styles sort first within their own list; the pin icon itself is filled
  // (dark) when pinned, muted when not - see PreviewStyleCarouselComponent.
  //
  #getSortedSystemStyles() {
    return this.#sortByPin(this.styleManager.getSystemStyles());
  }

  #getSortedUserStyles() {
    return this.#sortByPin(this.styleManager.getUserStyles());
  }

  #sortByPin(styles) {
    const pinnedIds = new Set(this.styleManager.getPinnedStyleIds());
    const annotated = styles.map((style) => ({
      ...style,
      pinned: pinnedIds.has(style.id),
    }));
    return [
      ...annotated.filter((style) => style.pinned),
      ...annotated.filter((style) => !style.pinned),
    ];
  }

  #togglePin(style, carousel, getSortedStyles) {
    if (style.pinned) {
      this.styleManager.unpinStyle(style.id);
    } else {
      this.styleManager.pinStyle(style.id);
    }
    carousel.refresh(getSortedStyles());
  }

  //
  // Private: derive the styles currently used in this project (diagram) from
  // its live elements/connectors. Not persisted and not part of the
  // IStyleManager API - recomputed on demand each time the "used" tab is
  // opened, so it always reflects the diagram's current state.
  //
  #extractProjectStyles() {
    const elements = (this.diagram && this.diagram.elements) || [];
    const connectors = (this.diagram && this.diagram.connectors) || [];

    if (!elements.length) {
      return [];
    }

    const elementStyles = this.#dedupeStyles(
      elements.map((element) => this.#readElementStyle(element)),
    );
    const connectorStyles = connectors.length
      ? this.#dedupeStyles(
          connectors.map((connector) => this.#readConnectorStyle(connector)),
        )
      : [];

    return elementStyles.map((element, i) => ({
      id: `used-${i}`,
      element,
      connector: connectorStyles.length
        ? connectorStyles[i % connectorStyles.length]
        : {},
    }));
  }

  #readElementStyle(element) {
    const model = element.jsonModel || {};
    return this.#compact({
      text: "Box",
      "font-family": model["font-family"],
      "font-size": model["font-size"],
      "font-color": model["font-color"],
      color: model["color"],
      bold: model["font-weight"] === "bold",
      italic: model["font-style"] === "italic",
      underline: model["text-decoration"] === "underline",
    });
  }

  #readConnectorStyle(connector) {
    // color/line-width live on `options` (see BaseConnector#_setOption's
    // default branch); font-* properties are only ever persisted to
    // `jsonModel` - the two bags aren't kept fully in sync, so read
    // whichever one actually has each key.
    const options = connector.options || {};
    const model = connector.jsonModel || {};
    return this.#compact({
      text: "Label",
      "font-family": model["font-family"],
      "font-size": model["font-size"],
      "font-color": model["font-color"],
      "font-bg": model["font-bg"],
      color: options["color"] !== undefined ? options["color"] : model["color"],
      "line-width":
        options["line-width"] !== undefined
          ? options["line-width"]
          : model["line-width"],
      bold: model["font-weight"] === "bold",
      italic: model["font-style"] === "italic",
      underline: model["text-decoration"] === "underline",
    });
  }

  #compact(style) {
    const result = {};
    Object.entries(style).forEach(([key, value]) => {
      if (value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  }

  #dedupeStyles(styles) {
    const seen = new Set();
    const result = [];
    styles.forEach((style) => {
      const key = JSON.stringify(style);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(style);
      }
    });
    return result;
  }

  //
  // Compares by connector/element content, not id - a project style's id is
  // synthesized per-extraction (see #extractProjectStyles()) so it never
  // matches a saved style's persisted id even when the style is identical.
  //
  #isStyleAlreadySaved(style) {
    const key = JSON.stringify({
      connector: style.connector || {},
      element: style.element || {},
    });
    return this.styleManager.getUserStyles().some(
      (savedStyle) =>
        JSON.stringify({
          connector: savedStyle.connector || {},
          element: savedStyle.element || {},
        }) === key,
    );
  }
}

export { EditorDetachedToolbarMenu };
