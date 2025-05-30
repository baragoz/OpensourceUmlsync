const defaultOptions = {
  editable: true,
  nameTemplate: "base"
};

class BaseDiagramItem {
    // Unique ID for each element
    euid = "";
  
    constructor(options) {
      // Extend options
      this.options = {...defaultOptions, ...options};

      // generate unique id
      this.euid = this.generateUniqueId();
    }
  
    //
    // Generate unique id for each diagram element
    //
    generateUniqueId() {
      let extra = this.getUniquePrefix();
      return `${this.options.nameTemplate}_${extra}${Math.random().toString(36).substr(2, 9)}`;
    }

    //
    // Return a custom prefix, or generate a random
    //
    getUniquePrefix() {
      return this.options.prefix || Date.now();
    }

    //
    // Generate random suffix
    //
    getRandomSuffix() {
      return `${Math.random().toString(36).substr(2, 9)}`
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
  
  export { BaseDiagramItem }