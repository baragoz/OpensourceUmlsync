import { BaseElement } from "../../elements/BaseElement";
import configLoader from "../../utils/ConfigLoader";
import { PreviewAlignComponent } from "./components/PreviewAlignComonent";
import { PreviewColorPickerComponent } from "./components/PreviewColorPickerComponent";
import { PreviewDiagramItemsDropdownComponent } from "./components/PreviewDiagramItemsDropdownComponent";

class EditorToolbarMenu  {
    constructor(placeholder, diagram, blackboard) {
        this.placeholder = placeholder;
        this.nativeRef = $(placeholder);

        this.diagram = diagram;
        this.blackboard = blackboard;
        this.toolbarElement = null;

        /**
         * @type {BaseElement}
         */
        this.selectedItem = null;

        this.jsonFiles =
            ["componentDiagram", "classDiagram", "packageDiagram", "sequenceDiagram", "stateDiagram"];
        
        // Reference on diagram
        this.setDiagram(diagram);

        this.blackboard.addEventListener(
            'storage:editmode', this.onEditModeChange.bind(this));

        this.blackboard.addEventListener('diagram:item:select', this.onSelectItems.bind(this));

    }

    setDiagram(diagram) {
        this.diagram = diagram;
        if (!this.toolbarElement)
          this.loadToolbar();
    }

