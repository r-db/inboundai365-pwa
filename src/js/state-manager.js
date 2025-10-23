// Lightweight State Management with Proxy
export class StateManager {
  constructor(initialState = {}) {
    this.listeners = new Map();
    this.state = this.createReactiveState(initialState);
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 100;
  }

  createReactiveState(target, path = []) {
    return new Proxy(target, {
      get: (obj, prop) => {
        const value = obj[prop];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return this.createReactiveState(value, [...path, prop]);
        }
        return value;
      },

      set: (obj, prop, value) => {
        const oldValue = obj[prop];
        obj[prop] = value;

        this.addToHistory({ path: [...path, prop], oldValue, value });
        this.notify([...path, prop], value, oldValue);

        return true;
      },

      deleteProperty: (obj, prop) => {
        const oldValue = obj[prop];
        delete obj[prop];
        this.notify([...path, prop], undefined, oldValue);
        return true;
      }
    });
  }

  subscribe(path, callback) {
    const key = Array.isArray(path) ? path.join('.') : path;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  notify(path, value, oldValue) {
    const key = path.join('.');
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(cb => cb(value, oldValue, path));
    }

    for (let i = path.length - 1; i > 0; i--) {
      const parentKey = path.slice(0, i).join('.');
      const parentCallbacks = this.listeners.get(parentKey);
      if (parentCallbacks) {
        parentCallbacks.forEach(cb => cb(this.getValueAtPath(path.slice(0, i)), oldValue, path));
      }
    }
  }

  getValueAtPath(path) {
    return path.reduce((obj, key) => obj?.[key], this.state);
  }

  setValueAtPath(path, value) {
    const last = path[path.length - 1];
    const parent = path.slice(0, -1).reduce((obj, key) => obj[key], this.state);
    if (parent) {
      parent[last] = value;
    }
  }

  addToHistory(change) {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(change);
    this.historyIndex++;

    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo() {
    if (this.historyIndex >= 0) {
      const change = this.history[this.historyIndex];
      this.setValueAtPath(change.path, change.oldValue);
      this.historyIndex--;
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const change = this.history[this.historyIndex];
      this.setValueAtPath(change.path, change.value);
    }
  }

  reset() {
    this.history = [];
    this.historyIndex = -1;
  }
}

export default StateManager;
