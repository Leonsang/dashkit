import { createRequire as __lsCreateRequire } from 'node:module'; const require = __lsCreateRequire(import.meta.url);
import {
  convertPuppeteerChannelToBrowsersChannel
} from "./chunk-5J4RMU5E.js";
import {
  Browser,
  CDP_WEBSOCKET_ENDPOINT_REGEX,
  TimeoutError as TimeoutError2,
  WEBDRIVER_BIDI_WEBSOCKET_ENDPOINT_REGEX,
  computeExecutablePath,
  computeSystemExecutablePath,
  createProfile,
  detectBrowserPlatform,
  getInstalledBrowsers,
  launch,
  resolveBuildId,
  uninstall
} from "./chunk-Y34SSGZY.js";
import {
  navDispatchScript,
  navPagesScript
} from "./chunk-KBCVDAPW.js";
import {
  CDPSessionEvent,
  CdpBrowser,
  Connection,
  DEFAULT_VIEWPORT,
  DisposableStack,
  EventEmitter,
  PUPPETEER_REVISIONS,
  Puppeteer,
  TimeoutError,
  assert,
  assertSupportedUrlRestrictions,
  asyncDisposeSymbol,
  bufferCount,
  concatMap,
  createIncrementalIdGenerator,
  filter,
  firstValueFrom,
  from,
  fromEmitterEvent,
  fromEvent,
  guarded,
  lastValueFrom,
  map,
  mergeMap,
  race,
  takeUntil,
  tap,
  timer
} from "./chunk-FAVAKK4W.js";
import {
  NodeWebSocketTransport
} from "./chunk-BGDW2RS3.js";
import {
  DEBUG_PREFIXES,
  debug,
  environment
} from "./chunk-PP647YHP.js";

// node_modules/puppeteer-core/lib/puppeteer/node-env-setup.js
import fs from "node:fs";
import path from "node:path";
import { debuglog } from "node:util";
var READ_NOFOLLOW_FLAGS = fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW;
var WRITE_NOFOLLOW_FLAGS = fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC | fs.constants.O_NOFOLLOW;
var WRITE_NOFOLLOW_NOOVERWRITE_FLAGS = fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW;
var WRITE_NOOVERWRITE_FLAGS = fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL;
var WRITE_NOFOLLOW_MODE = 384;
async function readFile(path4, encoding) {
  if (!environment.value.followSymlinks && fs.constants.O_NOFOLLOW !== void 0) {
    return await fs.promises.readFile(path4, {
      encoding,
      flag: READ_NOFOLLOW_FLAGS
    });
  }
  return await fs.promises.readFile(path4, { encoding });
}
environment.value = {
  path,
  debuglog: environment.value.debuglog ?? debuglog,
  ScreenRecorder: environment.value.ScreenRecorder,
  followSymlinks: true,
  readFile,
  writeFile: async (filePath, data) => {
    if (!environment.value.followSymlinks && fs.constants.O_NOFOLLOW !== void 0) {
      await fs.promises.writeFile(filePath, data, {
        flag: WRITE_NOFOLLOW_FLAGS,
        mode: WRITE_NOFOLLOW_MODE
      });
    } else {
      await fs.promises.writeFile(filePath, data);
    }
  },
  openFileForWriting: async (filePath) => {
    if (!environment.value.followSymlinks && fs.constants.O_NOFOLLOW !== void 0) {
      return await fs.promises.open(filePath, WRITE_NOFOLLOW_FLAGS, WRITE_NOFOLLOW_MODE);
    }
    return await fs.promises.open(filePath, "w+");
  },
  createWriteStream: (filePath, options) => {
    const encoding = options?.encoding;
    const overwrite = options?.overwrite ?? true;
    if (!environment.value.followSymlinks && fs.constants.O_NOFOLLOW !== void 0) {
      const flags = overwrite ? WRITE_NOFOLLOW_FLAGS : WRITE_NOFOLLOW_NOOVERWRITE_FLAGS;
      const fd = fs.openSync(filePath, flags, WRITE_NOFOLLOW_MODE);
      return fs.createWriteStream("", {
        fd,
        mode: WRITE_NOFOLLOW_MODE,
        encoding
      });
    }
    if (!overwrite) {
      const fd = fs.openSync(filePath, WRITE_NOOVERWRITE_FLAGS);
      return fs.createWriteStream("", {
        fd,
        encoding
      });
    }
    return fs.createWriteStream(filePath, encoding ? { encoding } : void 0);
  },
  mkdir: async (dirPath, options) => {
    await fs.promises.mkdir(dirPath, options);
  }
};

// node_modules/puppeteer-core/lib/puppeteer/node/ChromeLauncher.js
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path2 from "node:path";

// node_modules/puppeteer-core/lib/puppeteer/node/BrowserLauncher.js
import { accessSync, constants, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// node_modules/puppeteer-core/lib/puppeteer/node/PipeTransport.js
var PipeTransport = class {
  #pipeWrite;
  #subscriptions = new DisposableStack();
  #logger;
  #isClosed = false;
  #pendingMessage = [];
  onclose;
  onmessage;
  constructor(pipeWrite, pipeRead, logger) {
    this.#pipeWrite = pipeWrite;
    this.#logger = logger;
    const pipeReadEmitter = this.#subscriptions.use(
      // NodeJS event emitters don't support `*` so we need to typecast
      // As long as we don't use it we should be OK.
      new EventEmitter(pipeRead, logger)
    );
    pipeReadEmitter.on("data", (buffer) => {
      return this.#dispatch(buffer);
    });
    pipeReadEmitter.on("close", () => {
      if (this.onclose) {
        this.onclose.call(null);
      }
    });
    pipeReadEmitter.on("error", (err) => {
      this.#logger?.(DEBUG_PREFIXES.error)?.(err);
    });
    const pipeWriteEmitter = this.#subscriptions.use(
      // NodeJS event emitters don't support `*` so we need to typecast
      // As long as we don't use it we should be OK.
      new EventEmitter(pipeWrite)
    );
    pipeWriteEmitter.on("error", (err) => {
      this.#logger?.(DEBUG_PREFIXES.error)?.(err);
    });
  }
  send(message) {
    assert(!this.#isClosed, "`PipeTransport` is closed.");
    this.#pipeWrite.write(message);
    this.#pipeWrite.write("\0");
  }
  #dispatch(buffer) {
    assert(!this.#isClosed, "`PipeTransport` is closed.");
    this.#pendingMessage.push(buffer);
    if (buffer.indexOf("\0") === -1) {
      return;
    }
    const concatBuffer = Buffer.concat(this.#pendingMessage);
    let start = 0;
    let end = concatBuffer.indexOf("\0");
    while (end !== -1) {
      const message = concatBuffer.toString(void 0, start, end);
      setImmediate(() => {
        if (this.onmessage) {
          this.onmessage.call(null, message);
        }
      });
      start = end + 1;
      end = concatBuffer.indexOf("\0", start);
    }
    if (start >= concatBuffer.length) {
      this.#pendingMessage = [];
    } else {
      this.#pendingMessage = [concatBuffer.subarray(start)];
    }
  }
  close() {
    this.#isClosed = true;
    this.#subscriptions.dispose();
  }
};

// node_modules/puppeteer-core/lib/puppeteer/node/BrowserLauncher.js
function isWritableDirectory(directory) {
  try {
    accessSync(directory, constants.W_OK);
    return true;
  } catch {
    return !existsSync(directory);
  }
}
function getBrowserTypeDisplayName(browserType) {
  switch (browserType) {
    case Browser.FIREFOX:
    case Browser.CHROME:
      return browserType.charAt(0).toUpperCase() + browserType.slice(1);
    default:
      return browserType;
  }
}
var BrowserLauncher = class {
  #browser;
  #logger;
  /**
   * @internal
   */
  /**
   * @internal
   */
  puppeteer;
  /**
   * @internal
   */
  constructor(puppeteer2, browser, logger) {
    this.puppeteer = puppeteer2;
    this.#browser = browser;
    this.#logger = logger;
  }
  /**
   * @internal
   */
  get logger() {
    return this.#logger;
  }
  get browser() {
    return this.#browser;
  }
  async launch(options = {}) {
    options.logger ??= this.#logger;
    const { dumpio = false, enableExtensions = false, extensionsEnabledInIncognito = [], env = process.env, handleSIGINT = true, handleSIGTERM = true, handleSIGHUP = true, acceptInsecureCerts = false, networkEnabled = true, issuesEnabled = true, defaultViewport = DEFAULT_VIEWPORT, downloadBehavior, slowMo = 0, timeout = 3e4, waitForInitialPage = true, protocolTimeout, handleDevToolsAsPage, idGenerator = createIncrementalIdGenerator(), blocklist, allowlist } = options;
    let { protocol } = options;
    if (this.#browser === "firefox" && protocol === void 0) {
      protocol = "webDriverBiDi";
    }
    assertSupportedUrlRestrictions({
      allowlist,
      blocklist,
      protocol
    });
    if (this.#browser === "firefox" && protocol === "cdp") {
      throw new Error("Connecting to Firefox using CDP is no longer supported");
    }
    const launchArgs = await this.computeLaunchArguments({
      ...options,
      protocol
    });
    if (!existsSync(launchArgs.executablePath)) {
      if (launchArgs.isTempUserDataDir) {
        await this.cleanUserDataDir(launchArgs.userDataDir, {
          isTemp: true
        });
      }
      throw new Error(`Browser was not found at the configured executablePath (${launchArgs.executablePath})`);
    }
    const usePipe = launchArgs.args.includes("--remote-debugging-pipe");
    const onProcessExit = async () => {
      try {
        await this.cleanUserDataDir(launchArgs.userDataDir, {
          isTemp: launchArgs.isTempUserDataDir
        });
      } finally {
        removeTempUserDataDirOnExit?.();
      }
    };
    if (this.#browser === "firefox" && protocol === "webDriverBiDi" && usePipe) {
      await this.cleanUserDataDir(launchArgs.userDataDir, {
        isTemp: launchArgs.isTempUserDataDir
      });
      throw new Error("Pipe connections are not supported with Firefox and WebDriver BiDi");
    }
    let removeTempUserDataDirOnExit;
    let browserProcess;
    try {
      browserProcess = launch({
        executablePath: launchArgs.executablePath,
        args: launchArgs.args,
        handleSIGHUP,
        handleSIGTERM,
        handleSIGINT,
        dumpio,
        env,
        pipe: usePipe,
        onExit: onProcessExit,
        signal: options.signal,
        logger: options.logger
      });
      removeTempUserDataDirOnExit = launchArgs.isTempUserDataDir ? registerProcessExitCleanup(launchArgs.userDataDir, this.#logger) : void 0;
    } catch (error) {
      removeTempUserDataDirOnExit?.();
      await this.cleanUserDataDir(launchArgs.userDataDir, {
        isTemp: launchArgs.isTempUserDataDir
      });
      throw error;
    }
    let browser;
    let cdpConnection;
    let closing = false;
    const browserCloseCallback = async () => {
      if (closing) {
        return;
      }
      closing = true;
      await this.closeBrowser(browserProcess, cdpConnection);
    };
    try {
      if (this.#browser === "firefox") {
        browser = await this.createBiDiBrowser(browserProcess, browserCloseCallback, {
          timeout,
          protocolTimeout,
          slowMo,
          defaultViewport,
          acceptInsecureCerts,
          networkEnabled,
          idGenerator,
          logger: options.logger,
          wsOptions: options.wsOptions
        });
      } else {
        if (usePipe) {
          cdpConnection = await this.createCdpPipeConnection(browserProcess, {
            timeout,
            protocolTimeout,
            slowMo,
            idGenerator,
            logger: options.logger
          });
        } else {
          cdpConnection = await this.createCdpSocketConnection(browserProcess, {
            timeout,
            protocolTimeout,
            slowMo,
            idGenerator,
            logger: options.logger,
            wsOptions: options.wsOptions
          });
        }
        if (protocol === "webDriverBiDi") {
          browser = await this.createBiDiOverCdpBrowser(browserProcess, cdpConnection, browserCloseCallback, {
            defaultViewport,
            acceptInsecureCerts,
            networkEnabled,
            issuesEnabled,
            logger: options.logger
          });
        } else {
          browser = await CdpBrowser._create(cdpConnection, [], acceptInsecureCerts, defaultViewport, downloadBehavior, browserProcess.nodeProcess, browserCloseCallback, options.targetFilter, void 0, void 0, networkEnabled, issuesEnabled, handleDevToolsAsPage, blocklist, allowlist, options.logger);
        }
      }
    } catch (error) {
      void browserCloseCallback();
      const logs = browserProcess.getRecentLogs().join("\n");
      if (logs.includes("Failed to create a ProcessSingleton for your profile directory") || // On Windows we will not get logs due to the singleton process handover. See
      // https://source.chromium.org/chromium/chromium/src/+/main:chrome/browser/process_singleton_win.cc;l=46;drc=fc7952f0422b5073515a205a04ec9c3a1ae81658
      process.platform === "win32" && existsSync(join(launchArgs.userDataDir, "lockfile"))) {
        if (!isWritableDirectory(launchArgs.userDataDir)) {
          throw new Error(`The browser cannot write to ${launchArgs.userDataDir}. Make the \`userDataDir\` writable or use a different one.`);
        }
        throw new Error(`The browser is already running for ${launchArgs.userDataDir}. Use a different \`userDataDir\` or stop the running browser first.`);
      }
      if (logs.includes("Missing X server") && options.headless === false) {
        throw new Error(`Missing X server to start the headful browser. Either set headless to true or use xvfb-run to run your Puppeteer script.`);
      }
      if (error instanceof TimeoutError2) {
        throw new TimeoutError(error.message);
      }
      throw error;
    }
    if (Array.isArray(enableExtensions)) {
      await Promise.all([
        enableExtensions.map((path4) => {
          return browser.installExtension(path4, {
            enabledInIncognito: extensionsEnabledInIncognito.includes(path4)
          });
        })
      ]);
    }
    if (waitForInitialPage) {
      await this.waitForPageTarget(browser, timeout);
    }
    return browser;
  }
  /**
   * @internal
   */
  async closeBrowser(browserProcess, cdpConnection) {
    if (cdpConnection) {
      try {
        await cdpConnection.closeBrowser();
        await browserProcess.hasClosed();
      } catch (error) {
        this.#logger?.(DEBUG_PREFIXES.error)?.(error);
        await browserProcess.close();
      }
    } else {
      await firstValueFrom(race(from(browserProcess.hasClosed()), timer(5e3).pipe(mergeMap(() => {
        return from(browserProcess.close());
      }))));
    }
  }
  /**
   * @internal
   */
  async waitForPageTarget(browser, timeout) {
    try {
      await browser.waitForTarget((t) => {
        return t.type() === "page";
      }, { timeout });
    } catch (error) {
      await browser.close();
      throw error;
    }
  }
  /**
   * @internal
   */
  async createCdpSocketConnection(browserProcess, opts) {
    const browserWSEndpoint = await browserProcess.waitForLineOutput(CDP_WEBSOCKET_ENDPOINT_REGEX, opts.timeout);
    const transport = await NodeWebSocketTransport.create(browserWSEndpoint, void 0, opts.logger, opts.wsOptions);
    return new Connection(
      browserWSEndpoint,
      transport,
      opts.slowMo,
      opts.protocolTimeout,
      /* rawErrors */
      false,
      opts.idGenerator,
      opts.logger
    );
  }
  /**
   * @internal
   */
  async createCdpPipeConnection(browserProcess, opts) {
    const { 3: pipeWrite, 4: pipeRead } = browserProcess.nodeProcess.stdio;
    const transport = new PipeTransport(pipeWrite, pipeRead, opts.logger);
    return new Connection(
      "",
      transport,
      opts.slowMo,
      opts.protocolTimeout,
      /* rawErrors */
      false,
      opts.idGenerator,
      opts.logger
    );
  }
  /**
   * @internal
   */
  async createBiDiOverCdpBrowser(browserProcess, cdpConnection, closeCallback, opts) {
    const bidiOnly = process.env["PUPPETEER_WEBDRIVER_BIDI_ONLY"] === "true";
    const BiDi = await import(
      /* webpackIgnore: true */
      "./bidi-UX5H76GC.js"
    );
    const bidiConnection = await BiDi.connectBidiOverCdp(cdpConnection, opts.logger);
    return await BiDi.BidiBrowser.create({
      connection: bidiConnection,
      // Do not provide CDP connection to Browser, if BiDi-only mode is enabled. This
      // would restrict Browser to use only BiDi endpoint.
      cdpConnection: bidiOnly ? void 0 : cdpConnection,
      closeCallback,
      process: browserProcess.nodeProcess,
      defaultViewport: opts.defaultViewport,
      acceptInsecureCerts: opts.acceptInsecureCerts,
      networkEnabled: opts.networkEnabled,
      issuesEnabled: opts.issuesEnabled,
      logger: opts.logger
    });
  }
  /**
   * @internal
   */
  async createBiDiBrowser(browserProcess, closeCallback, opts) {
    const browserWSEndpoint = await browserProcess.waitForLineOutput(WEBDRIVER_BIDI_WEBSOCKET_ENDPOINT_REGEX, opts.timeout) + "/session";
    const transport = await NodeWebSocketTransport.create(browserWSEndpoint, void 0, opts.logger, opts.wsOptions);
    const BiDi = await import(
      /* webpackIgnore: true */
      "./bidi-UX5H76GC.js"
    );
    const bidiConnection = new BiDi.BidiConnection(browserWSEndpoint, transport, opts.idGenerator, opts.slowMo, opts.protocolTimeout, opts.logger);
    return await BiDi.BidiBrowser.create({
      connection: bidiConnection,
      closeCallback,
      process: browserProcess.nodeProcess,
      defaultViewport: opts.defaultViewport,
      acceptInsecureCerts: opts.acceptInsecureCerts,
      networkEnabled: opts.networkEnabled ?? true,
      issuesEnabled: opts.issuesEnabled ?? true,
      logger: opts.logger
    });
  }
  /**
   * @internal
   */
  async getProfilePath() {
    const config = await this.puppeteer.configuration();
    return join(config.temporaryDirectory ?? tmpdir(), `puppeteer_dev_${this.browser}_profile-`);
  }
  /**
   * @internal
   */
  async resolveExecutablePath(headless, validatePath = true) {
    const config = await this.puppeteer.configuration();
    let executablePath2 = config.executablePath;
    if (executablePath2) {
      if (validatePath && !existsSync(executablePath2)) {
        throw new Error(`Tried to find the browser at the configured path (${executablePath2}), but no executable was found.`);
      }
      return executablePath2;
    }
    function puppeteerBrowserToInstalledBrowser(browser, headless2) {
      switch (browser) {
        case "chrome":
          if (headless2 === "shell") {
            return Browser.CHROMEHEADLESSSHELL;
          }
          return Browser.CHROME;
        case "firefox":
          return Browser.FIREFOX;
      }
      return Browser.CHROME;
    }
    const browserType = puppeteerBrowserToInstalledBrowser(this.browser, headless);
    const defaultDownloadPath = await this.puppeteer.defaultDownloadPath();
    const browserVersion = await this.puppeteer.browserVersion();
    executablePath2 = computeExecutablePath({
      cacheDir: defaultDownloadPath,
      browser: browserType,
      buildId: browserVersion
    });
    if (validatePath && !existsSync(executablePath2)) {
      const configVersion = config?.[this.browser]?.version;
      if (configVersion) {
        throw new Error(`Tried to find the browser at the configured path (${executablePath2}) for version ${configVersion}, but no executable was found.`);
      }
      throw new Error(`Could not find ${getBrowserTypeDisplayName(browserType)} (ver. ${browserVersion}). This can occur if either
 1. you did not perform an installation before running the script (e.g. \`npx puppeteer browsers install ${browserType}\`) or
 2. your cache path is incorrectly configured (which is: ${config.cacheDirectory}).
For (2), check out our guide on configuring puppeteer at https://pptr.dev/guides/configuration.`);
    }
    return executablePath2;
  }
};
var processExitCleanupEntries = /* @__PURE__ */ new WeakMap();
function registerProcessExitCleanup(userDataDir, logger, processEmitter = process) {
  let cleanup = processExitCleanupEntries.get(processEmitter);
  if (!cleanup) {
    const entries = /* @__PURE__ */ new Set();
    const onExit = () => {
      for (const entry2 of entries) {
        try {
          rmSync(entry2.userDataDir, {
            recursive: true,
            force: true,
            maxRetries: 3,
            retryDelay: 100
          });
        } catch (error) {
          entry2.logger(DEBUG_PREFIXES.error)?.(error);
        }
      }
    };
    cleanup = { entries, onExit };
    processExitCleanupEntries.set(processEmitter, cleanup);
    processEmitter.once("exit", onExit);
  }
  const entry = { userDataDir, logger };
  cleanup.entries.add(entry);
  return () => {
    if (!cleanup?.entries.delete(entry) || cleanup.entries.size > 0) {
      return;
    }
    processEmitter.off("exit", cleanup.onExit);
    processExitCleanupEntries.delete(processEmitter);
  };
}

// node_modules/puppeteer-core/lib/puppeteer/node/util/fs.js
import fs2 from "node:fs";
var rmOptions = {
  force: true,
  recursive: true,
  maxRetries: 10,
  retryDelay: 100
};
async function rm(path4) {
  await fs2.promises.rm(path4, rmOptions);
}

// node_modules/puppeteer-core/lib/puppeteer/node/ChromeLauncher.js
var ChromeLauncher = class extends BrowserLauncher {
  constructor(puppeteer2, logger) {
    super(puppeteer2, "chrome", logger);
  }
  async launch(options = {}) {
    const config = await this.puppeteer.configuration();
    if (config.logLevel === "warn" && process.platform === "darwin" && process.arch === "x64") {
      const cpus = os.cpus();
      if (cpus[0]?.model.includes("Apple")) {
        console.warn([
          "\x1B[1m\x1B[43m\x1B[30m",
          "Degraded performance warning:\x1B[0m\x1B[33m",
          "Launching Chrome on Mac Silicon (arm64) from an x64 Node installation results in",
          "Rosetta translating the Chrome binary, even if Chrome is already arm64. This would",
          "result in huge performance issues. To resolve this, you must run Puppeteer with",
          "a version of Node built for arm64."
        ].join("\n  "));
      }
    }
    return await super.launch(options);
  }
  /**
   * @internal
   */
  async computeLaunchArguments(options = {}) {
    const { ignoreDefaultArgs = false, args = [], pipe = false, debuggingPort, channel, executablePath: executablePath2 } = options;
    const chromeArguments = [];
    if (!ignoreDefaultArgs) {
      chromeArguments.push(...this.defaultArgs(options));
    } else if (Array.isArray(ignoreDefaultArgs)) {
      chromeArguments.push(...this.defaultArgs(options).filter((arg) => {
        return !ignoreDefaultArgs.includes(arg);
      }));
    } else {
      chromeArguments.push(...args);
    }
    if (!chromeArguments.some((argument) => {
      return argument.startsWith("--remote-debugging-");
    })) {
      if (pipe) {
        assert(!debuggingPort, "Browser should be launched with either pipe or debugging port - not both.");
        chromeArguments.push("--remote-debugging-pipe");
      } else {
        chromeArguments.push(`--remote-debugging-port=${debuggingPort || 0}`);
      }
    }
    let isTempUserDataDir = false;
    const userDataDirIndex = chromeArguments.findIndex((arg) => {
      return arg.startsWith("--user-data-dir");
    });
    let userDataDir;
    if (userDataDirIndex < 0) {
      isTempUserDataDir = true;
      const profilePath = await this.getProfilePath();
      userDataDir = await mkdtemp(profilePath);
      chromeArguments.push(`--user-data-dir=${userDataDir}`);
    } else {
      const parsedUserDataDir = chromeArguments[userDataDirIndex].split("=", 2)[1];
      assert(typeof parsedUserDataDir === "string", "`--user-data-dir` is malformed");
      userDataDir = parsedUserDataDir;
    }
    let chromeExecutable = executablePath2;
    if (!chromeExecutable) {
      assert(channel || !this.puppeteer._isPuppeteerCore, `An \`executablePath\` or \`channel\` must be specified for \`puppeteer-core\``);
      chromeExecutable = channel ? await this.executablePath(channel) : await this.resolveExecutablePath(options.headless ?? true);
    }
    return {
      executablePath: chromeExecutable,
      args: chromeArguments,
      isTempUserDataDir,
      userDataDir
    };
  }
  /**
   * @internal
   */
  async cleanUserDataDir(path4, opts) {
    if (opts.isTemp) {
      try {
        await rm(path4);
      } catch (error) {
        this.logger(DEBUG_PREFIXES.error)?.(error);
      }
    }
  }
  defaultArgs(options = {}) {
    const userDisabledFeatures = getFeatures("--disable-features", options.args);
    if (options.args && userDisabledFeatures.length > 0) {
      removeMatchingFlags(options.args, "--disable-features");
    }
    const turnOnExperimentalFeaturesForTesting = process.env["PUPPETEER_TEST_EXPERIMENTAL_CHROME_FEATURES"] === "true";
    const userEnabledFeatures = getFeatures("--enable-features", options.args);
    if (options.args && userEnabledFeatures.length > 0) {
      removeMatchingFlags(options.args, "--enable-features");
    }
    const enabledFeatures = [
      "PdfOopif",
      // Add features to enable by default here.
      ...userEnabledFeatures
    ].filter((feature) => {
      return feature !== "";
    });
    const disabledFeatures = [
      "Translate",
      // AcceptCHFrame disabled because of crbug.com/1348106.
      "AcceptCHFrame",
      "MediaRouter",
      "OptimizationHints",
      "WebUIReloadButton",
      "WebUIOmniboxPopup",
      "WebUIOmniboxAimPopup",
      ...turnOnExperimentalFeaturesForTesting ? [] : [
        // https://crbug.com/1492053
        "ProcessPerSiteUpToMainFrameThreshold",
        // https://github.com/puppeteer/puppeteer/issues/10715
        "IsolateSandboxedIframes"
      ],
      ...userDisabledFeatures
    ].filter((feature) => {
      return feature !== "";
    }).filter((disabledFeature) => {
      return !enabledFeatures.includes(disabledFeature);
    });
    const chromeArguments = [
      "--allow-pre-commit-input",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-breakpad",
      "--disable-client-side-phishing-detection",
      "--disable-component-extensions-with-background-pages",
      "--disable-crash-reporter",
      // No crash reporting in CfT.
      "--disable-default-apps",
      "--disable-dev-shm-usage",
      "--disable-hang-monitor",
      "--disable-infobars",
      "--disable-ipc-flooding-protection",
      "--disable-popup-blocking",
      "--disable-prompt-on-repost",
      "--disable-renderer-backgrounding",
      "--disable-search-engine-choice-screen",
      "--disable-sync",
      "--enable-automation",
      "--export-tagged-pdf",
      "--force-color-profile=srgb",
      "--generate-pdf-document-outline",
      "--metrics-recording-only",
      "--no-first-run",
      "--password-store=basic",
      "--use-mock-keychain",
      `--disable-features=${disabledFeatures.join(",")}`,
      `--enable-features=${enabledFeatures.join(",")}`
    ].filter((arg) => {
      return arg !== "";
    });
    const { devtools = false, headless = !devtools, args = [], userDataDir, enableExtensions = false } = options;
    if (process.env["PUPPETEER_DANGEROUS_NO_SANDBOX"] === "true" && !args.includes("--no-sandbox")) {
      chromeArguments.push("--no-sandbox");
    }
    if (userDataDir) {
      chromeArguments.push(`--user-data-dir=${path2.posix.isAbsolute(userDataDir) || path2.win32.isAbsolute(userDataDir) ? userDataDir : path2.resolve(userDataDir)}`);
    }
    if (devtools) {
      chromeArguments.push("--auto-open-devtools-for-tabs");
    }
    if (headless) {
      chromeArguments.push(headless === "shell" ? "--headless" : "--headless=new", "--hide-scrollbars", "--mute-audio");
    }
    if (!enableExtensions) {
      chromeArguments.push("--disable-extensions");
    }
    if (args.every((arg) => {
      return arg.startsWith("-");
    })) {
      chromeArguments.push("about:blank");
    }
    chromeArguments.push(...args);
    return chromeArguments;
  }
  async executablePath(channel, validatePath = true) {
    if (channel) {
      return computeSystemExecutablePath({
        browser: Browser.CHROME,
        channel: convertPuppeteerChannelToBrowsersChannel(channel)
      }, validatePath);
    } else {
      return await this.resolveExecutablePath(void 0, validatePath);
    }
  }
};
function getFeatures(flag, options = []) {
  const prefix = flag.endsWith("=") ? flag : `${flag}=`;
  return options.filter((s) => {
    return s.startsWith(prefix);
  }).flatMap((s) => {
    return s.substring(s.indexOf("=") + 1).trim().split(",").map((feature) => {
      return feature.trim();
    });
  }).filter((s) => {
    return s;
  });
}
function removeMatchingFlags(array, flag) {
  const prefix = flag.endsWith("=") ? flag : `${flag}=`;
  let i = 0;
  while (i < array.length) {
    if (array[i].startsWith(prefix)) {
      array.splice(i, 1);
    } else {
      i++;
    }
  }
  return array;
}

// node_modules/puppeteer-core/lib/puppeteer/node/FirefoxLauncher.js
import fs3 from "node:fs";
import { rename, unlink, mkdtemp as mkdtemp2 } from "node:fs/promises";
import os2 from "node:os";
import path3 from "node:path";
var FirefoxLauncher = class _FirefoxLauncher extends BrowserLauncher {
  constructor(puppeteer2, logger) {
    super(puppeteer2, "firefox", logger);
  }
  static getPreferences(extraPrefsFirefox) {
    return {
      ...extraPrefsFirefox,
      // Force all web content to use a single content process. TODO: remove
      // this once Firefox supports mouse event dispatch from the main frame
      // context. See https://bugzilla.mozilla.org/show_bug.cgi?id=1773393.
      "fission.webContentIsolationStrategy": 0
    };
  }
  /**
   * @internal
   */
  async computeLaunchArguments(options = {}) {
    const { ignoreDefaultArgs = false, args = [], executablePath: executablePath2, pipe = false, extraPrefsFirefox = {}, debuggingPort = null } = options;
    const firefoxArguments = [];
    if (!ignoreDefaultArgs) {
      firefoxArguments.push(...this.defaultArgs(options));
    } else if (Array.isArray(ignoreDefaultArgs)) {
      firefoxArguments.push(...this.defaultArgs(options).filter((arg) => {
        return !ignoreDefaultArgs.includes(arg);
      }));
    } else {
      firefoxArguments.push(...args);
    }
    if (!firefoxArguments.some((argument) => {
      return argument.startsWith("--remote-debugging-");
    })) {
      if (pipe) {
        assert(debuggingPort === null, "Browser should be launched with either pipe or debugging port - not both.");
      }
      firefoxArguments.push(`--remote-debugging-port=${debuggingPort || 0}`);
    }
    let userDataDir;
    let isTempUserDataDir = true;
    const profileArgIndex = firefoxArguments.findIndex((arg) => {
      return ["-profile", "--profile"].includes(arg);
    });
    if (profileArgIndex !== -1) {
      userDataDir = firefoxArguments[profileArgIndex + 1];
      if (!userDataDir) {
        throw new Error(`Missing value for profile command line argument`);
      }
      isTempUserDataDir = false;
    } else {
      const profilePath = await this.getProfilePath();
      userDataDir = await mkdtemp2(profilePath);
      firefoxArguments.push("--profile");
      firefoxArguments.push(userDataDir);
    }
    await createProfile(Browser.FIREFOX, {
      path: userDataDir,
      preferences: _FirefoxLauncher.getPreferences(extraPrefsFirefox)
    });
    let firefoxExecutable;
    if (this.puppeteer._isPuppeteerCore || executablePath2) {
      assert(executablePath2, `An \`executablePath\` must be specified for \`puppeteer-core\``);
      firefoxExecutable = executablePath2;
    } else {
      firefoxExecutable = await this.executablePath(void 0);
    }
    return {
      isTempUserDataDir,
      userDataDir,
      args: firefoxArguments,
      executablePath: firefoxExecutable
    };
  }
  /**
   * @internal
   */
  async cleanUserDataDir(userDataDir, opts) {
    if (opts.isTemp) {
      try {
        await rm(userDataDir);
      } catch (error) {
        this.logger(DEBUG_PREFIXES.error)?.(error);
      }
    } else {
      try {
        const backupSuffix = ".puppeteer";
        const backupFiles = ["prefs.js", "user.js"];
        const results = await Promise.allSettled(backupFiles.map(async (file) => {
          const prefsBackupPath = path3.join(userDataDir, file + backupSuffix);
          if (fs3.existsSync(prefsBackupPath)) {
            const prefsPath = path3.join(userDataDir, file);
            await unlink(prefsPath);
            await rename(prefsBackupPath, prefsPath);
          }
        }));
        for (const result of results) {
          if (result.status === "rejected") {
            throw result.reason;
          }
        }
      } catch (error) {
        this.logger(DEBUG_PREFIXES.error)?.(error);
      }
    }
  }
  async executablePath(_, validatePath = true) {
    return await this.resolveExecutablePath(
      void 0,
      /* validatePath=*/
      validatePath
    );
  }
  defaultArgs(options = {}) {
    const { devtools = false, headless = !devtools, args = [], userDataDir = null } = options;
    const firefoxArguments = [];
    switch (os2.platform()) {
      case "darwin":
        firefoxArguments.push("--foreground");
        break;
      case "win32":
        firefoxArguments.push("--wait-for-browser");
        break;
    }
    if (userDataDir) {
      firefoxArguments.push("--profile");
      firefoxArguments.push(userDataDir);
    }
    if (headless) {
      firefoxArguments.push("--headless");
    }
    if (devtools) {
      firefoxArguments.push("--devtools");
    }
    if (args.every((arg) => {
      return arg.startsWith("-");
    })) {
      firefoxArguments.push("about:blank");
    }
    firefoxArguments.push(...args);
    return firefoxArguments;
  }
};

// node_modules/puppeteer-core/lib/puppeteer/node/PuppeteerNode.js
var PuppeteerNode = class extends Puppeteer {
  #launcher;
  #lastLaunchedBrowser;
  configuration;
  /**
   * @internal
   */
  constructor(settings) {
    const { configuration, ...commonSettings } = settings;
    super(commonSettings);
    if (configuration) {
      this.configuration = configuration;
    } else {
      this.configuration = () => {
        return Promise.resolve({});
      };
    }
    this.connect = this.connect.bind(this);
    this.launch = this.launch.bind(this);
    this.executablePath = this.executablePath.bind(this);
    this.defaultArgs = this.defaultArgs.bind(this);
    this.trimCache = this.trimCache.bind(this);
  }
  /**
   * This method attaches Puppeteer to an existing browser instance.
   *
   * @param options - Set of configurable options to set on the browser.
   * @returns Promise which resolves to browser instance.
   */
  connect(options) {
    options.logger ??= debug;
    return super.connect(options);
  }
  /**
   * Launches a browser instance with given arguments and options when
   * specified.
   *
   * When using with `puppeteer-core`,
   * {@link LaunchOptions.executablePath | options.executablePath} or
   * {@link LaunchOptions.channel | options.channel} must be provided.
   *
   * @example
   * You can use {@link LaunchOptions.ignoreDefaultArgs | options.ignoreDefaultArgs}
   * to filter out `--mute-audio` from default arguments:
   *
   * ```ts
   * const browser = await puppeteer.launch({
   *   ignoreDefaultArgs: ['--mute-audio'],
   * });
   * ```
   *
   * @remarks
   * Puppeteer can also be used to control the Chrome browser, but it works best
   * with the version of Chrome for Testing downloaded by default.
   * There is no guarantee it will work with any other version. If Google Chrome
   * (rather than Chrome for Testing) is preferred, a
   * {@link https://www.google.com/chrome/browser/canary.html | Chrome Canary}
   * or
   * {@link https://www.chromium.org/getting-involved/dev-channel | Dev Channel}
   * build is suggested. See
   * {@link https://www.howtogeek.com/202825/what%E2%80%99s-the-difference-between-chromium-and-chrome/ | this article}
   * for a description of the differences between Chromium and Chrome.
   * {@link https://chromium.googlesource.com/chromium/src/+/lkgr/docs/chromium_browser_vs_google_chrome.md | This article}
   * describes some differences for Linux users. See
   * {@link https://developer.chrome.com/blog/chrome-for-testing/ | this doc} for the description
   * of Chrome for Testing.
   *
   * @param options - Options to configure launching behavior.
   */
  async launch(options = {}) {
    options.logger ??= debug;
    const { browser = await this.defaultBrowser() } = options;
    this.#lastLaunchedBrowser = browser;
    if (!["chrome", "firefox"].includes(browser)) {
      throw new Error(`Unknown product: ${browser}`);
    }
    this.#launcher = this.#getLauncher(browser, options.logger);
    return await this.#launcher.launch(options);
  }
  #getLauncher(browser, logger) {
    if (this.#launcher && this.#launcher.browser === browser) {
      return this.#launcher;
    }
    switch (browser) {
      case "chrome":
        return new ChromeLauncher(this, logger);
      case "firefox":
        return new FirefoxLauncher(this, logger);
      default:
        throw new Error(`Unknown product: ${browser}`);
    }
  }
  async executablePath(optsOrChannel) {
    if (optsOrChannel === void 0) {
      return await this.#getLauncher(await this.lastLaunchedBrowser(), debug).executablePath(
        void 0,
        /* validatePath= */
        false
      );
    }
    if (typeof optsOrChannel === "string") {
      return await this.#getLauncher("chrome", debug).executablePath(
        optsOrChannel,
        /* validatePath= */
        false
      );
    }
    return await this.#getLauncher(optsOrChannel.browser ?? await this.lastLaunchedBrowser(), optsOrChannel.logger ?? debug).resolveExecutablePath(
      optsOrChannel.headless,
      /* validatePath= */
      false
    );
  }
  /**
   * @internal
   */
  async browserVersion() {
    const config = await this.configuration();
    const lastLaunched = await this.lastLaunchedBrowser();
    return config?.[lastLaunched]?.version ?? PUPPETEER_REVISIONS[lastLaunched];
  }
  /**
   * The default download path for puppeteer. For puppeteer-core, this
   * code should never be called as it is never defined.
   *
   * @internal
   */
  async defaultDownloadPath() {
    const config = await this.configuration();
    return config.cacheDirectory;
  }
  /**
   * The name of the browser that was last launched.
   */
  async lastLaunchedBrowser() {
    return this.#lastLaunchedBrowser ?? await this.defaultBrowser();
  }
  /**
   * The name of the browser that will be launched by default. For
   * `puppeteer`, this is influenced by your configuration. Otherwise, it's
   * `chrome`.
   */
  async defaultBrowser() {
    const config = await this.configuration();
    return config.defaultBrowser ?? "chrome";
  }
  /**
   * @param options - Set of configurable options to set on the browser.
   *
   * @returns The default arguments that the browser will be launched with.
   */
  async defaultArgs(options = {}) {
    return this.#getLauncher(options.browser ?? await this.lastLaunchedBrowser(), options.logger ?? debug).defaultArgs(options);
  }
  /**
   * Removes all non-current Firefox and Chrome binaries in the cache directory
   * identified by the provided Puppeteer configuration. The current browser
   * version is determined by resolving PUPPETEER_REVISIONS from Puppeteer
   * unless `configuration.browserRevision` is provided.
   *
   * @remarks
   *
   * Note that the method does not check if any other Puppeteer versions
   * installed on the host that use the same cache directory require the
   * non-current binaries.
   *
   * @public
   */
  async trimCache() {
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error("The current platform is not supported.");
    }
    const config = await this.configuration();
    const cacheDir = config.cacheDirectory;
    const installedBrowsers = await getInstalledBrowsers({
      cacheDir
    });
    const puppeteerBrowsers = [
      {
        product: "chrome",
        browser: Browser.CHROME,
        currentBuildId: ""
      },
      {
        product: "firefox",
        browser: Browser.FIREFOX,
        currentBuildId: ""
      }
    ];
    await Promise.all(puppeteerBrowsers.map(async (item) => {
      const tag = config?.[item.product]?.version ?? PUPPETEER_REVISIONS[item.product];
      item.currentBuildId = await resolveBuildId(item.browser, platform, tag);
    }));
    const currentBrowserBuilds = new Set(puppeteerBrowsers.map((browser) => {
      return `${browser.browser}_${browser.currentBuildId}`;
    }));
    const currentBrowsers = new Set(puppeteerBrowsers.map((browser) => {
      return browser.browser;
    }));
    for (const installedBrowser of installedBrowsers) {
      if (!currentBrowsers.has(installedBrowser.browser)) {
        continue;
      }
      if (currentBrowserBuilds.has(`${installedBrowser.browser}_${installedBrowser.buildId}`)) {
        continue;
      }
      await uninstall({
        browser: installedBrowser.browser,
        platform,
        cacheDir,
        buildId: installedBrowser.buildId
      });
    }
  }
  /**
   * Defines whether Puppeteer should follow symlinks for file operations.
   *
   * @param followSymlinks - Whether Puppeteer should follow symlinks.
   *
   * @public
   */
  setFollowSymlinks(followSymlinks) {
    environment.value.followSymlinks = followSymlinks;
  }
};

