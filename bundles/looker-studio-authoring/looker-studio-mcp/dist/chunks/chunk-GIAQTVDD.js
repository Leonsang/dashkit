import { createRequire as __lsCreateRequire } from 'node:module'; const require = __lsCreateRequire(import.meta.url);
import {
  DEBUG_PREFIXES
} from "./chunk-PP647YHP.js";

// node_modules/puppeteer-core/lib/puppeteer/common/BrowserWebSocketTransport.js
var BrowserWebSocketTransport = class _BrowserWebSocketTransport {
  static create(url, _headers, logger, _options) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.addEventListener("open", () => {
        return resolve(new _BrowserWebSocketTransport(ws, logger));
      });
      ws.addEventListener("error", reject);
    });
  }
  #ws;
  #logger;
  onmessage;
  onclose;
  constructor(ws, logger) {
    this.#ws = ws;
    this.#logger = logger;
    this.#ws.addEventListener("message", (event) => {
      if (this.onmessage) {
        this.onmessage.call(null, event.data);
      }
    });
    this.#ws.addEventListener("close", () => {
      if (this.onclose) {
        this.onclose.call(null);
      }
    });
    this.#ws.addEventListener("error", (err) => {
      this.#logger?.(DEBUG_PREFIXES.error)?.(err);
    });
  }
  send(message) {
    this.#ws.send(message);
  }
  close() {
    this.#ws.close();
  }
};

export {
  BrowserWebSocketTransport
};
