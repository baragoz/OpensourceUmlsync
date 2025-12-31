import { PreviewStyleComponent } from "./PreviewStyleComponent";


const randomFontTypes = [
    'Vernada',
    'Serif',
    'Arial',
    'Roboto',
    'Nunito Sans'
];

const randomBackgroundColors = [
    '#FFD700', // Gold
    '#87CEEB', // Sky Blue
    '#90EE90', // Light Green
    '#FFB6C1', // Light Pink
    '#FFA07A', // Light Salmon
    '#9370DB', // Medium Purple
    '#F0E68C', // Khaki
    '#00CED1', // Dark Turquoise
    '#F5DEB3', // Wheat
    '#DDA0DD', // Plum
    '#A9A9A9', // Dark Gray
    '#40E0D0'  // Turquoise
  ];

  const umlFontColors = [
    '#5A4100', // for #FFD700 (Gold) – deep brown
    '#084C61', // for #87CEEB (Sky Blue) – steel blue
    '#14532D', // for #90EE90 (Light Green) – forest green
    '#A00040', // for #FFB6C1 (Light Pink) – deep rose
    '#7B2D00', // for #FFA07A (Light Salmon) – brick orange
    '#E6D6FF', // for #9370DB (Medium Purple) – soft lilac
    '#665C00', // for #F0E68C (Khaki) – mustard olive
    '#004F59', // for #00CED1 (Dark Turquoise) – ocean teal
    '#6B4E16', // for #F5DEB3 (Wheat) – earthy brown
    '#5E3366', // for #DDA0DD (Plum) – muted violet
    '#F0F0F0', // for #A9A9A9 (Dark Gray) – light silver gray
    '#005A63'  // for #40E0D0 (Turquoise) – cool navy
  ];
  

  function makeRandomStyles() {
    const previewStyles = Array.from({ length: 12 }, (_, i) => ({
      connector: {
        // text: `Label ${i + 1}`,
        text: 'Label',
        'font-family': 'Arial',
        'font-size': `${12 + i}px`,
        'font-color': `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`,
        'font-bg': '#ffffff',
        bold: false,
        italic: false,
        underline: false,
        color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`, // for line color
        'line-width': 1 + (i % 4)
      },
      element: {
        //text: `Box ${i + 1}`,
        text: "Box",
        'font-family': randomFontTypes[i % 5],
        'font-size': `${10 + 2 * i % 10}px`,
        'font-color': umlFontColors[i % 12],
        color: randomBackgroundColors[i % 12],
        bold: false,
        italic: false,
        underline: false
      }
    }));
    return previewStyles;
}

class PreviewStyleCarouselComponent {
    constructor($container, styles) {
        this.$container = $container;
        this.$track = $container.find("#us-ds-carousel-track");
        this.$wrapper = $container.find("#us-ds-carousel-wrapper");
        // Use wrapper if it exists, otherwise fall back to track
        this.$contentContainer = this.$wrapper.length ? this.$wrapper : this.$track;
        this.currentOffset = 0;
        this.init(styles || makeRandomStyles());
        // Arrow binding is now handled in EditorDetachedToolbarMenu.initCarouselScroll()
        // this.bindArrows();

        // DND + scroll
        this.isDragging = false;
        this.startX = 0;
        this.scrollStart = 0;
        this.bindDragging();

        this.listener = null;
      }
  
      init(styles) {
        styles.forEach(style => {
          new PreviewStyleComponent(this.$contentContainer, style, (styleValue) => {
            //
            // apply listener
            //
            if (this.listener) {
                this.listener(styleValue);
            }
          });
        });
      }

      //
      // hide menu
      //
      hide() {
        this.$container.hide();
      }

      setListener(listener) {
        this.listener = listener;
      }

      bindDragging() {
        const $container = this.$track;
  
        $container.on('touchstart mousedown', (e) => {
          this.isDragging = true;
          this.startX = e.type === 'touchstart' ? e.originalEvent.touches[0].pageX : e.pageX;
          this.scrollStart = $container.scrollLeft();
        });
  
        $container.on('touchmove mousemove', (e) => {
          if (!this.isDragging) return;
          const x = e.type === 'touchmove' ? e.originalEvent.touches[0].pageX : e.pageX;
          const delta = this.startX - x;
          $container.scrollLeft(this.scrollStart + delta);
        });
  
        $container.on('touchend mouseup mouseleave', () => {
          this.isDragging = false;
        });
      }
  
      bindArrows() {
        const scrollStep = 250;
        $('.us-ds-carousel-left').click(() => {
          this.currentOffset = Math.min(this.currentOffset + scrollStep, 0);
          this.$track.css('transform', `translateX(${this.currentOffset}px)`);
        });
  
        $('.us-ds-carousel-right').click(() => {
          this.currentOffset -= scrollStep;
          this.$track.css('transform', `translateX(${this.currentOffset}px)`);
        });
      }
}

export { PreviewStyleCarouselComponent }