// node_modules/puppeteer-core/lib/puppeteer/node/ScreenRecorder.js
import { spawn, spawnSync } from "node:child_process";
import os3 from "node:os";
import { PassThrough } from "node:stream";
var __runInitializers = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access) context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done) throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0) continue;
      if (result === null || typeof result !== "object") throw new TypeError("Object expected");
      if (_ = accept(result.get)) descriptor.get = _;
      if (_ = accept(result.set)) descriptor.set = _;
      if (_ = accept(result.init)) initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field") initializers.unshift(_);
      else descriptor[key] = _;
    }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};
var __setFunctionName = function(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var CRF_VALUE = 30;
var DEFAULT_FPS = 30;
function countFrames(startTimestamp, previousTimestamp, timestamp, fps) {
  const end = Math.round((timestamp - startTimestamp) * fps);
  const start = Math.round((previousTimestamp - startTimestamp) * fps);
  return Math.max(0, end - start);
}
var ScreenRecorder = (() => {
  let _classSuper = PassThrough;
  let _instanceExtraInitializers = [];
  let _private_writeFrame_decorators;
  let _private_writeFrame_descriptor;
  let _stop_decorators;
  return class ScreenRecorder extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      __esDecorate(this, _private_writeFrame_descriptor = { value: __setFunctionName(async function(buffer) {
        const error = await new Promise((resolve) => {
          this.#process.stdin.write(buffer, resolve);
        });
        if (error) {
          console.log(`ffmpeg failed to write: ${error.message}.`);
        }
      }, "#writeFrame") }, _private_writeFrame_decorators, { kind: "method", name: "#writeFrame", static: false, private: true, access: { has: (obj) => #writeFrame in obj, get: (obj) => obj.#writeFrame }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate(this, null, _stop_decorators, { kind: "method", name: "stop", static: false, private: false, access: { has: (obj) => "stop" in obj, get: (obj) => obj.stop }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    #page = __runInitializers(this, _instanceExtraInitializers);
    #process;
    #controller = new AbortController();
    #lastFrame;
    #fps;
    #logger;
    /**
     * @internal
     */
    constructor(page, width, height, { ffmpegPath, speed, scale, crop, format, fps, loop, delay, quality, colors } = {}, logger) {
      super({ allowHalfOpen: false });
      this.#logger = logger;
      ffmpegPath ??= "ffmpeg";
      format ??= "webm";
      fps ??= DEFAULT_FPS;
      loop ||= -1;
      delay ??= -1;
      quality ??= CRF_VALUE;
      colors ??= 256;
      this.#fps = fps;
      const { error } = spawnSync(ffmpegPath);
      if (error) {
        throw error;
      }
      const filters = [
        `crop='min(${width},iw):min(${height},ih):0:0'`,
        `pad=${width}:${height}:0:0`
      ];
      if (speed) {
        filters.push(`setpts=${1 / speed}*PTS`);
      }
      if (crop) {
        filters.push(`crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`);
      }
      if (scale) {
        filters.push(`scale=iw*${scale}:-1:flags=lanczos`);
      }
      const formatArgs = this.#getFormatArgs(format, fps, loop, delay, quality, colors);
      const vf = formatArgs.indexOf("-vf");
      if (vf !== -1) {
        filters.push(formatArgs.splice(vf, 2).at(-1) ?? "");
      }
      this.#process = spawn(
        ffmpegPath,
        // See https://trac.ffmpeg.org/wiki/Encode/VP9 for more information on flags.
        [
          ["-loglevel", "error"],
          // Reduces general buffering.
          ["-avioflags", "direct"],
          // Reduces initial buffering while analyzing input fps and other stats.
          [
            "-fpsprobesize",
            "0",
            "-probesize",
            "32",
            "-analyzeduration",
            "0",
            "-fflags",
            "nobuffer"
          ],
          // Forces input to be read from standard input, and forces png input
          // image format. `-framerate` is an input option and must appear before
          // `-i`; otherwise ffmpeg ignores it and the image2pipe demuxer falls
          // back to its default 25fps, stretching the output timeline relative to
          // the frames we feed it at `fps`.
          // prettier-ignore
          ["-framerate", `${fps}`, "-f", "image2pipe", "-vcodec", "png", "-i", "pipe:0"],
          // No audio
          ["-an"],
          // This drastically reduces stalling when cpu is overbooked. By default
          // VP9 tries to use all available threads?
          ["-threads", "1"],
          // Disable bitrate.
          ["-b:v", "0"],
          // Specifies the encoding and format we are using.
          formatArgs,
          // Filters to ensure the images are piped correctly,
          // combined with any format-specific filters.
          ["-vf", filters.join()],
          "pipe:1"
        ].flat(),
        { stdio: ["pipe", "pipe", "pipe"] }
      );
      this.#process.stdout.pipe(this);
      this.#process.stderr.on("data", (data) => {
        this.#logger?.(DEBUG_PREFIXES.ffmpeg)?.(data.toString("utf8"));
      });
      this.#page = page;
      const { client } = this.#page.mainFrame();
      client.once(CDPSessionEvent.Disconnected, () => {
        void this.stop().catch((err) => {
          this.#logger?.(DEBUG_PREFIXES.error)?.(err);
        });
      });
      let startTimestamp;
      this.#lastFrame = lastValueFrom(fromEmitterEvent(client, "Page.screencastFrame").pipe(tap((event) => {
        void client.send("Page.screencastFrameAck", {
          sessionId: event.sessionId
        });
      }), filter((event) => {
        return event.metadata.timestamp !== void 0;
      }), map((event) => {
        return {
          buffer: Buffer.from(event.data, "base64"),
          timestamp: event.metadata.timestamp
        };
      }), bufferCount(2, 1), concatMap(([{ timestamp: previousTimestamp, buffer }, { timestamp }]) => {
        startTimestamp ??= previousTimestamp;
        return from(Array(countFrames(startTimestamp, previousTimestamp, timestamp, fps)).fill(buffer));
      }), map((buffer) => {
        void this.#writeFrame(buffer);
        return [buffer, performance.now()];
      }), takeUntil(fromEvent(this.#controller.signal, "abort"))), { defaultValue: [Buffer.from([]), performance.now()] });
    }
    #getFormatArgs(format, fps, loop, delay, quality, colors) {
      const libvpx = [
        ["-vcodec", "vp9"],
        // Sets the quality. Lower the better.
        ["-crf", `${quality}`],
        // Sets the quality and how efficient the compression will be.
        [
          "-deadline",
          "realtime",
          "-cpu-used",
          `${Math.min(os3.cpus().length / 2, 8)}`
        ]
      ];
      switch (format) {
        case "webm":
          return [
            ...libvpx,
            // Sets the format
            ["-f", "webm"]
          ].flat();
        case "gif":
          fps = DEFAULT_FPS === fps ? 20 : "source_fps";
          if (loop === Infinity) {
            loop = 0;
          }
          if (delay !== -1) {
            delay /= 10;
          }
          return [
            // Sets the frame rate and uses a custom palette generated from the
            // input.
            [
              "-vf",
              `fps=${fps},split[s0][s1];[s0]palettegen=stats_mode=diff:max_colors=${colors}[p];[s1][p]paletteuse=dither=bayer`
            ],
            // Sets the number of times to loop playback.
            ["-loop", `${loop}`],
            // Sets the delay between iterations of a loop.
            ["-final_delay", `${delay}`],
            // Sets the format
            ["-f", "gif"]
          ].flat();
        case "mp4":
          return [
            ...libvpx,
            // Fragment file during stream to avoid errors.
            ["-movflags", "hybrid_fragmented"],
            // Sets the format
            ["-f", "mp4"]
          ].flat();
      }
    }
    get #writeFrame() {
      return _private_writeFrame_descriptor.value;
    }
    /**
     * Stops the recorder.
     *
     * @public
     */
    async stop() {
      if (this.#controller.signal.aborted) {
        return;
      }
      await this.#page._stopScreencast().catch((err) => {
        this.#logger?.(DEBUG_PREFIXES.error)?.(err);
      });
      this.#controller.abort();
      const [buffer, timestamp] = await this.#lastFrame;
      await Promise.all(Array(Math.max(1, Math.round(this.#fps * (performance.now() - timestamp) / 1e3))).fill(buffer).map(this.#writeFrame.bind(this)));
      this.#process.stdin.end();
      await new Promise((resolve) => {
        this.#process.once("close", resolve);
      });
    }
    async [(_private_writeFrame_decorators = [guarded()], _stop_decorators = [guarded()], asyncDisposeSymbol)]() {
      await this.stop();
      await super[asyncDisposeSymbol]();
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js
environment.value.ScreenRecorder = ScreenRecorder;
var puppeteer = new PuppeteerNode({
  isPuppeteerCore: true
});
var {
  /**
   * @public
   */
  connect,
  /**
   * @public
   */
  defaultArgs,
  /**
   * @public
   */
  executablePath,
  /**
   * @public
   */
  launch: launch2
} = puppeteer;
var puppeteer_core_default = puppeteer;

// src/browser.ts
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir as tmpdir2 } from "node:os";

// src/log.ts
function log(...args) {
  process.stderr.write(
    `[looker-studio-mcp] ${args.map((a) => typeof a === "string" ? a : JSON.stringify(a)).join(" ")}
`
  );
}

// src/browser.ts
var REPORT_URL_RE = /(lookerstudio|datastudio)\.google\.com\/(u\/\d+\/)?reporting\//;
var DEFAULT_CDP_URL = "http://127.0.0.1:9222";
var DEFAULT_EVAL_TIMEOUT_MS = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15e3);
var browserPromise = null;
var lastPage = null;
var BrowserNotReadyError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "BrowserNotReadyError";
  }
};
var KEEP_ACTIVE = "--disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding";
var HOW_TO_LAUNCH = `Lanza Chrome o Edge con depuracion remota y un perfil separado, por ejemplo:
  msedge.exe --remote-debugging-port=9222 --user-data-dir="%TEMP%\\ls-mcp-profile" ${KEEP_ACTIVE}
  chrome.exe --remote-debugging-port=9222 --user-data-dir="%TEMP%\\ls-mcp-profile" ${KEEP_ACTIVE}
(las opciones --disable-* evitan que una ventana tapada por otra aplace los guardados del editor)
y abre el informe de Looker Studio en modo edicion (URL .../reporting/<id>/page/<id>/edit).`;
async function connect2() {
  const ws = process.env.LS_CDP_WS;
  const browserURL = process.env.LS_CDP_URL || DEFAULT_CDP_URL;
  try {
    const targetFilter = (t) => !/usercontent\.goog|recaptcha|^chrome-extension:/.test(t.url()) && t.type() !== "service_worker";
    const browser = ws ? await puppeteer_core_default.connect({ browserWSEndpoint: ws, defaultViewport: null, targetFilter, protocolTimeout: 6e4 }) : await puppeteer_core_default.connect({ browserURL, defaultViewport: null, targetFilter, protocolTimeout: 6e4 });
    browser.on("disconnected", () => {
      log("Navegador desconectado; se reconectara en la proxima llamada.");
      browserPromise = null;
      lastPage = null;
    });
    log(`Conectado via CDP a ${ws ?? browserURL}`);
    return browser;
  } catch (err) {
    throw new BrowserNotReadyError(
      `No se pudo conectar por CDP a ${ws ?? browserURL}: ${err.message}
${HOW_TO_LAUNCH}`
    );
  }
}
async function getBrowser() {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null);
    if (b && b.connected) return b;
    browserPromise = null;
  }
  browserPromise = connect2();
  try {
    return await browserPromise;
  } catch (err) {
    browserPromise = null;
    throw err;
  }
}
async function pageState(page) {
  try {
    return await withTimeout(
      page.evaluate(() => ({ visible: document.visibilityState === "visible", focused: document.hasFocus() })),
      3e3,
      "visibilityState"
    );
  } catch {
    return { visible: false, focused: false };
  }
}
function activeReportFile() {
  return `${tmpdir2()}/ls-studio-active-report.txt`;
}
function setActiveReport(urlOrId) {
  const m = /reporting\/([^/?#]+)/.exec(urlOrId);
  const id = m ? m[1] : urlOrId;
  if (!id || id === "create") return;
  try {
    writeFileSync(activeReportFile(), id);
  } catch {
  }
}
function activeIsRecent() {
  try {
    return Date.now() - statSync(activeReportFile()).mtimeMs < 6 * 36e5;
  } catch {
    return false;
  }
}
function activeReport() {
  try {
    return readFileSync(activeReportFile(), "utf8").trim() || null;
  } catch {
    return null;
  }
}
async function getReportPage() {
  const browser = await getBrowser();
  const pages = (await Promise.all(
    browser.targets().filter((t) => t.type() === "page" && REPORT_URL_RE.test(t.url())).map((t) => t.page())
  )).filter((p) => !!p);
  if (!pages.length) {
    throw new BrowserNotReadyError(
      "No hay ninguna pestana con un informe de Looker Studio abierto (lookerstudio.google.com/reporting/... o datastudio.google.com/reporting/...).\n" + HOW_TO_LAUNCH
    );
  }
  for (const p of pages) await keepActive(p);
  const active = activeReport();
  const preferred = active ? pages.find((p) => p.url().includes(`/reporting/${active}`)) : void 0;
  if (preferred) return lastPage = preferred;
  if (active && activeIsRecent()) {
    const open = pages.map((p) => (/reporting\/([^/?#]+)/.exec(p.url()) || [])[1]).filter(Boolean);
    throw new Error(
      `El informe activo (${active}) no esta abierto en ninguna pestana; hay otros: ${[...new Set(open)].join(", ")}. Abre el que quieres con open_report <url> (CLI: open <url>): las herramientas no cambian de informe solas.`
    );
  }
  if (pages.length === 1) return lastPage = pages[0];
  const states = await Promise.all(pages.map(async (p) => ({ page: p, ...await pageState(p) })));
  const pick = states.find((s) => s.visible && s.focused) ?? states.find((s) => s.visible) ?? states.find((s) => s.page === lastPage) ?? states[0];
  lastPage = pick.page;
  return pick.page;
}
var activated = /* @__PURE__ */ new WeakSet();
async function keepActive(page) {
  if (activated.has(page)) return;
  activated.add(page);
  try {
    const s = await page.createCDPSession();
    await s.send("Emulation.setFocusEmulationEnabled", { enabled: true }).catch(() => void 0);
    await s.send("Page.setWebLifecycleState", { state: "active" }).catch(() => void 0);
  } catch {
  }
}
async function disconnectIfConnected() {
  if (!browserPromise) return;
  const b = await browserPromise.catch(() => null);
  browserPromise = null;
  lastPage = null;
  if (b && b.connected) await b.disconnect();
}
function withTimeout(p, ms, label) {
  let timer2;
  const timeout = new Promise((_, reject) => {
    timer2 = setTimeout(() => reject(new Error(`Timeout (${ms} ms) ejecutando ${label} en la pagina.`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer2));
}
async function evaluate(fn, ...args) {
  const page = await getReportPage();
  return evaluateOn(page, DEFAULT_EVAL_TIMEOUT_MS, fn, ...args);
}
async function evaluateOn(page, timeoutMs, fn, ...args) {
  await page.evaluate(schemaCompatShim).catch(() => void 0);
  const run = page.evaluate(fn, ...args);
  return withTimeout(run, timeoutMs, fn.name || "script");
}
function schemaCompatShim() {
  const w = window;
  if (w.__lsSchemaShim) return;
  try {
    const r = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
    let s = null;
    let ids = [];
    try {
      ids = r.getDatasourceIds() || [];
    } catch {
    }
    for (const id of ids) {
      try {
        s = r.getDatasourceSchema(id);
      } catch {
      }
      if (s) break;
    }
    if (!s) {
      for (const c of r.pages.flatMap((p) => p.components)) {
        try {
          s = c.getSchema();
        } catch {
        }
        if (s) break;
      }
    }
    if (!s || typeof s !== "object") return;
    if (!("qe" in s)) {
      Object.defineProperty(Object.getPrototypeOf(s), "qe", {
        configurable: true,
        get() {
          return Object.values(this).find((v) => v && typeof v === "object" && !Array.isArray(v) && "concepts" in v && "maxDimensions" in v);
        }
      });
    }
    w.__lsSchemaShim = true;
  } catch {
  }
}
async function revealIfHidden(page) {
  await page.bringToFront().catch(() => void 0);
  if (!await page.evaluate(() => document.hidden).catch(() => false)) return;
  const s = await page.target().createCDPSession();
  try {
    const { windowId } = await s.send("Browser.getWindowForTarget");
    await s.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "minimized" } });
    await new Promise((r) => setTimeout(r, 600));
    await s.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "normal" } });
    await new Promise((r) => setTimeout(r, 1200));
    await page.bringToFront();
  } finally {
    await s.detach().catch(() => void 0);
  }
  if (await page.evaluate(() => document.hidden).catch(() => false)) throw new Error("La ventana del navegador sigue oculta: ponla delante y repite.");
}

// src/knowledge.ts
import { appendFileSync, existsSync as existsSync3, mkdirSync, readdirSync, readFileSync as readFileSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { homedir } from "node:os";
import { join as join3 } from "node:path";

// src/paths.ts
import { existsSync as existsSync2 } from "node:fs";
import { dirname, join as join2 } from "node:path";
import { fileURLToPath } from "node:url";
var cached = null;
function packageRoot() {
  if (cached) return cached;
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    if (existsSync2(join2(dir, "themes", "base-theme.json"))) return cached = dir;
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return cached = join2(dirname(fileURLToPath(import.meta.url)), "..");
}

// src/knowledge.ts
var PACKAGE_KNOWLEDGE = join3(packageRoot(), "knowledge");
var KNOWLEDGE_DIR = process.env.LS_KNOWLEDGE_DIR ?? (existsSync3(PACKAGE_KNOWLEDGE) ? PACKAGE_KNOWLEDGE : join3(homedir(), ".looker-studio-mcp", "knowledge"));
var LOG = join3(KNOWLEDGE_DIR, "learnings.jsonl");
var TPL = join3(KNOWLEDGE_DIR, "templates");
function ensure() {
  if (!existsSync3(TPL)) mkdirSync(TPL, { recursive: true });
}
function readLearnings() {
  if (!existsSync3(LOG)) return [];
  return readFileSync2(LOG, "utf8").split("\n").filter(Boolean).map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  }).filter((x) => !!x);
}
function learn(kind, key, data) {
  ensure();
  const sig = JSON.stringify([kind, key, data ?? null]);
  const dup = readLearnings().some((l) => JSON.stringify([l.kind, l.key, l.data ?? null]) === sig);
  if (dup) return false;
  const entry = { ts: (/* @__PURE__ */ new Date()).toISOString(), kind, key, ...data ? { data } : {} };
  appendFileSync(LOG, JSON.stringify(entry) + "\n");
  return true;
}
var safe = (t) => t.replace(/[^a-z0-9_-]/gi, "_");
function saveTemplate(type, config, origin) {
  ensure();
  const file = join3(TPL, `${safe(type)}.json`);
  if (existsSync3(file)) return false;
  writeFileSync2(file, JSON.stringify({ type, capturedAt: (/* @__PURE__ */ new Date()).toISOString(), origin, config }, null, 2));
  learn("template", type, origin);
  return true;
}
function getTemplate(type) {
  const file = join3(TPL, `${safe(type)}.json`);
  if (!existsSync3(file)) return void 0;
  return JSON.parse(readFileSync2(file, "utf8")).config;
}
function listTemplates() {
  if (!existsSync3(TPL)) return [];
  return readdirSync(TPL).filter((f) => f.endsWith(".json")).map((f) => {
    const j = JSON.parse(readFileSync2(join3(TPL, f), "utf8"));
    return { type: j.type, capturedAt: j.capturedAt, origin: j.origin };
  });
}
function summary() {
  const all = readLearnings();
  const s = {
    dir: KNOWLEDGE_DIR,
    counts: {},
    errorReasons: {},
    fixes: {},
    displayTypes: [],
    templates: listTemplates().map((t) => t.type),
    createOutcomes: {},
    missingMethods: [],
    notes: []
  };
  const types = /* @__PURE__ */ new Set();
  for (const l of all) {
    s.counts[l.kind] = (s.counts[l.kind] ?? 0) + 1;
    const d = l.data ?? {};
    switch (l.kind) {
      case "error_reason":
        s.errorReasons[l.key] = { ...s.errorReasons[l.key], title: d.title, description: d.description };
        break;
      case "fix":
        s.fixes[l.key] = d.fix;
        break;
      case "display_type":
        types.add(l.key);
        break;
      case "create_ok":
      case "create_fail":
      case "save_rejected": {
        const o = s.createOutcomes[l.key] ??= { ok: 0, fail: 0, rejected: 0 };
        if (l.kind === "create_ok") o.ok++;
        else if (l.kind === "create_fail") o.fail++;
        else o.rejected++;
        break;
      }
      case "method_missing":
        s.missingMethods.push(l.key);
        break;
      case "note":
        s.notes.push({ ts: l.ts, key: l.key, text: d.text });
        break;
      default:
        break;
    }
  }
  for (const [k, v] of Object.entries(s.fixes)) {
    if (k.startsWith("reason:") && s.errorReasons[k.slice(7)]) s.errorReasons[k.slice(7)].fix = v;
  }
  s.displayTypes = [...types].sort();
  return s;
}
function knownFix(key) {
  return summary().fixes[key];
}
function seedKnowledge() {
  const seeds = [
    ["reason:93", 'El origen no permite editar campos en informes y el grafico usa agregacion personalizada: revincula con bind_fields_to_component (sin agregacion en metricas nativas) o habilita "editar campos en informes" en el origen.'],
    ["reason:13", "Sin acceso al conjunto de datos subyacente: revisa credenciales del origen (propietario/visor) o que la hoja/tabla siga existiendo y compartida."],
    ["CUSTOM_AGGREGATION", "Agregacion distinta de la del origen: revincula el campo sin agregacion explicita si es metrica nativa."],
    ["FIELD_NOT_IN_SCHEMA", "El campo ya no existe en el origen (migracion o renombrado): usa inspect_data_sources y bind_fields_to_component con el campo nuevo."],
    ["RAW_ROWS", "Metrica sin agregar en un origen Sheets/CSV (todas las columnas son dimensiones): usa SUM(campo)/AVG(campo)/COUNT_DISTINCT(campo)."],
    ["reason:268", "Orden no valido: el orden apunta a un campo que ya no esta en el grafico; vuelve a vincular con bind_fields_to_component (reasigna el orden) o elige el orden en el panel."],
    ["SORT_INVALID", "Orden huerfano: bind_fields_to_component lo reasigna a la primera metrica (desc) o a la fecha (asc) en series temporales."],
    ["reason:116", 'Casilla o boton de filtro con campo no booleano: necesitan un campo BOOLEANO del ORIGEN. Crealo con add_source_field / `fields add` (p. ej. UPPER(devuelto) IN ("TRUE","SI")) y vincula ese campo. Un campo calculado de grafico quita el error pero no filtra.'],
    ["reason:265", 'Configuracion incompleta: al componente le falta su campo. Un boton de filtro predefinido necesita como campo de control un BOOLEANO del origen (la condicion es el propio campo, p. ej. canal = "Online"): crealo con add_source_field y vinculalo.'],
    ["FORMULA_FORMAT", 'Campo calculado de grafico: dataTransformation {sourceType:1, sourceFieldName:qt_propio, textFormula y frontendTextFormula con campos como t0.<id>, formulaOutputDataType:2, aggregation:7} + displayTransformation.outputSemanticInfo {semanticConfig:[{semanticType:33}]}. Usa bind "=SUM(a) - SUM(b) as Nombre".'],
    ["reason:267", "Metrica no valida: el componente conserva una metrica que no existe en su origen (p. ej. heredada de una plantilla); bind la elimina o vincula una metrica del origen actual."],
    ["reason:266", "Dimension no valida: el campo de la dimension no existe en el origen del grafico; vincula una dimension del origen actual."],
    ["save_rejected:scrubbed_template", "No vacies conceptDefs/dimensiones/metricas de una plantilla: cambia solo el dataset y vincula los campos antes del primer guardado."],
    ["save_rejected:type_change", "updatePage 400 al crear: no cambies display.type de un JSON clonado; captura una plantilla real del tipo con capture_templates y recarga para descartar el estado invalido."]
  ];
  for (const [k, fix] of seeds) learn("fix", k, { fix, source: "seed" });
}

// src/looker/scripts.ts
function pageInfoScript() {
  const w = window;
  let canvas = null;
  let report = null;
  try {
    report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  } catch {
  }
  let zoom = 1;
  const wrap = document.querySelector("div.lego-component-repeat");
  if (wrap) {
    const declared = parseFloat(wrap.style.width);
    const real = wrap.getBoundingClientRect().width;
    if (declared > 0 && real > 0) zoom = Math.round(real / declared * 1e3) / 1e3;
  }
  if (report && report.config && report.config.attribute) {
    const a = report.config.attribute;
    canvas = { width: Number(a.width) || 0, height: Number(a.height) || 0, zoom };
  }
  let permissions = null;
  try {
    let s;
    w.angular.element(document.body).injector().get("store").subscribe((x) => s = x).unsubscribe();
    permissions = s && s.permissions ? { isEditable: !!s.permissions.isEditable, isOwner: !!s.permissions.isOwner } : null;
  } catch {
  }
  let pages = [];
  let activePageId = null;
  if (report) {
    pages = (report.config.page || []).map((p) => ({ id: String(p.id), name: String(p.attribute && p.attribute.name || "") }));
    const ap = report.pages.find((pg) => String(pg.getId()) === ((location.pathname.match(/\/page\/([^/]+)/) || [])[1] ?? "")) || report.pages[report.selected] || report.pages[0];
    activePageId = ap ? String(ap.getId()) : null;
  }
  return {
    title: document.title,
    url: location.href,
    visibilityState: document.visibilityState,
    hasFocus: document.hasFocus(),
    canvas,
    internals: !!report,
    internalReportId: report ? String(report.config.id) : null,
    permissions,
    pages,
    activePageId
  };
}
function readLayoutScript(pageId) {
  const w = window;
  const warnings = [];
  const px = (v) => {
    if (v === void 0 || v === null || v === "") return 0;
    const n = parseFloat(String(v));
    return isNaN(n) ? 0 : n;
  };
  let report = null;
  try {
    report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  } catch {
  }
  if (report) {
    const page = pageId && report.pages.find((p) => String(p.getId()) === String(pageId)) || (report.pages.find((pg) => String(pg.getId()) === ((location.pathname.match(/\/page\/([^/]+)/) || [])[1] ?? "")) || report.pages[report.selected]) || report.pages[0];
    if (pageId && String(page.getId()) !== String(pageId)) warnings.push(`Pagina ${pageId} no encontrada; se usa la activa.`);
    const wrappers2 = Array.from(document.querySelectorAll("div.lego-component-repeat"));
    const geoKey = (t, l, wd, h) => [px(t), px(l), px(wd), px(h)].join(",");
    const wrapByGeo = /* @__PURE__ */ new Map();
    for (const el of wrappers2) wrapByGeo.set(geoKey(el.style.top, el.style.left, el.style.width, el.style.height), el);
    const toItem = (c, level) => {
      const a2 = c.config.attribute || {};
      const keys = c.config.config && c.config.config.display && c.config.config.display.keys || {};
      const val = (k) => keys[k] ? keys[k].value : void 0;
      const bg = val("background");
      const border = val("border");
      const el = wrapByGeo.get(geoKey(a2.top, a2.left, a2.width, a2.height));
      if (el) el.setAttribute("data-mcp-id", c.getId());
      const ds = c.config.config && c.config.config.datasource && c.config.config.datasource.keys || {};
      const dims = ds.dimensions && ds.dimensions.value ? ds.dimensions.value : null;
      const mets = ds.metrics && ds.metrics.value ? ds.metrics.value : null;
      const defs = c.config.conceptDefs || {};
      const fieldOf = (n) => {
        const d = defs[n];
        return d && d.queryTimeTransformation && d.queryTimeTransformation.dataTransformation ? d.queryTimeTransformation.dataTransformation.sourceFieldName || n : n;
      };
      const flat = (v) => v ? Object.values(v).flat() : [];
      let error = null;
      try {
        if (c.hasError && c.hasError()) error = "category:" + (c.getErrorCategory ? c.getErrorCategory() : "?");
      } catch {
      }
      if (!error && el) {
        const txt = el.innerText || "";
        const m = txt.match(/Error del sistema|Configuraci[oó]n de gr[aá]fico no v[aá]lida|Error de configuraci[oó]n de datos|Error de configuraci[oó]n del usuario|Sin acceso al conjunto de datos|System error|Invalid chart configuration|Data set configuration error/i);
        if (m) error = m[0];
      }
      return {
        id: String(c.getId()),
        type: String(c.config.config && c.config.config.display && c.config.config.display.type || "unknown"),
        level,
        x: px(a2.left),
        y: px(a2.top),
        width: px(a2.width),
        height: px(a2.height),
        style: {
          padding: { top: px(val("paddingTop")), right: px(val("paddingRight")), bottom: px(val("paddingBottom")), left: px(val("paddingLeft")) },
          supportsPadding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].some((k) => k in keys),
          backgroundColor: bg && typeof bg === "object" ? bg.color ?? null : typeof bg === "string" ? bg : null,
          borderColor: border && typeof border === "object" ? border.color ?? null : null,
          borderWidth: border && typeof border === "object" && border.size !== void 0 ? Number(border.size) : null,
          borderRadius: border && typeof border === "object" && border.radius !== void 0 ? Number(border.radius) : null
        },
        data: {
          dimensions: flat(dims).map(fieldOf),
          metrics: flat(mets).map(fieldOf)
        },
        error
      };
    };
    const components2 = [
      ...page.components.map((c) => toItem(c, "page")),
      ...report.components.map((c) => toItem(c, "report"))
    ];
    const a = report.config.attribute || {};
    return {
      pageId: String(page.getId()),
      canvas: { width: px(a.width), height: px(a.height), zoom: 1 },
      components: components2,
      source: "internals",
      warnings
    };
  }
  warnings.push("Internals no disponibles: layout leido del DOM (ids sinteticos, sin datos).");
  const wrappers = Array.from(document.querySelectorAll("div.lego-component-repeat"));
  const components = wrappers.map((el, i) => {
    const inner = el.querySelector("ng2-canvas-component");
    const firstDiv = inner ? inner.firstElementChild : null;
    const cs = firstDiv ? getComputedStyle(firstDiv) : null;
    const id = el.getAttribute("data-mcp-id") || `dom-${i}`;
    el.setAttribute("data-mcp-id", id);
    return {
      id,
      type: inner ? inner.className.split(/\s+/)[0] || "unknown" : "unknown",
      level: "page",
      x: px(el.style.left),
      y: px(el.style.top),
      width: px(el.style.width),
      height: px(el.style.height),
      style: {
        padding: cs ? { top: px(cs.paddingTop), right: px(cs.paddingRight), bottom: px(cs.paddingBottom), left: px(cs.paddingLeft) } : { top: 0, right: 0, bottom: 0, left: 0 },
        supportsPadding: false,
        backgroundColor: cs ? cs.backgroundColor : null,
        borderColor: cs ? cs.borderTopColor : null,
        borderWidth: cs ? px(cs.borderTopWidth) : null,
        borderRadius: cs ? px(cs.borderTopLeftRadius) : null
      },
      data: { dimensions: [], metrics: [] },
      error: null
    };
  });
  return { pageId: pageId ?? null, canvas: null, components, source: "dom-heuristic", warnings };
}
async function applyBoxModelScript(args) {
  const w = window;
  const warnings = [];
  const applied = [];
  const px = (v) => {
    const n = parseFloat(String(v ?? ""));
    return isNaN(n) ? 0 : n;
  };
  let report;
  try {
    report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  } catch {
    return { ok: false, componentId: args.componentId, applied, before: null, after: null, source: "internals", warnings, error: "No se encontro legoUndoRedoService (internals de Looker Studio no disponibles)." };
  }
  const all = [...report.pages.flatMap((p) => p.components), ...report.components];
  const comp = all.find((c) => c.getId() === args.componentId);
  if (!comp) {
    return { ok: false, componentId: args.componentId, applied, before: null, after: null, source: "internals", warnings, error: `Componente ${args.componentId} no encontrado. Usa get_report_layout para ver los ids (cd-...).` };
  }
  const snap = () => {
    const a = comp.config.attribute;
    const keys = comp.config.config.display.keys || {};
    const v = (k) => keys[k] ? keys[k].value : void 0;
    return {
      id: comp.getId(),
      type: comp.config.config.display.type,
      x: px(a.left),
      y: px(a.top),
      width: px(a.width),
      height: px(a.height),
      style: {
        padding: { top: px(v("paddingTop")), right: px(v("paddingRight")), bottom: px(v("paddingBottom")), left: px(v("paddingLeft")) },
        backgroundColor: null,
        borderColor: null,
        borderWidth: null,
        borderRadius: null
      }
    };
  };
  const before = snap();
  if (args.padding) {
    const keys = comp.config.config.display.keys || {};
    const sides = [
      ["paddingTop", args.padding.top],
      ["paddingRight", args.padding.right],
      ["paddingBottom", args.padding.bottom],
      ["paddingLeft", args.padding.left]
    ];
    const supported = sides.filter(([k]) => k in keys);
    if (supported.length === 0) {
      warnings.push(`El tipo "${before.type}" no expone padding (no hay claves padding* en display.keys). Se ignora el padding.`);
    }
    for (const [k, v] of supported) {
      comp.setDisplayKeyValue(k, `${Math.round(v)}px`);
      applied.push(`${k}=${Math.round(v)}px`);
    }
    const missing = sides.filter(([k]) => !(k in keys)).map(([k]) => k);
    if (supported.length && missing.length) warnings.push(`Lados sin soporte en este tipo: ${missing.join(", ")}.`);
  }
  const attrs = {};
  if (args.position) {
    attrs.left = Math.round(args.position.x);
    attrs.top = Math.round(args.position.y);
  }
  if (args.dimensions) {
    attrs.width = Math.round(args.dimensions.width);
    attrs.height = Math.round(args.dimensions.height);
  }
  const changedAttrs = Object.entries(attrs).filter(([k, v]) => px(comp.config.attribute[k]) !== v);
  if (changedAttrs.length) {
    comp.setAttributeValues(Object.fromEntries(changedAttrs));
    for (const [k, v] of changedAttrs) applied.push(`${k}=${v}`);
  }
  if (applied.length) {
    try {
      w.angular.element(document.body).injector().get("wrapperSaveService").save([comp]);
    } catch (e) {
      warnings.push("wrapperSaveService.save fallo (" + (e && e.message) + "); se usa el empujon de atributos.");
      const l = px(comp.config.attribute.left);
      comp.setAttributeValues({ left: l + 1 });
      comp.setAttributeValues({ left: l });
    }
  }
  const after = snap();
  if (args.padding && JSON.stringify(after.style.padding) === JSON.stringify(before.style.padding) && applied.some((a) => a.startsWith("padding"))) {
    warnings.push("El padding no cambio en config tras aplicarlo; revisa en el panel de propiedades.");
  }
  return { ok: true, componentId: args.componentId, applied, before, after, source: "internals", warnings };
}
function readDataSourcesScript() {
  const w = window;
  const warnings = [];
  let report;
  try {
    report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  } catch {
    return { dataSources: [], source: "internals", warnings: ["Internals no disponibles (legoUndoRedoService)."] };
  }
  const ids = /* @__PURE__ */ new Set();
  const rootDs = report.config.config && report.config.config.datasource && report.config.config.datasource.keys.dataset;
  if (rootDs && rootDs.value && rootDs.value.id) ids.add(String(rootDs.value.id));
  const all = [...report.pages.flatMap((p) => p.components), ...report.components];
  const usage = {};
  for (const c of all) {
    const k = c.config.config && c.config.config.datasource && c.config.config.datasource.keys && c.config.config.datasource.keys.dataset;
    const id = k && k.value && k.value.id ? String(k.value.id) : rootDs && rootDs.value ? String(rootDs.value.id) : null;
    if (id) {
      ids.add(id);
      (usage[id] = usage[id] || []).push(c.getId());
    }
  }
  try {
    for (const x of report.getDatasourceIds() || []) ids.add(String(x));
  } catch {
  }
  const dtNames = { 0: "TEXT", 2: "NUMBER", 3: "BOOLEAN", 6: "DATE", 7: "DATETIME" };
  const dataSources = [];
  for (const id of ids) {
    let schema = null;
    try {
      schema = report.getDatasourceSchema(id);
    } catch (e) {
      warnings.push(`getDatasourceSchema(${id}) fallo: ${e && e.message}`);
    }
    let concepts = schema && schema.qe && schema.qe.concepts ? schema.qe.concepts : {};
    if (!Object.keys(concepts).length) {
      const c = all.find((x) => {
        try {
          return String(x.getDataSourceId()) === id;
        } catch {
          return false;
        }
      });
      try {
        const cs = c && c.getSchema();
        if (cs && cs.qe && cs.qe.concepts) {
          schema = cs;
          concepts = cs.qe.concepts;
        }
      } catch {
      }
    }
    const fields = Object.entries(concepts).map(([key, f]) => ({
      id: String(f.name || key),
      qualifiedId: String(f.id || ""),
      name: String(f.displayName || f.name || key),
      type: f.type === 1 ? "METRIC" : "DIMENSION",
      dataType: dtNames[f.dataType] ?? String(f.dataType),
      defaultAggregation: f.defaultAggregation ?? null
    }));
    if (!fields.length) warnings.push(`Origen ${id}: esquema vacio o aun no cargado.`);
    dataSources.push({
      dataSourceId: id,
      name: id,
      maxDimensions: schema && schema.qe ? schema.qe.maxDimensions ?? null : null,
      maxMetrics: schema && schema.qe ? schema.qe.maxMetrics ?? null : null,
      usedBy: usage[id] || [],
      fields
    });
  }
  return { dataSources, source: "internals", warnings };
}
async function bindFieldsScript(args) {
  const w = window;
  const warnings = [];
  const trace = w.__mcpTrace = [];
  const mark = (m) => {
    trace.push(`${Date.now() % 1e5} ${m}`);
  };
  const fail = (error2) => ({ ok: false, componentId: args.componentId, dimensions: [], metrics: [], source: "internals", warnings, error: error2 });
  let report;
  try {
    report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  } catch {
    return fail("Internals no disponibles (legoUndoRedoService).");
  }
  const all = [...report.pages.flatMap((p) => p.components), ...report.components];
  const comp = all.find((c) => c.getId() === args.componentId);
  if (!comp) return fail(`Componente ${args.componentId} no encontrado.`);
  if (typeof comp.updateMetrics !== "function") return fail(`El tipo "${comp.config.config.display.type}" no admite campos.`);
  const dsKeys = comp.config.config.datasource.keys;
  const viewId = dsKeys.dataViewActive && dsKeys.dataViewActive.value && dsKeys.dataViewResource && dsKeys.dataViewResource.value;
  const dsId = dsKeys.dataset && dsKeys.dataset.value && dsKeys.dataset.value.id || viewId || (report.config.config.datasource.keys.dataset?.value?.id ?? "");
  let concepts = {};
  try {
    concepts = comp.getSchema && comp.getSchema()?.qe?.concepts || {};
  } catch {
  }
  if (!Object.keys(concepts).length) {
    try {
      const sch = report.getDatasourceSchema(dsId);
      concepts = sch && sch.qe && sch.qe.concepts || {};
      if (!Object.keys(concepts).length && sch && sch.concepts) {
        concepts = {};
        for (const v of Object.values(sch.concepts)) {
          const sem = v.getSemantic && v.getSemantic() || [];
          const s0 = Array.isArray(sem) ? sem[0] : sem;
          const isMetric = !!(v.getAggregationTypeDisplayLabel && v.getAggregationTypeDisplayLabel());
          const name = String(v.getName());
          concepts[name] = {
            name,
            id: String(v.getId ? v.getId() : name),
            displayName: String(v.getDisplayName()),
            namespace: String(v.getNamespace ? v.getNamespace() : "t0"),
            type: isMetric ? 1 : 0,
            dataType: s0 === 33 ? 2 : s0 === 34 ? 3 : s0 === 32 ? 0 : 6
          };
        }
      }
    } catch {
      return fail(`No se pudo leer el esquema del origen ${dsId}.`);
    }
  }
  if (!Object.keys(concepts).length) return fail(`Esquema del origen ${dsId} vacio (aun no cargado).`);
  const list = Object.values(concepts);
  const AGG = { NONE: 0, AVG: 1, COUNT: 2, COUNT_DISTINCT: 3, MAX: 4, MIN: 5, SUM: 6 };
  const resolve = (ref, want) => {
    let r = String(ref).trim();
    let agg;
    let label;
    const asM = r.match(/^(.*\S)\s+as\s+(.+)$/i);
    if (asM) {
      r = asM[1].trim();
      label = asM[2].trim();
    }
    if (r.startsWith("=")) {
      let formula = r.slice(1).trim();
      let out;
      let pct = false;
      const typed = formula.match(/^(.*\S)\s*::\s*(BOOLEAN|TEXT|NUMBER|PERCENT)$/i);
      if (typed) {
        formula = typed[1].trim();
        pct = typed[2].toUpperCase() === "PERCENT";
        out = { BOOLEAN: 3, TEXT: 0, NUMBER: 2, PERCENT: 2 }[typed[2].toUpperCase()];
      } else if (!/^\s*(CASE|IF)\b/i.test(formula) && /(<=|>=|!=|<>|[^<>!=]=[^=]|[<>]|\bIN\s*\(|\bIS\s+(NOT\s+)?NULL\b|\b(REGEXP_MATCH|REGEXP_CONTAINS|CONTAINS_TEXT|STARTS_WITH|ENDS_WITH)\s*\(|\b(AND|OR|NOT)\b)/i.test(formula)) out = 3;
      return { f: null, agg: void 0, label, formula, out, pct };
    }
    const m = r.match(/^([A-Za-z_]+)\((.+)\)$/);
    if (m && want === 1) {
      const code = AGG[m[1].toUpperCase()];
      if (code === void 0) {
        warnings.push(`Agregacion "${m[1]}" no soportada (usa ${Object.keys(AGG).join(", ")}).`);
        return null;
      }
      agg = code;
      r = m[2].trim();
    }
    const bare = r.replace(/^t\d+\./, "");
    const f = concepts[bare] || list.find((x) => x.id === r) || list.find((x) => String(x.displayName).toLowerCase() === r.toLowerCase());
    if (!f) {
      warnings.push(`Campo "${ref}" no existe en el origen ${dsId}.`);
      return null;
    }
    if (want === 0 && f.type === 1) warnings.push(`"${ref}" es METRICA pero se pidio como DIMENSION.`);
    if (want === 1 && agg === void 0 && f.type !== 1) {
      agg = f.dataType === 2 ? AGG.SUM : AGG.COUNT_DISTINCT;
      warnings.push(`"${ref}" es una dimension del origen; se usa como metrica con ${agg === AGG.SUM ? "SUM" : "COUNT_DISTINCT"}.`);
    }
    let preset;
    try {
      preset = comp.config.config.display.preset;
    } catch {
    }
    if (want === 0 && (preset === "control-checkbox" || preset === "button-filter") && f.dataType !== 3) {
      warnings.push(`"${ref}" no es booleano en el origen: la casilla o el boton de filtro dara reason 116. Crea un campo booleano en el ORIGEN con add_source_field (CLI: fields add), p. ej. UPPER(campo) IN ("TRUE","SI"), y vincula ese campo.`);
    }
    return { f, agg, label, formula: void 0, out: void 0, pct: false };
  };
  const mkDef = ({ f, agg, label, formula, out, dim, pct }) => {
    const qt = "qt_" + Math.random().toString(36).slice(2, 12).padEnd(10, "0");
    const ns = String(f && f.namespace || "t0");
    let dataTransformation;
    const displayTransformation = label ? { displayName: label } : {};
    if (formula) {
      const byName = /* @__PURE__ */ new Map();
      for (const c of list) {
        byName.set(String(c.name).toLowerCase(), String(c.name));
        if (c.displayName) byName.set(String(c.displayName).toLowerCase(), String(c.name));
      }
      const tf = formula.replace(/(?<![\w.])([A-Za-z_][A-Za-z0-9_]*)(?![\w(])/g, (tok) => {
        const id = byName.get(tok.toLowerCase());
        return id ? `${ns}.${id}` : tok;
      });
      dataTransformation = dim ? { sourceType: 1, textFormula: tf, frontendTextFormula: tf, formulaOutputDataType: out ?? 2 } : {
        sourceType: 1,
        sourceFieldName: "qt_" + Math.random().toString(36).slice(2, 12).padEnd(10, "0"),
        textFormula: tf,
        frontendTextFormula: tf,
        formulaOutputDataType: out ?? 2,
        aggregation: 7
      };
      const semantic = pct ? 14 : { 2: 33, 3: 34 }[out ?? 2];
      if (semantic) displayTransformation.outputSemanticInfo = { semanticConfig: [{ semanticType: semantic }] };
    } else {
      dataTransformation = { sourceFieldName: String(f.name) };
      if (agg !== void 0) dataTransformation.aggregation = agg;
    }
    return { name: qt, id: `${ns}.${qt}`, namespace: ns, queryTimeTransformation: { dataTransformation, displayTransformation } };
  };
  const dimFields = args.dimensions.map((d) => resolve(d, 0)).filter(Boolean);
  const metFields = args.metrics.map((m) => resolve(m, 1)).filter(Boolean);
  if (dimFields.length !== args.dimensions.length || metFields.length !== args.metrics.length) {
    return fail("Algunos campos no se pudieron resolver. Usa inspect_data_sources para ver los ids validos.");
  }
  mark("resolved");
  const mode = args.mode ?? "replace";
  const existing = (slot) => {
    const v = comp.getDataSourceKeyValue(slot);
    return v && v.primary ? v.primary.map((n) => comp.config.conceptDefs[n]).filter(Boolean) : [];
  };
  let typeFields = [];
  try {
    typeFields = w.angular.element(document.body).injector().get("legoMainRegistry").getDisplayTypeObj(comp.config.config.display.type).getDataFieldConfigs() || [];
  } catch {
  }
  const slotFor = (kind) => {
    const own = typeFields.filter((f) => f.type === kind);
    if (!own.length || own.some((f) => (f.options?.conceptKey ?? "primary") === "primary")) return "primary";
    return String(own[0].options.conceptKey);
  };
  if (args.dimensions.length) {
    const defs = dimFields.map((d) => mkDef({ ...d, dim: true }));
    comp.updateDimensions(slotFor(1), mode === "append" ? [...existing("dimensions"), ...defs] : defs);
  }
  if (args.metrics.length) {
    const defs = metFields.map(mkDef);
    const ms = slotFor(2);
    if (ms !== "primary") warnings.push(`Metricas enviadas al hueco "${ms}" (el tipo no usa metricas en "primary").`);
    comp.updateMetrics(ms, mode === "append" ? [...existing("metrics"), ...defs] : defs);
    if (ms !== "primary" && mode !== "append") {
      const mv = comp.getDataSourceKeyValue("metrics");
      if (mv && Array.isArray(mv.primary) && mv.primary.length) comp.updateMetrics("primary", []);
    }
  }
  mark("primary updated");
  if (args.clearDimensions && !args.dimensions.length) {
    const dv = comp.getDataSourceKeyValue("dimensions");
    if (dv && Array.isArray(dv.primary) && dv.primary.length) comp.updateDimensions("primary", []);
  }
  mark("clear done");
  {
    const isStale = (n) => {
      const dt = comp.config.conceptDefs[n]?.queryTimeTransformation?.dataTransformation;
      const sf = dt?.sourceFieldName;
      return !!sf && !concepts[sf] && dt?.sourceType !== 1 && !dt?.textFormula;
    };
    const replaced = /* @__PURE__ */ new Set([
      ...args.dimensions.length ? ["dimensions:primary"] : [],
      ...args.metrics.length ? ["metrics:primary"] : [],
      ...Object.keys(args.slots || {}).flatMap((k) => [`dimensions:${k}`, `metrics:${k}`])
    ]);
    for (const slot of ["dimensions", "metrics"]) {
      const v = comp.getDataSourceKeyValue(slot) || {};
      for (const [ck, names2] of Object.entries(v)) {
        if (replaced.has(`${slot}:${ck}`) || !Array.isArray(names2)) continue;
        const stale = names2.filter(isStale);
        if (!stale.length) continue;
        const keep = names2.filter((n) => !stale.includes(n)).map((n) => comp.config.conceptDefs[n]).filter(Boolean);
        if (slot === "dimensions") comp.updateDimensions(ck, keep);
        else comp.updateMetrics(ck, keep);
        warnings.push(`${stale.length} campo(s) heredado(s) inexistente(s) eliminado(s) de ${slot}.${ck}.`);
      }
    }
    const drd = comp.config.config.datasource.keys.dateRangeDimension;
    const dates = Object.values(concepts).filter((f) => (f.dataType === 6 || f.dataType === 7) && f.type !== 1);
    const pickDate = () => dates.find((f) => /fecha|date|d[ií]a|day/i.test(String(f.displayName || f.name)) && !/mes|month|a[nñ]o|year|semana|week/i.test(String(f.displayName))) || dates[0];
    if (drd && !drd.value && dates.length) {
      const date = pickDate();
      const def = mkDef({ f: date });
      try {
        comp.updateConceptPool([def]);
      } catch {
      }
      comp.config.conceptDefs[def.name] = def;
      if (typeof comp.setDataSourceKeyValue === "function") comp.setDataSourceKeyValue("dateRangeDimension", def.name, true, true);
      else drd.value = def.name;
      warnings.push(`Dimension de periodo: ${date.displayName} (la usan el control de periodo y la comparacion).`);
    }
    if (drd && typeof drd.value === "string" && isStale(drd.value)) {
      const date = pickDate();
      if (date) {
        const def = mkDef({ f: date });
        try {
          comp.updateConceptPool([def]);
        } catch {
        }
        comp.config.conceptDefs[def.name] = def;
        if (typeof comp.setDataSourceKeyValue === "function") comp.setDataSourceKeyValue("dateRangeDimension", def.name, true, true);
        else drd.value = def.name;
        warnings.push(`Dimension de periodo reasignada a ${date.displayName}.`);
      } else {
        if (typeof comp.setDataSourceKeyValue === "function") comp.setDataSourceKeyValue("dateRangeDimension", void 0, true, true);
        else delete drd.value;
        warnings.push("Dimension de periodo heredada eliminada (el origen no tiene fechas).");
      }
    }
  }
  mark("stale done");
  if (args.slots) {
    let fieldCfgs = [];
    try {
      const reg = w.angular.element(document.body).injector().get("legoMainRegistry");
      fieldCfgs = reg.getDisplayTypeObj(comp.config.config.display.type).getDataFieldConfigs() || [];
    } catch {
    }
    for (const [slot, refs] of Object.entries(args.slots)) {
      const fc = fieldCfgs.find((f) => f.options && f.options.conceptKey === slot);
      const kind = fc ? fc.type === 1 ? 0 : 1 : 1;
      const resolved = refs.map((r) => resolve(r, kind)).filter(Boolean);
      if (resolved.length !== refs.length) return fail(`Campos del slot "${slot}" no resueltos.`);
      const defs = resolved.map(mkDef);
      if (kind === 0) comp.updateDimensions(slot, defs);
      else comp.updateMetrics(slot, defs);
    }
  }
  mark("slots done");
  try {
    const k = comp.config.config.datasource.keys;
    const cur = (slot) => k[slot] && k[slot].value && k[slot].value.primary || [];
    const live = /* @__PURE__ */ new Set([...cur("dimensions"), ...cur("metrics")]);
    const sd = k.sortData && Array.isArray(k.sortData.value) ? k.sortData.value : null;
    const isTimeType = /linechart|areachart|combochart|timeline/.test(String(comp.config.config.display.type));
    const firstDim = cur("dimensions")[0];
    const firstDimField = firstDim && comp.config.conceptDefs[firstDim]?.queryTimeTransformation?.dataTransformation?.sourceFieldName;
    const dimIsDate = !!firstDimField && concepts[firstDimField] && (concepts[firstDimField].dataType === 6 || concepts[firstDimField].dataType === 7);
    if (isTimeType && firstDim && !(sd && sd[0] && sd[0].sortColumn === firstDim && sd[0].sortDir === 0)) {
      const v = [{ sortDir: 0, sortColumn: firstDim }];
      if (typeof comp.setDataSourceKeyValue === "function") comp.setDataSourceKeyValue("sortData", v, true, true);
      else k.sortData = { stateKey: "sortData", dominant: 2, value: v };
      warnings.push(dimIsDate ? "Orden temporal: por fecha ascendente." : "Orden de tendencia: por la primera dimension ascendente.");
    } else if (sd && sd.some((s) => !live.has(s.sortColumn))) {
      const isTime = /linechart|areachart|timeline|combochart/.test(String(comp.config.config.display.type));
      const col = isTime ? cur("dimensions")[0] ?? cur("metrics")[0] : cur("metrics")[0] ?? cur("dimensions")[0];
      if (col) {
        const v = [{ sortDir: isTime ? 0 : 1, sortColumn: col }];
        if (typeof comp.setDataSourceKeyValue === "function") comp.setDataSourceKeyValue("sortData", v, true, true);
        else k.sortData.value = v;
        warnings.push(`Orden reasignado a ${isTime ? "la primera dimension (asc)" : "la primera metrica (desc)"}.`);
      }
    }
  } catch (e) {
    warnings.push("No se pudo revisar sortData: " + (e && e.message));
  }
  try {
    const k = comp.config.config.datasource.keys;
    const sd = k.sortData && Array.isArray(k.sortData.value) ? k.sortData.value : null;
    const beh = comp.config.behavior || comp.config.config.behavior;
    const acts = (beh && Array.isArray(beh.onSort) ? beh.onSort : []).filter((a) => a && a.init && a.init.sortOptions);
    if (sd && sd.length && acts.length) {
      for (const a of acts) {
        const old = a.init.sortOptions.sortData || [];
        const datasetNs = old[0] && old[0].sortColumn && old[0].sortColumn.datasetNs || "d0";
        const next = sd.map((s) => {
          const def = comp.config.conceptDefs[s.sortColumn] || {};
          const dt = def.queryTimeTransformation && def.queryTimeTransformation.dataTransformation || {};
          return { sortDir: s.sortDir, sortColumn: { name: s.sortColumn, datasetNs, tableNs: def.namespace || "t0", dataTransformation: JSON.parse(JSON.stringify(dt)) } };
        });
        const same = old.length === next.length && old.every((o, i) => o.sortDir === next[i].sortDir && o.sortColumn && o.sortColumn.name === next[i].sortColumn.name);
        if (!same) {
          a.init.sortOptions.sortData = next;
          warnings.push("Orden inicial del grafico alineado con sortData.");
        }
      }
    }
  } catch (e) {
    warnings.push("No se pudo alinear el orden inicial: " + (e && e.message));
  }
  mark("sort done");
  try {
    comp.syncState(true);
  } catch (e) {
    warnings.push("syncState fallo: " + (e && e.message));
  }
  mark("synced");
  try {
    w.angular.element(document.body).injector().get("wrapperSaveService").save([comp]);
  } catch (e) {
    warnings.push("wrapperSaveService.save fallo (" + (e && e.message) + "); se usa el empujon de atributos.");
    const l = Number(comp.config.attribute.left) || 0;
    comp.setAttributeValues({ left: l + 1 });
    comp.setAttributeValues({ left: l });
  }
  let error;
  try {
    if (comp.hasError && comp.hasError()) {
      const e = comp.getError && comp.getError() || {};
      const detail = [e.title, e.description, e.errorTextInfo && e.errorTextInfo.errorDialogText].filter(Boolean).join(" | ").replace(/<[^>]+>/g, "");
      error = `El componente muestra un error tras vincular (categoria ${comp.getErrorCategory()}, reason ${e.reason ?? "?"}): ${detail || "sin detalle"}. En view/preview el servidor rechaza consultas nuevas (PREFETCH_VALIDATION). El editor conserva el error anterior hasta recargar: si acabas de cambiar los campos, recarga (reload_report) y vuelve a diagnosticar antes de darlo por bueno o malo.`;
    }
  } catch {
  }
  if (error) warnings.push(error);
  const names = (slot) => {
    const v = comp.getDataSourceKeyValue(slot);
    return v && v.primary ? v.primary.map((n) => comp.config.conceptDefs[n]?.queryTimeTransformation?.dataTransformation?.sourceFieldName ?? n) : [];
  };
  return { ok: true, componentId: args.componentId, dimensions: names("dimensions"), metrics: names("metrics"), source: "internals", warnings };
}
function diagnoseReportScript() {
  const w = window;
  const issues = [];
  let report;
  try {
    report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  } catch {
    return { issues: [{ severity: "error", componentId: null, pageId: null, code: "NO_INTERNALS", message: "Internals no disponibles; no se puede diagnosticar." }], stats: null };
  }
  const rootDsId = report.config.config.datasource.keys.dataset?.value?.id;
  const schemaCache = {};
  const schemaOf = (id) => {
    if (!(id in schemaCache)) {
      let c = null;
      try {
        c = report.getDatasourceSchema(id)?.qe?.concepts || null;
      } catch {
      }
      if (!c || !Object.keys(c).length) {
        const comp = [...report.pages.flatMap((p) => p.components), ...report.components].find((x) => {
          try {
            return String(x.getDataSourceId()) === id;
          } catch {
            return false;
          }
        });
        try {
          c = comp?.getSchema?.()?.qe?.concepts || c;
        } catch {
        }
      }
      schemaCache[id] = c && Object.keys(c).length ? c : null;
    }
    return schemaCache[id];
  };
  const W = Number(report.config.attribute?.width) || 0;
  const coords = report.pages.flatMap((p) => p.components.flatMap((c) => {
    const at = c.config.attribute;
    return [at.left, at.top, at.width, at.height].map(Number);
  }));
  const grid = [10, 8, 4].find((g) => coords.length && coords.filter((v) => v % g === 0).length / coords.length >= 0.8) ?? 0;
  let totalComps = 0;
  const perPage = {};
  for (const page of report.pages) {
    const pid = String(page.getId());
    const hasFields = (c) => {
      const k = c.config.config.datasource?.keys;
      return !!k && ["dimensions", "metrics"].some((s) => k[s]?.value && Object.values(k[s].value).flat().length > 0);
    };
    const dataComps = page.components.filter(hasFields);
    perPage[pid] = dataComps.length;
    totalComps += page.components.length;
    if (dataComps.length > 25) issues.push({ severity: "warning", componentId: null, pageId: pid, code: "TOO_MANY_CHARTS", message: `${dataComps.length} componentes con datos en la pagina: rendimiento degradado (recomendado <= 25).` });
    for (const c of page.components) {
      const id = c.getId();
      const type = c.config.config.display.type;
      const a = c.config.attribute;
      if (W && Number(a.left) + Number(a.width) > W) issues.push({ severity: "warning", componentId: id, pageId: pid, code: "OUT_OF_CANVAS", message: `${type} sobresale del lienzo (${a.left}+${a.width} > ${W}).` });
      if (grid && (Number(a.left) % grid || Number(a.top) % grid || Number(a.width) % grid || Number(a.height) % grid)) issues.push({ severity: "info", componentId: id, pageId: pid, code: "OFF_GRID", message: `${type} fuera de la reticula dominante de ${grid}px (x=${a.left}, y=${a.top}, w=${a.width}, h=${a.height}).` });
      try {
        if (c.hasError && c.hasError()) {
          const e = c.getError && c.getError() || {};
          const detail = [e.title, e.description, e.errorTextInfo && e.errorTextInfo.errorDialogText].filter(Boolean).join(" | ").replace(/<[^>]+>/g, "");
          issues.push({ severity: "error", componentId: id, pageId: pid, code: "COMPONENT_ERROR", message: `${type} en estado de error (categoria ${c.getErrorCategory()}, reason ${e.reason ?? "?"}): ${detail || "sin detalle"}` });
        }
      } catch {
      }
      const ds = c.config.config.datasource?.keys;
      if (!ds) continue;
      const dsId = ds.dataset?.value?.id || rootDsId;
      const concepts = dsId ? schemaOf(dsId) : null;
      const defs = c.config.conceptDefs || {};
      for (const slot of ["dimensions", "metrics"]) {
        const v = ds[slot]?.value;
        if (!v) continue;
        for (const n of Object.values(v).flat()) {
          const def = defs[n];
          const src = def?.queryTimeTransformation?.dataTransformation?.sourceFieldName;
          if (!def) issues.push({ severity: "error", componentId: id, pageId: pid, code: "MISSING_CONCEPT_DEF", message: `${slot} usa ${n} sin conceptDef.` });
          else if (src && concepts && !concepts[src] && !def.queryTimeTransformation?.dataTransformation?.textFormula && def.queryTimeTransformation?.dataTransformation?.sourceType !== 1) issues.push({ severity: "error", componentId: id, pageId: pid, code: "FIELD_NOT_IN_SCHEMA", message: `Campo "${src}" no existe en el origen ${dsId} (migracion o campo eliminado).` });
          const agg = def?.queryTimeTransformation?.dataTransformation?.aggregation;
          const dflt = src && concepts && concepts[src] ? concepts[src].defaultAggregation : void 0;
          if (def && agg !== void 0 && dflt !== void 0 && agg !== dflt && concepts[src].type === 1) issues.push({ severity: "warning", componentId: id, pageId: pid, code: "CUSTOM_AGGREGATION", message: `${slot} "${concepts[src].displayName ?? src}" usa agregacion ${agg} distinta de la del origen (${dflt}). Si el origen no permite editar campos en informes, el grafico falla: revincula con bind_fields_to_component.` });
        }
      }
      const liveQt = new Set(["dimensions", "metrics"].flatMap((s) => ds[s]?.value ? Object.values(ds[s].value).flat() : []));
      const sorts = Array.isArray(ds.sortData?.value) ? ds.sortData.value : [];
      for (const srt of sorts) {
        if (srt && srt.sortColumn && !liveQt.has(srt.sortColumn))
          issues.push({ severity: "error", componentId: id, pageId: pid, code: "SORT_INVALID", message: `${type} ordena por ${srt.sortColumn}, que no esta entre sus dimensiones/metricas ("Orden no valido").` });
      }
      if (ds.metrics && !Object.values(ds.metrics.value || {}).flat().length && ["kpi-metric", "simple-table", "simple-barchart", "simple-linechart", "simple-piechart"].includes(type)) {
        issues.push({ severity: "error", componentId: id, pageId: pid, code: "NO_METRICS", message: `${type} sin metricas: "Configuracion de grafico no valida".` });
      }
    }
  }
  const el = Array.from(document.querySelectorAll("div.lego-component-repeat"));
  for (const e of el) {
    const t = e.innerText || "";
    const m = t.match(/Error del sistema|Configuraci[oó]n de gr[aá]fico no v[aá]lida|Error de configuraci[oó]n de datos|Error de configuraci[oó]n del usuario|Sin acceso al conjunto de datos|System error|Invalid chart configuration|Data set configuration error|No hay datos|No data/i);
    if (m) issues.push({ severity: /No hay datos|No data/i.test(m[0]) ? "info" : "error", componentId: e.getAttribute("data-mcp-id"), pageId: null, code: "UI_MESSAGE", message: `Mensaje visible en el canvas: "${m[0]}".` });
  }
  return { issues, stats: { pages: report.pages.length, components: totalComps, reportLevelComponents: report.components.length, dataComponentsPerPage: perPage, canvasWidth: W, grid } };
}
function readComponentConfigScript(componentId) {
  const w = window;
  try {
    const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
    const all = [...report.pages.flatMap((p) => p.components), ...report.components];
    const c = all.find((x) => x.getId() === componentId);
    if (!c) return { ok: false, error: `Componente ${componentId} no encontrado.` };
    return { ok: true, config: JSON.parse(JSON.stringify(c.config)) };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}

// src/looker/report.ts
var EVAL_TIMEOUT_MS = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15e3);
function parseReportUrl(url) {
  let path4 = url;
  try {
    path4 = new URL(url).pathname;
  } catch {
  }
  const reportId2 = path4.match(/\/reporting\/([^/?#]+)/)?.[1] ?? null;
  const pageId = path4.match(/\/page\/([^/?#]+)/)?.[1] ?? null;
  const segments = path4.split("/").filter(Boolean);
  let mode = "view";
  if (segments.includes("edit")) mode = "edit";
  else if (segments.includes("preview")) mode = "preview";
  return { reportId: reportId2, pageId, mode };
}
async function attachToReport(page) {
  const p = page ?? await getReportPage();
  const info = await evaluateOn(p, EVAL_TIMEOUT_MS, pageInfoScript);
  const url = info.url || p.url();
  return {
    ...parseReportUrl(url),
    title: info.title.replace(/\s*-\s*(Looker|Data) Studio\s*$/i, "") || info.title,
    url,
    canvas: info.canvas
  };
}
async function requireEditMode() {
  const page = await getReportPage();
  const info = { ...parseReportUrl(page.url()), title: await page.title(), url: page.url() };
  if (info.mode !== "edit" && process.env.LS_ALLOW_NON_EDIT !== "1") {
    throw new Error(
      `El informe esta en modo "${info.mode}". Esta herramienta modifica el informe y requiere modo edicion: pulsa "Editar" en Looker Studio (la URL debe terminar en /edit) y vuelve a intentarlo.`
    );
  }
  await revealIfHidden(page);
  return { page, info };
}

// src/looker/scripts2.ts
function readyStateScript() {
  const w = window;
  try {
    const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
    const pages = report && report.pages ? report.pages.length : 0;
    const comps = pages ? report.pages.reduce((n, p) => n + p.components.length, 0) : 0;
    return { ready: pages > 0, pages, components: comps, url: location.href };
  } catch {
    return { ready: false, pages: 0, components: 0, url: location.href };
  }
}
function installNetMonitorScript() {
  const w = window;
  if (w.__mcpNet) return { installed: true };
  w.__mcpNet = [];
  const RE = /\/(updatePage|updateReport|batchedDataV2|createReport|deletePage)\b/;
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this.__mcpPath = String(url).split("?")[0];
    return origOpen.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function(...args) {
    const path4 = this.__mcpPath || "";
    if (RE.test(path4)) {
      this.addEventListener("loadend", () => {
        const log2 = w.__mcpNet;
        log2.push({ path: path4.replace(/^https?:\/\/[^/]+/, ""), status: this.status, t: Date.now() });
        if (log2.length > 200) log2.splice(0, log2.length - 200);
      });
    }
    return origSend.apply(this, args);
  };
  const origFetch = w.fetch;
  if (typeof origFetch === "function") {
    w.fetch = function(input, init) {
      const path4 = String(input && input.url || input).split("?")[0];
      const p = origFetch.call(this, input, init);
      if (RE.test(path4)) {
        p.then((res) => {
          w.__mcpNet.push({ path: path4.replace(/^https?:\/\/[^/]+/, ""), status: res.status, t: Date.now() });
        }).catch(() => void 0);
      }
      return p;
    };
  }
  return { installed: true };
}
function readNetLogScript(since) {
  const w = window;
  return (w.__mcpNet || []).filter((e) => e.t >= since);
}
function exportReportScript() {
  const w = window;
  const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const pageNames = {};
  for (const p of report.config.page || []) pageNames[String(p.id)] = String(p.attribute && p.attribute.name || "");
  const all = [...report.pages.flatMap((p) => p.components), ...report.components];
  const dtNames = { 0: "TEXT", 2: "NUMBER", 3: "BOOLEAN", 6: "DATE", 7: "DATETIME" };
  const ids = /* @__PURE__ */ new Set();
  try {
    for (const x of report.getDatasourceIds() || []) ids.add(String(x));
  } catch {
  }
  for (const c of all) {
    try {
      const d = c.getDataSourceId();
      if (d) ids.add(String(d));
    } catch {
    }
  }
  const dataSources = [...ids].map((id) => {
    let concepts = {};
    try {
      concepts = report.getDatasourceSchema(id)?.qe?.concepts || {};
    } catch {
    }
    if (!Object.keys(concepts).length) {
      const c = all.find((x) => {
        try {
          return String(x.getDataSourceId()) === id;
        } catch {
          return false;
        }
      });
      try {
        concepts = c?.getSchema?.()?.qe?.concepts || {};
      } catch {
      }
    }
    return {
      id,
      usedBy: all.filter((x) => {
        try {
          return String(x.getDataSourceId()) === id;
        } catch {
          return false;
        }
      }).map((x) => String(x.getId())),
      fields: Object.values(concepts).map((f) => ({
        id: String(f.name),
        name: String(f.displayName ?? f.name),
        type: f.type === 1 ? "METRIC" : "DIMENSION",
        dataType: dtNames[f.dataType] ?? String(f.dataType),
        defaultAggregation: f.defaultAggregation ?? null
      }))
    };
  });
  const a = report.config.attribute || {};
  return {
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    url: location.href,
    title: document.title,
    reportId: String(report.config.id),
    canvas: { width: Number(a.width) || 0, height: Number(a.height) || 0 },
    pages: report.pages.map((p) => ({
      id: String(p.getId()),
      name: pageNames[String(p.getId())] ?? "",
      components: p.components.map((c) => clone(c.config))
    })),
    reportComponents: report.components.map((c) => clone(c.config)),
    dataSources,
    types: [...new Set(all.map((c) => String(c.config.config.display.type)))]
  };
}
function captureTemplatesScript() {
  const w = window;
  const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  const all = [...report.pages.flatMap((p) => p.components), ...report.components];
  const templates = {};
  for (const c of all) {
    const type = String(c.config.config.display.type);
    if (templates[type]) continue;
    const cfg = JSON.parse(JSON.stringify(c.config));
    templates[type] = { config: cfg, fromComponent: String(c.getId()), dataSourceId: (() => {
      try {
        return String(c.getDataSourceId() || "");
      } catch {
        return "";
      }
    })() };
  }
  let registered = [];
  try {
    const reg = w.angular.element(document.body).injector().get("legoMainRegistry");
    const k = Object.keys(reg).find((x) => reg[x] && typeof reg[x] === "object" && reg[x]["kpi-metric"]);
    registered = k ? Object.keys(reg[k]) : [];
  } catch {
  }
  return { url: location.href, templates, registeredTypes: registered };
}
function createComponentScript(args) {
  const w = window;
  const warnings = [];
  const fail = (error) => ({ ok: false, componentId: null, type: args.type, source: null, warnings, error });
  let inj;
  let report;
  try {
    inj = w.angular.element(document.body).injector();
    report = inj.get("legoUndoRedoService").report;
  } catch {
    return fail("Internals no disponibles (legoUndoRedoService).");
  }
  const page = args.pageId ? report.pages.find((p) => String(p.getId()) === String(args.pageId)) : report.pages.find((pg) => String(pg.getId()) === ((location.pathname.match(/\/page\/([^/]+)/) || [])[1] ?? "")) || report.pages[report.selected] || report.pages[0];
  if (!page) return fail(`Pagina ${args.pageId} no encontrada.`);
  const all = [...report.pages.flatMap((p) => p.components), ...report.components];
  const same = all.find((c) => c.config.config.display.type === args.type);
  let cfg;
  let source;
  if (same && !(args.preferTemplate && args.template)) {
    cfg = same.duplicateConfig();
    source = `clone:${same.getId()}`;
  } else if (args.template) {
    const minter = all[0];
    if (!minter) return fail("El informe no tiene componentes: crea uno en la UI para poder generar ids.");
    const fresh = minter.duplicateConfig();
    cfg = JSON.parse(JSON.stringify(args.template));
    cfg.id = fresh.id;
    if (cfg.attribute) delete cfg.attribute.alias;
    source = "template";
  } else {
    return fail(`No hay componente ni plantilla del tipo "${args.type}". Captura una con capture_templates desde un informe que lo tenga.`);
  }
  if (cfg.config.display.type !== args.type) return fail("La plantilla no coincide con el tipo pedido.");
  cfg.attribute = Object.assign(cfg.attribute || {}, {
    left: Math.round(args.box.x),
    top: Math.round(args.box.y),
    width: Math.round(args.box.width),
    height: Math.round(args.box.height)
  });
  const keys = cfg.config.datasource && cfg.config.datasource.keys;
  const curDs = keys && keys.dataset && keys.dataset.value && keys.dataset.value.id;
  const wantDs = args.datasetId || curDs;
  if (keys && wantDs && wantDs !== curDs) {
    keys.dataset = { stateKey: "ds", dominant: 2, value: { id: wantDs } };
    if (curDs) warnings.push(`Origen cambiado de ${curDs} a ${wantDs}: los campos de la plantilla siguen hasta que vincules los nuevos (bind).`);
  }
  if (keys && keys.filters && Array.isArray(keys.filters.value) && keys.filters.value.length) {
    const own = report.config.resource && report.config.resource.filter || {};
    const ids = keys.filters.value;
    keys.filters.value = [];
    const foreign = ids.filter((id) => !own[id]);
    warnings.push(foreign.length === ids.length ? `Filtros de la plantilla quitados (no existen en este informe): ${ids.join(", ")}.` : `Filtros del componente copiado quitados (${ids.join(", ")}): anadelos con add_filter si los quieres.`);
  }
  if (source === "template" && cfg.config.display && cfg.config.display.keys) {
    const dk = cfg.config.display.keys;
    const THEME = /color|fontfamily|background|border|shadow|opacity/i;
    const dropped = Object.keys(dk).filter((k) => THEME.test(k));
    for (const k of dropped) delete dk[k];
    if (dropped.length) warnings.push(`Estilos de tema de la plantilla eliminados: ${dropped.join(", ")}.`);
  }
  if (source === "template" && cfg.config.display && cfg.config.display.keys) {
    const dk = cfg.config.display.keys;
    const PER_COLUMN = /^(col[A-Z]|columnsWidth$|rowsHeight$|compactNumbers$|decimalPrecision$|barScaling$)/;
    const cols = Object.keys(dk).filter((k) => PER_COLUMN.test(k));
    for (const k of cols) delete dk[k];
    if (cols.length) warnings.push(`Ajustes por columna de la plantilla quitados (${cols.join(", ")}): se ajustan con patch_component (style) si hacen falta.`);
  }
  if (cfg.config.display && cfg.config.display.keys) {
    const dk = cfg.config.display.keys;
    const area = Object.keys(dk).filter((k) => /^chartArea(Top|Left|Width|Height)$/.test(k) && dk[k] && dk[k].value != null);
    for (const k of area) delete dk[k];
    if (area.length) warnings.push(`Area de dibujo fija del original quitada (${area.join(", ")}): el grafico ocupa su caja.`);
  }
  if (args.padding !== void 0 && cfg.config.display && cfg.config.display.keys) {
    const dk = cfg.config.display.keys;
    for (const side of ["Top", "Right", "Bottom", "Left"]) {
      const k = "padding" + side;
      if (k in dk) dk[k] = { stateKey: k, dominant: 2, value: `${Math.round(args.padding)}px` };
    }
  }
  let comp;
  try {
    comp = page.addComponent(cfg);
  } catch (e) {
    return fail("page.addComponent fallo: " + (e && e.message));
  }
  if (!args.deferSave) {
    try {
      inj.get("wrapperSaveService").save([comp]);
    } catch (e) {
      warnings.push("save fallo: " + (e && e.message));
    }
  }
  return { ok: true, componentId: String(comp.getId()), type: args.type, source, warnings, pageId: String(page.getId()) };
}
function deleteComponentScript(componentId) {
  const w = window;
  let inj;
  let report;
  try {
    inj = w.angular.element(document.body).injector();
    report = inj.get("legoUndoRedoService").report;
  } catch {
    return { ok: false, method: null, needsKeyboard: false, error: "Internals no disponibles." };
  }
  const page = report.pages.find((p) => p.components.some((c) => c.getId() === componentId));
  if (!page) return { ok: false, method: null, needsKeyboard: false, error: `Componente ${componentId} no encontrado.` };
  const comp = page.components.find((c) => c.getId() === componentId);
  for (const m of ["removeComponent", "deleteComponent"]) {
    if (typeof page[m] === "function") {
      try {
        page[m](comp);
        if (page.components.some((c) => c.getId() === componentId)) page[m](componentId);
        if (!page.components.some((c) => c.getId() === componentId)) {
          try {
            inj.get("wrapperSaveService").save([page]);
          } catch {
          }
          return { ok: true, method: `page.${m}`, needsKeyboard: false };
        }
      } catch {
      }
    }
  }
  try {
    report.selectComponents([comp], true);
    return { ok: false, method: "select", needsKeyboard: true };
  } catch (e) {
    return { ok: false, method: null, needsKeyboard: false, error: "No se pudo seleccionar: " + (e && e.message) };
  }
}
function patchComponentScript(args) {
  const w = window;
  const changes = [];
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const all = [...report.pages.flatMap((p) => p.components), ...report.components];
    const comp = all.find((c) => c.getId() === args.componentId);
    if (!comp) return { ok: false, changes, error: `Componente ${args.componentId} no encontrado.` };
    if (args.dateRangeDays !== void 0) {
      if (comp.config.config.display.type !== "simple-daterangepicker")
        return { ok: false, changes, error: "dateRangeDays solo aplica a controles de periodo (simple-daterangepicker)." };
      comp.config.behavior = comp.config.behavior || {};
      const acts = comp.config.behavior.onSelect = comp.config.behavior.onSelect || [];
      let act = acts.find((a) => a.action === "lego-change-date-range");
      if (!act) {
        act = { action: "lego-change-date-range", isControl: true, init: {} };
        acts.push(act);
        changes.push("+behavior lego-change-date-range");
      }
      act.init = act.init || {};
      act.init.dateRange = { startOffsetUnit: 3, startOffset: Math.round(args.dateRangeDays), endOffsetUnit: 3, endOffset: 1 };
      act.init.updateFrequency = "Rolling";
      changes.push(`dateRange=ultimos ${Math.round(args.dateRangeDays)} dias`);
    }
    if (args.stripThemeStyles) {
      const THEME = /color|fontfamily|background|border|shadow|opacity/i;
      const dk = comp.config.config.display.keys || {};
      const has = (v) => v !== void 0 && v !== null && !(Array.isArray(v) && v.every((x) => x === null || x === void 0));
      for (const k of Object.keys(dk).filter((x) => THEME.test(x) && has(dk[x] && dk[x].value))) {
        comp.setDisplayKeyValue(k, void 0);
        changes.push(`-${k}`);
      }
      if (/table/.test(String(comp.config.config.display.type))) {
        let accent = "#1A73E8", accentText = "#FFFFFF";
        try {
          const themes = report.config.resource && report.config.resource.theme || [];
          const list = Array.isArray(themes) ? themes : Object.values(themes);
          const ct = list.map((t) => t && t.content).find((x) => x && x.themeAccentFillColor);
          if (ct && ct.themeAccentFillColor.color) accent = ct.themeAccentFillColor.color;
          if (ct && ct.themeAccentFontColor && ct.themeAccentFontColor.color) accentText = ct.themeAccentFontColor.color;
        } catch {
        }
        comp.setDisplayKeyValue("headerColor", { color: accent, opacity: 1 });
        comp.setDisplayKeyValue("headerFontColor", { color: accentText, opacity: 1 });
        changes.push("cabecera=acento del tema con su texto");
      }
    }
    if (changes.length) inj.get("wrapperSaveService").save([comp]);
    return { ok: true, changes };
  } catch (e) {
    return { ok: false, changes, error: String(e && e.message) };
  }
}
function componentExistsScript(componentId) {
  const w = window;
  try {
    const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
    return [...report.pages.flatMap((p) => p.components), ...report.components].some((c) => c.getId() === componentId);
  } catch {
    return false;
  }
}

// src/looker/scripts3.ts
function readThemeScript() {
  const w = window;
  const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  const keys = report.config.config.display.keys || {};
  const themeConfig = keys.themeConfig ? String(keys.themeConfig.value) : null;
  const list = report.config.resource && report.config.resource.theme || [];
  const hit = list.find((t) => t.id === themeConfig);
  const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) => k === "$$hashKey" ? void 0 : v));
  return { themeConfig, custom: hit ? strip(hit.content) : null, themes: list.length };
}
function applyThemeScript(content) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const keys = report.config.config.display.keys || {};
    const cur = keys.themeConfig ? String(keys.themeConfig.value) : null;
    const list = report.config.resource && report.config.resource.theme || [];
    let id = null;
    let created = false;
    if (cur && list.some((t) => t.id === cur)) {
      report.updateResourceById("theme", cur, content);
      id = cur;
    } else {
      report.addResource("theme", content);
      const after = report.config.resource.theme;
      id = after[after.length - 1].id;
      created = true;
    }
    report.setDisplayKeyValue("themeConfig", id);
    inj.get("wrapperSaveService").save([report]);
    return { ok: true, themeId: id, created };
  } catch (e) {
    return { ok: false, themeId: null, created: false, error: String(e && e.message) };
  }
}
function listPagesScript() {
  const w = window;
  const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  return report.pages.map((p, i) => ({
    id: String(p.getId()),
    name: String(p.config.attribute && p.config.attribute.name || ""),
    components: p.components.length,
    index: i
  }));
}
function addPageScript() {
  const w = window;
  try {
    const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
    const before = report.pages.length;
    const btn = Array.from(document.querySelectorAll("button")).find((b) => /A[nñ]adir p[aá]gina|Add page/i.test(b.innerText || b.getAttribute("aria-label") || ""));
    if (!btn) return { ok: false, before, error: 'Boton "Anadir pagina" no encontrado (modo edicion?).' };
    btn.click();
    return { ok: true, before };
  } catch (e) {
    return { ok: false, before: 0, error: String(e && e.message) };
  }
}
function renamePageScript(args) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const page = report.pages.find((p) => String(p.getId()) === String(args.pageId));
    if (!page) return { ok: false, error: `Pagina ${args.pageId} no encontrada.` };
    if (typeof page.setAttributeValues === "function") page.setAttributeValues({ name: args.name });
    else page.config.attribute.name = args.name;
    const rc = report.config.page.find((p) => String(p.id) === String(args.pageId));
    if (rc) rc.attribute.name = args.name;
    inj.get("wrapperSaveService").save([page]);
    inj.get("wrapperSaveService").save([report]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}
function synthesizeComponentScript(args) {
  const w = window;
  const fail = (error) => ({ ok: false, componentId: null, defaults: { dims: null, metrics: null, time: null, geo: null }, error });
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const reg = inj.get("legoMainRegistry");
    const obj = reg.getDisplayTypeObj(args.type);
    if (!obj) return fail(`Tipo "${args.type}" no registrado en este editor.`);
    const page = args.pageId ? report.pages.find((p) => String(p.getId()) === String(args.pageId)) : report.pages.find((pg) => String(pg.getId()) === ((location.pathname.match(/\/page\/([^/]+)/) || [])[1] ?? "")) || report.pages[report.selected] || report.pages[0];
    if (!page) return fail("Pagina no encontrada.");
    const all = [...report.pages.flatMap((p) => p.components)];
    const base = all.find((c) => c.config.config.display.type === "simple-table") || all.find((c) => c.config.config.datasource && c.config.config.datasource.keys && c.config.config.datasource.keys.metrics);
    if (!base) return fail("No hay un componente con datos que clonar.");
    const cfg = base.duplicateConfig();
    cfg.config.display = { keys: {}, type: args.type, preset: "default" };
    Object.assign(cfg.attribute, { left: Math.round(args.box.x), top: Math.round(args.box.y), width: Math.round(args.box.width), height: Math.round(args.box.height) });
    if (cfg.attribute) delete cfg.attribute.alias;
    const comp = page.addComponent(cfg);
    const call = (f) => {
      try {
        return typeof obj[f] === "function" ? obj[f]() : null;
      } catch {
        return null;
      }
    };
    let fieldConfigs = [];
    try {
      fieldConfigs = (obj.getDataFieldConfigs() || []).map((f) => ({
        id: String(f.id),
        slot: String(f.options && f.options.conceptKey || "primary"),
        kind: f.type === 1 ? "dimension" : "metric",
        min: Number((f.options && f.options.min) ?? 0),
        count: Number((f.options && (f.options.defaultFieldCount ?? f.options.min)) ?? 0),
        ...f.options && f.options.supportedTypes ? { supportedTypes: f.options.supportedTypes } : {}
      }));
    } catch {
    }
    return {
      ok: true,
      fieldConfigs,
      componentId: String(comp.getId()),
      defaults: { dims: call("getDefaultNumOfDimensions"), metrics: call("getDefaultNumOfMetrics"), time: call("getUseTimeAsDefault"), geo: call("getUseGeoAsDefault") }
    };
  } catch (e) {
    return fail(String(e && e.message));
  }
}
function uxFactsScript() {
  const w = window;
  const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  const keys = report.config.config.display.keys || {};
  const themeConfig = keys.themeConfig ? String(keys.themeConfig.value) : null;
  const list = report.config.resource && report.config.resource.theme || [];
  const hit = list.find((t) => t.id === themeConfig);
  const THEME = /color|fontfamily|background|border|shadow|opacity/i;
  const components = report.pages.flatMap(
    (p) => p.components.map((c) => {
      const dk = c.config.config.display.keys || {};
      const overrides = {};
      for (const [k, v] of Object.entries(dk)) {
        const val = v && v.value;
        if (THEME.test(k) && val !== void 0 && val !== null && !(Array.isArray(val) && val.every((x) => x === null || x === void 0))) overrides[k] = val;
      }
      const type = String(c.config.config.display.type);
      let chart;
      if (/barchart|linechart|combochart|areachart/.test(type)) {
        const ds = c.config.config.datasource && c.config.config.datasource.keys || {};
        const prim = (k) => ds[k] && ds[k].value && ds[k].value.primary || [];
        const metrics = prim("metrics").length;
        const dimVal = ds.dimensions && ds.dimensions.value || {};
        const breakdown = Array.isArray(dimVal.breakdown) && dimVal.breakdown.length > 0 || Object.keys(ds).some((k) => /breakdown/i.test(k) && prim(k).length > 0);
        const eff = (k) => {
          try {
            return c.getDisplayKeyValue(k);
          } catch {
            return dk[k] ? dk[k].value : void 0;
          }
        };
        const arr = (k) => {
          const v = eff(k);
          return (Array.isArray(v) ? v : []).slice(0, metrics);
        };
        const combo = /combochart/.test(type);
        const axes = Array.from({ length: metrics }, (_, i) => {
          const v = arr("seriesAxisIndex")[i];
          return v === null || v === void 0 ? combo && i > 0 ? 1 : 0 : v;
        });
        const sl = eff("showLegend");
        chart = {
          metrics,
          breakdown,
          rightAxis: metrics > 1 && axes.some((x) => x === 1) && axes.some((x) => x === 0),
          showLegend: typeof sl === "boolean" ? sl : null,
          lineLabels: /linechart/.test(type) && (arr("seriesShowDataLabel").some((x) => x === true) || eff("showDataLabel") === true),
          titled: eff("chartTitleShowTitle") === true
        };
      }
      return { id: String(c.getId()), type, page: String(p.getId()), overrides, ...chart ? { chart } : {} };
    })
  );
  const pages = report.pages.map((p) => ({
    id: String(p.getId()),
    name: String(p.config.attribute && p.config.attribute.name || ""),
    background: ((p.config.config.display.keys || {}).background || {}).value ?? null
  }));
  return { theme: hit ? JSON.parse(JSON.stringify(hit.content, (k, v) => k === "$$hashKey" ? void 0 : v)) : null, themeConfig, components, pages };
}
function setThemePresetScript(presetId) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    report.setDisplayKeyValue("themeConfig", presetId);
    inj.get("wrapperSaveService").save([report]);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}
function listFiltersScript() {
  const w = window;
  const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
  const res = report.config.resource && report.config.resource.filter || {};
  const usedBy = {};
  const note = (owner, keys) => {
    const v = keys && keys.filters && keys.filters.value;
    if (Array.isArray(v)) for (const id of v) (usedBy[id] = usedBy[id] || []).push(owner);
  };
  for (const p of report.pages) {
    note(`page:${p.getId()}`, p.config.config.datasource && p.config.config.datasource.keys);
    for (const c of p.components) note(`component:${c.getId()}`, c.config.config.datasource && c.config.config.datasource.keys);
  }
  return Object.entries(res).map(([id, f]) => {
    const ex = f.filterDefinition && f.filterDefinition.filterExpression;
    return {
      id,
      name: String(f.name || ""),
      datasourceId: String(f.datasourceId || ""),
      field: ex && ex.queryTimeTransformation ? ex.queryTimeTransformation.dataTransformation.sourceFieldName : null,
      condition: ex ? ex.filterConditionType : null,
      include: ex ? !!ex.include : null,
      values: ex ? [...ex.stringValues || [], ...ex.numberValues || []] : [],
      usedBy: usedBy[id] || []
    };
  });
}
function addFilterScript(args) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const all = report.pages.flatMap((p) => p.components);
    const comp = all.find((c) => {
      try {
        return String(c.getDataSourceId()) === args.datasetId;
      } catch {
        return false;
      }
    });
    let concepts = {};
    try {
      concepts = comp && comp.getSchema().qe.concepts || report.getDatasourceSchema(args.datasetId).qe.concepts || {};
    } catch {
    }
    const list = Object.values(concepts);
    const f = concepts[args.field] || list.find((x) => String(x.displayName).toLowerCase() === args.field.toLowerCase());
    if (!f) return { ok: false, filterId: null, error: `Campo "${args.field}" no existe en el origen ${args.datasetId}.` };
    const qt = "qt_" + Math.random().toString(36).slice(2, 12).padEnd(10, "0");
    const nums = args.values.filter((v) => typeof v === "number");
    const strs = args.values.filter((v) => typeof v !== "number").map(String);
    const before = new Set(Object.keys(report.config.resource && report.config.resource.filter || {}));
    report.addResource("filter", {
      name: args.name,
      datasourceId: args.datasetId,
      filterDefinition: {
        filterExpression: {
          include: args.include,
          conceptType: 0,
          concept: { ns: "t0", name: qt },
          filterConditionType: args.condition,
          stringValues: strs,
          numberValues: nums,
          queryTimeTransformation: { dataTransformation: { sourceFieldName: String(f.name) } }
        }
      },
      version: 3
    });
    const id = Object.keys(report.config.resource.filter).find((k) => !before.has(k)) || null;
    inj.get("wrapperSaveService").save([report]);
    return { ok: !!id, filterId: id };
  } catch (e) {
    return { ok: false, filterId: null, error: String(e && e.message) };
  }
}
function updateFilterScript(args) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const res = report.config.resource && report.config.resource.filter || {};
    const cur = res[args.filterId];
    if (!cur) return { ok: false, error: `Filtro ${args.filterId} no encontrado (ids en list_filters).` };
    const copy = JSON.parse(JSON.stringify(cur));
    const ex = copy.filterDefinition && copy.filterDefinition.filterExpression;
    if (!ex) return { ok: false, error: "El filtro no tiene una condicion simple (filtro con varias clausulas): editalo a mano." };
    if (args.name !== void 0) copy.name = args.name;
    if (args.condition !== void 0) ex.filterConditionType = args.condition;
    if (args.include !== void 0) ex.include = args.include;
    if (args.values !== void 0) {
      ex.numberValues = args.values.filter((v) => typeof v === "number");
      ex.stringValues = args.values.filter((v) => typeof v !== "number").map(String);
    }
    report.updateResourceById("filter", args.filterId, copy);
    inj.get("wrapperSaveService").save([report]);
    const now = report.config.resource.filter[args.filterId];
    const e2 = now.filterDefinition.filterExpression;
    return { ok: true, filter: { name: String(now.name), condition: String(e2.filterConditionType), include: !!e2.include, values: [...e2.stringValues || [], ...e2.numberValues || []] } };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}
