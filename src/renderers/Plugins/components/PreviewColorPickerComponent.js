export class PreviewColorPickerComponent {
  constructor($placeholder, labels = [], palette = null) {
    this.$placeholder = $placeholder;
    this.labels = labels;
    this.palette = palette || [
      "#000",
      "#111",
      "#222",
      "#333",
      "#444",
      "#555",
      "#666",
      "#777",
      "#888",
      "#999",
      "#aaa",
      "#bbb",
      "#ccc",
      "#ddd",
      "#eee",
      "#fff",
      "red",
      "darkred",
      "orange",
      "gold",
      "yellow",
      "green",
      "lime",
      "teal",
      "cyan",
      "skyblue",
      "blue",
      "navy",
      "purple",
      "violet",
      "pink",
      "deeppink",
      "brown",
      "saddlebrown",
      "olive",
      "forestgreen",
      "seagreen",
      "lightgreen",
      "lightgray",
      "gray",
      "darkgray",
      "black",
      "white",
      "indigo",
      "coral",
      "salmon",
      "khaki",
      "tan",
      "orchid",
      "plum",
      "peru",
      "chocolate",
      "crimson",
      "maroon",
      "slategray",
      "slateblue",
    ];
    this.selectedColors = new Array(labels.length).fill(null);
    this.onColorSelected = null;

    this._createPopup();
    this._bindEvents();
  }

  _createPopup() {
    const popup = $(`
        <div class="us-color-picker" style="display: none;" onclick="event.stopPropagation()">
          <div class="us-color-labels">
            <span>Select a color</span>
            <button class="us-color-close">✕</button>
          </div>
          <div class="us-color-multiple-palettes">
            ${this.labels
              .map(
                (label, i) => `
              <div class="us-color-block" data-index="${i}">
                <div class="us-color-title">${label}</div>
                <div class="us-color-grid">
                  ${this.palette
                    .map(
                      (color) => `
                    <div class="us-color-cell" style="background-color: ${color};" data-color="${color}"></div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `);

    this.$popup = popup;
    this.$placeholder.append(popup);
  }

  _bindEvents() {
    const self = this;

    // Close button
    this.$popup.find(".us-color-close").on("click", () => this.hide());

    // Click outside to close
    $(document).on("click", () => this.hide());

    // Prevent bubbling inside popup
    this.$popup.on("click", (e) => e.stopPropagation());

    // Color selection
    this.$popup.find(".us-color-block").each(function () {
      const index = $(this).data("index");
      $(this)
        .find(".us-color-cell")
        .on("click", function () {
          const color = $(this).data("color");
          self.selectedColors[index] = color;
          if (self.onColorSelected) self.onColorSelected(index, color);
          self.hide();
        });
    });

    this.$placeholder.on("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      console.log("SHOW NOW");
      this.show();
    });
  }

  show() {
    this.$popup.css({
      top: -4 - this.$popup.outerHeight(), // 8px gap above
    });
    this.$popup.show();
  }

  hide() {
    this.$popup.hide();
  }

  onSelect(callback) {
    this.onColorSelected = callback;
  }

  getColor(index) {
    return this.selectedColors[index];
  }

  setColor(index, color) {
    this.selectedColors[index] = color;
  }
}
