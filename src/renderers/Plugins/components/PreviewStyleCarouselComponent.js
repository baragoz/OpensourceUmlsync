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
     *   with the swatch's style - used for the "system styles" carousel, to
     *   save a preset into the user's saved styles.
     * @param {string} [options.trackId] id of the track element to render
     *   into, for containers with more than one track (system vs. saved
     *   styles) - the matching wrapper is assumed to be
     *   `${trackId replace 'track' -> 'wrapper'}`.
     * @param {{title: string, message: string}} [options.emptyState] when
     *   set and `styles` is empty, a placeholder with this title/message is
     *   rendered instead of no swatches at all.
     */
    constructor($container, styles, { onRemove, onSave, trackId = "us-ds-carousel-track", emptyState } = {}) {
        this.$container = $container;
        this.$track = $container.find(`#${trackId}`);
        this.$wrapper = $container.find(`#${trackId.replace("-track", "-wrapper")}`);
        // Use wrapper if it exists, otherwise fall back to track
        this.$contentContainer = this.$wrapper.length ? this.$wrapper : this.$track;
        this.currentOffset = 0;
        this.onRemove = onRemove;
        this.onSave = onSave;
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

        styles.forEach(style => {
          const preview = new PreviewStyleComponent(this.$contentContainer, style, (styleValue) => {
            //
            // apply listener
            //
            if (this.listener) {
                this.listener(styleValue);
            }
          });

          if (this.onRemove) {
            const $removeBtn = $('<button type="button" class="us-ds-carousel-remove" title="Remove style">&times;</button>');
            $removeBtn.on('click', (e) => {
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
            $saveBtn.on('click', (e) => {
              e.stopPropagation();
              this.onSave(style);
            });
            preview.$el.append($saveBtn);
          }
        });
      }

      renderEmptyState() {
        const { title, message } = this.emptyState;
        const $empty = $(`
          <div class="us-ds-carousel-empty">
            <div class="us-ds-carousel-empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 4.75C5.5 4.06 6.06 3.5 6.75 3.5H17.25C17.94 3.5 18.5 4.06 18.5 4.75V20L12 16.45L5.5 20V4.75Z" stroke="#B7BAD1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 6.75H15" stroke="#B7BAD1" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="us-ds-carousel-empty-text">
              <div class="us-ds-carousel-empty-title"></div>
              <div class="us-ds-carousel-empty-subtitle"></div>
            </div>
          </div>`);
        $empty.find('.us-ds-carousel-empty-title').text(title);
        $empty.find('.us-ds-carousel-empty-subtitle').text(message);
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