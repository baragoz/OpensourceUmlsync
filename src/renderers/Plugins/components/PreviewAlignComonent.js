export class PreviewAlignComponent {
    constructor($placeholder, initialIndex = 0) {
      this.$placeholder = $placeholder;
      this.iconList = [
        '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-120v-80h720v80H120Zm0-160v-80h480v80H120Zm0-160v-80h720v80H120Zm0-160v-80h480v80H120Zm0-160v-80h720v80H120Z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-120v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-760v-80h720v80H120Zm240 160v-80h480v80H360ZM120-440v-80h720v80H120Zm240 160v-80h480v80H360ZM120-120v-80h720v80H120Z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-120v-80h720v80H120Zm0-160v-80h480v80H120Zm0-160v-80h720v80H120Zm0-160v-80h480v80H120Zm0-160v-80h720v80H120Z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-120v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-760v-80h720v80H120Zm240 160v-80h480v80H360ZM120-440v-80h720v80H120Zm240 160v-80h480v80H360ZM120-120v-80h720v80H120Z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-120v-80h720v80H120Zm0-160v-80h480v80H120Zm0-160v-80h720v80H120Zm0-160v-80h480v80H120Zm0-160v-80h720v80H120Z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-120v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Z"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-760v-80h720v80H120Zm240 160v-80h480v80H360ZM120-440v-80h720v80H120Zm240 160v-80h480v80H360ZM120-120v-80h720v80H120Z"/></svg>'
      ];
      this.selectedIndex = initialIndex || 0;
      this.onAlignSelected = null;
      this._render();
      this._bindEvents();
    }
  
    _render() {
      const wrapper = $(`
        <div class="us-preview-align">
          <div class="us-align-selected">${this.iconList[this.selectedIndex]}</div>
          <div class="us-align-popup" style="display: none;">
            <div class="us-align-grid">
              ${this.iconList.map((icon, i) => `
                <div class="us-align-cell" data-index="${i}">${icon}</div>
              `).join('')}
            </div>
          </div>
        </div>
      `);
  
      this.$container = wrapper;
      this.$selected = wrapper.find(".us-align-selected");
      this.$popup = wrapper.find(".us-align-popup");
  
      this.$placeholder.append(wrapper);
    }
  
    _bindEvents() {
      this.$selected.on("click", (e) => {
        this.$popup.toggle();
        e.stopPropagation();
      });
  
      this.$popup.on("click", (e) => e.stopPropagation());
  
      $(document).on("click", () => {
        this.$popup.hide();
      });
  
      this.$popup.find(".us-align-cell").on("click", (e) => {
        const index = $(e.currentTarget).data("index");
        this.selectedIndex = index;
        this.$selected.html(this.iconList[index]);
        this.$popup.hide();
        if (this.onAlignSelected) this.onAlignSelected(index);
      });
    }
  
    onSelect(callback) {
      this.onAlignSelected = callback;
    }
  
    getSelectedIndex() {
      return this.selectedIndex;
    }
  
    setSelectedIndex(index) {
      this.selectedIndex = index;
      this.$selected.html(this.iconList[index]);
    }
  }