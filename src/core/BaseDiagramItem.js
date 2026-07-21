const defaultOptions = {
  editable: true,
  nameTemplate: "base",
};

class BaseDiagramItem {
  // Unique ID for each element
  euid = "";

  constructor(options, uid) {
    // Extend options
    this.options = { ...defaultOptions, ...options };

    // generate unique id
    this.euid = this.generateUniqueId(uid);
  }

  //
  // Generate unique id for each diagram element
  //
  generateUniqueId(uid) {
    let prefix = this.options.prefix || Date.now();
    return `${prefix}${uid}`;
  }

  //
  // Keep plugins with elements, to make it easier to destroy them
  //
  userData = new Map();
  setUserData(key, value) {
    this.userData.set(key, value);
  }

  getUserData(key) {
    return this.userData.get(key);
  }

  removeInstance() {
    this.userData = new Map();
  }

  _setOption(key, val) {
    // Empty
  }
}

export { BaseDiagramItem };