function attachFilterScript(args) {
  const w = window;
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const page = report.pages.find((p) => String(p.getId()) === args.target);
    const comp = page ? null : report.pages.flatMap((p) => p.components).find((c) => c.getId() === args.target);
    const owner = page || comp;
    if (!owner) return { ok: false, filters: [], error: `Destino ${args.target} no encontrado (id de pagina o componente).` };
    const keys = owner.config.config.datasource.keys;
    const cur = (keys.filters && Array.isArray(keys.filters.value) ? keys.filters.value : []).slice();
    const next = args.detach ? cur.filter((x) => x !== args.filterId) : cur.includes(args.filterId) ? cur : [...cur, args.filterId];
    if (typeof owner.setDataSourceKeyValue === "function") owner.setDataSourceKeyValue("filters", next, true, true);
    else keys.filters = { stateKey: "filters", dominant: 3, value: next };
    try {
      if (owner.syncState) owner.syncState(true);
    } catch {
    }
    inj.get("wrapperSaveService").save([owner]);
    return { ok: true, filters: next };
  } catch (e) {
    return { ok: false, filters: [], error: String(e && e.message) };
  }
}
function probeStartScript(args) {
  const w = window;
  const datasetId = args.datasetId;
  try {
    const report = w.angular.element(document.body).injector().get("legoUndoRedoService").report;
    const page = report.pages[0];
    const all = report.pages.flatMap((p) => p.components);
    const base = all.find((c) => c.config.config.display.type === "kpi-metric") || all.find((c) => c.config.config.datasource && c.config.config.datasource.keys);
    if (!base && !args.template) return { ok: false, error: "Sin componentes para clonar ni plantilla kpi-metric." };
    const cfg = base ? base.duplicateConfig() : JSON.parse(JSON.stringify(args.template));
    if (!base) {
      cfg.id = "cd-probe" + Math.random().toString(36).slice(2, 10);
      const k = cfg.config.datasource.keys;
      for (const n of ["dimensions", "metrics", "sortData", "filters"]) if (k[n]) delete k[n].value;
      cfg.conceptDefs = {};
    }
    cfg.config.datasource.keys.dataset = { stateKey: "ds", dominant: 2, value: { id: datasetId } };
    Object.assign(cfg.attribute, { left: 0, top: 0, width: 10, height: 10 });
    const tmp = page.addComponent(cfg);
    try {
      tmp.syncState(true);
    } catch {
    }
    w.__mcpProbe = { page, tmp };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e && e.message) };
  }
}
function probeReadScript(finish) {
  const w = window;
  const pr = w.__mcpProbe;
  if (!pr) return { ready: true, fields: [] };
  let concepts = {};
  try {
    concepts = pr.tmp.getSchema()?.qe?.concepts || {};
  } catch {
  }
  const ready = Object.keys(concepts).length > 0;
  if (ready || finish) {
    try {
      pr.page.removeComponent(pr.tmp);
    } catch {
    }
    w.__mcpProbe = null;
  }
  return { ready, fields: Object.values(concepts).map((f) => ({ id: String(f.name), name: String(f.displayName ?? f.name), type: Number(f.type), dataType: Number(f.dataType) })) };
}
function reportSettingsScript(patch) {
  const w = window;
  const keys = ["viewModeNav", "viewModeHeader", "viewModeScale", "viewModeMargin", "viewModeMaxWidth", "crossFilterByDefault", "snapMode", "showNavigationInEditMode", "showNavigationInEmbeddingMode", "width", "height"];
  try {
    const inj = w.angular.element(document.body).injector();
    const report = inj.get("legoUndoRedoService").report;
    const a = report.config.attribute;
    const read = () => ({
      viewerFilterBar: !!(a.viewerFilterBarConfig && a.viewerFilterBarConfig.orientation),
      ...Object.fromEntries(keys.map((k) => [k, a[k]]))
    });
    const changed = [];
    if (patch) {
      for (const [k, v] of Object.entries(patch)) {
        if (k === "viewerFilterBar") {
          a.viewerFilterBarConfig = { ...a.viewerFilterBarConfig || {}, orientation: v ? 1 : 0 };
          changed.push(k);
        } else if (keys.includes(k)) {
          a[k] = v;
          changed.push(k);
        } else {
          return { ok: false, settings: read(), changed, error: `Ajuste no soportado: ${k}. Validos: viewerFilterBar, ${keys.join(", ")}` };
        }
      }
      if (changed.length) inj.get("wrapperSaveService").save([report]);
    }
    return { ok: true, settings: read(), changed };
  } catch (e) {
    return { ok: false, settings: {}, changed: [], error: String(e && e.message) };
  }
}

