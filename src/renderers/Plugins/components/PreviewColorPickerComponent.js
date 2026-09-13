const UML_LIGHT_PALETTE = [
  // Gray
  '#FFFFFF',
  '#EEEEEE',
  '#CCCCCC',
  '#AAAAAA',
  '#888888',
  '#555555',
  '#222222',

  // Red
  '#FFEBEE',
  '#FFCDD2',
  '#EF9A9A',
  '#E57373',
  '#EF5350',
  '#F44336',
  '#B71C1C',

  // Orange
  '#FFF3E0',
  '#FFE0B2',
  '#FFCC80',
  '#FFB74D',
  '#FF9800',
  '#F57C00',
  '#BF5B00',

  // Yellow
  '#FFFDE7',
  '#FFF9C4',
  '#FFF176',
  '#FFEE58',
  '#FFEB3B',
  '#FBC02D',
  '#C49000',

  // Green
  '#E8F5E9',
  '#C8E6C9',
  '#A5D6A7',
  '#81C784',
  '#4CAF50',
  '#388E3C',
  '#1B5E20',

  // Cyan / Teal
  '#E0F7FA',
  '#B2EBF2',
  '#80DEEA',
  '#4DD0E1',
  '#00BCD4',
  '#008C9E',
  '#006064',

  // Blue
  '#E3F2FD',
  '#BBDEFB',
  '#90CAF9',
  '#64B5F6',
  '#2196F3',
  '#1976D2',
  '#0D47A1',

  // Purple
  '#F3E5F5',
  '#E1BEE7',
  '#CE93D8',
  '#BA68C8',
  '#9C27B0',
  '#7B1FA2',
  '#4A148C',
];

const UML_LIGHT_PALETTE2 = [
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

const UML_DARK_PALETTE = [
  // Gray
  '#1E1E1E',
  '#2A2A2A',
  '#3A3A3A',
  '#505050',
  '#707070',
  '#A0A0A0',
  '#FFFFFF',

  // Red
  '#321F22',
  '#45262B',
  '#5A3036',
  '#713A42',
  '#8A4650',
  '#A94F5B',
  '#D96A75',

  // Orange
  '#33261C',
  '#47301E',
  '#5C3A20',
  '#754722',
  '#915625',
  '#B36A28',
  '#DC8734',

  // Yellow
  '#302B18',
  '#41391A',
  '#55491C',
  '#6A5A1E',
  '#826D20',
  '#A38725',
  '#C9A72E',

  // Green
  '#1B2D20',
  '#203B27',
  '#284C31',
  '#315E3B',
  '#3A7347',
  '#478C56',
  '#5DA96A',

  // Cyan / Teal
  '#172D30',
  '#1A3B3F',
  '#1D4B51',
  '#205E66',
  '#24737D',
  '#298B97',
  '#35A6B3',

  // Blue
  '#192A3A',
  '#1D354A',
  '#22445D',
  '#285474',
  '#30668D',
  '#397BA8',
  '#4C91C3',

  // Purple
  '#2A2030',
  '#382640',
  '#492E53',
  '#5C3868',
  '#71437E',
  '#89519A',
  '#A865B8',
];

export class PreviewColorPickerComponent {
  constructor($placeholder, labels = [], palette = null, themeDetector = null) {
    this.$placeholder = $placeholder;
    this.labels = labels;
    this.themeDetector = themeDetector;
    this.explicitPalette = !!palette;
    this.palette = palette || (themeDetector?.isDarkMode() ? UML_DARK_PALETTE : UML_LIGHT_PALETTE);
    this.selectedColors = new Array(labels.length).fill(null);
    this.onColorSelected = null;

    this._createPopup();
    this._bindEvents();

    if (themeDetector && !this.explicitPalette) {
      themeDetector.onThemeChange((isDark) => {
        this.palette = isDark ? UML_DARK_PALETTE : UML_LIGHT_PALETTE;
        this._renderPalette();
      });
    }
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
                <div class="us-color-grid"></div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `);

    this.$popup = popup;
    this.$placeholder.append(popup);
    this._renderPalette();
  }

  _renderPalette() {
    const self = this;

    this.$popup.find(".us-color-block").each(function () {
      const index = $(this).data("index");
      const $grid = $(this).find(".us-color-grid");

      $grid.empty();
      self.palette.forEach((color) => {
        $(`<div class="us-color-cell" style="background-color: ${color};" data-color="${color}"></div>`)
          .on("click", function () {
            const clickedColor = $(this).data("color");
            self.selectedColors[index] = clickedColor;
            if (self.onColorSelected) self.onColorSelected(index, clickedColor);
            self.hide();
          })
          .appendTo($grid);
      });
    });
  }

  _bindEvents() {
    // Close button
    this.$popup.find(".us-color-close").on("click", () => this.hide());

    // Click outside to close
    $(document).on("click", () => this.hide());

    // Prevent bubbling inside popup
    this.$popup.on("click", (e) => e.stopPropagation());

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
