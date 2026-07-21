import { PreviewStyleComponent } from "./PreviewStyleComponent";

class PreviewStyleCarouselComponent {
  /**
   * @param {*} $container
   * @param {Array<{id, connector, element}>} styles
   * @param {Object} [options]
   * @param {(id: string) => void} [options.onRemove] when set, each swatch
   *   gets a remove ("x") control that calls back with the swatch's style
   *   id - used for the "saved styles" carousel.
   * @param {(style: {id, connector, element}) => void} [options.onSave]
   *   when set, each swatch gets a bookmark/save control that calls back
   *   with the swatch's style - used for the "project styles" carousel, to
   *   save a style used in the current diagram into the user's saved styles.
   * @param {(style: {id, connector, element, pinned}) => void} [options.onPin]
   *   when set, each swatch gets a pin control (left side, filled when
   *   `style.pinned` is true) that calls back with the swatch's style,
   *   including its current `pinned` flag so the caller can toggle it -
   *   used for the "system styles" and "saved styles" carousels. Pinned
   *   styles are expected to already be sorted first by the caller.
   * @param {string} [options.trackId] id of the track element to render
   *   into, for containers with more than one track (system vs. saved
   *   styles) - the matching wrapper is assumed to be
   *   `${trackId replace 'track' -> 'wrapper'}`.
   * @param {{title: string, message: string}} [options.emptyState] when
   *   set and `styles` is empty, a placeholder with this title/message is
   *   rendered instead of no swatches at all.
   */
  constructor(
    $container,
    styles,
    {
      onRemove,
      onSave,
      onPin,
      trackId = "us-ds-carousel-track",
      emptyState,
    } = {},
  ) {
    this.$container = $container;
    this.$track = $container.find(`#${trackId}`);
    this.$wrapper = $container.find(
      `#${trackId.replace("-track", "-wrapper")}`,
    );
    // Use wrapper if it exists, otherwise fall back to track
    this.$contentContainer = this.$wrapper.length ? this.$wrapper : this.$track;
    this.currentOffset = 0;
    this.onRemove = onRemove;
    this.onSave = onSave;
    this.onPin = onPin;
    this.emptyState = emptyState;
    this.init(styles || []);
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
    if (!styles.length && this.emptyState) {
      this.renderEmptyState();
      return;
    }

    styles.forEach((style) => {
      const preview = new PreviewStyleComponent(
        this.$contentContainer,
        style,
        (styleValue) => {
          //
          // apply listener
          //
          if (this.listener) {
            this.listener(styleValue);
          }
        },
      );

      if (this.onRemove) {
        const $removeBtn = $(
          '<button type="button" class="us-ds-carousel-remove" title="Remove style">&times;</button>',
        );
        $removeBtn.on("click", (e) => {
          e.stopPropagation();
          this.onRemove(style.id);
        });
        preview.$el.append($removeBtn);
      }

      if (this.onSave) {
        const $saveBtn = $(`
              <button type="button" class="us-ds-carousel-save" title="Save style">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z" fill="#EEEFF8"/>
                  <path d="M5.5 4.75C5.5 4.06 6.06 3.5 6.75 3.5H17.25C17.94 3.5 18.5 4.06 18.5 4.75V20L12 16.45L5.5 20V4.75Z" stroke="#54577A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 6.75H15" stroke="#54577A" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>`);
        $saveBtn.on("click", (e) => {
          e.stopPropagation();
          this.onSave(style);
        });
        preview.$el.append($saveBtn);
      }

      if (this.onPin) {
        const pinned = !!style.pinned;
        // Same pin glyph for both states - pinned uses the solid dark
        // fill, unpinned a muted/light fill, rather than a separate
        // hand-drawn outline icon.
        const fillColor = pinned ? "#54577A" : "#C7CAE0";
        const $pinBtn = $(`
              <button type="button" class="us-ds-carousel-pin${pinned ? " us-ds-carousel-pin-active" : ""}" title="${pinned ? "Unpin style" : "Pin style"}">
                ${PreviewStyleCarouselComponent.pinIcon(fillColor)}
              </button>`);
        $pinBtn.on("click", (e) => {
          e.stopPropagation();
          this.onPin({ ...style, pinned });
        });
        preview.$el.append($pinBtn);
      }
    });
  }