// src/ops.ts
import { existsSync as existsSync4, mkdirSync as mkdirSync2, readFileSync as readFileSync4, writeFileSync as writeFileSync3 } from "node:fs";
import { join as join4 } from "node:path";

// src/spec.ts
import { readFileSync as readFileSync3 } from "node:fs";
var KNOWN_TYPES = [
  "simple-linechart",
  "simple-barchart",
  "simple-histogram",
  "simple-combochart",
  "simple-piechart",
  "simple-table",
  "google-map",
  "simple-geomap",
  "kpi-metric",
  "simple-scatterchart",
  "bulletchart",
  "simple-areachart",
  "pivot-table",
  "simple-treemap",
  "gauge-viz",
  "simple-sankey",
  "simple-waterfall",
  "simple-timeline",
  "simple-funnel",
  "third-party-viz",
  "framed-external-content",
  "notebook-data-app",
  "simple-description",
  "image-component",
  "arrow",
  "placeholder",
  "shape",
  "ellipse",
  "generic-shape",
  "filter-bar",
  "metric-filter",
  "advanced-filter",
  "simple-daterangepicker",
  "dimension-filter",
  "dataset-picker",
  "dimension-control",
  "button"
];
var NON_DATA = /* @__PURE__ */ new Set(["simple-description", "image-component", "arrow", "placeholder", "shape", "ellipse", "generic-shape", "framed-external-content", "button"]);
function loadSpec(file) {
  const spec = JSON.parse(readFileSync3(file, "utf8"));
  if (!spec || !Array.isArray(spec.pages)) throw new Error(`${file}: falta "pages" (array).`);
  return spec;
}
function resolveSpec(spec) {
  const grid = spec.grid ?? 10;
  const W = spec.canvasWidth ?? 1200;
  const floorGrid = (v) => Math.floor(v / grid) * grid;
  const out = [];
  for (const p of spec.pages) {
    const page = p.page ?? (p.name ? `name:${p.name}` : "active");
    for (const c of p.components) {
      if ("row" in c) {
        const { y, h } = c.row;
        const margin = c.row.margin ?? 20;
        const gap = c.row.gap ?? 20;
        const x0 = c.row.x ?? margin;
        const width = c.row.width ?? W - x0 - margin;
        const n = c.items.length;
        const w = floorGrid((width - (n - 1) * gap) / n);
        c.items.forEach((it, i) => {
          out.push({
            key: it.key,
            type: it.type,
            id: it.id,
            x: x0 + i * (w + gap),
            y,
            w,
            h,
            padding: it.padding ?? spec.defaults?.padding,
            dataset: it.dataset ?? (NON_DATA.has(it.type) && !it.dimensions?.length ? void 0 : spec.defaults?.dataset),
            dimensions: it.dimensions ?? [],
            metrics: it.metrics ?? [],
            page,
            ...it.dateRangeDays !== void 0 ? { dateRangeDays: it.dateRangeDays } : {},
            ...it.stripStyles ? { stripStyles: true } : {},
            ...it.filters ? { filters: it.filters } : {},
            ...it.variant ? { variant: it.variant } : {},
            ...it.slots ? { slots: it.slots } : {},
            ...it.text !== void 0 ? { text: it.text } : {},
            ...it.parameter ? { parameter: it.parameter } : {},
            ...it.style ? { style: it.style } : {},
            ...it.conditional ? { conditional: it.conditional } : {},
            ...it.chartStyle ? { chartStyle: it.chartStyle } : {},
            ...it.comparison ? { comparison: it.comparison } : {},
            ...it.dateField ? { dateField: it.dateField } : {},
            ...it.linkPage ? { linkPage: it.linkPage } : {},
            ...it.interactions ? { interactions: it.interactions } : {},
            ...it.image ? { image: it.image } : {},
            ...it.reportLevel ? { reportLevel: true } : {},
            ...it.card ? { card: it.card } : {}
          });
        });
      } else {
        out.push({
          key: c.key,
          type: c.type,
          id: c.id,
          x: c.x ?? 0,
          y: c.y ?? 0,
          w: c.w ?? 400,
          h: c.h ?? 300,
          padding: c.padding ?? spec.defaults?.padding,
          dataset: c.dataset ?? (NON_DATA.has(c.type) && !c.dimensions?.length ? void 0 : spec.defaults?.dataset),
          dimensions: c.dimensions ?? [],
          metrics: c.metrics ?? [],
          page,
          ...c.dateRangeDays !== void 0 ? { dateRangeDays: c.dateRangeDays } : {},
          ...c.stripStyles ? { stripStyles: true } : {},
          ...c.filters ? { filters: c.filters } : {},
          ...c.variant ? { variant: c.variant } : {},
          ...c.slots ? { slots: c.slots } : {},
          ...c.text !== void 0 ? { text: c.text } : {},
          ...c.parameter ? { parameter: c.parameter } : {},
          ...c.style ? { style: c.style } : {},
          ...c.conditional ? { conditional: c.conditional } : {},
          ...c.chartStyle ? { chartStyle: c.chartStyle } : {},
          ...c.comparison ? { comparison: c.comparison } : {},
          ...c.dateField ? { dateField: c.dateField } : {},
          ...c.linkPage ? { linkPage: c.linkPage } : {},
          ...c.interactions ? { interactions: c.interactions } : {},
          ...c.image ? { image: c.image } : {},
          ...c.reportLevel ? { reportLevel: true } : {},
          ...c.card ? { card: c.card } : {}
        });
      }
    }
  }
  return expandCards(out);
}
function expandCards(list) {
  const out = [];
  for (const c of list) {
    if (!c.card) {
      out.push(c);
      continue;
    }
    const k = c.card;
    const inset = k.inset ?? 10;
    const radius = k.radius ?? 12;
    const shared = { page: c.page, dimensions: [], metrics: [], ...c.reportLevel ? { reportLevel: true } : {} };
    out.push({
      key: `${c.key}__card`,
      type: "generic-shape",
      ...k.id ? { id: k.id } : {},
      x: c.x,
      y: c.y,
      w: c.w,
      h: c.h,
      ...shared,
      style: { background: { color: k.background ?? "#FFFFFF", opacity: 1 }, border: { color: "#FFFFFF", opacity: 0, size: 0, style: "solid", radius } }
    });
    const clear = { background: { color: "#FFFFFF", opacity: 0 }, border: { color: "#FFFFFF", opacity: 0, size: 0, style: "solid", radius: 0 } };
    if (c.type === "kpi-metric" && k.icon) {
      const tile = Math.min(64, c.h - 2 * 20);
      const ty = c.y + Math.round((c.h - tile) / 2);
      out.push({
        key: `${c.key}__tile`,
        type: "generic-shape",
        x: c.x + 20,
        y: ty,
        w: tile,
        h: tile,
        ...shared,
        style: { background: { color: k.iconBackground ?? "#1A73E8", opacity: 1 }, border: { color: "#FFFFFF", opacity: 0, size: 0, style: "solid", radius: Math.round(tile / 4) } }
      });
      const ic = Math.round(tile / 2);
      out.push({ key: `${c.key}__icon`, type: "image-component", x: c.x + 20 + (tile - ic) / 2, y: ty + (tile - ic) / 2, w: ic, h: ic, ...shared, image: k.icon });
      const left = 20 + tile + 10;
      out.push({ ...c, x: c.x + left, y: c.y + inset, w: c.w - left - inset, h: c.h - 2 * inset, style: { ...clear, fontSize: "24px", ...c.style ?? {} } });
      continue;
    }
    const titleH = 0;
    out.push({
      ...c,
      x: c.x + inset,
      y: c.y + inset + titleH,
      w: c.w - 2 * inset,
      h: c.h - 2 * inset - titleH,
      style: {
        ...clear,
        ...k.title ? { chartTitleShowTitle: true, chartTitleText: k.title, chartTitleFontSize: 15, chartTitleBold: true } : {},
        ...c.style ?? {}
      }
    });
  }
  return out;
}
function lintSpec(spec) {
  const grid = spec.grid ?? 10;
  const W = spec.canvasWidth ?? 1200;
  const H = spec.canvasHeight ?? 1e4;
  const comps = resolveSpec(spec);
  const issues = [];
  const push = (severity, key, rule, message) => issues.push({ severity, key, rule, message });
  const keys = /* @__PURE__ */ new Set();
  for (const c of comps) {
    if (!c.key) push("error", null, "key", 'Cada componente necesita "key" (identificador estable del spec).');
    if (keys.has(c.key)) push("error", c.key, "key", `Clave duplicada "${c.key}".`);
    keys.add(c.key);
    if (!KNOWN_TYPES.includes(c.type)) push("error", c.key, "type", `Tipo desconocido "${c.type}".`);
    if (!c.key.includes("__") && !c.card && [c.x, c.y, c.w, c.h].some((v) => v % grid !== 0))
      push("warning", c.key, "grid", `x/y/w/h (${c.x},${c.y},${c.w},${c.h}) no son multiplos de la reticula ${grid}px [diseno-layout \xA73].`);
    if (c.x < 0 || c.y < 0 || c.x + c.w > W || c.y + c.h > H)
      push("error", c.key, "canvas", `Se sale del lienzo ${W}x${H} [diseno-layout \xA72].`);
    if (c.x < 20 || W - (c.x + c.w) < 20) push("info", c.key, "margin", "Margen exterior < 20 px [diseno-layout \xA73].");
    if (c.padding !== void 0 && (c.padding < 10 || c.padding > 16))
      push("info", c.key, "padding", `Padding ${c.padding}px fuera de 10\u201316 px [diseno-layout \xA73].`);
    if (c.type === "kpi-metric") {
      if (c.metrics.length !== 1 && !c.slots && !(c.id && !c.metrics.length)) push("warning", c.key, "kpi", "Un scorecard debe tener exactamente 1 metrica [kpi-scorecards].");
      if (c.h < 100 || c.h > 140) push("info", c.key, "kpi", `Alto de scorecard ${c.h}px fuera de 100\u2013140 [kpi-scorecards \xA71].`);
    }
    if (c.type.startsWith("pivot-table") && !c.id && c.dimensions.length + Object.values(c.slots ?? {}).flat().length < 2)
      push("error", c.key, "pivot", 'Una tabla dinamica necesita una dimension de filas y otra de columnas (con una sola da "Combinacion no valida", reason 9). Con una dimension, usa simple-table (admite formato condicional y mapa de calor).');
    if (c.type === "simple-daterangepicker" && c.dateRangeDays === void 0)
      push("info", c.key, "date-range", "Control de periodo sin dateRangeDays: heredara el periodo por defecto (p. ej. ultimos 28 dias) y puede dejar la pagina sin datos.");
    if (!NON_DATA.has(c.type) && !["filter-bar", "simple-daterangepicker"].includes(c.type) && !c.dataset)
      push("warning", c.key, "dataset", "Sin dataset: se usara el del componente clonado o el del informe.");
  }
  const byPage = /* @__PURE__ */ new Map();
  for (const c of comps) byPage.set(c.page, [...byPage.get(c.page) ?? [], c]);
  for (const [page, list] of byPage) {
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        const inside = (p, q) => q.x >= p.x && q.y >= p.y && q.x + q.w <= p.x + p.w && q.y + q.h <= p.y + p.h;
        if (NON_DATA.has(a.type) && inside(a, b) || NON_DATA.has(b.type) && inside(b, a)) continue;
        if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h)
          push("warning", a.key, "overlap", `Se solapa con "${b.key}" en la pagina ${page}.`);
      }
    const data = list.filter((c) => !NON_DATA.has(c.type)).length;
    if (data > 25) push("error", null, "density", `Pagina ${page}: ${data} componentes con datos (>25) [rendimiento].`);
    else if (data > 15) push("warning", null, "density", `Pagina ${page}: ${data} componentes con datos (>15) [rendimiento].`);
    const kpis = list.filter((c) => c.type === "kpi-metric");
    const rows = /* @__PURE__ */ new Map();
    for (const k of kpis) rows.set(k.y, [...rows.get(k.y) ?? [], k]);
    for (const [y, row] of rows) {
      if (row.length > 1 && (row.length < 4 || row.length > 6))
        push("info", null, "kpi-row", `Fila de KPIs en y=${y} con ${row.length} tarjetas (recomendado 4\u20136) [kpi-scorecards \xA71].`);
      if (new Set(row.map((r) => r.h)).size > 1) push("warning", null, "kpi-row", `Fila y=${y}: alturas distintas [kpi-scorecards \xA71].`);
      const sorted = [...row].sort((a, b) => a.x - b.x);
      const gaps = sorted.slice(1).map((r, i) => r.x - (sorted[i].x + sorted[i].w));
      if (gaps.length && Math.max(...gaps) - Math.min(...gaps) > 2) push("warning", null, "kpi-row", `Fila y=${y}: separaciones irregulares (${gaps.join(", ")}) [diseno-layout \xA73].`);
    }
  }
  return { issues, components: comps };
}

