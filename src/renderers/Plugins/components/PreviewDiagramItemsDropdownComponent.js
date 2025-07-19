import { BaseDiagram } from "../../../diagrams/BaseDiagram";
import { EditorDetachedToolbarMenu } from "../EditorDetachedToolbarMenu";


export class PreviewDiagramItemsDropdownComponent {
    /**
     * 
     * @param {EditorDetachedToolbarMenu} toolbar 
     * @param {BaseDiagram} diagram 
     * @param {string} placeholderSelector 
     * @param {*} items 
     * @param {number} maxPreview 
     */
    constructor(toolbar, diagram, placeholderSelector, items = [], maxPreview = 3) {
      this.toolbar = toolbar;
      this.$placeholder = $(placeholderSelector);
      this.items = items;
      this.diagram = diagram;
      this.maxPreview = maxPreview;
      this.selectedItems = items.slice(0, maxPreview);
      this._render();
      this._bindEvents();
    }
  
    _render() {
      const html = `
        <div class="us-preview-dropdown-menu">
          <div class="us-preview-dropdown-preview"></div>
          <div class="us-preview-dropdown-arrow">▼</div>
          <div class="us-preview-dropdown-full-menu"></div>
        </div>
      `;
      this.$placeholder.html(html);
  
      this.$preview = this.$placeholder.find(".us-preview-dropdown-preview");
      this.$arrow = this.$placeholder.find(".us-preview-dropdown-arrow");
      this.$menu = this.$placeholder.find(".us-preview-dropdown-full-menu");
  
      this._renderPreview();
      this._renderMenu();
    }
  
    _renderPreview() {
      this.$preview.empty();
      this.selectedItems.slice(0, this.maxPreview).forEach(item => {
        const icon = $('<div class="us-preview-menu-icon">' + item.svg + '</div>');
        icon.on("click", () => {
            // create connetor or element
            this.onItemClick(item);
        });
        this.$preview.append(icon);
      });
    }
  
    _renderMenu() {
      this.$menu.empty();
      this.items.forEach(item => {
        const $item = this._createMenuItem(item);
        this.$menu.append($item);
      });
    }
  
    _createMenuItem(item) {
      var $link = null;
      if (item.svg) {
      $link = $(`
        <div class="menu-item">
          <div class="menu-item-list-variant">
            <div class="menu-item-svg">
              <svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.3 18H11.7C16.2 18 18 16.2 18 11.7V6.3C18 1.8 16.2 0 11.7 0H6.3C1.8 0 0 1.8 0 6.3V11.7C0 16.2 1.8 18 6.3 18Z" fill="#0BCA6E"/>
              </svg>
            </div>
            <div class="us-side-menu-icon">${item.svg}</div>
          </div>
          <span class="diagram-name">${item.description || "Unknown"}</span>
        </div>
      `);
      } else {
        $link = $(`
        <div class="menu-item">
          <div class="menu-item-list-variant">
            <div class="menu-item-svg">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.3 18H11.7C16.2 18 18 16.2 18 11.7V6.3C18 1.8 16.2 0 11.7 0H6.3C1.8 0 0 1.8 0 6.3V11.7C0 16.2 1.8 18 6.3 18Z" fill="#0BCA6E"/>
              </svg>
            </div>
            <div class="icons-sprite ${item.css || ""} us-side-menu-icon"></div>
          </div>
          <span class="diagram-name">${item.description || "Unknown"}</span>
        </div>
      `);
      }
  
      $link.on("click", () => {

        // create connetor or element
        this.onItemClick(item);
      
        // Update UI to show selected element in the top menu
        this.selectedItems.unshift(item);
        this.selectedItems = [...new Map(this.selectedItems.map(i => [i.svg, i])).values()];
        this._renderPreview();
        this.$menu.hide();
      });
  
      return $link;
    }
  
    _bindEvents() {
      this.$arrow.on("click", (e) => {
        this.$menu.css("top", -8 - this.$menu.height());
        this.$menu.toggle();
        e.stopPropagation();
      });
  
      $(document).on("click", () => {
        this.$menu.hide();
      });
  
      this.$placeholder.on("click", (e) => {
        e.stopPropagation(); // prevent bubbling from preview click
      });
    }

    onItemClick(item) {
        //
        // Create an element instance
        //
        if (this.diagram) {
            if (item.element && item.element != "") {
              let val = item.jsonModel|| {};
              let opt = this.toolbar.getDefaultElementOptions();
              this.diagram.Element(item.element, {...val, ...opt});
            }

            if (item.connector && item.connector != "") {
                let opt = this.toolbar.getDefaultConnectorOptions();
                this.diagram.Connector(item.connector, {
                    fromId: null,
                    toId: null,
                    epoints: [ {x: 200, y: 300}, {x: 400, y: 200}],
                    ...opt
                });
            }
        }
    }
}