// Offline Queue System
export class OfflineQueue {
  constructor() {
    this.dbName = 'offline_queue';
    this.storeName = 'requests';
    this.db = null;
    this.init();
  }

  async init() {
    this.db = await this.openDB();
    window.addEventListener('online', () => this.processQueue());
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  async addRequest(request) {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const requestData = {
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };

    return new Promise((resolve, reject) => {
      const addRequest = store.add(requestData);
      addRequest.onsuccess = () => resolve(addRequest.result);
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  async getRequests(status = 'pending') {
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('status');

    return new Promise((resolve, reject) => {
      const request = index.getAll(status);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateRequest(id, updates) {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          Object.assign(data, updates);
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Request not found'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteRequest(id) {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const deleteRequest = store.delete(id);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }

  async processQueue() {
    if (!navigator.onLine) return;

    const requests = await this.getRequests('pending');

    for (const request of requests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });

        if (response.ok) {
          await this.deleteRequest(request.id);
        } else {
          await this.updateRequest(request.id, {
            retries: request.retries + 1,
            lastError: `HTTP ${response.status}`
          });

          if (request.retries >= 3) {
            await this.updateRequest(request.id, { status: 'failed' });
          }
        }
      } catch (error) {
        await this.updateRequest(request.id, {
          retries: request.retries + 1,
          lastError: error.message
        });

        if (request.retries >= 3) {
          await this.updateRequest(request.id, { status: 'failed' });
        }
      }
    }
  }
}

export default OfflineQueue;