// src/ops.ts
var T = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15e3);
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
seedKnowledge();
var NET_RE = /\/(updatePage|updateReport|batchedDataV2|createReport|deletePage)\b/;
var netLogs = /* @__PURE__ */ new WeakMap();
function trackNet(page) {
  trackSaves(page);
  if (netLogs.has(page)) return;
  const log2 = [];
  netLogs.set(page, log2);
  page.on("response", (r) => {
    const u = r.url();
    if (!NET_RE.test(u)) return;
    log2.push({ path: new URL(u).pathname, status: r.status(), t: Date.now() });
    if (log2.length > 200) log2.splice(0, log2.length - 200);
  });
}
function netSince(page, t0) {
  return (netLogs.get(page) ?? []).filter((e) => e.t >= t0);
}
var SAVE_RE = /\/(updatePage|updateReport|createPages|deletePages|updateReportNavigationInfo)\b/;
var saveState = /* @__PURE__ */ new WeakMap();
function trackSaves(page) {
  let s = saveState.get(page);
  if (s) return s;
  const st = { inflight: 0, last: 0 };
  saveState.set(page, st);
  page.on("request", (r) => {
    if (SAVE_RE.test(r.url())) {
      st.inflight++;
      st.last = Date.now();
    }
  });
  const done = (r) => {
    if (SAVE_RE.test(r.url())) {
      st.inflight = Math.max(0, st.inflight - 1);
      st.last = Date.now();
    }
  };
  page.on("requestfinished", done);
  page.on("requestfailed", done);
  return st;
}
async function settleSaves(page, quietMs = 2500, timeoutMs = 2e4) {
  const st = trackSaves(page);
  const t0 = Date.now();
  const since = Math.max(st.last, t0);
  while (Date.now() - t0 < timeoutMs) {
    if (st.inflight === 0 && Date.now() - Math.max(st.last, since) >= quietMs) return;
    await sleep(200);
  }
}
async function waitReady(page, timeoutMs = 45e3) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const s = await evaluateOn(page, 5e3, readyStateScript).catch(() => null);
    if (s?.ready) {
      trackNet(page);
      await evaluateOn(page, 5e3, installNetMonitorScript).catch(() => void 0);
      return;
    }
    await sleep(500);
  }
  throw new Error("El editor no termino de cargar (legoUndoRedoService sin paginas).");
}
async function openReport(url) {
  const browser = await getBrowser();
  const tabs = (await Promise.all(browser.targets().filter((t) => t.type() === "page" && REPORT_URL_RE.test(t.url())).map((t) => t.page()))).filter((p) => !!p);
  const id = (/reporting\/([^/?#]+)/.exec(url) || [])[1];
  let page = id ? tabs.find((p) => p.url().includes(`/reporting/${id}`)) : void 0;
  if (!page && tabs.length) page = await getReportPage().catch(() => void 0) ?? tabs[0];
  const target = !!page;
  if (!page) page = await browser.newPage();
  setActiveReport(url);
  if (target) await settleSaves(page, 1500);
  await page.bringToFront();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 9e4 });
  await waitReady(page);
  return { url: page.url() };
}
function reportId(urlOrId) {
  const m = urlOrId.match(/reporting\/([A-Za-z0-9_-]+)/);
  const id = m ? m[1] : urlOrId.trim();
  if (!/^[A-Za-z0-9_-]{10,}$/.test(id)) throw new Error(`No es un id de informe: ${urlOrId}`);
  return id;
}
async function copyReport(source, name) {
  const sourceId = reportId(source);
  const copyName = name?.trim() || `Copia de ${sourceId} ${(/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace("T", " ")}`;
  const url = `https://datastudio.google.com/reporting/create?c.reportId=${encodeURIComponent(sourceId)}&r.reportName=${encodeURIComponent(copyName)}`;
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.bringToFront();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 9e4 });
  const click = (pattern, scope) => page.waitForFunction(
    (p, s) => {
      const re = new RegExp(p, "i");
      const b = [...document.querySelectorAll(s)].find((x) => re.test(x.innerText.trim()) && !x.disabled);
      if (!b) return false;
      b.click();
      return true;
    },
    { timeout: 45e3, polling: 500 },
    pattern,
    scope
  );
  try {
    await click("^(Editar y compartir|Edit and share)$", "button");
    await Promise.race([
      click("^(Confirmar y guardar|Acknowledge and save|Confirm and save)$", "[role=dialog] button, mat-dialog-container button"),
      page.waitForFunction(() => /\/reporting\/[^/]+\/page\//.test(location.href), { timeout: 45e3 })
    ]);
    await page.waitForFunction(() => /\/reporting\/[^/]+\/page\/[^/]+\/edit/.test(location.href), { timeout: 6e4, polling: 500 });
  } catch (e) {
    const shown = await page.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => "");
    throw new Error(`No se pudo copiar el informe ${sourceId} (${e.message}). La pagina muestra: ${shown}`);
  }
  await waitReady(page);
  const id = reportId(page.url());
  setActiveReport(id);
  if (id === sourceId) throw new Error("La URL final es la del original, no la de una copia.");
  learn("note", "report_copy", { text: "Linking API /reporting/create?c.reportId= -> Editar y compartir -> Confirmar y guardar" });
  return { sourceId, id, url: page.url(), name: copyName };
}
async function reloadReport() {
  const page = await getReportPage();
  await settleSaves(page);
  await page.bringToFront();
  await page.reload({ waitUntil: "networkidle2", timeout: 9e4 });
  await waitReady(page);
  const s = await evaluateOn(page, T, readyStateScript);
  return { url: s.url, components: s.components };
}
async function editPage() {
  const { page } = await requireEditMode();
  trackNet(page);
  await evaluateOn(page, 5e3, installNetMonitorScript).catch(() => void 0);
  return page;
}
async function exportReport(file) {
  const page = await getReportPage();
  const res = await evaluateOn(page, T, exportReportScript);
  for (const t of res.types) learn("display_type", t, { seenIn: res.reportId });
  const learned = await captureTemplatesOn(page);
  if (file) writeFileSync3(file, JSON.stringify(res, null, 2));
  return { ...res, learnedTemplates: learned, ...file ? { file } : {} };
}
async function captureTemplatesOn(page) {
  const cap = await evaluateOn(page, T, captureTemplatesScript);
  for (const t of cap.registeredTypes) learn("display_type", t, { registered: true });
  const learned = [];
  for (const [type, tpl] of Object.entries(cap.templates)) {
    if (saveTemplate(type, tpl.config, { url: cap.url.split("?")[0], fromComponent: tpl.fromComponent, dataSourceId: tpl.dataSourceId }))
      learned.push(type);
  }
  return learned;
}
async function captureTemplates() {
  const page = await getReportPage();
  const learned = await captureTemplatesOn(page);
  const s = summary();
  return { learned, known: s.templates, registeredTypes: s.displayTypes.length };
}
async function diagnoseWithKnowledge() {
  const page = await getReportPage();
  const res = await evaluateOn(page, T, diagnoseReportScript);
  const issues = res.issues.map((i) => {
    const m = i.message.match(/reason (\d+)\):\s*([^|]*)\|?\s*([^|]*)/);
    if (m) learn("error_reason", m[1], { title: m[2].trim(), description: m[3].trim() });
    const fix = (m && knownFix(`reason:${m[1]}`)) ?? knownFix(i.code);
    return fix ? { ...i, fix } : i;
  });
  return { ...res, issues };
}
async function resolveDataset(page, sel) {
  if (!sel) {
    const ds0 = await evaluateOn(page, T, readDataSourcesScript).catch(() => null);
    const list0 = ds0 ? Array.isArray(ds0.dataSources) ? ds0.dataSources : Object.values(ds0.dataSources) : [];
    return list0.length === 1 ? list0[0].dataSourceId : void 0;
  }
  if (!sel.startsWith("@")) return sel;
  const field = sel.slice(1).toLowerCase();
  const ds = await evaluateOn(page, T, readDataSourcesScript);
  let hit = ds.dataSources.find((d) => d.fields.some((f) => f.id.toLowerCase() === field || f.name.toLowerCase() === field));
  if (!hit) {
    const { schemaFieldsScript } = await import("./scripts4-ADA4C2PA.js");
    for (const d of ds.dataSources.filter((x) => !x.fields.length)) {
      const fs4 = await evaluateOn(page, T, schemaFieldsScript, d.dataSourceId).catch(() => []);
      if (fs4.some((f) => f.id.toLowerCase() === field || f.name.toLowerCase() === field)) return d.dataSourceId;
    }
  }
  if (!hit) {
    for (const d of ds.dataSources.filter((x) => !x.fields.length)) {
      const st = await evaluateOn(page, T, probeStartScript, { datasetId: d.dataSourceId, template: getTemplate("kpi-metric") });
      if (!st.ok) continue;
      let pr = { ready: false, fields: [] };
      for (let i = 0; i < 24 && !pr.ready; i++) {
        await sleep(250);
        pr = await evaluateOn(page, T, probeReadScript, i === 23);
      }
      if (pr.ready) learn("note", `dataset_fields:${d.dataSourceId}`, { text: pr.fields.map((f) => f.name).join(",") });
      if (pr.fields.some((f) => f.id.toLowerCase() === field || f.name.toLowerCase() === field)) return d.dataSourceId;
    }
  }
  if (!hit) throw new Error(`Ningun origen del informe tiene el campo "${sel.slice(1)}". Anade el origen o revisa el nombre.`);
  return hit.dataSourceId;
}
async function createComponent(o) {
  if (o.type.startsWith("pivot-table") && (o.dimensions?.length || o.metrics?.length)) {
    const nDims = (o.dimensions?.length ?? 0) + Object.values(o.slots ?? {}).flat().length;
    if (nDims < 2) throw new Error('Una tabla dinamica necesita una dimension de filas y otra de columnas (con una sola da "Combinacion no valida", reason 9). Con una dimension, usa simple-table: admite formato condicional y mapa de calor.');
  }
  const page = await editPage();
  const datasetId = await resolveDataset(page, o.dataset);
  const hasFields = !!(o.dimensions?.length || o.metrics?.length || o.slots && Object.keys(o.slots).length);
  const NO_DIMS = ["gauge-viz", "bulletchart", "kpi-metric"];
  const t0 = Date.now();
  const { ensureSeedScript } = await import("./scripts4-ADA4C2PA.js");
  const seed = await evaluateOn(page, T, ensureSeedScript, o.pageId);
  if (seed.seedId) await sleep(1500);
  const res = await evaluateOn(page, T, createComponentScript, {
    type: o.type,
    box: o.box,
    ...o.pageId ? { pageId: o.pageId } : {},
    ...datasetId ? { datasetId } : {},
    ...o.padding !== void 0 ? { padding: o.padding } : {},
    template: o.variant && getTemplate(`${o.type}@${o.variant}`) || getTemplate(o.type),
    ...o.variant ? { preferTemplate: true } : {},
    deferSave: hasFields
  });
  if (seed.seedId) await deleteComponent(seed.seedId).catch(() => void 0);
  if (!res.ok) {
    learn("create_fail", o.type, { error: res.error });
    throw new Error(res.error);
  }
  let bound;
  if (hasFields) {
    bound = await evaluateOn(page, T + 1e4, bindFieldsScript, {
      componentId: res.componentId,
      dimensions: o.dimensions ?? [],
      metrics: o.metrics ?? [],
      ...NO_DIMS.includes(o.type) && !o.dimensions?.length ? { clearDimensions: true } : {},
      ...o.slots ? { slots: o.slots } : {}
    });
  }
  const b = bound;
  if (b && b.ok === false) {
    await deleteComponent(res.componentId).catch(() => void 0);
    learn("create_fail", o.type, { stage: "bind", error: b.error });
    throw new Error(`${o.type}: no se pudieron poner los campos (${b.error}). El componente no se guardo y se quito.`);
  }
  await sleep(2500);
  const saved = () => netSince(page, t0).some((e) => /updatePage/.test(e.path));
  if (!saved()) {
    await revealIfHidden(page).catch(() => void 0);
    for (let i = 0; i < 40 && !saved(); i++) await sleep(250);
  }
  if (!saved()) res.warnings.push("No se vio el guardado (updatePage) en 12 s: si la ventana del navegador esta tapada, el editor lo aplaza. Recarga y comprueba con get_report_layout que el componente sigue; para evitarlo, lanza el navegador con las opciones --disable-* de /setup.");
  const inPage = await evaluateOn(page, 5e3, readNetLogScript, t0).catch(() => []);
  const net = [...netSince(page, t0), ...inPage];
  const rejected = net.filter((e) => /updatePage/.test(e.path) && e.status >= 400);
  if (rejected.length) {
    learn("save_rejected", o.type, { source: res.source, status: rejected[0].status });
    await reloadReport();
    const fix = knownFix("save_rejected:type_change");
    throw new Error(`El servidor rechazo el guardado (updatePage ${rejected[0].status}) del ${o.type} creado desde ${res.source}. Se recargo el informe. ${fix ?? ""}`);
  }
  learn("create_ok", o.type, { source: res.source?.startsWith("clone") ? "clone" : res.source });
  return { ...res, ...bound ? { bound } : {} };
}
async function deleteComponent(componentId) {
  const page = await editPage();
  const { componentLevelScript } = await import("./scripts4-ADA4C2PA.js");
  if (await evaluateOn(page, T, componentLevelScript, componentId) === "report") {
    const { arrangeComponents } = await import("./ops4-5ZDR5WYP.js");
    const { listPages: listPages2 } = await import("./ops3-2TFZGTNO.js");
    await arrangeComponents([componentId], "page", (await listPages2())[0].id);
  }
  const t0 = Date.now();
  const r = await evaluateOn(page, T, deleteComponentScript, componentId);
  if (r.ok) {
    for (let i = 0; i < 24 && !netSince(page, t0).some((e) => /updatePage/.test(e.path)); i++) await sleep(250);
    const saved = netSince(page, t0).filter((e) => /updatePage|updateReport/.test(e.path));
    if (saved.some((e) => e.status >= 400)) {
      learn("save_rejected", "delete", { statuses: saved.map((e) => e.status) });
      throw new Error(`El borrado de ${componentId} fue rechazado (${saved.map((e) => e.status).join(",")}).`);
    }
    learn("note", "delete_method", { text: r.method });
    return { ok: true, method: r.method, ...saved.length ? {} : { warning: "Sin respuesta de guardado en 6 s: verifica con reload si es critico." } };
  }
  if (r.needsKeyboard) {
    learn("method_missing", "page.removeComponent", { fallback: "select+Delete" });
    await page.bringToFront();
    await page.keyboard.press("Delete");
    await sleep(2e3);
    const still = await evaluateOn(page, T, componentExistsScript, componentId);
    if (!still) return { ok: true, method: "select+Delete" };
    throw new Error(`No se pudo borrar ${componentId} (la tecla Supr no tuvo efecto; \xBFel foco esta en el lienzo?).`);
  }
  throw new Error(r.error ?? `No se pudo borrar ${componentId}.`);
}
async function applySpec(specOrFile, opts = {}) {
  const spec = typeof specOrFile === "string" ? loadSpec(specOrFile) : specOrFile;
  const statePath = opts.statePath ?? (typeof specOrFile === "string" ? specOrFile.replace(/\.json$/i, "") + ".state.json" : void 0);
  const { issues, components } = lintSpec(spec);
  const result = { dryRun: !!opts.dryRun, lint: issues, actions: [], ...statePath ? { stateFile: statePath } : {} };
  if (issues.some((i) => i.severity === "error")) {
    result.actions = components.map((c) => ({ key: c.key, action: "skip", error: "lint con errores" }));
    return result;
  }
  const state = statePath && existsSync4(statePath) ? JSON.parse(readFileSync4(statePath, "utf8")) : { reportId: null, keys: {} };
  const page = opts.dryRun ? await getReportPage() : await editPage();
  const { ensureVisible } = await import("./ops4-5ZDR5WYP.js");
  if (!opts.dryRun) await ensureVisible(page);
  const info = await evaluateOn(page, T, pageInfoScript);
  if (state.reportId && state.reportId !== info.internalReportId) {
    log(`El state ${statePath} es de otro informe (${state.reportId}); se ignora el mapeo de ids.`);
    state.keys = {};
  }
  state.reportId = info.internalReportId;
  if (!opts.dryRun) {
    const { tmpdir: tmpdir3 } = await import("node:os");
    const dir = join4(process.env.LS_BACKUP_DIR ?? join4(tmpdir3(), "ls-studio-backups"));
    mkdirSync2(dir, { recursive: true });
    const file = join4(dir, `${info.internalReportId}-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`);
    writeFileSync3(file, JSON.stringify(await evaluateOn(page, T, exportReportScript), null, 2));
    result.backup = file;
  }
  if (spec.theme && !opts.dryRun) result.theme = await applyTheme(spec.theme);
  else if (spec.themePreset && !opts.dryRun) result.theme = await useThemePreset(spec.themePreset);
  if (spec.settings && !opts.dryRun) result.settings = await reportSettings(spec.settings);
  const pageIds = {};
  const wanted = [...new Set(components.map((c) => c.page).filter((p) => p.startsWith("name:")))].map((p) => p.slice(5));
  if (wanted.length) {
    let pages = await listPages();
    result.pages = [];
    for (const name of wanted) {
      let hit = pages.find((p) => p.name === name);
      let created = false;
      const blank = !hit && !opts.dryRun ? pages.find((p) => p.components === 0 && /^((p[aá]gina|page|untitled page|p[aá]gina sin t[ií]tulo)(\s*\d+)?)?$/i.test(String(p.name).trim()) && !wanted.includes(p.name) && !Object.values(pageIds).includes(p.id)) : void 0;
      if (blank) {
        const { renamePage: renamePage2 } = await import("./ops3-2TFZGTNO.js");
        await renamePage2(blank.id, name);
        pages = await listPages();
        hit = pages.find((p) => p.id === blank.id);
        created = true;
      }
      if (!hit && !opts.dryRun) {
        await addPage(name);
        await reloadReport();
        pages = await listPages();
        hit = pages.find((p) => p.name === name);
        created = true;
      }
      if (hit) pageIds[`name:${name}`] = hit.id;
      result.pages.push({ name, pageId: hit?.id ?? "(nueva)", created });
    }
  }
  let prevPage;
  for (const c of components) {
    const pageId = c.page === "active" ? void 0 : c.page.startsWith("name:") ? pageIds[c.page] : c.page;
    if (!opts.dryRun && prevPage !== void 0 && pageId !== prevPage) await settleSaves(page);
    prevPage = pageId;
    if (!opts.dryRun && await page.evaluate(() => document.hidden).catch(() => false)) await ensureVisible(page);
    const existingId = c.id ?? state.keys[c.key];
    const exists = existingId ? await evaluateOn(page, T, componentExistsScript, existingId) : false;
    if (opts.dryRun) {
      result.actions.push({ key: c.key, action: exists ? "update" : "create", ...exists ? { componentId: existingId } : {} });
      continue;
    }
    const once = async () => {
      if (exists) {
        await updateExisting(page, existingId, c);
        state.keys[c.key] = existingId;
        const extra = await patchIfNeeded(page, existingId, c);
        result.actions.push({ key: c.key, action: "update", componentId: existingId, ...extra.length ? { patched: extra } : {} });
      } else if (c.type === "image-component" && c.image) {
        const { addImage } = await import("./ops4-5ZDR5WYP.js");
        const { dirname: dirname5, resolve } = await import("node:path");
        const base = typeof specOrFile === "string" ? dirname5(specOrFile) : process.cwd();
        const r = await addImage({ path: resolve(base, c.image), box: { x: c.x, y: c.y, width: c.w, height: c.h }, ...pageId ? { pageId } : {} });
        state.keys[c.key] = r.componentId;
        const extra = await patchIfNeeded(page, r.componentId, c);
        result.actions.push({ key: c.key, action: "create", componentId: r.componentId, patched: [r.uploaded ? `image:${r.file} (subida)` : `image:${r.file}`, ...extra] });
      } else {
        const r = await createComponent({
          ...c.variant ? { variant: c.variant } : {},
          type: c.type,
          box: { x: c.x, y: c.y, width: c.w, height: c.h },
          ...pageId ? { pageId } : {},
          ...c.dataset ? { dataset: c.dataset } : {},
          dimensions: c.dimensions,
          metrics: c.metrics,
          ...c.padding !== void 0 ? { padding: c.padding } : {},
          ...c.slots ? { slots: c.slots } : {}
        });
        state.keys[c.key] = r.componentId;
        const extra = await patchIfNeeded(page, r.componentId, c);
        result.actions.push({ key: c.key, action: "create", componentId: r.componentId, ...r.warnings.length ? { warnings: r.warnings } : {}, ...extra.length ? { patched: extra } : {} });
      }
    };
    try {
      await once();
    } catch (e) {
      if (/esquema del origen|no devolvio campos/i.test(e.message)) {
        try {
          await ensureVisible(page);
          await sleep(2e3);
          await once();
        } catch (e2) {
          result.actions.push({ key: c.key, action: exists ? "update" : "create", error: e2.message });
        }
      } else result.actions.push({ key: c.key, action: exists ? "update" : "create", error: e.message });
    }
    if (statePath) writeFileSync3(statePath, JSON.stringify(state, null, 2));
  }
  if (!opts.dryRun) {
    const filterLog = [];
    for (const p of spec.pages) {
      const pid = p.page && p.page !== "active" ? p.page : p.name ? pageIds[`name:${p.name}`] : info.activePageId ?? void 0;
      for (const f of p.filters ?? []) {
        try {
          const r = await addFilter(f, pid ?? void 0);
          filterLog.push({ name: f.name, target: `page:${pid}`, filterId: r.filterId });
        } catch (e) {
          filterLog.push({ name: f.name, target: `page:${pid}`, error: e.message });
        }
      }
    }
    for (const c of components) {
      const id = state.keys[c.key];
      for (const f of c.filters ?? []) {
        if (!id) continue;
        try {
          const r = await addFilter(f, id);
          filterLog.push({ name: f.name, target: id, filterId: r.filterId });
        } catch (e) {
          filterLog.push({ name: f.name, target: id, error: e.message });
        }
      }
    }
    if (filterLog.length) result.filters = filterLog;
    {
      const { arrangeComponents } = await import("./ops4-5ZDR5WYP.js");
      const inside = (p, q) => p !== q && q.x >= p.x && q.y >= p.y && q.x + q.w <= p.x + p.w && q.y + q.h <= p.y + p.h;
      const level = (c) => c.reportLevel ? "report" : c.page;
      const live = components.filter((c) => state.keys[c.key]);
      const backs = live.filter((s) => s.type === "generic-shape" && live.some((o) => level(o) === level(s) && inside(s, o)));
      const fronts = live.filter((o) => ["image-component", "simple-description"].includes(o.type) && live.some((b) => b.type === "button" && level(b) === level(o) && inside(b, o)));
      const run = async (list, op) => {
        const groups = /* @__PURE__ */ new Map();
        for (const c of [...list].sort((a, b) => op === "back" ? a.w * a.h - b.w * b.h : 0)) groups.set(level(c), [...groups.get(level(c)) ?? [], state.keys[c.key]]);
        for (const ids of groups.values()) {
          try {
            await arrangeComponents(ids, op);
          } catch (e) {
            result.arrange = e.message;
          }
        }
      };
      if (backs.length) await run(backs, "back");
      if (fronts.length) await run(fronts, "front");
    }
    await reloadReport();
    result.diagnose = await diagnoseWithKnowledge();
  }
  return result;
}
async function patchIfNeeded(page, id, c) {
  const changes = [];
  if (c.dateRangeDays !== void 0 || c.stripStyles) {
    const r = await evaluateOn(page, T, patchComponentScript, {
      componentId: id,
      ...c.dateRangeDays !== void 0 ? { dateRangeDays: c.dateRangeDays } : {},
      ...c.stripStyles ? { stripThemeStyles: true } : {}
    });
    if (!r.ok) throw new Error(r.error);
    changes.push(...r.changes);
  }
  if (c.text !== void 0) {
    const t = typeof c.text === "string" ? { text: c.text } : c.text;
    const { setText } = await import("./ops4-5ZDR5WYP.js");
    await setText(id, t.text, { ...t.size ? { size: t.size } : {}, ...t.bold ? { bold: true } : {}, ...t.color ? { color: t.color } : {}, ...t.align ? { align: t.align } : {} });
    changes.push("text");
  }
  if (c.style) {
    const { setStyle } = await import("./ops4-5ZDR5WYP.js");
    await setStyle(id, c.style);
    changes.push("style");
  }
  if (c.conditional) {
    const { setConditionalFormat } = await import("./ops4-5ZDR5WYP.js");
    await setConditionalFormat(id, c.conditional);
    changes.push(`conditional:${c.conditional.length}`);
  }
  if (c.chartStyle) {
    const { setChartStyle } = await import("./ops4-5ZDR5WYP.js");
    await setChartStyle({ ...c.chartStyle, componentId: id, reload: false });
    changes.push("chartStyle");
  }
  if (c.comparison) {
    const { setComparison } = await import("./ops4-5ZDR5WYP.js");
    await setComparison(id, c.comparison, c.dateField);
    changes.push(`comparison:${c.comparison}`);
  }
  if (c.linkPage) {
    const { setPageLink } = await import("./ops4-5ZDR5WYP.js");
    await setPageLink(id, c.linkPage);
    changes.push("linkPage");
  }
  if (c.reportLevel) {
    const { componentLevelScript } = await import("./scripts4-ADA4C2PA.js");
    if (await evaluateOn(page, T, componentLevelScript, id) === "page") {
      const { arrangeComponents } = await import("./ops4-5ZDR5WYP.js");
      await arrangeComponents([id], "report", c.page && !c.page.startsWith("name:") && c.page !== "active" ? c.page : void 0);
      changes.push("reportLevel");
    }
  }
  if (c.interactions) {
    const { setChartInteractions } = await import("./ops4-5ZDR5WYP.js");
    await setChartInteractions({ componentId: id, ...c.interactions, reload: false });
    changes.push("interactions");
  }
  if (c.parameter) {
    const { setControlParameter } = await import("./ops4-5ZDR5WYP.js");
    await setControlParameter(id, c.parameter);
    changes.push(`parameter:${c.parameter}`);
  }
  return changes;
}
async function patchComponent(args) {
  const page = await editPage();
  const r = await evaluateOn(page, T, patchComponentScript, args);
  if (!r.ok) throw new Error(r.error);
  return r;
}
async function updateExisting(page, id, c) {
  await evaluateOn(page, T, applyBoxModelScript, {
    componentId: id,
    position: { x: c.x, y: c.y },
    dimensions: { width: c.w, height: c.h },
    ...c.padding !== void 0 ? { padding: { top: c.padding, right: c.padding, bottom: c.padding, left: c.padding } } : {}
  });
  if (c.dimensions.length || c.metrics.length || c.slots) {
    const r = await evaluateOn(page, T + 1e4, bindFieldsScript, {
      componentId: id,
      dimensions: c.dimensions,
      metrics: c.metrics,
      ...["gauge-viz", "bulletchart", "kpi-metric"].includes(c.type) && !c.dimensions.length ? { clearDimensions: true } : {},
      ...c.slots ? { slots: c.slots } : {}
    });
    if (!r.ok) throw new Error(r.error);
  }
}
async function findOrphans(specFiles) {
  const known = /* @__PURE__ */ new Set();
  for (const f of specFiles) {
    const st = f.replace(/\.json$/i, "") + ".state.json";
    if (existsSync4(st)) for (const id of Object.values(JSON.parse(readFileSync4(st, "utf8")).keys)) known.add(id);
  }
  const ex = await exportReport();
  return ex.pages.flatMap(
    (p) => p.components.filter((c) => !known.has(c.id)).map((c) => ({ page: p.name || p.id, id: c.id, type: c.config.display.type, box: [c.attribute.left, c.attribute.top, c.attribute.width, c.attribute.height] }))
  );
}

