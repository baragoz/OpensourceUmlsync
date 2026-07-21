import { IStyleManager } from "./IStyleManager";
import { defaultSystemStyles } from "./defaultSystemStyles";

//
// localStorage-backed IStyleManager. Storage is namespaced per editor instance
// via `storageKey` (see DiagramEditor's `id` option) so multiple DiagramEditor
// instances on the same page don't collide. Falls back to an in-memory store
// if localStorage is unavailable (disabled, SSR, quota exceeded, ...).
//
class DefaultStyleManager extends IStyleManager {
  constructor(options = {}) {
    super();
    this.storageKey = options.storageKey || "umlsync:styles";
    this.systemStyles = options.systemStyles || defaultSystemStyles;

    // in-memory fallback, used when localStorage access throws
    this.memoryUserStyles = [];
    this.memoryDefaultStyle = null;
    this.styleCounter = 0;
  }

  getSystemStyles() {
    return this.systemStyles.map((style) => ({
      id: style.id,
      connector: { ...style.connector },
      element: { ...style.element }
    }));
  }

  getUserStyles() {
    return this.#readUserStyles();
  }

  saveUserStyle(style) {
    const styles = this.#readUserStyles();
    const id = `style-${Date.now()}-${this.styleCounter++}`;
    styles.push({
      id,
      connector: { ...(style.connector || {}) },
      element: { ...(style.element || {}) }
    });
    this.#writeUserStyles(styles);
    return id;
  }

  removeUserStyle(id) {
    const styles = this.#readUserStyles();
    const filtered = styles.filter((style) => style.id !== id);
    if (filtered.length === styles.length) {
      return false;
    }
    this.#writeUserStyles(filtered);
    return true;
  }

  getDefaultStyle() {
    const stored = this.#readDefaultStyle();
    if (stored) {
      return stored;
    }
    const [firstSystemStyle] = this.getSystemStyles();
    return { connector: { ...firstSystemStyle.connector }, element: { ...firstSystemStyle.element } };
  }

  setDefaultStyle(style) {
    this.#writeDefaultStyle({
      connector: { ...(style.connector || {}) },
      element: { ...(style.element || {}) }
    });
  }

  #readUserStyles() {
    try {
      const raw = window.localStorage.getItem(`${this.storageKey}:user`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return this.memoryUserStyles;
    }
  }

  #writeUserStyles(styles) {
    try {
      window.localStorage.setItem(`${this.storageKey}:user`, JSON.stringify(styles));
    } catch (e) {
      this.memoryUserStyles = styles;
    }
  }

  #readDefaultStyle() {
    try {
      const raw = window.localStorage.getItem(`${this.storageKey}:default`);
      return raw ? JSON.parse(raw) : this.memoryDefaultStyle;
    } catch (e) {
      return this.memoryDefaultStyle;
    }
  }

  #writeDefaultStyle(style) {
    try {
      window.localStorage.setItem(`${this.storageKey}:default`, JSON.stringify(style));
    } catch (e) {
      this.memoryDefaultStyle = style;
    }
  }
}

export { DefaultStyleManager }
