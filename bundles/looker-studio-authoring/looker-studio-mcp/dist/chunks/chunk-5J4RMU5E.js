import { createRequire as __lsCreateRequire } from 'node:module'; const require = __lsCreateRequire(import.meta.url);
import {
  ChromeReleaseChannel
} from "./chunk-Y34SSGZY.js";

// node_modules/puppeteer-core/lib/puppeteer/node/LaunchOptions.js
function convertPuppeteerChannelToBrowsersChannel(channel) {
  switch (channel) {
    case "chrome":
      return ChromeReleaseChannel.STABLE;
    case "chrome-dev":
      return ChromeReleaseChannel.DEV;
    case "chrome-beta":
      return ChromeReleaseChannel.BETA;
    case "chrome-canary":
      return ChromeReleaseChannel.CANARY;
  }
}

export {
  convertPuppeteerChannelToBrowsersChannel
};
/*! Bundled license information:

puppeteer-core/lib/puppeteer/node/LaunchOptions.js:
  (**
   * @license
   * Copyright 2020 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