// src/ops3.ts
import { existsSync as existsSync5, readFileSync as readFileSync6, readdirSync as readdirSync2, writeFileSync as writeFileSync4 } from "node:fs";
import { join as join6 } from "node:path";

// src/theme.ts
import { readFileSync as readFileSync5 } from "node:fs";
import { join as join5 } from "node:path";
var BASE = join5(packageRoot(), "themes", "base-theme.json");
function baseTheme() {
  return JSON.parse(readFileSync5(BASE, "utf8"));
}
function toThemeContent(t, base = baseTheme()) {
  const c = JSON.parse(JSON.stringify(base));
  const setColor = (k, v) => {
    if (v) c[k] = { ...c[k], color: v, opacity: 1 };
  };
  setColor("themeFillColor", t.fill);
  setColor("themeFontColor", t.text);
  setColor("themeAccentFillColor", t.accent);
  setColor("themeAccentFontColor", t.accentText);
  setColor("themeIncreaseColor", t.increase);
  setColor("themeDecreaseColor", t.decrease);
  setColor("themeGridColor", t.grid);
  setColor("themeBackground", t.background);
  setColor("themeBorderColor", t.border);
  setColor("themeComponentHeaderColor", t.header ?? t.text);
  if (t.font) c.themeFontFamily = t.font;
  if (t.accentFont ?? t.font) c.themeAccentFontFamily = t.accentFont ?? t.font;
  if (t.borderWeight !== void 0) c.themeBorderWeight = t.borderWeight;
  if (t.borderRadius !== void 0) c.themeBorderRadius = t.borderRadius;
  if (t.series?.length) {
    const tpl = c.themeSeriesColor[0] ?? { color: "#000", opacity: 1 };
    c.themeSeriesColor = c.themeSeriesColor.map((s, i) => {
      const col = t.series[i % t.series.length];
      return { ...tpl, ...s, color: col, opacity: 1, disabled: false, available: true, seriesRef: { index: i }, themeRef: { index: 4 + i } };
    });
  }
  return c;
}
function fromThemeContent(c) {
  if (!c) return null;
  const col = (k) => c[k] && typeof c[k] === "object" ? c[k].color : void 0;
  return {
    font: c.themeFontFamily,
    text: col("themeFontColor"),
    fill: col("themeFillColor"),
    accent: col("themeAccentFillColor"),
    accentText: col("themeAccentFontColor"),
    background: col("themeBackground"),
    grid: col("themeGridColor"),
    increase: col("themeIncreaseColor"),
    decrease: col("themeDecreaseColor"),
    border: col("themeBorderColor"),
    borderWeight: c.themeBorderWeight,
    borderRadius: c.themeBorderRadius,
    header: col("themeComponentHeaderColor"),
    series: Array.isArray(c.themeSeriesColor) ? c.themeSeriesColor.slice(0, 8).map((s) => s.color) : []
  };
}
function rgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((x) => x + x).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function luminance(hex) {
  const c = rgb(hex);
  if (!c) return null;
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return Math.round((hi + 0.05) / (lo + 0.05) * 100) / 100;
}
function distance(a, b) {
  const x = rgb(a), y = rgb(b);
  if (!x || !y) return null;
  const rm2 = (x[0] + y[0]) / 2;
  const [dr, dg, db] = [x[0] - y[0], x[1] - y[1], x[2] - y[2]];
  return Math.sqrt((2 + rm2 / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm2) / 256) * db * db);
}
function auditUx(f, layoutIssues = []) {
  const issues = [];
  const t = fromThemeContent(f.theme);
  const PAGE_BG = "#ffffff";
  if (!t) {
    issues.push({ severity: "info", area: "tema", componentId: null, rule: "diseno-layout \xA76", message: `Tema predefinido "${f.themeConfig}" (sin personalizar): no se pueden comprobar sus colores; aplica uno con theme set para controlar marca y contraste.` });
  } else {
    const bg = t.fill && t.fill !== "transparent" ? t.fill : PAGE_BG;
    const pairs = [
      ["texto sobre relleno", t.text, bg, 4.5, "WCAG 1.4.3 texto \u2265 4.5:1"],
      ["texto de acento sobre acento", t.accentText, t.accent, 4.5, "WCAG 1.4.3 texto \u2265 4.5:1"],
      ["cabecera sobre relleno", t.header, bg, 4.5, "WCAG 1.4.3"],
      ["subida sobre relleno", t.increase, bg, 3, "WCAG 1.4.11 no textual \u2265 3:1"],
      ["bajada sobre relleno", t.decrease, bg, 3, "WCAG 1.4.11 no textual \u2265 3:1"]
    ];
    for (const [label, fg, back, min, rule] of pairs) {
      if (!fg || !back || back === "transparent") continue;
      const r = contrast(fg, back);
      if (r !== null && r < min) issues.push({ severity: "error", area: "contraste", componentId: null, rule, message: `Contraste ${label} ${r}:1 (< ${min}:1): ${fg} sobre ${back}.` });
    }
    const series = (t.series ?? []).slice(0, 6);
    series.forEach((s, i) => {
      const r = contrast(s, bg);
      if (r !== null && r < 3) issues.push({ severity: "warning", area: "paleta", componentId: null, rule: "WCAG 1.4.11", message: `Serie ${i + 1} (${s}) con contraste ${r}:1 sobre el fondo (< 3:1): lineas/barras dificiles de ver.` });
    });
    for (let i = 0; i < series.length; i++)
      for (let j = i + 1; j < series.length; j++) {
        const d = distance(series[i], series[j]);
        if (d !== null && d < 60) issues.push({ severity: "warning", area: "paleta", componentId: null, rule: "diseno-layout \xA77", message: `Series ${i + 1} y ${j + 1} casi iguales (${series[i]} / ${series[j]}).` });
      }
  }
  const fonts = /* @__PURE__ */ new Set();
  if (t?.font) fonts.add(t.font);
  const tint = (hex, base, a) => {
    const x = rgb(hex), y = rgb(base);
    if (!x || !y) return null;
    return "#" + x.map((v, i) => Math.round(y[i] + (v - y[i]) * a).toString(16).padStart(2, "0")).join("");
  };
  void tint;
  const headerBack = t?.accent ?? null;
  const headerText = t?.header ?? t?.text ?? null;
  const headerRatio = headerBack && headerText ? contrast(headerText, headerBack) : null;
  for (const c of f.components) {
    if (/table/.test(c.type) && headerRatio !== null && headerRatio < 4.5 && !c.overrides.headerFontColor && !c.overrides.headerColor)
      issues.push({ severity: "error", area: "contraste", componentId: c.id, rule: "WCAG 1.4.3", message: `${c.type}: la cabecera pinta el texto del tema (${headerText}) sobre el acento (${headerBack}) = ${headerRatio}:1. patch_component style={"headerFontColor":{"color":"${t.accentText ?? "#FFFFFF"}","opacity":1}}.` });
    const clearValue = (v) => !!v && typeof v === "object" && (v.opacity === 0 || v.size === 0);
    const keys = ["generic-shape", "image-component", "shape", "ellipse"].includes(c.type) ? [] : Object.keys(c.overrides).filter((k) => !c.overrides[k]?.themeRef && !clearValue(c.overrides[k]));
    if (keys.length) issues.push({ severity: "info", area: "tema", componentId: c.id, rule: "diseno-layout \xA76", message: `${c.type} sobrescribe el tema en ${keys.length} claves (${keys.slice(0, 5).join(", ")}${keys.length > 5 ? "\u2026" : ""}).` });
    for (const [k, v] of Object.entries(c.overrides)) {
      if (/fontfamily/i.test(k) && typeof v === "string") fonts.add(v);
      if (/fontcolor/i.test(k) && v && typeof v === "object" && typeof v.color === "string") {
        const hdr = k === "headerFontColor" ? c.overrides.headerColor : void 0;
        const bgOv = c.overrides.backgroundColor ?? c.overrides.background;
        const back = (k === "headerFontColor" ? hdr && typeof hdr === "object" && hdr.color || headerBack : null) || bgOv && typeof bgOv === "object" && bgOv.color || t?.fill || PAGE_BG;
        const r = contrast(v.color, back === "transparent" ? PAGE_BG : back);
        if (r !== null && r < 4.5) issues.push({ severity: "error", area: "contraste", componentId: c.id, rule: "WCAG 1.4.3", message: `${c.type}: ${k} ${v.color} sobre ${back} = ${r}:1 (< 4.5:1).` });
      }
    }
  }
  for (const c of f.components) {
    const ch = c.chart;
    if (!ch) continue;
    const series = ch.metrics + (ch.breakdown ? 2 : 0);
    if (ch.rightAxis) issues.push({ severity: "error", area: "grafico", componentId: c.id, rule: "dataviz: un solo eje", message: `${c.type} con dos ejes Y: la alineacion de las dos escalas es arbitraria e inventa correlaciones. Separa las metricas en dos graficos o indexalas a una base comun (set_chart_style series axis=left).` });
    if (series >= 2 && ch.showLegend === false) issues.push({ severity: "warning", area: "grafico", componentId: c.id, rule: "dataviz: leyenda", message: `${c.type} con ${ch.breakdown ? "desglose" : `${ch.metrics} metricas`} y sin leyenda: la identidad de cada serie queda solo en el color (set_chart_style legend=top).` });
    if (series === 1 && ch.titled && ch.showLegend !== false) issues.push({ severity: "info", area: "grafico", componentId: c.id, rule: "dataviz: leyenda", message: `${c.type} con una sola serie, titulo y leyenda: la leyenda repite el titulo (set_chart_style legend=none).` });
    if (ch.lineLabels) issues.push({ severity: "warning", area: "grafico", componentId: c.id, rule: "dataviz: etiquetas", message: `${c.type} con etiquetas de datos en cada punto: nadie las lee. Deja que el eje y la ayuda emergente den el valor (set_chart_style series dataLabels=false).` });
  }
  if (fonts.size > 2) issues.push({ severity: "warning", area: "tipografia", componentId: null, rule: "diseno-layout \xA78", message: `${fonts.size} familias tipograficas (${[...fonts].join(", ")}): usa como mucho 2.` });
  for (const l of layoutIssues) {
    if (["OFF_GRID", "OUT_OF_CANVAS", "TOO_MANY_CHARTS", "COMPONENT_ERROR", "UI_MESSAGE", "SORT_INVALID", "NO_METRICS"].includes(l.code))
      issues.push({ severity: l.severity === "error" ? "error" : l.severity === "warning" ? "warning" : "info", area: "layout", componentId: l.componentId, rule: l.code, message: l.message });
  }
  const weight = { error: 15, warning: 5, info: 1 };
  const score = Math.max(0, 100 - issues.reduce((s, i) => s + weight[i.severity], 0));
  return { score, theme: t, issues };
}

