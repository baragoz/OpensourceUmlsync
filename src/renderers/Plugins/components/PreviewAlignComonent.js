export class PreviewAlignComponent {
    constructor($placeholder, initialIndex = 0) {
      this.$placeholder = $placeholder;
      this.iconList = [
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4349_13779)"><rect x="4.16699" y="11.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#0BCA6E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="11.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#0BCA6E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="2.5" y="3.66675" width="5" height="5" rx="1" stroke="#0BCA6E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="5.3335" width="1.66667" height="1.66667" rx="0.833333" stroke="#0BCA6E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#0BCA6E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#0BCA6E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="11.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#0BCA6E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="5.3335" width="1.66667" height="1.66667" rx="0.833333" stroke="#0BCA6E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#0BCA6E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_4349_13779"><rect width="20" height="20" fill="white" transform="translate(2 2)"/></clipPath></defs></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4.16699" y="11.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="11.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="5.3335" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="9.5" y="3.66675" width="5" height="5" rx="1" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="11.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="5.3335" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4349_13944)"><rect x="4.16699" y="11.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="11.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="5.3335" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="5.3335" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="11.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="16.5" y="3.66675" width="5" height="5" rx="1" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_4349_13944"><rect width="20" height="20" fill="white" transform="translate(2 2)"/></clipPath></defs></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4349_13955)"><rect x="2.5" y="9.5" width="5" height="5" rx="1" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_4349_13955"><rect width="20" height="20" fill="white" transform="translate(2 2)"/></clipPath></defs></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5.33301" y="11.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="5.33301" y="4.16675" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.166" y="4.16675" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="5.33301" y="18.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.166" y="18.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="17" y="11.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="17" y="4.16675" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="17" y="18.1667" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4349_13977)"><rect x="4.16699" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="16.5" y="9.5" width="5" height="5" rx="1" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_4349_13977"><rect width="20" height="20" fill="white" transform="translate(2 2)"/></clipPath></defs></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4349_13988)"><rect x="4.16699" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="2.5" y="15.3333" width="5" height="5" rx="1" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_4349_13988"><rect width="20" height="20" fill="white" transform="translate(2 2)"/></clipPath></defs></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4.16699" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="9.5" y="15.3333" width="5" height="5" rx="1" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_4349_14010)"><rect x="4.16699" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.16699" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="11.167" y="17" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="11.1665" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.167" y="5.33325" width="1.66667" height="1.66667" rx="0.833333" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="16.5" y="15.3333" width="5" height="5" rx="1" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_4349_14010"><rect width="20" height="20" fill="white" transform="translate(2 2)"/></clipPath></defs></svg>'
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