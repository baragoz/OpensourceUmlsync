/*
 * ThemeDetector — the JS-side counterpart to the CSS-only theming in
 * ../assets/css/themes/. CSS already resolves dark/light via VS Code's
 * `body.vscode-*` classes and `prefers-color-scheme`; this class exposes the
 * same answer to JS for the few places that can't be styled with
 * `currentColor` / CSS custom properties alone (e.g. baked-in hex swatch
 * palettes in PreviewColorPickerComponent).
 *
 * Priority order mirrors the CSS cascade: an active VS Code theme class
 * always wins (it's authoritative when present), then an explicit `theme`
 * option passed by the host app, then the OS `prefers-color-scheme`.
 */
export class ThemeDetector {
  constructor(themeOption = "auto") {
    this.themeOption = themeOption;
    this._listeners = new Set();
    this._mql = window.matchMedia("(prefers-color-scheme: dark)");
    this._observer = new MutationObserver(() => this._notify());
    this._observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    this._mql.addEventListener("change", () => this._notify());
    this._lastValue = this.isDarkMode();
  }

  isDarkMode() {
    const cls = document.body.classList;
    if (cls.contains("vscode-dark") || cls.contains("vscode-high-contrast")) {
      return true;
    }
    if (cls.contains("vscode-light") || cls.contains("vscode-high-contrast-light")) {
      return false;
    }
    if (this.themeOption === "dark") return true;
    if (this.themeOption === "light") return false;
    return this._mql.matches;
  }

  onThemeChange(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  destroy() {
    this._observer.disconnect();
    this._listeners.clear();
  }

  _notify() {
    const value = this.isDarkMode();
    if (value === this._lastValue) return;
    this._lastValue = value;
    this._listeners.forEach((cb) => cb(value));
  }
}