// src/ops3.ts
var T2 = Number(process.env.LS_EVAL_TIMEOUT_MS ?? 15e3);
var sleep2 = (ms) => new Promise((r) => setTimeout(r, ms));
function watchSaves(page) {
  const statuses = [];
  const on = (r) => {
    if (/\/(updatePage|updateReport|createPages)\b/.test(r.url())) statuses.push(r.status());
  };
  page.on("response", on);
  return { statuses, stop: () => page.off("response", on) };
}
async function readTheme() {
  const page = await getReportPage();
  const r = await evaluateOn(page, T2, readThemeScript);
  return { themeConfig: r.themeConfig, customThemes: r.themes, theme: fromThemeContent(r.custom), raw: r.custom };
}
async function applyTheme(theme) {
  const { page } = await requireEditMode();
  const cur = await evaluateOn(page, T2, readThemeScript);
  const content = toThemeContent(theme, cur.custom ?? void 0);
  const w = watchSaves(page);
  const r = await evaluateOn(page, T2, applyThemeScript, content);
  await sleep2(2500);
  w.stop();
  if (!r.ok) throw new Error(r.error);
  if (w.statuses.some((s) => s >= 400)) {
    learn("save_rejected", "theme", { statuses: w.statuses });
    await reloadReport();
    throw new Error(`El guardado del tema fue rechazado (${w.statuses.join(",")}); se recargo el informe.`);
  }
  learn("note", "theme_applied", { text: r.created ? "theme resource created" : "theme resource updated" });
  return { ...r, saves: w.statuses };
}
var THEME_PRESETS = {
  "t-default-modern": "Predeterminado (moderno)",
  "t-default": "Predeterminado",
  "t-edge": "Edge",
  "t-constellation": "Constelacion",
  "t-groovy": "Groovy",
  "t-insight": "Insight",
  "t-ocean": "Oceano",
  "t-harvest": "Cosecha",
  "t-eucalyptus": "Eucalipto",
  "t-pop": "Pop",
  "t-fog": "Niebla",
  "t-lagoon": "Laguna",
  "t-executive": "Ejecutivo",
  "t-woodsy": "Bosque",
  "t-royalty": "Realeza",
  "t-sienna": "Siena",
  "t-material": "Material",
  "t-muted": "Apagado",
  "t-primary": "Primario",
  "t-cut-out": "Recorte",
  "t-shift": "Shift",
  "t-energetic": "Energetico",
  "t-forest": "Selva",
  "t-magazine": "Revista",
  "t-tunnel": "Tunel",
  "t-quartz": "Cuarzo",
  "t-onyx": "Onix"
};
var LIBRARY = join6(packageRoot(), "themes", "library");
function themeLibrary() {
  const own = existsSync5(LIBRARY) ? readdirSync2(LIBRARY).filter((f) => f.endsWith(".json")).map((f) => ({ name: f.replace(/\.json$/, ""), file: join6(LIBRARY, f) })) : [];
  return { presets: Object.entries(THEME_PRESETS).map(([id, name]) => ({ id, name })), library: own };
}
async function useThemePreset(idOrName) {
  const { page } = await requireEditMode();
  const lib = themeLibrary().library.find((t) => t.name === idOrName);
  if (lib) return applyTheme(JSON.parse(readFileSync6(lib.file, "utf8")));
  const id = THEME_PRESETS[idOrName] ? idOrName : Object.entries(THEME_PRESETS).find(([, n]) => n.toLowerCase() === idOrName.toLowerCase())?.[0];
  if (!id) throw new Error(`Tema "${idOrName}" no encontrado. Usa theme presets para ver los disponibles.`);
  const w = watchSaves(page);
  const r = await evaluateOn(page, T2, setThemePresetScript, id);
  await sleep2(2500);
  w.stop();
  if (!r.ok) throw new Error(r.error);
  learn("note", "theme_preset", { text: id });
  return { ok: true, themeConfig: id, saves: w.statuses };
}
async function exportTheme(file) {
  const t = await readTheme();
  if (!t.raw) throw new Error(`El informe usa el tema predefinido "${t.themeConfig}": no hay colores que exportar (aplica uno personalizado o importa de la biblioteca).`);
  writeFileSync4(file, JSON.stringify({ friendly: t.theme, raw: t.raw }, null, 2));
  return { file, theme: t.theme };
}
async function importTheme(file) {
  const j = JSON.parse(readFileSync6(file, "utf8"));
  return applyTheme(j.friendly ?? j);
}
async function listFilters() {
  return evaluateOn(await getReportPage(), T2, listFiltersScript);
}
async function addFilter(f, target) {
  const { page } = await requireEditMode();
  const existing = (await evaluateOn(page, T2, listFiltersScript)).find((x) => x.name === f.name);
  let filterId = existing?.id ?? null;
  if (!filterId) {
    const datasetId = await resolveDataset(page, f.dataset ?? `@${f.field}`);
    const r = await evaluateOn(page, T2, addFilterScript, {
      name: f.name,
      datasetId,
      field: f.field,
      condition: (f.op ?? "EQ").toUpperCase(),
      values: f.values ?? [],
      include: f.include ?? true
    });
    if (!r.ok) throw new Error(r.error ?? "No se pudo crear el filtro.");
    filterId = r.filterId;
    await sleep2(1500);
  }
  let attached;
  if (target) {
    const w = watchSaves(page);
    const a = await evaluateOn(page, T2, attachFilterScript, { filterId, target });
    await sleep2(2500);
    w.stop();
    if (!a.ok) throw new Error(a.error);
    if (w.statuses.some((s) => s >= 400)) {
      learn("save_rejected", "filter", { statuses: w.statuses });
      throw new Error(`Aplicar el filtro fue rechazado (${w.statuses.join(",")}).`);
    }
    attached = a.filters;
  }
  learn("create_ok", "filter", { source: existing ? "reused" : "addResource" });
  return { filterId, reused: !!existing, ...attached ? { target, filters: attached } : {} };
}
async function updateFilter(f) {
  const { page } = await requireEditMode();
  const w = watchSaves(page);
  const r = await evaluateOn(page, T2, updateFilterScript, {
    filterId: f.filterId,
    ...f.name !== void 0 ? { name: f.name } : {},
    ...f.op !== void 0 ? { condition: f.op.toUpperCase() } : {},
    ...f.values !== void 0 ? { values: f.values } : {},
    ...f.include !== void 0 ? { include: f.include } : {}
  });
  await sleep2(2500);
  w.stop();
  if (!r.ok) throw new Error(r.error);
  if (w.statuses.some((s) => s >= 400)) {
    learn("save_rejected", "filter_update", { statuses: w.statuses });
    throw new Error(`El cambio del filtro fue rechazado (${w.statuses.join(",")}).`);
  }
  return { filterId: f.filterId, ...r.filter };
}
async function detachFilter(filterId, target) {
  const { page } = await requireEditMode();
  const a = await evaluateOn(page, T2, attachFilterScript, { filterId, target, detach: true });
  if (!a.ok) throw new Error(a.error);
  await sleep2(2e3);
  return a;
}
async function reportSettings(patch) {
  if (!patch || !Object.keys(patch).length) return evaluateOn(await getReportPage(), T2, reportSettingsScript, null);
  const { page } = await requireEditMode();
  const w = watchSaves(page);
  const r = await evaluateOn(page, T2, reportSettingsScript, patch);
  await sleep2(2500);
  w.stop();
  if (!r.ok) throw new Error(r.error);
  if (w.statuses.some((s) => s >= 400)) throw new Error(`Guardado rechazado (${w.statuses.join(",")}).`);
  return { ...r, saves: w.statuses };
}
async function listPages() {
  const page = await getReportPage();
  const nav = await evaluateOn(page, T2, navPagesScript).catch(() => []);
  if (!nav.length) return evaluateOn(page, T2, listPagesScript);
  return nav.map((p) => ({
    id: p.pageId,
    name: p.displayName || p.modelName,
    modelName: p.modelName,
    components: p.components,
    index: p.index,
    ...p.hiddenFromNav ? { hiddenFromNav: true } : {},
    ...p.hiddenFromViewer ? { hiddenFromViewer: true } : {}
  }));
}
async function addPage(name) {
  const { page } = await requireEditMode();
  const idsBefore = new Set((await evaluateOn(page, T2, listPagesScript)).map((p) => p.id));
  const w = watchSaves(page);
  await page.bringToFront();
  await page.setViewport({ width: 1900, height: 1100 });
  await sleep2(800);
  let r = await evaluateOn(page, T2, addPageScript);
  if (!r.ok) {
    const opened = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll("button")).find((x) => /^(P[aá]gina|Page)$/.test((x.innerText || "").trim()));
      if (b) b.click();
      return !!b;
    });
    await sleep2(800);
    const clicked = opened && await page.evaluate(() => {
      const it = Array.from(document.querySelectorAll("[role=menuitem],button")).find((x) => /Nueva p[aá]gina|New page/i.test(x.innerText || ""));
      if (it) it.click();
      return !!it;
    });
    if (clicked) r = { ...r, ok: true };
  }
  await sleep2(500);
  await page.setViewport(null).catch(() => void 0);
  if (!r.ok) {
    w.stop();
    learn("method_missing", "toolbar:add-page", { error: r.error });
    throw new Error(r.error);
  }
  let pages = await evaluateOn(page, T2, listPagesScript);
  for (let i = 0; i < 20 && pages.length <= r.before; i++) {
    await sleep2(500);
    pages = await evaluateOn(page, T2, listPagesScript);
  }
  const createdIndex = pages.findIndex((p) => !idsBefore.has(p.id));
  const created = createdIndex >= 0 ? pages[createdIndex] : void 0;
  if (!created || pages.length <= r.before) {
    w.stop();
    throw new Error('La pagina no aparecio tras pulsar "Anadir pagina".');
  }
  await sleep2(1500);
  const rn = await evaluateOn(page, T2, renamePageScript, { pageId: created.id, name });
  await sleep2(2e3);
  w.stop();
  if (!rn.ok) throw new Error(rn.error);
  const nd = await evaluateOn(page, T2 + 5e3, navDispatchScript, { type: "UPDATE NAV ITEM NAME", payload: { itemId: created.id, displayName: name } });
  if (!nd.ok) learn("note", "rename_page_nav_failed", { text: String(nd.error).slice(0, 200) });
  const nav = await evaluateOn(page, T2, navPagesScript);
  learn("create_ok", "page", { source: "toolbar+rename" });
  return { ok: true, pageId: created.id, index: nav.findIndex((p) => p.pageId === created.id), name, url: page.url(), saves: w.statuses };
}
async function renamePage(pageId, name) {
  const { page } = await requireEditMode();
  const r = await evaluateOn(page, T2, renamePageScript, { pageId, name });
  if (!r.ok) throw new Error(r.error);
  await sleep2(1500);
  const d = await evaluateOn(page, T2 + 5e3, navDispatchScript, { type: "UPDATE NAV ITEM NAME", payload: { itemId: pageId, displayName: name } });
  if (!d.ok) throw new Error(d.error);
  const nav = await evaluateOn(page, T2, navPagesScript);
  return { ...r, navigation: nav.map((p) => p.displayName) };
}
var RECIPES = {
  "simple-treemap": { dims: ["text", "text"], metrics: 1 },
  "pivot-table": { dims: ["text"], metrics: 1 },
  "simple-scatterchart": { dims: ["text"], metrics: 2 },
  bulletchart: { dims: [], metrics: 1 },
  "gauge-viz": { dims: [], metrics: 1 },
  "simple-combochart": { dims: ["date"], metrics: 2 },
  "simple-areachart": { dims: ["date"], metrics: 1 },
  "simple-sankey": { dims: ["text", "text"], metrics: 1 },
  "simple-funnel": { dims: ["text"], metrics: 1 },
  "simple-waterfall": { dims: ["text"], metrics: 1 },
  "simple-histogram": { dims: ["number"], metrics: 1 },
  "google-map": { dims: ["geo"], metrics: 1 },
  "simple-barchart": { dims: ["text"], metrics: 1 },
  "simple-linechart": { dims: ["date"], metrics: 1 },
  "simple-piechart": { dims: ["text"], metrics: 1 },
  "simple-geomap": { dims: ["geo"], metrics: 1 },
  "simple-table": { dims: ["text"], metrics: 1 }
};
async function synthesizeTemplates(types, opts = {}) {
  const { page } = await requireEditMode();
  const known = new Set(listTemplates().map((t) => t.type));
  const ds = await evaluateOn(page, T2, readDataSourcesScript);
  const results = [];
  for (const type of types) {
    if (known.has(type)) {
      results.push({ type, ok: true, skipped: "ya hay plantilla" });
      continue;
    }
    const s = await evaluateOn(page, T2, synthesizeComponentScript, { type, box: { x: 20, y: 20, width: 400, height: 300 }, ...opts.pageId ? { pageId: opts.pageId } : {} });
    if (!s.ok) {
      learn("create_fail", type, { source: "synth", error: s.error });
      results.push({ type, ok: false, error: s.error });
      continue;
    }
    const id = s.componentId;
    const dsId = await evaluateOn(page, T2, readComponentConfigScript, id).then((r) => r.config?.config?.datasource?.keys?.dataset?.value?.id);
    const src = ds.dataSources.find((d) => d.dataSourceId === dsId) ?? ds.dataSources.find((d) => d.fields.length);
    const fields = src?.fields ?? [];
    const BAD = /(^|_)id(_|$)|url|imagen|image|comentario|lat_long/i;
    const used = /* @__PURE__ */ new Set();
    const pick = (role) => {
      const f = fields.find((x) => !used.has(x.id) && !BAD.test(x.name) && (role === "date" ? x.dataType === "DATE" : role === "number" ? x.dataType === "NUMBER" : role === "geo" ? /pais|country|codigo_pais|ciudad|city|region/i.test(x.name) : x.dataType === "TEXT"));
      if (f) used.add(f.id);
      return f;
    };
    const metricRef = () => {
      const f = pick("number");
      return f ? f.type === "METRIC" ? f.name : `SUM(${f.name})` : void 0;
    };
    const fcs = s.fieldConfigs ?? [];
    const recipe = RECIPES[type];
    let dims = [], metrics = [];
    const slots = {};
    if (fcs.length) {
      for (const fc of fcs.filter((f) => f.min >= 1 || f.slot === "primary")) {
        const n = Math.max(fc.min, fc.count, fc.slot === "primary" ? 1 : 0);
        const refs = [];
        for (let i = 0; i < n; i++) {
          const role = fc.kind === "metric" ? "metric" : fc.supportedTypes?.includes(1) || recipe?.dims[i] === "date" ? "date" : recipe?.dims[i] === "geo" ? "geo" : recipe?.dims[i] === "number" ? "number" : "text";
          const r = role === "metric" ? metricRef() : pick(role)?.name;
          if (r) refs.push(r);
        }
        if (fc.slot === "primary") (fc.kind === "dimension" ? dims : metrics).push(...refs);
        else if (refs.length) slots[fc.slot] = refs;
      }
      learn("note", `fields:${type}`, { text: JSON.stringify(fcs.map((f) => `${f.slot}:${f.kind}:${f.min}`)) });
    } else if (recipe) {
      dims = recipe.dims.map((r) => pick(r)?.name).filter(Boolean);
      metrics = Array.from({ length: recipe.metrics }, metricRef).filter(Boolean);
    } else {
      results.push({ type, ok: false, error: "sin configuracion de campos para este tipo" });
      continue;
    }
    const w = watchSaves(page);
    const b = await evaluateOn(page, T2 + 1e4, bindFieldsScript, { componentId: id, dimensions: dims, metrics, clearDimensions: !dims.length, ...Object.keys(slots).length ? { slots } : {} });
    await sleep2(2500);
    w.stop();
    if (!b.ok || w.statuses.some((x) => x >= 400)) {
      learn("save_rejected", type, { source: "synth", statuses: w.statuses, error: b.error });
      results.push({ type, ok: false, status: w.statuses, error: b.error ?? "updatePage rechazado" });
      await reloadReport();
      continue;
    }
    const cfg = await evaluateOn(page, T2, readComponentConfigScript, id);
    if (cfg.ok) saveTemplate(type, cfg.config, { source: "synthesized", fields: { dims, metrics } });
    learn("create_ok", type, { source: "synth" });
    await evaluateOn(page, T2, deleteComponentScript, id);
    await sleep2(1500);
    results.push({ type, ok: true, status: w.statuses });
  }
  return { results, templates: listTemplates().map((t) => t.type) };
}
async function seedTemplatesFromUi(labels) {
  const { page } = await requireEditMode();
  const results = [];
  await page.bringToFront();
  await page.setViewport({ width: 1900, height: 1100 });
  await sleep2(1e3);
  try {
    for (const label of labels) {
      const before = new Set(await page.evaluate(() => window.angular.element(document.body).injector().get("legoUndoRedoService").report.pages.flatMap((p) => p.components.map((c) => c.getId()))));
      const isControl = label.startsWith("control:");
      const item = isControl ? label.slice(8) : label;
      const opened = await page.evaluate((ctl) => {
        const sel = ctl ? 'button[aria-label="A\xF1adir un control"], button[aria-label="Add a control"]' : 'button[aria-label="A\xF1adir un gr\xE1fico"], button[aria-label="Add a chart"]';
        const b = document.querySelector(sel);
        if (b) b.click();
        return !!b;
      }, isControl);
      await sleep2(900);
      const picked = opened && await page.evaluate((l, ctl) => {
        const panes = Array.from(document.querySelectorAll(".cdk-overlay-pane"));
        const pane = panes[panes.length - 1] || document;
        const cands = Array.from(pane.querySelectorAll(ctl ? "button,[role=menuitem]" : "preset-preview,[role=menuitem]"));
        const el = cands.find((e) => ctl ? (e.innerText || "").replace(/\s+/g, " ").trim() === l : e.getAttribute("aria-label") === l);
        if (el) el.click();
        return !!el;
      }, item, isControl);
      if (!picked) {
        await page.keyboard.press("Escape");
        results.push({ label, ok: false, error: opened ? "opcion no encontrada en el menu" : 'boton "Anadir un grafico" no encontrado' });
        learn("method_missing", `insert-menu:${label}`);
        continue;
      }
      await sleep2(500);
      const box = await page.evaluate(() => {
        const c = document.querySelector(".ng2-canvas-container");
        const r = c ? c.getBoundingClientRect() : null;
        return r ? { x: r.x, y: r.y } : null;
      });
      if (!box) {
        results.push({ label, ok: false, error: "lienzo no encontrado" });
        continue;
      }
      await page.mouse.click(box.x + 80, box.y + 80);
      await sleep2(2500);
      const added = await page.evaluate((prev) => {
        const rep = window.angular.element(document.body).injector().get("legoUndoRedoService").report;
        const all = rep.pages.flatMap((p) => p.components);
        const c = all.find((x) => !prev.includes(x.getId()));
        return c ? { id: String(c.getId()), type: String(c.config.config.display.type), config: JSON.parse(JSON.stringify(c.config)) } : null;
      }, [...before]);
      if (!added) {
        await page.keyboard.press("Escape").catch(() => void 0);
        results.push({ label, ok: false, error: "no se creo ningun componente en el lienzo (puede ser un elemento de informe)" });
        continue;
      }
      const slug = item.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      saveTemplate(added.type, added.config, { source: isControl ? "control-menu" : "insert-menu", label: item });
      saveTemplate(`${added.type}@${slug}`, added.config, { source: isControl ? "control-menu" : "insert-menu", label: item });
      learn("create_ok", added.type, { source: "insert-menu" });
      await evaluateOn(page, T2, deleteComponentScript, added.id);
      await sleep2(1500);
      results.push({ label, ok: true, type: added.type });
    }
  } finally {
    await page.setViewport(null).catch(() => void 0);
  }
  return { results, templates: listTemplates().map((t) => t.type) };
}
async function uxAudit() {
  const page = await getReportPage();
  const facts = await evaluateOn(page, T2, uxFactsScript);
  const diag = await evaluateOn(page, T2, diagnoseReportScript);
  return auditUx(facts, diag.issues);
}
async function addSourceField(opts) {
  const { page } = await requireEditMode();
  await page.bringToFront();
  await page.setViewport({ width: 1900, height: 1100 });
  await sleep2(1e3);
  const clickText = async (selector, re) => {
    const box = await page.evaluate((sel, src, flags) => {
      const rx = new RegExp(src, flags);
      const el = Array.from(document.querySelectorAll(sel)).find((e) => e.offsetParent && rx.test((e.innerText || "").trim()));
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, selector, re.source, re.flags);
    if (!box) return false;
    await page.mouse.click(box.x, box.y);
    return true;
  };
  const editorSource = () => page.evaluate(() => {
    const leaves = Array.from(document.querySelectorAll("*")).filter((e) => e.offsetParent && e.children.length === 0);
    const label = leaves.find((e) => /^(Ámbito|Ambito|Scope):?$/.test((e.innerText || "").trim()));
    let row = label ? label.parentElement : null;
    while (row && row.parentElement && (row.innerText || "").length < 30) row = row.parentElement;
    const rowLeaves = row ? leaves.filter((e) => row.contains(e)) : [];
    const name = rowLeaves.length ? (rowLeaves[0].innerText || "").trim() : "";
    const word = /(Insertada|Embedded|Reutilizable|Reusable)\b/;
    const sc = document.querySelector("datasource-scope");
    let scope = "";
    if (sc) {
      if (sc.querySelector(".embedded")) scope = "Insertada";
      else scope = ((sc.innerText || sc.textContent || "").match(word) || [])[1] || (sc.querySelector("[class*=reusab], [class*=shared]") ? "Reutilizable" : "");
    }
    if (!scope) {
      const hit = Array.from(document.querySelectorAll("*")).map((e) => e.offsetParent ? e.innerText || "" : "").find((t) => t.length < 40 && word.test(t)) || "";
      scope = hit ? hit.match(word)[1] : "";
    }
    let srcName = name;
    if (sc) {
      let el = sc;
      while (el.parentElement && /^\s*(Ámbito|Ambito|Scope)/.test(el.parentElement.innerText || "")) el = el.parentElement;
      const first = (el.parentElement && el.parentElement.innerText || "").split("\n").map((t) => t.trim()).find(Boolean) || "";
      if (first && !/^(Ámbito|Ambito|Scope)/.test(first)) srcName = first;
    }
    return { name: srcName.split("\n")[0], scope };
  });
  const open = async () => {
    if (!await clickText("button", /^(add_circle\s*)?(Añadir un campo|Add a field)$/)) {
      const { selectSourceChart } = await import("./ops4-5ZDR5WYP.js");
      await selectSourceChart(page, opts.source && opts.source.startsWith("@") ? opts.source : void 0);
      if (!await clickText("button", /^(add_circle\s*)?(Añadir un campo|Add a field)$/)) throw new Error('No se encontro "Anadir un campo" en el panel Datos.');
    }
    await sleep2(1200);
    if (!await clickText("[role=menuitem], .mat-mdc-menu-item", /(Añadir campo calculado|Add calculated field)/)) throw new Error('No aparecio "Anadir campo calculado".');
    await sleep2(2500);
  };
  const close = async () => {
    await clickText("button", /^(Hecho|Done)$/);
    await sleep2(2e3);
  };
  try {
    await open();
    const readSource = async () => {
      let r = await editorSource();
      for (let i = 0; i < 12 && !r.scope; i++) {
        await sleep2(500);
        r = await editorSource();
      }
      return r;
    };
    let src = await readSource();
    const dsList = await evaluateOn(page, T2, readDataSourcesScript).then((r) => Array.isArray(r.dataSources) ? r.dataSources : Object.values(r.dataSources)).catch(() => []);
    if (opts.source && !opts.source.startsWith("@") && dsList.length === 1) opts = { ...opts, source: void 0 };
    const byField = !!opts.source && opts.source.startsWith("@");
    if (byField) {
      const { selectSourceChart } = await import("./ops4-5ZDR5WYP.js");
      await clickText("button", /^(Cancelar|Cancel)$/);
      await close();
      await selectSourceChart(page, opts.source);
      await open();
      src = await readSource();
    }
    if (opts.source && !byField && !src.name.toLowerCase().includes(opts.source.toLowerCase())) {
      await clickText("button", /^(Cancelar|Cancel)$/);
      await close();
      const escaped = opts.source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!await clickText("*", new RegExp(escaped, "i"))) throw new Error(`No hay un origen "${opts.source}" en el panel Datos.`);
      await sleep2(1500);
      await open();
      src = await readSource();
      if (!src.name.toLowerCase().includes(opts.source.toLowerCase())) throw new Error(`El editor de campos abrio "${src.name}", no "${opts.source}".`);
    }
    if (!/^(Insertada|Embedded)$/.test(src.scope) && !opts.allowShared) {
      await clickText("button", /^(Cancelar|Cancel)$/);
      await close();
      throw new Error(src.scope ? `El origen es reutilizable (${src.scope}): el campo apareceria en todos los informes que lo usan. Repite con allowShared si es lo que quieres.` : "No se pudo leer en el editor de campos si el origen es insertado o reutilizable: repite; si sabes que es insertado (p. ej. el de un CSV subido a este informe), anade allowShared.");
    }
    const fieldId = await page.evaluate((name, formula) => {
      const inputs = Array.from(document.querySelectorAll("input.gmat-mdc-input")).filter((i) => i.offsetParent && !i.closest("[class*=propert]"));
      const nameInput = inputs.find((i) => !/^calc_/.test(i.value));
      const idInput = inputs.find((i) => /^calc_/.test(i.value));
      if (!nameInput) return null;
      nameInput.focus();
      nameInput.value = name;
      nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      nameInput.dispatchEvent(new Event("change", { bubbles: true }));
      const cm = document.querySelector(".CodeMirror")?.CodeMirror;
      if (!cm) return null;
      cm.setValue(formula);
      return idInput ? idInput.value : "";
    }, opts.name, opts.formula);
    if (fieldId === null) throw new Error("No se encontraron los campos Nombre/Formula del editor.");
    await sleep2(2500);
    const saved = await clickText("button:not([disabled])", /^(Guardar|Save)$/);
    if (!saved) {
      const why = await page.evaluate(() => Array.from(document.querySelectorAll("[class*=error], [class*=invalid]")).filter((e) => e.offsetParent).map((e) => (e.innerText || "").trim()).filter(Boolean).join(" | ").slice(0, 300));
      await clickText("button", /^(Cancelar|Cancel)$/);
      await close();
      throw new Error(`La formula no es valida para el editor: ${why || "Guardar sigue desactivado"}`);
    }
    await sleep2(3500);
    await close();
    learn("create_ok", "source-field", { source: "data-panel" });
    let owner;
    for (let i = 0; i < 6 && !owner && fieldId; i++) {
      const ds = await evaluateOn(page, T2, readDataSourcesScript).catch(() => null);
      const list = ds ? Array.isArray(ds.dataSources) ? ds.dataSources : Object.values(ds.dataSources) : [];
      const hit = list.find((d) => d.fields.some((f) => f.id === fieldId));
      if (hit) owner = { dataSourceId: hit.dataSourceId, name: hit.name };
      else await sleep2(1e3);
    }
    return { ok: true, fieldId, name: opts.name, formula: opts.formula, ...owner ? { dataSourceId: owner.dataSourceId, ...owner.name !== owner.dataSourceId ? { source: owner.name } : {} } : {}, scope: src.scope };
  } finally {
    await page.setViewport(null).catch(() => void 0);
  }
}

