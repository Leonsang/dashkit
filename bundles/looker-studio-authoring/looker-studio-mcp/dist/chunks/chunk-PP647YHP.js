import { createRequire as __lsCreateRequire } from 'node:module'; const require = __lsCreateRequire(import.meta.url);

// node_modules/puppeteer-core/lib/puppeteer/environment.js
var isNode = !!(typeof process !== "undefined" && process.version);
var environment = {
  value: {
    followSymlinks: true,
    ScreenRecorder: class {
      constructor() {
        throw new Error("ScreenRecorder is not available in this environment");
      }
    },
    readFile: (() => {
      throw new Error("readFile is not available in this environment");
    }),
    writeFile: () => {
      throw new Error("writeFile is not available in this environment");
    },
    openFileForWriting: () => {
      throw new Error("openFileForWriting is not available in this environment");
    },
    createWriteStream: () => {
      throw new Error("createWriteStream is not available in this environment");
    },
    mkdir: () => {
      throw new Error("mkdir is not available in this environment");
    }
  }
};

// node_modules/puppeteer-core/lib/puppeteer/common/Debug.js
var DEBUG_PREFIXES = {
  cdpSend: "puppeteer:protocol:SEND \u25BA",
  cdpReceive: "puppeteer:protocol:RECV \u25C0",
  bidiSend: "puppeteer:webDriverBiDi:SEND \u25BA",
  bidiReceive: "puppeteer:webDriverBiDi:RECV \u25C0",
  error: "puppeteer:error",
  ffmpeg: "puppeteer:ffmpeg"
};
var debug = (prefix) => {
  if (isNode) {
    const nodeDebug = environment.value.debuglog?.(prefix);
    if (!nodeDebug || !nodeDebug.enabled) {
      return;
    }
    return (...logArgs) => {
      nodeDebug(...logArgs);
    };
  }
  const debugLevel = globalThis.__PUPPETEER_DEBUG;
  if (!debugLevel) {
    return;
  }
  const everythingShouldBeLogged = debugLevel === "*";
  const prefixMatchesDebugLevel = everythingShouldBeLogged || /**
   * If the debug level is `foo*`, that means we match any prefix that
   * starts with `foo`. If the level is `foo`, we match only the prefix
   * `foo`.
   */
  (debugLevel.endsWith("*") ? prefix.startsWith(debugLevel.slice(0, -1)) : prefix === debugLevel);
  if (!prefixMatchesDebugLevel) {
    return;
  }
  return (...logArgs) => {
    console.log(`${prefix}:`, ...logArgs);
  };
};

export {
  isNode,
  environment,
  DEBUG_PREFIXES,
  debug
};
/*! Bundled license information:

puppeteer-core/lib/puppeteer/environment.js:
puppeteer-core/lib/puppeteer/common/Debug.js:
  (**
   * @license
   * Copyright 2020 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