  static pinIcon(fillColor) {
    return `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.7 3.7C12.45 3.54 13.08 3.85 13.68 4.3C14.3 4.76 15 5.47 15.86 6.33L18.42 8.9C19.27 9.75 19.98 10.46 20.43 11.07C20.89 11.69 21.21 12.37 21.04 13.15C20.87 13.94 20.3 14.42 19.63 14.8C18.96 15.17 18.03 15.52 16.9 15.94L15.31 16.54C14.64 16.79 14.49 16.86 14.37 16.96C14.31 17.01 14.25 17.07 14.21 17.13C14.12 17.25 14.06 17.42 13.87 18.11C13.68 18.81 13.52 19.4 13.34 19.84C13.16 20.28 12.91 20.73 12.45 20.99C12.14 21.17 11.78 21.27 11.42 21.27C10.89 21.27 10.45 21.01 10.08 20.71C9.7 20.41 9.27 19.98 8.75 19.46L7.54 18.25L4.2 21.59C3.91 21.88 3.43 21.88 3.14 21.59C2.84 21.3 2.84 20.82 3.14 20.53L6.48 17.19L5.32 16.03C4.81 15.52 4.37 15.08 4.08 14.71C3.78 14.34 3.52 13.9 3.52 13.37C3.51 13 3.61 12.64 3.79 12.32C4.06 11.87 4.5 11.62 4.94 11.44C5.38 11.26 5.97 11.1 6.67 10.91C7.36 10.72 7.52 10.66 7.65 10.57C7.71 10.53 7.77 10.47 7.83 10.41C7.92 10.29 7.99 10.14 8.24 9.46L8.82 7.88C9.24 6.73 9.58 5.8 9.94 5.13C10.31 4.45 10.8 3.88 11.7 3.7Z" fill="${fillColor}"/>
          </svg>`;
  }

  static DEFAULT_EMPTY_ICON = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.5 4.75C5.5 4.06 6.06 3.5 6.75 3.5H17.25C17.94 3.5 18.5 4.06 18.5 4.75V20L12 16.45L5.5 20V4.75Z" stroke="#B7BAD1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 6.75H15" stroke="#B7BAD1" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;

  renderEmptyState() {
    const { title, message, icon } = this.emptyState;
    const $empty = $(`
          <div class="us-ds-carousel-empty">
            <div class="us-ds-carousel-empty-icon">${icon || PreviewStyleCarouselComponent.DEFAULT_EMPTY_ICON}</div>
            <div class="us-ds-carousel-empty-text">
              <div class="us-ds-carousel-empty-title"></div>
              <div class="us-ds-carousel-empty-subtitle"></div>
            </div>
          </div>`);
    $empty.find(".us-ds-carousel-empty-title").text(title);
    $empty.find(".us-ds-carousel-empty-subtitle").text(message);
    this.$contentContainer.append($empty);
  }

  //
  // Replace the currently rendered swatches, e.g. after a save/remove.
  //
  refresh(styles) {
    this.$contentContainer.empty();
    this.init(styles || []);
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

    $container.on("touchstart mousedown", (e) => {
      this.isDragging = true;
      this.startX =
        e.type === "touchstart" ? e.originalEvent.touches[0].pageX : e.pageX;
      this.scrollStart = $container.scrollLeft();
    });

    $container.on("touchmove mousemove", (e) => {
      if (!this.isDragging) return;
      const x =
        e.type === "touchmove" ? e.originalEvent.touches[0].pageX : e.pageX;
      const delta = this.startX - x;
      $container.scrollLeft(this.scrollStart + delta);
    });

    $container.on("touchend mouseup mouseleave", () => {
      this.isDragging = false;
    });
  }

  bindArrows() {
    const scrollStep = 250;
    $(".us-ds-carousel-left").click(() => {
      this.currentOffset = Math.min(this.currentOffset + scrollStep, 0);
      this.$track.css("transform", `translateX(${this.currentOffset}px)`);
    });

    $(".us-ds-carousel-right").click(() => {
      this.currentOffset -= scrollStep;
      this.$track.css("transform", `translateX(${this.currentOffset}px)`);
    });
  }
}

export { PreviewStyleCarouselComponent };
