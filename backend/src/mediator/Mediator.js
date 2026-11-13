export default class Mediator {
  constructor() {
    this.handlers = new Map();
  }

  register(requestName, handler) {
    this.handlers.set(requestName, handler);
  }

  async send(requestName, payload) {
    const handler = this.handlers.get(requestName);
    if (!handler) {
      throw new Error(`No handler registered for ${requestName}.`);
    }
    return handler(payload);
  }
}
