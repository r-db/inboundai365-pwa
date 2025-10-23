// Unified Storage Management
export class StorageManager {
  constructor() {
    this.stores = {
      local: localStorage,
      session: sessionStorage,
      indexed: null
    };
    this.quota = null;
    this.init();
  }

  async init() {
    await this.initIndexedDB();
    await this.checkStorageQuota();
    this.setupStorageEvents();
    this.cleanupExpiredData();
  }

  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('app_storage', 1);

      request.onsuccess = () => {
        this.stores.indexed = request.result;
        resolve();
      };

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        if (!db.objectStoreNames.contains('data')) {
          const store = db.createObjectStore('data', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('blobs')) {
          db.createObjectStore('blobs', { keyPath: 'id' });
        }
      };
    });
  }

  async checkStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      this.quota = {
        usage: estimate.usage,
        quota: estimate.quota,
        percentage: (estimate.usage / estimate.quota) * 100
      };

      if (this.quota.percentage > 80) {
        console.warn(`Storage usage high: ${this.quota.percentage.toFixed(2)}%`);
        this.cleanupOldData();
      }
    }
  }

  setupStorageEvents() {
    window.addEventListener('storage', (e) => {
      if (e.key && e.newValue) {
        this.handleStorageChange(e.key, e.newValue, e.oldValue);
      }
    });

    setInterval(() => this.cleanupExpiredData(), 60000);
  }

  async set(key, value, options = {}) {
    const { store = 'local', ttl, encrypt = false } = options;

    const data = {
      value: encrypt ? await this.encrypt(value) : value,
      timestamp: Date.now(),
      ttl
    };

    switch (store) {
      case 'local':
      case 'session':
        try {
          this.stores[store].setItem(key, JSON.stringify(data));
        } catch (e) {
          if (e.name === 'QuotaExceededError') {
            await this.makeSpace(store);
            this.stores[store].setItem(key, JSON.stringify(data));
          }
        }
        break;

      case 'indexed':
        await this.setIndexedDB(key, data);
        break;
    }
  }

  async get(key, options = {}) {
    const { store = 'local', decrypt = false } = options;

    let data;

    switch (store) {
      case 'local':
      case 'session':
        const stored = this.stores[store].getItem(key);
        if (!stored) return null;

        try {
          data = JSON.parse(stored);
        } catch {
          return stored;
        }
        break;

      case 'indexed':
        data = await this.getIndexedDB(key);
        break;
    }

    if (!data) return null;

    if (data.ttl && Date.now() - data.timestamp > data.ttl) {
      await this.remove(key, { store });
      return null;
    }

    const value = data.value !== undefined ? data.value : data;
    return decrypt ? await this.decrypt(value) : value;
  }

  async setIndexedDB(key, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.stores.indexed.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.put({ key, ...value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getIndexedDB(key) {
    return new Promise((resolve) => {
      const transaction = this.stores.indexed.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  }

  async remove(key, options = {}) {
    const { store = 'local' } = options;

    switch (store) {
      case 'local':
      case 'session':
        this.stores[store].removeItem(key);
        break;

      case 'indexed':
        await this.removeIndexedDB(key);
        break;
    }
  }

  async removeIndexedDB(key) {
    return new Promise((resolve) => {
      const transaction = this.stores.indexed.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  }

  async makeSpace(store) {
    const items = [];

    for (let i = 0; i < this.stores[store].length; i++) {
      const key = this.stores[store].key(i);
      const value = this.stores[store].getItem(key);

      try {
        const data = JSON.parse(value);
        items.push({ key, timestamp: data.timestamp || 0 });
      } catch {}
    }

    items.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.ceil(items.length * 0.25);

    for (let i = 0; i < toRemove; i++) {
      this.stores[store].removeItem(items[i].key);
    }
  }

  async cleanupExpiredData() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      await this.get(key, { store: 'local' });
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      await this.get(key, { store: 'session' });
    }
  }

  async cleanupOldData() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    if (this.stores.indexed) {
      const transaction = this.stores.indexed.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.openCursor();

      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.timestamp < thirtyDaysAgo) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }
  }

  handleStorageChange(key, newValue, oldValue) {
    window.dispatchEvent(new CustomEvent('storageChange', {
      detail: { key, newValue, oldValue }
    }));
  }

  async encrypt(data) {
    // Simple encryption placeholder
    return btoa(JSON.stringify(data));
  }

  async decrypt(encrypted) {
    // Simple decryption placeholder
    try {
      return JSON.parse(atob(encrypted));
    } catch {
      return encrypted;
    }
  }

  async clear(store = 'all') {
    switch (store) {
      case 'local':
        localStorage.clear();
        break;
      case 'session':
        sessionStorage.clear();
        break;
      case 'indexed':
        await this.clearIndexedDB();
        break;
      case 'all':
        localStorage.clear();
        sessionStorage.clear();
        await this.clearIndexedDB();
        break;
    }
  }

  async clearIndexedDB() {
    if (!this.stores.indexed) return;

    return new Promise((resolve) => {
      const transaction = this.stores.indexed.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  }
}

export default StorageManager;
