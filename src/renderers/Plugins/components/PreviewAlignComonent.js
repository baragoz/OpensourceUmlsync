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
      // Mapping from index to alignment string (3x3 grid: row-major order)
      // Row 1 (top): left-top, center-top, right-top
      // Row 2 (center): left-center, center-center, right-center
      // Row 3 (bottom): left-bottom, center-bottom, right-bottom
      this.alignmentMap = [
        'left-top',      // 0
        'center-top',    // 1
        'right-top',     // 2
        'left-center',   // 3
        'center-center', // 4
        'right-center',  // 5
        'left-bottom',   // 6
        'center-bottom', // 7
        'right-bottom'   // 8
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
                <div class="us-align-cell" data-alignment="${this.alignmentMap[i]}">${icon}</div>
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
        const alignmentString = $(e.currentTarget).data("alignment");
        const index = this.alignmentMap.indexOf(alignmentString);
        this.selectedIndex = index;
        this.$selected.html(this.iconList[index]);
        this.$popup.hide();
        if (this.onAlignSelected) this.onAlignSelected(alignmentString);
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

    getAlignmentString() {
      return this.alignmentMap[this.selectedIndex];
    }

    setAlignmentString(alignmentString) {
      const index = this.alignmentMap.indexOf(alignmentString);
      if (index !== -1) {
        this.setSelectedIndex(index);
      }
    }
  }