export {
  log,
  getBrowser,
  setActiveReport,
  getReportPage,
  disconnectIfConnected,
  evaluate,
  evaluateOn,
  revealIfHidden,
  readLayoutScript,
  applyBoxModelScript,
  readDataSourcesScript,
  bindFieldsScript,
  readComponentConfigScript,
  parseReportUrl,
  attachToReport,
  requireEditMode,
  packageRoot,
  readLearnings,
  learn,
  getTemplate,
  listTemplates,
  summary,
  loadSpec,
  lintSpec,
  probeStartScript,
  probeReadScript,
  readTheme,
  applyTheme,
  THEME_PRESETS,
  themeLibrary,
  useThemePreset,
  exportTheme,
  importTheme,
  listFilters,
  addFilter,
  updateFilter,
  detachFilter,
  reportSettings,
  listPages,
  addPage,
  renamePage,
  synthesizeTemplates,
  seedTemplatesFromUi,
  uxAudit,
  addSourceField,
  openReport,
  copyReport,
  reloadReport,
  exportReport,
  captureTemplates,
  diagnoseWithKnowledge,
  resolveDataset,
  createComponent,
  deleteComponent,
  applySpec,
  patchComponent,
  findOrphans
};
/*! Bundled license information:

puppeteer-core/lib/puppeteer/node-env-setup.js:
  (**
   * @license
   * Copyright 2026 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/puppeteer/node/BrowserLauncher.js:
puppeteer-core/lib/puppeteer/index.js:
puppeteer-core/lib/puppeteer/puppeteer-core.js:
  (**
   * @license
   * Copyright 2017 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/puppeteer/node/util/fs.js:
puppeteer-core/lib/puppeteer/node/ChromeLauncher.js:
puppeteer-core/lib/puppeteer/node/FirefoxLauncher.js:
puppeteer-core/lib/puppeteer/node/ScreenRecorder.js:
  (**
   * @license
   * Copyright 2023 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/puppeteer/node/PuppeteerNode.js:
  (**
   * @license
   * Copyright 2020 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/puppeteer/node/node.js:
  (**
   * @license
   * Copyright 2022 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
