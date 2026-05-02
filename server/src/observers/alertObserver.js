// Patrón Observer — Notifica automáticamente cuando un indicador supera umbrales definidos
class AlertObserver {
  constructor() {
    this.listeners = [];
  }

  subscribe(listener) {
    if (!this.listeners.includes(listener)) {
      this.listeners.push(listener);
    }
  }

  unsubscribe(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  notify(event, data) {
    for (const listener of this.listeners) {
      listener.update(event, data);
    }
  }
}

module.exports = new AlertObserver();