    async loadDropdowMenu(idx) {

        const diagrams = await this.loadJSON(this.jsonFiles[idx]);

        diagrams.forEach(diagram => {
            //
            // Menu - elements
            //
            this.elementsPreview = new PreviewDiagramItemsDropdownComponent(
                this.diagram, ".us-placeholder-elements-dropdown", diagram.elements);
            //
            // Menu - connectors
            //
            this.connectorsPreview = new PreviewDiagramItemsDropdownComponent(
                this.diagram, ".us-placeholder-connectors-dropdown", diagram.connectors);
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

    async loadToolbar() {
        this.toolbarElement = $(`
  <div class="us-toolbar">
    <div class="us-placeholder-elements-dropdown"></div>
    <div class="us-div-separator"></div>
    <div class="us-placeholder-connectors-dropdown"></div>
    <div class="us-div-separator"></div>
    <button id="us-text-undo">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M280-200v-80h284q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l104 104-56 56-200-200 200-200 56 56-104 104h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H280Z"/></svg>
    </button>
    <button id="us-text-redo">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M396-200q-97 0-166.5-63T160-420q0-94 69.5-157T396-640h252L544-744l56-56 200 200-200 200-56-56 104-104H396q-63 0-109.5 40T240-420q0 60 46.5 100T396-280h284v80H396Z"/></svg>
    </button>

    <div class="us-div-separator"></div>

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

    <button id="us-text-color-picker">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M80 0v-160h800V0H80Zm140-280 210-560h100l210 560h-96l-50-144H368l-52 144h-96Zm176-224h168l-82-232h-4l-82 232Z"/></svg>
    </button>

    <div class="us-div-separator"></div>

    <button class="us-font-style-btn us-bold" id="us-text-bold">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M272-200v-560h221q65 0 120 40t55 111q0 51-23 78.5T602-491q25 11 55.5 41t30.5 90q0 89-65 124.5T501-200H272Zm121-112h104q48 0 58.5-24.5T566-372q0-11-10.5-35.5T494-432H393v120Zm0-228h93q33 0 48-17t15-38q0-24-17-39t-44-15h-95v109Z"/></svg>
    </button>
    <button class="us-font-style-btn us-italic" id="us-text-italic">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M200-200v-100h160l120-360H320v-100h400v100H580L460-300h140v100H200Z"/></svg>
    </button>
    <button class="us-font-style-btn us-underline" id="us-text-underline">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M200-120v-80h560v80H200Zm280-160q-101 0-157-63t-56-167v-330h103v336q0 56 28 91t82 35q54 0 82-35t28-91v-336h103v330q0 104-56 167t-157 63Z"/></svg>
    </button>

    <div class="us-div-separator"></div>

    <div id="us-text-align"></div>

    <div class="us-div-separator"></div>
    <button id="us-text-save-button">
      SAVE
    </button>
  </div>`);

        $(this.placeholder).empty();
        $(this.placeholder).append(this.toolbarElement);

        this.loadDropdowMenu(1, "class");

        this.initToolbar();
    }

    initToolbar() {

        let self = this;
        this.nativeRef.find('#us-text-font-style').on('change', function() {
            const value = $(this).val();
            if (self.selectedItem && self.selectedItem._setOption) {
                self.selectedItem._setOption("font-family", value);
            }
          });

        this.nativeRef.find('#us-text-font-size').on('change', function() {
            const value = $(this).val();
            if (self.selectedItem && self.selectedItem._setOption) {
                let x = [13, 8, 10, 12, 14, 18, 24, 36]
                self.selectedItem._setOption("font-size", x[value]);
            }
          });

        let textAlign = this.nativeRef.find("#us-text-align");
        //
        // B U I - bold/italic/underline
        //
        this.nativeRef.find("#us-text-bold").on("click", function() {
                if (self.selectedItem && self.selectedItem._setOption) {
                    if ($(this).hasClass("us-text-biu-active") ){
                        $(this).removeClass("us-text-biu-active");
                        self.selectedItem._setOption("font-weight", "normal");
                    } else {
                        $(this).addClass("us-text-biu-active");
                        self.selectedItem._setOption("font-weight", "bold");
                    }
                }

            
        });
        this.nativeRef.find("#us-text-italic").on("click", function() {
            if (self.selectedItem && self.selectedItem._setOption) {
                if ($(this).hasClass("us-text-biu-active") ){
                    $(this).removeClass("us-text-biu-active");
                    self.selectedItem._setOption("font-style", "normal");
                } else {
                    $(this).addClass("us-text-biu-active");
                    self.selectedItem._setOption("font-style", "italic");
                }
            }
        });
        this.nativeRef.find("#us-text-underline").on("click", function() {
            if (self.selectedItem && self.selectedItem._setOption) {
                if ($(this).hasClass("us-text-biu-active") ){
                    $(this).removeClass("us-text-biu-active");
                    self.selectedItem._setOption("text-decoration", "none");
                } else {
                    $(this).addClass("us-text-biu-active");
                    self.selectedItem._setOption("text-decoration", "underline");
                }
            }
        });
        //
        // Color picker
        //
        this.connectorsColorPicker = new PreviewColorPickerComponent(
            this.nativeRef.find("#us-text-color-picker"),
            ["Connector Color", "Label Text Color", "Label Background"]);

            this.connectorsColorPicker.onSelect((index, color) => {
                if (this.selectedItem && this.selectedItem._setOption) {

                    if (index === 0) {
                      this.selectedItem._setOption("color", color);
                    } else if (index === 1) {
                      this.selectedItem._setOption("font-color", color);
                    }
                }
            });

        this.textAlign = new PreviewAlignComponent(textAlign, 1);

        this.nativeRef.find("#us-text-save-button").on("click", function() {
            if (self.selectedItem && self.selectedItem.diagram) {
                let d = self.selectedItem.diagram.getDescription();
                console.log("DESCRIPTION:");
                console.log(JSON.stringify(d));
            }
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
        if (this.colorPicker)
          return;

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
        if (valueChange.newValue) {
            $("#dw-uml-sidebar").addClass("us-show-sidemenu").show();
        } else {
            $("#dw-uml-sidebar").removeClass("us-show-sidemenu").hide();
        }
    }

    onSelectItems(listOfItems) {

        console.log("ON ITEMS SELECT", listOfItems);

        let item = listOfItems.length > 0 ? listOfItems[0] : null;

        if (this.selectedItem == item) {
            // nothing change
            return;
        }
        this.selectedItem = item;
        this.toggleElementEditing(item === null)
    }

    toggleElementEditing(disable) {
        $("#us-text-font-style").prop("disabled", disable);
        $("#us-text-font-size").prop("disabled", disable);
        $("#us-text-color-picker").prop("disabled", disable);

        this.nativeRef.find("#us-text-align").prop("disabled", disable);
        //
        // B U I - bold/italic/underline
        //
        this.nativeRef.find("#us-text-bold").prop("disabled", disable);
        this.nativeRef.find("#us-text-italic").prop("disabled", disable);
        this.nativeRef.find("#us-text-underline").prop("disabled", disable);
    }
}

export { EditorToolbarMenu }
