import { createRequire as __lsCreateRequire } from 'node:module'; const require = __lsCreateRequire(import.meta.url);
import {
  ARIAQueryHandler,
  Accessibility,
  AsyncIterableUtil,
  Browser,
  BrowserContext,
  CDPSession,
  CallbackRegistry,
  ConnectionClosedError,
  ConsoleMessage,
  Coverage,
  Deferred,
  DeviceRequestPrompt,
  Dialog,
  DisposableStack,
  ElementHandle,
  EmulationManager,
  EventEmitter,
  FileChooser,
  Frame,
  HTTPRequest,
  HTTPResponse,
  InterceptResolutionAction,
  JSHandle,
  Keyboard,
  LazyArg,
  Mouse,
  MouseButton,
  Page,
  ProtocolError,
  PuppeteerURL,
  Realm,
  SOURCE_URL_REGEX,
  STATUS_TEXTS,
  ScreenRecording,
  SecurityDetails,
  Target,
  TargetCloseError,
  TargetType,
  TimeoutError,
  TouchError,
  Touchscreen,
  Tracing,
  UnsupportedOperation,
  WEB_PERMISSION_TO_PROTOCOL_PERMISSION,
  WebWorker,
  WebWorkerEvent,
  assert,
  bindIsolatedHandle,
  bubble,
  combineLatest,
  defer,
  delayWhen,
  disposeSymbol,
  evaluationString,
  filter,
  first,
  firstValueFrom,
  from,
  fromAbortSignal,
  fromEmitterEvent,
  getSourcePuppeteerURLIfAvailable,
  getSourceUrlComment,
  guarded,
  handleError,
  headersInputToRecord,
  inertIfDisposed,
  interpolateFunction,
  invokeAtMostOnceForArguments,
  isDate,
  isErrorLike,
  isPlainObject,
  isRegExp,
  isString,
  map,
  normalizeHeaderValue,
  of,
  parsePDFOptions,
  race,
  raceWith,
  scriptInjector,
  stringToBase64,
  stringToTypedArray,
  stringifyFunction,
  switchMap,
  throwIfDetached,
  throwIfDisposed,
  timeout
} from "./chunk-FAVAKK4W.js";
import "./chunk-GIAQTVDD.js";
import "./chunk-R5VSDU44.js";
import {
  DEBUG_PREFIXES,
  environment
} from "./chunk-PP647YHP.js";
import {
  __commonJS,
  __export,
  __toESM
} from "./chunk-5QDPZ4I5.js";

// node_modules/webdriver-bidi-protocol/out/gen/ua-client-hints.js
var require_ua_client_hints = __commonJS({
  "node_modules/webdriver-bidi-protocol/out/gen/ua-client-hints.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/webdriver-bidi-protocol/out/gen/main.js
var require_main = __commonJS({
  "node_modules/webdriver-bidi-protocol/out/gen/main.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Input = exports.Log = exports.Script = exports.Network = exports.Emulation = exports.BrowsingContext = exports.Session = exports.ErrorCode = void 0;
    exports.ErrorCode = {
      InvalidArgument: "invalid argument",
      InvalidSelector: "invalid selector",
      InvalidSessionId: "invalid session id",
      InvalidWebExtension: "invalid web extension",
      MoveTargetOutOfBounds: "move target out of bounds",
      NoSuchAlert: "no such alert",
      NoSuchNetworkCollector: "no such network collector",
      NoSuchElement: "no such element",
      NoSuchFrame: "no such frame",
      NoSuchHandle: "no such handle",
      NoSuchHistoryEntry: "no such history entry",
      NoSuchIntercept: "no such intercept",
      NoSuchNetworkData: "no such network data",
      NoSuchNode: "no such node",
      NoSuchRequest: "no such request",
      NoSuchScreencast: "no such screencast",
      NoSuchScript: "no such script",
      NoSuchStoragePartition: "no such storage partition",
      NoSuchUserContext: "no such user context",
      NoSuchWebExtension: "no such web extension",
      SessionNotCreated: "session not created",
      UnableToCaptureScreen: "unable to capture screen",
      UnableToCloseBrowser: "unable to close browser",
      UnableToSetCookie: "unable to set cookie",
      UnableToSetFileInput: "unable to set file input",
      UnavailableNetworkData: "unavailable network data",
      UnderspecifiedStoragePartition: "underspecified storage partition",
      UnknownCommand: "unknown command",
      UnknownError: "unknown error",
      UnsupportedOperation: "unsupported operation"
    };
    var Session5;
    (function(Session6) {
      Session6.UserPromptHandlerType = {
        Accept: "accept",
        Dismiss: "dismiss",
        Ignore: "ignore"
      };
    })(Session5 || (exports.Session = Session5 = {}));
    var BrowsingContext6;
    (function(BrowsingContext7) {
      BrowsingContext7.ReadinessState = {
        None: "none",
        Interactive: "interactive",
        Complete: "complete"
      };
    })(BrowsingContext6 || (exports.BrowsingContext = BrowsingContext6 = {}));
    (function(BrowsingContext7) {
      BrowsingContext7.UserPromptType = {
        Alert: "alert",
        Beforeunload: "beforeunload",
        Confirm: "confirm",
        Prompt: "prompt"
      };
    })(BrowsingContext6 || (exports.BrowsingContext = BrowsingContext6 = {}));
    (function(BrowsingContext7) {
      BrowsingContext7.CreateType = { Tab: "tab", Window: "window" };
    })(BrowsingContext6 || (exports.BrowsingContext = BrowsingContext6 = {}));
    var Emulation3;
    (function(Emulation4) {
      Emulation4.ForcedColorsModeTheme = { Light: "light", Dark: "dark" };
    })(Emulation3 || (exports.Emulation = Emulation3 = {}));
    (function(Emulation4) {
      Emulation4.ScreenOrientationNatural = {
        Portrait: "portrait",
        Landscape: "landscape"
      };
    })(Emulation3 || (exports.Emulation = Emulation3 = {}));
    (function(Emulation4) {
      Emulation4.ScreenOrientationType = {
        PortraitPrimary: "portrait-primary",
        PortraitSecondary: "portrait-secondary",
        LandscapePrimary: "landscape-primary",
        LandscapeSecondary: "landscape-secondary"
      };
    })(Emulation3 || (exports.Emulation = Emulation3 = {}));
    var Network6;
    (function(Network7) {
      Network7.SameSite = {
        Strict: "strict",
        Lax: "lax",
        None: "none",
        Default: "default"
      };
    })(Network6 || (exports.Network = Network6 = {}));
    (function(Network7) {
      Network7.DataType = { Request: "request", Response: "response" };
    })(Network6 || (exports.Network = Network6 = {}));
    (function(Network7) {
      Network7.InterceptPhase = {
        BeforeRequestSent: "beforeRequestSent",
        ResponseStarted: "responseStarted",
        AuthRequired: "authRequired"
      };
    })(Network6 || (exports.Network = Network6 = {}));
    var Script5;
    (function(Script6) {
      Script6.RealmType = {
        Window: "window",
        DedicatedWorker: "dedicated-worker",
        SharedWorker: "shared-worker",
        ServiceWorker: "service-worker",
        Worker: "worker",
        PaintWorklet: "paint-worklet",
        AudioWorklet: "audio-worklet",
        Worklet: "worklet"
      };
    })(Script5 || (exports.Script = Script5 = {}));
    (function(Script6) {
      Script6.ResultOwnership = { Root: "root", None: "none" };
    })(Script5 || (exports.Script = Script5 = {}));
    var Log3;
    (function(Log4) {
      Log4.Level = { Debug: "debug", Info: "info", Warn: "warn", Error: "error" };
    })(Log3 || (exports.Log = Log3 = {}));
    var Input4;
    (function(Input5) {
      Input5.PointerType = { Mouse: "mouse", Pen: "pen", Touch: "touch" };
    })(Input4 || (exports.Input = Input4 = {}));
  }
});

// node_modules/webdriver-bidi-protocol/out/gen/permissions.js
var require_permissions = __commonJS({
  "node_modules/webdriver-bidi-protocol/out/gen/permissions.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Permissions = void 0;
    var Permissions3;
    (function(Permissions4) {
      Permissions4.PermissionState = {
        Granted: "granted",
        Denied: "denied",
        Prompt: "prompt"
      };
    })(Permissions3 || (exports.Permissions = Permissions3 = {}));
  }
});

// node_modules/webdriver-bidi-protocol/out/gen/web-bluetooth.js
var require_web_bluetooth = __commonJS({
  "node_modules/webdriver-bidi-protocol/out/gen/web-bluetooth.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/webdriver-bidi-protocol/out/gen/mapping.js
var require_mapping = __commonJS({
  "node_modules/webdriver-bidi-protocol/out/gen/mapping.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/webdriver-bidi-protocol/out/index.js
var require_out = __commonJS({
  "node_modules/webdriver-bidi-protocol/out/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
          enumerable: true,
          get: function() {
            return m[k];
          }
        };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2)
            if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++)
            if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BidiUaClientHints = void 0;
    var BidiUaClientHints = __importStar(require_ua_client_hints());
    exports.BidiUaClientHints = BidiUaClientHints;
    __exportStar(require_main(), exports);
    __exportStar(require_permissions(), exports);
    __exportStar(require_web_bluetooth(), exports);
    __exportStar(require_mapping(), exports);
  }
});

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/BidiMapper.js
var BidiMapper_exports = {};
__export(BidiMapper_exports, {
  BidiServer: () => BidiServer,
  EventEmitter: () => EventEmitter2,
  OutgoingMessage: () => OutgoingMessage
});

// node_modules/mitt/dist/mitt.mjs
function mitt_default(n) {
  return { all: n = n || /* @__PURE__ */ new Map(), on: function(t, e) {
    var i = n.get(t);
    i ? i.push(e) : n.set(t, [e]);
  }, off: function(t, e) {
    var i = n.get(t);
    i && (e ? i.splice(i.indexOf(e) >>> 0, 1) : n.set(t, []));
  }, emit: function(t, e) {
    var i = n.get(t);
    i && i.slice().map(function(n2) {
      n2(e);
    }), (i = n.get("*")) && i.slice().map(function(n2) {
      n2(t, e);
    });
  } };
}

// node_modules/chromium-bidi/out/Default/gen/src/utils/EventEmitter.js
var EventEmitter2 = class {
  #emitter = mitt_default();
  on(type, handler) {
    this.#emitter.on(type, handler);
    return this;
  }
  /**
   * Like `on` but the listener will only be fired once and then it will be removed.
   * @param event The event you'd like to listen to
   * @param handler The handler function to run when the event occurs
   * @return `this` to enable chaining method calls.
   */
  once(event, handler) {
    const onceHandler = (eventData) => {
      handler(eventData);
      this.off(event, onceHandler);
    };
    return this.on(event, onceHandler);
  }
  off(type, handler) {
    this.#emitter.off(type, handler);
    return this;
  }
  /**
   * Emits an event and call any associated listeners.
   *
   * @param event The event to emit.
   * @param eventData Any data to emit with the event.
   * @return `true` if there are any listeners, `false` otherwise.
   */
  emit(event, eventData) {
    this.#emitter.emit(event, eventData);
  }
  /**
   * Removes all listeners. If given an event argument, it will remove only
   * listeners for that event.
   * @param event - the event to remove listeners for.
   * @returns `this` to enable you to chain method calls.
   */
  removeAllListeners(event) {
    if (event) {
      this.#emitter.all.delete(event);
    } else {
      this.#emitter.all.clear();
    }
    return this;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/utils/log.js
var LogType;
(function(LogType2) {
  LogType2["bidi"] = "bidi";
  LogType2["cdp"] = "cdp";
  LogType2["debug"] = "debug";
  LogType2["debugError"] = "debug:error";
  LogType2["debugInfo"] = "debug:info";
  LogType2["debugWarn"] = "debug:warn";
})(LogType || (LogType = {}));

// node_modules/chromium-bidi/out/Default/gen/src/utils/ProcessingQueue.js
var _a;
var ProcessingQueue = class {
  static LOGGER_PREFIX = `${LogType.debug}:queue`;
  #logger;
  #processor;
  #queue = [];
  // Flag to keep only 1 active processor.
  #isProcessing = false;
  constructor(processor, logger) {
    this.#processor = processor;
    this.#logger = logger;
  }
  add(entry, name) {
    this.#queue.push([entry, name]);
    void this.#processIfNeeded();
  }
  async #processIfNeeded() {
    if (this.#isProcessing) {
      return;
    }
    this.#isProcessing = true;
    while (this.#queue.length > 0) {
      const arrayEntry = this.#queue.shift();
      if (!arrayEntry) {
        continue;
      }
      const [entryPromise, name] = arrayEntry;
      this.#logger?.(_a.LOGGER_PREFIX)?.("Processing event:", name);
      await entryPromise.then((entry) => {
        if (entry.kind === "error") {
          this.#logger?.(LogType.debugError)?.("Event threw before sending:", entry.error.message, entry.error.stack);
          return;
        }
        return this.#processor(entry.value);
      }).catch((error) => {
        this.#logger?.(LogType.debugError)?.("Event was not processed:", error?.message);
      });
    }
    this.#isProcessing = false;
  }
};
_a = ProcessingQueue;

// node_modules/chromium-bidi/out/Default/gen/src/protocol/chromium-bidi.js
var chromium_bidi_exports = {};
__export(chromium_bidi_exports, {
  BiDiModule: () => BiDiModule,
  Bluetooth: () => Bluetooth,
  BrowsingContext: () => BrowsingContext,
  EVENT_NAMES: () => EVENT_NAMES,
  Input: () => Input,
  Log: () => Log,
  Network: () => Network,
  Script: () => Script,
  Speculation: () => Speculation
});
var BiDiModule;
(function(BiDiModule2) {
  BiDiModule2["Bluetooth"] = "bluetooth";
  BiDiModule2["Browser"] = "browser";
  BiDiModule2["BrowsingContext"] = "browsingContext";
  BiDiModule2["Cdp"] = "goog:cdp";
  BiDiModule2["Input"] = "input";
  BiDiModule2["Log"] = "log";
  BiDiModule2["Network"] = "network";
  BiDiModule2["Script"] = "script";
  BiDiModule2["Session"] = "session";
  BiDiModule2["Speculation"] = "speculation";
})(BiDiModule || (BiDiModule = {}));
var Script;
(function(Script5) {
  let EventNames;
  (function(EventNames2) {
    EventNames2["Message"] = "script.message";
    EventNames2["RealmCreated"] = "script.realmCreated";
    EventNames2["RealmDestroyed"] = "script.realmDestroyed";
  })(EventNames = Script5.EventNames || (Script5.EventNames = {}));
})(Script || (Script = {}));
var Log;
(function(Log3) {
  let EventNames;
  (function(EventNames2) {
    EventNames2["LogEntryAdded"] = "log.entryAdded";
  })(EventNames = Log3.EventNames || (Log3.EventNames = {}));
})(Log || (Log = {}));
var BrowsingContext;
(function(BrowsingContext6) {
  let EventNames;
  (function(EventNames2) {
    EventNames2["ContextCreated"] = "browsingContext.contextCreated";
    EventNames2["ContextDestroyed"] = "browsingContext.contextDestroyed";
    EventNames2["DomContentLoaded"] = "browsingContext.domContentLoaded";
    EventNames2["DownloadEnd"] = "browsingContext.downloadEnd";
    EventNames2["DownloadWillBegin"] = "browsingContext.downloadWillBegin";
    EventNames2["FragmentNavigated"] = "browsingContext.fragmentNavigated";
    EventNames2["HistoryUpdated"] = "browsingContext.historyUpdated";
    EventNames2["Load"] = "browsingContext.load";
    EventNames2["NavigationAborted"] = "browsingContext.navigationAborted";
    EventNames2["NavigationCommitted"] = "browsingContext.navigationCommitted";
    EventNames2["NavigationFailed"] = "browsingContext.navigationFailed";
    EventNames2["NavigationStarted"] = "browsingContext.navigationStarted";
    EventNames2["UserPromptClosed"] = "browsingContext.userPromptClosed";
    EventNames2["UserPromptOpened"] = "browsingContext.userPromptOpened";
  })(EventNames = BrowsingContext6.EventNames || (BrowsingContext6.EventNames = {}));
})(BrowsingContext || (BrowsingContext = {}));
var Input;
(function(Input4) {
  let EventNames;
  (function(EventNames2) {
    EventNames2["FileDialogOpened"] = "input.fileDialogOpened";
  })(EventNames = Input4.EventNames || (Input4.EventNames = {}));
})(Input || (Input = {}));
var Network;
(function(Network6) {
  let EventNames;
  (function(EventNames2) {
    EventNames2["AuthRequired"] = "network.authRequired";
    EventNames2["BeforeRequestSent"] = "network.beforeRequestSent";
    EventNames2["FetchError"] = "network.fetchError";
    EventNames2["ResponseCompleted"] = "network.responseCompleted";
    EventNames2["ResponseStarted"] = "network.responseStarted";
  })(EventNames = Network6.EventNames || (Network6.EventNames = {}));
})(Network || (Network = {}));
var Bluetooth;
(function(Bluetooth2) {
  let EventNames;
  (function(EventNames2) {
    EventNames2["RequestDevicePromptUpdated"] = "bluetooth.requestDevicePromptUpdated";
    EventNames2["GattConnectionAttempted"] = "bluetooth.gattConnectionAttempted";
    EventNames2["CharacteristicEventGenerated"] = "bluetooth.characteristicEventGenerated";
    EventNames2["DescriptorEventGenerated"] = "bluetooth.descriptorEventGenerated";
  })(EventNames = Bluetooth2.EventNames || (Bluetooth2.EventNames = {}));
})(Bluetooth || (Bluetooth = {}));
var Speculation;
(function(Speculation3) {
  let EventNames;
  (function(EventNames2) {
    EventNames2["PrefetchStatusUpdated"] = "speculation.prefetchStatusUpdated";
  })(EventNames = Speculation3.EventNames || (Speculation3.EventNames = {}));
})(Speculation || (Speculation = {}));
var EVENT_NAMES = /* @__PURE__ */ new Set([
  // keep-sorted start
  ...Object.values(BiDiModule),
  ...Object.values(Bluetooth.EventNames),
  ...Object.values(BrowsingContext.EventNames),
  ...Object.values(Input.EventNames),
  ...Object.values(Log.EventNames),
  ...Object.values(Network.EventNames),
  ...Object.values(Script.EventNames),
  ...Object.values(Speculation.EventNames)
  // keep-sorted end
]);

// node_modules/chromium-bidi/out/Default/gen/src/protocol/generated/webdriver-bidi.js
var ErrorCode = {
  InvalidArgument: "invalid argument",
  InvalidSelector: "invalid selector",
  InvalidSessionId: "invalid session id",
  InvalidWebExtension: "invalid web extension",
  MoveTargetOutOfBounds: "move target out of bounds",
  NoSuchAlert: "no such alert",
  NoSuchNetworkCollector: "no such network collector",
  NoSuchElement: "no such element",
  NoSuchFrame: "no such frame",
  NoSuchHandle: "no such handle",
  NoSuchHistoryEntry: "no such history entry",
  NoSuchIntercept: "no such intercept",
  NoSuchNetworkData: "no such network data",
  NoSuchNode: "no such node",
  NoSuchRequest: "no such request",
  NoSuchScreencast: "no such screencast",
  NoSuchScript: "no such script",
  NoSuchStoragePartition: "no such storage partition",
  NoSuchUserContext: "no such user context",
  NoSuchWebExtension: "no such web extension",
  SessionNotCreated: "session not created",
  UnableToCaptureScreen: "unable to capture screen",
  UnableToCloseBrowser: "unable to close browser",
  UnableToSetCookie: "unable to set cookie",
  UnableToSetFileInput: "unable to set file input",
  UnavailableNetworkData: "unavailable network data",
  UnderspecifiedStoragePartition: "underspecified storage partition",
  UnknownCommand: "unknown command",
  UnknownError: "unknown error",
  UnsupportedOperation: "unsupported operation"
};
var Session;
(function(Session5) {
  Session5.UserPromptHandlerType = {
    Accept: "accept",
    Dismiss: "dismiss",
    Ignore: "ignore"
  };
})(Session || (Session = {}));
var BrowsingContext2;
(function(BrowsingContext6) {
  BrowsingContext6.ReadinessState = {
    None: "none",
    Interactive: "interactive",
    Complete: "complete"
  };
})(BrowsingContext2 || (BrowsingContext2 = {}));
(function(BrowsingContext6) {
  BrowsingContext6.UserPromptType = {
    Alert: "alert",
    Beforeunload: "beforeunload",
    Confirm: "confirm",
    Prompt: "prompt"
  };
})(BrowsingContext2 || (BrowsingContext2 = {}));
(function(BrowsingContext6) {
  BrowsingContext6.CreateType = { Tab: "tab", Window: "window" };
})(BrowsingContext2 || (BrowsingContext2 = {}));
var Emulation;
(function(Emulation3) {
  Emulation3.ForcedColorsModeTheme = { Light: "light", Dark: "dark" };
})(Emulation || (Emulation = {}));
(function(Emulation3) {
  Emulation3.ScreenOrientationNatural = {
    Portrait: "portrait",
    Landscape: "landscape"
  };
})(Emulation || (Emulation = {}));
(function(Emulation3) {
  Emulation3.ScreenOrientationType = {
    PortraitPrimary: "portrait-primary",
    PortraitSecondary: "portrait-secondary",
    LandscapePrimary: "landscape-primary",
    LandscapeSecondary: "landscape-secondary"
  };
})(Emulation || (Emulation = {}));
var Network2;
(function(Network6) {
  Network6.SameSite = {
    Strict: "strict",
    Lax: "lax",
    None: "none",
    Default: "default"
  };
})(Network2 || (Network2 = {}));
(function(Network6) {
  Network6.DataType = { Request: "request", Response: "response" };
})(Network2 || (Network2 = {}));
(function(Network6) {
  Network6.InterceptPhase = {
    BeforeRequestSent: "beforeRequestSent",
    ResponseStarted: "responseStarted",
    AuthRequired: "authRequired"
  };
})(Network2 || (Network2 = {}));
var Script2;
(function(Script5) {
  Script5.RealmType = {
    Window: "window",
    DedicatedWorker: "dedicated-worker",
    SharedWorker: "shared-worker",
    ServiceWorker: "service-worker",
    Worker: "worker",
    PaintWorklet: "paint-worklet",
    AudioWorklet: "audio-worklet",
    Worklet: "worklet"
  };
})(Script2 || (Script2 = {}));
(function(Script5) {
  Script5.ResultOwnership = { Root: "root", None: "none" };
})(Script2 || (Script2 = {}));
var Log2;
(function(Log3) {
  Log3.Level = {
    Debug: "debug",
    Info: "info",
    Warn: "warn",
    Error: "error"
  };
})(Log2 || (Log2 = {}));
var Input2;
(function(Input4) {
  Input4.PointerType = {
    Mouse: "mouse",
    Pen: "pen",
    Touch: "touch"
  };
})(Input2 || (Input2 = {}));

// node_modules/chromium-bidi/out/Default/gen/src/protocol/ErrorResponse.js
var Exception = class extends Error {
  error;
  message;
  stacktrace;
  constructor(error, message, stacktrace) {
    super();
    this.error = error;
    this.message = message;
    this.stacktrace = stacktrace;
  }
  toErrorResponse(commandId) {
    return {
      type: "error",
      id: commandId,
      error: this.error,
      message: this.message,
      stacktrace: this.stacktrace
    };
  }
};
var InvalidArgumentException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.InvalidArgument, message, stacktrace);
  }
};
var InvalidSelectorException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.InvalidSelector, message, stacktrace);
  }
};
var MoveTargetOutOfBoundsException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.MoveTargetOutOfBounds, message, stacktrace);
  }
};
var NoSuchAlertException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchAlert, message, stacktrace);
  }
};
var NoSuchElementException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchElement, message, stacktrace);
  }
};
var NoSuchFrameException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchFrame, message, stacktrace);
  }
};
var NoSuchHandleException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchHandle, message, stacktrace);
  }
};
var NoSuchHistoryEntryException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchHistoryEntry, message, stacktrace);
  }
};
var NoSuchInterceptException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchIntercept, message, stacktrace);
  }
};
var NoSuchNodeException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchNode, message, stacktrace);
  }
};
var NoSuchRequestException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchRequest, message, stacktrace);
  }
};
var NoSuchScriptException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchScript, message, stacktrace);
  }
};
var NoSuchUserContextException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchUserContext, message, stacktrace);
  }
};
var UnknownCommandException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.UnknownCommand, message, stacktrace);
  }
};
var UnknownErrorException = class extends Exception {
  constructor(message, stacktrace = new Error().stack) {
    super(ErrorCode.UnknownError, message, stacktrace);
  }
};
var UnableToCaptureScreenException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.UnableToCaptureScreen, message, stacktrace);
  }
};
var UnsupportedOperationException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.UnsupportedOperation, message, stacktrace);
  }
};
var UnableToSetCookieException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.UnableToSetCookie, message, stacktrace);
  }
};
var UnableToSetFileInputException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.UnableToSetFileInput, message, stacktrace);
  }
};
var InvalidWebExtensionException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.InvalidWebExtension, message, stacktrace);
  }
};
var NoSuchWebExtensionException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchWebExtension, message, stacktrace);
  }
};
var NoSuchNetworkCollectorException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchNetworkCollector, message, stacktrace);
  }
};
var NoSuchNetworkDataException = class extends Exception {
  constructor(message, stacktrace) {
    super(ErrorCode.NoSuchNetworkData, message, stacktrace);
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/protocol/generated/webdriver-bidi-permissions.js
var Permissions;
(function(Permissions3) {
  Permissions3.PermissionState = {
    Granted: "granted",
    Denied: "denied",
    Prompt: "prompt"
  };
})(Permissions || (Permissions = {}));

// node_modules/chromium-bidi/out/Default/gen/src/protocol/generated/webdriver-bidi-nav-speculation.js
var Speculation2;
(function(Speculation3) {
  Speculation3.PreloadingStatus = {
    Pending: "pending",
    Ready: "ready",
    Success: "success",
    Failure: "failure"
  };
})(Speculation2 || (Speculation2 = {}));

// node_modules/chromium-bidi/out/Default/gen/src/protocol/generated/webdriver-bidi-digital-credentials.js
var DigitalCredentials;
(function(DigitalCredentials2) {
  DigitalCredentials2.VirtualWalletAction = {
    Decline: "decline",
    Respond: "respond",
    Wait: "wait",
    Clear: "clear"
  };
})(DigitalCredentials || (DigitalCredentials = {}));

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/BidiNoOpParser.js
var BidiNoOpParser = class {
  // Bluetooth module
  // keep-sorted start block=yes
  parseDisableSimulationParameters(params) {
    return params;
  }
  parseHandleRequestDevicePromptParams(params) {
    return params;
  }
  parseSimulateAdapterParameters(params) {
    return params;
  }
  parseSimulateAdvertisementParameters(params) {
    return params;
  }
  parseSimulateCharacteristicParameters(params) {
    return params;
  }
  parseSimulateCharacteristicResponseParameters(params) {
    return params;
  }
  parseSimulateDescriptorParameters(params) {
    return params;
  }
  parseSimulateDescriptorResponseParameters(params) {
    return params;
  }
  parseSimulateGattConnectionResponseParameters(params) {
    return params;
  }
  parseSimulateGattDisconnectionParameters(params) {
    return params;
  }
  parseSimulatePreconnectedPeripheralParameters(params) {
    return params;
  }
  parseSimulateServiceParameters(params) {
    return params;
  }
  // keep-sorted end
  // Browser module
  // keep-sorted start block=yes
  parseCreateUserContextParameters(params) {
    return params;
  }
  parseRemoveUserContextParameters(params) {
    return params;
  }
  parseSetClientWindowStateParameters(params) {
    return params;
  }
  parseSetDownloadBehaviorParameters(params) {
    return params;
  }
  // keep-sorted end
  // Browsing Context module
  // keep-sorted start block=yes
  parseActivateParams(params) {
    return params;
  }
  parseCaptureScreenshotParams(params) {
    return params;
  }
  parseCloseParams(params) {
    return params;
  }
  parseCreateParams(params) {
    return params;
  }
  parseGetTreeParams(params) {
    return params;
  }
  parseHandleUserPromptParams(params) {
    return params;
  }
  parseLocateNodesParams(params) {
    return params;
  }
  parseNavigateParams(params) {
    return params;
  }
  parsePrintParams(params) {
    return params;
  }
  parseReloadParams(params) {
    return params;
  }
  parseSetBypassCspParams(params) {
    return params;
  }
  parseSetViewportParams(params) {
    return params;
  }
  parseStartScreencastParams(params) {
    return params;
  }
  parseStopScreencastParams(params) {
    return params;
  }
  parseTraverseHistoryParams(params) {
    return params;
  }
  // keep-sorted end
  // CDP module
  // keep-sorted start block=yes
  parseGetSessionParams(params) {
    return params;
  }
  parseResolveRealmParams(params) {
    return params;
  }
  parseSendCommandParams(params) {
    return params;
  }
  // keep-sorted end
  // Emulation module
  // keep-sorted start block=yes
  parseSetClientHintsOverrideParams(params) {
    return params;
  }
  parseSetForcedColorsModeThemeOverrideParams(params) {
    return params;
  }
  parseSetGeolocationOverrideParams(params) {
    return params;
  }
  parseSetLocaleOverrideParams(params) {
    return params;
  }
  parseSetMediaFeaturesOverrideParams(params) {
    return params;
  }
  parseSetNetworkConditionsParams(params) {
    return params;
  }
  parseSetScreenOrientationOverrideParams(params) {
    return params;
  }
  parseSetScreenSettingsOverrideParams(params) {
    return params;
  }
  parseSetScriptingEnabledParams(params) {
    return params;
  }
  parseSetScrollbarTypeOverrideParams(params) {
    return params;
  }
  parseSetTextLayoutModeOverrideParams(params) {
    return params;
  }
  parseSetTimezoneOverrideParams(params) {
    return params;
  }
  parseSetTouchOverrideParams(params) {
    return params;
  }
  parseSetUserAgentOverrideParams(params) {
    return params;
  }
  parseSetViewportMetaOverrideParams(params) {
    return params;
  }
  // keep-sorted end
  // Script module
  // keep-sorted start block=yes
  parseAddPreloadScriptParams(params) {
    return params;
  }
  parseCallFunctionParams(params) {
    return params;
  }
  parseDisownParams(params) {
    return params;
  }
  parseEvaluateParams(params) {
    return params;
  }
  parseGetRealmsParams(params) {
    return params;
  }
  parseRemovePreloadScriptParams(params) {
    return params;
  }
  // keep-sorted end
  // Input module
  // keep-sorted start block=yes
  parsePerformActionsParams(params) {
    return params;
  }
  parseReleaseActionsParams(params) {
    return params;
  }
  parseSetFilesParams(params) {
    return params;
  }
  // keep-sorted end
  // Network module
  // keep-sorted start block=yes
  parseAddDataCollectorParams(params) {
    return params;
  }
  parseAddInterceptParams(params) {
    return params;
  }
  parseContinueRequestParams(params) {
    return params;
  }
  parseContinueResponseParams(params) {
    return params;
  }
  parseContinueWithAuthParams(params) {
    return params;
  }
  parseDisownDataParams(params) {
    return params;
  }
  parseFailRequestParams(params) {
    return params;
  }
  parseGetDataParams(params) {
    return params;
  }
  parseProvideResponseParams(params) {
    return params;
  }
  parseRemoveDataCollectorParams(params) {
    return params;
  }
  parseRemoveInterceptParams(params) {
    return params;
  }
  parseSetCacheBehaviorParams(params) {
    return params;
  }
  parseSetExtraHeadersParams(params) {
    return params;
  }
  // keep-sorted end
  // Permissions module
  // keep-sorted start block=yes
  parseSetPermissionsParams(params) {
    return params;
  }
  // keep-sorted end
  // Session module
  // keep-sorted start block=yes
  parseSubscribeParams(params) {
    return params;
  }
  parseUnsubscribeParams(params) {
    return params;
  }
  // keep-sorted end
  // Storage module
  // keep-sorted start block=yes
  parseDeleteCookiesParams(params) {
    return params;
  }
  parseGetCookiesParams(params) {
    return params;
  }
  parseSetCookieParams(params) {
    return params;
  }
  // keep-sorted end
  // WebExtenstion module
  // keep-sorted start block=yes
  parseInstallParams(params) {
    return params;
  }
  parseUninstallParams(params) {
    return params;
  }
  // keep-sorted end
  // DigitalCredentials module
  // keep-sorted start block=yes
  parseSetVirtualWalletBehaviorParams(params) {
    return params;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/browser/BrowserProcessor.js
var BrowserProcessor = class {
  #browserCdpClient;
  #browsingContextStorage;
  #configStorage;
  #userContextStorage;
  constructor(browserCdpClient, browsingContextStorage, configStorage, userContextStorage) {
    this.#browserCdpClient = browserCdpClient;
    this.#browsingContextStorage = browsingContextStorage;
    this.#configStorage = configStorage;
    this.#userContextStorage = userContextStorage;
  }
  close() {
    setTimeout(() => this.#browserCdpClient.sendCommand("Browser.close").catch(() => {
    }), 0);
    return {};
  }
  async createUserContext(params) {
    const w3cParams = params;
    const globalConfig = this.#configStorage.getGlobalConfig();
    if (w3cParams.acceptInsecureCerts !== void 0) {
      if (w3cParams.acceptInsecureCerts === false && globalConfig.acceptInsecureCerts === true)
        throw new UnknownErrorException(`Cannot set user context's "acceptInsecureCerts" to false, when a capability "acceptInsecureCerts" is set to true`);
    }
    const request = {};
    if (w3cParams.proxy) {
      const proxyStr = getProxyStr(w3cParams.proxy);
      if (proxyStr) {
        request.proxyServer = proxyStr;
      }
      if (w3cParams.proxy.noProxy) {
        request.proxyBypassList = w3cParams.proxy.noProxy.join(",");
      }
    } else {
      if (params["goog:proxyServer"] !== void 0) {
        request.proxyServer = params["goog:proxyServer"];
      }
      const proxyBypassList = params["goog:proxyBypassList"] ?? void 0;
      if (proxyBypassList) {
        request.proxyBypassList = proxyBypassList.join(",");
      }
    }
    const context = await this.#browserCdpClient.sendCommand("Target.createBrowserContext", request);
    await this.#applyDownloadBehavior(globalConfig.downloadBehavior ?? null, context.browserContextId);
    this.#configStorage.updateUserContextConfig(context.browserContextId, {
      acceptInsecureCerts: params["acceptInsecureCerts"],
      userPromptHandler: params["unhandledPromptBehavior"]
    });
    return {
      userContext: context.browserContextId
    };
  }
  async removeUserContext(params) {
    const userContext = params.userContext;
    if (userContext === "default") {
      throw new InvalidArgumentException("`default` user context cannot be removed");
    }
    try {
      await this.#browserCdpClient.sendCommand("Target.disposeBrowserContext", {
        browserContextId: userContext
      });
    } catch (err) {
      if (err.message.startsWith("Failed to find context with id")) {
        throw new NoSuchUserContextException(err.message);
      }
      throw err;
    }
    return {};
  }
  async getUserContexts() {
    return {
      userContexts: await this.#userContextStorage.getUserContexts()
    };
  }
  async #getWindowInfo(targetId) {
    const windowInfo = await this.#browserCdpClient.sendCommand("Browser.getWindowForTarget", { targetId });
    return {
      // `active` is not supported in CDP yet.
      active: false,
      clientWindow: `${windowInfo.windowId}`,
      state: windowInfo.bounds.windowState ?? "normal",
      height: windowInfo.bounds.height ?? 0,
      width: windowInfo.bounds.width ?? 0,
      x: windowInfo.bounds.left ?? 0,
      y: windowInfo.bounds.top ?? 0
    };
  }
  async #getWindowBounds(windowId) {
    try {
      const { bounds } = await this.#browserCdpClient.sendCommand("Browser.getWindowBounds", { windowId });
      return bounds;
    } catch (err) {
      if (err.message.includes("Browser window not found")) {
        throw new UnknownErrorException("no such client window");
      }
      throw err;
    }
  }
  async setClientWindowState(params) {
    const { clientWindow } = params;
    const bounds = {
      windowState: params.state
    };
    if (params.state === "normal") {
      if (params.width !== void 0) {
        bounds.width = params.width;
      }
      if (params.height !== void 0) {
        bounds.height = params.height;
      }
      if (params.x !== void 0) {
        bounds.left = params.x;
      }
      if (params.y !== void 0) {
        bounds.top = params.y;
      }
    }
    const windowId = Number.parseInt(clientWindow);
    if (isNaN(windowId)) {
      throw new UnknownErrorException("no such client window");
    }
    const currentBounds = await this.#getWindowBounds(windowId);
    const currentWindowState = currentBounds.windowState ?? "normal";
    const hasDimensions = params.state === "normal" && (params.width !== void 0 || params.height !== void 0 || params.x !== void 0 || params.y !== void 0);
    if (currentWindowState !== "normal" && (params.state !== currentWindowState || hasDimensions)) {
      await this.#browserCdpClient.sendCommand("Browser.setWindowBounds", {
        windowId,
        bounds: { windowState: "normal" }
      });
    }
    if (params.state !== "normal" || currentWindowState === "normal" || hasDimensions) {
      await this.#browserCdpClient.sendCommand("Browser.setWindowBounds", {
        windowId,
        bounds
      });
    }
    const resultBounds = await this.#getWindowBounds(windowId);
    return {
      active: false,
      clientWindow: `${windowId}`,
      state: resultBounds.windowState ?? "normal",
      height: resultBounds.height ?? 0,
      width: resultBounds.width ?? 0,
      x: resultBounds.left ?? 0,
      y: resultBounds.top ?? 0
    };
  }
  async getClientWindows() {
    const topLevelTargetIds = this.#browsingContextStorage.getTopLevelContexts().map((b) => b.cdpTarget.id);
    const clientWindows = await Promise.all(topLevelTargetIds.map(async (targetId) => await this.#getWindowInfo(targetId)));
    const uniqueClientWindowIds = /* @__PURE__ */ new Set();
    const uniqueClientWindows = new Array();
    for (const window2 of clientWindows) {
      if (!uniqueClientWindowIds.has(window2.clientWindow)) {
        uniqueClientWindowIds.add(window2.clientWindow);
        uniqueClientWindows.push(window2);
      }
    }
    return { clientWindows: uniqueClientWindows };
  }
  #toCdpDownloadBehavior(downloadBehavior) {
    if (downloadBehavior === null)
      return {
        behavior: "default"
      };
    if (downloadBehavior?.type === "denied")
      return {
        behavior: "deny"
      };
    if (downloadBehavior?.type === "allowed") {
      return {
        behavior: "allow",
        downloadPath: downloadBehavior.destinationFolder
      };
    }
    throw new UnknownErrorException("Unexpected download behavior");
  }
  async #applyDownloadBehavior(downloadBehavior, userContext) {
    await this.#browserCdpClient.sendCommand("Browser.setDownloadBehavior", {
      ...this.#toCdpDownloadBehavior(downloadBehavior),
      browserContextId: userContext === "default" ? void 0 : userContext,
      // Required for enabling download events.
      eventsEnabled: true
    });
  }
  async setDownloadBehavior(params) {
    let userContexts;
    if (params.userContexts === void 0) {
      userContexts = (await this.#userContextStorage.getUserContexts()).map((c) => c.userContext);
    } else {
      userContexts = Array.from(await this.#userContextStorage.verifyUserContextIdList(params.userContexts));
    }
    if (params.userContexts === void 0) {
      this.#configStorage.updateGlobalConfig({
        downloadBehavior: params.downloadBehavior
      });
    } else {
      params.userContexts.map((userContext) => this.#configStorage.updateUserContextConfig(userContext, {
        downloadBehavior: params.downloadBehavior
      }));
    }
    await Promise.all(userContexts.map(async (userContext) => {
      const downloadBehavior = this.#configStorage.getActiveConfig(void 0, userContext).downloadBehavior ?? null;
      await this.#applyDownloadBehavior(downloadBehavior, userContext);
    }));
    return {};
  }
};
function getProxyStr(proxyConfig) {
  if (proxyConfig.proxyType === "direct" || proxyConfig.proxyType === "system") {
    return void 0;
  }
  if (proxyConfig.proxyType === "pac") {
    throw new UnsupportedOperationException(`PAC proxy configuration is not supported per user context`);
  }
  if (proxyConfig.proxyType === "autodetect") {
    throw new UnsupportedOperationException(`Autodetect proxy is not supported per user context`);
  }
  if (proxyConfig.proxyType === "manual") {
    const servers = [];
    if (proxyConfig.httpProxy !== void 0) {
      servers.push(`http=${proxyConfig.httpProxy}`);
    }
    if (proxyConfig.sslProxy !== void 0) {
      servers.push(`https=${proxyConfig.sslProxy}`);
    }
    if (proxyConfig.socksProxy !== void 0 || proxyConfig.socksVersion !== void 0) {
      if (proxyConfig.socksProxy === void 0) {
        throw new InvalidArgumentException(`'socksVersion' cannot be set without 'socksProxy'`);
      }
      if (proxyConfig.socksVersion === void 0 || typeof proxyConfig.socksVersion !== "number" || !Number.isInteger(proxyConfig.socksVersion) || proxyConfig.socksVersion < 0 || proxyConfig.socksVersion > 255) {
        throw new InvalidArgumentException(`'socksVersion' must be between 0 and 255`);
      }
      servers.push(`socks=socks${proxyConfig.socksVersion}://${proxyConfig.socksProxy}`);
    }
    if (servers.length === 0) {
      return void 0;
    }
    return servers.join(";");
  }
  throw new UnknownErrorException(`Unknown proxy type`);
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/cdp/CdpProcessor.js
var CdpProcessor = class {
  #browsingContextStorage;
  #realmStorage;
  #cdpConnection;
  #browserCdpClient;
  constructor(browsingContextStorage, realmStorage, cdpConnection, browserCdpClient) {
    this.#browsingContextStorage = browsingContextStorage;
    this.#realmStorage = realmStorage;
    this.#cdpConnection = cdpConnection;
    this.#browserCdpClient = browserCdpClient;
  }
  getSession(params) {
    const context = params.context;
    const sessionId = this.#browsingContextStorage.getContext(context).cdpTarget.cdpSessionId;
    if (sessionId === void 0) {
      return {};
    }
    return { session: sessionId };
  }
  resolveRealm(params) {
    const context = params.realm;
    const realm = this.#realmStorage.getRealm({ realmId: context });
    if (realm === void 0) {
      throw new UnknownErrorException(`Could not find realm ${params.realm}`);
    }
    return { executionContextId: realm.executionContextId };
  }
  async sendCommand(params) {
    const client = params.session ? this.#cdpConnection.getCdpClient(params.session) : this.#browserCdpClient;
    const result = await client.sendCommand(params.method, params.params);
    return {
      result,
      session: params.session
    };
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/context/BrowsingContextProcessor.js
var BrowsingContextProcessor = class {
  #browserCdpClient;
  #browsingContextStorage;
  #contextConfigStorage;
  #eventManager;
  #userContextStorage;
  constructor(browserCdpClient, browsingContextStorage, userContextStorage, contextConfigStorage, eventManager) {
    this.#contextConfigStorage = contextConfigStorage;
    this.#userContextStorage = userContextStorage;
    this.#browserCdpClient = browserCdpClient;
    this.#browsingContextStorage = browsingContextStorage;
    this.#eventManager = eventManager;
    this.#eventManager.addSubscribeHook(chromium_bidi_exports.BrowsingContext.EventNames.ContextCreated, this.#onContextCreatedSubscribeHook.bind(this));
  }
  getTree(params) {
    const resultContexts = params.root === void 0 ? this.#browsingContextStorage.getTopLevelContexts() : [this.#browsingContextStorage.getContext(params.root)];
    return {
      contexts: resultContexts.map((c) => c.serializeToBidiValue(params.maxDepth ?? Number.MAX_VALUE))
    };
  }
  async create(params) {
    let referenceContext;
    let userContext = "default";
    if (params.referenceContext !== void 0) {
      referenceContext = this.#browsingContextStorage.getContext(params.referenceContext);
      if (!referenceContext.isTopLevelContext()) {
        throw new InvalidArgumentException(`referenceContext should be a top-level context`);
      }
      userContext = referenceContext.userContext;
    }
    if (params.userContext !== void 0) {
      userContext = params.userContext;
    }
    const existingContexts = this.#browsingContextStorage.getAllContexts().filter((context2) => context2.userContext === userContext);
    let newWindow = false;
    switch (params.type) {
      case BrowsingContext2.CreateType.Tab:
        newWindow = false;
        break;
      case BrowsingContext2.CreateType.Window:
        newWindow = true;
        break;
    }
    if (!existingContexts.length) {
      newWindow = true;
    }
    let result;
    try {
      result = await this.#browserCdpClient.sendCommand("Target.createTarget", {
        url: "about:blank",
        newWindow,
        browserContextId: userContext === "default" ? void 0 : userContext,
        background: params.background === true
      });
    } catch (err) {
      if (
        // See https://source.chromium.org/chromium/chromium/src/+/main:chrome/browser/devtools/protocol/target_handler.cc;l=90;drc=e80392ac11e48a691f4309964cab83a3a59e01c8
        err.message.startsWith("Failed to find browser context with id") || // See https://source.chromium.org/chromium/chromium/src/+/main:headless/lib/browser/protocol/target_handler.cc;l=49;drc=e80392ac11e48a691f4309964cab83a3a59e01c8
        err.message === "browserContextId"
      ) {
        throw new NoSuchUserContextException(`The context ${userContext} was not found`);
      }
      throw err;
    }
    const context = await this.#browsingContextStorage.waitForContext(result.targetId);
    await context.lifecycleLoaded();
    return {
      context: context.id,
      userContext: context.userContext
    };
  }
  navigate(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    return context.navigate(params.url, params.wait ?? BrowsingContext2.ReadinessState.None);
  }
  reload(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    return context.reload(params.ignoreCache ?? false, params.wait ?? BrowsingContext2.ReadinessState.None);
  }
  async activate(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    if (!context.isTopLevelContext()) {
      throw new InvalidArgumentException("Activation is only supported on the top-level context");
    }
    await context.activate();
    return {};
  }
  async captureScreenshot(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    return await context.captureScreenshot(params);
  }
  async print(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    return await context.print(params);
  }
  async setViewport(params) {
    const maxDimensionSize = 1e7;
    if ((params.viewport?.height ?? 0) > maxDimensionSize || (params.viewport?.width ?? 0) > maxDimensionSize) {
      throw new UnsupportedOperationException(`Viewport dimension over ${maxDimensionSize} are not supported`);
    }
    const config = {};
    if (params.devicePixelRatio !== void 0) {
      config.devicePixelRatio = params.devicePixelRatio;
    }
    if (params.viewport !== void 0) {
      config.viewport = params.viewport;
    }
    const impactedTopLevelContexts = await this.#getRelatedTopLevelBrowsingContexts(params.context, params.userContexts);
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, config);
    }
    if (params.context !== void 0) {
      this.#contextConfigStorage.updateBrowsingContextConfig(params.context, config);
    }
    await Promise.all(impactedTopLevelContexts.map(async (context) => {
      const config2 = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setViewport(config2.viewport ?? null, config2.devicePixelRatio ?? null, config2.screenOrientation ?? null);
    }));
    return {};
  }
  /**
   * Returns a list of top-level browsing context ids.
   */
  async #getRelatedTopLevelBrowsingContexts(browsingContextId, userContextIds) {
    if (browsingContextId === void 0 && userContextIds === void 0) {
      throw new InvalidArgumentException("Either userContexts or context must be provided");
    }
    if (browsingContextId !== void 0 && userContextIds !== void 0) {
      throw new InvalidArgumentException("userContexts and context are mutually exclusive");
    }
    if (browsingContextId !== void 0) {
      const context = this.#browsingContextStorage.getContext(browsingContextId);
      if (!context.isTopLevelContext()) {
        throw new InvalidArgumentException("Emulating viewport is only supported on the top-level context");
      }
      return [context];
    }
    await this.#userContextStorage.verifyUserContextIdList(userContextIds);
    const result = [];
    for (const userContextId of userContextIds) {
      const topLevelBrowsingContexts = this.#browsingContextStorage.getTopLevelContexts().filter((browsingContext) => browsingContext.userContext === userContextId);
      result.push(...topLevelBrowsingContexts);
    }
    return [...new Set(result).values()];
  }
  async traverseHistory(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    if (!context) {
      throw new InvalidArgumentException(`No browsing context with id ${params.context}`);
    }
    if (!context.isTopLevelContext()) {
      throw new InvalidArgumentException("Traversing history is only supported on the top-level context");
    }
    await context.traverseHistory(params.delta);
    return {};
  }
  async handleUserPrompt(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    try {
      await context.handleUserPrompt(params.accept, params.userText);
    } catch (error) {
      if (error.message?.includes("No dialog is showing")) {
        throw new NoSuchAlertException("No dialog is showing");
      }
      throw error;
    }
    return {};
  }
  async close(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    if (!context.isTopLevelContext()) {
      throw new InvalidArgumentException(`Non top-level browsing context ${context.id} cannot be closed.`);
    }
    const parentCdpClient = context.cdpTarget.parentCdpClient;
    try {
      const detachedFromTargetPromise = new Promise((resolve) => {
        const onContextDestroyed = (event) => {
          if (event.targetId === params.context) {
            parentCdpClient.off("Target.detachedFromTarget", onContextDestroyed);
            resolve();
          }
        };
        parentCdpClient.on("Target.detachedFromTarget", onContextDestroyed);
      });
      try {
        if (params.promptUnload) {
          await context.close();
        } else {
          await parentCdpClient.sendCommand("Target.closeTarget", {
            targetId: params.context
          });
        }
      } catch (error) {
        if (!parentCdpClient.isCloseError(error)) {
          throw error;
        }
      }
      await detachedFromTargetPromise;
    } catch (error) {
      if (!(error.code === -32e3 && error.message === "Not attached to an active page")) {
        throw error;
      }
    }
    return {};
  }
  async locateNodes(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    return await context.locateNodes(params);
  }
  #onContextCreatedSubscribeHook(contextId) {
    const context = this.#browsingContextStorage.getContext(contextId);
    const contextsToReport = [
      context,
      ...this.#browsingContextStorage.getContext(contextId).allChildren
    ];
    contextsToReport.forEach((context2) => {
      this.#eventManager.registerEvent({
        type: "event",
        method: chromium_bidi_exports.BrowsingContext.EventNames.ContextCreated,
        params: context2.serializeToBidiValue()
      }, context2.id);
    });
    return Promise.resolve();
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/emulation/EmulationProcessor.js
var SUPPORTED_MEDIA_FEATURES = /* @__PURE__ */ new Set([
  "color-gamut",
  "forced-colors",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-data",
  "prefers-reduced-motion",
  "prefers-reduced-transparency"
]);
var EmulationProcessor = class {
  #userContextStorage;
  #browsingContextStorage;
  #contextConfigStorage;
  constructor(browsingContextStorage, userContextStorage, contextConfigStorage) {
    this.#userContextStorage = userContextStorage;
    this.#browsingContextStorage = browsingContextStorage;
    this.#contextConfigStorage = contextConfigStorage;
  }
  async setGeolocationOverride(params) {
    if ("coordinates" in params && "error" in params) {
      throw new InvalidArgumentException("Coordinates and error cannot be set at the same time");
    }
    let geolocation = null;
    if ("coordinates" in params) {
      if ((params.coordinates?.altitude ?? null) === null && (params.coordinates?.altitudeAccuracy ?? null) !== null) {
        throw new InvalidArgumentException("Geolocation altitudeAccuracy can be set only with altitude");
      }
      geolocation = params.coordinates;
    } else if ("error" in params) {
      if (params.error.type !== "positionUnavailable") {
        throw new InvalidArgumentException(`Unknown geolocation error ${params.error.type}`);
      }
      geolocation = params.error;
    } else {
      throw new InvalidArgumentException(`Coordinates or error should be set`);
    }
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        geolocation
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        geolocation
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setGeolocationOverride(config.geolocation ?? null);
    }));
    return {};
  }
  async setLocaleOverride(params) {
    const locale = params.locale ?? null;
    if (locale !== null && !isValidLocale(locale)) {
      throw new InvalidArgumentException(`Invalid locale "${locale}"`);
    }
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        locale
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        locale
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await Promise.all([
        context.setLocaleOverride(config.locale ?? null),
        // Set `AcceptLanguage` to locale.
        context.setUserAgentAndAcceptLanguage(config.userAgent, config.locale, config.clientHints)
      ]);
    }));
    return {};
  }
  async setMediaFeaturesOverride(params) {
    const unsupportedFeatures = Object.keys(params.features ?? {}).filter((feature) => !SUPPORTED_MEDIA_FEATURES.has(feature));
    if (unsupportedFeatures.length > 0) {
      throw new UnsupportedOperationException(`Media feature(s) not supported: ${unsupportedFeatures.map((f) => `"${f}"`).join(", ")}`);
    }
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts, true);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        mediaFeatures: params.features
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        mediaFeatures: params.features
      });
    }
    if (params.contexts === void 0 && params.userContexts === void 0) {
      this.#contextConfigStorage.updateGlobalConfig({
        mediaFeatures: params.features
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setMediaFeaturesOverride(config.mediaFeatures ?? null);
    }));
    return {};
  }
  async setScriptingEnabled(params) {
    const scriptingEnabled = params.enabled;
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        scriptingEnabled
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        scriptingEnabled
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setScriptingEnabled(config.scriptingEnabled ?? null);
    }));
    return {};
  }
  async setScrollbarTypeOverride(params) {
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts, true);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        scrollbarType: params.scrollbarType
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        scrollbarType: params.scrollbarType
      });
    }
    if (params.contexts === void 0 && params.userContexts === void 0) {
      this.#contextConfigStorage.updateGlobalConfig({
        scrollbarType: params.scrollbarType
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setScrollbarTypeOverride(config.scrollbarType ?? null);
    }));
    return {};
  }
  async setScreenOrientationOverride(params) {
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        screenOrientation: params.screenOrientation
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        screenOrientation: params.screenOrientation
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setViewport(config.viewport ?? null, config.devicePixelRatio ?? null, config.screenOrientation ?? null);
    }));
    return {};
  }
  async setScreenSettingsOverride(params) {
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        screenArea: params.screenArea
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        screenArea: params.screenArea
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setViewport(config.viewport ?? null, config.devicePixelRatio ?? null, config.screenOrientation ?? null);
    }));
    return {};
  }
  /**
   * Returns a list of top-level browsing contexts.
   */
  async #getRelatedTopLevelBrowsingContexts(browsingContextIds, userContextIds, allowGlobal = false) {
    if (browsingContextIds === void 0 && userContextIds === void 0) {
      if (allowGlobal) {
        return this.#browsingContextStorage.getTopLevelContexts();
      }
      throw new InvalidArgumentException("Either user contexts or browsing contexts must be provided");
    }
    if (browsingContextIds !== void 0 && userContextIds !== void 0) {
      throw new InvalidArgumentException("User contexts and browsing contexts are mutually exclusive");
    }
    const result = [];
    if (browsingContextIds === void 0) {
      if (userContextIds.length === 0) {
        throw new InvalidArgumentException("user context should be provided");
      }
      await this.#userContextStorage.verifyUserContextIdList(userContextIds);
      for (const userContextId of userContextIds) {
        const topLevelBrowsingContexts = this.#browsingContextStorage.getTopLevelContexts().filter((browsingContext) => browsingContext.userContext === userContextId);
        result.push(...topLevelBrowsingContexts);
      }
    } else {
      if (browsingContextIds.length === 0) {
        throw new InvalidArgumentException("browsing context should be provided");
      }
      for (const browsingContextId of browsingContextIds) {
        const browsingContext = this.#browsingContextStorage.getContext(browsingContextId);
        if (!browsingContext.isTopLevelContext()) {
          throw new InvalidArgumentException("The command is only supported on the top-level context");
        }
        result.push(browsingContext);
      }
    }
    return [...new Set(result).values()];
  }
  async setTimezoneOverride(params) {
    let timezone = params.timezone ?? null;
    if (timezone !== null && !isValidTimezone(timezone)) {
      throw new InvalidArgumentException(`Invalid timezone "${timezone}"`);
    }
    if (timezone !== null && isTimeZoneOffsetString(timezone)) {
      timezone = `GMT${timezone}`;
    }
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        timezone
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        timezone
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setTimezoneOverride(config.timezone ?? null);
    }));
    return {};
  }
  async setTouchOverride(params) {
    const maxTouchPoints = params.maxTouchPoints;
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts, true);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        maxTouchPoints
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        maxTouchPoints
      });
    }
    if (params.contexts === void 0 && params.userContexts === void 0) {
      this.#contextConfigStorage.updateGlobalConfig({
        maxTouchPoints
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setTouchOverride(config.maxTouchPoints ?? null);
    }));
    return {};
  }
  async setUserAgentOverrideParams(params) {
    if (params.userAgent === "") {
      throw new UnsupportedOperationException("empty user agent string is not supported");
    }
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts, true);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        userAgent: params.userAgent
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        userAgent: params.userAgent
      });
    }
    if (params.contexts === void 0 && params.userContexts === void 0) {
      this.#contextConfigStorage.updateGlobalConfig({
        userAgent: params.userAgent
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setUserAgentAndAcceptLanguage(config.userAgent, config.locale, config.clientHints);
    }));
    return {};
  }
  async setClientHintsOverride(params) {
    const clientHints = params.clientHints ?? null;
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts, true);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        clientHints
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        clientHints
      });
    }
    if (params.contexts === void 0 && params.userContexts === void 0) {
      this.#contextConfigStorage.updateGlobalConfig({
        clientHints
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setUserAgentAndAcceptLanguage(config.userAgent, config.locale, config.clientHints);
    }));
    return {};
  }
  async setNetworkConditions(params) {
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts, true);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        emulatedNetworkConditions: params.networkConditions
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        emulatedNetworkConditions: params.networkConditions
      });
    }
    if (params.contexts === void 0 && params.userContexts === void 0) {
      this.#contextConfigStorage.updateGlobalConfig({
        emulatedNetworkConditions: params.networkConditions
      });
    }
    if (params.networkConditions !== null && params.networkConditions.type !== "offline") {
      throw new UnsupportedOperationException(`Unsupported network conditions ${params.networkConditions.type}`);
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setEmulatedNetworkConditions(config.emulatedNetworkConditions ?? null);
    }));
    return {};
  }
  async setViewportMetaOverride(params) {
    const browsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts, true);
    for (const browsingContextId of params.contexts ?? []) {
      this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, {
        viewportMeta: params.viewportMeta
      });
    }
    for (const userContextId of params.userContexts ?? []) {
      this.#contextConfigStorage.updateUserContextConfig(userContextId, {
        viewportMeta: params.viewportMeta
      });
    }
    if (params.contexts === void 0 && params.userContexts === void 0) {
      this.#contextConfigStorage.updateGlobalConfig({
        viewportMeta: params.viewportMeta
      });
    }
    await Promise.all(browsingContexts.map(async (context) => {
      const config = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext);
      await context.setViewportMetaOverride(config.viewportMeta ?? null);
    }));
    return {};
  }
};
function isValidLocale(locale) {
  try {
    new Intl.Locale(locale);
    return true;
  } catch (e) {
    if (e instanceof RangeError) {
      return false;
    }
    throw e;
  }
}
function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat(void 0, { timeZone: timezone });
    return true;
  } catch (e) {
    if (e instanceof RangeError) {
      return false;
    }
    throw e;
  }
}
function isTimeZoneOffsetString(timezone) {
  return /^[+-](?:2[0-3]|[01]\d)(?::[0-5]\d)?$/.test(timezone);
}

// node_modules/chromium-bidi/out/Default/gen/src/utils/assert.js
function assert2(predicate, message) {
  if (!predicate) {
    throw new Error(message ?? "Internal assertion failed.");
  }
}

// node_modules/chromium-bidi/out/Default/gen/src/utils/graphemeTools.js
function isSingleComplexGrapheme(value) {
  return isSingleGrapheme(value) && value.length > 1;
}
function isSingleGrapheme(value) {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  return [...segmenter.segment(value)].length === 1;
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/input/InputSource.js
var SourceType;
(function(SourceType2) {
  SourceType2["Key"] = "key";
  SourceType2["Pointer"] = "pointer";
  SourceType2["Wheel"] = "wheel";
  SourceType2["None"] = "none";
})(SourceType || (SourceType = {}));
var NoneSource = class {
  type = "none";
};
var KeySource = class {
  type = "key";
  pressed = /* @__PURE__ */ new Set();
  // This is a bitfield that matches the modifiers parameter of
  // https://chromedevtools.github.io/devtools-protocol/tot/Input/#method-dispatchKeyEvent
  #modifiers = 0;
  get modifiers() {
    return this.#modifiers;
  }
  get alt() {
    return (this.#modifiers & 1) === 1;
  }
  set alt(value) {
    this.#setModifier(value, 1);
  }
  get ctrl() {
    return (this.#modifiers & 2) === 2;
  }
  set ctrl(value) {
    this.#setModifier(value, 2);
  }
  get meta() {
    return (this.#modifiers & 4) === 4;
  }
  set meta(value) {
    this.#setModifier(value, 4);
  }
  get shift() {
    return (this.#modifiers & 8) === 8;
  }
  set shift(value) {
    this.#setModifier(value, 8);
  }
  #setModifier(value, bit) {
    if (value) {
      this.#modifiers |= bit;
    } else {
      this.#modifiers &= ~bit;
    }
  }
};
var ClickContext = class _ClickContext {
  static #DOUBLE_CLICK_TIME_MS = 500;
  static #MAX_DOUBLE_CLICK_RADIUS = 2;
  count = 0;
  #x;
  #y;
  #time;
  constructor(x, y, time) {
    this.#x = x;
    this.#y = y;
    this.#time = time;
  }
  compare(context) {
    return (
      // The click needs to be within a certain amount of ms.
      context.#time - this.#time > _ClickContext.#DOUBLE_CLICK_TIME_MS || // The click needs to be within a certain square radius.
      Math.abs(context.#x - this.#x) > _ClickContext.#MAX_DOUBLE_CLICK_RADIUS || Math.abs(context.#y - this.#y) > _ClickContext.#MAX_DOUBLE_CLICK_RADIUS
    );
  }
};
var PointerSource = class {
  type = "pointer";
  subtype;
  pointerId;
  pressed = /* @__PURE__ */ new Set();
  x = 0;
  y = 0;
  radiusX;
  radiusY;
  force;
  constructor(id, subtype) {
    this.pointerId = id;
    this.subtype = subtype;
  }
  // This is a bitfield that matches the buttons parameter of
  // https://chromedevtools.github.io/devtools-protocol/tot/Input/#method-dispatchMouseEvent
  get buttons() {
    let buttons = 0;
    for (const button of this.pressed) {
      switch (button) {
        case 0:
          buttons |= 1;
          break;
        case 1:
          buttons |= 4;
          break;
        case 2:
          buttons |= 2;
          break;
        case 3:
          buttons |= 8;
          break;
        case 4:
          buttons |= 16;
          break;
      }
    }
    return buttons;
  }
  // --- Platform-specific code starts here ---
  // Input.dispatchMouseEvent doesn't know the concept of double click, so we
  // need to create the logic, similar to how it's done for OSes:
  // https://source.chromium.org/chromium/chromium/src/+/refs/heads/main:ui/events/event.cc;l=479
  #clickContexts = /* @__PURE__ */ new Map();
  setClickCount(button, context) {
    let storedContext = this.#clickContexts.get(button);
    if (!storedContext || storedContext.compare(context)) {
      storedContext = context;
    }
    ++storedContext.count;
    this.#clickContexts.set(button, storedContext);
    return storedContext.count;
  }
  getClickCount(button) {
    return this.#clickContexts.get(button)?.count ?? 0;
  }
  /**
   * Resets click count. Resets consequent click counter. Prevents grouping clicks in
   * different `performActions` calls, so that they are not grouped as double, triple etc
   * clicks. Required for https://github.com/GoogleChromeLabs/chromium-bidi/issues/3043.
   */
  resetClickCount() {
    this.#clickContexts = /* @__PURE__ */ new Map();
  }
};
var WheelSource = class {
  type = "wheel";
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/input/keyUtils.js
function getNormalizedKey(value) {
  switch (value) {
    case "\uE000":
      return "Unidentified";
    case "\uE001":
      return "Cancel";
    case "\uE002":
      return "Help";
    case "\uE003":
      return "Backspace";
    case "\uE004":
      return "Tab";
    case "\uE005":
      return "Clear";
    // Specification declares the '\uE006' to be `Return`, but it is not supported by
    // Chrome, so fall back to `Enter`, which aligns with WPT.
    case "\uE006":
    case "\uE007":
      return "Enter";
    case "\uE008":
      return "Shift";
    case "\uE009":
      return "Control";
    case "\uE00A":
      return "Alt";
    case "\uE00B":
      return "Pause";
    case "\uE00C":
      return "Escape";
    case "\uE00D":
      return " ";
    case "\uE00E":
      return "PageUp";
    case "\uE00F":
      return "PageDown";
    case "\uE010":
      return "End";
    case "\uE011":
      return "Home";
    case "\uE012":
      return "ArrowLeft";
    case "\uE013":
      return "ArrowUp";
    case "\uE014":
      return "ArrowRight";
    case "\uE015":
      return "ArrowDown";
    case "\uE016":
      return "Insert";
    case "\uE017":
      return "Delete";
    case "\uE018":
      return ";";
    case "\uE019":
      return "=";
    case "\uE01A":
      return "0";
    case "\uE01B":
      return "1";
    case "\uE01C":
      return "2";
    case "\uE01D":
      return "3";
    case "\uE01E":
      return "4";
    case "\uE01F":
      return "5";
    case "\uE020":
      return "6";
    case "\uE021":
      return "7";
    case "\uE022":
      return "8";
    case "\uE023":
      return "9";
    case "\uE024":
      return "*";
    case "\uE025":
      return "+";
    case "\uE026":
      return ",";
    case "\uE027":
      return "-";
    case "\uE028":
      return ".";
    case "\uE029":
      return "/";
    case "\uE031":
      return "F1";
    case "\uE032":
      return "F2";
    case "\uE033":
      return "F3";
    case "\uE034":
      return "F4";
    case "\uE035":
      return "F5";
    case "\uE036":
      return "F6";
    case "\uE037":
      return "F7";
    case "\uE038":
      return "F8";
    case "\uE039":
      return "F9";
    case "\uE03A":
      return "F10";
    case "\uE03B":
      return "F11";
    case "\uE03C":
      return "F12";
    case "\uE03D":
      return "Meta";
    case "\uE040":
      return "ZenkakuHankaku";
    case "\uE050":
      return "Shift";
    case "\uE051":
      return "Control";
    case "\uE052":
      return "Alt";
    case "\uE053":
      return "Meta";
    case "\uE054":
      return "PageUp";
    case "\uE055":
      return "PageDown";
    case "\uE056":
      return "End";
    case "\uE057":
      return "Home";
    case "\uE058":
      return "ArrowLeft";
    case "\uE059":
      return "ArrowUp";
    case "\uE05A":
      return "ArrowRight";
    case "\uE05B":
      return "ArrowDown";
    case "\uE05C":
      return "Insert";
    case "\uE05D":
      return "Delete";
    default:
      return value;
  }
}
function getKeyCode(key) {
  switch (key) {
    case "`":
    case "~":
      return "Backquote";
    case "\\":
    case "|":
      return "Backslash";
    case "\uE003":
      return "Backspace";
    case "[":
    case "{":
      return "BracketLeft";
    case "]":
    case "}":
      return "BracketRight";
    case ",":
    case "<":
      return "Comma";
    case "0":
    case ")":
      return "Digit0";
    case "1":
    case "!":
      return "Digit1";
    case "2":
    case "@":
      return "Digit2";
    case "3":
    case "#":
      return "Digit3";
    case "4":
    case "$":
      return "Digit4";
    case "5":
    case "%":
      return "Digit5";
    case "6":
    case "^":
      return "Digit6";
    case "7":
    case "&":
      return "Digit7";
    case "8":
    case "*":
      return "Digit8";
    case "9":
    case "(":
      return "Digit9";
    case "=":
    case "+":
      return "Equal";
    // The spec declares the '<' to be `IntlBackslash` as well, but it is already covered
    // in the `Comma` above.
    case ">":
      return "IntlBackslash";
    case "a":
    case "A":
      return "KeyA";
    case "b":
    case "B":
      return "KeyB";
    case "c":
    case "C":
      return "KeyC";
    case "d":
    case "D":
      return "KeyD";
    case "e":
    case "E":
      return "KeyE";
    case "f":
    case "F":
      return "KeyF";
    case "g":
    case "G":
      return "KeyG";
    case "h":
    case "H":
      return "KeyH";
    case "i":
    case "I":
      return "KeyI";
    case "j":
    case "J":
      return "KeyJ";
    case "k":
    case "K":
      return "KeyK";
    case "l":
    case "L":
      return "KeyL";
    case "m":
    case "M":
      return "KeyM";
    case "n":
    case "N":
      return "KeyN";
    case "o":
    case "O":
      return "KeyO";
    case "p":
    case "P":
      return "KeyP";
    case "q":
    case "Q":
      return "KeyQ";
    case "r":
    case "R":
      return "KeyR";
    case "s":
    case "S":
      return "KeyS";
    case "t":
    case "T":
      return "KeyT";
    case "u":
    case "U":
      return "KeyU";
    case "v":
    case "V":
      return "KeyV";
    case "w":
    case "W":
      return "KeyW";
    case "x":
    case "X":
      return "KeyX";
    case "y":
    case "Y":
      return "KeyY";
    case "z":
    case "Z":
      return "KeyZ";
    case "-":
    case "_":
      return "Minus";
    case ".":
      return "Period";
    case "'":
    case '"':
      return "Quote";
    case ";":
    case ":":
      return "Semicolon";
    case "/":
    case "?":
      return "Slash";
    case "\uE00A":
      return "AltLeft";
    case "\uE052":
      return "AltRight";
    case "\uE009":
      return "ControlLeft";
    case "\uE051":
      return "ControlRight";
    case "\uE006":
      return "Enter";
    case "\uE00B":
      return "Pause";
    case "\uE03D":
      return "MetaLeft";
    case "\uE053":
      return "MetaRight";
    case "\uE008":
      return "ShiftLeft";
    case "\uE050":
      return "ShiftRight";
    case " ":
    case "\uE00D":
      return "Space";
    case "\uE004":
      return "Tab";
    case "\uE017":
      return "Delete";
    case "\uE010":
      return "End";
    case "\uE002":
      return "Help";
    case "\uE011":
      return "Home";
    case "\uE016":
      return "Insert";
    case "\uE00F":
      return "PageDown";
    case "\uE00E":
      return "PageUp";
    case "\uE015":
      return "ArrowDown";
    case "\uE012":
      return "ArrowLeft";
    case "\uE014":
      return "ArrowRight";
    case "\uE013":
      return "ArrowUp";
    case "\uE00C":
      return "Escape";
    case "\uE031":
      return "F1";
    case "\uE032":
      return "F2";
    case "\uE033":
      return "F3";
    case "\uE034":
      return "F4";
    case "\uE035":
      return "F5";
    case "\uE036":
      return "F6";
    case "\uE037":
      return "F7";
    case "\uE038":
      return "F8";
    case "\uE039":
      return "F9";
    case "\uE03A":
      return "F10";
    case "\uE03B":
      return "F11";
    case "\uE03C":
      return "F12";
    case "\uE019":
      return "NumpadEqual";
    case "\uE01A":
    case "\uE05C":
      return "Numpad0";
    case "\uE01B":
    case "\uE056":
      return "Numpad1";
    case "\uE01C":
    case "\uE05B":
      return "Numpad2";
    case "\uE01D":
    case "\uE055":
      return "Numpad3";
    case "\uE01E":
    case "\uE058":
      return "Numpad4";
    case "\uE01F":
      return "Numpad5";
    case "\uE020":
    case "\uE05A":
      return "Numpad6";
    case "\uE021":
    case "\uE057":
      return "Numpad7";
    case "\uE022":
    case "\uE059":
      return "Numpad8";
    case "\uE023":
    case "\uE054":
      return "Numpad9";
    case "\uE025":
      return "NumpadAdd";
    case "\uE026":
      return "NumpadComma";
    case "\uE028":
    case "\uE05D":
      return "NumpadDecimal";
    case "\uE029":
      return "NumpadDivide";
    case "\uE007":
      return "NumpadEnter";
    case "\uE024":
      return "NumpadMultiply";
    case "\uE027":
      return "NumpadSubtract";
    default:
      return;
  }
}
function getKeyLocation(key) {
  switch (key) {
    case "\uE007":
    case "\uE008":
    case "\uE009":
    case "\uE00A":
    case "\uE03D":
      return 1;
    case "\uE019":
    case "\uE01A":
    case "\uE01B":
    case "\uE01C":
    case "\uE01D":
    case "\uE01E":
    case "\uE01F":
    case "\uE020":
    case "\uE021":
    case "\uE022":
    case "\uE023":
    case "\uE024":
    case "\uE025":
    case "\uE026":
    case "\uE027":
    case "\uE028":
    case "\uE029":
    case "\uE054":
    case "\uE055":
    case "\uE056":
    case "\uE057":
    case "\uE058":
    case "\uE059":
    case "\uE05A":
    case "\uE05B":
    case "\uE05C":
    case "\uE05D":
      return 3;
    case "\uE050":
    case "\uE051":
    case "\uE052":
    case "\uE053":
      return 2;
    default:
      return 0;
  }
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/input/USKeyboardLayout.js
var KeyToKeyCode = {
  "0": 48,
  "1": 49,
  "2": 50,
  "3": 51,
  "4": 52,
  "5": 53,
  "6": 54,
  "7": 55,
  "8": 56,
  "9": 57,
  Abort: 3,
  Help: 6,
  Backspace: 8,
  Tab: 9,
  Numpad5: 12,
  NumpadEnter: 13,
  Enter: 13,
  "\\r": 13,
  "\\n": 13,
  ShiftLeft: 16,
  ShiftRight: 16,
  ControlLeft: 17,
  ControlRight: 17,
  AltLeft: 18,
  AltRight: 18,
  Pause: 19,
  CapsLock: 20,
  Escape: 27,
  Convert: 28,
  NonConvert: 29,
  Space: 32,
  Numpad9: 33,
  PageUp: 33,
  Numpad3: 34,
  PageDown: 34,
  End: 35,
  Numpad1: 35,
  Home: 36,
  Numpad7: 36,
  ArrowLeft: 37,
  Numpad4: 37,
  Numpad8: 38,
  ArrowUp: 38,
  ArrowRight: 39,
  Numpad6: 39,
  Numpad2: 40,
  ArrowDown: 40,
  Select: 41,
  Open: 43,
  PrintScreen: 44,
  Insert: 45,
  Numpad0: 45,
  Delete: 46,
  NumpadDecimal: 46,
  Digit0: 48,
  Digit1: 49,
  Digit2: 50,
  Digit3: 51,
  Digit4: 52,
  Digit5: 53,
  Digit6: 54,
  Digit7: 55,
  Digit8: 56,
  Digit9: 57,
  KeyA: 65,
  KeyB: 66,
  KeyC: 67,
  KeyD: 68,
  KeyE: 69,
  KeyF: 70,
  KeyG: 71,
  KeyH: 72,
  KeyI: 73,
  KeyJ: 74,
  KeyK: 75,
  KeyL: 76,
  KeyM: 77,
  KeyN: 78,
  KeyO: 79,
  KeyP: 80,
  KeyQ: 81,
  KeyR: 82,
  KeyS: 83,
  KeyT: 84,
  KeyU: 85,
  KeyV: 86,
  KeyW: 87,
  KeyX: 88,
  KeyY: 89,
  KeyZ: 90,
  MetaLeft: 91,
  MetaRight: 92,
  ContextMenu: 93,
  NumpadMultiply: 106,
  NumpadAdd: 107,
  NumpadSubtract: 109,
  NumpadDivide: 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  F13: 124,
  F14: 125,
  F15: 126,
  F16: 127,
  F17: 128,
  F18: 129,
  F19: 130,
  F20: 131,
  F21: 132,
  F22: 133,
  F23: 134,
  F24: 135,
  NumLock: 144,
  ScrollLock: 145,
  AudioVolumeMute: 173,
  AudioVolumeDown: 174,
  AudioVolumeUp: 175,
  MediaTrackNext: 176,
  MediaTrackPrevious: 177,
  MediaStop: 178,
  MediaPlayPause: 179,
  Semicolon: 186,
  Equal: 187,
  NumpadEqual: 187,
  Comma: 188,
  Minus: 189,
  Period: 190,
  Slash: 191,
  Backquote: 192,
  BracketLeft: 219,
  Backslash: 220,
  BracketRight: 221,
  Quote: 222,
  AltGraph: 225,
  Props: 247,
  Cancel: 3,
  Clear: 12,
  Shift: 16,
  Control: 17,
  Alt: 18,
  Accept: 30,
  ModeChange: 31,
  " ": 32,
  Print: 42,
  Execute: 43,
  "\\u0000": 46,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  Meta: 91,
  "*": 106,
  "+": 107,
  "-": 109,
  "/": 111,
  ";": 186,
  "=": 187,
  ",": 188,
  ".": 190,
  "`": 192,
  "[": 219,
  "\\\\": 220,
  "]": 221,
  "'": 222,
  Attn: 246,
  CrSel: 247,
  ExSel: 248,
  EraseEof: 249,
  Play: 250,
  ZoomOut: 251,
  ")": 48,
  "!": 49,
  "@": 50,
  "#": 51,
  $: 52,
  "%": 53,
  "^": 54,
  "&": 55,
  "(": 57,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  ":": 186,
  "<": 188,
  _: 189,
  ">": 190,
  "?": 191,
  "~": 192,
  "{": 219,
  "|": 220,
  "}": 221,
  '"': 222,
  Camera: 44,
  EndCall: 95,
  VolumeDown: 182,
  VolumeUp: 183
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/input/ActionDispatcher.js
var CALCULATE_IN_VIEW_CENTER_PT_DECL = ((i) => {
  const t = i.getClientRects()[0], e = Math.max(0, Math.min(t.x, t.x + t.width)), n = Math.min(window.innerWidth, Math.max(t.x, t.x + t.width)), h = Math.max(0, Math.min(t.y, t.y + t.height)), m = Math.min(window.innerHeight, Math.max(t.y, t.y + t.height));
  return [e + (n - e >> 1), h + (m - h >> 1)];
}).toString();
var IS_MAC_DECL = (() => {
  return navigator.platform.toLowerCase().includes("mac");
}).toString();
async function getElementCenter(context, element) {
  const hiddenSandboxRealm = await context.getOrCreateHiddenSandbox();
  const result = await hiddenSandboxRealm.callFunction(CALCULATE_IN_VIEW_CENTER_PT_DECL, false, { type: "undefined" }, [element]);
  if (result.type === "exception") {
    throw new NoSuchElementException(`Origin element ${element.sharedId} was not found`);
  }
  assert2(result.result.type === "array");
  assert2(result.result.value?.[0]?.type === "number");
  assert2(result.result.value?.[1]?.type === "number");
  const { result: { value: [{ value: x }, { value: y }] } } = result;
  return { x, y };
}
var ActionDispatcher = class {
  static isMacOS = async (context) => {
    const hiddenSandboxRealm = await context.getOrCreateHiddenSandbox();
    const result = await hiddenSandboxRealm.callFunction(IS_MAC_DECL, false);
    assert2(result.type !== "exception");
    assert2(result.result.type === "boolean");
    return result.result.value;
  };
  #browsingContextStorage;
  #tickStart = 0;
  #tickDuration = 0;
  #inputState;
  #contextId;
  #isMacOS;
  constructor(inputState, browsingContextStorage, contextId, isMacOS) {
    this.#browsingContextStorage = browsingContextStorage;
    this.#inputState = inputState;
    this.#contextId = contextId;
    this.#isMacOS = isMacOS;
  }
  /**
   * The context can be disposed between action ticks, so need to get it each time.
   */
  get #context() {
    return this.#browsingContextStorage.getContext(this.#contextId);
  }
  async dispatchActions(optionsByTick) {
    await this.#inputState.queue.run(async () => {
      for (const options of optionsByTick) {
        await this.dispatchTickActions(options);
      }
    });
  }
  async dispatchTickActions(options) {
    this.#tickStart = performance.now();
    this.#tickDuration = 0;
    for (const { action } of options) {
      if ("duration" in action && action.duration !== void 0) {
        this.#tickDuration = Math.max(this.#tickDuration, action.duration);
      }
    }
    const promises = [
      new Promise((resolve) => setTimeout(resolve, this.#tickDuration))
    ];
    for (const option of options) {
      promises.push(this.#dispatchAction(option));
    }
    await Promise.all(promises);
  }
  async #dispatchAction({ id, action }) {
    const source = this.#inputState.get(id);
    const keyState = this.#inputState.getGlobalKeyState();
    switch (action.type) {
      case "keyDown": {
        await this.#dispatchKeyDownAction(source, action);
        this.#inputState.cancelList.push({
          id,
          action: {
            ...action,
            type: "keyUp"
          }
        });
        break;
      }
      case "keyUp": {
        await this.#dispatchKeyUpAction(source, action);
        break;
      }
      case "pause": {
        break;
      }
      case "pointerDown": {
        await this.#dispatchPointerDownAction(source, keyState, action);
        this.#inputState.cancelList.push({
          id,
          action: {
            ...action,
            type: "pointerUp"
          }
        });
        break;
      }
      case "pointerMove": {
        await this.#dispatchPointerMoveAction(source, keyState, action);
        break;
      }
      case "pointerUp": {
        await this.#dispatchPointerUpAction(source, keyState, action);
        break;
      }
      case "scroll": {
        await this.#dispatchScrollAction(source, keyState, action);
        break;
      }
    }
  }
  async #dispatchPointerDownAction(source, keyState, action) {
    const { button } = action;
    if (source.pressed.has(button)) {
      return;
    }
    source.pressed.add(button);
    const { x, y, subtype: pointerType } = source;
    const { width, height, pressure, twist, tangentialPressure } = action;
    const { tiltX, tiltY } = getTilt(action);
    const { modifiers } = keyState;
    const { radiusX, radiusY } = getRadii(width ?? 1, height ?? 1);
    switch (pointerType) {
      case Input2.PointerType.Mouse:
      case Input2.PointerType.Pen:
        await this.#context.cdpTarget.cdpClient.sendCommand("Input.dispatchMouseEvent", {
          type: "mousePressed",
          x,
          y,
          modifiers,
          button: getCdpButton(button),
          buttons: source.buttons,
          clickCount: source.setClickCount(button, new ClickContext(x, y, performance.now())),
          pointerType,
          tangentialPressure,
          tiltX,
          tiltY,
          twist,
          force: pressure
        });
        break;
      case Input2.PointerType.Touch:
        await this.#context.cdpTarget.cdpClient.sendCommand("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [
            {
              x,
              y,
              radiusX,
              radiusY,
              tangentialPressure,
              tiltX,
              tiltY,
              twist,
              force: pressure,
              id: source.pointerId
            }
          ],
          modifiers
        });
        break;
    }
    source.radiusX = radiusX;
    source.radiusY = radiusY;
    source.force = pressure;
  }
  #dispatchPointerUpAction(source, keyState, action) {
    const { button } = action;
    if (!source.pressed.has(button)) {
      return;
    }
    source.pressed.delete(button);
    const { x, y, force, radiusX, radiusY, subtype: pointerType } = source;
    const { modifiers } = keyState;
    switch (pointerType) {
      case Input2.PointerType.Mouse:
      case Input2.PointerType.Pen:
        return this.#context.cdpTarget.cdpClient.sendCommand("Input.dispatchMouseEvent", {
          type: "mouseReleased",
          x,
          y,
          modifiers,
          button: getCdpButton(button),
          buttons: source.buttons,
          clickCount: source.getClickCount(button),
          pointerType
        });
      case Input2.PointerType.Touch:
        return this.#context.cdpTarget.cdpClient.sendCommand("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [
            {
              x,
              y,
              id: source.pointerId,
              force,
              radiusX,
              radiusY
            }
          ],
          modifiers
        });
    }
  }
  async #dispatchPointerMoveAction(source, keyState, action) {
    const { x: startX, y: startY, subtype: pointerType } = source;
    const { width, height, pressure, twist, tangentialPressure, x: offsetX, y: offsetY, origin = "viewport", duration = this.#tickDuration } = action;
    const { tiltX, tiltY } = getTilt(action);
    const { radiusX, radiusY } = getRadii(width ?? 1, height ?? 1);
    const { targetX, targetY } = await this.#getCoordinateFromOrigin(origin, offsetX, offsetY, startX, startY);
    if (targetX < 0 || targetY < 0) {
      throw new MoveTargetOutOfBoundsException(`Cannot move beyond viewport (x: ${targetX}, y: ${targetY})`);
    }
    let last;
    do {
      const ratio = duration > 0 ? (performance.now() - this.#tickStart) / duration : 1;
      last = ratio >= 1;
      let x;
      let y;
      if (last) {
        x = targetX;
        y = targetY;
      } else {
        x = Math.round(ratio * (targetX - startX) + startX);
        y = Math.round(ratio * (targetY - startY) + startY);
      }
      if (source.x !== x || source.y !== y) {
        const { modifiers } = keyState;
        switch (pointerType) {
          case Input2.PointerType.Mouse:
            await this.#context.cdpTarget.cdpClient.sendCommand("Input.dispatchMouseEvent", {
              type: "mouseMoved",
              x,
              y,
              modifiers,
              clickCount: 0,
              button: getCdpButton(source.pressed.values().next().value ?? 5),
              buttons: source.buttons,
              pointerType,
              tangentialPressure,
              tiltX,
              tiltY,
              twist,
              force: pressure
            });
            break;
          case Input2.PointerType.Pen:
            if (source.pressed.size !== 0) {
              await this.#context.cdpTarget.cdpClient.sendCommand("Input.dispatchMouseEvent", {
                type: "mouseMoved",
                x,
                y,
                modifiers,
                clickCount: 0,
                button: getCdpButton(source.pressed.values().next().value ?? 5),
                buttons: source.buttons,
                pointerType,
                tangentialPressure,
                tiltX,
                tiltY,
                twist,
                force: pressure ?? 0.5
              });
            }
            break;
          case Input2.PointerType.Touch:
            if (source.pressed.size !== 0) {
              await this.#context.cdpTarget.cdpClient.sendCommand("Input.dispatchTouchEvent", {
                type: "touchMove",
                touchPoints: [
                  {
                    x,
                    y,
                    radiusX,
                    radiusY,
                    tangentialPressure,
                    tiltX,
                    tiltY,
                    twist,
                    force: pressure,
                    id: source.pointerId
                  }
                ],
                modifiers
              });
            }
            break;
        }
        source.x = x;
        source.y = y;
        source.radiusX = radiusX;
        source.radiusY = radiusY;
        source.force = pressure;
      }
    } while (!last);
  }
  async #getFrameOffset() {
    if (this.#context.id === this.#context.cdpTarget.id) {
      return { x: 0, y: 0 };
    }
    const { backendNodeId } = await this.#context.cdpTarget.cdpClient.sendCommand("DOM.getFrameOwner", { frameId: this.#context.id });
    const { model: frameBoxModel } = await this.#context.cdpTarget.cdpClient.sendCommand("DOM.getBoxModel", {
      backendNodeId
    });
    return { x: frameBoxModel.content[0], y: frameBoxModel.content[1] };
  }
  async #getCoordinateFromOrigin(origin, offsetX, offsetY, startX, startY) {
    let targetX;
    let targetY;
    const frameOffset = await this.#getFrameOffset();
    switch (origin) {
      case "viewport":
        targetX = offsetX + frameOffset.x;
        targetY = offsetY + frameOffset.y;
        break;
      case "pointer":
        targetX = startX + offsetX + frameOffset.x;
        targetY = startY + offsetY + frameOffset.y;
        break;
      default: {
        const { x: posX, y: posY } = await getElementCenter(this.#context, origin.element);
        targetX = posX + offsetX + frameOffset.x;
        targetY = posY + offsetY + frameOffset.y;
        break;
      }
    }
    return { targetX, targetY };
  }
  async #dispatchScrollAction(_source, keyState, action) {
    const { deltaX: targetDeltaX, deltaY: targetDeltaY, x: offsetX, y: offsetY, origin = "viewport", duration = this.#tickDuration } = action;
    if (origin === "pointer") {
      throw new InvalidArgumentException('"pointer" origin is invalid for scrolling.');
    }
    const { targetX, targetY } = await this.#getCoordinateFromOrigin(origin, offsetX, offsetY, 0, 0);
    if (targetX < 0 || targetY < 0) {
      throw new MoveTargetOutOfBoundsException(`Cannot move beyond viewport (x: ${targetX}, y: ${targetY})`);
    }
    let currentDeltaX = 0;
    let currentDeltaY = 0;
    let last;
    do {
      const ratio = duration > 0 ? (performance.now() - this.#tickStart) / duration : 1;
      last = ratio >= 1;
      let deltaX;
      let deltaY;
      if (last) {
        deltaX = targetDeltaX - currentDeltaX;
        deltaY = targetDeltaY - currentDeltaY;
      } else {
        deltaX = Math.round(ratio * targetDeltaX - currentDeltaX);
        deltaY = Math.round(ratio * targetDeltaY - currentDeltaY);
      }
      if (deltaX !== 0 || deltaY !== 0) {
        const { modifiers } = keyState;
        await this.#context.cdpTarget.cdpClient.sendCommand("Input.dispatchMouseEvent", {
          type: "mouseWheel",
          deltaX,
          deltaY,
          x: targetX,
          y: targetY,
          modifiers
        });
        currentDeltaX += deltaX;
        currentDeltaY += deltaY;
      }
    } while (!last);
  }
  async #dispatchKeyDownAction(source, action) {
    const rawKey = action.value;
    if (!isSingleGrapheme(rawKey)) {
      throw new InvalidArgumentException(`Invalid key value: ${rawKey}`);
    }
    const isGrapheme = isSingleComplexGrapheme(rawKey);
    const key = getNormalizedKey(rawKey);
    const repeat = source.pressed.has(key);
    const code = getKeyCode(rawKey);
    const location = getKeyLocation(rawKey);
    switch (key) {
      case "Alt":
        source.alt = true;
        break;
      case "Shift":
        source.shift = true;
        break;
      case "Control":
        source.ctrl = true;
        break;
      case "Meta":
        source.meta = true;
        break;
    }
    source.pressed.add(key);
    const { modifiers } = source;
    const unmodifiedText = getKeyEventUnmodifiedText(key, source, isGrapheme);
    const text = getKeyEventText(code ?? "", source) ?? unmodifiedText;
    let command;
    if (this.#isMacOS && source.meta) {
      switch (code) {
        case "KeyA":
          command = "SelectAll";
          break;
        case "KeyC":
          command = "Copy";
          break;
        case "KeyV":
          command = source.shift ? "PasteAndMatchStyle" : "Paste";
          break;
        case "KeyX":
          command = "Cut";
          break;
        case "KeyZ":
          command = source.shift ? "Redo" : "Undo";
          break;
        default:
      }
    }
    const promises = [
      this.#context.cdpTarget.cdpClient.sendCommand("Input.dispatchKeyEvent", {
        type: text ? "keyDown" : "rawKeyDown",
        windowsVirtualKeyCode: KeyToKeyCode[key],
        key,
        code,
        text,
        unmodifiedText,
        autoRepeat: repeat,
        isSystemKey: source.alt || void 0,
        location: location < 3 ? location : void 0,
        isKeypad: location === 3,
        modifiers,
        commands: command ? [command] : void 0
      })
    ];
    if (key === "Escape") {
      if (!source.alt && (this.#isMacOS && !source.ctrl && !source.meta || !this.#isMacOS)) {
        promises.push(this.#context.cdpTarget.cdpClient.sendCommand("Input.cancelDragging"));
      }
    }
    await Promise.all(promises);
  }
  #dispatchKeyUpAction(source, action) {
    const rawKey = action.value;
    if (!isSingleGrapheme(rawKey)) {
      throw new InvalidArgumentException(`Invalid key value: ${rawKey}`);
    }
    const isGrapheme = isSingleComplexGrapheme(rawKey);
    const key = getNormalizedKey(rawKey);
    if (!source.pressed.has(key)) {
      return;
    }
    const code = getKeyCode(rawKey);
    const location = getKeyLocation(rawKey);
    switch (key) {
      case "Alt":
        source.alt = false;
        break;
      case "Shift":
        source.shift = false;
        break;
      case "Control":
        source.ctrl = false;
        break;
      case "Meta":
        source.meta = false;
        break;
    }
    source.pressed.delete(key);
    const { modifiers } = source;
    const unmodifiedText = getKeyEventUnmodifiedText(key, source, isGrapheme);
    const text = getKeyEventText(code ?? "", source) ?? unmodifiedText;
    return this.#context.cdpTarget.cdpClient.sendCommand("Input.dispatchKeyEvent", {
      type: "keyUp",
      windowsVirtualKeyCode: KeyToKeyCode[key],
      key,
      code,
      text,
      unmodifiedText,
      location: location < 3 ? location : void 0,
      isSystemKey: source.alt || void 0,
      isKeypad: location === 3,
      modifiers
    });
  }
};
var getKeyEventUnmodifiedText = (key, source, isGrapheme) => {
  if (isGrapheme) {
    return key;
  }
  if (key === "Enter") {
    return "\r";
  }
  return [...key].length === 1 ? source.shift ? key.toLocaleUpperCase("en-US") : key : void 0;
};
var getKeyEventText = (code, source) => {
  if (source.ctrl) {
    switch (code) {
      case "Digit2":
        if (source.shift) {
          return "\0";
        }
        break;
      case "KeyA":
        return "";
      case "KeyB":
        return "";
      case "KeyC":
        return "";
      case "KeyD":
        return "";
      case "KeyE":
        return "";
      case "KeyF":
        return "";
      case "KeyG":
        return "\x07";
      case "KeyH":
        return "\b";
      case "KeyI":
        return "	";
      case "KeyJ":
        return "\n";
      case "KeyK":
        return "\v";
      case "KeyL":
        return "\f";
      case "KeyM":
        return "\r";
      case "KeyN":
        return "";
      case "KeyO":
        return "";
      case "KeyP":
        return "";
      case "KeyQ":
        return "";
      case "KeyR":
        return "";
      case "KeyS":
        return "";
      case "KeyT":
        return "";
      case "KeyU":
        return "";
      case "KeyV":
        return "";
      case "KeyW":
        return "";
      case "KeyX":
        return "";
      case "KeyY":
        return "";
      case "KeyZ":
        return "";
      case "BracketLeft":
        return "\x1B";
      case "Backslash":
        return "";
      case "BracketRight":
        return "";
      case "Digit6":
        if (source.shift) {
          return "";
        }
        break;
      case "Minus":
        return "";
    }
    return "";
  }
  if (source.alt) {
    return "";
  }
  return;
};
function getCdpButton(button) {
  switch (button) {
    case 0:
      return "left";
    case 1:
      return "middle";
    case 2:
      return "right";
    case 3:
      return "back";
    case 4:
      return "forward";
    default:
      return "none";
  }
}
function getTilt(action) {
  const altitudeAngle = action.altitudeAngle ?? Math.PI / 2;
  const azimuthAngle = action.azimuthAngle ?? 0;
  let tiltXRadians = 0;
  let tiltYRadians = 0;
  if (altitudeAngle === 0) {
    if (azimuthAngle === 0 || azimuthAngle === 2 * Math.PI) {
      tiltXRadians = Math.PI / 2;
    }
    if (azimuthAngle === Math.PI / 2) {
      tiltYRadians = Math.PI / 2;
    }
    if (azimuthAngle === Math.PI) {
      tiltXRadians = -Math.PI / 2;
    }
    if (azimuthAngle === 3 * Math.PI / 2) {
      tiltYRadians = -Math.PI / 2;
    }
    if (azimuthAngle > 0 && azimuthAngle < Math.PI / 2) {
      tiltXRadians = Math.PI / 2;
      tiltYRadians = Math.PI / 2;
    }
    if (azimuthAngle > Math.PI / 2 && azimuthAngle < Math.PI) {
      tiltXRadians = -Math.PI / 2;
      tiltYRadians = Math.PI / 2;
    }
    if (azimuthAngle > Math.PI && azimuthAngle < 3 * Math.PI / 2) {
      tiltXRadians = -Math.PI / 2;
      tiltYRadians = -Math.PI / 2;
    }
    if (azimuthAngle > 3 * Math.PI / 2 && azimuthAngle < 2 * Math.PI) {
      tiltXRadians = Math.PI / 2;
      tiltYRadians = -Math.PI / 2;
    }
  }
  if (altitudeAngle !== 0) {
    const tanAlt = Math.tan(altitudeAngle);
    tiltXRadians = Math.atan(Math.cos(azimuthAngle) / tanAlt);
    tiltYRadians = Math.atan(Math.sin(azimuthAngle) / tanAlt);
  }
  const factor = 180 / Math.PI;
  return {
    tiltX: tiltXRadians * factor,
    tiltY: tiltYRadians * factor
  };
}
function getRadii(width, height) {
  return {
    radiusX: width ? width / 2 : 0.5,
    radiusY: height ? height / 2 : 0.5
  };
}

// node_modules/chromium-bidi/out/Default/gen/src/utils/Mutex.js
var Mutex = class {
  #locked = false;
  #acquirers = [];
  // This is FIFO.
  acquire() {
    const state = { resolved: false };
    if (this.#locked) {
      return new Promise((resolve) => {
        this.#acquirers.push(() => resolve(this.#release.bind(this, state)));
      });
    }
    this.#locked = true;
    return Promise.resolve(this.#release.bind(this, state));
  }
  #release(state) {
    if (state.resolved) {
      throw new Error("Cannot release more than once.");
    }
    state.resolved = true;
    const resolve = this.#acquirers.shift();
    if (!resolve) {
      this.#locked = false;
      return;
    }
    resolve();
  }
  async run(action) {
    const release = await this.acquire();
    try {
      const result = await action();
      return result;
    } finally {
      release();
    }
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/input/InputState.js
var InputState = class {
  cancelList = [];
  #sources = /* @__PURE__ */ new Map();
  #mutex = new Mutex();
  getOrCreate(id, type, subtype) {
    let source = this.#sources.get(id);
    if (!source) {
      switch (type) {
        case "none":
          source = new NoneSource();
          break;
        case "key":
          source = new KeySource();
          break;
        case "pointer": {
          let pointerId = subtype === Input2.PointerType.Mouse ? 0 : 2;
          const pointerIds = /* @__PURE__ */ new Set();
          for (const [, source2] of this.#sources) {
            if (source2.type === "pointer") {
              pointerIds.add(source2.pointerId);
            }
          }
          while (pointerIds.has(pointerId)) {
            ++pointerId;
          }
          source = new PointerSource(pointerId, subtype);
          break;
        }
        case "wheel":
          source = new WheelSource();
          break;
        default:
          throw new InvalidArgumentException(`Expected "${"none"}", "${"key"}", "${"pointer"}", or "${"wheel"}". Found unknown source type ${type}.`);
      }
      this.#sources.set(id, source);
      return source;
    }
    if (source.type !== type) {
      throw new InvalidArgumentException(`Input source type of ${id} is ${source.type}, but received ${type}.`);
    }
    return source;
  }
  get(id) {
    const source = this.#sources.get(id);
    if (!source) {
      throw new UnknownErrorException(`Internal error.`);
    }
    return source;
  }
  getGlobalKeyState() {
    const state = new KeySource();
    for (const [, source] of this.#sources) {
      if (source.type !== "key") {
        continue;
      }
      for (const pressed of source.pressed) {
        state.pressed.add(pressed);
      }
      state.alt ||= source.alt;
      state.ctrl ||= source.ctrl;
      state.meta ||= source.meta;
      state.shift ||= source.shift;
    }
    return state;
  }
  get queue() {
    return this.#mutex;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/input/InputStateManager.js
var InputStateManager = class extends WeakMap {
  get(context) {
    assert2(context.isTopLevelContext());
    if (!this.has(context)) {
      this.set(context, new InputState());
    }
    return super.get(context);
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/input/InputProcessor.js
var InputProcessor = class {
  #browsingContextStorage;
  #inputStateManager = new InputStateManager();
  constructor(browsingContextStorage) {
    this.#browsingContextStorage = browsingContextStorage;
  }
  async performActions(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    const inputState = this.#inputStateManager.get(context.top);
    const actionsByTick = this.#getActionsByTick(params, inputState);
    const dispatcher = new ActionDispatcher(inputState, this.#browsingContextStorage, params.context, await ActionDispatcher.isMacOS(context).catch(() => false));
    await dispatcher.dispatchActions(actionsByTick);
    return {};
  }
  async releaseActions(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    const topContext = context.top;
    const inputState = this.#inputStateManager.get(topContext);
    const dispatcher = new ActionDispatcher(inputState, this.#browsingContextStorage, params.context, await ActionDispatcher.isMacOS(context).catch(() => false));
    await dispatcher.dispatchTickActions(inputState.cancelList.reverse());
    this.#inputStateManager.delete(topContext);
    return {};
  }
  async setFiles(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    const hiddenSandboxRealm = await context.getOrCreateHiddenSandbox();
    let ErrorCode2;
    (function(ErrorCode3) {
      ErrorCode3[ErrorCode3["Node"] = 0] = "Node";
      ErrorCode3[ErrorCode3["Element"] = 1] = "Element";
      ErrorCode3[ErrorCode3["Type"] = 2] = "Type";
      ErrorCode3[ErrorCode3["Disabled"] = 3] = "Disabled";
      ErrorCode3[ErrorCode3["Multiple"] = 4] = "Multiple";
    })(ErrorCode2 || (ErrorCode2 = {}));
    let result;
    try {
      result = await hiddenSandboxRealm.callFunction(String(function getFiles(fileListLength) {
        if (!(this instanceof HTMLInputElement)) {
          if (this instanceof Element) {
            return 1;
          }
          return 0;
        }
        if (this.type !== "file") {
          return 2;
        }
        if (this.disabled) {
          return 3;
        }
        if (fileListLength > 1 && !this.multiple) {
          return 4;
        }
        return;
      }), false, params.element, [{ type: "number", value: params.files.length }]);
    } catch {
      throw new NoSuchNodeException(`Could not find element ${params.element.sharedId}`);
    }
    assert2(result.type === "success");
    if (result.result.type === "number") {
      switch (result.result.value) {
        case 0: {
          throw new NoSuchElementException(`Could not find element ${params.element.sharedId}`);
        }
        case 1: {
          throw new UnableToSetFileInputException(`Element ${params.element.sharedId} is not a input`);
        }
        case 2: {
          throw new UnableToSetFileInputException(`Input element ${params.element.sharedId} is not a file type`);
        }
        case 3: {
          throw new UnableToSetFileInputException(`Input element ${params.element.sharedId} is disabled`);
        }
        case 4: {
          throw new UnableToSetFileInputException(`Cannot set multiple files on a non-multiple input element`);
        }
      }
    }
    if (params.files.length === 0) {
      await hiddenSandboxRealm.callFunction(String(function dispatchEvent() {
        if (this.files?.length === 0) {
          this.dispatchEvent(new Event("cancel", {
            bubbles: true
          }));
          return;
        }
        this.files = new DataTransfer().files;
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        this.dispatchEvent(new Event("change", { bubbles: true }));
      }), false, params.element);
      return {};
    }
    const paths = [];
    for (let i = 0; i < params.files.length; ++i) {
      const result2 = await hiddenSandboxRealm.callFunction(String(function getFiles(index) {
        return this.files?.item(index);
      }), false, params.element, [{ type: "number", value: 0 }], Script2.ResultOwnership.Root);
      assert2(result2.type === "success");
      if (result2.result.type !== "object") {
        break;
      }
      const { handle } = result2.result;
      assert2(handle !== void 0);
      const { path } = await hiddenSandboxRealm.cdpClient.sendCommand("DOM.getFileInfo", {
        objectId: handle
      });
      paths.push(path);
      void hiddenSandboxRealm.disown(handle).catch(void 0);
    }
    paths.sort();
    const sortedFiles = [...params.files].sort();
    if (paths.length !== params.files.length || sortedFiles.some((path, index) => {
      return paths[index] !== path;
    })) {
      const { objectId } = await hiddenSandboxRealm.deserializeForCdp(params.element);
      assert2(objectId !== void 0);
      await hiddenSandboxRealm.cdpClient.sendCommand("DOM.setFileInputFiles", {
        files: params.files,
        objectId
      });
    } else {
      await hiddenSandboxRealm.callFunction(String(function dispatchEvent() {
        this.dispatchEvent(new Event("cancel", {
          bubbles: true
        }));
      }), false, params.element);
    }
    return {};
  }
  #getActionsByTick(params, inputState) {
    const actionsByTick = [];
    for (const action of params.actions) {
      switch (action.type) {
        case "pointer": {
          action.parameters ??= { pointerType: Input2.PointerType.Mouse };
          action.parameters.pointerType ??= Input2.PointerType.Mouse;
          const source = inputState.getOrCreate(action.id, "pointer", action.parameters.pointerType);
          if (source.subtype !== action.parameters.pointerType) {
            throw new InvalidArgumentException(`Expected input source ${action.id} to be ${source.subtype}; got ${action.parameters.pointerType}.`);
          }
          source.resetClickCount();
          break;
        }
        default:
          inputState.getOrCreate(action.id, action.type);
      }
      const actions = action.actions.map((item) => ({
        id: action.id,
        action: item
      }));
      for (let i = 0; i < actions.length; i++) {
        if (actionsByTick.length === i) {
          actionsByTick.push([]);
        }
        actionsByTick[i].push(actions[i]);
      }
    }
    return actionsByTick;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/utils/base64.js
function base64ToString(base64Str) {
  if ("atob" in globalThis) {
    return globalThis.atob(base64Str);
  }
  return Buffer.from(base64Str, "base64").toString("ascii");
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/network/NetworkUtils.js
function computeHeadersSize(headers) {
  const requestHeaders = headers.reduce((acc, header) => {
    return `${acc}${header.name}: ${header.value.value}\r
`;
  }, "");
  return new TextEncoder().encode(requestHeaders).length;
}
function stringToBase642(str) {
  return typedArrayToBase64(new TextEncoder().encode(str));
}
function typedArrayToBase64(typedArray) {
  const chunkSize = 65534;
  const chunks = [];
  for (let i = 0; i < typedArray.length; i += chunkSize) {
    const chunk = typedArray.subarray(i, i + chunkSize);
    chunks.push(String.fromCodePoint.apply(null, chunk));
  }
  const binaryString = chunks.join("");
  return btoa(binaryString);
}
function bidiNetworkHeadersFromCdpNetworkHeaders(headers) {
  if (!headers) {
    return [];
  }
  return Object.entries(headers).map(([name, value]) => ({
    name,
    value: {
      type: "string",
      value
    }
  }));
}
function cdpFetchHeadersFromBidiNetworkHeaders(headers) {
  if (headers === void 0) {
    return void 0;
  }
  return headers.map(({ name, value }) => ({
    name,
    value: value.value
  }));
}
function networkHeaderFromCookieHeaders(headers) {
  if (headers === void 0) {
    return void 0;
  }
  const value = headers.reduce((acc, value2, index) => {
    if (index > 0) {
      acc += ";";
    }
    const cookieValue = value2.value.type === "base64" ? btoa(value2.value.value) : value2.value.value;
    acc += `${value2.name}=${cookieValue}`;
    return acc;
  }, "");
  return {
    name: "Cookie",
    value: {
      type: "string",
      value
    }
  };
}
function cdpAuthChallengeResponseFromBidiAuthContinueWithAuthAction(action) {
  switch (action) {
    case "default":
      return "Default";
    case "cancel":
      return "CancelAuth";
    case "provideCredentials":
      return "ProvideCredentials";
  }
}
function cdpToBiDiCookie(cookie) {
  const result = {
    name: cookie.name,
    value: { type: "string", value: cookie.value },
    domain: cookie.domain,
    path: cookie.path,
    size: cookie.size,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite === void 0 ? Network2.SameSite.None : sameSiteCdpToBiDi(cookie.sameSite),
    ...cookie.expires >= 0 ? { expiry: Math.round(cookie.expires) } : void 0
  };
  result[`goog:session`] = cookie.session;
  result[`goog:priority`] = cookie.priority;
  result[`goog:sourceScheme`] = cookie.sourceScheme;
  result[`goog:sourcePort`] = cookie.sourcePort;
  if (cookie.partitionKey !== void 0) {
    result[`goog:partitionKey`] = cookie.partitionKey;
  }
  if (cookie.partitionKeyOpaque !== void 0) {
    result[`goog:partitionKeyOpaque`] = cookie.partitionKeyOpaque;
  }
  return result;
}
function deserializeByteValue(value) {
  if (value.type === "base64") {
    return base64ToString(value.value);
  }
  return value.value;
}
function bidiToCdpCookie(params, partitionKey) {
  if (partitionKey["goog:hasCrossSiteAncestor"] !== void 0 && partitionKey.sourceOrigin === void 0 && params.cookie["goog:partitionKey"] === void 0) {
    throw new UnableToSetCookieException("Cannot set goog:hasCrossSiteAncestor without sourceOrigin.");
  }
  const deserializedValue = deserializeByteValue(params.cookie.value);
  const result = {
    name: params.cookie.name,
    value: deserializedValue,
    domain: params.cookie.domain,
    path: params.cookie.path ?? "/",
    secure: params.cookie.secure ?? false,
    httpOnly: params.cookie.httpOnly ?? false,
    ...partitionKey.sourceOrigin !== void 0 && {
      partitionKey: {
        // Default to same-site ancestor unless overridden by BiDi+ extension.
        hasCrossSiteAncestor: partitionKey["goog:hasCrossSiteAncestor"] ?? false,
        // CDP's `partitionKey.topLevelSite` is the BiDi's `partition.sourceOrigin`.
        topLevelSite: partitionKey.sourceOrigin
      }
    },
    ...params.cookie.expiry !== void 0 && {
      expires: params.cookie.expiry
    },
    ...params.cookie.sameSite !== void 0 && {
      sameSite: sameSiteBiDiToCdp(params.cookie.sameSite)
    }
  };
  if (params.cookie[`goog:url`] !== void 0) {
    result.url = params.cookie[`goog:url`];
  }
  if (params.cookie[`goog:priority`] !== void 0) {
    result.priority = params.cookie[`goog:priority`];
  }
  if (params.cookie[`goog:sourceScheme`] !== void 0) {
    result.sourceScheme = params.cookie[`goog:sourceScheme`];
  }
  if (params.cookie[`goog:sourcePort`] !== void 0) {
    result.sourcePort = params.cookie[`goog:sourcePort`];
  }
  if (params.cookie[`goog:partitionKey`] !== void 0) {
    result.partitionKey = params.cookie[`goog:partitionKey`];
  }
  return result;
}
function sameSiteCdpToBiDi(sameSite) {
  switch (sameSite) {
    case "Strict":
      return Network2.SameSite.Strict;
    case "None":
      return Network2.SameSite.None;
    case "Lax":
      return Network2.SameSite.Lax;
    default:
      return Network2.SameSite.Lax;
  }
}
function sameSiteBiDiToCdp(sameSite) {
  switch (sameSite) {
    case Network2.SameSite.None:
      return "None";
    case Network2.SameSite.Strict:
      return "Strict";
    // Defaults to `Lax`:
    // https://web.dev/articles/samesite-cookies-explained#samesitelax_by_default
    case Network2.SameSite.Default:
    case Network2.SameSite.Lax:
      return "Lax";
  }
  throw new InvalidArgumentException(`Unknown 'sameSite' value ${sameSite}`);
}
function isSpecialScheme(protocol) {
  return ["ftp", "file", "http", "https", "ws", "wss"].includes(protocol.replace(/:$/, ""));
}
function getScheme(url) {
  return url.protocol.replace(/:$/, "");
}
function matchUrlPattern(pattern, url) {
  const parsedUrl = new URL(url);
  if (pattern.protocol !== void 0 && pattern.protocol !== getScheme(parsedUrl)) {
    return false;
  }
  if (pattern.hostname !== void 0 && pattern.hostname !== parsedUrl.hostname) {
    return false;
  }
  if (pattern.port !== void 0 && pattern.port !== parsedUrl.port) {
    return false;
  }
  if (pattern.pathname !== void 0 && pattern.pathname !== parsedUrl.pathname) {
    return false;
  }
  if (pattern.search !== void 0 && pattern.search !== parsedUrl.search) {
    return false;
  }
  return true;
}
function bidiBodySizeFromCdpPostDataEntries(entries) {
  let size = 0;
  for (const entry of entries) {
    size += atob(entry.bytes ?? "").length;
  }
  return size;
}
function getTiming(timing, offset = 0) {
  if (!timing) {
    return 0;
  }
  if (timing <= 0 || timing + offset <= 0) {
    return 0;
  }
  return timing + offset;
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/network/NetworkProcessor.js
var NetworkProcessor = class _NetworkProcessor {
  #browsingContextStorage;
  #networkStorage;
  #userContextStorage;
  #contextConfigStorage;
  constructor(browsingContextStorage, networkStorage, userContextStorage, contextConfigStorage) {
    this.#userContextStorage = userContextStorage;
    this.#browsingContextStorage = browsingContextStorage;
    this.#networkStorage = networkStorage;
    this.#contextConfigStorage = contextConfigStorage;
  }
  async addIntercept(params) {
    this.#browsingContextStorage.verifyTopLevelContextsList(params.contexts);
    const urlPatterns = params.urlPatterns ?? [];
    const parsedUrlPatterns = _NetworkProcessor.parseUrlPatterns(urlPatterns);
    const intercept = this.#networkStorage.addIntercept({
      urlPatterns: parsedUrlPatterns,
      phases: params.phases,
      contexts: params.contexts
    });
    await this.#toggleNetwork();
    return {
      intercept
    };
  }
  async continueRequest(params) {
    if (params.url !== void 0) {
      _NetworkProcessor.parseUrlString(params.url);
    }
    if (params.method !== void 0) {
      if (!_NetworkProcessor.isMethodValid(params.method)) {
        throw new InvalidArgumentException(`Method '${params.method}' is invalid.`);
      }
    }
    if (params.headers) {
      _NetworkProcessor.validateHeaders(params.headers);
    }
    const request = this.#getBlockedRequestOrFail(params.request, [
      Network2.InterceptPhase.BeforeRequestSent
    ]);
    try {
      await request.continueRequest(params);
    } catch (error) {
      throw _NetworkProcessor.wrapInterceptionError(error);
    }
    return {};
  }
  async continueResponse(params) {
    if (params.headers) {
      _NetworkProcessor.validateHeaders(params.headers);
    }
    const request = this.#getBlockedRequestOrFail(params.request, [
      Network2.InterceptPhase.AuthRequired,
      Network2.InterceptPhase.ResponseStarted
    ]);
    try {
      await request.continueResponse(params);
    } catch (error) {
      throw _NetworkProcessor.wrapInterceptionError(error);
    }
    return {};
  }
  async continueWithAuth(params) {
    const networkId = params.request;
    const request = this.#getBlockedRequestOrFail(networkId, [
      Network2.InterceptPhase.AuthRequired
    ]);
    await request.continueWithAuth(params);
    return {};
  }
  async failRequest({ request: networkId }) {
    const request = this.#getRequestOrFail(networkId);
    if (request.interceptPhase === Network2.InterceptPhase.AuthRequired) {
      throw new InvalidArgumentException(`Request '${networkId}' in 'authRequired' phase cannot be failed`);
    }
    if (!request.interceptPhase) {
      throw new NoSuchRequestException(`No blocked request found for network id '${networkId}'`);
    }
    await request.failRequest("Failed");
    return {};
  }
  async provideResponse(params) {
    if (params.headers) {
      _NetworkProcessor.validateHeaders(params.headers);
    }
    const request = this.#getBlockedRequestOrFail(params.request, [
      Network2.InterceptPhase.BeforeRequestSent,
      Network2.InterceptPhase.ResponseStarted,
      Network2.InterceptPhase.AuthRequired
    ]);
    try {
      await request.provideResponse(params);
    } catch (error) {
      throw _NetworkProcessor.wrapInterceptionError(error);
    }
    return {};
  }
  /**
   * In some states CDP Network and Fetch domains are not required, but in some they have
   * to be updated. Whenever potential change in these kinds of states is introduced,
   * update the states of all the CDP targets.
   */
  async #toggleNetwork() {
    await Promise.all(this.#browsingContextStorage.getAllContexts().map((context) => {
      return context.cdpTarget.toggleNetwork();
    }));
  }
  async removeIntercept(params) {
    this.#networkStorage.removeIntercept(params.intercept);
    await this.#toggleNetwork();
    return {};
  }
  async setCacheBehavior(params) {
    const contexts = this.#browsingContextStorage.verifyTopLevelContextsList(params.contexts);
    this.#networkStorage.setCacheBehavior(params.cacheBehavior, contexts);
    const affectedContexts = contexts.size === 0 ? this.#browsingContextStorage.getAllContexts() : [...contexts.values()].flatMap((context) => [
      context,
      ...context.allChildren
    ]);
    await Promise.all(affectedContexts.map((context) => {
      return context.cdpTarget.toggleSetCacheDisabled();
    }));
    return {};
  }
  #getRequestOrFail(id) {
    const request = this.#networkStorage.getRequestById(id);
    if (!request) {
      throw new NoSuchRequestException(`Network request with ID '${id}' doesn't exist`);
    }
    return request;
  }
  #getBlockedRequestOrFail(id, phases) {
    const request = this.#getRequestOrFail(id);
    if (!request.interceptPhase) {
      throw new NoSuchRequestException(`No blocked request found for network id '${id}'`);
    }
    if (request.interceptPhase && !phases.includes(request.interceptPhase)) {
      throw new InvalidArgumentException(`Blocked request for network id '${id}' is in '${request.interceptPhase}' phase`);
    }
    return request;
  }
  /**
   * Validate https://fetch.spec.whatwg.org/#header-value
   */
  static validateHeaders(headers) {
    for (const header of headers) {
      let headerValue;
      if (header.value.type === "string") {
        headerValue = header.value.value;
      } else {
        headerValue = atob(header.value.value);
      }
      if (headerValue !== headerValue.trim() || headerValue.includes("\n") || headerValue.includes("\0")) {
        throw new InvalidArgumentException(`Header value '${headerValue}' is not acceptable value`);
      }
    }
  }
  static isMethodValid(method) {
    return /^[!#$%&'*+\-.^_`|~a-zA-Z\d]+$/.test(method);
  }
  /**
   * Attempts to parse the given url.
   * Throws an InvalidArgumentException if the url is invalid.
   */
  static parseUrlString(url) {
    try {
      return new URL(url);
    } catch (error) {
      throw new InvalidArgumentException(`Invalid URL '${url}': ${error}`);
    }
  }
  static parseUrlPatterns(urlPatterns) {
    return urlPatterns.map((urlPattern) => {
      let patternUrl = "";
      let hasProtocol = true;
      let hasHostname = true;
      let hasPort = true;
      let hasPathname = true;
      let hasSearch = true;
      switch (urlPattern.type) {
        case "string": {
          patternUrl = unescapeURLPattern(urlPattern.pattern);
          break;
        }
        case "pattern": {
          if (urlPattern.protocol === void 0) {
            hasProtocol = false;
            patternUrl += "http";
          } else {
            if (urlPattern.protocol === "") {
              throw new InvalidArgumentException("URL pattern must specify a protocol");
            }
            urlPattern.protocol = unescapeURLPattern(urlPattern.protocol);
            if (!urlPattern.protocol.match(/^[a-zA-Z+-.]+$/)) {
              throw new InvalidArgumentException("Forbidden characters");
            }
            patternUrl += urlPattern.protocol;
          }
          const scheme = patternUrl.toLocaleLowerCase();
          patternUrl += ":";
          if (isSpecialScheme(scheme)) {
            patternUrl += "//";
          }
          if (urlPattern.hostname === void 0) {
            if (scheme !== "file") {
              patternUrl += "placeholder";
            }
            hasHostname = false;
          } else {
            if (urlPattern.hostname === "") {
              throw new InvalidArgumentException("URL pattern must specify a hostname");
            }
            if (urlPattern.protocol === "file") {
              throw new InvalidArgumentException(`URL pattern protocol cannot be 'file'`);
            }
            urlPattern.hostname = unescapeURLPattern(urlPattern.hostname);
            let insideBrackets = false;
            for (const c of urlPattern.hostname) {
              if (c === "/" || c === "?" || c === "#") {
                throw new InvalidArgumentException(`'/', '?', '#' are forbidden in hostname`);
              }
              if (!insideBrackets && c === ":") {
                throw new InvalidArgumentException(`':' is only allowed inside brackets in hostname`);
              }
              if (c === "[") {
                insideBrackets = true;
              }
              if (c === "]") {
                insideBrackets = false;
              }
            }
            patternUrl += urlPattern.hostname;
          }
          if (urlPattern.port === void 0) {
            hasPort = false;
          } else {
            if (urlPattern.port === "") {
              throw new InvalidArgumentException(`URL pattern must specify a port`);
            }
            urlPattern.port = unescapeURLPattern(urlPattern.port);
            patternUrl += ":";
            if (!urlPattern.port.match(/^\d+$/)) {
              throw new InvalidArgumentException("Forbidden characters");
            }
            patternUrl += urlPattern.port;
          }
          if (urlPattern.pathname === void 0) {
            hasPathname = false;
          } else {
            urlPattern.pathname = unescapeURLPattern(urlPattern.pathname);
            if (urlPattern.pathname[0] !== "/") {
              patternUrl += "/";
            }
            if (urlPattern.pathname.includes("#") || urlPattern.pathname.includes("?")) {
              throw new InvalidArgumentException("Forbidden characters");
            }
            patternUrl += urlPattern.pathname;
          }
          if (urlPattern.search === void 0) {
            hasSearch = false;
          } else {
            urlPattern.search = unescapeURLPattern(urlPattern.search);
            if (urlPattern.search[0] !== "?") {
              patternUrl += "?";
            }
            if (urlPattern.search.includes("#")) {
              throw new InvalidArgumentException("Forbidden characters");
            }
            patternUrl += urlPattern.search;
          }
          break;
        }
      }
      const serializePort = (url) => {
        const defaultPorts = {
          "ftp:": 21,
          "file:": null,
          "http:": 80,
          "https:": 443,
          "ws:": 80,
          "wss:": 443
        };
        if (isSpecialScheme(url.protocol) && defaultPorts[url.protocol] !== null && (!url.port || String(defaultPorts[url.protocol]) === url.port)) {
          return "";
        } else if (url.port) {
          return url.port;
        }
        return void 0;
      };
      try {
        const url = new URL(patternUrl);
        return {
          protocol: hasProtocol ? url.protocol.replace(/:$/, "") : void 0,
          hostname: hasHostname ? url.hostname : void 0,
          port: hasPort ? serializePort(url) : void 0,
          pathname: hasPathname && url.pathname ? url.pathname : void 0,
          search: hasSearch ? url.search : void 0
        };
      } catch (err) {
        throw new InvalidArgumentException(`${err.message} '${patternUrl}'`);
      }
    });
  }
  static wrapInterceptionError(error) {
    if (error?.message.includes("Invalid header") || error?.message.includes("Unsafe header")) {
      return new InvalidArgumentException(error.message);
    }
    return error;
  }
  async addDataCollector(params) {
    if (params.userContexts !== void 0 && params.contexts !== void 0) {
      throw new InvalidArgumentException("'contexts' and 'userContexts' are mutually exclusive");
    }
    if (params.userContexts !== void 0) {
      await this.#userContextStorage.verifyUserContextIdList(params.userContexts);
    }
    if (params.contexts !== void 0) {
      for (const browsingContextId of params.contexts) {
        const browsingContext = this.#browsingContextStorage.getContext(browsingContextId);
        if (!browsingContext.isTopLevelContext()) {
          throw new InvalidArgumentException(`Data collectors are available only on top-level browsing contexts`);
        }
      }
    }
    const collectorId = this.#networkStorage.addDataCollector(params);
    await this.#toggleNetwork();
    return { collector: collectorId };
  }
  async getData(params) {
    return await this.#networkStorage.getCollectedData(params);
  }
  async removeDataCollector(params) {
    this.#networkStorage.removeDataCollector(params);
    await this.#toggleNetwork();
    return {};
  }
  disownData(params) {
    this.#networkStorage.disownData(params);
    return {};
  }
  async #getRelatedTopLevelBrowsingContexts(browsingContextIds, userContextIds) {
    if (browsingContextIds === void 0 && userContextIds === void 0) {
      return this.#browsingContextStorage.getTopLevelContexts();
    }
    if (browsingContextIds !== void 0 && userContextIds !== void 0) {
      throw new InvalidArgumentException("User contexts and browsing contexts are mutually exclusive");
    }
    const result = [];
    if (userContextIds !== void 0) {
      if (userContextIds.length === 0) {
        throw new InvalidArgumentException("user context should be provided");
      }
      await this.#userContextStorage.verifyUserContextIdList(userContextIds);
      for (const userContextId of userContextIds) {
        const topLevelBrowsingContexts = this.#browsingContextStorage.getTopLevelContexts().filter((browsingContext) => browsingContext.userContext === userContextId);
        result.push(...topLevelBrowsingContexts);
      }
    }
    if (browsingContextIds !== void 0) {
      if (browsingContextIds.length === 0) {
        throw new InvalidArgumentException("browsing context should be provided");
      }
      for (const browsingContextId of browsingContextIds) {
        const browsingContext = this.#browsingContextStorage.getContext(browsingContextId);
        if (!browsingContext.isTopLevelContext()) {
          throw new InvalidArgumentException("The command is only supported on the top-level context");
        }
        result.push(browsingContext);
      }
    }
    return [...new Set(result).values()];
  }
  async setExtraHeaders(params) {
    const affectedBrowsingContexts = await this.#getRelatedTopLevelBrowsingContexts(params.contexts, params.userContexts);
    const cdpExtraHeaders = parseBiDiHeaders(params.headers);
    if (params.userContexts === void 0 && params.contexts === void 0) {
      this.#contextConfigStorage.updateGlobalConfig({
        extraHeaders: cdpExtraHeaders
      });
    }
    if (params.userContexts !== void 0) {
      params.userContexts.forEach((userContext) => {
        this.#contextConfigStorage.updateUserContextConfig(userContext, {
          extraHeaders: cdpExtraHeaders
        });
      });
    }
    if (params.contexts !== void 0) {
      params.contexts.forEach((browsingContextId) => {
        this.#contextConfigStorage.updateBrowsingContextConfig(browsingContextId, { extraHeaders: cdpExtraHeaders });
      });
    }
    await Promise.all(affectedBrowsingContexts.map(async (context) => {
      const extraHeaders = this.#contextConfigStorage.getActiveConfig(context.id, context.userContext).extraHeaders ?? {};
      await context.setExtraHeaders(extraHeaders);
    }));
    return {};
  }
};
function unescapeURLPattern(pattern) {
  const forbidden = /* @__PURE__ */ new Set(["(", ")", "*", "{", "}"]);
  let result = "";
  let isEscaped = false;
  for (const c of pattern) {
    if (!isEscaped) {
      if (forbidden.has(c)) {
        throw new InvalidArgumentException("Forbidden characters");
      }
      if (c === "\\") {
        isEscaped = true;
        continue;
      }
    }
    result += c;
    isEscaped = false;
  }
  return result;
}
var FORBIDDEN_HEADER_NAME_SYMBOLS = /* @__PURE__ */ new Set([
  " ",
  "	",
  "\n",
  '"',
  "(",
  ")",
  ",",
  "/",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "[",
  "\\",
  "]",
  "{",
  "}"
]);
var FORBIDDEN_HEADER_VALUE_SYMBOLS = /* @__PURE__ */ new Set(["\0", "\n", "\r"]);
function includesChar(str, chars) {
  for (const char of str) {
    if (chars.has(char)) {
      return true;
    }
  }
  return false;
}
function parseBiDiHeaders(headers) {
  const parsedHeaders = {};
  for (const bidiHeader of headers) {
    if (bidiHeader.value.type === "string") {
      const name = bidiHeader.name;
      const value = bidiHeader.value.value;
      if (name.length === 0) {
        throw new InvalidArgumentException(`Empty header name is not allowed`);
      }
      if (includesChar(name, FORBIDDEN_HEADER_NAME_SYMBOLS)) {
        throw new InvalidArgumentException(`Header name '${name}' contains forbidden symbols`);
      }
      if (includesChar(value, FORBIDDEN_HEADER_VALUE_SYMBOLS)) {
        throw new InvalidArgumentException(`Header value '${value}' contains forbidden symbols`);
      }
      if (value.trim() !== value) {
        throw new InvalidArgumentException(`Header value should not contain trailing or ending whitespaces`);
      }
      parsedHeaders[bidiHeader.name] = bidiHeader.value.value;
    } else {
      throw new UnsupportedOperationException("Only string headers values are supported");
    }
  }
  return parsedHeaders;
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/permissions/PermissionsProcessor.js
var PermissionsProcessor = class {
  #browserCdpClient;
  constructor(browserCdpClient) {
    this.#browserCdpClient = browserCdpClient;
  }
  async setPermissions(params) {
    try {
      const userContextId = params["goog:userContext"] || params.userContext;
      await this.#browserCdpClient.sendCommand("Browser.setPermission", {
        origin: params.origin,
        embeddedOrigin: params.embeddedOrigin,
        browserContextId: userContextId && userContextId !== "default" ? userContextId : void 0,
        permission: {
          name: params.descriptor.name
        },
        setting: params.state
      });
    } catch (err) {
      if (err.message === `Permission can't be granted to opaque origins.`) {
        return {};
      }
      throw new InvalidArgumentException(err.message);
    }
    return {};
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/utils/uuid.js
function bytesToHex(bytes) {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
}
function uuidv4() {
  if ("crypto" in globalThis && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  const randomValues = new Uint8Array(16);
  if ("crypto" in globalThis && "getRandomValues" in globalThis.crypto) {
    globalThis.crypto.getRandomValues(randomValues);
  }
  randomValues[6] = randomValues[6] & 15 | 64;
  randomValues[8] = randomValues[8] & 63 | 128;
  return [
    bytesToHex(randomValues.subarray(0, 4)),
    bytesToHex(randomValues.subarray(4, 6)),
    bytesToHex(randomValues.subarray(6, 8)),
    bytesToHex(randomValues.subarray(8, 10)),
    bytesToHex(randomValues.subarray(10, 16))
  ].join("-");
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/script/ChannelProxy.js
var ChannelProxy = class _ChannelProxy {
  #properties;
  #id = uuidv4();
  #logger;
  constructor(channel, logger) {
    this.#properties = channel;
    this.#logger = logger;
  }
  /**
   * Creates a channel proxy in the given realm, initialises listener and
   * returns a handle to `sendMessage` delegate.
   */
  async init(realm, eventManager) {
    const channelHandle = await _ChannelProxy.#createAndGetHandleInRealm(realm);
    const sendMessageHandle = await _ChannelProxy.#createSendMessageHandle(realm, channelHandle);
    void this.#startListener(realm, channelHandle, eventManager);
    return sendMessageHandle;
  }
  /** Gets a ChannelProxy from window and returns its handle. */
  async startListenerFromWindow(realm, eventManager) {
    try {
      const channelHandle = await this.#getHandleFromWindow(realm);
      void this.#startListener(realm, channelHandle, eventManager);
    } catch (error) {
      this.#logger?.(LogType.debugError)?.(error);
    }
  }
  /**
   * Evaluation string which creates a ChannelProxy object on the client side.
   */
  static #createChannelProxyEvalStr() {
    const functionStr = String(() => {
      const queue = [];
      let queueNonEmptyResolver = null;
      return {
        /**
         * Gets a promise, which is resolved as soon as a message occurs
         * in the queue.
         */
        async getMessage() {
          const onMessage = queue.length > 0 ? Promise.resolve() : new Promise((resolve) => {
            queueNonEmptyResolver = resolve;
          });
          await onMessage;
          return queue.shift();
        },
        /**
         * Adds a message to the queue.
         * Resolves the pending promise if needed.
         */
        sendMessage(message) {
          queue.push(message);
          if (queueNonEmptyResolver !== null) {
            queueNonEmptyResolver();
            queueNonEmptyResolver = null;
          }
        }
      };
    });
    return `(${functionStr})()`;
  }
  /** Creates a ChannelProxy in the given realm. */
  static async #createAndGetHandleInRealm(realm) {
    const createChannelHandleResult = await realm.cdpClient.sendCommand("Runtime.evaluate", {
      expression: this.#createChannelProxyEvalStr(),
      contextId: realm.executionContextId,
      serializationOptions: {
        serialization: "idOnly"
      }
    });
    if (createChannelHandleResult.exceptionDetails || createChannelHandleResult.result.objectId === void 0) {
      throw new Error(`Cannot create channel`);
    }
    return createChannelHandleResult.result.objectId;
  }
  /** Gets a handle to `sendMessage` delegate from the ChannelProxy handle. */
  static async #createSendMessageHandle(realm, channelHandle) {
    const sendMessageArgResult = await realm.cdpClient.sendCommand("Runtime.callFunctionOn", {
      functionDeclaration: String((channelHandle2) => {
        return channelHandle2.sendMessage;
      }),
      arguments: [{ objectId: channelHandle }],
      executionContextId: realm.executionContextId,
      serializationOptions: {
        serialization: "idOnly"
      }
    });
    return sendMessageArgResult.result.objectId;
  }
  /** Starts listening for the channel events of the provided ChannelProxy. */
  async #startListener(realm, channelHandle, eventManager) {
    for (; ; ) {
      try {
        const message = await realm.cdpClient.sendCommand("Runtime.callFunctionOn", {
          functionDeclaration: String(async (channelHandle2) => await channelHandle2.getMessage()),
          arguments: [
            {
              objectId: channelHandle
            }
          ],
          awaitPromise: true,
          executionContextId: realm.executionContextId,
          serializationOptions: {
            serialization: "deep",
            maxDepth: this.#properties.serializationOptions?.maxObjectDepth ?? void 0
          }
        });
        if (message.exceptionDetails) {
          throw new Error("Runtime.callFunctionOn in ChannelProxy", {
            cause: message.exceptionDetails
          });
        }
        for (const browsingContext of realm.associatedBrowsingContexts) {
          eventManager.registerEvent({
            type: "event",
            method: chromium_bidi_exports.Script.EventNames.Message,
            params: {
              channel: this.#properties.channel,
              data: realm.cdpToBidiValue(message, this.#properties.ownership ?? Script2.ResultOwnership.None),
              source: realm.source
            }
          }, browsingContext.id);
        }
      } catch (error) {
        this.#logger?.(LogType.debugError)?.(error);
        break;
      }
    }
  }
  /**
   * Returns a handle of ChannelProxy from window's property which was set there
   * by `getEvalInWindowStr`. If window property is not set yet, sets a promise
   * resolver to the window property, so that `getEvalInWindowStr` can resolve
   * the promise later on with the channel.
   * This is needed because `getEvalInWindowStr` can be called before or
   * after this method.
   */
  async #getHandleFromWindow(realm) {
    const channelHandleResult = await realm.cdpClient.sendCommand("Runtime.callFunctionOn", {
      functionDeclaration: String((id) => {
        const w = window;
        if (w[id] === void 0) {
          return new Promise((resolve) => w[id] = resolve);
        }
        const channelProxy = w[id];
        delete w[id];
        return channelProxy;
      }),
      arguments: [{ value: this.#id }],
      executionContextId: realm.executionContextId,
      awaitPromise: true,
      serializationOptions: {
        serialization: "idOnly"
      }
    });
    if (channelHandleResult.exceptionDetails !== void 0 || channelHandleResult.result.objectId === void 0) {
      throw new Error(`ChannelHandle not found in window["${this.#id}"]`);
    }
    return channelHandleResult.result.objectId;
  }
  /**
   * String to be evaluated to create a ProxyChannel and put it to window.
   * Returns the delegate `sendMessage`. Used to provide an argument for preload
   * script. Does the following:
   * 1. Creates a ChannelProxy.
   * 2. Puts the ChannelProxy to window['${this.#id}'] or resolves the promise
   *    by calling delegate stored in window['${this.#id}'].
   *    This is needed because `#getHandleFromWindow` can be called before or
   *    after this method.
   * 3. Returns the delegate `sendMessage` of the created ChannelProxy.
   */
  getEvalInWindowStr() {
    const delegate = String((id, channelProxy) => {
      const w = window;
      if (w[id] === void 0) {
        w[id] = channelProxy;
      } else {
        w[id](channelProxy);
        delete w[id];
      }
      return channelProxy.sendMessage;
    });
    const channelProxyEval = _ChannelProxy.#createChannelProxyEvalStr();
    return `(${delegate})('${this.#id}',${channelProxyEval})`;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/script/PreloadScript.js
var PreloadScript = class {
  /** BiDi ID, an automatically generated UUID. */
  #id = uuidv4();
  /** CDP preload scripts. */
  #cdpPreloadScripts = [];
  /** The script itself, in a format expected by the spec i.e. a function. */
  #functionDeclaration;
  /** Targets, in which the preload script is initialized. */
  #targetIds = /* @__PURE__ */ new Set();
  /** Channels to be added as arguments to functionDeclaration. */
  #channels;
  /** The script sandbox / world name. */
  #sandbox;
  /** The browsing contexts to execute the preload scripts in, if any. */
  #contexts;
  /** The browsing contexts to execute the preload scripts in, if any. */
  #userContexts;
  get id() {
    return this.#id;
  }
  get targetIds() {
    return this.#targetIds;
  }
  constructor(params, logger) {
    this.#channels = params.arguments?.map((a) => new ChannelProxy(a.value, logger)) ?? [];
    this.#functionDeclaration = params.functionDeclaration;
    this.#sandbox = params.sandbox || void 0;
    this.#contexts = params.contexts;
    this.#userContexts = params.userContexts;
  }
  /** Channels of the preload script. */
  get channels() {
    return this.#channels;
  }
  /** Contexts of the preload script, if any */
  get contexts() {
    return this.#contexts;
  }
  /** UserContexts of the preload script, if any */
  get userContexts() {
    return this.#userContexts;
  }
  /** Sandbox / world name of the preload script, if any */
  get sandbox() {
    return this.#sandbox;
  }
  /**
   * String to be evaluated. Wraps user-provided function so that the following
   * steps are run:
   * 1. Create channels.
   * 2. Store the created channels in window.
   * 3. Call the user-provided function with channels as arguments.
   */
  #getEvaluateString() {
    const channelsArgStr = `[${this.channels.map((c) => c.getEvalInWindowStr()).join(", ")}]`;
    return `(()=>{(${this.#functionDeclaration})(...${channelsArgStr})})()`;
  }
  /**
   * Adds the script to the given CDP targets by calling the
   * `Page.addScriptToEvaluateOnNewDocument` command.
   */
  async initInTargets(cdpTargets, runImmediately) {
    await Promise.all(Array.from(cdpTargets).map((cdpTarget) => this.initInTarget(cdpTarget, runImmediately)));
  }
  /**
   * Adds the script to the given CDP target by calling the
   * `Page.addScriptToEvaluateOnNewDocument` command.
   */
  async initInTarget(cdpTarget, runImmediately) {
    const addCdpPreloadScriptResult = await cdpTarget.cdpClient.sendCommand("Page.addScriptToEvaluateOnNewDocument", {
      source: this.#getEvaluateString(),
      worldName: this.#sandbox,
      runImmediately
    });
    this.#cdpPreloadScripts.push({
      target: cdpTarget,
      preloadScriptId: addCdpPreloadScriptResult.identifier
    });
    this.#targetIds.add(cdpTarget.id);
  }
  /**
   * Removes this script from all CDP targets.
   */
  async remove() {
    await Promise.all([
      this.#cdpPreloadScripts.map(async (cdpPreloadScript) => {
        const cdpTarget = cdpPreloadScript.target;
        const cdpPreloadScriptId = cdpPreloadScript.preloadScriptId;
        return await cdpTarget.cdpClient.sendCommand("Page.removeScriptToEvaluateOnNewDocument", {
          identifier: cdpPreloadScriptId
        });
      })
    ]);
  }
  /** Removes the provided cdp target from the list of cdp preload scripts. */
  dispose(cdpTargetId) {
    this.#cdpPreloadScripts = this.#cdpPreloadScripts.filter((cdpPreloadScript) => cdpPreloadScript.target?.id !== cdpTargetId);
    this.#targetIds.delete(cdpTargetId);
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/script/ScriptProcessor.js
var ScriptProcessor = class {
  #eventManager;
  #browsingContextStorage;
  #realmStorage;
  #preloadScriptStorage;
  #userContextStorage;
  #logger;
  constructor(eventManager, browsingContextStorage, realmStorage, preloadScriptStorage, userContextStorage, logger) {
    this.#browsingContextStorage = browsingContextStorage;
    this.#realmStorage = realmStorage;
    this.#preloadScriptStorage = preloadScriptStorage;
    this.#userContextStorage = userContextStorage;
    this.#logger = logger;
    this.#eventManager = eventManager;
    this.#eventManager.addSubscribeHook(chromium_bidi_exports.Script.EventNames.RealmCreated, this.#onRealmCreatedSubscribeHook.bind(this));
  }
  #onRealmCreatedSubscribeHook(contextId) {
    const context = this.#browsingContextStorage.getContext(contextId);
    const contextsToReport = [
      context,
      ...this.#browsingContextStorage.getContext(contextId).allChildren
    ];
    const realms = /* @__PURE__ */ new Set();
    for (const reportContext of contextsToReport) {
      const realmsForContext = this.#realmStorage.findRealms({
        browsingContextId: reportContext.id
      });
      for (const realm of realmsForContext) {
        realms.add(realm);
      }
    }
    for (const realm of realms) {
      this.#eventManager.registerEvent({
        type: "event",
        method: chromium_bidi_exports.Script.EventNames.RealmCreated,
        params: realm.realmInfo
      }, context.id);
    }
    return Promise.resolve();
  }
  async addPreloadScript(params) {
    if (params.userContexts?.length && params.contexts?.length) {
      throw new InvalidArgumentException("Both userContexts and contexts cannot be specified.");
    }
    const userContexts = await this.#userContextStorage.verifyUserContextIdList(params.userContexts ?? []);
    const browsingContexts = this.#browsingContextStorage.verifyTopLevelContextsList(params.contexts);
    const preloadScript = new PreloadScript(params, this.#logger);
    this.#preloadScriptStorage.add(preloadScript);
    let contextsToRunIn = [];
    if (userContexts.size) {
      contextsToRunIn = this.#browsingContextStorage.getTopLevelContexts().filter((context) => {
        return userContexts.has(context.userContext);
      });
    } else if (browsingContexts.size) {
      contextsToRunIn = [...browsingContexts.values()];
    } else {
      contextsToRunIn = this.#browsingContextStorage.getTopLevelContexts();
    }
    const cdpTargets = new Set(contextsToRunIn.map((context) => context.cdpTarget));
    await preloadScript.initInTargets(cdpTargets, false);
    return {
      script: preloadScript.id
    };
  }
  async removePreloadScript(params) {
    const { script: id } = params;
    const script = this.#preloadScriptStorage.getPreloadScript(id);
    await script.remove();
    this.#preloadScriptStorage.remove(id);
    return {};
  }
  async callFunction(params) {
    const realm = await this.#getRealm(params.target);
    return await realm.callFunction(params.functionDeclaration, params.awaitPromise, params.this, params.arguments, params.resultOwnership, params.serializationOptions, params.userActivation);
  }
  async evaluate(params) {
    const realm = await this.#getRealm(params.target);
    return await realm.evaluate(params.expression, params.awaitPromise, params.resultOwnership, params.serializationOptions, params.userActivation);
  }
  async disown(params) {
    const realm = await this.#getRealm(params.target);
    await Promise.all(params.handles.map(async (handle) => await realm.disown(handle)));
    return {};
  }
  getRealms(params) {
    if (params.context !== void 0) {
      this.#browsingContextStorage.getContext(params.context);
    }
    const realms = this.#realmStorage.findRealms({
      browsingContextId: params.context,
      type: params.type,
      isHidden: false
    }).map((realm) => realm.realmInfo);
    return { realms };
  }
  async #getRealm(target) {
    if ("context" in target) {
      const context = this.#browsingContextStorage.getContext(target.context);
      return await context.getOrCreateUserSandbox(target.sandbox);
    }
    return this.#realmStorage.getRealm({
      realmId: target.realm,
      isHidden: false
    });
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/session/SessionProcessor.js
var SessionProcessor = class {
  #eventManager;
  #browserCdpClient;
  #initConnection;
  #created = false;
  constructor(eventManager, browserCdpClient, initConnection) {
    this.#eventManager = eventManager;
    this.#browserCdpClient = browserCdpClient;
    this.#initConnection = initConnection;
  }
  status() {
    return { ready: false, message: "already connected" };
  }
  #mergeCapabilities(capabilitiesRequest) {
    const mergedCapabilities = [];
    for (const first2 of capabilitiesRequest.firstMatch ?? [{}]) {
      const result = {
        ...capabilitiesRequest.alwaysMatch
      };
      for (const key of Object.keys(first2)) {
        if (result[key] !== void 0) {
          throw new InvalidArgumentException(`Capability ${key} in firstMatch is already defined in alwaysMatch`);
        }
        result[key] = first2[key];
      }
      mergedCapabilities.push(result);
    }
    const match = mergedCapabilities.find((c) => c.browserName === "chrome") ?? mergedCapabilities[0] ?? {};
    match.unhandledPromptBehavior = this.#getUnhandledPromptBehavior(match.unhandledPromptBehavior);
    return match;
  }
  #getUnhandledPromptBehavior(capabilityValue) {
    if (capabilityValue === void 0) {
      return void 0;
    }
    if (typeof capabilityValue === "object") {
      return capabilityValue;
    }
    if (typeof capabilityValue !== "string") {
      throw new InvalidArgumentException(`Unexpected 'unhandledPromptBehavior' type: ${typeof capabilityValue}`);
    }
    switch (capabilityValue) {
      // `beforeUnload: accept` has higher priority over string capability, as the latest
      // one is set to "fallbackDefault".
      // https://w3c.github.io/webdriver/#dfn-deserialize-as-an-unhandled-prompt-behavior
      // https://w3c.github.io/webdriver/#dfn-get-the-prompt-handler
      case "accept":
      case "accept and notify":
        return {
          default: Session.UserPromptHandlerType.Accept,
          beforeUnload: Session.UserPromptHandlerType.Accept
        };
      case "dismiss":
      case "dismiss and notify":
        return {
          default: Session.UserPromptHandlerType.Dismiss,
          beforeUnload: Session.UserPromptHandlerType.Accept
        };
      case "ignore":
        return {
          default: Session.UserPromptHandlerType.Ignore,
          beforeUnload: Session.UserPromptHandlerType.Accept
        };
      default:
        throw new InvalidArgumentException(`Unexpected 'unhandledPromptBehavior' value: ${capabilityValue}`);
    }
  }
  async new(params) {
    if (this.#created) {
      throw new Error("Session has been already created.");
    }
    this.#created = true;
    const matchedCapabitlites = this.#mergeCapabilities(params.capabilities);
    await this.#initConnection(matchedCapabitlites);
    const version = await this.#browserCdpClient.sendCommand("Browser.getVersion");
    return {
      sessionId: "unknown",
      capabilities: {
        ...matchedCapabitlites,
        acceptInsecureCerts: matchedCapabitlites.acceptInsecureCerts ?? false,
        browserName: version.product,
        browserVersion: version.revision,
        platformName: "",
        setWindowRect: false,
        webSocketUrl: "",
        userAgent: version.userAgent
      }
    };
  }
  async subscribe(params, googChannel = null) {
    const subscription = await this.#eventManager.subscribe(params.events, params.contexts ?? [], params.userContexts ?? [], googChannel);
    return {
      subscription
    };
  }
  async unsubscribe(params, googChannel = null) {
    if ("subscriptions" in params) {
      await this.#eventManager.unsubscribeByIds(params.subscriptions);
      return {};
    }
    await this.#eventManager.unsubscribe(params.events, googChannel);
    return {};
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/storage/StorageProcessor.js
var StorageProcessor = class {
  #browserCdpClient;
  #browsingContextStorage;
  #logger;
  constructor(browserCdpClient, browsingContextStorage, logger) {
    this.#browsingContextStorage = browsingContextStorage;
    this.#browserCdpClient = browserCdpClient;
    this.#logger = logger;
  }
  async deleteCookies(params) {
    const partitionKey = this.#expandStoragePartitionSpec(params.partition);
    let cdpResponse;
    try {
      cdpResponse = await this.#browserCdpClient.sendCommand("Storage.getCookies", {
        browserContextId: this.#getCdpBrowserContextId(partitionKey)
      });
    } catch (err) {
      if (this.#isNoSuchUserContextError(err)) {
        throw new NoSuchUserContextException(err.message);
      }
      throw err;
    }
    const cdpCookiesToDelete = cdpResponse.cookies.filter((c) => this.#matchCookiePartitionKey(c, partitionKey)).filter((cdpCookie) => {
      const bidiCookie = cdpToBiDiCookie(cdpCookie);
      return this.#matchCookie(bidiCookie, params.filter);
    }).map((cookie) => ({
      ...cookie,
      // Set expiry to pass date to delete the cookie.
      expires: 1
    }));
    await this.#browserCdpClient.sendCommand("Storage.setCookies", {
      cookies: cdpCookiesToDelete,
      browserContextId: this.#getCdpBrowserContextId(partitionKey)
    });
    return {
      partitionKey
    };
  }
  async getCookies(params) {
    const partitionKey = this.#expandStoragePartitionSpec(params.partition);
    let cdpResponse;
    try {
      cdpResponse = await this.#browserCdpClient.sendCommand("Storage.getCookies", {
        browserContextId: this.#getCdpBrowserContextId(partitionKey)
      });
    } catch (err) {
      if (this.#isNoSuchUserContextError(err)) {
        throw new NoSuchUserContextException(err.message);
      }
      throw err;
    }
    const filteredBiDiCookies = cdpResponse.cookies.filter((c) => this.#matchCookiePartitionKey(c, partitionKey)).map((c) => cdpToBiDiCookie(c)).filter((c) => this.#matchCookie(c, params.filter));
    return {
      cookies: filteredBiDiCookies,
      partitionKey
    };
  }
  async setCookie(params) {
    const partitionKey = this.#expandStoragePartitionSpec(params.partition);
    const cdpCookie = bidiToCdpCookie(params, partitionKey);
    try {
      await this.#browserCdpClient.sendCommand("Storage.setCookies", {
        cookies: [cdpCookie],
        browserContextId: this.#getCdpBrowserContextId(partitionKey)
      });
    } catch (err) {
      if (this.#isNoSuchUserContextError(err)) {
        throw new NoSuchUserContextException(err.message);
      }
      this.#logger?.(LogType.debugError)?.(err);
      throw new UnableToSetCookieException(err.toString());
    }
    return {
      partitionKey
    };
  }
  #isNoSuchUserContextError(err) {
    return err.message?.startsWith("Failed to find browser context for id");
  }
  #getCdpBrowserContextId(partitionKey) {
    return partitionKey.userContext === "default" ? void 0 : partitionKey.userContext;
  }
  #expandStoragePartitionSpecByBrowsingContext(descriptor) {
    const browsingContextId = descriptor.context;
    const browsingContext = this.#browsingContextStorage.getContext(browsingContextId);
    return {
      userContext: browsingContext.userContext
    };
  }
  #expandStoragePartitionSpecByStorageKey(descriptor) {
    const unsupportedPartitionKeys = /* @__PURE__ */ new Map();
    let sourceOrigin = descriptor.sourceOrigin;
    if (sourceOrigin !== void 0) {
      const url = NetworkProcessor.parseUrlString(sourceOrigin);
      if (url.origin === "null") {
        sourceOrigin = url.origin;
      } else {
        sourceOrigin = `${url.protocol}//${url.hostname}`;
      }
    }
    const hasCrossSiteAncestor = descriptor["goog:hasCrossSiteAncestor"];
    if (hasCrossSiteAncestor !== void 0 && typeof hasCrossSiteAncestor !== "boolean") {
      throw new InvalidArgumentException(`Expected 'goog:hasCrossSiteAncestor' to be a boolean, got ${typeof hasCrossSiteAncestor}.`);
    }
    for (const [key, value] of Object.entries(descriptor)) {
      if (key !== void 0 && value !== void 0 && ![
        "type",
        "sourceOrigin",
        "userContext",
        "goog:hasCrossSiteAncestor"
      ].includes(key)) {
        unsupportedPartitionKeys.set(key, value);
      }
    }
    if (unsupportedPartitionKeys.size > 0) {
      this.#logger?.(LogType.debugInfo)?.(`Unsupported partition keys: ${JSON.stringify(Object.fromEntries(unsupportedPartitionKeys))}`);
    }
    const userContext = descriptor.userContext ?? "default";
    return {
      userContext,
      ...sourceOrigin === void 0 ? {} : { sourceOrigin },
      ...hasCrossSiteAncestor === void 0 ? {} : { "goog:hasCrossSiteAncestor": hasCrossSiteAncestor }
    };
  }
  #expandStoragePartitionSpec(partitionSpec) {
    if (partitionSpec === void 0) {
      return { userContext: "default" };
    }
    if (partitionSpec.type === "context") {
      return this.#expandStoragePartitionSpecByBrowsingContext(partitionSpec);
    }
    assert2(partitionSpec.type === "storageKey", "Unknown partition type");
    return this.#expandStoragePartitionSpecByStorageKey(partitionSpec);
  }
  #matchCookiePartitionKey(cookie, partitionKey) {
    return (partitionKey.sourceOrigin === void 0 || cookie.partitionKey?.topLevelSite === partitionKey.sourceOrigin) && (partitionKey["goog:hasCrossSiteAncestor"] === void 0 || cookie.partitionKey?.hasCrossSiteAncestor === partitionKey["goog:hasCrossSiteAncestor"]);
  }
  #matchCookie(cookie, filter2) {
    if (filter2 === void 0) {
      return true;
    }
    return (filter2.domain === void 0 || filter2.domain === cookie.domain) && (filter2.name === void 0 || filter2.name === cookie.name) && // `value` contains fields `type` and `value`.
    (filter2.value === void 0 || deserializeByteValue(filter2.value) === deserializeByteValue(cookie.value)) && (filter2.path === void 0 || filter2.path === cookie.path) && (filter2.size === void 0 || filter2.size === cookie.size) && (filter2.httpOnly === void 0 || filter2.httpOnly === cookie.httpOnly) && (filter2.secure === void 0 || filter2.secure === cookie.secure) && (filter2.sameSite === void 0 || filter2.sameSite === cookie.sameSite) && (filter2.expiry === void 0 || filter2.expiry === cookie.expiry);
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/webExtension/WebExtensionProcessor.js
var WebExtensionProcessor = class {
  #browserCdpClient;
  constructor(browserCdpClient) {
    this.#browserCdpClient = browserCdpClient;
  }
  async install(params) {
    switch (params.extensionData.type) {
      case "archivePath":
      case "base64":
        throw new UnsupportedOperationException("Archived and Base64 extensions are not supported");
      case "path":
        break;
    }
    try {
      const response = await this.#browserCdpClient.sendCommand("Extensions.loadUnpacked", {
        path: params.extensionData.path
      });
      return {
        extension: response.id
      };
    } catch (err) {
      if (err.message.startsWith("invalid web extension")) {
        throw new InvalidWebExtensionException(err.message);
      }
      throw err;
    }
  }
  async uninstall(params) {
    try {
      await this.#browserCdpClient.sendCommand("Extensions.uninstall", {
        id: params.extension
      });
      return {};
    } catch (err) {
      if (err.message === "Uninstall failed. Reason: could not find extension.") {
        throw new NoSuchWebExtensionException("no such web extension");
      }
      throw err;
    }
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/OutgoingMessage.js
var OutgoingMessage = class _OutgoingMessage {
  #message;
  #googChannel;
  constructor(message, googChannel = null) {
    this.#message = message;
    this.#googChannel = googChannel;
  }
  static createFromPromise(messagePromise, googChannel) {
    return messagePromise.then((message) => {
      if (message.kind === "success") {
        return {
          kind: "success",
          value: new _OutgoingMessage(message.value, googChannel)
        };
      }
      return message;
    });
  }
  static createResolved(message, googChannel = null) {
    return Promise.resolve({
      kind: "success",
      value: new _OutgoingMessage(message, googChannel)
    });
  }
  get message() {
    return this.#message;
  }
  get googChannel() {
    return this.#googChannel;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/CommandProcessor.js
var CommandProcessorEvents;
(function(CommandProcessorEvents2) {
  CommandProcessorEvents2["Response"] = "response";
})(CommandProcessorEvents || (CommandProcessorEvents = {}));
var CommandProcessor = class extends EventEmitter2 {
  // keep-sorted start
  #bluetoothProcessor;
  #browserCdpClient;
  #browserProcessor;
  #browsingContextProcessor;
  #cdpProcessor;
  #digitalCredentialsProcessor;
  #emulationProcessor;
  #inputProcessor;
  #networkProcessor;
  #permissionsProcessor;
  #scriptProcessor;
  #sessionProcessor;
  #storageProcessor;
  #webExtensionProcessor;
  // keep-sorted end
  #parser;
  #logger;
  constructor(cdpConnection, browserCdpClient, eventManager, browsingContextStorage, realmStorage, preloadScriptStorage, networkStorage, contextConfigStorage, bluetoothProcessor, digitalCredentialsProcessor, userContextStorage, parser = new BidiNoOpParser(), initConnection, logger) {
    super();
    this.#browserCdpClient = browserCdpClient;
    this.#parser = parser;
    this.#logger = logger;
    this.#bluetoothProcessor = bluetoothProcessor;
    this.#digitalCredentialsProcessor = digitalCredentialsProcessor;
    this.#browserProcessor = new BrowserProcessor(browserCdpClient, browsingContextStorage, contextConfigStorage, userContextStorage);
    this.#browsingContextProcessor = new BrowsingContextProcessor(browserCdpClient, browsingContextStorage, userContextStorage, contextConfigStorage, eventManager);
    this.#cdpProcessor = new CdpProcessor(browsingContextStorage, realmStorage, cdpConnection, browserCdpClient);
    this.#emulationProcessor = new EmulationProcessor(browsingContextStorage, userContextStorage, contextConfigStorage);
    this.#inputProcessor = new InputProcessor(browsingContextStorage);
    this.#networkProcessor = new NetworkProcessor(browsingContextStorage, networkStorage, userContextStorage, contextConfigStorage);
    this.#permissionsProcessor = new PermissionsProcessor(browserCdpClient);
    this.#scriptProcessor = new ScriptProcessor(eventManager, browsingContextStorage, realmStorage, preloadScriptStorage, userContextStorage, logger);
    this.#sessionProcessor = new SessionProcessor(eventManager, browserCdpClient, initConnection);
    this.#storageProcessor = new StorageProcessor(browserCdpClient, browsingContextStorage, logger);
    this.#webExtensionProcessor = new WebExtensionProcessor(browserCdpClient);
  }
  async #processCommand(command) {
    switch (command.method) {
      // Bluetooth module
      // keep-sorted start block=yes
      case "bluetooth.disableSimulation":
        return await this.#bluetoothProcessor.disableSimulation(this.#parser.parseDisableSimulationParameters(command.params));
      case "bluetooth.handleRequestDevicePrompt":
        return await this.#bluetoothProcessor.handleRequestDevicePrompt(this.#parser.parseHandleRequestDevicePromptParams(command.params));
      case "bluetooth.simulateAdapter":
        return await this.#bluetoothProcessor.simulateAdapter(this.#parser.parseSimulateAdapterParameters(command.params));
      case "bluetooth.simulateAdvertisement":
        return await this.#bluetoothProcessor.simulateAdvertisement(this.#parser.parseSimulateAdvertisementParameters(command.params));
      case "bluetooth.simulateCharacteristic":
        return await this.#bluetoothProcessor.simulateCharacteristic(this.#parser.parseSimulateCharacteristicParameters(command.params));
      case "bluetooth.simulateCharacteristicResponse":
        return await this.#bluetoothProcessor.simulateCharacteristicResponse(this.#parser.parseSimulateCharacteristicResponseParameters(command.params));
      case "bluetooth.simulateDescriptor":
        return await this.#bluetoothProcessor.simulateDescriptor(this.#parser.parseSimulateDescriptorParameters(command.params));
      case "bluetooth.simulateDescriptorResponse":
        return await this.#bluetoothProcessor.simulateDescriptorResponse(this.#parser.parseSimulateDescriptorResponseParameters(command.params));
      case "bluetooth.simulateGattConnectionResponse":
        return await this.#bluetoothProcessor.simulateGattConnectionResponse(this.#parser.parseSimulateGattConnectionResponseParameters(command.params));
      case "bluetooth.simulateGattDisconnection":
        return await this.#bluetoothProcessor.simulateGattDisconnection(this.#parser.parseSimulateGattDisconnectionParameters(command.params));
      case "bluetooth.simulatePreconnectedPeripheral":
        return await this.#bluetoothProcessor.simulatePreconnectedPeripheral(this.#parser.parseSimulatePreconnectedPeripheralParameters(command.params));
      case "bluetooth.simulateService":
        return await this.#bluetoothProcessor.simulateService(this.#parser.parseSimulateServiceParameters(command.params));
      // keep-sorted end
      // Browser module
      // keep-sorted start block=yes
      case "browser.close":
        return this.#browserProcessor.close();
      case "browser.createUserContext":
        return await this.#browserProcessor.createUserContext(this.#parser.parseCreateUserContextParameters(command.params));
      case "browser.getClientWindows":
        return await this.#browserProcessor.getClientWindows();
      case "browser.getUserContexts":
        return await this.#browserProcessor.getUserContexts();
      case "browser.removeUserContext":
        return await this.#browserProcessor.removeUserContext(this.#parser.parseRemoveUserContextParameters(command.params));
      case "browser.setClientWindowState":
        return await this.#browserProcessor.setClientWindowState(this.#parser.parseSetClientWindowStateParameters(command.params));
      case "browser.setDownloadBehavior":
        return await this.#browserProcessor.setDownloadBehavior(this.#parser.parseSetDownloadBehaviorParameters(command.params));
      // keep-sorted end
      // Browsing Context module
      // keep-sorted start block=yes
      case "browsingContext.activate":
        return await this.#browsingContextProcessor.activate(this.#parser.parseActivateParams(command.params));
      case "browsingContext.captureScreenshot":
        return await this.#browsingContextProcessor.captureScreenshot(this.#parser.parseCaptureScreenshotParams(command.params));
      case "browsingContext.close":
        return await this.#browsingContextProcessor.close(this.#parser.parseCloseParams(command.params));
      case "browsingContext.create":
        return await this.#browsingContextProcessor.create(this.#parser.parseCreateParams(command.params));
      case "browsingContext.getTree":
        return this.#browsingContextProcessor.getTree(this.#parser.parseGetTreeParams(command.params));
      case "browsingContext.handleUserPrompt":
        return await this.#browsingContextProcessor.handleUserPrompt(this.#parser.parseHandleUserPromptParams(command.params));
      case "browsingContext.locateNodes":
        return await this.#browsingContextProcessor.locateNodes(this.#parser.parseLocateNodesParams(command.params));
      case "browsingContext.navigate":
        return await this.#browsingContextProcessor.navigate(this.#parser.parseNavigateParams(command.params));
      case "browsingContext.print":
        return await this.#browsingContextProcessor.print(this.#parser.parsePrintParams(command.params));
      case "browsingContext.reload":
        return await this.#browsingContextProcessor.reload(this.#parser.parseReloadParams(command.params));
      case "browsingContext.setBypassCSP":
        this.#parser.parseSetBypassCspParams(command.params);
        throw new UnsupportedOperationException(`Method ${command.method} is not implemented.`);
      case "browsingContext.setViewport":
        return await this.#browsingContextProcessor.setViewport(this.#parser.parseSetViewportParams(command.params));
      case "browsingContext.startScreencast":
        this.#parser.parseStartScreencastParams(command.params);
        throw new UnsupportedOperationException(`Method ${command.method} is not implemented.`);
      case "browsingContext.stopScreencast":
        this.#parser.parseStopScreencastParams(command.params);
        throw new UnsupportedOperationException(`Method ${command.method} is not implemented.`);
      case "browsingContext.traverseHistory":
        return await this.#browsingContextProcessor.traverseHistory(this.#parser.parseTraverseHistoryParams(command.params));
      // keep-sorted end
      // CDP module
      // keep-sorted start block=yes
      case "goog:cdp.getSession":
        return this.#cdpProcessor.getSession(this.#parser.parseGetSessionParams(command.params));
      case "goog:cdp.resolveRealm":
        return this.#cdpProcessor.resolveRealm(this.#parser.parseResolveRealmParams(command.params));
      case "goog:cdp.sendCommand":
        return await this.#cdpProcessor.sendCommand(this.#parser.parseSendCommandParams(command.params));
      // keep-sorted end
      // DigitalCredentials module
      // keep-sorted start block=yes
      case "digitalCredentials.setVirtualWalletBehavior":
        return await this.#digitalCredentialsProcessor.setVirtualWalletBehavior(this.#parser.parseSetVirtualWalletBehaviorParams(command.params));
      // keep-sorted end
      // Emulation module
      // keep-sorted start block=yes
      case "emulation.setForcedColorsModeThemeOverride":
        this.#parser.parseSetForcedColorsModeThemeOverrideParams(command.params);
        throw new UnsupportedOperationException(`Method ${command.method} is not implemented.`);
      case "emulation.setGeolocationOverride":
        return await this.#emulationProcessor.setGeolocationOverride(this.#parser.parseSetGeolocationOverrideParams(command.params));
      case "emulation.setLocaleOverride":
        return await this.#emulationProcessor.setLocaleOverride(this.#parser.parseSetLocaleOverrideParams(command.params));
      case "emulation.setMediaFeaturesOverride":
        return await this.#emulationProcessor.setMediaFeaturesOverride(this.#parser.parseSetMediaFeaturesOverrideParams(command.params));
      case "emulation.setNetworkConditions":
        return await this.#emulationProcessor.setNetworkConditions(this.#parser.parseSetNetworkConditionsParams(command.params));
      case "emulation.setScreenOrientationOverride":
        return await this.#emulationProcessor.setScreenOrientationOverride(this.#parser.parseSetScreenOrientationOverrideParams(command.params));
      case "emulation.setScreenSettingsOverride":
        return await this.#emulationProcessor.setScreenSettingsOverride(this.#parser.parseSetScreenSettingsOverrideParams(command.params));
      case "emulation.setScriptingEnabled":
        return await this.#emulationProcessor.setScriptingEnabled(this.#parser.parseSetScriptingEnabledParams(command.params));
      case "emulation.setScrollbarTypeOverride":
        return await this.#emulationProcessor.setScrollbarTypeOverride(this.#parser.parseSetScrollbarTypeOverrideParams(command.params));
      case "emulation.setTextLayoutModeOverride":
        this.#parser.parseSetTextLayoutModeOverrideParams(command.params);
        throw new UnsupportedOperationException(`Method ${command.method} is not implemented.`);
      case "emulation.setTimezoneOverride":
        return await this.#emulationProcessor.setTimezoneOverride(this.#parser.parseSetTimezoneOverrideParams(command.params));
      case "emulation.setTouchOverride":
        return await this.#emulationProcessor.setTouchOverride(this.#parser.parseSetTouchOverrideParams(command.params));
      case "emulation.setUserAgentOverride":
        return await this.#emulationProcessor.setUserAgentOverrideParams(this.#parser.parseSetUserAgentOverrideParams(command.params));
      case "emulation.setViewportMetaOverride":
        return await this.#emulationProcessor.setViewportMetaOverride(this.#parser.parseSetViewportMetaOverrideParams(command.params));
      case "userAgentClientHints.setClientHintsOverride":
        return await this.#emulationProcessor.setClientHintsOverride(this.#parser.parseSetClientHintsOverrideParams(command.params));
      // keep-sorted end
      // Input module
      // keep-sorted start block=yes
      case "input.performActions":
        return await this.#inputProcessor.performActions(this.#parser.parsePerformActionsParams(command.params));
      case "input.releaseActions":
        return await this.#inputProcessor.releaseActions(this.#parser.parseReleaseActionsParams(command.params));
      case "input.setFiles":
        return await this.#inputProcessor.setFiles(this.#parser.parseSetFilesParams(command.params));
      // keep-sorted end
      // Network module
      // keep-sorted start block=yes
      case "network.addDataCollector":
        return await this.#networkProcessor.addDataCollector(this.#parser.parseAddDataCollectorParams(command.params));
      case "network.addIntercept":
        return await this.#networkProcessor.addIntercept(this.#parser.parseAddInterceptParams(command.params));
      case "network.continueRequest":
        return await this.#networkProcessor.continueRequest(this.#parser.parseContinueRequestParams(command.params));
      case "network.continueResponse":
        return await this.#networkProcessor.continueResponse(this.#parser.parseContinueResponseParams(command.params));
      case "network.continueWithAuth":
        return await this.#networkProcessor.continueWithAuth(this.#parser.parseContinueWithAuthParams(command.params));
      case "network.disownData":
        return this.#networkProcessor.disownData(this.#parser.parseDisownDataParams(command.params));
      case "network.failRequest":
        return await this.#networkProcessor.failRequest(this.#parser.parseFailRequestParams(command.params));
      case "network.getData":
        return await this.#networkProcessor.getData(this.#parser.parseGetDataParams(command.params));
      case "network.provideResponse":
        return await this.#networkProcessor.provideResponse(this.#parser.parseProvideResponseParams(command.params));
      case "network.removeDataCollector":
        return await this.#networkProcessor.removeDataCollector(this.#parser.parseRemoveDataCollectorParams(command.params));
      case "network.removeIntercept":
        return await this.#networkProcessor.removeIntercept(this.#parser.parseRemoveInterceptParams(command.params));
      case "network.setCacheBehavior":
        return await this.#networkProcessor.setCacheBehavior(this.#parser.parseSetCacheBehaviorParams(command.params));
      case "network.setExtraHeaders":
        return await this.#networkProcessor.setExtraHeaders(this.#parser.parseSetExtraHeadersParams(command.params));
      // keep-sorted end
      // Permissions module
      // keep-sorted start block=yes
      case "permissions.setPermission":
        return await this.#permissionsProcessor.setPermissions(this.#parser.parseSetPermissionsParams(command.params));
      // keep-sorted end
      // Script module
      // keep-sorted start block=yes
      case "script.addPreloadScript":
        return await this.#scriptProcessor.addPreloadScript(this.#parser.parseAddPreloadScriptParams(command.params));
      case "script.callFunction":
        return await this.#scriptProcessor.callFunction(this.#parser.parseCallFunctionParams(this.#processTargetParams(command.params)));
      case "script.disown":
        return await this.#scriptProcessor.disown(this.#parser.parseDisownParams(this.#processTargetParams(command.params)));
      case "script.evaluate":
        return await this.#scriptProcessor.evaluate(this.#parser.parseEvaluateParams(this.#processTargetParams(command.params)));
      case "script.getRealms":
        return this.#scriptProcessor.getRealms(this.#parser.parseGetRealmsParams(command.params));
      case "script.removePreloadScript":
        return await this.#scriptProcessor.removePreloadScript(this.#parser.parseRemovePreloadScriptParams(command.params));
      // keep-sorted end
      // Session module
      // keep-sorted start block=yes
      case "session.end":
        throw new UnsupportedOperationException(`Method ${command.method} is not implemented.`);
      case "session.new":
        return await this.#sessionProcessor.new(command.params);
      case "session.status":
        return this.#sessionProcessor.status();
      case "session.subscribe":
        return await this.#sessionProcessor.subscribe(this.#parser.parseSubscribeParams(command.params), command["goog:channel"]);
      case "session.unsubscribe":
        return await this.#sessionProcessor.unsubscribe(this.#parser.parseUnsubscribeParams(command.params), command["goog:channel"]);
      // keep-sorted end
      // Storage module
      // keep-sorted start block=yes
      case "storage.deleteCookies":
        return await this.#storageProcessor.deleteCookies(this.#parser.parseDeleteCookiesParams(command.params));
      case "storage.getCookies":
        return await this.#storageProcessor.getCookies(this.#parser.parseGetCookiesParams(command.params));
      case "storage.setCookie":
        return await this.#storageProcessor.setCookie(this.#parser.parseSetCookieParams(command.params));
      // keep-sorted end
      // WebExtension module
      // keep-sorted start block=yes
      case "webExtension.install":
        return await this.#webExtensionProcessor.install(this.#parser.parseInstallParams(command.params));
      case "webExtension.uninstall":
        return await this.#webExtensionProcessor.uninstall(this.#parser.parseUninstallParams(command.params));
    }
    throw new UnknownCommandException(`Unknown command '${command?.method}'.`);
  }
  // Workaround for as zod.union always take the first schema
  // https://github.com/w3c/webdriver-bidi/issues/635
  #processTargetParams(params) {
    if (typeof params === "object" && params && "target" in params && typeof params.target === "object" && params.target && "context" in params.target) {
      delete params.target["realm"];
    }
    return params;
  }
  async processCommand(command) {
    try {
      const result = await this.#processCommand(command);
      const response = {
        type: "success",
        id: command.id,
        result
      };
      this.emit("response", {
        message: OutgoingMessage.createResolved(response, command["goog:channel"]),
        event: command.method
      });
    } catch (e) {
      if (e instanceof Exception) {
        this.emit("response", {
          message: OutgoingMessage.createResolved(e.toErrorResponse(command.id), command["goog:channel"]),
          event: command.method
        });
      } else {
        const error = e;
        this.#logger?.(LogType.bidi)?.(error);
        const errorException = this.#browserCdpClient.isCloseError(e) ? new NoSuchFrameException(`Browsing context is gone`) : new UnknownErrorException(error.message, error.stack);
        this.emit("response", {
          message: OutgoingMessage.createResolved(errorException.toErrorResponse(command.id), command["goog:channel"]),
          event: command.method
        });
      }
    }
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/bluetooth/BluetoothProcessor.js
var BluetoothGattItem = class {
  id;
  uuid;
  constructor(id, uuid) {
    this.id = id;
    this.uuid = uuid;
  }
};
var BluetoothDescriptor = class extends BluetoothGattItem {
  characteristic;
  constructor(id, uuid, characteristic) {
    super(id, uuid);
    this.characteristic = characteristic;
  }
};
var BluetoothCharacteristic = class extends BluetoothGattItem {
  descriptors = /* @__PURE__ */ new Map();
  service;
  constructor(id, uuid, service) {
    super(id, uuid);
    this.service = service;
  }
};
var BluetoothService = class extends BluetoothGattItem {
  characteristics = /* @__PURE__ */ new Map();
  device;
  constructor(id, uuid, device) {
    super(id, uuid);
    this.device = device;
  }
};
var BluetoothDevice = class {
  address;
  services = /* @__PURE__ */ new Map();
  constructor(address) {
    this.address = address;
  }
};
var BluetoothProcessor = class {
  #eventManager;
  #browsingContextStorage;
  #bluetoothDevices = /* @__PURE__ */ new Map();
  // A map from a characteristic id from CDP to its BluetoothCharacteristic object.
  #bluetoothCharacteristics = /* @__PURE__ */ new Map();
  // A map from a descriptor id from CDP to its BluetoothDescriptor object.
  #bluetoothDescriptors = /* @__PURE__ */ new Map();
  constructor(eventManager, browsingContextStorage) {
    this.#eventManager = eventManager;
    this.#browsingContextStorage = browsingContextStorage;
  }
  #getDevice(address) {
    const device = this.#bluetoothDevices.get(address);
    if (!device) {
      throw new InvalidArgumentException(`Bluetooth device with address ${address} does not exist`);
    }
    return device;
  }
  #getService(device, serviceUuid) {
    const service = device.services.get(serviceUuid);
    if (!service) {
      throw new InvalidArgumentException(`Service with UUID ${serviceUuid} on device ${device.address} does not exist`);
    }
    return service;
  }
  #getCharacteristic(service, characteristicUuid) {
    const characteristic = service.characteristics.get(characteristicUuid);
    if (!characteristic) {
      throw new InvalidArgumentException(`Characteristic with UUID ${characteristicUuid} does not exist for service ${service.uuid} on device ${service.device.address}`);
    }
    return characteristic;
  }
  #getDescriptor(characteristic, descriptorUuid) {
    const descriptor = characteristic.descriptors.get(descriptorUuid);
    if (!descriptor) {
      throw new InvalidArgumentException(`Descriptor with UUID ${descriptorUuid} does not exist for characteristic ${characteristic.uuid} on service ${characteristic.service.uuid} on device ${characteristic.service.device.address}`);
    }
    return descriptor;
  }
  async simulateAdapter(params) {
    if (params.state === void 0) {
      throw new InvalidArgumentException(`Parameter "state" is required for creating a Bluetooth adapter`);
    }
    const context = this.#browsingContextStorage.getContext(params.context);
    await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.disable");
    this.#bluetoothDevices.clear();
    this.#bluetoothCharacteristics.clear();
    this.#bluetoothDescriptors.clear();
    await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.enable", {
      state: params.state,
      leSupported: params.leSupported ?? true
    });
    return {};
  }
  async disableSimulation(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.disable");
    this.#bluetoothDevices.clear();
    this.#bluetoothCharacteristics.clear();
    this.#bluetoothDescriptors.clear();
    return {};
  }
  async simulatePreconnectedPeripheral(params) {
    if (this.#bluetoothDevices.has(params.address)) {
      throw new InvalidArgumentException(`Bluetooth device with address ${params.address} already exists`);
    }
    const context = this.#browsingContextStorage.getContext(params.context);
    await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.simulatePreconnectedPeripheral", {
      address: params.address,
      name: params.name,
      knownServiceUuids: params.knownServiceUuids,
      manufacturerData: params.manufacturerData
    });
    this.#bluetoothDevices.set(params.address, new BluetoothDevice(params.address));
    return {};
  }
  async simulateAdvertisement(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.simulateAdvertisement", {
      entry: params.scanEntry
    });
    return {};
  }
  async simulateCharacteristic(params) {
    const device = this.#getDevice(params.address);
    const service = this.#getService(device, params.serviceUuid);
    const context = this.#browsingContextStorage.getContext(params.context);
    switch (params.type) {
      case "add": {
        if (params.characteristicProperties === void 0) {
          throw new InvalidArgumentException(`Parameter "characteristicProperties" is required for adding a Bluetooth characteristic`);
        }
        if (service.characteristics.has(params.characteristicUuid)) {
          throw new InvalidArgumentException(`Characteristic with UUID ${params.characteristicUuid} already exists`);
        }
        const response = await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.addCharacteristic", {
          serviceId: service.id,
          characteristicUuid: params.characteristicUuid,
          properties: params.characteristicProperties
        });
        const characteristic = new BluetoothCharacteristic(response.characteristicId, params.characteristicUuid, service);
        service.characteristics.set(params.characteristicUuid, characteristic);
        this.#bluetoothCharacteristics.set(characteristic.id, characteristic);
        return {};
      }
      case "remove": {
        if (params.characteristicProperties !== void 0) {
          throw new InvalidArgumentException(`Parameter "characteristicProperties" should not be provided for removing a Bluetooth characteristic`);
        }
        const characteristic = this.#getCharacteristic(service, params.characteristicUuid);
        await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.removeCharacteristic", {
          characteristicId: characteristic.id
        });
        service.characteristics.delete(params.characteristicUuid);
        this.#bluetoothCharacteristics.delete(characteristic.id);
        return {};
      }
      default:
        throw new InvalidArgumentException(`Parameter "type" of ${params.type} is not supported`);
    }
  }
  async simulateCharacteristicResponse(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    const device = this.#getDevice(params.address);
    const service = this.#getService(device, params.serviceUuid);
    const characteristic = this.#getCharacteristic(service, params.characteristicUuid);
    await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.simulateCharacteristicOperationResponse", {
      characteristicId: characteristic.id,
      type: params.type,
      code: params.code,
      ...params.data && {
        data: btoa(String.fromCharCode(...params.data))
      }
    });
    return {};
  }
  async simulateDescriptor(params) {
    const device = this.#getDevice(params.address);
    const service = this.#getService(device, params.serviceUuid);
    const characteristic = this.#getCharacteristic(service, params.characteristicUuid);
    const context = this.#browsingContextStorage.getContext(params.context);
    switch (params.type) {
      case "add": {
        if (characteristic.descriptors.has(params.descriptorUuid)) {
          throw new InvalidArgumentException(`Descriptor with UUID ${params.descriptorUuid} already exists`);
        }
        const response = await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.addDescriptor", {
          characteristicId: characteristic.id,
          descriptorUuid: params.descriptorUuid
        });
        const descriptor = new BluetoothDescriptor(response.descriptorId, params.descriptorUuid, characteristic);
        characteristic.descriptors.set(params.descriptorUuid, descriptor);
        this.#bluetoothDescriptors.set(descriptor.id, descriptor);
        return {};
      }
      case "remove": {
        const descriptor = this.#getDescriptor(characteristic, params.descriptorUuid);
        await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.removeDescriptor", {
          descriptorId: descriptor.id
        });
        characteristic.descriptors.delete(params.descriptorUuid);
        this.#bluetoothDescriptors.delete(descriptor.id);
        return {};
      }
      default:
        throw new InvalidArgumentException(`Parameter "type" of ${params.type} is not supported`);
    }
  }
  async simulateDescriptorResponse(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    const device = this.#getDevice(params.address);
    const service = this.#getService(device, params.serviceUuid);
    const characteristic = this.#getCharacteristic(service, params.characteristicUuid);
    const descriptor = this.#getDescriptor(characteristic, params.descriptorUuid);
    await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.simulateDescriptorOperationResponse", {
      descriptorId: descriptor.id,
      type: params.type,
      code: params.code,
      ...params.data && {
        data: btoa(String.fromCharCode(...params.data))
      }
    });
    return {};
  }
  async simulateGattConnectionResponse(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.simulateGATTOperationResponse", {
      address: params.address,
      type: "connection",
      code: params.code
    });
    return {};
  }
  async simulateGattDisconnection(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.simulateGATTDisconnection", {
      address: params.address
    });
    return {};
  }
  async simulateService(params) {
    const device = this.#getDevice(params.address);
    const context = this.#browsingContextStorage.getContext(params.context);
    switch (params.type) {
      case "add": {
        if (device.services.has(params.uuid)) {
          throw new InvalidArgumentException(`Service with UUID ${params.uuid} already exists`);
        }
        const response = await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.addService", {
          address: params.address,
          serviceUuid: params.uuid
        });
        device.services.set(params.uuid, new BluetoothService(response.serviceId, params.uuid, device));
        return {};
      }
      case "remove": {
        const service = this.#getService(device, params.uuid);
        await context.cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.removeService", {
          serviceId: service.id
        });
        device.services.delete(params.uuid);
        return {};
      }
      default:
        throw new InvalidArgumentException(`Parameter "type" of ${params.type} is not supported`);
    }
  }
  onCdpTargetCreated(cdpTarget) {
    cdpTarget.cdpClient.on("DeviceAccess.deviceRequestPrompted", (event) => {
      this.#eventManager.registerEvent({
        type: "event",
        method: "bluetooth.requestDevicePromptUpdated",
        params: {
          context: cdpTarget.id,
          prompt: event.id,
          devices: event.devices
        }
      }, cdpTarget.id);
    });
    cdpTarget.browserCdpClient.on("BluetoothEmulation.gattOperationReceived", async (event) => {
      switch (event.type) {
        case "connection":
          this.#eventManager.registerEvent({
            type: "event",
            method: "bluetooth.gattConnectionAttempted",
            params: {
              context: cdpTarget.id,
              address: event.address
            }
          }, cdpTarget.id);
          return;
        case "discovery":
          await cdpTarget.browserCdpClient.sendCommand("BluetoothEmulation.simulateGATTOperationResponse", {
            address: event.address,
            type: "discovery",
            code: 0
          });
      }
    });
    cdpTarget.browserCdpClient.on("BluetoothEmulation.characteristicOperationReceived", (event) => {
      if (!this.#bluetoothCharacteristics.has(event.characteristicId)) {
        return;
      }
      let type;
      if (event.type === "write") {
        if (event.writeType === "write-default-deprecated") {
          return;
        }
        type = event.writeType;
      } else {
        type = event.type;
      }
      const characteristic = this.#bluetoothCharacteristics.get(event.characteristicId);
      this.#eventManager.registerEvent({
        type: "event",
        method: "bluetooth.characteristicEventGenerated",
        params: {
          context: cdpTarget.id,
          address: characteristic.service.device.address,
          serviceUuid: characteristic.service.uuid,
          characteristicUuid: characteristic.uuid,
          type,
          ...event.data && {
            data: Array.from(atob(event.data), (c) => c.charCodeAt(0))
          }
        }
      }, cdpTarget.id);
    });
    cdpTarget.browserCdpClient.on("BluetoothEmulation.descriptorOperationReceived", (event) => {
      if (!this.#bluetoothDescriptors.has(event.descriptorId)) {
        return;
      }
      const descriptor = this.#bluetoothDescriptors.get(event.descriptorId);
      this.#eventManager.registerEvent({
        type: "event",
        method: "bluetooth.descriptorEventGenerated",
        params: {
          context: cdpTarget.id,
          address: descriptor.characteristic.service.device.address,
          serviceUuid: descriptor.characteristic.service.uuid,
          characteristicUuid: descriptor.characteristic.uuid,
          descriptorUuid: descriptor.uuid,
          type: event.type,
          ...event.data && {
            data: Array.from(atob(event.data), (c) => c.charCodeAt(0))
          }
        }
      }, cdpTarget.id);
    });
  }
  async handleRequestDevicePrompt(params) {
    const context = this.#browsingContextStorage.getContext(params.context);
    if (params.accept) {
      await context.cdpTarget.cdpClient.sendCommand("DeviceAccess.selectPrompt", {
        id: params.prompt,
        deviceId: params.device
      });
    } else {
      await context.cdpTarget.cdpClient.sendCommand("DeviceAccess.cancelPrompt", {
        id: params.prompt
      });
    }
    return {};
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/browser/ContextConfig.js
var ContextConfig = class _ContextConfig {
  // keep-sorted start block=yes
  acceptInsecureCerts;
  clientHints;
  devicePixelRatio;
  digitalCredentialsBehavior;
  disableNetworkDurableMessages;
  downloadBehavior;
  emulatedNetworkConditions;
  // Extra headers are kept in CDP format.
  extraHeaders;
  geolocation;
  locale;
  maxTouchPoints;
  mediaFeatures;
  prerenderingDisabled;
  screenArea;
  screenOrientation;
  scriptingEnabled;
  scrollbarType;
  // Timezone is kept in CDP format with GMT prefix for offset values.
  timezone;
  userAgent;
  userPromptHandler;
  viewport;
  viewportMeta;
  // keep-sorted end
  /**
   * Merges multiple `ContextConfig` objects. The configs are merged in the order they are
   * provided. For each property, the value from the last config that defines it will be
   * used. The final result will not contain any `undefined` or `null` properties.
   * `undefined` values are ignored. `null` values remove the already set value.
   */
  static merge(...configs) {
    const result = new _ContextConfig();
    for (const config of configs) {
      if (!config) {
        continue;
      }
      for (const key in config) {
        const value = config[key];
        if (value === null) {
          delete result[key];
        } else if (value !== void 0) {
          result[key] = value;
        }
      }
    }
    return result;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/browser/ContextConfigStorage.js
var ContextConfigStorage = class {
  #global = new ContextConfig();
  #userContextConfigs = /* @__PURE__ */ new Map();
  #browsingContextConfigs = /* @__PURE__ */ new Map();
  /**
   * Updates the global configuration. Properties with `undefined` values in the
   * provided `config` are ignored.
   */
  updateGlobalConfig(config) {
    this.#global = ContextConfig.merge(this.#global, config);
  }
  /**
   * Updates the configuration for a specific browsing context. Properties with
   * `undefined` values in the provided `config` are ignored.
   */
  updateBrowsingContextConfig(browsingContextId, config) {
    this.#browsingContextConfigs.set(browsingContextId, ContextConfig.merge(this.#browsingContextConfigs.get(browsingContextId), config));
  }
  /**
   * Updates the configuration for a specific user context. Properties with
   * `undefined` values in the provided `config` are ignored.
   */
  updateUserContextConfig(userContext, config) {
    this.#userContextConfigs.set(userContext, ContextConfig.merge(this.#userContextConfigs.get(userContext), config));
  }
  /**
   * Returns the current global configuration.
   */
  getGlobalConfig() {
    return this.#global;
  }
  /**
   * Extra headers is a special case. The headers from the different levels have to be
   * merged instead of being overridden.
   */
  #getExtraHeaders(topLevelBrowsingContextId, userContext) {
    const globalHeaders = this.#global.extraHeaders ?? {};
    const userContextHeaders = this.#userContextConfigs.get(userContext)?.extraHeaders ?? {};
    const browsingContextHeaders = topLevelBrowsingContextId === void 0 ? {} : this.#browsingContextConfigs.get(topLevelBrowsingContextId)?.extraHeaders ?? {};
    return { ...globalHeaders, ...userContextHeaders, ...browsingContextHeaders };
  }
  /**
   * Calculates the active configuration by merging global, user context, and
   * browsing context settings.
   */
  getActiveConfig(topLevelBrowsingContextId, userContext) {
    let result = ContextConfig.merge(this.#global, this.#userContextConfigs.get(userContext));
    if (topLevelBrowsingContextId !== void 0) {
      result = ContextConfig.merge(result, this.#browsingContextConfigs.get(topLevelBrowsingContextId));
    }
    const extraHeaders = this.#getExtraHeaders(topLevelBrowsingContextId, userContext);
    result.extraHeaders = Object.keys(extraHeaders).length > 0 ? extraHeaders : void 0;
    return result;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/browser/UserContextStorage.js
var UserContextStorage = class {
  #browserClient;
  constructor(browserClient) {
    this.#browserClient = browserClient;
  }
  async getUserContexts() {
    const result = await this.#browserClient.sendCommand("Target.getBrowserContexts");
    return [
      {
        userContext: "default"
      },
      ...result.browserContextIds.map((id) => {
        return {
          userContext: id
        };
      })
    ];
  }
  async verifyUserContextIdList(userContextIds) {
    const foundContexts = /* @__PURE__ */ new Set();
    if (!userContextIds.length) {
      return foundContexts;
    }
    const userContexts = await this.getUserContexts();
    const knownUserContextIds = new Set(userContexts.map((userContext) => userContext.userContext));
    for (const userContextId of userContextIds) {
      if (!knownUserContextIds.has(userContextId)) {
        throw new NoSuchUserContextException(`User context ${userContextId} not found`);
      }
      foundContexts.add(userContextId);
    }
    return foundContexts;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/utils/Deferred.js
var Deferred2 = class {
  #isFinished = false;
  #promise;
  #result;
  #resolve;
  #reject;
  get isFinished() {
    return this.#isFinished;
  }
  get result() {
    if (!this.#isFinished) {
      throw new Error("Deferred is not finished yet");
    }
    return this.#result;
  }
  constructor() {
    this.#promise = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
    this.#promise.catch((_error) => {
    });
  }
  then(onFulfilled, onRejected) {
    return this.#promise.then(onFulfilled, onRejected);
  }
  catch(onRejected) {
    return this.#promise.catch(onRejected);
  }
  resolve(value) {
    this.#result = value;
    if (!this.#isFinished) {
      this.#isFinished = true;
      this.#resolve(value);
    }
  }
  reject(reason) {
    if (!this.#isFinished) {
      this.#isFinished = true;
      this.#reject(reason);
    }
  }
  finally(onFinally) {
    return this.#promise.finally(onFinally);
  }
  [Symbol.toStringTag] = "Promise";
};

// node_modules/chromium-bidi/out/Default/gen/src/utils/time.js
function getTimestamp() {
  return (/* @__PURE__ */ new Date()).getTime();
}

// node_modules/chromium-bidi/out/Default/gen/src/utils/unitConversions.js
function inchesFromCm(cm) {
  return cm / 2.54;
}

// node_modules/chromium-bidi/out/Default/gen/src/utils/urlHelpers.js
function urlMatchesAboutBlank(url) {
  if (url === "") {
    return true;
  }
  try {
    const parsedUrl = new URL(url);
    const schema = parsedUrl.protocol.replace(/:$/, "");
    return schema.toLowerCase() === "about" && parsedUrl.pathname.toLowerCase() === "blank" && parsedUrl.username === "" && parsedUrl.password === "" && parsedUrl.host === "";
  } catch (err) {
    if (err instanceof TypeError) {
      return false;
    }
    throw err;
  }
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/script/SharedId.js
var SHARED_ID_DIVIDER = "_element_";
function getSharedId(frameId, documentId, backendNodeId) {
  return `f.${frameId}.d.${documentId}.e.${backendNodeId}`;
}
function parseLegacySharedId(sharedId) {
  const match = sharedId.match(new RegExp(`(.*)${SHARED_ID_DIVIDER}(.*)`));
  if (!match) {
    return null;
  }
  const documentId = match[1];
  const elementId = match[2];
  if (documentId === void 0 || elementId === void 0) {
    return null;
  }
  const backendNodeId = parseInt(elementId ?? "");
  if (isNaN(backendNodeId)) {
    return null;
  }
  return {
    documentId,
    backendNodeId
  };
}
function parseSharedId(sharedId) {
  const legacyFormattedSharedId = parseLegacySharedId(sharedId);
  if (legacyFormattedSharedId !== null) {
    return { ...legacyFormattedSharedId, frameId: void 0 };
  }
  const match = sharedId.match(/f\.(.*)\.d\.(.*)\.e\.([0-9]*)/);
  if (!match) {
    return null;
  }
  const frameId = match[1];
  const documentId = match[2];
  const elementId = match[3];
  if (frameId === void 0 || documentId === void 0 || elementId === void 0) {
    return null;
  }
  const backendNodeId = parseInt(elementId ?? "");
  if (isNaN(backendNodeId)) {
    return null;
  }
  return {
    frameId,
    documentId,
    backendNodeId
  };
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/script/Realm.js
var Realm2 = class _Realm {
  #cdpClient;
  #eventManager;
  #executionContextId;
  #logger;
  #origin;
  #realmId;
  realmStorage;
  constructor(cdpClient, eventManager, executionContextId, logger, origin, realmId, realmStorage) {
    this.#cdpClient = cdpClient;
    this.#eventManager = eventManager;
    this.#executionContextId = executionContextId;
    this.#logger = logger;
    this.#origin = origin;
    this.#realmId = realmId;
    this.realmStorage = realmStorage;
    this.realmStorage.addRealm(this);
  }
  cdpToBidiValue(cdpValue, resultOwnership) {
    const bidiValue = this.serializeForBiDi(cdpValue.result.deepSerializedValue, /* @__PURE__ */ new Map());
    if (cdpValue.result.objectId) {
      const objectId = cdpValue.result.objectId;
      if (resultOwnership === Script2.ResultOwnership.Root) {
        bidiValue.handle = objectId;
        this.realmStorage.knownHandlesToRealmMap.set(objectId, this.realmId);
      } else {
        void this.#releaseObject(objectId).catch((error) => this.#logger?.(LogType.debugError)?.(error));
      }
    }
    return bidiValue;
  }
  isHidden() {
    return false;
  }
  /**
   * Relies on the CDP to implement proper BiDi serialization, except:
   * * CDP integer property `backendNodeId` is replaced with `sharedId` of
   * `{documentId}_element_{backendNodeId}`;
   * * CDP integer property `weakLocalObjectReference` is replaced with UUID `internalId`
   * using unique-per serialization `internalIdMap`.
   * * CDP type `platformobject` is replaced with `object`.
   * @param deepSerializedValue - CDP value to be converted to BiDi.
   * @param internalIdMap - Map from CDP integer `weakLocalObjectReference` to BiDi UUID
   * `internalId`.
   */
  serializeForBiDi(deepSerializedValue, internalIdMap) {
    if (Object.hasOwn(deepSerializedValue, "weakLocalObjectReference")) {
      const weakLocalObjectReference = deepSerializedValue.weakLocalObjectReference;
      if (!internalIdMap.has(weakLocalObjectReference)) {
        internalIdMap.set(weakLocalObjectReference, uuidv4());
      }
      deepSerializedValue.internalId = internalIdMap.get(weakLocalObjectReference);
      delete deepSerializedValue["weakLocalObjectReference"];
    }
    if (deepSerializedValue.type === "node" && deepSerializedValue.value && Object.hasOwn(deepSerializedValue.value, "frameId")) {
      delete deepSerializedValue.value["frameId"];
    }
    if (deepSerializedValue.type === "platformobject") {
      return { type: "object" };
    }
    const bidiValue = deepSerializedValue.value;
    if (bidiValue === void 0) {
      return deepSerializedValue;
    }
    if (["array", "set", "htmlcollection", "nodelist"].includes(deepSerializedValue.type)) {
      for (const i in bidiValue) {
        bidiValue[i] = this.serializeForBiDi(bidiValue[i], internalIdMap);
      }
    }
    if (["object", "map"].includes(deepSerializedValue.type)) {
      for (const i in bidiValue) {
        bidiValue[i] = [
          this.serializeForBiDi(bidiValue[i][0], internalIdMap),
          this.serializeForBiDi(bidiValue[i][1], internalIdMap)
        ];
      }
    }
    return deepSerializedValue;
  }
  get realmId() {
    return this.#realmId;
  }
  get executionContextId() {
    return this.#executionContextId;
  }
  get origin() {
    return this.#origin;
  }
  get source() {
    return {
      realm: this.realmId
    };
  }
  get cdpClient() {
    return this.#cdpClient;
  }
  get baseInfo() {
    return {
      realm: this.realmId,
      origin: this.origin
    };
  }
  async evaluate(expression, awaitPromise, resultOwnership = Script2.ResultOwnership.None, serializationOptions = {}, userActivation = false, includeCommandLineApi = false) {
    const cdpEvaluateResult = await this.cdpClient.sendCommand("Runtime.evaluate", {
      contextId: this.executionContextId,
      expression,
      awaitPromise,
      serializationOptions: _Realm.#getSerializationOptions("deep", serializationOptions),
      userGesture: userActivation,
      includeCommandLineAPI: includeCommandLineApi
    });
    if (cdpEvaluateResult.exceptionDetails) {
      return await this.#getExceptionResult(cdpEvaluateResult.exceptionDetails, 0, resultOwnership);
    }
    return {
      realm: this.realmId,
      result: this.cdpToBidiValue(cdpEvaluateResult, resultOwnership),
      type: "success"
    };
  }
  #registerEvent(event) {
    if (this.associatedBrowsingContexts.length === 0) {
      this.#eventManager.registerGlobalEvent(event);
    } else {
      for (const browsingContext of this.associatedBrowsingContexts) {
        this.#eventManager.registerEvent(event, browsingContext.id);
      }
    }
  }
  initialize() {
    if (!this.isHidden()) {
      this.#registerEvent({
        type: "event",
        method: chromium_bidi_exports.Script.EventNames.RealmCreated,
        params: this.realmInfo
      });
    }
  }
  /**
   * Serializes a given CDP object into BiDi, keeping references in the
   * target's `globalThis`.
   */
  async serializeCdpObject(cdpRemoteObject, resultOwnership) {
    const argument = _Realm.#cdpRemoteObjectToCallArgument(cdpRemoteObject);
    const cdpValue = await this.cdpClient.sendCommand("Runtime.callFunctionOn", {
      functionDeclaration: String((remoteObject) => remoteObject),
      awaitPromise: false,
      arguments: [argument],
      serializationOptions: {
        serialization: "deep"
      },
      executionContextId: this.executionContextId
    });
    return this.cdpToBidiValue(cdpValue, resultOwnership);
  }
  static #cdpRemoteObjectToCallArgument(cdpRemoteObject) {
    if (cdpRemoteObject.objectId !== void 0) {
      return { objectId: cdpRemoteObject.objectId };
    }
    if (cdpRemoteObject.unserializableValue !== void 0) {
      return { unserializableValue: cdpRemoteObject.unserializableValue };
    }
    return { value: cdpRemoteObject.value };
  }
  /**
   * Gets the string representation of an object. This is equivalent to
   * calling `toString()` on the object value.
   */
  async stringifyObject(cdpRemoteObject) {
    const { result } = await this.cdpClient.sendCommand("Runtime.callFunctionOn", {
      functionDeclaration: String((remoteObject) => String(remoteObject)),
      awaitPromise: false,
      arguments: [cdpRemoteObject],
      returnByValue: true,
      executionContextId: this.executionContextId
    });
    return result.value;
  }
  async #flattenKeyValuePairs(mappingLocalValue) {
    const keyValueArray = await Promise.all(mappingLocalValue.map(async ([key, value]) => {
      let keyArg;
      if (typeof key === "string") {
        keyArg = { value: key };
      } else {
        keyArg = await this.deserializeForCdp(key);
      }
      const valueArg = await this.deserializeForCdp(value);
      return [keyArg, valueArg];
    }));
    return keyValueArray.flat();
  }
  async #flattenValueList(listLocalValue) {
    return await Promise.all(listLocalValue.map((localValue) => this.deserializeForCdp(localValue)));
  }
  async #serializeCdpExceptionDetails(cdpExceptionDetails, lineOffset, resultOwnership) {
    const callFrames = cdpExceptionDetails.stackTrace?.callFrames.map((frame) => ({
      url: frame.url,
      functionName: frame.functionName,
      lineNumber: frame.lineNumber - lineOffset,
      columnNumber: frame.columnNumber
    })) ?? [];
    const exception = cdpExceptionDetails.exception;
    return {
      exception: await this.serializeCdpObject(exception, resultOwnership),
      columnNumber: cdpExceptionDetails.columnNumber,
      lineNumber: cdpExceptionDetails.lineNumber - lineOffset,
      stackTrace: {
        callFrames
      },
      text: await this.stringifyObject(exception) || cdpExceptionDetails.text
    };
  }
  async callFunction(functionDeclaration, awaitPromise, thisLocalValue = {
    type: "undefined"
  }, argumentsLocalValues = [], resultOwnership = Script2.ResultOwnership.None, serializationOptions = {}, userActivation = false) {
    const callFunctionAndSerializeScript = `(...args) => {
      function callFunction(f, args) {
        const deserializedThis = args.shift();
        const deserializedArgs = args;
        return f.apply(deserializedThis, deserializedArgs);
      }
      return callFunction((
        ${functionDeclaration}
      ), args);
    }`;
    const thisAndArgumentsList = [
      await this.deserializeForCdp(thisLocalValue),
      ...await Promise.all(argumentsLocalValues.map(async (argumentLocalValue) => await this.deserializeForCdp(argumentLocalValue)))
    ];
    let cdpCallFunctionResult;
    try {
      cdpCallFunctionResult = await this.cdpClient.sendCommand("Runtime.callFunctionOn", {
        functionDeclaration: callFunctionAndSerializeScript,
        awaitPromise,
        arguments: thisAndArgumentsList,
        serializationOptions: _Realm.#getSerializationOptions("deep", serializationOptions),
        executionContextId: this.executionContextId,
        userGesture: userActivation
      });
    } catch (error) {
      if (error.code === -32e3 && [
        "Could not find object with given id",
        "Argument should belong to the same JavaScript world as target object",
        "Invalid remote object id"
      ].includes(error.message)) {
        throw new NoSuchHandleException("Handle was not found.");
      }
      throw error;
    }
    if (cdpCallFunctionResult.exceptionDetails) {
      return await this.#getExceptionResult(cdpCallFunctionResult.exceptionDetails, 1, resultOwnership);
    }
    return {
      type: "success",
      result: this.cdpToBidiValue(cdpCallFunctionResult, resultOwnership),
      realm: this.realmId
    };
  }
  async deserializeForCdp(localValue) {
    if ("handle" in localValue && localValue.handle) {
      return { objectId: localValue.handle };
    } else if ("handle" in localValue || "sharedId" in localValue) {
      throw new NoSuchHandleException("Handle was not found.");
    }
    switch (localValue.type) {
      case "undefined":
        return { unserializableValue: "undefined" };
      case "null":
        return { unserializableValue: "null" };
      case "string":
        return { value: localValue.value };
      case "number":
        if (localValue.value === "NaN") {
          return { unserializableValue: "NaN" };
        } else if (localValue.value === "-0") {
          return { unserializableValue: "-0" };
        } else if (localValue.value === "Infinity") {
          return { unserializableValue: "Infinity" };
        } else if (localValue.value === "-Infinity") {
          return { unserializableValue: "-Infinity" };
        }
        return {
          value: localValue.value
        };
      case "boolean":
        return { value: Boolean(localValue.value) };
      case "bigint":
        return {
          unserializableValue: `BigInt(${JSON.stringify(localValue.value)})`
        };
      case "date":
        return {
          unserializableValue: `new Date(Date.parse(${JSON.stringify(localValue.value)}))`
        };
      case "regexp":
        return {
          unserializableValue: `new RegExp(${JSON.stringify(localValue.value.pattern)}, ${JSON.stringify(localValue.value.flags)})`
        };
      case "map": {
        const keyValueArray = await this.#flattenKeyValuePairs(localValue.value);
        const { result } = await this.cdpClient.sendCommand("Runtime.callFunctionOn", {
          functionDeclaration: String((...args) => {
            const result2 = /* @__PURE__ */ new Map();
            for (let i = 0; i < args.length; i += 2) {
              result2.set(args[i], args[i + 1]);
            }
            return result2;
          }),
          awaitPromise: false,
          arguments: keyValueArray,
          returnByValue: false,
          executionContextId: this.executionContextId
        });
        return { objectId: result.objectId };
      }
      case "object": {
        const keyValueArray = await this.#flattenKeyValuePairs(localValue.value);
        const { result } = await this.cdpClient.sendCommand("Runtime.callFunctionOn", {
          functionDeclaration: String((...args) => {
            const result2 = {};
            for (let i = 0; i < args.length; i += 2) {
              const key = args[i];
              result2[key] = args[i + 1];
            }
            return result2;
          }),
          awaitPromise: false,
          arguments: keyValueArray,
          returnByValue: false,
          executionContextId: this.executionContextId
        });
        return { objectId: result.objectId };
      }
      case "array": {
        const args = await this.#flattenValueList(localValue.value);
        const { result } = await this.cdpClient.sendCommand("Runtime.callFunctionOn", {
          functionDeclaration: String((...args2) => args2),
          awaitPromise: false,
          arguments: args,
          returnByValue: false,
          executionContextId: this.executionContextId
        });
        return { objectId: result.objectId };
      }
      case "set": {
        const args = await this.#flattenValueList(localValue.value);
        const { result } = await this.cdpClient.sendCommand("Runtime.callFunctionOn", {
          functionDeclaration: String((...args2) => new Set(args2)),
          awaitPromise: false,
          arguments: args,
          returnByValue: false,
          executionContextId: this.executionContextId
        });
        return { objectId: result.objectId };
      }
      case "channel": {
        const channelProxy = new ChannelProxy(localValue.value, this.#logger);
        const channelProxySendMessageHandle = await channelProxy.init(this, this.#eventManager);
        return { objectId: channelProxySendMessageHandle };
      }
    }
    throw new Error(`Value ${JSON.stringify(localValue)} is not deserializable.`);
  }
  async #getExceptionResult(exceptionDetails, lineOffset, resultOwnership) {
    return {
      exceptionDetails: await this.#serializeCdpExceptionDetails(exceptionDetails, lineOffset, resultOwnership),
      realm: this.realmId,
      type: "exception"
    };
  }
  static #getSerializationOptions(serialization, serializationOptions) {
    return {
      serialization,
      additionalParameters: _Realm.#getAdditionalSerializationParameters(serializationOptions),
      ..._Realm.#getMaxObjectDepth(serializationOptions)
    };
  }
  static #getAdditionalSerializationParameters(serializationOptions) {
    const additionalParameters = {};
    if (serializationOptions.maxDomDepth !== void 0) {
      additionalParameters["maxNodeDepth"] = serializationOptions.maxDomDepth === null ? 1e3 : serializationOptions.maxDomDepth;
    }
    if (serializationOptions.includeShadowTree !== void 0) {
      additionalParameters["includeShadowTree"] = serializationOptions.includeShadowTree;
    }
    return additionalParameters;
  }
  static #getMaxObjectDepth(serializationOptions) {
    return serializationOptions.maxObjectDepth === void 0 || serializationOptions.maxObjectDepth === null ? {} : { maxDepth: serializationOptions.maxObjectDepth };
  }
  async #releaseObject(handle) {
    try {
      await this.cdpClient.sendCommand("Runtime.releaseObject", {
        objectId: handle
      });
    } catch (error) {
      if (!(error.code === -32e3 && error.message === "Invalid remote object id")) {
        throw error;
      }
    }
  }
  async disown(handle) {
    if (this.realmStorage.knownHandlesToRealmMap.get(handle) !== this.realmId) {
      return;
    }
    await this.#releaseObject(handle);
    this.realmStorage.knownHandlesToRealmMap.delete(handle);
  }
  dispose() {
    if (!this.isHidden()) {
      this.#registerEvent({
        type: "event",
        method: chromium_bidi_exports.Script.EventNames.RealmDestroyed,
        params: {
          realm: this.realmId
        }
      });
    }
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/script/WindowRealm.js
var WindowRealm = class extends Realm2 {
  #browsingContextId;
  #browsingContextStorage;
  sandbox;
  constructor(browsingContextId, browsingContextStorage, cdpClient, eventManager, executionContextId, logger, origin, realmId, realmStorage, sandbox) {
    super(cdpClient, eventManager, executionContextId, logger, origin, realmId, realmStorage);
    this.#browsingContextId = browsingContextId;
    this.#browsingContextStorage = browsingContextStorage;
    this.sandbox = sandbox;
    this.initialize();
  }
  #getBrowsingContextId(navigableId) {
    const maybeBrowsingContext = this.#browsingContextStorage.getAllContexts().find((context) => context.navigableId === navigableId);
    return maybeBrowsingContext?.id ?? "UNKNOWN";
  }
  get browsingContext() {
    return this.#browsingContextStorage.getContext(this.#browsingContextId);
  }
  /**
   * Do not expose to user hidden realms.
   */
  isHidden() {
    return this.realmStorage.hiddenSandboxes.has(this.sandbox);
  }
  get associatedBrowsingContexts() {
    return [this.browsingContext];
  }
  get realmType() {
    return "window";
  }
  get realmInfo() {
    return {
      ...this.baseInfo,
      type: this.realmType,
      context: this.#browsingContextId,
      sandbox: this.sandbox,
      userContext: this.browsingContext.userContext
    };
  }
  get source() {
    return {
      realm: this.realmId,
      context: this.browsingContext.id,
      userContext: this.browsingContext.userContext
    };
  }
  serializeForBiDi(deepSerializedValue, internalIdMap) {
    const bidiValue = deepSerializedValue.value;
    if (deepSerializedValue.type === "node" && bidiValue !== void 0) {
      if (Object.hasOwn(bidiValue, "backendNodeId")) {
        let navigableId = this.browsingContext.navigableId ?? "UNKNOWN";
        if (Object.hasOwn(bidiValue, "loaderId")) {
          navigableId = bidiValue.loaderId;
          delete bidiValue["loaderId"];
        }
        deepSerializedValue.sharedId = getSharedId(this.#getBrowsingContextId(navigableId), navigableId, bidiValue.backendNodeId);
        delete bidiValue["backendNodeId"];
      }
      if (Object.hasOwn(bidiValue, "children")) {
        for (const i in bidiValue.children) {
          bidiValue.children[i] = this.serializeForBiDi(bidiValue.children[i], internalIdMap);
        }
      }
      if (Object.hasOwn(bidiValue, "shadowRoot") && bidiValue.shadowRoot !== null) {
        bidiValue.shadowRoot = this.serializeForBiDi(bidiValue.shadowRoot, internalIdMap);
      }
      if (bidiValue.namespaceURI === "") {
        bidiValue.namespaceURI = null;
      }
    }
    return super.serializeForBiDi(deepSerializedValue, internalIdMap);
  }
  async deserializeForCdp(localValue) {
    if ("sharedId" in localValue && localValue.sharedId) {
      const parsedSharedId = parseSharedId(localValue.sharedId);
      if (parsedSharedId === null) {
        throw new NoSuchNodeException(`SharedId "${localValue.sharedId}" was not found.`);
      }
      const { documentId, backendNodeId } = parsedSharedId;
      if (this.browsingContext.navigableId !== documentId) {
        throw new NoSuchNodeException(`SharedId "${localValue.sharedId}" belongs to different document. Current document is ${this.browsingContext.navigableId}.`);
      }
      try {
        const { object } = await this.cdpClient.sendCommand("DOM.resolveNode", {
          backendNodeId,
          executionContextId: this.executionContextId
        });
        return { objectId: object.objectId };
      } catch (error) {
        if (error.code === -32e3 && error.message === "No node with given id found") {
          throw new NoSuchNodeException(`SharedId "${localValue.sharedId}" was not found.`);
        }
        throw new UnknownErrorException(error.message, error.stack);
      }
    }
    return await super.deserializeForCdp(localValue);
  }
  async evaluate(expression, awaitPromise, resultOwnership, serializationOptions, userActivation, includeCommandLineApi) {
    await this.#browsingContextStorage.getContext(this.#browsingContextId).targetUnblockedOrThrow();
    return await super.evaluate(expression, awaitPromise, resultOwnership, serializationOptions, userActivation, includeCommandLineApi);
  }
  async callFunction(functionDeclaration, awaitPromise, thisLocalValue, argumentsLocalValues, resultOwnership, serializationOptions, userActivation) {
    await this.#browsingContextStorage.getContext(this.#browsingContextId).targetUnblockedOrThrow();
    return await super.callFunction(functionDeclaration, awaitPromise, thisLocalValue, argumentsLocalValues, resultOwnership, serializationOptions, userActivation);
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/context/NavigationTracker.js
var NavigationEventName;
(function(NavigationEventName2) {
  NavigationEventName2["FragmentNavigated"] = "browsingContext.fragmentNavigated";
  NavigationEventName2["NavigationAborted"] = "browsingContext.navigationAborted";
  NavigationEventName2["NavigationFailed"] = "browsingContext.navigationFailed";
  NavigationEventName2["Load"] = "browsingContext.load";
})(NavigationEventName || (NavigationEventName = {}));
var NavigationResult = class {
  eventName;
  message;
  constructor(eventName, message) {
    this.eventName = eventName;
    this.message = message;
  }
};
var NavigationState = class {
  navigationId = uuidv4();
  #browsingContextId;
  #userContext;
  #started = false;
  #finished = new Deferred2();
  #failureMessage;
  url;
  loaderId;
  #isInitial;
  #eventManager;
  committed = new Deferred2();
  isFragmentNavigation;
  get isInitial() {
    return this.#isInitial;
  }
  get isFinished() {
    return this.#finished.isFinished;
  }
  get failureMessage() {
    return this.#failureMessage;
  }
  get finished() {
    return this.#finished;
  }
  constructor(url, browsingContextId, isInitial, eventManager, userContext) {
    this.#browsingContextId = browsingContextId;
    this.url = url;
    this.#isInitial = isInitial;
    this.#eventManager = eventManager;
    this.#userContext = userContext;
  }
  navigationInfo() {
    return {
      context: this.#browsingContextId,
      navigation: this.navigationId,
      timestamp: getTimestamp(),
      url: this.url,
      userContext: this.#userContext
    };
  }
  start() {
    if (
      // Initial navigation should not be reported.
      !this.#isInitial && // No need in reporting started navigation twice.
      !this.#started && // No need for reporting fragment navigations. Step 13 vs step 16 of the spec:
      // https://html.spec.whatwg.org/#beginning-navigation:webdriver-bidi-navigation-started
      !this.isFragmentNavigation
    ) {
      this.#eventManager.registerEvent({
        type: "event",
        method: chromium_bidi_exports.BrowsingContext.EventNames.NavigationStarted,
        params: this.navigationInfo()
      }, this.#browsingContextId);
    }
    this.#started = true;
  }
  #finish(navigationResult) {
    this.#started = true;
    if (!this.#isInitial && !this.#finished.isFinished && navigationResult.eventName !== NavigationEventName.Load) {
      this.#eventManager.registerEvent({
        type: "event",
        method: navigationResult.eventName,
        params: this.navigationInfo()
      }, this.#browsingContextId);
    }
    this.#finished.resolve(navigationResult);
  }
  frameNavigated() {
    this.committed.resolve();
    if (!this.#isInitial) {
      this.#eventManager.registerEvent({
        type: "event",
        method: chromium_bidi_exports.BrowsingContext.EventNames.NavigationCommitted,
        params: this.navigationInfo()
      }, this.#browsingContextId);
    }
  }
  fragmentNavigated() {
    this.committed.resolve();
    this.#finish(new NavigationResult(NavigationEventName.FragmentNavigated));
  }
  load() {
    this.#finish(new NavigationResult(NavigationEventName.Load));
  }
  fail(message) {
    this.#failureMessage = message;
    this.#finish(new NavigationResult(this.committed.isFinished ? NavigationEventName.NavigationAborted : NavigationEventName.NavigationFailed, message));
  }
};
var NavigationTracker = class _NavigationTracker {
  #eventManager;
  #logger;
  #loaderIdToNavigationsMap = /* @__PURE__ */ new Map();
  #browsingContextId;
  #userContext;
  /**
   * Last committed navigation is committed, but is not guaranteed to be finished, as it
   * can still wait for `load` or `DOMContentLoaded` events.
   */
  #lastCommittedNavigation;
  /**
   * Pending navigation is a navigation that is started but not yet committed.
   */
  #pendingNavigation;
  // Flags if the initial navigation to `about:blank` is in progress.
  #isInitialNavigation = true;
  constructor(url, browsingContextId, eventManager, logger, userContext = "default") {
    this.#browsingContextId = browsingContextId;
    this.#eventManager = eventManager;
    this.#logger = logger;
    this.#userContext = userContext;
    this.#isInitialNavigation = true;
    this.#lastCommittedNavigation = new NavigationState(url, browsingContextId, urlMatchesAboutBlank(url), this.#eventManager, this.#userContext);
  }
  /**
   * Returns current started ongoing navigation. It can be either a started pending
   * navigation, or one is already navigated.
   */
  get currentNavigationId() {
    if (this.#pendingNavigation?.isFragmentNavigation === false) {
      return this.#pendingNavigation.navigationId;
    }
    return this.#lastCommittedNavigation.navigationId;
  }
  /**
   * Flags if the current navigation relates to the initial to `about:blank` navigation.
   */
  get isInitialNavigation() {
    return this.#isInitialNavigation;
  }
  /**
   * Flags if the last committed navigation is the initial `about:blank` navigation.
   */
  get isInitialCommittedNavigation() {
    return this.#lastCommittedNavigation.isInitial;
  }
  /**
   * Url of the last navigated navigation.
   */
  get url() {
    return this.#lastCommittedNavigation.url;
  }
  /**
   * Creates a pending navigation e.g. when navigation command is called. Required to
   * provide navigation id before the actual navigation is started. It will be used when
   * navigation started. Can be aborted, failed, fragment navigated, or became a current
   * navigation.
   */
  createPendingNavigation(url, canBeInitialNavigation = false) {
    this.#logger?.(LogType.debug)?.("createCommandNavigation");
    this.#isInitialNavigation = canBeInitialNavigation && this.#isInitialNavigation && urlMatchesAboutBlank(url);
    this.#pendingNavigation?.fail("navigation canceled by concurrent navigation");
    const navigation = new NavigationState(url, this.#browsingContextId, this.#isInitialNavigation, this.#eventManager, this.#userContext);
    this.#pendingNavigation = navigation;
    return navigation;
  }
  dispose() {
    this.#pendingNavigation?.fail("navigation canceled by context disposal");
    this.#lastCommittedNavigation.fail("navigation canceled by context disposal");
  }
  // Update the current url.
  onTargetInfoChanged(url) {
    this.#logger?.(LogType.debug)?.(`onTargetInfoChanged ${url}`);
    this.#lastCommittedNavigation.url = url;
  }
  #getNavigationForFrameNavigated(url, loaderId, navigationType) {
    if (navigationType !== "BackForwardCacheRestore" && this.#loaderIdToNavigationsMap.has(loaderId)) {
      return this.#loaderIdToNavigationsMap.get(loaderId);
    }
    if (this.#pendingNavigation !== void 0 && (this.#pendingNavigation.loaderId === void 0 || navigationType === "BackForwardCacheRestore")) {
      return this.#pendingNavigation;
    }
    return this.createPendingNavigation(url, true);
  }
  /**
   * @param {string} unreachableUrl indicated the navigation is actually failed.
   */
  frameNavigated(url, loaderId, unreachableUrl, navigationType) {
    this.#logger?.(LogType.debug)?.(`frameNavigated ${url}`);
    if (unreachableUrl !== void 0) {
      const navigation2 = this.#loaderIdToNavigationsMap.get(loaderId) ?? this.#pendingNavigation ?? this.createPendingNavigation(unreachableUrl, true);
      navigation2.url = unreachableUrl;
      navigation2.start();
      navigation2.fail("the requested url is unreachable");
      return;
    }
    const navigation = this.#getNavigationForFrameNavigated(url, loaderId, navigationType);
    if (navigation !== this.#lastCommittedNavigation) {
      this.#lastCommittedNavigation.fail("navigation canceled by concurrent navigation");
    }
    navigation.url = url;
    navigation.loaderId = loaderId;
    this.#loaderIdToNavigationsMap.set(loaderId, navigation);
    navigation.start();
    navigation.frameNavigated();
    if (navigationType === "BackForwardCacheRestore") {
      navigation.load();
    }
    this.#lastCommittedNavigation = navigation;
    if (this.#pendingNavigation === navigation) {
      this.#pendingNavigation = void 0;
    }
  }
  navigatedWithinDocument(url, navigationType) {
    this.#logger?.(LogType.debug)?.(`navigatedWithinDocument ${url}, ${navigationType}`);
    this.#lastCommittedNavigation.url = url;
    if (navigationType !== "fragment") {
      return;
    }
    const fragmentNavigation = this.#pendingNavigation?.isFragmentNavigation === true ? this.#pendingNavigation : new NavigationState(url, this.#browsingContextId, false, this.#eventManager, this.#userContext);
    fragmentNavigation.fragmentNavigated();
    if (fragmentNavigation === this.#pendingNavigation) {
      this.#pendingNavigation = void 0;
    }
  }
  /**
   * Required to mark navigation as fully complete.
   * TODO: navigation should be complete when it became the current one on
   * `Page.frameNavigated` or on navigating command finished with a new loader Id.
   */
  loadPageEvent(loaderId) {
    this.#logger?.(LogType.debug)?.("loadPageEvent");
    this.#isInitialNavigation = false;
    this.#loaderIdToNavigationsMap.get(loaderId)?.load();
  }
  /**
   * Fail navigation due to navigation command failed.
   */
  failNavigation(navigation, errorText) {
    this.#logger?.(LogType.debug)?.("failCommandNavigation");
    navigation.fail(errorText);
  }
  /**
   * Updates the navigation's `loaderId` and sets it as current one, if it is a
   * cross-document navigation.
   */
  navigationCommandFinished(navigation, loaderId) {
    this.#logger?.(LogType.debug)?.(`finishCommandNavigation ${navigation.navigationId}, ${loaderId}`);
    if (loaderId !== void 0) {
      navigation.loaderId = loaderId;
      this.#loaderIdToNavigationsMap.set(loaderId, navigation);
    }
    navigation.isFragmentNavigation = loaderId === void 0;
  }
  frameStartedNavigating(url, loaderId, navigationType) {
    this.#logger?.(LogType.debug)?.(`frameStartedNavigating ${url}, ${loaderId}`);
    if (this.#pendingNavigation && this.#pendingNavigation?.loaderId !== void 0 && this.#pendingNavigation?.loaderId !== loaderId) {
      this.#pendingNavigation?.fail("navigation canceled by concurrent navigation");
      this.#pendingNavigation = void 0;
    }
    if (this.#loaderIdToNavigationsMap.has(loaderId)) {
      const existingNavigation = this.#loaderIdToNavigationsMap.get(loaderId);
      existingNavigation.isFragmentNavigation = _NavigationTracker.#isFragmentNavigation(navigationType);
      this.#pendingNavigation = existingNavigation;
      return;
    }
    const pendingNavigation = this.#pendingNavigation ?? this.createPendingNavigation(url, true);
    this.#loaderIdToNavigationsMap.set(loaderId, pendingNavigation);
    pendingNavigation.isFragmentNavigation = _NavigationTracker.#isFragmentNavigation(navigationType);
    pendingNavigation.url = url;
    pendingNavigation.loaderId = loaderId;
    pendingNavigation.start();
  }
  static #isFragmentNavigation(navigationType) {
    return ["historySameDocument", "sameDocument"].includes(navigationType);
  }
  /**
   * If there is a navigation with the loaderId equals to the network request id, it means
   * that the navigation failed.
   */
  networkLoadingFailed(loaderId, errorText) {
    this.#loaderIdToNavigationsMap.get(loaderId)?.fail(errorText);
  }
  /**
   * Returns the navigation ID if the download was initiated by an ongoing
   * cross-document navigation (e.g., a navigation response with
   * `Content-Disposition: attachment`), or `null` if the download was started
   * without a navigation (e.g., clicking an `<a download>` link), as required
   * by `browsingContext.BaseNavigationInfo` in the WebDriver BiDi spec.
   */
  downloadWillBegin() {
    if (this.#pendingNavigation === void 0) {
      return null;
    }
    if (this.#pendingNavigation.isInitial || this.#pendingNavigation.isFragmentNavigation !== false) {
      return null;
    }
    if (this.#pendingNavigation.isFinished && this.#pendingNavigation.failureMessage !== "net::ERR_ABORTED") {
      return null;
    }
    const navigationId = this.#pendingNavigation.navigationId;
    this.#pendingNavigation = void 0;
    return navigationId;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/context/BrowsingContextImpl.js
var _a2;
var BrowsingContextImpl = class {
  static LOGGER_PREFIX = `${LogType.debug}:browsingContext`;
  /** Direct children browsing contexts. */
  #children = /* @__PURE__ */ new Set();
  /** The ID of this browsing context. */
  #id;
  userContext;
  // Used for running helper scripts.
  #hiddenSandbox = uuidv4();
  // Maps active CDP download GUIDs initiated in this context to their info from
  // `Browser.downloadWillBegin`. Required to populate `browsingContext.downloadEnd`
  // because CDP's `Browser.downloadProgress` event only provides `guid`, `state`,
  // and `filePath` (and does not include the downloaded resource's `url` or the
  // associated BiDi `navigation` ID).
  #downloadIdToInfoMap = /* @__PURE__ */ new Map();
  /**
   * The ID of the parent browsing context.
   * If null, this is a top-level context.
   */
  #loaderId;
  #parentId = null;
  #originalOpener;
  #lifecycle = {
    DOMContentLoaded: new Deferred2(),
    load: new Deferred2()
  };
  #cdpTarget;
  #defaultRealmDeferred = new Deferred2();
  #browsingContextStorage;
  #eventManager;
  #logger;
  #navigationTracker;
  #realmStorage;
  #configStorage;
  // Set when the user prompt is opened. Required to provide the type in closing event.
  #lastUserPromptType;
  constructor(id, parentId, userContext, cdpTarget, eventManager, browsingContextStorage, realmStorage, configStorage, url, originalOpener, logger) {
    this.#cdpTarget = cdpTarget;
    this.#id = id;
    this.#parentId = parentId;
    this.userContext = userContext;
    this.#eventManager = eventManager;
    this.#browsingContextStorage = browsingContextStorage;
    this.#realmStorage = realmStorage;
    this.#configStorage = configStorage;
    this.#logger = logger;
    this.#originalOpener = originalOpener;
    this.#realmStorage.hiddenSandboxes.add(this.#hiddenSandbox);
    this.#navigationTracker = new NavigationTracker(url, id, eventManager, logger, this.userContext);
  }
  static create(id, parentId, userContext, cdpTarget, eventManager, browsingContextStorage, realmStorage, configStorage, url, originalOpener, logger) {
    const context = new _a2(id, parentId, userContext, cdpTarget, eventManager, browsingContextStorage, realmStorage, configStorage, url, originalOpener, logger);
    context.#initListeners();
    browsingContextStorage.addContext(context);
    if (!context.isTopLevelContext()) {
      context.parent.addChild(context.id);
    }
    eventManager.registerPromiseEvent(context.targetUnblockedOrThrow().then(() => {
      return {
        kind: "success",
        value: {
          type: "event",
          method: chromium_bidi_exports.BrowsingContext.EventNames.ContextCreated,
          params: {
            ...context.serializeToBidiValue(),
            // Hack to provide the initial URL of the context, as it can be changed
            // between the page target is attached and unblocked, as the page is not
            // fully paused in MPArch session (https://crbug.com/372842894).
            // TODO: remove once https://crbug.com/372842894 is addressed.
            url
          }
        }
      };
    }, (error) => {
      return {
        kind: "error",
        error
      };
    }), context.id, chromium_bidi_exports.BrowsingContext.EventNames.ContextCreated);
    return context;
  }
  /**
   * @see https://html.spec.whatwg.org/multipage/document-sequences.html#navigable
   */
  get navigableId() {
    return this.#loaderId;
  }
  get navigationId() {
    return this.#navigationTracker.currentNavigationId;
  }
  dispose(emitContextDestroyed) {
    this.#navigationTracker.dispose();
    this.#defaultRealmDeferred.reject(new NoSuchFrameException(`Context ${this.id} was destroyed`));
    this.#realmStorage.deleteRealms({
      browsingContextId: this.id
    });
    if (!this.isTopLevelContext()) {
      this.parent.#children.delete(this.id);
    }
    this.#failLifecycleIfNotFinished();
    if (emitContextDestroyed) {
      this.#eventManager.registerEvent({
        type: "event",
        method: chromium_bidi_exports.BrowsingContext.EventNames.ContextDestroyed,
        params: this.serializeToBidiValue(null)
      }, this.id);
    }
    this.#deleteAllChildren();
    this.#eventManager.clearBufferedEvents(this.id);
    this.#browsingContextStorage.deleteContextById(this.id);
  }
  /** Returns the ID of this context. */
  get id() {
    return this.#id;
  }
  /** Returns the parent context ID. */
  get parentId() {
    return this.#parentId;
  }
  /** Sets the parent context ID and updates parent's children. */
  set parentId(parentId) {
    if (this.#parentId !== null) {
      this.#logger?.(LogType.debugError)?.("Parent context already set");
      return;
    }
    this.#parentId = parentId;
    if (!this.isTopLevelContext()) {
      this.parent.addChild(this.id);
    }
  }
  /** Returns the parent context. */
  get parent() {
    if (this.parentId === null) {
      return null;
    }
    return this.#browsingContextStorage.getContext(this.parentId);
  }
  /** Returns all direct children contexts. */
  get directChildren() {
    return [...this.#children].map((id) => this.#browsingContextStorage.getContext(id));
  }
  /** Returns all children contexts, flattened. */
  get allChildren() {
    const children = this.directChildren;
    return children.concat(...children.map((child) => child.allChildren));
  }
  /**
   * Returns true if this is a top-level context.
   * This is the case whenever the parent context ID is null.
   */
  isTopLevelContext() {
    return this.#parentId === null;
  }
  get top() {
    let topContext = this;
    let parent = topContext.parent;
    while (parent) {
      topContext = parent;
      parent = topContext.parent;
    }
    return topContext;
  }
  addChild(childId) {
    this.#children.add(childId);
  }
  #deleteAllChildren(emitContextDestroyed = false) {
    this.directChildren.map((child) => child.dispose(emitContextDestroyed));
  }
  get cdpTarget() {
    return this.#cdpTarget;
  }
  updateCdpTarget(cdpTarget) {
    this.#cdpTarget = cdpTarget;
    if (this.#defaultRealmDeferred.isFinished) {
      this.#defaultRealmDeferred = new Deferred2();
    }
    this.#initListeners();
  }
  get url() {
    return this.#navigationTracker.url;
  }
  async lifecycleLoaded() {
    await this.#lifecycle.load;
  }
  async targetUnblockedOrThrow() {
    const result = await this.#cdpTarget.unblocked;
    if (result.kind === "error") {
      throw result.error;
    }
  }
  /** Returns a sandbox for internal helper scripts which is not exposed to the user.*/
  async getOrCreateHiddenSandbox() {
    return await this.#getOrCreateSandboxInternal(this.#hiddenSandbox);
  }
  /** Returns a sandbox which is exposed to user. */
  async getOrCreateUserSandbox(sandbox) {
    const realm = await this.#getOrCreateSandboxInternal(sandbox);
    if (realm.isHidden()) {
      throw new NoSuchFrameException(`Realm "${sandbox}" not found`);
    }
    return realm;
  }
  async #getOrCreateSandboxInternal(sandbox) {
    const defaultRealm = await this.#defaultRealmDeferred;
    if (sandbox === void 0 || sandbox === "") {
      return defaultRealm;
    }
    let maybeSandboxes = this.#realmStorage.findRealms({
      browsingContextId: this.id,
      sandbox
    });
    if (maybeSandboxes.length === 0) {
      await this.#cdpTarget.cdpClient.sendCommand("Page.createIsolatedWorld", {
        frameId: this.id,
        worldName: sandbox
      });
      maybeSandboxes = this.#realmStorage.findRealms({
        browsingContextId: this.id,
        sandbox
      });
      assert2(maybeSandboxes.length !== 0);
    }
    return maybeSandboxes[0];
  }
  /**
   * Implements https://w3c.github.io/webdriver-bidi/#get-the-navigable-info.
   */
  serializeToBidiValue(maxDepth = 0, addParentField = true) {
    return {
      context: this.#id,
      url: this.url,
      userContext: this.userContext,
      originalOpener: this.#originalOpener ?? null,
      clientWindow: `${this.cdpTarget.windowId}`,
      children: maxDepth === null || maxDepth > 0 ? this.directChildren.map((c) => c.serializeToBidiValue(maxDepth === null ? maxDepth : maxDepth - 1, false)) : null,
      ...addParentField ? { parent: this.#parentId } : {}
    };
  }
  onTargetInfoChanged(params) {
    this.#navigationTracker.onTargetInfoChanged(params.targetInfo.url);
  }
  #initListeners() {
    this.#cdpTarget.cdpClient.on("Network.loadingFailed", (params) => {
      this.#navigationTracker.networkLoadingFailed(params.requestId, params.errorText);
    });
    this.#cdpTarget.cdpClient.on("Page.fileChooserOpened", (params) => {
      if (this.id !== params.frameId) {
        return;
      }
      if (this.#loaderId === void 0) {
        this.#logger?.(LogType.debugError)?.("LoaderId should be defined when file upload is shown", params);
        return;
      }
      const element = params.backendNodeId === void 0 ? void 0 : {
        sharedId: getSharedId(this.id, this.#loaderId, params.backendNodeId)
      };
      this.#eventManager.registerEvent({
        type: "event",
        method: chromium_bidi_exports.Input.EventNames.FileDialogOpened,
        params: {
          context: this.id,
          multiple: params.mode === "selectMultiple",
          element,
          userContext: this.userContext
        }
      }, this.id);
    });
    this.#cdpTarget.cdpClient.on("Page.frameNavigated", (params) => {
      if (this.id !== params.frame.id) {
        return;
      }
      this.#navigationTracker.frameNavigated(
        params.frame.url + (params.frame.urlFragment ?? ""),
        params.frame.loaderId,
        // `unreachableUrl` indicates if the navigation failed.
        params.frame.unreachableUrl,
        params.type
      );
      this.#deleteAllChildren();
      this.#documentChanged(params.frame.loaderId);
      if (params.type === "BackForwardCacheRestore") {
        this.#lifecycle.DOMContentLoaded.resolve();
        this.#lifecycle.load.resolve();
      }
    });
    this.#cdpTarget.cdpClient.on("Page.frameStartedNavigating", (params) => {
      if (this.id !== params.frameId) {
        return;
      }
      if (this.#navigationTracker.isInitialNavigation && !urlMatchesAboutBlank(params.url)) {
        if (this.#defaultRealmDeferred.isFinished) {
          this.#defaultRealmDeferred = new Deferred2();
        }
      }
      this.#navigationTracker.frameStartedNavigating(params.url, params.loaderId, params.navigationType);
    });
    this.#cdpTarget.cdpClient.on("Page.navigatedWithinDocument", (params) => {
      if (this.id !== params.frameId) {
        return;
      }
      this.#navigationTracker.navigatedWithinDocument(params.url, params.navigationType);
      if (params.navigationType === "historyApi") {
        this.#eventManager.registerEvent({
          type: "event",
          method: "browsingContext.historyUpdated",
          params: {
            context: this.id,
            timestamp: getTimestamp(),
            url: this.#navigationTracker.url,
            userContext: this.userContext
          }
        }, this.id);
        return;
      }
    });
    this.#cdpTarget.cdpClient.on("Page.lifecycleEvent", (params) => {
      if (this.id !== params.frameId) {
        return;
      }
      if (params.name === "init") {
        this.#documentChanged(params.loaderId);
        return;
      }
      if (params.name === "commit") {
        this.#loaderId = params.loaderId;
        return;
      }
      if (!this.#loaderId) {
        this.#loaderId = params.loaderId;
      }
      if (params.loaderId !== this.#loaderId) {
        return;
      }
      switch (params.name) {
        case "DOMContentLoaded":
          if (!this.#navigationTracker.isInitialNavigation) {
            this.#eventManager.registerEvent({
              type: "event",
              method: chromium_bidi_exports.BrowsingContext.EventNames.DomContentLoaded,
              params: {
                context: this.id,
                navigation: this.#navigationTracker.currentNavigationId,
                timestamp: getTimestamp(),
                url: this.#navigationTracker.url,
                userContext: this.userContext
              }
            }, this.id);
          }
          this.#lifecycle.DOMContentLoaded.resolve();
          break;
        case "load":
          if (!this.#navigationTracker.isInitialNavigation) {
            this.#eventManager.registerEvent({
              type: "event",
              method: chromium_bidi_exports.BrowsingContext.EventNames.Load,
              params: {
                context: this.id,
                navigation: this.#navigationTracker.currentNavigationId,
                timestamp: getTimestamp(),
                url: this.#navigationTracker.url,
                userContext: this.userContext
              }
            }, this.id);
          }
          this.#navigationTracker.loadPageEvent(params.loaderId);
          this.#lifecycle.load.resolve();
          break;
      }
    });
    this.#cdpTarget.cdpClient.on("Runtime.executionContextCreated", (params) => {
      const { auxData, name, uniqueId, id } = params.context;
      if (!auxData || auxData.frameId !== this.id) {
        return;
      }
      if (auxData.type === "isolated" && name === "") {
        return;
      }
      let origin;
      let sandbox;
      switch (auxData.type) {
        case "isolated":
          sandbox = name;
          if (!this.#defaultRealmDeferred.isFinished) {
            this.#logger?.(LogType.debugError)?.("Unexpectedly, isolated realm created before the default one");
          }
          origin = this.#defaultRealmDeferred.isFinished ? this.#defaultRealmDeferred.result.origin : (
            // This fallback is not expected to be ever reached.
            ""
          );
          break;
        case "default":
          origin = serializeOrigin(params.context.origin);
          break;
        default:
          return;
      }
      const realm = new WindowRealm(this.id, this.#browsingContextStorage, this.#cdpTarget.cdpClient, this.#eventManager, id, this.#logger, origin, uniqueId, this.#realmStorage, sandbox);
      if (auxData.isDefault) {
        if (this.#defaultRealmDeferred.isFinished) {
          this.#defaultRealmDeferred = new Deferred2();
        }
        this.#defaultRealmDeferred.resolve(realm);
      }
      void Promise.all(this.#cdpTarget.getChannels(sandbox).map((channel) => channel.startListenerFromWindow(realm, this.#eventManager)));
    });
    this.#cdpTarget.cdpClient.on("Runtime.executionContextDestroyed", (params) => {
      if (this.#defaultRealmDeferred.isFinished && this.#defaultRealmDeferred.result.executionContextId === params.executionContextId) {
        this.#defaultRealmDeferred = new Deferred2();
      }
      this.#realmStorage.deleteRealms({
        cdpSessionId: this.#cdpTarget.cdpSessionId,
        executionContextId: params.executionContextId
      });
    });
    this.#cdpTarget.cdpClient.on("Runtime.executionContextsCleared", () => {
      if (this.#defaultRealmDeferred.isFinished) {
        this.#defaultRealmDeferred = new Deferred2();
      }
      this.#realmStorage.deleteRealms({
        cdpSessionId: this.#cdpTarget.cdpSessionId
      });
    });
    this.#cdpTarget.cdpClient.on("Page.javascriptDialogClosed", (params) => {
      if (params.frameId && this.id !== params.frameId) {
        return;
      }
      if (!params.frameId && this.#parentId && this.#cdpTarget.cdpClient !== this.#browsingContextStorage.getContext(this.#parentId)?.cdpTarget.cdpClient) {
        return;
      }
      const accepted = params.result;
      if (this.#lastUserPromptType === void 0) {
        this.#logger?.(LogType.debugError)?.("Unexpectedly no opening prompt event before closing one");
      }
      this.#eventManager.registerEvent({
        type: "event",
        method: chromium_bidi_exports.BrowsingContext.EventNames.UserPromptClosed,
        params: {
          context: this.id,
          accepted,
          // `lastUserPromptType` should never be undefined here, so fallback to
          // `UNKNOWN`. The fallback is required to prevent tests from hanging while
          // waiting for the closing event. The cast is required, as the `UNKNOWN` value
          // is not standard.
          type: this.#lastUserPromptType ?? "UNKNOWN",
          userContext: this.userContext,
          userText: accepted && params.userInput ? params.userInput : void 0
        }
      }, this.id);
      this.#lastUserPromptType = void 0;
    });
    this.#cdpTarget.cdpClient.on("Page.javascriptDialogOpening", (params) => {
      if (params.frameId && this.id !== params.frameId) {
        return;
      }
      if (!params.frameId && this.#parentId && this.#cdpTarget.cdpClient !== this.#browsingContextStorage.getContext(this.#parentId)?.cdpTarget.cdpClient) {
        return;
      }
      const promptType = _a2.#getPromptType(params.type);
      this.#lastUserPromptType = promptType;
      const promptHandler = this.#getPromptHandler(promptType);
      this.#eventManager.registerEvent({
        type: "event",
        method: chromium_bidi_exports.BrowsingContext.EventNames.UserPromptOpened,
        params: {
          context: this.id,
          handler: promptHandler,
          type: promptType,
          message: params.message,
          userContext: this.userContext,
          ...params.type === "prompt" ? { defaultValue: params.defaultPrompt } : {}
        }
      }, this.id);
      switch (promptHandler) {
        // Based on `unhandledPromptBehavior`, check if the prompt should be handled
        // automatically (`accept`, `dismiss`) or wait for the user to do it.
        case Session.UserPromptHandlerType.Accept:
          void this.handleUserPrompt(true);
          break;
        case Session.UserPromptHandlerType.Dismiss:
          void this.handleUserPrompt(false);
          break;
        case Session.UserPromptHandlerType.Ignore:
          break;
      }
    });
    this.#cdpTarget.browserCdpClient.on("Browser.downloadWillBegin", (params) => {
      if (this.id !== params.frameId) {
        return;
      }
      let openerContext;
      if (this.#originalOpener !== void 0 && this.#navigationTracker.isInitialCommittedNavigation) {
        openerContext = this.#browsingContextStorage.findContext(this.#originalOpener);
      }
      const targetContext = openerContext ?? this;
      const navigation = this.#navigationTracker.downloadWillBegin();
      targetContext.#downloadIdToInfoMap.set(params.guid, {
        url: params.url,
        navigation
      });
      if (openerContext !== void 0 && navigation !== null) {
        this.#eventManager.registerEvent({
          type: "event",
          method: chromium_bidi_exports.BrowsingContext.EventNames.NavigationStarted,
          params: {
            context: openerContext.id,
            navigation,
            timestamp: getTimestamp(),
            url: params.url,
            userContext: openerContext.userContext
          }
        }, openerContext.id);
      }
      this.#eventManager.registerEvent({
        type: "event",
        method: chromium_bidi_exports.BrowsingContext.EventNames.DownloadWillBegin,
        params: {
          context: targetContext.id,
          download: params.guid,
          suggestedFilename: params.suggestedFilename,
          navigation,
          timestamp: getTimestamp(),
          url: params.url,
          userContext: targetContext.userContext
        }
      }, targetContext.id);
    });
    this.#cdpTarget.browserCdpClient.on("Browser.downloadProgress", (params) => {
      if (!this.#downloadIdToInfoMap.has(params.guid)) {
        return;
      }
      if (params.state === "inProgress") {
        return;
      }
      const { url, navigation } = this.#downloadIdToInfoMap.get(params.guid);
      this.#downloadIdToInfoMap.delete(params.guid);
      switch (params.state) {
        case "canceled":
          this.#eventManager.registerEvent({
            type: "event",
            method: chromium_bidi_exports.BrowsingContext.EventNames.DownloadEnd,
            params: {
              status: "canceled",
              context: this.id,
              download: params.guid,
              navigation,
              timestamp: getTimestamp(),
              url,
              userContext: this.userContext
            }
          }, this.id);
          break;
        case "completed":
          this.#eventManager.registerEvent({
            type: "event",
            method: chromium_bidi_exports.BrowsingContext.EventNames.DownloadEnd,
            params: {
              filepath: params.filePath ?? null,
              status: "complete",
              context: this.id,
              download: params.guid,
              navigation,
              timestamp: getTimestamp(),
              url,
              userContext: this.userContext
            }
          }, this.id);
          break;
        default:
          throw new UnknownErrorException(`Unknown download state: ${params.state}`);
      }
    });
  }
  static #getPromptType(cdpType) {
    switch (cdpType) {
      case "alert":
        return BrowsingContext2.UserPromptType.Alert;
      case "beforeunload":
        return BrowsingContext2.UserPromptType.Beforeunload;
      case "confirm":
        return BrowsingContext2.UserPromptType.Confirm;
      case "prompt":
        return BrowsingContext2.UserPromptType.Prompt;
    }
  }
  /**
   * Returns either custom UserContext's prompt handler, global or default one.
   */
  #getPromptHandler(promptType) {
    const defaultPromptHandler = Session.UserPromptHandlerType.Dismiss;
    const contextConfig = this.#configStorage.getActiveConfig(this.top.id, this.userContext);
    switch (promptType) {
      case BrowsingContext2.UserPromptType.Alert:
        return contextConfig.userPromptHandler?.alert ?? contextConfig.userPromptHandler?.default ?? defaultPromptHandler;
      case BrowsingContext2.UserPromptType.Beforeunload:
        return contextConfig.userPromptHandler?.beforeUnload ?? contextConfig.userPromptHandler?.default ?? // In WebDriver Classic spec, `beforeUnload` prompt should be accepted by
        // default. Step 4 of "Get the prompt handler" algorithm
        // (https://w3c.github.io/webdriver/#dfn-get-the-prompt-handler):
        // > If type is "beforeUnload", return a prompt handler configuration with
        //   handler "accept" and notify false.
        Session.UserPromptHandlerType.Accept;
      case BrowsingContext2.UserPromptType.Confirm:
        return contextConfig.userPromptHandler?.confirm ?? contextConfig.userPromptHandler?.default ?? defaultPromptHandler;
      case BrowsingContext2.UserPromptType.Prompt:
        return contextConfig.userPromptHandler?.prompt ?? contextConfig.userPromptHandler?.default ?? defaultPromptHandler;
    }
  }
  #documentChanged(loaderId) {
    if (loaderId === void 0 || this.#loaderId === loaderId) {
      return;
    }
    this.#resetLifecycleIfFinished();
    this.#loaderId = loaderId;
    this.#deleteAllChildren(true);
  }
  #resetLifecycleIfFinished() {
    if (this.#lifecycle.DOMContentLoaded.isFinished) {
      this.#lifecycle.DOMContentLoaded = new Deferred2();
    } else {
      this.#logger?.(_a2.LOGGER_PREFIX)?.("Document changed (DOMContentLoaded)");
    }
    if (this.#lifecycle.load.isFinished) {
      this.#lifecycle.load = new Deferred2();
    } else {
      this.#logger?.(_a2.LOGGER_PREFIX)?.("Document changed (load)");
    }
  }
  #failLifecycleIfNotFinished() {
    if (!this.#lifecycle.DOMContentLoaded.isFinished) {
      this.#lifecycle.DOMContentLoaded.reject(new UnknownErrorException("navigation canceled"));
    }
    if (!this.#lifecycle.load.isFinished) {
      this.#lifecycle.load.reject(new UnknownErrorException("navigation canceled"));
    }
  }
  async navigate(url, wait) {
    try {
      new URL(url);
    } catch {
      throw new InvalidArgumentException(`Invalid URL: ${url}`);
    }
    const navigationState = this.#navigationTracker.createPendingNavigation(url);
    const cdpNavigatePromise = (async () => {
      const cdpNavigateResult = await this.#cdpTarget.cdpClient.sendCommand("Page.navigate", {
        url,
        frameId: this.id
      });
      if (cdpNavigateResult.errorText) {
        this.#navigationTracker.failNavigation(navigationState, cdpNavigateResult.errorText);
        throw new UnknownErrorException(cdpNavigateResult.errorText);
      }
      this.#navigationTracker.navigationCommandFinished(navigationState, cdpNavigateResult.loaderId);
      this.#documentChanged(cdpNavigateResult.loaderId);
    })();
    const result = await Promise.race([
      // No `loaderId` means same-document navigation.
      this.#waitNavigation(wait, cdpNavigatePromise, navigationState),
      // Throw an error if the navigation is canceled.
      navigationState.finished
    ]);
    if (result instanceof NavigationResult) {
      if (
        // TODO: check after decision on the spec is done:
        //  https://github.com/w3c/webdriver-bidi/issues/799.
        result.eventName === NavigationEventName.NavigationAborted || result.eventName === NavigationEventName.NavigationFailed
      ) {
        throw new UnknownErrorException(result.message ?? "unknown exception");
      }
    }
    return {
      navigation: navigationState.navigationId,
      // Url can change due to redirects. Get the one from commandNavigation.
      url: navigationState.url
    };
  }
  async #waitNavigation(wait, cdpCommandPromise, navigationState) {
    await Promise.all([navigationState.committed, cdpCommandPromise]);
    if (wait === BrowsingContext2.ReadinessState.None) {
      return;
    }
    if (navigationState.isFragmentNavigation === true) {
      await navigationState.finished;
      return;
    }
    if (wait === BrowsingContext2.ReadinessState.Interactive) {
      await this.#lifecycle.DOMContentLoaded;
      return;
    }
    if (wait === BrowsingContext2.ReadinessState.Complete) {
      await this.#lifecycle.load;
      return;
    }
    throw new InvalidArgumentException(`Wait condition ${wait} is not supported`);
  }
  // TODO: support concurrent navigations analogous to `navigate`.
  async reload(ignoreCache, wait) {
    await this.targetUnblockedOrThrow();
    this.#resetLifecycleIfFinished();
    const navigationState = this.#navigationTracker.createPendingNavigation(this.#navigationTracker.url);
    const cdpReloadPromise = this.#cdpTarget.cdpClient.sendCommand("Page.reload", {
      ignoreCache
    });
    const result = await Promise.race([
      // No `loaderId` means same-document navigation.
      this.#waitNavigation(wait, cdpReloadPromise, navigationState),
      // Throw an error if the navigation is canceled.
      navigationState.finished
    ]);
    if (result instanceof NavigationResult) {
      if (result.eventName === NavigationEventName.NavigationAborted || result.eventName === NavigationEventName.NavigationFailed) {
        throw new UnknownErrorException(result.message ?? "unknown exception");
      }
    }
    return {
      navigation: navigationState.navigationId,
      // Url can change due to redirects. Get the one from commandNavigation.
      url: navigationState.url
    };
  }
  async setViewport(viewport, devicePixelRatio, screenOrientation) {
    const config = this.#configStorage.getActiveConfig(this.id, this.userContext);
    await this.cdpTarget.setDeviceMetricsOverride(viewport, devicePixelRatio, screenOrientation, config.screenArea ?? null, config.scrollbarType ?? null, config.viewportMeta ?? null);
  }
  async handleUserPrompt(accept, userText) {
    await this.top.#cdpTarget.cdpClient.sendCommand("Page.handleJavaScriptDialog", {
      accept: accept ?? true,
      promptText: userText
    });
  }
  async activate() {
    await this.#cdpTarget.cdpClient.sendCommand("Page.bringToFront");
  }
  async captureScreenshot(params) {
    if (!this.isTopLevelContext()) {
      throw new UnsupportedOperationException(`Non-top-level 'context' (${params.context}) is currently not supported`);
    }
    const formatParameters = getImageFormatParameters(params);
    let captureBeyondViewport = false;
    let script;
    params.origin ??= "viewport";
    switch (params.origin) {
      case "document": {
        script = String(() => {
          const element = document.documentElement;
          return {
            x: 0,
            y: 0,
            width: element.scrollWidth,
            height: element.scrollHeight
          };
        });
        captureBeyondViewport = true;
        break;
      }
      case "viewport": {
        script = String(() => {
          const viewport = window.visualViewport;
          return {
            x: viewport.pageLeft,
            y: viewport.pageTop,
            width: viewport.width,
            height: viewport.height
          };
        });
        break;
      }
    }
    const hiddenSandboxRealm = await this.getOrCreateHiddenSandbox();
    const originResult = await hiddenSandboxRealm.callFunction(script, false);
    assert2(originResult.type === "success");
    const origin = deserializeDOMRect(originResult.result);
    assert2(origin);
    let rect = origin;
    if (params.clip) {
      const clip = params.clip;
      if (params.origin === "viewport" && clip.type === "box") {
        clip.x += origin.x;
        clip.y += origin.y;
      }
      rect = getIntersectionRect(await this.#parseRect(clip), origin);
    }
    if (rect.width === 0 || rect.height === 0) {
      throw new UnableToCaptureScreenException(`Unable to capture screenshot with zero dimensions: width=${rect.width}, height=${rect.height}`);
    }
    return await this.#cdpTarget.cdpClient.sendCommand("Page.captureScreenshot", {
      clip: { ...rect, scale: 1 },
      ...formatParameters,
      captureBeyondViewport
    });
  }
  async print(params) {
    if (!this.isTopLevelContext()) {
      throw new UnsupportedOperationException("Printing of non-top level contexts is not supported");
    }
    const cdpParams = {};
    if (params.background !== void 0) {
      cdpParams.printBackground = params.background;
    }
    if (params.margin?.bottom !== void 0) {
      cdpParams.marginBottom = inchesFromCm(params.margin.bottom);
    }
    if (params.margin?.left !== void 0) {
      cdpParams.marginLeft = inchesFromCm(params.margin.left);
    }
    if (params.margin?.right !== void 0) {
      cdpParams.marginRight = inchesFromCm(params.margin.right);
    }
    if (params.margin?.top !== void 0) {
      cdpParams.marginTop = inchesFromCm(params.margin.top);
    }
    if (params.orientation !== void 0) {
      cdpParams.landscape = params.orientation === "landscape";
    }
    if (params.page?.height !== void 0) {
      cdpParams.paperHeight = inchesFromCm(params.page.height);
    }
    if (params.page?.width !== void 0) {
      cdpParams.paperWidth = inchesFromCm(params.page.width);
    }
    if (params.pageRanges !== void 0) {
      for (const range of params.pageRanges) {
        if (typeof range === "number") {
          continue;
        }
        const rangeParts = range.split("-");
        if (rangeParts.length < 1 || rangeParts.length > 2) {
          throw new InvalidArgumentException(`Invalid page range: ${range} is not a valid integer range.`);
        }
        if (rangeParts.length === 1) {
          void parseInteger(rangeParts[0] ?? "");
          continue;
        }
        let lowerBound;
        let upperBound;
        const [rangeLowerPart = "", rangeUpperPart = ""] = rangeParts;
        if (rangeLowerPart === "") {
          lowerBound = 1;
        } else {
          lowerBound = parseInteger(rangeLowerPart);
        }
        if (rangeUpperPart === "") {
          upperBound = Number.MAX_SAFE_INTEGER;
        } else {
          upperBound = parseInteger(rangeUpperPart);
        }
        if (lowerBound > upperBound) {
          throw new InvalidArgumentException(`Invalid page range: ${rangeLowerPart} > ${rangeUpperPart}`);
        }
      }
      cdpParams.pageRanges = params.pageRanges.join(",");
    }
    if (params.scale !== void 0) {
      cdpParams.scale = params.scale;
    }
    if (params.shrinkToFit !== void 0) {
      cdpParams.preferCSSPageSize = !params.shrinkToFit;
    }
    try {
      const result = await this.#cdpTarget.cdpClient.sendCommand("Page.printToPDF", cdpParams);
      return {
        data: result.data
      };
    } catch (error) {
      if (error.message === "invalid print parameters: content area is empty") {
        throw new UnsupportedOperationException(error.message);
      }
      throw error;
    }
  }
  /**
   * See
   * https://w3c.github.io/webdriver-bidi/#:~:text=If%20command%20parameters%20contains%20%22clip%22%3A
   */
  async #parseRect(clip) {
    switch (clip.type) {
      case "box":
        return { x: clip.x, y: clip.y, width: clip.width, height: clip.height };
      case "element": {
        const hiddenSandboxRealm = await this.getOrCreateHiddenSandbox();
        const result = await hiddenSandboxRealm.callFunction(String((element) => {
          return element instanceof Element;
        }), false, { type: "undefined" }, [clip.element]);
        if (result.type === "exception") {
          throw new NoSuchElementException(`Element '${clip.element.sharedId}' was not found`);
        }
        assert2(result.result.type === "boolean");
        if (!result.result.value) {
          throw new NoSuchElementException(`Node '${clip.element.sharedId}' is not an Element`);
        }
        {
          const result2 = await hiddenSandboxRealm.callFunction(String((element) => {
            const rect2 = element.getBoundingClientRect();
            return {
              x: rect2.x,
              y: rect2.y,
              height: rect2.height,
              width: rect2.width
            };
          }), false, { type: "undefined" }, [clip.element]);
          assert2(result2.type === "success");
          const rect = deserializeDOMRect(result2.result);
          if (!rect) {
            throw new UnableToCaptureScreenException(`Could not get bounding box for Element '${clip.element.sharedId}'`);
          }
          return rect;
        }
      }
    }
  }
  async close() {
    await this.#cdpTarget.cdpClient.sendCommand("Page.close");
  }
  async traverseHistory(delta) {
    if (delta === 0) {
      return;
    }
    const history = await this.#cdpTarget.cdpClient.sendCommand("Page.getNavigationHistory");
    const entry = history.entries[history.currentIndex + delta];
    if (!entry) {
      throw new NoSuchHistoryEntryException(`No history entry at delta ${delta}`);
    }
    await this.#cdpTarget.cdpClient.sendCommand("Page.navigateToHistoryEntry", {
      entryId: entry.id
    });
  }
  async toggleModulesIfNeeded() {
    await Promise.all([
      this.#cdpTarget.toggleNetworkIfNeeded(),
      this.#cdpTarget.toggleDeviceAccessIfNeeded(),
      this.#cdpTarget.togglePreloadIfNeeded()
    ]);
  }
  async locateNodes(params) {
    return await this.#locateNodesByLocator(await this.#defaultRealmDeferred, params.locator, params.startNodes ?? [], params.maxNodeCount, params.serializationOptions);
  }
  #getLocatorDelegate(locator, maxNodeCount, startNodes) {
    switch (locator.type) {
      case "context":
      case "accessibility":
        throw new Error("Unreachable");
      case "css":
        return {
          functionDeclaration: String((cssSelector, maxNodeCount2, ...startNodes2) => {
            const locateNodesUsingCss = (element) => {
              if (!(element instanceof HTMLElement || element instanceof Document || element instanceof DocumentFragment || element instanceof SVGElement)) {
                throw new Error("startNodes in css selector should be HTMLElement, SVGElement or Document or DocumentFragment");
              }
              return [...element.querySelectorAll(cssSelector)];
            };
            startNodes2 = startNodes2.length > 0 ? startNodes2 : [document];
            const returnedNodes = startNodes2.map((startNode) => (
              // TODO: stop search early if `maxNodeCount` is reached.
              locateNodesUsingCss(startNode)
            )).flat(1);
            return maxNodeCount2 === 0 ? returnedNodes : returnedNodes.slice(0, maxNodeCount2);
          }),
          argumentsLocalValues: [
            // `cssSelector`
            { type: "string", value: locator.value },
            // `maxNodeCount` with `0` means no limit.
            { type: "number", value: maxNodeCount ?? 0 },
            // `startNodes`
            ...startNodes
          ]
        };
      case "xpath":
        return {
          functionDeclaration: String((xPathSelector, maxNodeCount2, ...startNodes2) => {
            const evaluator = new XPathEvaluator();
            const expression = evaluator.createExpression(xPathSelector);
            const locateNodesUsingXpath = (element) => {
              const xPathResult = expression.evaluate(element, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
              const returnedNodes2 = [];
              for (let i = 0; i < xPathResult.snapshotLength; i++) {
                returnedNodes2.push(xPathResult.snapshotItem(i));
              }
              return returnedNodes2;
            };
            startNodes2 = startNodes2.length > 0 ? startNodes2 : [document];
            const returnedNodes = startNodes2.map((startNode) => (
              // TODO: stop search early if `maxNodeCount` is reached.
              locateNodesUsingXpath(startNode)
            )).flat(1);
            return maxNodeCount2 === 0 ? returnedNodes : returnedNodes.slice(0, maxNodeCount2);
          }),
          argumentsLocalValues: [
            // `xPathSelector`
            { type: "string", value: locator.value },
            // `maxNodeCount` with `0` means no limit.
            { type: "number", value: maxNodeCount ?? 0 },
            // `startNodes`
            ...startNodes
          ]
        };
      case "innerText":
        if (locator.value === "") {
          throw new InvalidSelectorException("innerText locator cannot be empty");
        }
        return {
          functionDeclaration: String((innerTextSelector, fullMatch, ignoreCase, maxNodeCount2, maxDepth, ...startNodes2) => {
            const searchText = ignoreCase ? innerTextSelector.toUpperCase() : innerTextSelector;
            const locateNodesUsingInnerText = (node, currentMaxDepth) => {
              const returnedNodes2 = [];
              if (node instanceof DocumentFragment || node instanceof Document) {
                const children = [...node.children];
                children.forEach((child) => (
                  // `currentMaxDepth` is not decremented intentionally according to
                  // https://github.com/w3c/webdriver-bidi/pull/713.
                  returnedNodes2.push(...locateNodesUsingInnerText(child, currentMaxDepth))
                ));
                return returnedNodes2;
              }
              if (!(node instanceof HTMLElement)) {
                return [];
              }
              const element = node;
              const nodeInnerText = ignoreCase ? element.innerText?.toUpperCase() : element.innerText;
              if (!nodeInnerText.includes(searchText)) {
                return [];
              }
              const childNodes = [];
              for (const child of element.children) {
                if (child instanceof HTMLElement) {
                  childNodes.push(child);
                }
              }
              if (childNodes.length === 0) {
                if (fullMatch && nodeInnerText === searchText) {
                  returnedNodes2.push(element);
                } else {
                  if (!fullMatch) {
                    returnedNodes2.push(element);
                  }
                }
              } else {
                const childNodeMatches = (
                  // Don't search deeper if `maxDepth` is reached.
                  currentMaxDepth <= 0 ? [] : childNodes.map((child) => locateNodesUsingInnerText(child, currentMaxDepth - 1)).flat(1)
                );
                if (childNodeMatches.length === 0) {
                  if (!fullMatch || nodeInnerText === searchText) {
                    returnedNodes2.push(element);
                  }
                } else {
                  returnedNodes2.push(...childNodeMatches);
                }
              }
              return returnedNodes2;
            };
            startNodes2 = startNodes2.length > 0 ? startNodes2 : [document];
            const returnedNodes = startNodes2.map((startNode) => (
              // TODO: stop search early if `maxNodeCount` is reached.
              locateNodesUsingInnerText(startNode, maxDepth)
            )).flat(1);
            return maxNodeCount2 === 0 ? returnedNodes : returnedNodes.slice(0, maxNodeCount2);
          }),
          argumentsLocalValues: [
            // `innerTextSelector`
            { type: "string", value: locator.value },
            // `fullMatch` with default `true`.
            { type: "boolean", value: locator.matchType !== "partial" },
            // `ignoreCase` with default `false`.
            { type: "boolean", value: locator.ignoreCase === true },
            // `maxNodeCount` with `0` means no limit.
            { type: "number", value: maxNodeCount ?? 0 },
            // `maxDepth` with default `1000` (same as default full serialization depth).
            { type: "number", value: locator.maxDepth ?? 1e3 },
            // `startNodes`
            ...startNodes
          ]
        };
    }
  }
  async #locateNodesByLocator(realm, locator, startNodes, maxNodeCount, serializationOptions) {
    if (locator.type === "context") {
      return await this.#locateNodesByContextLocator(locator, startNodes, realm, serializationOptions);
    }
    if (locator.type === "accessibility") {
      return await this.#locateNodesByAccessibility(locator, startNodes, maxNodeCount, realm);
    }
    const locatorDelegate = this.#getLocatorDelegate(locator, maxNodeCount, startNodes);
    serializationOptions = {
      ...serializationOptions,
      // The returned object is an array of nodes, so no need in deeper JS serialization.
      maxObjectDepth: 1
    };
    const locatorResult = await realm.callFunction(locatorDelegate.functionDeclaration, false, { type: "undefined" }, locatorDelegate.argumentsLocalValues, Script2.ResultOwnership.None, serializationOptions);
    if (locatorResult.type !== "success") {
      this.#logger?.(_a2.LOGGER_PREFIX)?.("Failed locateNodesByLocator", locatorResult);
      if (
        // CSS selector.
        locatorResult.exceptionDetails.text?.endsWith("is not a valid selector.") || // XPath selector.
        locatorResult.exceptionDetails.text?.endsWith("is not a valid XPath expression.")
      ) {
        throw new InvalidSelectorException(`Not valid selector ${typeof locator.value === "string" ? locator.value : JSON.stringify(locator.value)}`);
      }
      if (locatorResult.exceptionDetails.text === "Error: startNodes in css selector should be HTMLElement, SVGElement or Document or DocumentFragment") {
        throw new InvalidArgumentException("startNodes in css selector should be HTMLElement, SVGElement or Document or DocumentFragment");
      }
      throw new UnknownErrorException(`Unexpected error in selector script: ${locatorResult.exceptionDetails.text}`);
    }
    if (locatorResult.result.type !== "array") {
      throw new UnknownErrorException(`Unexpected selector script result type: ${locatorResult.result.type}`);
    }
    const nodes = locatorResult.result.value.map((value) => {
      if (value.type !== "node") {
        throw new UnknownErrorException(`Unexpected selector script result element: ${value.type}`);
      }
      return value;
    });
    return { nodes };
  }
  async #locateNodesByContextLocator(locator, startNodes, realm, serializationOptions) {
    if (startNodes.length !== 0) {
      throw new InvalidArgumentException("Start nodes are not supported");
    }
    const contextId = locator.value.context;
    if (!contextId) {
      throw new InvalidSelectorException("Invalid context");
    }
    const context = this.#browsingContextStorage.getContext(contextId);
    const parent = context.parent;
    if (!parent) {
      throw new InvalidArgumentException("This context has no container");
    }
    try {
      const { backendNodeId } = await parent.#cdpTarget.cdpClient.sendCommand("DOM.getFrameOwner", {
        frameId: contextId
      });
      const { object } = await parent.#cdpTarget.cdpClient.sendCommand("DOM.resolveNode", {
        backendNodeId
      });
      const locatorResult = await realm.callFunction(`function () { return this; }`, false, { handle: object.objectId }, [], Script2.ResultOwnership.None, serializationOptions);
      if (locatorResult.type === "exception") {
        throw new Error("Unknown exception");
      }
      return { nodes: [locatorResult.result] };
    } catch {
      throw new InvalidArgumentException("Context does not exist");
    }
  }
  async #locateNodesByAccessibility(locator, startNodes, maxNodeCount, realm) {
    if (!locator.value.name && !locator.value.role) {
      throw new InvalidSelectorException("Either name or role has to be specified");
    }
    await this.#cdpTarget.cdpClient.sendCommand("Accessibility.enable");
    const startBackendNodeIds = [];
    if (startNodes.length === 0) {
      const { root: documentRoot } = await this.#cdpTarget.cdpClient.sendCommand("DOM.getDocument");
      startBackendNodeIds.push(documentRoot.backendNodeId);
    } else {
      for (const node of startNodes) {
        if (node.sharedId) {
          const parsed = parseSharedId(node.sharedId);
          if (!parsed) {
            throw new NoSuchNodeException(`Invalid sharedId: ${node.sharedId}`);
          }
          startBackendNodeIds.push(parsed.backendNodeId);
        } else {
          if (node.handle) {
            const { nodeId } = await this.#cdpTarget.cdpClient.sendCommand("DOM.requestNode", {
              objectId: node.handle
            });
            const { node: describedNode } = await this.#cdpTarget.cdpClient.sendCommand("DOM.describeNode", {
              nodeId
            });
            startBackendNodeIds.push(describedNode.backendNodeId);
          } else {
            throw new NoSuchNodeException("Start node must have sharedId or handle");
          }
        }
      }
    }
    const matchedBackendNodeIds = /* @__PURE__ */ new Set();
    for (const backendNodeId of startBackendNodeIds) {
      const { nodes } = await this.#cdpTarget.cdpClient.sendCommand("Accessibility.queryAXTree", {
        backendNodeId,
        accessibleName: locator.value.name,
        role: locator.value.role
      });
      for (const node of nodes) {
        if (node.backendDOMNodeId && node.role?.type === "role") {
          matchedBackendNodeIds.add(node.backendDOMNodeId);
          if (maxNodeCount !== void 0 && maxNodeCount > 0 && matchedBackendNodeIds.size >= maxNodeCount) {
            break;
          }
        }
      }
    }
    const resultNodes = await Promise.all(Array.from(matchedBackendNodeIds).map(async (backendNodeId) => {
      const { object } = await this.#cdpTarget.cdpClient.sendCommand("DOM.resolveNode", {
        backendNodeId
      });
      return await realm.serializeCdpObject(object, Script2.ResultOwnership.None);
    }));
    return {
      nodes: resultNodes.filter((result) => result.type === "node")
    };
  }
  #getAllRelatedCdpTargets() {
    const targets = /* @__PURE__ */ new Set();
    targets.add(this.cdpTarget);
    this.allChildren.forEach((c) => targets.add(c.cdpTarget));
    return Array.from(targets);
  }
  async setTimezoneOverride(timezone) {
    await Promise.all(this.#getAllRelatedCdpTargets().map(async (cdpTarget) => await cdpTarget.setTimezoneOverride(timezone)));
  }
  async setLocaleOverride(locale) {
    await Promise.all(this.#getAllRelatedCdpTargets().map(async (cdpTarget) => await cdpTarget.setLocaleOverride(locale)));
  }
  async setGeolocationOverride(geolocation) {
    await Promise.all(this.#getAllRelatedCdpTargets().map(async (cdpTarget) => await cdpTarget.setGeolocationOverride(geolocation)));
  }
  async setScriptingEnabled(scriptingEnabled) {
    await Promise.all(this.#getAllRelatedCdpTargets().map(async (cdpTarget) => await cdpTarget.setScriptingEnabled(scriptingEnabled)));
  }
  async setUserAgentAndAcceptLanguage(userAgent, acceptLanguage, clientHints) {
    await Promise.all(this.#getAllRelatedCdpTargets().map(async (cdpTarget) => await cdpTarget.setUserAgentAndAcceptLanguage(userAgent, acceptLanguage, clientHints)));
  }
  async setEmulatedNetworkConditions(networkConditions) {
    await Promise.all(this.#getAllRelatedCdpTargets().map(async (cdpTarget) => await cdpTarget.setEmulatedNetworkConditions(networkConditions)));
  }
  async setTouchOverride(maxTouchPoints) {
    await Promise.allSettled(this.#getAllRelatedCdpTargets().map(async (cdpTarget) => await cdpTarget.setTouchOverride(maxTouchPoints)));
  }
  async setMediaFeaturesOverride(mediaFeatures) {
    await Promise.all(this.#getAllRelatedCdpTargets().map(async (cdpTarget) => await cdpTarget.setMediaFeaturesOverride(mediaFeatures)));
  }
  async setExtraHeaders(cdpExtraHeaders) {
    await Promise.all(this.#getAllRelatedCdpTargets().map(async (cdpTarget) => await cdpTarget.setExtraHeaders(cdpExtraHeaders)));
  }
  async setScrollbarTypeOverride(scrollbarType) {
    const config = this.#configStorage.getActiveConfig(this.id, this.userContext);
    await this.cdpTarget.setDeviceMetricsOverride(config.viewport ?? null, config.devicePixelRatio ?? null, config.screenOrientation ?? null, config.screenArea ?? null, scrollbarType, config.viewportMeta ?? null);
  }
  async setViewportMetaOverride(viewportMeta) {
    const config = this.#configStorage.getActiveConfig(this.id, this.userContext);
    await this.cdpTarget.setDeviceMetricsOverride(config.viewport ?? null, config.devicePixelRatio ?? null, config.screenOrientation ?? null, config.screenArea ?? null, config.scrollbarType ?? null, viewportMeta);
  }
};
_a2 = BrowsingContextImpl;
function serializeOrigin(origin) {
  if (["://", ""].includes(origin)) {
    origin = "null";
  }
  return origin;
}
function getImageFormatParameters(params) {
  const { quality, type } = params.format ?? {
    type: "image/png"
  };
  switch (type) {
    case "image/png": {
      return { format: "png" };
    }
    case "image/jpeg": {
      return {
        format: "jpeg",
        ...quality === void 0 ? {} : { quality: Math.round(quality * 100) }
      };
    }
    case "image/webp": {
      return {
        format: "webp",
        ...quality === void 0 ? {} : { quality: Math.round(quality * 100) }
      };
    }
  }
  throw new InvalidArgumentException(`Image format '${type}' is not a supported format`);
}
function deserializeDOMRect(result) {
  if (result.type !== "object" || result.value === void 0) {
    return;
  }
  const x = result.value.find(([key]) => {
    return key === "x";
  })?.[1];
  const y = result.value.find(([key]) => {
    return key === "y";
  })?.[1];
  const height = result.value.find(([key]) => {
    return key === "height";
  })?.[1];
  const width = result.value.find(([key]) => {
    return key === "width";
  })?.[1];
  if (x?.type !== "number" || y?.type !== "number" || height?.type !== "number" || width?.type !== "number") {
    return;
  }
  return {
    x: x.value,
    y: y.value,
    width: width.value,
    height: height.value
  };
}
function normalizeRect(box) {
  return {
    ...box.width < 0 ? {
      x: box.x + box.width,
      width: -box.width
    } : {
      x: box.x,
      width: box.width
    },
    ...box.height < 0 ? {
      y: box.y + box.height,
      height: -box.height
    } : {
      y: box.y,
      height: box.height
    }
  };
}
function getIntersectionRect(first2, second) {
  first2 = normalizeRect(first2);
  second = normalizeRect(second);
  const x = Math.max(first2.x, second.x);
  const y = Math.max(first2.y, second.y);
  return {
    x,
    y,
    width: Math.max(Math.min(first2.x + first2.width, second.x + second.width) - x, 0),
    height: Math.max(Math.min(first2.y + first2.height, second.y + second.height) - y, 0)
  };
}
function parseInteger(value) {
  value = value.trim();
  if (!/^[0-9]+$/.test(value)) {
    throw new InvalidArgumentException(`Invalid integer: ${value}`);
  }
  return parseInt(value);
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/script/WorkerRealm.js
var WorkerRealm = class extends Realm2 {
  #realmType;
  #ownerRealms;
  constructor(cdpClient, eventManager, executionContextId, logger, origin, ownerRealms, realmId, realmStorage, realmType) {
    super(cdpClient, eventManager, executionContextId, logger, origin, realmId, realmStorage);
    this.#ownerRealms = ownerRealms;
    this.#realmType = realmType;
    this.initialize();
  }
  get associatedBrowsingContexts() {
    return this.#ownerRealms.flatMap((realm) => realm.associatedBrowsingContexts);
  }
  get realmType() {
    return this.#realmType;
  }
  get source() {
    return {
      realm: this.realmId,
      // This is a hack to make Puppeteer able to track workers.
      // TODO: remove after Puppeteer tracks workers by owners and use the base version.
      context: this.associatedBrowsingContexts[0]?.id,
      userContext: this.associatedBrowsingContexts[0]?.userContext
    };
  }
  get realmInfo() {
    const owners = this.#ownerRealms.map((realm) => realm.realmId);
    const { realmType } = this;
    switch (realmType) {
      case "dedicated-worker": {
        const owner = owners[0];
        if (owner === void 0 || owners.length !== 1) {
          throw new Error("Dedicated worker must have exactly one owner");
        }
        return {
          ...this.baseInfo,
          type: realmType,
          owners: [owner]
        };
      }
      case "service-worker":
      case "shared-worker": {
        return {
          ...this.baseInfo,
          type: realmType
        };
      }
    }
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/log/logHelper.js
var specifiers = ["%s", "%d", "%i", "%f", "%o", "%O", "%c"];
function isFormatSpecifier(str) {
  return specifiers.some((spec) => str.includes(spec));
}
function logMessageFormatter(args) {
  let output = "";
  const argFormat = args[0].value.toString();
  const argValues = args.slice(1, void 0);
  const tokens = argFormat.split(new RegExp(specifiers.map((spec) => `(${spec})`).join("|"), "g"));
  for (const token of tokens) {
    if (token === void 0 || token === "") {
      continue;
    }
    if (isFormatSpecifier(token)) {
      const arg = argValues.shift();
      assert2(arg, `Less value is provided: "${getRemoteValuesText(args, false)}"`);
      if (token === "%s") {
        output += stringFromArg(arg);
      } else if (token === "%d" || token === "%i") {
        if (arg.type === "bigint" || arg.type === "number" || arg.type === "string") {
          output += parseInt(arg.value.toString(), 10);
        } else {
          output += "NaN";
        }
      } else if (token === "%f") {
        if (arg.type === "bigint" || arg.type === "number" || arg.type === "string") {
          output += parseFloat(arg.value.toString());
        } else {
          output += "NaN";
        }
      } else {
        output += toJson(arg);
      }
    } else {
      output += token;
    }
  }
  if (argValues.length > 0) {
    throw new Error(`More value is provided: "${getRemoteValuesText(args, false)}"`);
  }
  return output;
}
function toJson(arg) {
  if (arg.type !== "array" && arg.type !== "bigint" && arg.type !== "date" && arg.type !== "number" && arg.type !== "object" && arg.type !== "string") {
    return stringFromArg(arg);
  }
  if (arg.type === "bigint") {
    return `${arg.value.toString()}n`;
  }
  if (arg.type === "number") {
    return arg.value.toString();
  }
  if (["date", "string"].includes(arg.type)) {
    return JSON.stringify(arg.value);
  }
  if (arg.type === "object") {
    return `{${arg.value.map((pair) => {
      return `${JSON.stringify(pair[0])}:${toJson(pair[1])}`;
    }).join(",")}}`;
  }
  if (arg.type === "array") {
    return `[${arg.value?.map((val) => toJson(val)).join(",") ?? ""}]`;
  }
  throw Error(`Invalid value type: ${arg}`);
}
function stringFromArg(arg) {
  if (!Object.hasOwn(arg, "value")) {
    return arg.type;
  }
  switch (arg.type) {
    case "string":
    case "number":
    case "boolean":
    case "bigint":
      return String(arg.value);
    case "regexp":
      return `/${arg.value.pattern}/${arg.value.flags ?? ""}`;
    case "date":
      return new Date(arg.value).toString();
    case "object":
      return `Object(${arg.value?.length ?? ""})`;
    case "array":
      return `Array(${arg.value?.length ?? ""})`;
    case "map":
      return `Map(${arg.value?.length})`;
    case "set":
      return `Set(${arg.value?.length})`;
    default:
      return arg.type;
  }
}
function getRemoteValuesText(args, formatText) {
  const arg = args[0];
  if (!arg) {
    return "";
  }
  if (arg.type === "string" && isFormatSpecifier(arg.value.toString()) && formatText) {
    return logMessageFormatter(args);
  }
  return args.map((arg2) => {
    return stringFromArg(arg2);
  }).join(" ");
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/log/LogManager.js
var _a3;
function getBidiStackTrace(cdpStackTrace) {
  const stackFrames = cdpStackTrace?.callFrames.map((callFrame) => {
    return {
      columnNumber: callFrame.columnNumber,
      functionName: callFrame.functionName,
      lineNumber: callFrame.lineNumber,
      url: callFrame.url
    };
  });
  return stackFrames ? { callFrames: stackFrames } : void 0;
}
function getLogLevel(consoleApiType) {
  if ([Log2.Level.Error, "assert"].includes(consoleApiType)) {
    return Log2.Level.Error;
  }
  if ([Log2.Level.Debug, "trace"].includes(consoleApiType)) {
    return Log2.Level.Debug;
  }
  if ([Log2.Level.Warn, "warning"].includes(consoleApiType)) {
    return Log2.Level.Warn;
  }
  return Log2.Level.Info;
}
function getLogMethod(consoleApiType) {
  switch (consoleApiType) {
    case "warning":
      return "warn";
    case "startGroup":
      return "group";
    case "startGroupCollapsed":
      return "groupCollapsed";
    case "endGroup":
      return "groupEnd";
  }
  return consoleApiType;
}
var LogManager = class {
  #eventManager;
  #realmStorage;
  #cdpTarget;
  #logger;
  constructor(cdpTarget, realmStorage, eventManager, logger) {
    this.#cdpTarget = cdpTarget;
    this.#realmStorage = realmStorage;
    this.#eventManager = eventManager;
    this.#logger = logger;
  }
  static create(cdpTarget, realmStorage, eventManager, logger) {
    const logManager = new _a3(cdpTarget, realmStorage, eventManager, logger);
    logManager.#initializeEntryAddedEventListener();
    return logManager;
  }
  /**
   * Heuristic serialization of CDP remote object. If possible, return the BiDi value
   * without deep serialization.
   */
  async #heuristicSerializeArg(arg, realm) {
    switch (arg.type) {
      // TODO: Implement regexp, array, object, map and set heuristics base on
      //  preview.
      case "undefined":
        return { type: "undefined" };
      case "boolean":
        return { type: "boolean", value: arg.value };
      case "string":
        return { type: "string", value: arg.value };
      case "number":
        return { type: "number", value: arg.unserializableValue ?? arg.value };
      case "bigint":
        if (arg.unserializableValue !== void 0 && arg.unserializableValue[arg.unserializableValue.length - 1] === "n") {
          return {
            type: arg.type,
            value: arg.unserializableValue.slice(0, -1)
          };
        }
        break;
      case "object":
        if (arg.subtype === "null") {
          return { type: "null" };
        }
        break;
      default:
        break;
    }
    return await realm.serializeCdpObject(arg, Script2.ResultOwnership.None);
  }
  #initializeEntryAddedEventListener() {
    this.#cdpTarget.cdpClient.on("Runtime.consoleAPICalled", (params) => {
      const realm = this.#realmStorage.findRealm({
        cdpSessionId: this.#cdpTarget.cdpSessionId,
        executionContextId: params.executionContextId
      });
      if (realm === void 0) {
        this.#logger?.(LogType.cdp)?.(params);
        return;
      }
      let argsPromise;
      const getArgsPromise = () => {
        argsPromise ??= Promise.all(params.args.map((arg) => this.#heuristicSerializeArg(arg, realm)));
        return argsPromise;
      };
      for (const browsingContext of realm.associatedBrowsingContexts) {
        this.#eventManager.registerPromiseEvent(() => getArgsPromise().then((args) => ({
          kind: "success",
          value: {
            type: "event",
            method: chromium_bidi_exports.Log.EventNames.LogEntryAdded,
            params: {
              level: getLogLevel(params.type),
              source: realm.source,
              text: getRemoteValuesText(args, true),
              timestamp: Math.round(params.timestamp),
              stackTrace: getBidiStackTrace(params.stackTrace),
              type: "console",
              method: getLogMethod(params.type),
              args
            }
          }
        }), (error) => ({
          kind: "error",
          error
        })), browsingContext.id, chromium_bidi_exports.Log.EventNames.LogEntryAdded);
      }
    });
    this.#cdpTarget.cdpClient.on("Runtime.exceptionThrown", (params) => {
      const realm = this.#realmStorage.findRealm({
        cdpSessionId: this.#cdpTarget.cdpSessionId,
        executionContextId: params.exceptionDetails.executionContextId
      });
      if (realm === void 0) {
        this.#logger?.(LogType.cdp)?.(params);
        return;
      }
      for (const browsingContext of realm.associatedBrowsingContexts) {
        this.#eventManager.registerPromiseEvent(_a3.#getExceptionText(params, realm).then((text) => ({
          kind: "success",
          value: {
            type: "event",
            method: chromium_bidi_exports.Log.EventNames.LogEntryAdded,
            params: {
              level: Log2.Level.Error,
              source: realm.source,
              text,
              timestamp: Math.round(params.timestamp),
              stackTrace: getBidiStackTrace(params.exceptionDetails.stackTrace),
              type: "javascript"
            }
          }
        }), (error) => ({
          kind: "error",
          error
        })), browsingContext.id, chromium_bidi_exports.Log.EventNames.LogEntryAdded);
      }
    });
  }
  /**
   * Try the best to get the exception text.
   */
  static async #getExceptionText(params, realm) {
    if (!params.exceptionDetails.exception) {
      return params.exceptionDetails.text;
    }
    if (realm === void 0) {
      return JSON.stringify(params.exceptionDetails.exception);
    }
    return await realm.stringifyObject(params.exceptionDetails.exception);
  }
};
_a3 = LogManager;

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/network/CollectorsStorage.js
var CollectorsStorage = class {
  #collectors = /* @__PURE__ */ new Map();
  #responseCollectors = /* @__PURE__ */ new Map();
  #requestBodyCollectors = /* @__PURE__ */ new Map();
  #maxEncodedDataSize;
  #logger;
  constructor(maxEncodedDataSize, logger) {
    this.#maxEncodedDataSize = maxEncodedDataSize;
    this.#logger = logger;
  }
  addDataCollector(params) {
    if (params.maxEncodedDataSize < 1 || params.maxEncodedDataSize > this.#maxEncodedDataSize) {
      throw new InvalidArgumentException(`Max encoded data size should be between 1 and ${this.#maxEncodedDataSize}`);
    }
    const collectorId = uuidv4();
    this.#collectors.set(collectorId, params);
    return collectorId;
  }
  isCollected(requestId, dataType, collectorId) {
    if (collectorId !== void 0 && !this.#collectors.has(collectorId)) {
      throw new NoSuchNetworkCollectorException(`Unknown collector ${collectorId}`);
    }
    if (dataType === void 0) {
      return this.isCollected(requestId, Network2.DataType.Response, collectorId) || this.isCollected(requestId, Network2.DataType.Request, collectorId);
    }
    const requestToCollectorsMap = this.#getRequestToCollectorMap(dataType).get(requestId);
    if (requestToCollectorsMap === void 0 || requestToCollectorsMap.size === 0) {
      return false;
    }
    if (collectorId === void 0) {
      return true;
    }
    if (!requestToCollectorsMap.has(collectorId)) {
      return false;
    }
    return true;
  }
  #getRequestToCollectorMap(dataType) {
    switch (dataType) {
      case Network2.DataType.Response:
        return this.#responseCollectors;
      case Network2.DataType.Request:
        return this.#requestBodyCollectors;
      default:
        throw new UnsupportedOperationException(`Unsupported data type ${dataType}`);
    }
  }
  disownData(requestId, dataType, collectorId) {
    const requestToCollectorsMap = this.#getRequestToCollectorMap(dataType);
    if (collectorId !== void 0) {
      requestToCollectorsMap.get(requestId)?.delete(collectorId);
    }
    if (collectorId === void 0 || requestToCollectorsMap.get(requestId)?.size === 0) {
      requestToCollectorsMap.delete(requestId);
    }
  }
  #shouldCollectRequest(collectorId, request, dataType, topLevelBrowsingContext, userContext) {
    const collector = this.#collectors.get(collectorId);
    if (collector === void 0) {
      throw new NoSuchNetworkCollectorException(`Unknown collector ${collectorId}`);
    }
    if (collector.userContexts && !collector.userContexts.includes(userContext)) {
      return false;
    }
    if (collector.contexts && !collector.contexts.includes(topLevelBrowsingContext)) {
      return false;
    }
    if (!collector.dataTypes.includes(dataType)) {
      return false;
    }
    if (dataType === Network2.DataType.Request && request.bodySize > collector.maxEncodedDataSize) {
      this.#logger?.(LogType.debug)?.(`Request's ${request.id} body size is too big for the collector ${collectorId}`);
      return false;
    }
    if (dataType === Network2.DataType.Response && request.encodedResponseBodySize > collector.maxEncodedDataSize) {
      this.#logger?.(LogType.debug)?.(`Request's ${request.id} response is too big for the collector ${collectorId}`);
      return false;
    }
    this.#logger?.(LogType.debug)?.(`Collector ${collectorId} collected ${dataType} of ${request.id}`);
    return true;
  }
  collectIfNeeded(request, dataType, topLevelBrowsingContext, userContext) {
    const collectorIds = [...this.#collectors.keys()].filter((collectorId) => this.#shouldCollectRequest(collectorId, request, dataType, topLevelBrowsingContext, userContext));
    if (collectorIds.length > 0) {
      this.#getRequestToCollectorMap(dataType).set(request.id, new Set(collectorIds));
    }
  }
  removeDataCollector(collectorId) {
    if (!this.#collectors.has(collectorId)) {
      throw new NoSuchNetworkCollectorException(`Collector ${collectorId} does not exist`);
    }
    this.#collectors.delete(collectorId);
    const affectedRequests = [];
    for (const [requestId, collectorIds] of this.#responseCollectors) {
      if (collectorIds.has(collectorId)) {
        collectorIds.delete(collectorId);
        if (collectorIds.size === 0) {
          this.#responseCollectors.delete(requestId);
          affectedRequests.push(requestId);
        }
      }
    }
    for (const [requestId, collectorIds] of this.#requestBodyCollectors) {
      if (collectorIds.has(collectorId)) {
        collectorIds.delete(collectorId);
        if (collectorIds.size === 0) {
          this.#requestBodyCollectors.delete(requestId);
          affectedRequests.push(requestId);
        }
      }
    }
    return affectedRequests;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/utils/DefaultMap.js
var DefaultMap = class extends Map {
  /** The default value to return whenever a key is not present in the map. */
  #getDefaultValue;
  constructor(getDefaultValue, entries) {
    super(entries);
    this.#getDefaultValue = getDefaultValue;
  }
  get(key) {
    if (!this.has(key)) {
      this.set(key, this.#getDefaultValue(key));
    }
    return super.get(key);
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/network/NetworkRequest.js
var _a4;
var REALM_REGEX = /(?<=realm=").*(?=")/;
var NetworkRequest = class {
  static unknownParameter = "UNKNOWN";
  /**
   * Each network request has an associated request id, which is a string
   * uniquely identifying that request.
   *
   * The identifier for a request resulting from a redirect matches that of the
   * request that initiated it.
   */
  #id;
  #fetchId;
  /**
   * Indicates the network intercept phase, if the request is currently blocked.
   * Undefined necessarily implies that the request is not blocked.
   */
  #interceptPhase;
  #servedFromCache = false;
  #redirectCount;
  #bodySize = 0;
  // Tracked encoded data size while the response is loading.
  #encodedResponseBodySize = 0;
  // Tracked decoded data size while the response is loading.
  #decodedResponseBodySize = 0;
  #request = {};
  #requestOverrides;
  #responseOverrides;
  #response = {};
  #eventManager;
  #networkStorage;
  #cdpTarget;
  #logger;
  #emittedEvents = {
    [chromium_bidi_exports.Network.EventNames.AuthRequired]: false,
    [chromium_bidi_exports.Network.EventNames.BeforeRequestSent]: false,
    [chromium_bidi_exports.Network.EventNames.FetchError]: false,
    [chromium_bidi_exports.Network.EventNames.ResponseCompleted]: false,
    [chromium_bidi_exports.Network.EventNames.ResponseStarted]: false
  };
  waitNextPhase = new Deferred2();
  constructor(id, eventManager, networkStorage, cdpTarget, redirectCount = 0, logger) {
    this.#id = id;
    this.#eventManager = eventManager;
    this.#networkStorage = networkStorage;
    this.#cdpTarget = cdpTarget;
    this.#redirectCount = redirectCount;
    this.#logger = logger;
  }
  get id() {
    return this.#id;
  }
  get fetchId() {
    return this.#fetchId;
  }
  /**
   * When blocked returns the phase for it
   */
  get interceptPhase() {
    return this.#interceptPhase;
  }
  get url() {
    const fragment = this.#request.info?.request.urlFragment ?? this.#request.paused?.request.urlFragment ?? "";
    const url = this.#response.paused?.request.url ?? this.#requestOverrides?.url ?? this.#response.info?.url ?? this.#request.auth?.request.url ?? this.#request.info?.request.url ?? this.#request.paused?.request.url ?? _a4.unknownParameter;
    return `${url}${fragment}`;
  }
  get redirectCount() {
    return this.#redirectCount;
  }
  get cdpTarget() {
    return this.#cdpTarget;
  }
  /** CdpTarget can be changed when frame is moving out of process. */
  updateCdpTarget(cdpTarget) {
    if (cdpTarget !== this.#cdpTarget) {
      this.#logger?.(LogType.debugInfo)?.(`Request ${this.id} was moved from ${this.#cdpTarget.id} to ${cdpTarget.id}`);
      this.#cdpTarget = cdpTarget;
    }
  }
  get cdpClient() {
    return this.#cdpTarget.cdpClient;
  }
  isRedirecting() {
    return Boolean(this.#request.info);
  }
  #isDataUrl() {
    return this.url.startsWith("data:");
  }
  #isNonInterceptable() {
    return (
      // We can't intercept data urls from CDP
      this.#isDataUrl() || // Cached requests never hit the network
      this.#servedFromCache
    );
  }
  get #method() {
    return this.#requestOverrides?.method ?? this.#request.info?.request.method ?? this.#request.paused?.request.method ?? this.#request.auth?.request.method ?? this.#response.paused?.request.method;
  }
  get #navigationId() {
    if (!this.#request.info || !this.#request.info.loaderId || // When we navigate all CDP network events have `loaderId`
    // CDP's `loaderId` and `requestId` match when
    // that request triggered the loading
    this.#request.info.loaderId !== this.#request.info.requestId) {
      return null;
    }
    return this.#networkStorage.getNavigationId(this.#context ?? void 0);
  }
  get #cookies() {
    let cookies = [];
    if (this.#request.extraInfo) {
      cookies = this.#request.extraInfo.associatedCookies.filter(({ blockedReasons }) => {
        return !Array.isArray(blockedReasons) || blockedReasons.length === 0;
      }).map(({ cookie }) => cdpToBiDiCookie(cookie));
    }
    return cookies;
  }
  #getBodySizeFromHeaders(headers) {
    if (headers === void 0) {
      return void 0;
    }
    if (headers["Content-Length"] !== void 0) {
      const bodySize = Number.parseInt(headers["Content-Length"]);
      if (Number.isInteger(bodySize)) {
        return bodySize;
      }
      this.#logger?.(LogType.debugError)?.("Unexpected non-integer 'Content-Length' header");
    }
    return void 0;
  }
  #updateBodySize() {
    if (typeof this.#requestOverrides?.bodySize === "number") {
      this.#bodySize = this.#requestOverrides.bodySize;
      return;
    }
    if (this.#request.info?.request.postDataEntries !== void 0) {
      this.#bodySize = bidiBodySizeFromCdpPostDataEntries(this.#request.info?.request.postDataEntries);
      return;
    }
    this.#bodySize = this.#getBodySizeFromHeaders(this.#request.info?.request.headers) ?? this.#getBodySizeFromHeaders(this.#request.extraInfo?.headers) ?? 0;
  }
  get bodySize() {
    return this.#bodySize;
  }
  get #context() {
    const result = this.#response.paused?.frameId ?? this.#request.info?.frameId ?? this.#request.paused?.frameId ?? this.#request.auth?.frameId;
    if (result !== void 0) {
      return result;
    }
    if (this.#request?.info?.initiator.type === "preflight" && this.#request?.info?.initiator.requestId !== void 0) {
      const maybeInitiator = this.#networkStorage.getRequestById(this.#request?.info?.initiator.requestId);
      if (maybeInitiator !== void 0) {
        return maybeInitiator.#request.info?.frameId ?? null;
      }
    }
    return null;
  }
  /** Returns the HTTP status code associated with this request if any. */
  get #statusCode() {
    return this.#responseOverrides?.statusCode ?? this.#response.paused?.responseStatusCode ?? this.#response.extraInfo?.statusCode ?? this.#response.info?.status;
  }
  get #requestHeaders() {
    let headers = [];
    if (this.#requestOverrides?.headers) {
      const headerMap = new DefaultMap(() => []);
      for (const header of this.#requestOverrides.headers) {
        headerMap.get(header.name).push(header.value.value);
      }
      for (const [name, value] of headerMap.entries()) {
        headers.push({
          name,
          value: {
            type: "string",
            value: value.join("\n").trimEnd()
          }
        });
      }
    } else {
      headers = bidiNetworkHeadersFromCdpNetworkHeaders({
        ...this.#request.info?.request.headers,
        // `Network.requestWillBeSentExtraInfo` is not emitted while paused in
        // `beforeRequestSent`, so include headers from `Fetch.requestPaused`.
        ...this.#request.paused?.request.headers,
        ...this.#request.extraInfo?.headers
      });
    }
    return headers;
  }
  get #authChallenges() {
    if (!this.#response.info) {
      return;
    }
    if (!(this.#statusCode === 401 || this.#statusCode === 407)) {
      return void 0;
    }
    const headerName = this.#statusCode === 401 ? "WWW-Authenticate" : "Proxy-Authenticate";
    const authChallenges = [];
    for (const [header, value] of Object.entries(this.#response.info.headers)) {
      if (header.localeCompare(headerName, void 0, { sensitivity: "base" }) === 0) {
        authChallenges.push({
          scheme: value.split(" ").at(0) ?? "",
          realm: value.match(REALM_REGEX)?.at(0) ?? ""
        });
      }
    }
    return authChallenges;
  }
  get #timings() {
    const responseTimeOffset = getTiming(getTiming(this.#response.info?.timing?.requestTime) - getTiming(this.#request.info?.timestamp));
    return {
      // TODO: Verify this is correct
      timeOrigin: Math.round(getTiming(this.#request.info?.wallTime) * 1e3),
      // Timing baseline.
      // TODO: Verify this is correct.
      requestTime: 0,
      // TODO: set if redirect detected.
      redirectStart: 0,
      // TODO: set if redirect detected.
      redirectEnd: 0,
      // TODO: Verify this is correct
      // https://source.chromium.org/chromium/chromium/src/+/main:net/base/load_timing_info.h;l=145
      fetchStart: getTiming(this.#response.info?.timing?.workerFetchStart, responseTimeOffset),
      // fetchStart: 0,
      dnsStart: getTiming(this.#response.info?.timing?.dnsStart, responseTimeOffset),
      dnsEnd: getTiming(this.#response.info?.timing?.dnsEnd, responseTimeOffset),
      connectStart: getTiming(this.#response.info?.timing?.connectStart, responseTimeOffset),
      connectEnd: getTiming(this.#response.info?.timing?.connectEnd, responseTimeOffset),
      tlsStart: getTiming(this.#response.info?.timing?.sslStart, responseTimeOffset),
      requestStart: getTiming(this.#response.info?.timing?.sendStart, responseTimeOffset),
      // https://source.chromium.org/chromium/chromium/src/+/main:net/base/load_timing_info.h;l=196
      responseStart: getTiming(this.#response.info?.timing?.receiveHeadersStart, responseTimeOffset),
      responseEnd: getTiming(this.#response.info?.timing?.receiveHeadersEnd, responseTimeOffset)
    };
  }
  #phaseChanged() {
    this.waitNextPhase.resolve();
    this.waitNextPhase = new Deferred2();
  }
  #interceptsInPhase(phase) {
    if (this.#isNonInterceptable() || !this.#cdpTarget.isSubscribedTo(`network.${phase}`)) {
      return /* @__PURE__ */ new Set();
    }
    return this.#networkStorage.getInterceptsForPhase(this, phase);
  }
  #isBlockedInPhase(phase) {
    return this.#interceptsInPhase(phase).size > 0;
  }
  handleRedirect(event) {
    this.#response.hasExtraInfo = false;
    this.#decodedResponseBodySize = 0;
    this.#encodedResponseBodySize = 0;
    this.#response.info = event.redirectResponse;
    this.#emitEventsIfReady({
      wasRedirected: true
    });
  }
  #emitEventsIfReady(options = {}) {
    const requestExtraInfoCompleted = (
      // Flush redirects
      options.wasRedirected || Boolean(this.#response.loadingFailed) || this.#isDataUrl() || Boolean(this.#request.extraInfo) || // If the request is intercepted during the `authRequired` phase, there
      // will be no `Network.requestWillBeSentExtraInfo` CDP events.
      this.#isBlockedInPhase(Network2.InterceptPhase.AuthRequired) || // Requests from cache don't have extra info
      this.#servedFromCache || // Sometimes there is no extra info and the response
      // is the only place we can find out
      Boolean(this.#response.info && !this.#response.hasExtraInfo)
    );
    const noInterceptionExpected = this.#isNonInterceptable();
    const requestInterceptionExpected = !noInterceptionExpected && this.#isBlockedInPhase(Network2.InterceptPhase.BeforeRequestSent);
    const requestInterceptionCompleted = !requestInterceptionExpected || requestInterceptionExpected && Boolean(this.#request.paused);
    if (Boolean(this.#request.info) && (requestInterceptionExpected ? requestInterceptionCompleted : requestExtraInfoCompleted)) {
      this.#emitEvent(this.#getBeforeRequestEvent.bind(this));
    }
    const responseExtraInfoCompleted = Boolean(this.#response.extraInfo) || // Response from cache don't have extra info
    this.#servedFromCache || // Don't expect extra info if the flag is false
    Boolean(this.#response.info && !this.#response.hasExtraInfo);
    const responseInterceptionExpected = !noInterceptionExpected && this.#isBlockedInPhase(Network2.InterceptPhase.ResponseStarted);
    if (this.#response.info || responseInterceptionExpected && Boolean(this.#response.paused)) {
      this.#emitEvent(this.#getResponseStartedEvent.bind(this));
    }
    const responseInterceptionCompleted = !responseInterceptionExpected || responseInterceptionExpected && Boolean(this.#response.paused);
    const loadingFinished = Boolean(this.#response.loadingFailed) || Boolean(this.#response.loadingFinished);
    if (Boolean(this.#response.info) && responseExtraInfoCompleted && responseInterceptionCompleted && (loadingFinished || options.wasRedirected)) {
      this.#emitEvent(this.#getResponseReceivedEvent.bind(this));
      this.#networkStorage.disposeRequest(this.id);
    }
  }
  onRequestWillBeSentEvent(event) {
    this.#request.info = event;
    this.#updateBodySize();
    this.#networkStorage.collectIfNeeded(this, Network2.DataType.Request);
    this.#emitEventsIfReady();
  }
  onRequestWillBeSentExtraInfoEvent(event) {
    this.#request.extraInfo = event;
    this.#updateBodySize();
    this.#emitEventsIfReady();
  }
  onResponseReceivedExtraInfoEvent(event) {
    if (event.statusCode >= 300 && event.statusCode <= 399 && this.#request.info && event.headers["location"] === this.#request.info.request.url) {
      return;
    }
    this.#response.extraInfo = event;
    this.#emitEventsIfReady();
  }
  onResponseReceivedEvent(event) {
    this.#response.hasExtraInfo = event.hasExtraInfo;
    this.#response.info = event.response;
    this.#encodedResponseBodySize = event.response.encodedDataLength;
    this.#networkStorage.collectIfNeeded(this, Network2.DataType.Response);
    this.#emitEventsIfReady();
  }
  onServedFromCache() {
    this.#servedFromCache = true;
    this.#emitEventsIfReady();
  }
  onLoadingFinishedEvent(event) {
    this.#response.loadingFinished = event;
    this.#encodedResponseBodySize = event.encodedDataLength;
    this.#emitEventsIfReady();
  }
  onDataReceivedEvent(event) {
    this.#decodedResponseBodySize += event.dataLength;
    this.#encodedResponseBodySize += event.encodedDataLength;
  }
  onLoadingFailedEvent(event) {
    this.#response.loadingFailed = event;
    this.#emitEventsIfReady();
    this.#emitEvent(() => {
      return {
        method: chromium_bidi_exports.Network.EventNames.FetchError,
        params: {
          ...this.#getBaseEventParams(),
          errorText: event.errorText
        }
      };
    });
    this.disposeData();
  }
  /** @see https://chromedevtools.github.io/devtools-protocol/tot/Fetch/#method-failRequest */
  async failRequest(errorReason) {
    assert2(this.#fetchId, "Network Interception not set-up.");
    await this.cdpClient.sendCommand("Fetch.failRequest", {
      requestId: this.#fetchId,
      errorReason
    });
    this.#interceptPhase = void 0;
  }
  onRequestPaused(event) {
    this.#fetchId = event.requestId;
    if (event.responseStatusCode || event.responseErrorReason) {
      this.#response.paused = event;
      if (this.#isBlockedInPhase(Network2.InterceptPhase.ResponseStarted) && // CDP may emit multiple events for a single request
      !this.#emittedEvents[chromium_bidi_exports.Network.EventNames.ResponseStarted] && // Continue all response that have not enabled Network domain
      this.#fetchId !== this.id) {
        this.#interceptPhase = Network2.InterceptPhase.ResponseStarted;
      } else {
        void this.#continueResponse();
      }
    } else {
      this.#request.paused = event;
      if (this.#isBlockedInPhase(Network2.InterceptPhase.BeforeRequestSent) && // CDP may emit multiple events for a single request
      !this.#emittedEvents[chromium_bidi_exports.Network.EventNames.BeforeRequestSent] && // Continue all requests that have not enabled Network domain
      this.#fetchId !== this.id) {
        this.#interceptPhase = Network2.InterceptPhase.BeforeRequestSent;
      } else {
        void this.#continueRequest();
      }
    }
    this.#emitEventsIfReady();
  }
  onAuthRequired(event) {
    this.#fetchId = event.requestId;
    this.#request.auth = event;
    if (this.#isBlockedInPhase(Network2.InterceptPhase.AuthRequired) && // Continue all auth requests that have not enabled Network domain
    this.#fetchId !== this.id) {
      this.#interceptPhase = Network2.InterceptPhase.AuthRequired;
      this.#emitEventsIfReady();
    } else {
      void this.#continueWithAuth({
        response: "Default"
      });
    }
    this.#emitEvent(() => {
      return {
        method: chromium_bidi_exports.Network.EventNames.AuthRequired,
        params: {
          ...this.#getBaseEventParams(Network2.InterceptPhase.AuthRequired),
          response: this.#getResponseEventParams()
        }
      };
    });
  }
  /** @see https://chromedevtools.github.io/devtools-protocol/tot/Fetch/#method-continueRequest */
  async continueRequest(overrides = {}) {
    const overrideHeaders = this.#getOverrideHeader(overrides.headers, overrides.cookies);
    const headers = cdpFetchHeadersFromBidiNetworkHeaders(overrideHeaders);
    const postData = getCdpBodyFromBiDiBytesValue(overrides.body);
    await this.#continueRequest({
      url: overrides.url,
      method: overrides.method,
      headers,
      postData
    });
    this.#requestOverrides = {
      url: overrides.url,
      method: overrides.method,
      headers: overrides.headers,
      cookies: overrides.cookies,
      bodySize: getSizeFromBiDiBytesValue(overrides.body)
    };
  }
  async #continueRequest(overrides = {}) {
    assert2(this.#fetchId, "Network Interception not set-up.");
    await this.cdpClient.sendCommand("Fetch.continueRequest", {
      requestId: this.#fetchId,
      url: overrides.url,
      method: overrides.method,
      headers: overrides.headers,
      postData: overrides.postData
    });
    this.#interceptPhase = void 0;
  }
  /** @see https://chromedevtools.github.io/devtools-protocol/tot/Fetch/#method-continueResponse */
  async continueResponse(overrides = {}) {
    if (this.interceptPhase === Network2.InterceptPhase.AuthRequired) {
      if (overrides.credentials) {
        await Promise.all([
          this.waitNextPhase,
          await this.#continueWithAuth({
            response: "ProvideCredentials",
            username: overrides.credentials.username,
            password: overrides.credentials.password
          })
        ]);
      } else {
        return await this.#continueWithAuth({
          response: "ProvideCredentials"
        });
      }
    }
    if (this.#interceptPhase === Network2.InterceptPhase.ResponseStarted) {
      const overrideHeaders = this.#getOverrideHeader(overrides.headers, overrides.cookies);
      const responseHeaders = cdpFetchHeadersFromBidiNetworkHeaders(overrideHeaders);
      await this.#continueResponse({
        responseCode: overrides.statusCode ?? this.#response.paused?.responseStatusCode,
        responsePhrase: overrides.reasonPhrase ?? this.#response.paused?.responseStatusText,
        responseHeaders: responseHeaders ?? this.#response.paused?.responseHeaders
      });
      this.#responseOverrides = {
        statusCode: overrides.statusCode,
        headers: overrideHeaders
      };
    }
  }
  async #continueResponse({ responseCode, responsePhrase, responseHeaders } = {}) {
    assert2(this.#fetchId, "Network Interception not set-up.");
    await this.cdpClient.sendCommand("Fetch.continueResponse", {
      requestId: this.#fetchId,
      responseCode,
      responsePhrase,
      responseHeaders
    });
    this.#interceptPhase = void 0;
  }
  /** @see https://chromedevtools.github.io/devtools-protocol/tot/Fetch/#method-continueWithAuth */
  async continueWithAuth(authChallenge) {
    let username;
    let password;
    if (authChallenge.action === "provideCredentials") {
      const { credentials } = authChallenge;
      username = credentials.username;
      password = credentials.password;
    }
    const response = cdpAuthChallengeResponseFromBidiAuthContinueWithAuthAction(authChallenge.action);
    await this.#continueWithAuth({
      response,
      username,
      password
    });
  }
  /** @see https://chromedevtools.github.io/devtools-protocol/tot/Fetch/#method-provideResponse */
  async provideResponse(overrides) {
    assert2(this.#fetchId, "Network Interception not set-up.");
    if (this.interceptPhase === Network2.InterceptPhase.AuthRequired) {
      return await this.#continueWithAuth({
        response: "ProvideCredentials"
      });
    }
    if (!overrides.body && !overrides.headers) {
      return await this.#continueRequest();
    }
    const overrideHeaders = this.#getOverrideHeader(overrides.headers, overrides.cookies);
    const responseHeaders = cdpFetchHeadersFromBidiNetworkHeaders(overrideHeaders);
    const responseCode = overrides.statusCode ?? this.#statusCode ?? 200;
    await this.cdpClient.sendCommand("Fetch.fulfillRequest", {
      requestId: this.#fetchId,
      responseCode,
      responsePhrase: overrides.reasonPhrase,
      responseHeaders,
      body: getCdpBodyFromBiDiBytesValue(overrides.body)
    });
    this.#interceptPhase = void 0;
  }
  dispose() {
    this.waitNextPhase.reject(new Error("waitNextPhase disposed"));
  }
  disposeData() {
    this.#request = {};
    this.#response = {};
    this.#requestOverrides = void 0;
    this.#responseOverrides = void 0;
  }
  async #continueWithAuth(authChallengeResponse) {
    assert2(this.#fetchId, "Network Interception not set-up.");
    await this.cdpClient.sendCommand("Fetch.continueWithAuth", {
      requestId: this.#fetchId,
      authChallengeResponse
    });
    this.#interceptPhase = void 0;
  }
  #emitEvent(getEvent) {
    let event;
    try {
      event = getEvent();
    } catch (error) {
      this.#logger?.(LogType.debugError)?.(error);
      return;
    }
    if (this.#isIgnoredEvent() || this.#emittedEvents[event.method] && // Special case this event can be emitted multiple times
    event.method !== chromium_bidi_exports.Network.EventNames.AuthRequired) {
      return;
    }
    this.#phaseChanged();
    this.#emittedEvents[event.method] = true;
    if (this.#context) {
      this.#eventManager.registerPromiseEvent(this.#resolveEvent(event), this.#context, event.method);
    } else {
      this.#eventManager.registerGlobalPromiseEvent(this.#resolveEvent(event), event.method);
    }
  }
  /**
   * Resolves a deferred event after asynchronously gathering any missing event
   * data, while preserving the event's position in the outgoing queue.
   */
  async #resolveEvent(event) {
    if (!this.#request.extraInfo && this.#request.paused) {
      event.params.request.cookies = await this.#fetchPausedRequestCookies(this.#request.paused);
    }
    return {
      kind: "success",
      value: Object.assign(event, {
        type: "event"
      })
    };
  }
  /** Queries CDP for cookies matching the paused request's `Cookie` header. */
  async #fetchPausedRequestCookies(event) {
    const cookieHeader = Object.entries(event.request.headers).find(([name]) => name.toLowerCase() === "cookie")?.[1];
    if (!cookieHeader) {
      return [];
    }
    const cookiePairs = new Set(cookieHeader.split(";").map((pair) => pair.trim()));
    try {
      const result = await this.cdpClient.sendCommand("Network.getCookies", {
        urls: [event.request.url]
      });
      return (result?.cookies ?? []).filter((cookie) => cookiePairs.has(cookie.name === "" ? cookie.value : `${cookie.name}=${cookie.value}`)).map((cookie) => cdpToBiDiCookie(cookie));
    } catch {
      return [];
    }
  }
  #getBaseEventParams(phase) {
    const interceptProps = {
      isBlocked: false
    };
    if (phase) {
      const blockedBy = this.#interceptsInPhase(phase);
      interceptProps.isBlocked = blockedBy.size > 0;
      if (interceptProps.isBlocked) {
        interceptProps.intercepts = [...blockedBy];
      }
    }
    return {
      context: this.#context,
      navigation: this.#navigationId,
      redirectCount: this.#redirectCount,
      request: this.#getRequestData(),
      // Timestamp should be in milliseconds, while CDP provides it in seconds.
      timestamp: Math.round(getTiming(this.#request.info?.wallTime) * 1e3),
      userContext: this.#cdpTarget.userContext,
      // Contains isBlocked and intercepts
      ...interceptProps
    };
  }
  #getResponseEventParams() {
    if (this.#response.info?.fromDiskCache) {
      this.#response.extraInfo = void 0;
    }
    const cdpHeaders = this.#response.info?.headers ?? {};
    const cdpRawHeaders = this.#response.extraInfo?.headers ?? {};
    for (const [key, value] of Object.entries(cdpRawHeaders)) {
      cdpHeaders[key] = value;
    }
    const headers = bidiNetworkHeadersFromCdpNetworkHeaders(cdpHeaders);
    const authChallenges = this.#authChallenges;
    const response = {
      url: this.url,
      protocol: this.#response.info?.protocol ?? "",
      status: this.#statusCode ?? -1,
      // TODO: Throw an exception or use some other status code?
      statusText: this.#response.info?.statusText || this.#response.paused?.responseStatusText || "",
      fromCache: this.#response.info?.fromDiskCache || this.#response.info?.fromPrefetchCache || this.#servedFromCache,
      headers: this.#responseOverrides?.headers ?? headers,
      mimeType: this.#response.info?.mimeType || "",
      // TODO: this should be the size for the entire HTTP response.
      bytesReceived: this.encodedResponseBodySize,
      headersSize: computeHeadersSize(headers),
      bodySize: this.encodedResponseBodySize,
      content: {
        size: this.#decodedResponseBodySize
      },
      ...authChallenges ? { authChallenges } : {}
    };
    return {
      ...response,
      "goog:securityDetails": this.#response.info?.securityDetails
    };
  }
  get encodedResponseBodySize() {
    return this.#encodedResponseBodySize;
  }
  get decodedResponseBodySize() {
    return this.#decodedResponseBodySize;
  }
  #getRequestData() {
    const headers = this.#requestHeaders;
    const request = {
      request: this.#id,
      url: this.url,
      method: this.#method ?? _a4.unknownParameter,
      headers,
      cookies: this.#cookies,
      headersSize: computeHeadersSize(headers),
      bodySize: this.bodySize,
      // TODO: populate
      destination: this.#getDestination(),
      // TODO: populate
      initiatorType: this.#getInitiatorType(),
      timings: this.#timings
    };
    return {
      ...request,
      "goog:postData": this.#request.info?.request?.postData,
      "goog:hasPostData": this.#request.info?.request?.hasPostData,
      "goog:resourceType": this.#request.info?.type,
      "goog:resourceInitiator": this.#request.info?.initiator
    };
  }
  /**
   * Heuristic trying to guess the destination.
   * Specification: https://fetch.spec.whatwg.org/#concept-request-destination.
   * Specified values: "audio", "audioworklet", "document", "embed", "font", "frame",
   * "iframe", "image", "json", "manifest", "object", "paintworklet", "report", "script",
   * "serviceworker", "sharedworker", "style", "track", "video", "webidentity", "worker",
   * "xslt".
   */
  #getDestination() {
    switch (this.#request.info?.type) {
      case "Script":
        return "script";
      case "Stylesheet":
        return "style";
      case "Image":
        return "image";
      case "Document":
        return this.#request.info?.initiator.type === "parser" ? "iframe" : "document";
      default:
        return "";
    }
  }
  /**
   * Heuristic trying to guess the initiator type.
   * Specification: https://fetch.spec.whatwg.org/#request-initiator-type.
   * Specified values: "audio", "beacon", "body", "css", "early-hints", "embed", "fetch",
   * "font", "frame", "iframe", "image", "img", "input", "link", "object", "ping",
   * "script", "track", "video", "xmlhttprequest", "other".
   */
  #getInitiatorType() {
    if (this.#request.info?.initiator.type === "parser") {
      switch (this.#request.info?.type) {
        case "Document":
          return "iframe";
        case "Font":
          return this.#request.info?.initiator?.url === this.#request.info?.documentURL ? "font" : "css";
        case "Image":
          return this.#request.info?.initiator?.url === this.#request.info?.documentURL ? "img" : "css";
        case "Script":
          return "script";
        case "Stylesheet":
          return "link";
        default:
          return null;
      }
    }
    if (this.#request?.info?.type === "Fetch") {
      return "fetch";
    }
    return null;
  }
  #getBeforeRequestEvent() {
    assert2(this.#request.info, "RequestWillBeSentEvent is not set");
    return {
      method: chromium_bidi_exports.Network.EventNames.BeforeRequestSent,
      params: {
        ...this.#getBaseEventParams(Network2.InterceptPhase.BeforeRequestSent),
        initiator: {
          type: _a4.#getInitiator(this.#request.info.initiator.type),
          columnNumber: this.#request.info.initiator.columnNumber,
          lineNumber: this.#request.info.initiator.lineNumber,
          stackTrace: this.#request.info.initiator.stack,
          request: this.#request.info.initiator.requestId
        }
      }
    };
  }
  #getResponseStartedEvent() {
    return {
      method: chromium_bidi_exports.Network.EventNames.ResponseStarted,
      params: {
        ...this.#getBaseEventParams(Network2.InterceptPhase.ResponseStarted),
        response: this.#getResponseEventParams()
      }
    };
  }
  #getResponseReceivedEvent() {
    return {
      method: chromium_bidi_exports.Network.EventNames.ResponseCompleted,
      params: {
        ...this.#getBaseEventParams(),
        response: this.#getResponseEventParams()
      }
    };
  }
  #isIgnoredEvent() {
    const faviconUrl = "/favicon.ico";
    return this.#request.paused?.request.url.endsWith(faviconUrl) ?? this.#request.info?.request.url.endsWith(faviconUrl) ?? false;
  }
  #getOverrideHeader(headers, cookies) {
    if (!headers && !cookies) {
      return void 0;
    }
    let overrideHeaders = headers;
    const cookieHeader = networkHeaderFromCookieHeaders(cookies);
    if (cookieHeader && !overrideHeaders) {
      overrideHeaders = this.#requestHeaders;
    }
    if (cookieHeader && overrideHeaders) {
      overrideHeaders.filter((header) => header.name.localeCompare("cookie", void 0, {
        sensitivity: "base"
      }) !== 0);
      overrideHeaders.push(cookieHeader);
    }
    return overrideHeaders;
  }
  static #getInitiator(initiatorType) {
    switch (initiatorType) {
      case "parser":
      case "script":
      case "preflight":
        return initiatorType;
      default:
        return "other";
    }
  }
};
_a4 = NetworkRequest;
function getCdpBodyFromBiDiBytesValue(body) {
  let parsedBody;
  if (body?.type === "string") {
    parsedBody = stringToBase642(body.value);
  } else if (body?.type === "base64") {
    parsedBody = body.value;
  }
  return parsedBody;
}
function getSizeFromBiDiBytesValue(body) {
  if (body?.type === "string") {
    return body.value.length;
  } else if (body?.type === "base64") {
    return atob(body.value).length;
  }
  return 0;
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/network/NetworkStorage.js
var MAX_TOTAL_COLLECTED_SIZE = 2e8;
var NetworkStorage = class {
  #browsingContextStorage;
  #eventManager;
  #collectorsStorage;
  #logger;
  /**
   * A map from network request ID to Network Request objects.
   * Needed as long as information about requests comes from different events.
   */
  #requests = /* @__PURE__ */ new Map();
  /** A map from intercept ID to track active network intercepts. */
  #intercepts = /* @__PURE__ */ new Map();
  // TODO: Move to ContextConfigStorage after
  // https://github.com/w3c/webdriver-bidi/issues/1170 is addressed.
  #defaultCacheBehavior = "default";
  #contextCacheBehavior = /* @__PURE__ */ new Map();
  constructor(eventManager, browsingContextStorage, browserClient, logger) {
    this.#browsingContextStorage = browsingContextStorage;
    this.#eventManager = eventManager;
    this.#collectorsStorage = new CollectorsStorage(MAX_TOTAL_COLLECTED_SIZE, logger);
    browserClient.on("Target.detachedFromTarget", ({ sessionId }) => {
      this.disposeRequestMap(sessionId);
    });
    this.#logger = logger;
  }
  /**
   * Gets the network request with the given ID, if any.
   * Otherwise, creates a new network request with the given ID and cdp target.
   */
  #getOrCreateNetworkRequest(id, cdpTarget, redirectCount) {
    let request = this.getRequestById(id);
    if (redirectCount === void 0 && request) {
      return request;
    }
    request = new NetworkRequest(id, this.#eventManager, this, cdpTarget, redirectCount, this.#logger);
    this.addRequest(request);
    return request;
  }
  onCdpTargetCreated(cdpTarget) {
    const cdpClient = cdpTarget.cdpClient;
    const listeners = [
      [
        "Network.requestWillBeSent",
        (params) => {
          const request = this.getRequestById(params.requestId);
          request?.updateCdpTarget(cdpTarget);
          if (request && request.isRedirecting()) {
            request.handleRedirect(params);
            this.disposeRequest(params.requestId);
            this.#getOrCreateNetworkRequest(params.requestId, cdpTarget, request.redirectCount + 1).onRequestWillBeSentEvent(params);
          } else {
            this.#getOrCreateNetworkRequest(params.requestId, cdpTarget).onRequestWillBeSentEvent(params);
          }
        }
      ],
      [
        "Network.requestWillBeSentExtraInfo",
        (params) => {
          const request = this.#getOrCreateNetworkRequest(params.requestId, cdpTarget);
          request.updateCdpTarget(cdpTarget);
          request.onRequestWillBeSentExtraInfoEvent(params);
        }
      ],
      [
        "Network.responseReceived",
        (params) => {
          const request = this.#getOrCreateNetworkRequest(params.requestId, cdpTarget);
          request.updateCdpTarget(cdpTarget);
          request.onResponseReceivedEvent(params);
        }
      ],
      [
        "Network.responseReceivedExtraInfo",
        (params) => {
          const request = this.#getOrCreateNetworkRequest(params.requestId, cdpTarget);
          request.updateCdpTarget(cdpTarget);
          request.onResponseReceivedExtraInfoEvent(params);
        }
      ],
      [
        "Network.requestServedFromCache",
        (params) => {
          const request = this.#getOrCreateNetworkRequest(params.requestId, cdpTarget);
          request.updateCdpTarget(cdpTarget);
          request.onServedFromCache();
        }
      ],
      [
        "Fetch.requestPaused",
        (event) => {
          const request = this.#getOrCreateNetworkRequest(
            // CDP quirk if the Network domain is not present this is undefined
            event.networkId ?? event.requestId,
            cdpTarget
          );
          request.updateCdpTarget(cdpTarget);
          request.onRequestPaused(event);
        }
      ],
      [
        "Fetch.authRequired",
        (event) => {
          let request = this.getRequestByFetchId(event.requestId);
          if (!request) {
            request = this.#getOrCreateNetworkRequest(event.requestId, cdpTarget);
          }
          request.updateCdpTarget(cdpTarget);
          request.onAuthRequired(event);
        }
      ],
      [
        "Network.dataReceived",
        (params) => {
          const request = this.getRequestById(params.requestId);
          request?.updateCdpTarget(cdpTarget);
          request?.onDataReceivedEvent(params);
        }
      ],
      [
        "Network.loadingFailed",
        (params) => {
          const request = this.#getOrCreateNetworkRequest(params.requestId, cdpTarget);
          request.updateCdpTarget(cdpTarget);
          request.onLoadingFailedEvent(params);
        }
      ],
      [
        "Network.loadingFinished",
        (params) => {
          const request = this.getRequestById(params.requestId);
          request?.updateCdpTarget(cdpTarget);
          request?.onLoadingFinishedEvent(params);
        }
      ]
    ];
    for (const [event, listener] of listeners) {
      cdpClient.on(event, listener);
    }
  }
  async getCollectedData(params) {
    if (!this.#collectorsStorage.isCollected(params.request, params.dataType, params.collector)) {
      throw new NoSuchNetworkDataException(params.collector === void 0 ? `No collected ${params.dataType} data` : `Collector ${params.collector} didn't collect ${params.dataType} data`);
    }
    if (params.disown && params.collector === void 0) {
      throw new InvalidArgumentException("Cannot disown collected data without collector ID");
    }
    const request = this.getRequestById(params.request);
    if (request === void 0) {
      throw new NoSuchNetworkDataException(`No data for ${params.request}`);
    }
    let result = void 0;
    switch (params.dataType) {
      case Network2.DataType.Response:
        result = await this.#getCollectedResponseData(request);
        break;
      case Network2.DataType.Request:
        result = await this.#getCollectedRequestData(request);
        break;
      default:
        throw new UnsupportedOperationException(`Unsupported data type ${params.dataType}`);
    }
    if (params.disown && params.collector !== void 0) {
      this.#collectorsStorage.disownData(request.id, params.dataType, params.collector);
      this.disposeRequest(request.id);
    }
    return result;
  }
  async #getCollectedResponseData(request) {
    try {
      const responseBody = await request.cdpClient.sendCommand("Network.getResponseBody", { requestId: request.id });
      return {
        bytes: {
          type: responseBody.base64Encoded ? "base64" : "string",
          value: responseBody.body
        }
      };
    } catch (error) {
      if (error.code === -32e3 && error.message === "No resource with given identifier found") {
        throw new NoSuchNetworkDataException(`Response data was disposed`);
      }
      if (error.code === -32001) {
        throw new NoSuchNetworkDataException(`Response data is disposed after the related page`);
      }
      throw error;
    }
  }
  async #getCollectedRequestData(request) {
    const requestPostData = await request.cdpClient.sendCommand("Network.getRequestPostData", { requestId: request.id });
    return {
      bytes: {
        type: "string",
        value: requestPostData.postData
      }
    };
  }
  collectIfNeeded(request, dataType) {
    this.#collectorsStorage.collectIfNeeded(request, dataType, request.cdpTarget.topLevelId, request.cdpTarget.userContext);
  }
  getInterceptionStages(browsingContextId) {
    const stages = {
      request: false,
      response: false,
      auth: false
    };
    for (const intercept of this.#intercepts.values()) {
      if (intercept.contexts && !intercept.contexts.includes(browsingContextId)) {
        continue;
      }
      stages.request ||= intercept.phases.includes(Network2.InterceptPhase.BeforeRequestSent);
      stages.response ||= intercept.phases.includes(Network2.InterceptPhase.ResponseStarted);
      stages.auth ||= intercept.phases.includes(Network2.InterceptPhase.AuthRequired);
    }
    return stages;
  }
  getInterceptsForPhase(request, phase) {
    if (request.url === NetworkRequest.unknownParameter) {
      return /* @__PURE__ */ new Set();
    }
    const intercepts = /* @__PURE__ */ new Set();
    for (const [interceptId, intercept] of this.#intercepts.entries()) {
      if (!intercept.phases.includes(phase) || intercept.contexts && !intercept.contexts.includes(request.cdpTarget.topLevelId)) {
        continue;
      }
      if (intercept.urlPatterns.length === 0) {
        intercepts.add(interceptId);
        continue;
      }
      for (const pattern of intercept.urlPatterns) {
        if (matchUrlPattern(pattern, request.url)) {
          intercepts.add(interceptId);
          break;
        }
      }
    }
    return intercepts;
  }
  disposeRequestMap(sessionId) {
    for (const request of this.#requests.values()) {
      if (request.cdpClient.sessionId === sessionId) {
        this.#requests.delete(request.id);
        request.dispose();
      }
    }
  }
  /**
   * Adds the given entry to the intercept map.
   * URL patterns are assumed to be parsed.
   *
   * @return The intercept ID.
   */
  addIntercept(value) {
    const interceptId = uuidv4();
    this.#intercepts.set(interceptId, value);
    return interceptId;
  }
  /**
   * Removes the given intercept from the intercept map.
   * Throws NoSuchInterceptException if the intercept does not exist.
   */
  removeIntercept(intercept) {
    if (!this.#intercepts.has(intercept)) {
      throw new NoSuchInterceptException(`Intercept '${intercept}' does not exist.`);
    }
    this.#intercepts.delete(intercept);
  }
  getRequestsByTarget(target) {
    const requests2 = [];
    for (const request of this.#requests.values()) {
      if (request.cdpTarget === target) {
        requests2.push(request);
      }
    }
    return requests2;
  }
  getRequestById(id) {
    return this.#requests.get(id);
  }
  getRequestByFetchId(fetchId) {
    for (const request of this.#requests.values()) {
      if (request.fetchId === fetchId) {
        return request;
      }
    }
    return;
  }
  addRequest(request) {
    this.#requests.set(request.id, request);
  }
  /**
   * Disposes the given request, if no collectors targeting it are left.
   */
  disposeRequest(id) {
    if (this.#collectorsStorage.isCollected(id)) {
      this.#requests.get(id)?.disposeData();
      return;
    }
    this.#requests.delete(id);
  }
  /**
   * Gets the virtual navigation ID for the given navigable ID.
   */
  getNavigationId(contextId) {
    if (contextId === void 0) {
      return null;
    }
    return this.#browsingContextStorage.findContext(contextId)?.navigationId ?? null;
  }
  addDataCollector(params) {
    return this.#collectorsStorage.addDataCollector(params);
  }
  removeDataCollector(params) {
    const releasedRequests = this.#collectorsStorage.removeDataCollector(params.collector);
    releasedRequests.map((request) => this.disposeRequest(request));
  }
  disownData(params) {
    if (!this.#collectorsStorage.isCollected(params.request, params.dataType, params.collector)) {
      throw new NoSuchNetworkDataException(`Collector ${params.collector} didn't collect ${params.dataType} data`);
    }
    this.#collectorsStorage.disownData(params.request, params.dataType, params.collector);
    this.disposeRequest(params.request);
  }
  setCacheBehavior(behavior, contexts) {
    if (contexts.size === 0) {
      this.#defaultCacheBehavior = behavior;
      this.#contextCacheBehavior.clear();
      return;
    }
    for (const context of contexts.values()) {
      this.#contextCacheBehavior.set(context.id, behavior);
    }
  }
  getCacheBehavior(topLevelId) {
    return this.#contextCacheBehavior.get(topLevelId) ?? this.#defaultCacheBehavior;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/cdp/CdpTarget.js
var CdpTarget = class _CdpTarget {
  #id;
  #targetType;
  userContext;
  #cdpClient;
  #browserCdpClient;
  #parentCdpClient;
  #realmStorage;
  #eventManager;
  #preloadScriptStorage;
  #browsingContextStorage;
  #networkStorage;
  contextConfigStorage;
  #unblocked = new Deferred2();
  // Default user agent for the target. Required, as emulating client hints without user
  // agent is not possible. Cache it to avoid round trips to the browser for every target override.
  #defaultUserAgent;
  #logger;
  /**
   * Target's window id. Is filled when the CDP target is created and do not reflect
   * moving targets from one window to another. The actual values
   * will be set during `#unblock`.
   * */
  #windowId;
  #deviceAccessEnabled = false;
  #cacheDisableState = false;
  #preloadEnabled = false;
  #fetchDomainStages = {
    request: false,
    response: false,
    auth: false
  };
  static create(targetId, cdpClient, browserCdpClient, parentCdpClient, realmStorage, eventManager, preloadScriptStorage, browsingContextStorage, networkStorage, configStorage, userContext, defaultUserAgent, targetType, logger) {
    const cdpTarget = new _CdpTarget(targetId, cdpClient, browserCdpClient, parentCdpClient, eventManager, realmStorage, preloadScriptStorage, browsingContextStorage, configStorage, networkStorage, userContext, defaultUserAgent, targetType, logger);
    LogManager.create(cdpTarget, realmStorage, eventManager, logger);
    cdpTarget.#setEventListeners();
    void cdpTarget.#unblock();
    return cdpTarget;
  }
  constructor(targetId, cdpClient, browserCdpClient, parentCdpClient, eventManager, realmStorage, preloadScriptStorage, browsingContextStorage, configStorage, networkStorage, userContext, defaultUserAgent, targetType, logger) {
    this.#defaultUserAgent = defaultUserAgent;
    this.userContext = userContext;
    this.#id = targetId;
    this.#targetType = targetType;
    this.#cdpClient = cdpClient;
    this.#browserCdpClient = browserCdpClient;
    this.#parentCdpClient = parentCdpClient;
    this.#eventManager = eventManager;
    this.#realmStorage = realmStorage;
    this.#preloadScriptStorage = preloadScriptStorage;
    this.#networkStorage = networkStorage;
    this.#browsingContextStorage = browsingContextStorage;
    this.contextConfigStorage = configStorage;
    this.#logger = logger;
  }
  /** Top-level page target; excludes OOPIFs and workers. */
  get #isPageTarget() {
    return this.#targetType === "page";
  }
  /** Document frame target (`page` or `iframe`); excludes workers. */
  get #isFrameTarget() {
    return this.#targetType === "page" || this.#targetType === "iframe";
  }
  /** Dedicated workers do not expose the CDP Fetch domain. */
  get #isFetchSupported() {
    return this.#targetType !== "worker";
  }
  /** Returns a deferred that resolves when the target is unblocked. */
  get unblocked() {
    return this.#unblocked;
  }
  get id() {
    return this.#id;
  }
  get cdpClient() {
    return this.#cdpClient;
  }
  get parentCdpClient() {
    return this.#parentCdpClient;
  }
  get browserCdpClient() {
    return this.#browserCdpClient;
  }
  /** Needed for CDP escape path. */
  get cdpSessionId() {
    return this.#cdpClient.sessionId;
  }
  /**
   * Window id the target belongs to. If not known, returns 0.
   */
  get windowId() {
    if (this.#windowId === void 0) {
      this.#logger?.(LogType.debugError)?.("Getting windowId before it was set, returning 0");
    }
    return this.#windowId ?? 0;
  }
  /**
   * Enables all the required CDP domains and unblocks the target.
   */
  async #unblock() {
    const config = this.contextConfigStorage.getActiveConfig(this.topLevelId, this.userContext);
    const promises = [];
    if (this.#isFrameTarget) {
      promises.push(this.#cdpClient.sendCommand("Page.enable", {
        enableFileChooserOpenedEvent: true
      }));
      if (!this.#ignoreFileDialog()) {
        promises.push(this.#cdpClient.sendCommand("Page.setInterceptFileChooserDialog", {
          enabled: true,
          // The intercepted dialog should be canceled.
          cancel: true
        }));
      }
      promises.push(this.#cdpClient.sendCommand("Page.getFrameTree").then((frameTree) => this.#restoreFrameTreeState(frameTree.frameTree)), this.#cdpClient.sendCommand("Page.setLifecycleEventsEnabled", {
        enabled: true
      }));
    }
    promises.push(
      this.#cdpClient.sendCommand("Runtime.enable"),
      // Enabling CDP Network domain is required for navigation detection:
      // https://github.com/GoogleChromeLabs/chromium-bidi/issues/2856.
      this.#cdpClient.sendCommand("Network.enable", {
        // If `googDisableNetworkDurableMessages` flag is set, do not enable durable
        // messages.
        enableDurableMessages: config.disableNetworkDurableMessages !== true,
        maxTotalBufferSize: MAX_TOTAL_COLLECTED_SIZE
      }).then(() => this.toggleNetworkIfNeeded()),
      this.#cdpClient.sendCommand("Target.setAutoAttach", {
        autoAttach: true,
        waitForDebuggerOnStart: true,
        flatten: true
      }),
      this.#updateWindowId(),
      this.#setUserContextConfig(config),
      this.#initAndEvaluatePreloadScripts(),
      this.toggleDeviceAccessIfNeeded(),
      this.togglePreloadIfNeeded(),
      this.#cdpClient.sendCommand("Runtime.runIfWaitingForDebugger")
    );
    if (this.#isPageTarget) {
      promises.push(this.#parentCdpClient.sendCommand("Runtime.runIfWaitingForDebugger"));
    }
    const results = await Promise.allSettled(promises);
    for (const result of results) {
      if (result instanceof Error) {
        this.#logger?.(LogType.debugError)?.("Error happened when configuring a new target", result);
      }
    }
    this.#unblocked.resolve({
      kind: "success",
      value: void 0
    });
  }
  #restoreFrameTreeState(frameTree) {
    const frame = frameTree.frame;
    const maybeContext = this.#browsingContextStorage.findContext(frame.id);
    if (maybeContext !== void 0) {
      if (maybeContext.parentId === null && frame.parentId !== null && frame.parentId !== void 0) {
        maybeContext.parentId = frame.parentId;
      }
    }
    if (maybeContext === void 0 && frame.parentId !== void 0) {
      const parentBrowsingContext = this.#browsingContextStorage.getContext(frame.parentId);
      BrowsingContextImpl.create(frame.id, frame.parentId, this.userContext, parentBrowsingContext.cdpTarget, this.#eventManager, this.#browsingContextStorage, this.#realmStorage, this.contextConfigStorage, frame.url, void 0, this.#logger);
    }
    frameTree.childFrames?.map((frameTree2) => this.#restoreFrameTreeState(frameTree2));
  }
  async toggleFetchIfNeeded() {
    if (!this.#isFetchSupported) {
      return;
    }
    const stages = this.#networkStorage.getInterceptionStages(this.topLevelId);
    if (this.#fetchDomainStages.request === stages.request && this.#fetchDomainStages.response === stages.response && this.#fetchDomainStages.auth === stages.auth) {
      return;
    }
    const patterns = [];
    this.#fetchDomainStages = stages;
    if (stages.request || stages.auth) {
      patterns.push({
        urlPattern: "*",
        requestStage: "Request"
      });
    }
    if (stages.response) {
      patterns.push({
        urlPattern: "*",
        requestStage: "Response"
      });
    }
    if (patterns.length) {
      await this.#cdpClient.sendCommand("Fetch.enable", {
        patterns,
        handleAuthRequests: stages.auth
      });
    } else {
      const blockedRequest = this.#networkStorage.getRequestsByTarget(this).filter((request) => request.interceptPhase);
      void Promise.allSettled(blockedRequest.map((request) => request.waitNextPhase)).then(async () => {
        const blockedRequest2 = this.#networkStorage.getRequestsByTarget(this).filter((request) => request.interceptPhase);
        if (blockedRequest2.length) {
          return await this.toggleFetchIfNeeded();
        }
        return await this.#cdpClient.sendCommand("Fetch.disable");
      }).catch((error) => {
        this.#logger?.(LogType.bidi)?.("Disable failed", error);
      });
    }
  }
  /**
   * Toggles CDP "Fetch" domain and enable/disable network cache.
   */
  async toggleNetworkIfNeeded() {
    try {
      await Promise.all([
        this.toggleSetCacheDisabled(),
        this.toggleFetchIfNeeded()
      ]);
    } catch (err) {
      this.#logger?.(LogType.debugError)?.(err);
      if (!this.#isExpectedError(err)) {
        throw err;
      }
    }
  }
  async toggleSetCacheDisabled() {
    const cacheDisabled = this.#networkStorage.getCacheBehavior(this.topLevelId) === "bypass";
    if (this.#cacheDisableState === cacheDisabled) {
      return;
    }
    this.#cacheDisableState = cacheDisabled;
    try {
      await this.#cdpClient.sendCommand("Network.setCacheDisabled", {
        cacheDisabled
      });
    } catch (err) {
      this.#logger?.(LogType.debugError)?.(err);
      this.#cacheDisableState = !cacheDisabled;
      if (!this.#isExpectedError(err)) {
        throw err;
      }
    }
  }
  async toggleDeviceAccessIfNeeded() {
    if (!this.#isFrameTarget) {
      return;
    }
    const enabled = this.isSubscribedTo(Bluetooth.EventNames.RequestDevicePromptUpdated);
    if (this.#deviceAccessEnabled === enabled) {
      return;
    }
    this.#deviceAccessEnabled = enabled;
    try {
      await this.#cdpClient.sendCommand(enabled ? "DeviceAccess.enable" : "DeviceAccess.disable");
    } catch (err) {
      this.#logger?.(LogType.debugError)?.(err);
      this.#deviceAccessEnabled = !enabled;
      if (!this.#isExpectedError(err)) {
        throw err;
      }
    }
  }
  async togglePreloadIfNeeded() {
    if (!this.#isFrameTarget) {
      return;
    }
    const enabled = this.isSubscribedTo(Speculation.EventNames.PrefetchStatusUpdated);
    if (this.#preloadEnabled === enabled) {
      return;
    }
    this.#preloadEnabled = enabled;
    try {
      await this.#cdpClient.sendCommand(enabled ? "Preload.enable" : "Preload.disable");
    } catch (err) {
      this.#logger?.(LogType.debugError)?.(err);
      this.#preloadEnabled = !enabled;
      if (!this.#isExpectedError(err)) {
        throw err;
      }
    }
  }
  /**
   * Heuristic checking if the error is due to the session being closed. If so, ignore the
   * error.
   */
  #isExpectedError(err) {
    const error = err;
    return error.code === -32001 && error.message === "Session with given id not found." || this.#cdpClient.isCloseError(err);
  }
  #setEventListeners() {
    this.#cdpClient.on("*", (event, params) => {
      if (typeof event !== "string") {
        return;
      }
      this.#eventManager.registerEvent({
        type: "event",
        method: `goog:cdp.${event}`,
        params: {
          event,
          params,
          session: this.cdpSessionId
        }
      }, this.id);
    });
  }
  async #enableFetch(stages) {
    const patterns = [];
    if (stages.request || stages.auth) {
      patterns.push({
        urlPattern: "*",
        requestStage: "Request"
      });
    }
    if (stages.response) {
      patterns.push({
        urlPattern: "*",
        requestStage: "Response"
      });
    }
    if (patterns.length) {
      const oldStages = this.#fetchDomainStages;
      this.#fetchDomainStages = stages;
      try {
        await this.#cdpClient.sendCommand("Fetch.enable", {
          patterns,
          handleAuthRequests: stages.auth
        });
      } catch {
        this.#fetchDomainStages = oldStages;
      }
    }
  }
  async #disableFetch() {
    const blockedRequest = this.#networkStorage.getRequestsByTarget(this).filter((request) => request.interceptPhase);
    if (blockedRequest.length === 0) {
      this.#fetchDomainStages = {
        request: false,
        response: false,
        auth: false
      };
      await this.#cdpClient.sendCommand("Fetch.disable");
    }
  }
  async toggleNetwork() {
    if (!this.#isFetchSupported) {
      return;
    }
    const stages = this.#networkStorage.getInterceptionStages(this.topLevelId);
    const fetchEnable = Object.values(stages).some((value) => value);
    const fetchChanged = this.#fetchDomainStages.request !== stages.request || this.#fetchDomainStages.response !== stages.response || this.#fetchDomainStages.auth !== stages.auth;
    this.#logger?.(LogType.debugInfo)?.("Toggle Network", `Fetch (${fetchEnable}) ${fetchChanged}`);
    if (fetchEnable && fetchChanged) {
      await this.#enableFetch(stages);
    }
    if (!fetchEnable && fetchChanged) {
      await this.#disableFetch();
    }
  }
  /**
   * All the ProxyChannels from all the preload scripts of the given
   * BrowsingContext and sandbox.
   */
  getChannels(sandbox) {
    return this.#preloadScriptStorage.find({
      targetId: this.topLevelId
    }).filter((script) => script.sandbox === sandbox).flatMap((script) => script.channels);
  }
  async #updateWindowId() {
    if (!this.#isFrameTarget) {
      return;
    }
    const { windowId } = await this.#browserCdpClient.sendCommand("Browser.getWindowForTarget", { targetId: this.id });
    this.#windowId = windowId;
  }
  /** Loads all top-level preload scripts. */
  async #initAndEvaluatePreloadScripts() {
    if (!this.#isFrameTarget) {
      return;
    }
    await Promise.all(this.#preloadScriptStorage.find({
      // Needed for OOPIF
      targetId: this.topLevelId
    }).map((script) => {
      return script.initInTarget(this, true);
    }));
  }
  async setDeviceMetricsOverride(viewport, devicePixelRatio, screenOrientation, screenArea, scrollbarType = null, viewportMeta = null) {
    if (!this.#isPageTarget) {
      return;
    }
    if (viewport === null && devicePixelRatio === null && screenOrientation === null && screenArea === null && scrollbarType === null && viewportMeta === null) {
      await this.cdpClient.sendCommand("Emulation.clearDeviceMetricsOverride");
      return;
    }
    const metricsOverride = {
      width: viewport?.width ?? 0,
      height: viewport?.height ?? 0,
      deviceScaleFactor: devicePixelRatio ?? 0,
      screenOrientation: this.#toCdpScreenOrientationAngle(screenOrientation) ?? void 0,
      mobile: false,
      screenWidth: screenArea?.width,
      screenHeight: screenArea?.height,
      scrollbarType: scrollbarType === "overlay" ? "overlay" : "default",
      viewportMeta: viewportMeta === true ? "enable" : "default"
    };
    await this.cdpClient.sendCommand("Emulation.setDeviceMetricsOverride", metricsOverride);
  }
  /**
   * Immediately schedules all the required commands to configure user context
   * configuration and waits for them to finish. It's important to schedule them
   * in parallel, so that they are enqueued before any page's scripts.
   */
  async #setUserContextConfig(config) {
    const promises = [];
    if (this.#isPageTarget) {
      promises.push(this.#cdpClient.sendCommand("Page.setPrerenderingAllowed", {
        isAllowed: !config.prerenderingDisabled
      }).catch(() => {
      }));
      if (config.viewport !== void 0 || config.devicePixelRatio !== void 0 || config.screenOrientation !== void 0 || config.screenArea !== void 0 || config.scrollbarType !== void 0 || config.viewportMeta !== void 0) {
        promises.push(this.setDeviceMetricsOverride(config.viewport ?? null, config.devicePixelRatio ?? null, config.screenOrientation ?? null, config.screenArea ?? null, config.scrollbarType ?? null, config.viewportMeta ?? null).catch(() => {
        }));
      }
      if (config.digitalCredentialsBehavior) {
        promises.push(this.cdpClient.sendCommand("DigitalCredentials.setVirtualWalletBehavior", {
          action: config.digitalCredentialsBehavior.action,
          protocol: config.digitalCredentialsBehavior.protocol,
          response: config.digitalCredentialsBehavior.response
        }).catch(() => {
        }));
      }
    }
    if (this.#isFrameTarget) {
      if (config.geolocation !== void 0 && config.geolocation !== null) {
        promises.push(this.setGeolocationOverride(config.geolocation));
      }
      if (config.scriptingEnabled !== void 0) {
        promises.push(this.setScriptingEnabled(config.scriptingEnabled));
      }
      if (config.acceptInsecureCerts !== void 0) {
        promises.push(this.cdpClient.sendCommand("Security.setIgnoreCertificateErrors", {
          ignore: config.acceptInsecureCerts
        }));
      }
      if (config.maxTouchPoints !== void 0) {
        promises.push(this.setTouchOverride(config.maxTouchPoints));
      }
      if (config.mediaFeatures !== void 0) {
        promises.push(this.setMediaFeaturesOverride(config.mediaFeatures));
      }
    }
    if (config.locale !== void 0) {
      promises.push(this.setLocaleOverride(config.locale));
    }
    if (config.timezone !== void 0) {
      promises.push(this.setTimezoneOverride(config.timezone));
    }
    if (config.extraHeaders !== void 0) {
      promises.push(this.setExtraHeaders(config.extraHeaders));
    }
    if (config.userAgent !== void 0 || config.locale !== void 0 || config.clientHints !== void 0) {
      promises.push(this.setUserAgentAndAcceptLanguage(config.userAgent, config.locale, config.clientHints));
    }
    if (config.emulatedNetworkConditions !== void 0) {
      promises.push(this.setEmulatedNetworkConditions(config.emulatedNetworkConditions));
    }
    await Promise.all(promises);
  }
  get topLevelId() {
    return this.#browsingContextStorage.findTopLevelContextId(this.id) ?? this.id;
  }
  isSubscribedTo(moduleOrEvent) {
    return this.#eventManager.subscriptionManager.isSubscribedTo(moduleOrEvent, this.topLevelId);
  }
  #ignoreFileDialog() {
    const config = this.contextConfigStorage.getActiveConfig(this.topLevelId, this.userContext);
    return (config.userPromptHandler?.file ?? config.userPromptHandler?.default ?? Session.UserPromptHandlerType.Ignore) === Session.UserPromptHandlerType.Ignore;
  }
  async setGeolocationOverride(geolocation) {
    if (!this.#isFrameTarget) {
      return;
    }
    if (geolocation === null) {
      await this.cdpClient.sendCommand("Emulation.clearGeolocationOverride");
    } else if ("type" in geolocation) {
      if (geolocation.type !== "positionUnavailable") {
        throw new UnknownErrorException(`Unknown geolocation error ${geolocation.type}`);
      }
      await this.cdpClient.sendCommand("Emulation.setGeolocationOverride", {});
    } else if ("latitude" in geolocation) {
      await this.cdpClient.sendCommand("Emulation.setGeolocationOverride", {
        latitude: geolocation.latitude,
        longitude: geolocation.longitude,
        accuracy: geolocation.accuracy ?? 1,
        // `null` value is treated as "missing".
        altitude: geolocation.altitude ?? void 0,
        altitudeAccuracy: geolocation.altitudeAccuracy ?? void 0,
        heading: geolocation.heading ?? void 0,
        speed: geolocation.speed ?? void 0
      });
    } else {
      throw new UnknownErrorException("Unexpected geolocation coordinates value");
    }
  }
  async setTouchOverride(maxTouchPoints) {
    if (!this.#isFrameTarget) {
      return;
    }
    const touchEmulationParams = {
      enabled: maxTouchPoints !== null
    };
    if (maxTouchPoints !== null) {
      touchEmulationParams.maxTouchPoints = maxTouchPoints;
    }
    await this.cdpClient.sendCommand("Emulation.setTouchEmulationEnabled", touchEmulationParams);
  }
  #toCdpScreenOrientationAngle(orientation) {
    if (orientation === null) {
      return null;
    }
    if (orientation.natural === Emulation.ScreenOrientationNatural.Portrait) {
      switch (orientation.type) {
        case "portrait-primary":
          return {
            angle: 0,
            type: "portraitPrimary"
          };
        case "landscape-primary":
          return {
            angle: 90,
            type: "landscapePrimary"
          };
        case "portrait-secondary":
          return {
            angle: 180,
            type: "portraitSecondary"
          };
        case "landscape-secondary":
          return {
            angle: 270,
            type: "landscapeSecondary"
          };
        default:
          throw new UnknownErrorException(`Unexpected screen orientation type ${orientation.type}`);
      }
    }
    if (orientation.natural === Emulation.ScreenOrientationNatural.Landscape) {
      switch (orientation.type) {
        case "landscape-primary":
          return {
            angle: 0,
            type: "landscapePrimary"
          };
        case "portrait-primary":
          return {
            angle: 90,
            type: "portraitPrimary"
          };
        case "landscape-secondary":
          return {
            angle: 180,
            type: "landscapeSecondary"
          };
        case "portrait-secondary":
          return {
            angle: 270,
            type: "portraitSecondary"
          };
        default:
          throw new UnknownErrorException(`Unexpected screen orientation type ${orientation.type}`);
      }
    }
    throw new UnknownErrorException(`Unexpected orientation natural ${orientation.natural}`);
  }
  async setLocaleOverride(locale) {
    if (locale === null) {
      await this.cdpClient.sendCommand("Emulation.setLocaleOverride", {});
    } else {
      await this.cdpClient.sendCommand("Emulation.setLocaleOverride", {
        locale
      });
    }
  }
  async setScriptingEnabled(scriptingEnabled) {
    if (!this.#isFrameTarget) {
      return;
    }
    await this.cdpClient.sendCommand("Emulation.setScriptExecutionDisabled", {
      value: scriptingEnabled === false
    });
  }
  async setTimezoneOverride(timezone) {
    if (timezone === null) {
      await this.cdpClient.sendCommand("Emulation.setTimezoneOverride", {
        // If empty, disables the override and restores default host system timezone.
        timezoneId: ""
      });
    } else {
      await this.cdpClient.sendCommand("Emulation.setTimezoneOverride", {
        timezoneId: timezone
      });
    }
  }
  async setExtraHeaders(headers) {
    await this.cdpClient.sendCommand("Network.setExtraHTTPHeaders", {
      headers
    });
  }
  async setUserAgentAndAcceptLanguage(userAgent, acceptLanguage, clientHints) {
    const userAgentMetadata = clientHints ? {
      brands: clientHints.brands?.map((b) => ({
        brand: b.brand,
        version: b.version
      })),
      fullVersionList: clientHints.fullVersionList,
      platform: clientHints.platform ?? "",
      platformVersion: clientHints.platformVersion ?? "",
      architecture: clientHints.architecture ?? "",
      model: clientHints.model ?? "",
      mobile: clientHints.mobile ?? false,
      bitness: clientHints.bitness ?? void 0,
      wow64: clientHints.wow64 ?? void 0,
      formFactors: clientHints.formFactors ?? void 0
    } : void 0;
    await this.cdpClient.sendCommand("Emulation.setUserAgentOverride", {
      // `userAgent` is required if `userAgentMetadata` is provided.
      userAgent: userAgent || (userAgentMetadata ? this.#defaultUserAgent : ""),
      acceptLanguage: acceptLanguage ?? void 0,
      // We need to provide the platform to enable platform emulation.
      // Note that the value might be different from the one expected by the
      // legacy `navigator.platform` (e.g. `Win32` vs `Windows`).
      // https://github.com/w3c/webdriver-bidi/issues/1065
      platform: clientHints?.platform ?? void 0,
      userAgentMetadata
    });
  }
  async setEmulatedNetworkConditions(networkConditions) {
    if (networkConditions !== null && networkConditions.type !== "offline") {
      throw new UnsupportedOperationException(`Unsupported network conditions ${networkConditions.type}`);
    }
    await Promise.all([
      this.cdpClient.sendCommand("Network.emulateNetworkConditionsByRule", {
        offline: networkConditions?.type === "offline",
        matchedNetworkConditions: [
          {
            urlPattern: "",
            latency: 0,
            downloadThroughput: -1,
            uploadThroughput: -1
          }
        ]
      }),
      this.cdpClient.sendCommand("Network.overrideNetworkState", {
        offline: networkConditions?.type === "offline",
        // TODO: restore the original `latency` value when emulation is removed.
        latency: 0,
        downloadThroughput: -1,
        uploadThroughput: -1
      })
    ]);
  }
  async setMediaFeaturesOverride(mediaFeatures) {
    if (!this.#isFrameTarget) {
      return;
    }
    const features = [];
    for (const [name, value] of Object.entries(mediaFeatures ?? {})) {
      if (value !== null && value !== void 0) {
        features.push({
          name,
          value: String(value)
        });
      }
    }
    await this.cdpClient.sendCommand("Emulation.setEmulatedMedia", {
      features
    });
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/cdp/CdpTargetManager.js
var cdpToBidiTargetTypes = {
  service_worker: "service-worker",
  shared_worker: "shared-worker",
  worker: "dedicated-worker"
};
var CdpTargetManager = class {
  #browserCdpClient;
  #cdpConnection;
  #targetKeysToBeIgnoredByAutoAttach = /* @__PURE__ */ new Set();
  #selfTargetId;
  #eventManager;
  #browsingContextStorage;
  #networkStorage;
  #bluetoothProcessor;
  #preloadScriptStorage;
  #realmStorage;
  #configStorage;
  #speculationProcessor;
  #defaultUserContextId;
  #defaultUserAgent;
  #logger;
  constructor(cdpConnection, browserCdpClient, selfTargetId, eventManager, browsingContextStorage, realmStorage, networkStorage, configStorage, bluetoothProcessor, speculationProcessor, preloadScriptStorage, defaultUserContextId, defaultUserAgent, logger) {
    this.#cdpConnection = cdpConnection;
    this.#browserCdpClient = browserCdpClient;
    this.#targetKeysToBeIgnoredByAutoAttach.add(selfTargetId);
    this.#selfTargetId = selfTargetId;
    this.#eventManager = eventManager;
    this.#browsingContextStorage = browsingContextStorage;
    this.#preloadScriptStorage = preloadScriptStorage;
    this.#networkStorage = networkStorage;
    this.#configStorage = configStorage;
    this.#bluetoothProcessor = bluetoothProcessor;
    this.#speculationProcessor = speculationProcessor;
    this.#realmStorage = realmStorage;
    this.#defaultUserContextId = defaultUserContextId;
    this.#defaultUserAgent = defaultUserAgent;
    this.#logger = logger;
    this.#setEventListeners(browserCdpClient);
    this.#setCdpEventListeners(browserCdpClient);
  }
  /**
   * Forward CDP events to BiDi at the browser level (global events) for
   * sessions not associated with a BrowsingContext (e.g. the browser session
   * and custom CDP sessions).
   */
  #setCdpEventListeners(cdpClient) {
    cdpClient.on("*", (event, params) => {
      if (typeof event !== "string") {
        return;
      }
      this.#eventManager.registerGlobalEvent({
        type: "event",
        method: `goog:cdp.${event}`,
        params: {
          event,
          params,
          session: cdpClient.sessionId
        }
      });
    });
  }
  /**
   * This method is called for each CDP session, since this class is responsible
   * for creating and destroying all targets and browsing contexts.
   */
  #setEventListeners(cdpClient) {
    cdpClient.on("Target.attachedToTarget", (params) => {
      this.#handleAttachedToTargetEvent(params, cdpClient);
    });
    cdpClient.on("Target.detachedFromTarget", this.#handleDetachedFromTargetEvent.bind(this));
    cdpClient.on("Target.targetInfoChanged", this.#handleTargetInfoChangedEvent.bind(this));
    cdpClient.on("Inspector.targetCrashed", () => {
      this.#handleTargetCrashedEvent(cdpClient);
    });
    cdpClient.on("Page.frameAttached", this.#handleFrameAttachedEvent.bind(this));
    cdpClient.on("Page.frameSubtreeWillBeDetached", this.#handleFrameSubtreeWillBeDetached.bind(this));
  }
  #handleFrameAttachedEvent(params) {
    const parentBrowsingContext = this.#browsingContextStorage.findContext(params.parentFrameId);
    if (parentBrowsingContext !== void 0) {
      BrowsingContextImpl.create(
        params.frameId,
        params.parentFrameId,
        parentBrowsingContext.userContext,
        parentBrowsingContext.cdpTarget,
        this.#eventManager,
        this.#browsingContextStorage,
        this.#realmStorage,
        this.#configStorage,
        // At this point, we don't know the URL of the frame yet, so it will be updated
        // later.
        "about:blank",
        void 0,
        this.#logger
      );
    }
  }
  #handleFrameSubtreeWillBeDetached(params) {
    this.#browsingContextStorage.findContext(params.frameId)?.dispose(true);
  }
  #handleAttachedToTargetEvent(params, parentSessionCdpClient) {
    const { sessionId, targetInfo } = params;
    const targetCdpClient = this.#cdpConnection.getCdpClient(sessionId);
    const detach = async () => {
      await targetCdpClient.sendCommand("Runtime.runIfWaitingForDebugger").then(() => parentSessionCdpClient.sendCommand("Target.detachFromTarget", params)).catch((error) => this.#logger?.(LogType.debugError)?.(error));
    };
    if (this.#selfTargetId === targetInfo.targetId) {
      void detach();
      return;
    }
    const targetKey = targetInfo.type === "service_worker" ? `${parentSessionCdpClient.sessionId}_${targetInfo.targetId}` : targetInfo.targetId;
    if (this.#targetKeysToBeIgnoredByAutoAttach.has(targetKey)) {
      this.#setCdpEventListeners(targetCdpClient);
      return;
    }
    this.#targetKeysToBeIgnoredByAutoAttach.add(targetKey);
    const userContext = targetInfo.browserContextId && targetInfo.browserContextId !== this.#defaultUserContextId ? targetInfo.browserContextId : "default";
    switch (targetInfo.type) {
      case "tab": {
        this.#setEventListeners(targetCdpClient);
        void (async () => {
          await targetCdpClient.sendCommand("Target.setAutoAttach", {
            autoAttach: true,
            waitForDebuggerOnStart: true,
            flatten: true
          });
        })();
        return;
      }
      case "page":
      case "iframe": {
        const cdpTarget = this.#createCdpTarget(targetCdpClient, parentSessionCdpClient, targetInfo, userContext);
        const maybeContext = this.#browsingContextStorage.findContext(targetInfo.targetId);
        if (maybeContext && targetInfo.type === "iframe") {
          maybeContext.updateCdpTarget(cdpTarget);
        } else {
          const parentId = this.#findFrameParentId(targetInfo, parentSessionCdpClient.sessionId);
          BrowsingContextImpl.create(
            targetInfo.targetId,
            parentId,
            userContext,
            cdpTarget,
            this.#eventManager,
            this.#browsingContextStorage,
            this.#realmStorage,
            this.#configStorage,
            // Hack: when a new target created, CDP emits targetInfoChanged with an empty
            // url, and navigates it to about:blank later. When the event is emitted for
            // an existing target (reconnect), the url is already known, and navigation
            // events will not be emitted anymore. Replacing empty url with `about:blank`
            // allows to handle both cases in the same way.
            // "7.3.2.1 Creating browsing contexts".
            // https://html.spec.whatwg.org/multipage/document-sequences.html#creating-browsing-contexts
            // TODO: check who to deal with non-null creator and its `creatorOrigin`.
            targetInfo.url === "" ? "about:blank" : targetInfo.url,
            targetInfo.openerFrameId ?? targetInfo.openerId,
            this.#logger
          );
        }
        return;
      }
      case "service_worker":
      case "worker": {
        const realm = this.#realmStorage.findRealm({
          cdpSessionId: parentSessionCdpClient.sessionId,
          sandbox: null
          // Non-sandboxed realms.
        });
        if (!realm) {
          void detach();
          return;
        }
        const cdpTarget = this.#createCdpTarget(targetCdpClient, parentSessionCdpClient, targetInfo, userContext);
        this.#handleWorkerTarget(cdpToBidiTargetTypes[targetInfo.type], cdpTarget, realm);
        return;
      }
      // In CDP, we only emit shared workers on the browser and not the set of
      // frames that use the shared worker. If we change this in the future to
      // behave like service workers (emits on both browser and frame targets),
      // we can remove this block and merge service workers with the above one.
      case "shared_worker": {
        const cdpTarget = this.#createCdpTarget(targetCdpClient, parentSessionCdpClient, targetInfo, userContext);
        this.#handleWorkerTarget(cdpToBidiTargetTypes[targetInfo.type], cdpTarget);
        return;
      }
    }
    void detach();
  }
  /** Try to find the parent browsing context ID for the given attached target. */
  #findFrameParentId(targetInfo, parentSessionId) {
    if (targetInfo.type !== "iframe") {
      return null;
    }
    const parentId = targetInfo.openerFrameId ?? targetInfo.openerId;
    if (parentId !== void 0) {
      return parentId;
    }
    if (parentSessionId !== void 0) {
      return this.#browsingContextStorage.findContextBySession(parentSessionId)?.id ?? null;
    }
    return null;
  }
  #createCdpTarget(targetCdpClient, parentCdpClient, targetInfo, userContext) {
    this.#setEventListeners(targetCdpClient);
    const isFrameTarget = targetInfo.type === "page" || targetInfo.type === "iframe";
    if (isFrameTarget) {
      this.#preloadScriptStorage.onCdpTargetCreated(targetInfo.targetId, userContext);
    }
    const target = CdpTarget.create(
      targetInfo.targetId,
      targetCdpClient,
      this.#browserCdpClient,
      parentCdpClient,
      this.#realmStorage,
      this.#eventManager,
      this.#preloadScriptStorage,
      this.#browsingContextStorage,
      this.#networkStorage,
      this.#configStorage,
      userContext,
      // Pass the cached default User Agent to the new target.
      this.#defaultUserAgent,
      targetInfo.type,
      this.#logger
    );
    this.#networkStorage.onCdpTargetCreated(target);
    if (isFrameTarget) {
      this.#bluetoothProcessor.onCdpTargetCreated(target);
      this.#speculationProcessor.onCdpTargetCreated(target);
    }
    return target;
  }
  #workers = /* @__PURE__ */ new Map();
  #handleWorkerTarget(realmType, cdpTarget, ownerRealm) {
    cdpTarget.cdpClient.on("Runtime.executionContextCreated", (params) => {
      const { uniqueId, id, origin } = params.context;
      const workerRealm = new WorkerRealm(cdpTarget.cdpClient, this.#eventManager, id, this.#logger, serializeOrigin(origin), ownerRealm ? [ownerRealm] : [], uniqueId, this.#realmStorage, realmType);
      this.#workers.set(cdpTarget.cdpSessionId, workerRealm);
    });
  }
  #handleDetachedFromTargetEvent({ sessionId, targetId }) {
    if (targetId) {
      this.#preloadScriptStorage.find({ targetId }).map((preloadScript) => {
        preloadScript.dispose(targetId);
      });
    }
    const context = this.#browsingContextStorage.findContextBySession(sessionId);
    if (context) {
      context.dispose(true);
      return;
    }
    const worker = this.#workers.get(sessionId);
    if (worker) {
      this.#realmStorage.deleteRealms({
        cdpSessionId: worker.cdpClient.sessionId
      });
    }
  }
  #handleTargetInfoChangedEvent(params) {
    const context = this.#browsingContextStorage.findContext(params.targetInfo.targetId);
    if (context) {
      context.onTargetInfoChanged(params);
    }
  }
  #handleTargetCrashedEvent(cdpClient) {
    this.#realmStorage.deleteRealms({
      cdpSessionId: cdpClient.sessionId
    });
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/context/BrowsingContextStorage.js
var BrowsingContextStorageEvents;
(function(BrowsingContextStorageEvents2) {
  BrowsingContextStorageEvents2["Added"] = "added";
})(BrowsingContextStorageEvents || (BrowsingContextStorageEvents = {}));
var BrowsingContextStorage = class {
  /** Map from context ID to context implementation. */
  #contexts = /* @__PURE__ */ new Map();
  /** Event emitter for browsing context storage eventsis not expected to be exposed to
   * the outside world. */
  #eventEmitter = new EventEmitter2();
  /** Gets all top-level contexts, i.e. those with no parent. */
  getTopLevelContexts() {
    return this.getAllContexts().filter((context) => context.isTopLevelContext());
  }
  /** Gets all contexts. */
  getAllContexts() {
    return Array.from(this.#contexts.values());
  }
  /** Deletes the context with the given ID. */
  deleteContextById(id) {
    this.#contexts.delete(id);
  }
  /** Deletes the given context. */
  deleteContext(context) {
    this.#contexts.delete(context.id);
  }
  /** Tracks the given context. */
  addContext(context) {
    this.#contexts.set(context.id, context);
    this.#eventEmitter.emit("added", {
      browsingContext: context
    });
  }
  /**
   * Waits for a context with the given ID to be added and returns it.
   */
  waitForContext(browsingContextId) {
    if (this.#contexts.has(browsingContextId)) {
      return Promise.resolve(this.getContext(browsingContextId));
    }
    return new Promise((resolve) => {
      const listener = (event) => {
        if (event.browsingContext.id === browsingContextId) {
          this.#eventEmitter.off("added", listener);
          resolve(event.browsingContext);
        }
      };
      this.#eventEmitter.on("added", listener);
    });
  }
  /** Returns true whether there is an existing context with the given ID. */
  hasContext(id) {
    return this.#contexts.has(id);
  }
  /** Gets the context with the given ID, if any. */
  findContext(id) {
    return this.#contexts.get(id);
  }
  /** Returns the top-level context ID of the given context, if any. */
  findTopLevelContextId(id) {
    if (id === null) {
      return null;
    }
    const maybeContext = this.findContext(id);
    if (!maybeContext) {
      return null;
    }
    const parentId = maybeContext.parentId ?? null;
    if (parentId === null) {
      return id;
    }
    return this.findTopLevelContextId(parentId);
  }
  findContextBySession(sessionId) {
    for (const context of this.#contexts.values()) {
      if (context.cdpTarget.cdpSessionId === sessionId) {
        return context;
      }
    }
    return;
  }
  /** Gets the context with the given ID, if any, otherwise throws. */
  getContext(id) {
    const result = this.findContext(id);
    if (result === void 0) {
      throw new NoSuchFrameException(`Context ${id} not found`);
    }
    return result;
  }
  verifyTopLevelContextsList(contexts) {
    const foundContexts = /* @__PURE__ */ new Set();
    if (!contexts) {
      return foundContexts;
    }
    for (const contextId of contexts) {
      const context = this.getContext(contextId);
      if (context.isTopLevelContext()) {
        foundContexts.add(context);
      } else {
        throw new InvalidArgumentException(`Non top-level context '${contextId}' given.`);
      }
    }
    return foundContexts;
  }
  verifyContextsList(contexts) {
    if (!contexts.length) {
      return;
    }
    for (const contextId of contexts) {
      this.getContext(contextId);
    }
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/script/PreloadScriptStorage.js
var PreloadScriptStorage = class {
  /** Tracks all BiDi preload scripts.  */
  #scripts = /* @__PURE__ */ new Set();
  /**
   * Finds all entries that match the given filter (OR logic).
   */
  find(filter2) {
    if (!filter2) {
      return [...this.#scripts];
    }
    return [...this.#scripts].filter((script) => {
      if (script.contexts === void 0 && script.userContexts === void 0) {
        return true;
      }
      if (filter2.targetId !== void 0 && script.targetIds.has(filter2.targetId)) {
        return true;
      }
      return false;
    });
  }
  add(preloadScript) {
    this.#scripts.add(preloadScript);
  }
  /** Deletes all BiDi preload script entries that match the given filter. */
  remove(id) {
    const script = [...this.#scripts].find((script2) => script2.id === id);
    if (script === void 0) {
      throw new NoSuchScriptException(`No preload script with id '${id}'`);
    }
    this.#scripts.delete(script);
  }
  /** Gets the preload script with the given ID, if any, otherwise throws. */
  getPreloadScript(id) {
    const script = [...this.#scripts].find((script2) => script2.id === id);
    if (script === void 0) {
      throw new NoSuchScriptException(`No preload script with id '${id}'`);
    }
    return script;
  }
  onCdpTargetCreated(targetId, userContext) {
    const scriptInUserContext = [...this.#scripts].filter((script) => {
      if (!script.userContexts && !script.contexts) {
        return true;
      }
      return script.userContexts?.includes(userContext);
    });
    for (const script of scriptInUserContext) {
      script.targetIds.add(targetId);
    }
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/script/RealmStorage.js
var RealmStorage = class {
  /** Tracks handles and their realms sent to the client. */
  #knownHandlesToRealmMap = /* @__PURE__ */ new Map();
  /** Map from realm ID to Realm. */
  #realmMap = /* @__PURE__ */ new Map();
  /** List of the internal sandboxed realms which should not be reported to the user. */
  hiddenSandboxes = /* @__PURE__ */ new Set();
  get knownHandlesToRealmMap() {
    return this.#knownHandlesToRealmMap;
  }
  addRealm(realm) {
    this.#realmMap.set(realm.realmId, realm);
  }
  /** Finds all realms that match the given filter. */
  findRealms(filter2) {
    const sandboxFilterValue = filter2.sandbox === null ? void 0 : filter2.sandbox;
    return Array.from(this.#realmMap.values()).filter((realm) => {
      if (filter2.realmId !== void 0 && filter2.realmId !== realm.realmId) {
        return false;
      }
      if (filter2.browsingContextId !== void 0 && !realm.associatedBrowsingContexts.map((browsingContext) => browsingContext.id).includes(filter2.browsingContextId)) {
        return false;
      }
      if (filter2.sandbox !== void 0 && (!(realm instanceof WindowRealm) || sandboxFilterValue !== realm.sandbox)) {
        return false;
      }
      if (filter2.executionContextId !== void 0 && filter2.executionContextId !== realm.executionContextId) {
        return false;
      }
      if (filter2.origin !== void 0 && filter2.origin !== realm.origin) {
        return false;
      }
      if (filter2.type !== void 0 && filter2.type !== realm.realmType) {
        return false;
      }
      if (filter2.cdpSessionId !== void 0 && filter2.cdpSessionId !== realm.cdpClient.sessionId) {
        return false;
      }
      if (filter2.isHidden !== void 0 && filter2.isHidden !== realm.isHidden()) {
        return false;
      }
      return true;
    });
  }
  findRealm(filter2) {
    return this.findRealms(filter2)[0];
  }
  /** Gets the only realm that matches the given filter, if any, otherwise throws. */
  getRealm(filter2) {
    const maybeRealm = this.findRealm(filter2);
    if (maybeRealm === void 0) {
      throw new NoSuchFrameException(`Realm ${JSON.stringify(filter2)} not found`);
    }
    return maybeRealm;
  }
  /** Deletes all realms that match the given filter. */
  deleteRealms(filter2) {
    this.findRealms(filter2).map((realm) => {
      realm.dispose();
      this.#realmMap.delete(realm.realmId);
      Array.from(this.knownHandlesToRealmMap.entries()).filter(([, r]) => r === realm.realmId).map(([handle]) => this.knownHandlesToRealmMap.delete(handle));
    });
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/utils/Buffer.js
var Buffer2 = class {
  #capacity;
  #entries = [];
  #onItemRemoved;
  /**
   * @param capacity The buffer capacity.
   * @param onItemRemoved Delegate called for each removed element.
   */
  constructor(capacity, onItemRemoved) {
    this.#capacity = capacity;
    this.#onItemRemoved = onItemRemoved;
  }
  get() {
    return this.#entries;
  }
  add(value) {
    this.#entries.push(value);
    while (this.#entries.length > this.#capacity) {
      const item = this.#entries.shift();
      if (item !== void 0) {
        this.#onItemRemoved?.(item);
      }
    }
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/utils/IdWrapper.js
var IdWrapper = class _IdWrapper {
  static #counter = 0;
  #id;
  constructor() {
    this.#id = ++_IdWrapper.#counter;
  }
  get id() {
    return this.#id;
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/session/events.js
function isCdpEvent(name) {
  return name.split(".").at(0)?.startsWith(chromium_bidi_exports.BiDiModule.Cdp) ?? false;
}
function assertSupportedEvent(name) {
  if (!chromium_bidi_exports.EVENT_NAMES.has(name) && !isCdpEvent(name)) {
    throw new InvalidArgumentException(`Unknown event: ${name}`);
  }
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/session/SubscriptionManager.js
function unrollEvents(events) {
  const allEvents = /* @__PURE__ */ new Set();
  function addEvents(events2) {
    for (const event of events2) {
      allEvents.add(event);
    }
  }
  for (const event of events) {
    switch (event) {
      case chromium_bidi_exports.BiDiModule.Bluetooth:
        addEvents(Object.values(chromium_bidi_exports.Bluetooth.EventNames));
        break;
      case chromium_bidi_exports.BiDiModule.BrowsingContext:
        addEvents(Object.values(chromium_bidi_exports.BrowsingContext.EventNames));
        break;
      case chromium_bidi_exports.BiDiModule.Input:
        addEvents(Object.values(chromium_bidi_exports.Input.EventNames));
        break;
      case chromium_bidi_exports.BiDiModule.Log:
        addEvents(Object.values(chromium_bidi_exports.Log.EventNames));
        break;
      case chromium_bidi_exports.BiDiModule.Network:
        addEvents(Object.values(chromium_bidi_exports.Network.EventNames));
        break;
      case chromium_bidi_exports.BiDiModule.Script:
        addEvents(Object.values(chromium_bidi_exports.Script.EventNames));
        break;
      case chromium_bidi_exports.BiDiModule.Speculation:
        addEvents(Object.values(chromium_bidi_exports.Speculation.EventNames));
        break;
      default:
        allEvents.add(event);
    }
  }
  return allEvents.values();
}
var SubscriptionManager = class {
  #subscriptions = [];
  #knownSubscriptionIds = /* @__PURE__ */ new Set();
  #browsingContextStorage;
  constructor(browsingContextStorage) {
    this.#browsingContextStorage = browsingContextStorage;
  }
  getGoogChannelsSubscribedToEvent(eventName, contextId) {
    const googChannels = /* @__PURE__ */ new Set();
    for (const subscription of this.#subscriptions) {
      if (this.#isSubscribedTo(subscription, eventName, contextId)) {
        googChannels.add(subscription.googChannel);
      }
    }
    return Array.from(googChannels);
  }
  getGoogChannelsSubscribedToEventGlobally(eventName) {
    const googChannels = /* @__PURE__ */ new Set();
    for (const subscription of this.#subscriptions) {
      if (this.#isSubscribedTo(subscription, eventName)) {
        googChannels.add(subscription.googChannel);
      }
    }
    return Array.from(googChannels);
  }
  #isSubscribedTo(subscription, moduleOrEvent, browsingContextId) {
    let includesEvent = false;
    for (const eventName of subscription.eventNames) {
      if (
        // Event explicitly subscribed
        eventName === moduleOrEvent || // Event subscribed via module
        eventName === moduleOrEvent.split(".").at(0) || // Event explicitly subscribed compared to module
        eventName.split(".").at(0) === moduleOrEvent
      ) {
        includesEvent = true;
        break;
      }
    }
    if (!includesEvent) {
      return false;
    }
    if (subscription.userContextIds.size !== 0) {
      if (!browsingContextId) {
        return false;
      }
      const context = this.#browsingContextStorage.findContext(browsingContextId);
      if (!context) {
        return false;
      }
      return subscription.userContextIds.has(context.userContext);
    }
    if (subscription.topLevelTraversableIds.size !== 0) {
      if (!browsingContextId) {
        return false;
      }
      const topLevelContext = this.#browsingContextStorage.findTopLevelContextId(browsingContextId);
      return topLevelContext !== null && subscription.topLevelTraversableIds.has(topLevelContext);
    }
    return true;
  }
  isSubscribedTo(moduleOrEvent, contextId) {
    for (const subscription of this.#subscriptions) {
      if (this.#isSubscribedTo(subscription, moduleOrEvent, contextId)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Subscribes to event in the given context and goog:channel.
   * @return {SubscriptionItem[]} List of
   * subscriptions. If the event is a whole module, it will return all the specific
   * events. If the contextId is null, it will return all the top-level contexts which were
   * not subscribed before the command.
   */
  subscribe(eventNames, contextIds, userContextIds, googChannel) {
    const subscription = {
      id: uuidv4(),
      eventNames: new Set(unrollEvents(eventNames)),
      topLevelTraversableIds: new Set(contextIds.map((contextId) => {
        const topLevelContext = this.#browsingContextStorage.findTopLevelContextId(contextId);
        if (!topLevelContext) {
          throw new NoSuchFrameException(`Top-level navigable not found for context id ${contextId}`);
        }
        return topLevelContext;
      })),
      userContextIds: new Set(userContextIds),
      googChannel
    };
    this.#subscriptions.push(subscription);
    this.#knownSubscriptionIds.add(subscription.id);
    return subscription;
  }
  /**
   * Unsubscribes atomically from all events in the given contexts and channel.
   *
   * This is a legacy spec branch to unsubscribe by attributes.
   */
  unsubscribe(inputEventNames, googChannel) {
    const eventNames = new Set(unrollEvents(inputEventNames));
    const newSubscriptions = [];
    const eventsMatched = /* @__PURE__ */ new Set();
    for (const subscription of this.#subscriptions) {
      if (subscription.googChannel !== googChannel) {
        newSubscriptions.push(subscription);
        continue;
      }
      if (subscription.userContextIds.size !== 0) {
        newSubscriptions.push(subscription);
        continue;
      }
      if (intersection(subscription.eventNames, eventNames).size === 0) {
        newSubscriptions.push(subscription);
        continue;
      }
      if (subscription.topLevelTraversableIds.size !== 0) {
        newSubscriptions.push(subscription);
        continue;
      }
      const subscriptionEventNames = new Set(subscription.eventNames);
      for (const eventName of eventNames) {
        if (subscriptionEventNames.has(eventName)) {
          eventsMatched.add(eventName);
          subscriptionEventNames.delete(eventName);
        }
      }
      if (subscriptionEventNames.size !== 0) {
        newSubscriptions.push({
          ...subscription,
          eventNames: subscriptionEventNames
        });
      }
    }
    if (!equal(eventsMatched, eventNames)) {
      throw new InvalidArgumentException("No subscription found");
    }
    this.#subscriptions = newSubscriptions;
  }
  /**
   * Unsubscribes by subscriptionId.
   */
  unsubscribeById(subscriptionIds) {
    const subscriptionIdsSet = new Set(subscriptionIds);
    const unknownIds = difference(subscriptionIdsSet, this.#knownSubscriptionIds);
    if (unknownIds.size !== 0) {
      throw new InvalidArgumentException("No subscription found");
    }
    this.#subscriptions = this.#subscriptions.filter((subscription) => {
      return !subscriptionIdsSet.has(subscription.id);
    });
    this.#knownSubscriptionIds = difference(this.#knownSubscriptionIds, subscriptionIdsSet);
  }
};
function intersection(setA, setB) {
  const result = /* @__PURE__ */ new Set();
  for (const a of setA) {
    if (setB.has(a)) {
      result.add(a);
    }
  }
  return result;
}
function difference(setA, setB) {
  const result = /* @__PURE__ */ new Set();
  for (const a of setA) {
    if (!setB.has(a)) {
      result.add(a);
    }
  }
  return result;
}
function equal(setA, setB) {
  if (setA.size !== setB.size) {
    return false;
  }
  for (const a of setA) {
    if (!setB.has(a)) {
      return false;
    }
  }
  return true;
}

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/session/EventManager.js
var _a5;
var EventWrapper = class {
  #idWrapper = new IdWrapper();
  #contextId;
  #event;
  constructor(event, contextId) {
    this.#event = event;
    this.#contextId = contextId;
  }
  get id() {
    return this.#idWrapper.id;
  }
  get contextId() {
    return this.#contextId;
  }
  get event() {
    if (typeof this.#event === "function") {
      this.#event = this.#event();
    }
    return this.#event;
  }
};
var EventManagerEvents;
(function(EventManagerEvents2) {
  EventManagerEvents2["Event"] = "event";
})(EventManagerEvents || (EventManagerEvents = {}));
var eventBufferLength = /* @__PURE__ */ new Map([[chromium_bidi_exports.Log.EventNames.LogEntryAdded, 100]]);
var EventManager = class extends EventEmitter2 {
  /**
   * Maps event name to a set of contexts where this event already happened.
   * Needed for getting buffered events from all the contexts in case of
   * subscripting to all contexts.
   */
  #eventToContextsMap = new DefaultMap(() => /* @__PURE__ */ new Set());
  /**
   * Maps `eventName` + `browsingContext` to buffer. Used to get buffered events
   * during subscription. Channel-agnostic.
   */
  #eventBuffers = /* @__PURE__ */ new Map();
  /**
   * Maps `eventName` + `browsingContext` to  Map of goog:channel to last id.
   * Used to avoid sending duplicated events when user
   * subscribes -> unsubscribes -> subscribes.
   */
  #lastMessageSent = /* @__PURE__ */ new Map();
  #subscriptionManager;
  #browsingContextStorage;
  /**
   * Map of event name to hooks to be called when client is subscribed to the event.
   */
  #subscribeHooks;
  #userContextStorage;
  constructor(browsingContextStorage, userContextStorage) {
    super();
    this.#browsingContextStorage = browsingContextStorage;
    this.#userContextStorage = userContextStorage;
    this.#subscriptionManager = new SubscriptionManager(browsingContextStorage);
    this.#subscribeHooks = new DefaultMap(() => []);
  }
  get subscriptionManager() {
    return this.#subscriptionManager;
  }
  /**
   * Returns consistent key to be used to access value maps.
   */
  static #getMapKey(eventName, browsingContext) {
    return JSON.stringify({ eventName, browsingContext });
  }
  addSubscribeHook(event, hook) {
    this.#subscribeHooks.get(event).push(hook);
  }
  registerEvent(event, contextId) {
    this.registerPromiseEvent(Promise.resolve({
      kind: "success",
      value: event
    }), contextId, event.method);
  }
  registerGlobalEvent(event) {
    this.registerGlobalPromiseEvent(Promise.resolve({
      kind: "success",
      value: event
    }), event.method);
  }
  registerPromiseEvent(event, contextId, eventName) {
    const eventWrapper = new EventWrapper(event, contextId);
    const sortedGoogChannels = this.#subscriptionManager.getGoogChannelsSubscribedToEvent(eventName, contextId);
    this.#bufferEvent(eventWrapper, eventName);
    for (const googChannel of sortedGoogChannels) {
      this.emit("event", {
        message: OutgoingMessage.createFromPromise(eventWrapper.event, googChannel),
        event: eventName
      });
      this.#markEventSent(eventWrapper, googChannel, eventName);
    }
  }
  registerGlobalPromiseEvent(event, eventName) {
    const eventWrapper = new EventWrapper(event, null);
    const sortedGoogChannels = this.#subscriptionManager.getGoogChannelsSubscribedToEventGlobally(eventName);
    this.#bufferEvent(eventWrapper, eventName);
    for (const googChannel of sortedGoogChannels) {
      this.emit("event", {
        message: OutgoingMessage.createFromPromise(eventWrapper.event, googChannel),
        event: eventName
      });
      this.#markEventSent(eventWrapper, googChannel, eventName);
    }
  }
  async subscribe(eventNames, contextIds, userContextIds, googChannel) {
    for (const name of eventNames) {
      assertSupportedEvent(name);
    }
    if (userContextIds.length && contextIds.length) {
      throw new InvalidArgumentException("Both userContexts and contexts cannot be specified.");
    }
    this.#browsingContextStorage.verifyContextsList(contextIds);
    await this.#userContextStorage.verifyUserContextIdList(userContextIds);
    const unrolledEventNames = new Set(unrollEvents(eventNames));
    const subscribeStepEvents = /* @__PURE__ */ new Map();
    const subscriptionNavigableIds = new Set(contextIds.length ? contextIds.map((contextId) => {
      const id = this.#browsingContextStorage.findTopLevelContextId(contextId);
      if (!id) {
        throw new InvalidArgumentException("Invalid context id");
      }
      return id;
    }) : this.#browsingContextStorage.getTopLevelContexts().map((c) => c.id));
    for (const eventName of unrolledEventNames) {
      const subscribedNavigableIds = new Set(this.#browsingContextStorage.getTopLevelContexts().map((c) => c.id).filter((id) => {
        return this.#subscriptionManager.isSubscribedTo(eventName, id);
      }));
      subscribeStepEvents.set(eventName, difference(subscriptionNavigableIds, subscribedNavigableIds));
    }
    const subscription = this.#subscriptionManager.subscribe(eventNames, contextIds, userContextIds, googChannel);
    for (const eventName of subscription.eventNames) {
      for (const contextId of subscriptionNavigableIds) {
        for (const eventWrapper of this.#getBufferedEvents(eventName, contextId, googChannel)) {
          this.emit("event", {
            message: OutgoingMessage.createFromPromise(eventWrapper.event, googChannel),
            event: eventName
          });
          this.#markEventSent(eventWrapper, googChannel, eventName);
        }
      }
    }
    for (const [eventName, contextIds2] of subscribeStepEvents) {
      for (const contextId of contextIds2) {
        this.#subscribeHooks.get(eventName).forEach((hook) => hook(contextId));
      }
    }
    await this.toggleModulesIfNeeded();
    return subscription.id;
  }
  async unsubscribe(eventNames, googChannel) {
    for (const name of eventNames) {
      assertSupportedEvent(name);
    }
    this.#subscriptionManager.unsubscribe(eventNames, googChannel);
    await this.toggleModulesIfNeeded();
  }
  async unsubscribeByIds(subscriptionIds) {
    this.#subscriptionManager.unsubscribeById(subscriptionIds);
    await this.toggleModulesIfNeeded();
  }
  async toggleModulesIfNeeded() {
    await Promise.all(this.#browsingContextStorage.getAllContexts().map(async (context) => {
      return await context.toggleModulesIfNeeded();
    }));
  }
  clearBufferedEvents(contextId) {
    for (const eventName of eventBufferLength.keys()) {
      const bufferMapKey = _a5.#getMapKey(eventName, contextId);
      this.#eventBuffers.delete(bufferMapKey);
    }
  }
  /**
   * If the event is buffer-able, put it in the buffer.
   */
  #bufferEvent(eventWrapper, eventName) {
    if (!eventBufferLength.has(eventName)) {
      return;
    }
    const bufferMapKey = _a5.#getMapKey(eventName, eventWrapper.contextId);
    if (!this.#eventBuffers.has(bufferMapKey)) {
      this.#eventBuffers.set(bufferMapKey, new Buffer2(eventBufferLength.get(eventName)));
    }
    this.#eventBuffers.get(bufferMapKey).add(eventWrapper);
    this.#eventToContextsMap.get(eventName).add(eventWrapper.contextId);
  }
  /**
   * If the event is buffer-able, mark it as sent to the given contextId and goog:channel.
   */
  #markEventSent(eventWrapper, googChannel, eventName) {
    if (!eventBufferLength.has(eventName)) {
      return;
    }
    const lastSentMapKey = _a5.#getMapKey(eventName, eventWrapper.contextId);
    const lastId = Math.max(this.#lastMessageSent.get(lastSentMapKey)?.get(googChannel) ?? 0, eventWrapper.id);
    const googChannelMap = this.#lastMessageSent.get(lastSentMapKey);
    if (googChannelMap) {
      googChannelMap.set(googChannel, lastId);
    } else {
      this.#lastMessageSent.set(lastSentMapKey, /* @__PURE__ */ new Map([[googChannel, lastId]]));
    }
  }
  /**
   * Returns events which are buffered and not yet sent to the given goog:channel events.
   */
  #getBufferedEvents(eventName, contextId, googChannel) {
    const bufferMapKey = _a5.#getMapKey(eventName, contextId);
    const lastSentMessageId = this.#lastMessageSent.get(bufferMapKey)?.get(googChannel) ?? -Infinity;
    const result = this.#eventBuffers.get(bufferMapKey)?.get().filter((wrapper) => wrapper.id > lastSentMessageId) ?? [];
    if (contextId === null) {
      Array.from(this.#eventToContextsMap.get(eventName).keys()).filter((_contextId) => (
        // Events without context are already in the result.
        _contextId !== null && // Events from deleted contexts should not be sent.
        this.#browsingContextStorage.hasContext(_contextId)
      )).map((_contextId) => this.#getBufferedEvents(eventName, _contextId, googChannel)).forEach((events) => result.push(...events));
    }
    return result.sort((e1, e2) => e1.id - e2.id);
  }
};
_a5 = EventManager;

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/speculation/SpeculationProcessor.js
var SpeculationProcessor = class {
  #eventManager;
  #logger;
  constructor(eventManager, logger) {
    this.#eventManager = eventManager;
    this.#logger = logger;
  }
  onCdpTargetCreated(cdpTarget) {
    cdpTarget.cdpClient.on("Preload.prefetchStatusUpdated", (event) => {
      let prefetchStatus;
      switch (event.status) {
        case "Running":
          prefetchStatus = Speculation2.PreloadingStatus.Pending;
          break;
        case "Ready":
          prefetchStatus = Speculation2.PreloadingStatus.Ready;
          break;
        case "Success":
          prefetchStatus = Speculation2.PreloadingStatus.Success;
          break;
        case "Failure":
          prefetchStatus = Speculation2.PreloadingStatus.Failure;
          break;
        default:
          this.#logger?.(LogType.debugWarn)?.(`Unknown prefetch status: ${event.status}`);
          return;
      }
      this.#eventManager.registerEvent({
        type: "event",
        method: "speculation.prefetchStatusUpdated",
        params: {
          context: event.initiatingFrameId,
          url: event.prefetchUrl,
          status: prefetchStatus
        }
      }, cdpTarget.id);
    });
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/modules/digitalCredentials/DigitalCredentialsProcessor.js
var DigitalCredentialsProcessor = class {
  #browsingContextStorage;
  #contextConfigStorage;
  constructor(browsingContextStorage, contextConfigStorage) {
    this.#browsingContextStorage = browsingContextStorage;
    this.#contextConfigStorage = contextConfigStorage;
  }
  async setVirtualWalletBehavior(params) {
    const { context, action, protocol, response } = params;
    if (action === DigitalCredentials.VirtualWalletAction.Respond) {
      if (protocol === void 0 || response === void 0) {
        throw new InvalidArgumentException("Protocol and response are required when action is 'respond'");
      }
    } else {
      if (protocol !== void 0 || response !== void 0) {
        throw new InvalidArgumentException("Protocol and response are only allowed when action is 'respond'");
      }
    }
    if (context === void 0) {
      if (action === DigitalCredentials.VirtualWalletAction.Clear) {
        this.#contextConfigStorage.updateGlobalConfig({
          digitalCredentialsBehavior: null
        });
      } else {
        this.#contextConfigStorage.updateGlobalConfig({
          digitalCredentialsBehavior: { action, protocol, response }
        });
      }
    } else {
      const browsingContext = this.#browsingContextStorage.getContext(context);
      if (browsingContext.parentId !== null) {
        throw new UnsupportedOperationException("Only top-level contexts are supported");
      }
      if (action === DigitalCredentials.VirtualWalletAction.Clear) {
        this.#contextConfigStorage.updateBrowsingContextConfig(context, {
          digitalCredentialsBehavior: null
        });
      } else {
        this.#contextConfigStorage.updateBrowsingContextConfig(context, {
          digitalCredentialsBehavior: { action, protocol, response }
        });
      }
    }
    await this.#applyToAllTargets();
    return {};
  }
  async #applyToAllTargets() {
    const contexts = this.#browsingContextStorage.getAllContexts();
    const targets = /* @__PURE__ */ new Set();
    for (const c of contexts) {
      targets.add(c.cdpTarget);
    }
    await Promise.all(Array.from(targets).map((target) => this.#applyBehaviorToTarget(target)));
  }
  async #applyBehaviorToTarget(target) {
    if (target.id !== target.topLevelId) {
      return;
    }
    const config = this.#contextConfigStorage.getActiveConfig(target.topLevelId, target.userContext);
    const behavior = config.digitalCredentialsBehavior;
    if (behavior === null || behavior === void 0) {
      await this.#sendCdpCommand(target, {
        action: DigitalCredentials.VirtualWalletAction.Clear
      });
      return;
    }
    await this.#sendCdpCommand(target, behavior);
  }
  async #sendCdpCommand(cdpTarget, behavior) {
    await cdpTarget.cdpClient.sendCommand("DigitalCredentials.setVirtualWalletBehavior", {
      action: behavior.action,
      protocol: behavior.protocol,
      response: behavior.response
    });
  }
};

// node_modules/chromium-bidi/out/Default/gen/src/bidiMapper/BidiServer.js
var BidiServer = class _BidiServer extends EventEmitter2 {
  #messageQueue;
  #transport;
  #commandProcessor;
  #eventManager;
  #browsingContextStorage = new BrowsingContextStorage();
  #realmStorage = new RealmStorage();
  #preloadScriptStorage = new PreloadScriptStorage();
  #bluetoothProcessor;
  #speculationProcessor;
  #digitalCredentialsProcessor;
  #logger;
  #handleIncomingMessage = (message) => {
    void this.#commandProcessor.processCommand(message).catch((error) => {
      this.#logger?.(LogType.debugError)?.(error);
    });
  };
  #processOutgoingMessage = async (messageEntry) => {
    const message = messageEntry.message;
    if (messageEntry.googChannel !== null) {
      message["goog:channel"] = messageEntry.googChannel;
    }
    await this.#transport.sendMessage(message);
  };
  constructor(bidiTransport, cdpConnection, browserCdpClient, selfTargetId, defaultUserContextId, defaultUserAgent, parser, logger) {
    super();
    this.#logger = logger;
    this.#messageQueue = new ProcessingQueue(this.#processOutgoingMessage, this.#logger);
    this.#transport = bidiTransport;
    this.#transport.setOnMessage(this.#handleIncomingMessage);
    const contextConfigStorage = new ContextConfigStorage();
    const userContextStorage = new UserContextStorage(browserCdpClient);
    this.#eventManager = new EventManager(this.#browsingContextStorage, userContextStorage);
    const networkStorage = new NetworkStorage(this.#eventManager, this.#browsingContextStorage, browserCdpClient, logger);
    this.#bluetoothProcessor = new BluetoothProcessor(this.#eventManager, this.#browsingContextStorage);
    this.#speculationProcessor = new SpeculationProcessor(this.#eventManager, this.#logger);
    this.#digitalCredentialsProcessor = new DigitalCredentialsProcessor(this.#browsingContextStorage, contextConfigStorage);
    this.#commandProcessor = new CommandProcessor(cdpConnection, browserCdpClient, this.#eventManager, this.#browsingContextStorage, this.#realmStorage, this.#preloadScriptStorage, networkStorage, contextConfigStorage, this.#bluetoothProcessor, this.#digitalCredentialsProcessor, userContextStorage, parser, async (options) => {
      await browserCdpClient.sendCommand("Security.setIgnoreCertificateErrors", {
        ignore: options.acceptInsecureCerts ?? false
      });
      contextConfigStorage.updateGlobalConfig({
        acceptInsecureCerts: options.acceptInsecureCerts ?? false,
        userPromptHandler: options.unhandledPromptBehavior,
        prerenderingDisabled: options?.["goog:prerenderingDisabled"] ?? false,
        disableNetworkDurableMessages: options?.["goog:disableNetworkDurableMessages"]
      });
      new CdpTargetManager(cdpConnection, browserCdpClient, selfTargetId, this.#eventManager, this.#browsingContextStorage, this.#realmStorage, networkStorage, contextConfigStorage, this.#bluetoothProcessor, this.#speculationProcessor, this.#preloadScriptStorage, defaultUserContextId, defaultUserAgent, logger);
      await browserCdpClient.sendCommand("Target.setDiscoverTargets", {
        discover: true
      });
      await browserCdpClient.sendCommand("Target.setAutoAttach", {
        autoAttach: true,
        waitForDebuggerOnStart: true,
        flatten: true,
        // Browser session should attach to tab instead of the page, so that
        // prerendering is not blocked.
        filter: [
          {
            type: "page",
            exclude: true
          },
          {}
        ]
      });
      await this.#topLevelContextsLoaded();
    }, this.#logger);
    this.#eventManager.on("event", ({ message, event }) => {
      this.emitOutgoingMessage(message, event);
    });
    this.#commandProcessor.on("response", ({ message, event }) => {
      this.emitOutgoingMessage(message, event);
    });
  }
  /**
   * Creates and starts BiDi Mapper instance.
   */
  static async createAndStart(bidiTransport, cdpConnection, browserCdpClient, selfTargetId, parser, logger) {
    const [defaultUserContextId, version] = await Promise.all([
      this.#getDefaultUserContextId(browserCdpClient),
      // Fetch the default User Agent to be used in `CdpTarget`. This allows to avoid
      // round trips to the browser for every target override.
      browserCdpClient.sendCommand("Browser.getVersion"),
      // Required for `Browser.downloadWillBegin` events.
      browserCdpClient.sendCommand("Browser.setDownloadBehavior", {
        behavior: "default",
        eventsEnabled: true
      })
    ]);
    const server = new _BidiServer(bidiTransport, cdpConnection, browserCdpClient, selfTargetId, defaultUserContextId, version.userAgent, parser, logger);
    return server;
  }
  static async #getDefaultUserContextId(browserCdpClient) {
    const [{ defaultBrowserContextId, browserContextIds }, { targetInfos }] = await Promise.all([
      browserCdpClient.sendCommand("Target.getBrowserContexts"),
      browserCdpClient.sendCommand("Target.getTargets")
    ]);
    if (defaultBrowserContextId) {
      return defaultBrowserContextId;
    }
    for (const info of targetInfos) {
      if (info.browserContextId && !browserContextIds.includes(info.browserContextId)) {
        return info.browserContextId;
      }
    }
    return "default";
  }
  /**
   * Sends BiDi message.
   */
  emitOutgoingMessage(messageEntry, event) {
    this.#messageQueue.add(messageEntry, event);
  }
  close() {
    this.#transport.close();
  }
  async #topLevelContextsLoaded() {
    await Promise.all(this.#browsingContextStorage.getTopLevelContexts().map((c) => c.lifecycleLoaded()));
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/CDPSession.js
var BidiCdpSession = class _BidiCdpSession extends CDPSession {
  static sessions = /* @__PURE__ */ new Map();
  #detached = false;
  #connection;
  #sessionId = Deferred.create();
  frame;
  constructor(frame, sessionId) {
    super();
    this.frame = frame;
    if (!this.frame.page().browser().cdpSupported) {
      return;
    }
    const connection = this.frame.page().browser().connection;
    this.#connection = connection;
    if (sessionId) {
      this.#sessionId.resolve(sessionId);
      _BidiCdpSession.sessions.set(sessionId, this);
    } else {
      (async () => {
        try {
          const { result } = await connection.send("goog:cdp.getSession", {
            context: frame._id
          });
          this.#sessionId.resolve(result.session);
          _BidiCdpSession.sessions.set(result.session, this);
        } catch (error) {
          this.#sessionId.reject(error);
        }
      })();
    }
    _BidiCdpSession.sessions.set(this.#sessionId.value(), this);
  }
  connection() {
    return void 0;
  }
  get detached() {
    return this.#detached;
  }
  async send(method, params, options) {
    if (this.#connection === void 0) {
      throw new UnsupportedOperation("CDP support is required for this feature. The current browser does not support CDP.");
    }
    if (this.#detached) {
      throw new TargetCloseError(`Protocol error (${method}): Session closed. Most likely the page has been closed.`);
    }
    const session = await this.#sessionId.valueOrThrow();
    const { result } = await this.#connection.send("goog:cdp.sendCommand", {
      method,
      params,
      session
    }, options?.timeout);
    return result.result;
  }
  async detach() {
    if (this.#connection === void 0 || this.#connection.closed || this.#detached) {
      return;
    }
    try {
      await this.frame.client.send("Target.detachFromTarget", {
        sessionId: this.id()
      });
    } finally {
      this.onClose();
    }
  }
  /**
   * @internal
   */
  onClose = () => {
    _BidiCdpSession.sessions.delete(this.id());
    this.#detached = true;
  };
  id() {
    const value = this.#sessionId.value();
    return typeof value === "string" ? value : "";
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/Connection.js
var BidiConnection = class extends EventEmitter {
  #url;
  #transport;
  #delay;
  #timeout = 0;
  #closed = false;
  #logger;
  #callbacks;
  #emitters = [];
  #debugProtocolSend;
  #debugProtocolReceive;
  constructor(url, transport, idGenerator, delay = 0, timeout2 = void 0, logger) {
    super();
    this.#url = url;
    this.#delay = delay;
    this.#timeout = timeout2 ?? 18e4;
    this.#callbacks = new CallbackRegistry(idGenerator, logger);
    this.#debugProtocolSend = logger?.(DEBUG_PREFIXES.bidiSend);
    this.#debugProtocolReceive = logger?.(DEBUG_PREFIXES.bidiReceive);
    this.#transport = transport;
    this.#transport.onmessage = this.onMessage.bind(this);
    this.#transport.onclose = this.unbind.bind(this);
  }
  get closed() {
    return this.#closed;
  }
  get url() {
    return this.#url;
  }
  pipeTo(emitter) {
    this.#emitters.push(emitter);
  }
  #toWebDriverOnlyEvent(event) {
    for (const key in event) {
      if (key.startsWith("goog:")) {
        delete event[key];
      } else {
        if (typeof event[key] === "object" && event[key] !== null) {
          this.#toWebDriverOnlyEvent(event[key]);
        }
      }
    }
  }
  emit(type, event) {
    if (process.env["PUPPETEER_WEBDRIVER_BIDI_ONLY"] === "true") {
      this.#toWebDriverOnlyEvent(event);
    }
    for (const emitter of this.#emitters) {
      emitter.emit(type, event);
    }
    return super.emit(type, event);
  }
  send(method, params, timeout2) {
    if (this.#closed) {
      return Promise.reject(new ConnectionClosedError("Connection closed."));
    }
    return this.#callbacks.create(method, timeout2 ?? this.#timeout, (id) => {
      const stringifiedMessage = JSON.stringify({
        id,
        method,
        params
      });
      this.#debugProtocolSend?.(stringifiedMessage);
      this.#transport.send(stringifiedMessage);
    });
  }
  /**
   * @internal
   */
  async onMessage(message) {
    if (this.#delay) {
      await new Promise((f) => {
        return setTimeout(f, this.#delay);
      });
    }
    this.#debugProtocolReceive?.(message);
    const object = JSON.parse(message);
    if ("type" in object) {
      switch (object.type) {
        case "success":
          this.#callbacks.resolve(object.id, object);
          return;
        case "error":
          if (object.id === null) {
            break;
          }
          this.#callbacks.reject(object.id, createProtocolError(object), `${object.error}: ${object.message}`);
          return;
        case "event":
          if (isCdpEvent2(object) && object.params.session) {
            BidiCdpSession.sessions.get(object.params.session)?.emit(object.params.event, object.params.params);
            return;
          }
          this.emit(object.method, object.params);
          return;
      }
    }
    if ("id" in object) {
      this.#callbacks.reject(object.id, `Protocol Error. Message is not in BiDi protocol format: '${message}'`, object.message);
    }
    this.#logger?.(DEBUG_PREFIXES.error)?.(object);
  }
  /**
   * Unbinds the connection, but keeps the transport open. Useful when the transport will
   * be reused by other connection e.g. with different protocol.
   * @internal
   */
  unbind() {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#transport.onmessage = () => {
    };
    this.#transport.onclose = () => {
    };
    this.#callbacks.clear();
  }
  /**
   * Unbinds the connection and closes the transport.
   */
  dispose() {
    this.unbind();
    this.#transport.close();
  }
  getPendingProtocolErrors() {
    return this.#callbacks.getPendingProtocolErrors();
  }
};
function createProtocolError(object) {
  let message = `${object.error} ${object.message}`;
  if (object.stacktrace) {
    message += ` ${object.stacktrace}`;
  }
  return message;
}
function isCdpEvent2(event) {
  return event.method.startsWith("goog:cdp.");
}

// node_modules/puppeteer-core/lib/puppeteer/bidi/BidiOverCdp.js
async function connectBidiOverCdp(cdp, logger) {
  const bidiServerLogger = logger ? (prefix) => {
    return logger(`bidi:${prefix}`);
  } : void 0;
  const transportBiDi = new NoOpTransport();
  const cdpConnectionAdapter = new CdpConnectionAdapter(cdp);
  const pptrTransport = {
    send(message) {
      transportBiDi.emitMessage(JSON.parse(message));
    },
    close() {
      bidiServer.close();
      cdpConnectionAdapter.close();
      cdp.dispose();
    },
    onmessage(_message) {
    }
  };
  transportBiDi.on("bidiResponse", (message) => {
    pptrTransport.onmessage(JSON.stringify(message));
  });
  const pptrBiDiConnection = new BidiConnection(cdp.url(), pptrTransport, cdp._idGenerator, cdp.delay, cdp.timeout, logger);
  const bidiServer = await BidiMapper_exports.BidiServer.createAndStart(
    transportBiDi,
    cdpConnectionAdapter,
    cdpConnectionAdapter.browserClient(),
    /* selfTargetId= */
    "",
    void 0,
    bidiServerLogger
  );
  return pptrBiDiConnection;
}
var CdpConnectionAdapter = class {
  #cdp;
  #adapters = /* @__PURE__ */ new Map();
  #browserCdpConnection;
  constructor(cdp) {
    this.#cdp = cdp;
    this.#browserCdpConnection = new CDPClientAdapter(cdp);
  }
  browserClient() {
    return this.#browserCdpConnection;
  }
  getCdpClient(id) {
    const session = this.#cdp.session(id);
    if (!session) {
      throw new Error(`Unknown CDP session with id ${id}`);
    }
    if (!this.#adapters.has(session)) {
      const adapter = new CDPClientAdapter(session, id, this.#browserCdpConnection);
      this.#adapters.set(session, adapter);
      return adapter;
    }
    return this.#adapters.get(session);
  }
  close() {
    this.#browserCdpConnection.close();
    for (const adapter of this.#adapters.values()) {
      adapter.close();
    }
  }
};
var CDPClientAdapter = class extends BidiMapper_exports.EventEmitter {
  #closed = false;
  #client;
  sessionId = void 0;
  #browserClient;
  constructor(client, sessionId, browserClient) {
    super();
    this.#client = client;
    this.sessionId = sessionId;
    this.#browserClient = browserClient;
    this.#client.on("*", this.#forwardMessage);
  }
  browserClient() {
    return this.#browserClient;
  }
  #forwardMessage = (method, event) => {
    this.emit(method, event);
  };
  async sendCommand(method, ...params) {
    if (this.#closed) {
      return;
    }
    try {
      return await this.#client.send(method, ...params);
    } catch (err) {
      if (this.#closed) {
        return;
      }
      throw err;
    }
  }
  close() {
    this.#client.off("*", this.#forwardMessage);
    this.#closed = true;
  }
  isCloseError(error) {
    return error instanceof TargetCloseError;
  }
};
var NoOpTransport = class extends BidiMapper_exports.EventEmitter {
  #onMessage = async (_m) => {
    return;
  };
  emitMessage(message) {
    void this.#onMessage(message);
  }
  setOnMessage(onMessage) {
    this.#onMessage = onMessage;
  }
  async sendMessage(message) {
    this.emit("bidiResponse", message);
  }
  close() {
    this.#onMessage = async (_m) => {
      return;
    };
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/Browser.js
var Bidi9 = __toESM(require_out(), 1);

// node_modules/puppeteer-core/lib/puppeteer/bidi/BrowserContext.js
var Bidi8 = __toESM(require_out(), 1);

// node_modules/puppeteer-core/lib/puppeteer/bidi/BluetoothEmulation.js
var BidiBluetoothEmulation = class {
  #session;
  #contextId;
  constructor(contextId, session) {
    this.#contextId = contextId;
    this.#session = session;
  }
  async emulateAdapter(state, leSupported = true) {
    await this.#session.send("bluetooth.simulateAdapter", {
      context: this.#contextId,
      state,
      leSupported
    });
  }
  async disableEmulation() {
    await this.#session.send("bluetooth.disableSimulation", {
      context: this.#contextId
    });
  }
  async simulatePreconnectedPeripheral(preconnectedPeripheral) {
    await this.#session.send("bluetooth.simulatePreconnectedPeripheral", {
      context: this.#contextId,
      address: preconnectedPeripheral.address,
      name: preconnectedPeripheral.name,
      manufacturerData: preconnectedPeripheral.manufacturerData,
      knownServiceUuids: preconnectedPeripheral.knownServiceUuids
    });
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/DeviceRequestPrompt.js
var BidiDeviceRequestPromptManager = class {
  #session;
  #contextId;
  #enabled = false;
  constructor(contextId, session) {
    this.#session = session;
    this.#contextId = contextId;
  }
  async #enableIfNeeded() {
    if (!this.#enabled) {
      this.#enabled = true;
      await this.#session.subscribe(["bluetooth.requestDevicePromptUpdated"], [this.#contextId]);
    }
  }
  async waitForDevicePrompt(timeout2, signal) {
    const deferred = Deferred.create({
      message: `Waiting for \`DeviceRequestPrompt\` failed: ${timeout2}ms exceeded`,
      timeout: timeout2
    });
    const onRequestDevicePromptUpdated = (params) => {
      if (params.context === this.#contextId) {
        deferred.resolve(new BidiDeviceRequestPrompt(this.#contextId, params.prompt, this.#session, params.devices));
        this.#session.off("bluetooth.requestDevicePromptUpdated", onRequestDevicePromptUpdated);
      }
    };
    this.#session.on("bluetooth.requestDevicePromptUpdated", onRequestDevicePromptUpdated);
    if (signal) {
      signal.addEventListener("abort", () => {
        deferred.reject(signal.reason);
      }, { once: true });
    }
    await this.#enableIfNeeded();
    return await deferred.valueOrThrow();
  }
};
var BidiDeviceRequestPrompt = class extends DeviceRequestPrompt {
  #session;
  #promptId;
  #contextId;
  constructor(contextId, promptId, session, devices) {
    super();
    this.#session = session;
    this.#promptId = promptId;
    this.#contextId = contextId;
    this.devices.push(...devices.map((d) => {
      return {
        id: d.id,
        name: d.name ?? "UNKNOWN"
      };
    }));
  }
  async cancel() {
    await this.#session.send("bluetooth.handleRequestDevicePrompt", {
      context: this.#contextId,
      prompt: this.#promptId,
      accept: false
    });
  }
  async select(device) {
    await this.#session.send("bluetooth.handleRequestDevicePrompt", {
      context: this.#contextId,
      prompt: this.#promptId,
      accept: true,
      device: device.id
    });
  }
  waitForDevice() {
    throw new UnsupportedOperation();
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/core/Navigation.js
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
var Navigation = (() => {
  var _a8;
  let _classSuper = EventEmitter;
  let _instanceExtraInitializers = [];
  let _dispose_decorators;
  return class Navigation2 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      __esDecorate(this, null, _dispose_decorators, { kind: "method", name: "dispose", static: false, private: false, access: { has: (obj) => "dispose" in obj, get: (obj) => obj.dispose }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    static from(context) {
      const navigation = new Navigation2(context);
      navigation.#initialize();
      return navigation;
    }
    #request = __runInitializers(this, _instanceExtraInitializers);
    #navigation;
    #browsingContext;
    #disposables = new DisposableStack();
    #id;
    constructor(context) {
      super();
      this.#browsingContext = context;
    }
    #initialize() {
      const browsingContextEmitter = this.#disposables.use(new EventEmitter(this.#browsingContext));
      browsingContextEmitter.once("closed", () => {
        this.emit("failed", {
          url: this.#browsingContext.url,
          timestamp: /* @__PURE__ */ new Date()
        });
        this.dispose();
      });
      browsingContextEmitter.on("request", (request) => {
        if (request.navigation === void 0 || // If a request with a navigation ID comes in, then the navigation ID is
        // for this navigation.
        !this.#matches(request.navigation)) {
          return;
        }
        this.#request = request;
        this.emit("request", request);
        const requestEmitter = this.#disposables.use(new EventEmitter(this.#request));
        requestEmitter.on("redirect", (request2) => {
          this.#request = request2;
        });
      });
      const sessionEmitter = this.#disposables.use(new EventEmitter(this.#session));
      sessionEmitter.on("browsingContext.navigationStarted", (info) => {
        if (info.context !== this.#browsingContext.id || this.#navigation !== void 0) {
          return;
        }
        this.#navigation = Navigation2.from(this.#browsingContext);
      });
      for (const eventName of [
        "browsingContext.domContentLoaded",
        "browsingContext.load",
        "browsingContext.navigationCommitted"
      ]) {
        sessionEmitter.on(eventName, (info) => {
          if (info.context !== this.#browsingContext.id || info.navigation === null || !this.#matches(info.navigation)) {
            return;
          }
          this.dispose();
        });
      }
      for (const [eventName, event] of [
        ["browsingContext.fragmentNavigated", "fragment"],
        ["browsingContext.navigationFailed", "failed"],
        ["browsingContext.navigationAborted", "aborted"]
      ]) {
        sessionEmitter.on(eventName, (info) => {
          if (info.context !== this.#browsingContext.id || // Note we don't check if `navigation` is null since `null` means the
          // fragment navigated.
          !this.#matches(info.navigation)) {
            return;
          }
          this.emit(event, {
            url: info.url,
            timestamp: new Date(info.timestamp)
          });
          this.dispose();
        });
      }
    }
    #matches(navigation) {
      if (this.#navigation !== void 0 && !this.#navigation.disposed) {
        return false;
      }
      if (this.#id === void 0) {
        this.#id = navigation;
        return true;
      }
      return this.#id === navigation;
    }
    get #session() {
      return this.#browsingContext.userContext.browser.session;
    }
    get disposed() {
      return this.#disposables.disposed;
    }
    get request() {
      return this.#request;
    }
    get navigation() {
      return this.#navigation;
    }
    dispose() {
      this[disposeSymbol]();
    }
    [(_dispose_decorators = [inertIfDisposed], disposeSymbol)]() {
      this.#disposables.dispose();
      super[disposeSymbol]();
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/core/Realm.js
var __runInitializers2 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate2 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var _a6;
var Realm3 = (() => {
  let _classSuper = EventEmitter;
  let _instanceExtraInitializers = [];
  let _dispose_decorators;
  let _disown_decorators;
  let _callFunction_decorators;
  let _evaluate_decorators;
  let _resolveExecutionContextId_decorators;
  return class Realm extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      __esDecorate2(this, null, _dispose_decorators, { kind: "method", name: "dispose", static: false, private: false, access: { has: (obj) => "dispose" in obj, get: (obj) => obj.dispose }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _disown_decorators, { kind: "method", name: "disown", static: false, private: false, access: { has: (obj) => "disown" in obj, get: (obj) => obj.disown }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _callFunction_decorators, { kind: "method", name: "callFunction", static: false, private: false, access: { has: (obj) => "callFunction" in obj, get: (obj) => obj.callFunction }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _evaluate_decorators, { kind: "method", name: "evaluate", static: false, private: false, access: { has: (obj) => "evaluate" in obj, get: (obj) => obj.evaluate }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate2(this, null, _resolveExecutionContextId_decorators, { kind: "method", name: "resolveExecutionContextId", static: false, private: false, access: { has: (obj) => "resolveExecutionContextId" in obj, get: (obj) => obj.resolveExecutionContextId }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    #reason = __runInitializers2(this, _instanceExtraInitializers);
    disposables = new DisposableStack();
    id;
    origin;
    executionContextId;
    constructor(id, origin) {
      super();
      this.id = id;
      this.origin = origin;
    }
    get disposed() {
      return this.#reason !== void 0;
    }
    get target() {
      return { realm: this.id };
    }
    dispose(reason) {
      this.#reason = reason;
      this[disposeSymbol]();
    }
    async disown(handles) {
      await this.session.send("script.disown", {
        target: this.target,
        handles
      });
    }
    async callFunction(functionDeclaration, awaitPromise, options = {}) {
      const { result } = await this.session.send("script.callFunction", {
        functionDeclaration,
        awaitPromise,
        target: this.target,
        ...options
      });
      return result;
    }
    async evaluate(expression, awaitPromise, options = {}) {
      const { result } = await this.session.send("script.evaluate", {
        expression,
        awaitPromise,
        target: this.target,
        ...options
      });
      return result;
    }
    async resolveExecutionContextId() {
      if (!this.executionContextId) {
        const { result } = await this.session.connection.send("goog:cdp.resolveRealm", { realm: this.id });
        this.executionContextId = result.executionContextId;
      }
      return this.executionContextId;
    }
    [(_dispose_decorators = [inertIfDisposed], _disown_decorators = [throwIfDisposed((realm) => {
      return realm.#reason;
    })], _callFunction_decorators = [throwIfDisposed((realm) => {
      return realm.#reason;
    })], _evaluate_decorators = [throwIfDisposed((realm) => {
      return realm.#reason;
    })], _resolveExecutionContextId_decorators = [throwIfDisposed((realm) => {
      return realm.#reason;
    })], disposeSymbol)]() {
      this.#reason ??= "Realm already destroyed, probably because all associated browsing contexts closed.";
      this.emit("destroyed", this.#reason);
      this.disposables.dispose();
      super[disposeSymbol]();
    }
  };
})();
var WindowRealm2 = class _WindowRealm extends Realm3 {
  static from(context, sandbox) {
    const realm = new _WindowRealm(context, sandbox);
    realm.#initialize();
    return realm;
  }
  browsingContext;
  sandbox;
  #workers = /* @__PURE__ */ new Map();
  constructor(context, sandbox) {
    super("", "");
    this.browsingContext = context;
    this.sandbox = sandbox;
  }
  #initialize() {
    const browsingContextEmitter = this.disposables.use(new EventEmitter(this.browsingContext));
    browsingContextEmitter.on("closed", (reason) => {
      this.dispose(reason);
    });
    const sessionEmitter = this.disposables.use(new EventEmitter(this.session));
    sessionEmitter.on("script.realmCreated", (info) => {
      if (info.type !== "window" || info.context !== this.browsingContext.id || info.sandbox !== this.sandbox) {
        return;
      }
      this.id = info.realm;
      this.origin = info.origin;
      this.executionContextId = void 0;
      this.emit("updated", this);
    });
    sessionEmitter.on("script.realmCreated", (info) => {
      if (info.type !== "dedicated-worker") {
        return;
      }
      if (!info.owners.includes(this.id)) {
        return;
      }
      const realm = DedicatedWorkerRealm.from(this, info.realm, info.origin);
      this.#workers.set(realm.id, realm);
      const realmEmitter = this.disposables.use(new EventEmitter(realm));
      realmEmitter.once("destroyed", () => {
        realmEmitter.removeAllListeners();
        this.#workers.delete(realm.id);
      });
      this.emit("worker", realm);
    });
    sessionEmitter.on("log.entryAdded", (entry) => {
      if (entry.source.realm !== this.id) {
        return;
      }
      this.emit("log", entry);
    });
  }
  get session() {
    return this.browsingContext.userContext.browser.session;
  }
  get target() {
    return { context: this.browsingContext.id, sandbox: this.sandbox };
  }
};
var DedicatedWorkerRealm = class extends Realm3 {
  static from(owner, id, origin) {
    const realm = new _a6(owner, id, origin);
    realm.#initialize();
    return realm;
  }
  #workers = /* @__PURE__ */ new Map();
  owners;
  constructor(owner, id, origin) {
    super(id, origin);
    this.owners = /* @__PURE__ */ new Set([owner]);
  }
  #initialize() {
    const sessionEmitter = this.disposables.use(new EventEmitter(this.session));
    sessionEmitter.on("script.realmDestroyed", (info) => {
      if (info.realm !== this.id) {
        return;
      }
      this.dispose("Realm already destroyed.");
    });
    sessionEmitter.on("script.realmCreated", (info) => {
      if (info.type !== "dedicated-worker") {
        return;
      }
      if (!info.owners.includes(this.id)) {
        return;
      }
      const realm = _a6.from(this, info.realm, info.origin);
      this.#workers.set(realm.id, realm);
      const realmEmitter = this.disposables.use(new EventEmitter(realm));
      realmEmitter.once("destroyed", () => {
        this.#workers.delete(realm.id);
      });
      this.emit("worker", realm);
    });
    sessionEmitter.on("log.entryAdded", (entry) => {
      if (entry.source.realm !== this.id) {
        return;
      }
      this.emit("log", entry);
    });
  }
  get session() {
    return this.owners.values().next().value.session;
  }
};
_a6 = DedicatedWorkerRealm;
var SharedWorkerRealm = class _SharedWorkerRealm extends Realm3 {
  static from(browser, id, origin) {
    const realm = new _SharedWorkerRealm(browser, id, origin);
    realm.#initialize();
    return realm;
  }
  #workers = /* @__PURE__ */ new Map();
  browser;
  constructor(browser, id, origin) {
    super(id, origin);
    this.browser = browser;
  }
  #initialize() {
    const sessionEmitter = this.disposables.use(new EventEmitter(this.session));
    sessionEmitter.on("script.realmDestroyed", (info) => {
      if (info.realm !== this.id) {
        return;
      }
      this.dispose("Realm already destroyed.");
    });
    sessionEmitter.on("script.realmCreated", (info) => {
      if (info.type !== "dedicated-worker") {
        return;
      }
      if (!info.owners.includes(this.id)) {
        return;
      }
      const realm = DedicatedWorkerRealm.from(this, info.realm, info.origin);
      this.#workers.set(realm.id, realm);
      const realmEmitter = this.disposables.use(new EventEmitter(realm));
      realmEmitter.once("destroyed", () => {
        this.#workers.delete(realm.id);
      });
      this.emit("worker", realm);
    });
    sessionEmitter.on("log.entryAdded", (entry) => {
      if (entry.source.realm !== this.id) {
        return;
      }
      this.emit("log", entry);
    });
  }
  get session() {
    return this.browser.session;
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/core/Request.js
var Bidi = __toESM(require_out(), 1);
var __runInitializers3 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate3 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var Request = (() => {
  var _a8;
  let _classSuper = EventEmitter;
  let _instanceExtraInitializers = [];
  let _dispose_decorators;
  return class Request2 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      __esDecorate3(this, null, _dispose_decorators, { kind: "method", name: "dispose", static: false, private: false, access: { has: (obj) => "dispose" in obj, get: (obj) => obj.dispose }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    static from(browsingContext, event) {
      const request = new Request2(browsingContext, event);
      request.#initialize();
      return request;
    }
    #responseContentPromise = (__runInitializers3(this, _instanceExtraInitializers), null);
    #requestContentPromise = null;
    #error;
    #redirect;
    #response;
    #browsingContext;
    #disposables = new DisposableStack();
    #event;
    constructor(browsingContext, event) {
      super();
      this.#browsingContext = browsingContext;
      this.#event = event;
    }
    #initialize() {
      const browsingContextEmitter = this.#disposables.use(new EventEmitter(this.#browsingContext));
      browsingContextEmitter.once("closed", (reason) => {
        this.#error = reason;
        this.emit("error", reason);
        this.dispose();
      });
      const sessionEmitter = this.#disposables.use(new EventEmitter(this.#session));
      sessionEmitter.on("network.beforeRequestSent", (event) => {
        if (event.context !== this.#browsingContext.id || event.request.request !== this.id) {
          return;
        }
        const previousRequestHasAuth = this.#event.request.headers.find((header) => {
          return header.name.toLowerCase() === "authorization";
        });
        const newRequestHasAuth = event.request.headers.find((header) => {
          return header.name.toLowerCase() === "authorization";
        });
        const isAfterAuth = newRequestHasAuth && !previousRequestHasAuth;
        if (event.redirectCount !== this.#event.redirectCount + 1 && !isAfterAuth) {
          return;
        }
        this.#redirect = Request2.from(this.#browsingContext, event);
        this.emit("redirect", this.#redirect);
        this.dispose();
      });
      sessionEmitter.on("network.authRequired", (event) => {
        if (event.context !== this.#browsingContext.id || event.request.request !== this.id || // Don't try to authenticate for events that are not blocked
        !event.isBlocked) {
          return;
        }
        this.emit("authenticate", void 0);
      });
      sessionEmitter.on("network.fetchError", (event) => {
        if (event.context !== this.#browsingContext.id || event.request.request !== this.id || this.#event.redirectCount !== event.redirectCount) {
          return;
        }
        this.#error = event.errorText;
        this.#event.request.headers = event.request.headers;
        this.#event.request.timings = event.request.timings;
        this.emit("error", this.#error);
        this.dispose();
      });
      sessionEmitter.on("network.responseStarted", (event) => {
        if (event.context !== this.#browsingContext.id || event.request.request !== this.id || this.#event.redirectCount !== event.redirectCount) {
          return;
        }
        this.#response = event.response;
        this.#event.request.headers = event.request.headers;
        this.#event.request.timings = event.request.timings;
        this.emit("response", this.#response);
      });
      sessionEmitter.on("network.responseCompleted", (event) => {
        if (event.context !== this.#browsingContext.id || event.request.request !== this.id || this.#event.redirectCount !== event.redirectCount) {
          return;
        }
        this.#response = event.response;
        this.#event.request.headers = event.request.headers;
        this.#event.request.timings = event.request.timings;
        this.emit("success", this.#response);
        if (this.#response.status >= 300 && this.#response.status < 400) {
          return;
        }
        this.dispose();
      });
    }
    get #session() {
      return this.#browsingContext.userContext.browser.session;
    }
    get disposed() {
      return this.#disposables.disposed;
    }
    get error() {
      return this.#error;
    }
    get headers() {
      return this.#event.request.headers;
    }
    get id() {
      return this.#event.request.request;
    }
    get initiator() {
      return {
        ...this.#event.initiator,
        // Initiator URL is not specified in BiDi.
        // @ts-expect-error non-standard property.
        url: this.#event.request["goog:resourceInitiator"]?.url,
        // @ts-expect-error non-standard property.
        stack: this.#event.request["goog:resourceInitiator"]?.stack
      };
    }
    get method() {
      return this.#event.request.method;
    }
    get navigation() {
      return this.#event.navigation ?? void 0;
    }
    get redirect() {
      return this.#redirect;
    }
    get lastRedirect() {
      let redirect = this.#redirect;
      while (redirect) {
        if (redirect && !redirect.#redirect) {
          return redirect;
        }
        redirect = redirect.#redirect;
      }
      return redirect;
    }
    get response() {
      return this.#response;
    }
    get url() {
      return this.#event.request.url;
    }
    get isBlocked() {
      return this.#event.isBlocked;
    }
    get resourceType() {
      return this.#event.request["goog:resourceType"] ?? void 0;
    }
    get postData() {
      return this.#event.request["goog:postData"] ?? void 0;
    }
    get hasPostData() {
      return (this.#event.request.bodySize ?? 0) > 0;
    }
    async continueRequest({ url, method, headers, cookies, body }) {
      await this.#session.send("network.continueRequest", {
        request: this.id,
        url,
        method,
        headers,
        body,
        cookies
      });
    }
    async failRequest() {
      await this.#session.send("network.failRequest", {
        request: this.id
      });
    }
    async provideResponse({ statusCode, reasonPhrase, headers, body }) {
      await this.#session.send("network.provideResponse", {
        request: this.id,
        statusCode,
        reasonPhrase,
        headers,
        body
      });
    }
    async getRequestContent() {
      if (!this.hasPostData) {
        return void 0;
      }
      if (!this.#requestContentPromise) {
        this.#requestContentPromise = (async () => {
          const data = await this.#session.send("network.getData", {
            dataType: Bidi.Network.DataType.Request,
            request: this.id
          });
          return stringToTypedArray(data.result.bytes.value, data.result.bytes.type === "base64");
        })();
      }
      return await this.#requestContentPromise;
    }
    async fetchPostData() {
      const content = await this.getRequestContent();
      if (content === void 0) {
        return void 0;
      }
      return new TextDecoder().decode(content);
    }
    async getResponseContent() {
      if (!this.#responseContentPromise) {
        this.#responseContentPromise = (async () => {
          try {
            const data = await this.#session.send("network.getData", {
              dataType: Bidi.Network.DataType.Response,
              request: this.id
            });
            return stringToTypedArray(data.result.bytes.value, data.result.bytes.type === "base64");
          } catch (error) {
            if (error instanceof ProtocolError && error.originalMessage.includes("No resource with given identifier found")) {
              throw new ProtocolError("Could not load response body for this request. This might happen if the request is a preflight request.");
            }
            throw error;
          }
        })();
      }
      return await this.#responseContentPromise;
    }
    async continueWithAuth(parameters) {
      if (parameters.action === "provideCredentials") {
        await this.#session.send("network.continueWithAuth", {
          request: this.id,
          action: parameters.action,
          credentials: parameters.credentials
        });
      } else {
        await this.#session.send("network.continueWithAuth", {
          request: this.id,
          action: parameters.action
        });
      }
    }
    dispose() {
      this[disposeSymbol]();
    }
    [(_dispose_decorators = [inertIfDisposed], disposeSymbol)]() {
      this.#disposables.dispose();
      super[disposeSymbol]();
    }
    timing() {
      return this.#event.request.timings;
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/core/UserPrompt.js
var Bidi2 = __toESM(require_out(), 1);
var __runInitializers4 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate4 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var UserPrompt = (() => {
  let _classSuper = EventEmitter;
  let _instanceExtraInitializers = [];
  let _dispose_decorators;
  let _handle_decorators;
  return class UserPrompt2 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      __esDecorate4(this, null, _dispose_decorators, { kind: "method", name: "dispose", static: false, private: false, access: { has: (obj) => "dispose" in obj, get: (obj) => obj.dispose }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate4(this, null, _handle_decorators, { kind: "method", name: "handle", static: false, private: false, access: { has: (obj) => "handle" in obj, get: (obj) => obj.handle }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    static from(browsingContext, info) {
      const userPrompt = new UserPrompt2(browsingContext, info);
      userPrompt.#initialize();
      return userPrompt;
    }
    #reason = __runInitializers4(this, _instanceExtraInitializers);
    #result;
    #disposables = new DisposableStack();
    browsingContext;
    info;
    constructor(context, info) {
      super();
      this.browsingContext = context;
      this.info = info;
    }
    #initialize() {
      const browserContextEmitter = this.#disposables.use(new EventEmitter(this.browsingContext));
      browserContextEmitter.once("closed", (reason) => {
        this.dispose(`User prompt already closed: ${reason}`);
      });
      const sessionEmitter = this.#disposables.use(new EventEmitter(this.#session));
      sessionEmitter.on("browsingContext.userPromptClosed", (parameters) => {
        if (parameters.context !== this.browsingContext.id) {
          return;
        }
        this.#result = parameters;
        this.emit("handled", parameters);
        this.dispose("User prompt already handled.");
      });
    }
    get #session() {
      return this.browsingContext.userContext.browser.session;
    }
    get closed() {
      return this.#reason !== void 0;
    }
    get disposed() {
      return this.closed;
    }
    get handled() {
      if (this.info.handler === Bidi2.Session.UserPromptHandlerType.Accept || this.info.handler === Bidi2.Session.UserPromptHandlerType.Dismiss) {
        return true;
      }
      return this.#result !== void 0;
    }
    get result() {
      return this.#result;
    }
    dispose(reason) {
      this.#reason = reason;
      this[disposeSymbol]();
    }
    async handle(options = {}) {
      await this.#session.send("browsingContext.handleUserPrompt", {
        ...options,
        context: this.info.context
      });
      return this.#result;
    }
    [(_dispose_decorators = [inertIfDisposed], _handle_decorators = [throwIfDisposed((prompt) => {
      return prompt.#reason;
    })], disposeSymbol)]() {
      this.#reason ??= "User prompt already closed, probably because the associated browsing context was destroyed.";
      this.emit("closed", this.#reason);
      this.#disposables.dispose();
      super[disposeSymbol]();
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/core/BrowsingContext.js
var __runInitializers5 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate5 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var BrowsingContext3 = (() => {
  var _a8;
  let _classSuper = EventEmitter;
  let _instanceExtraInitializers = [];
  let _dispose_decorators;
  let _activate_decorators;
  let _captureScreenshot_decorators;
  let _startScreencast_decorators;
  let _stopScreencast_decorators;
  let _close_decorators;
  let _traverseHistory_decorators;
  let _navigate_decorators;
  let _reload_decorators;
  let _setCacheBehavior_decorators;
  let _print_decorators;
  let _handleUserPrompt_decorators;
  let _setViewport_decorators;
  let _setTouchOverride_decorators;
  let _performActions_decorators;
  let _releaseActions_decorators;
  let _createWindowRealm_decorators;
  let _addPreloadScript_decorators;
  let _addIntercept_decorators;
  let _removePreloadScript_decorators;
  let _setGeolocationOverride_decorators;
  let _setTimezoneOverride_decorators;
  let _setLocaleOverride_decorators;
  let _setScreenOrientationOverride_decorators;
  let _getCookies_decorators;
  let _setCookie_decorators;
  let _setFiles_decorators;
  let _subscribe_decorators;
  let _addInterception_decorators;
  let _deleteCookie_decorators;
  let _locateNodes_decorators;
  return class BrowsingContext6 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      _deleteCookie_decorators = [throwIfDisposed((context) => {
        return context.#reason;
      })];
      _locateNodes_decorators = [throwIfDisposed((context) => {
        return context.#reason;
      })];
      __esDecorate5(this, null, _dispose_decorators, { kind: "method", name: "dispose", static: false, private: false, access: { has: (obj) => "dispose" in obj, get: (obj) => obj.dispose }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _activate_decorators, { kind: "method", name: "activate", static: false, private: false, access: { has: (obj) => "activate" in obj, get: (obj) => obj.activate }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _captureScreenshot_decorators, { kind: "method", name: "captureScreenshot", static: false, private: false, access: { has: (obj) => "captureScreenshot" in obj, get: (obj) => obj.captureScreenshot }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _startScreencast_decorators, { kind: "method", name: "startScreencast", static: false, private: false, access: { has: (obj) => "startScreencast" in obj, get: (obj) => obj.startScreencast }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _stopScreencast_decorators, { kind: "method", name: "stopScreencast", static: false, private: false, access: { has: (obj) => "stopScreencast" in obj, get: (obj) => obj.stopScreencast }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _close_decorators, { kind: "method", name: "close", static: false, private: false, access: { has: (obj) => "close" in obj, get: (obj) => obj.close }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _traverseHistory_decorators, { kind: "method", name: "traverseHistory", static: false, private: false, access: { has: (obj) => "traverseHistory" in obj, get: (obj) => obj.traverseHistory }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _navigate_decorators, { kind: "method", name: "navigate", static: false, private: false, access: { has: (obj) => "navigate" in obj, get: (obj) => obj.navigate }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _reload_decorators, { kind: "method", name: "reload", static: false, private: false, access: { has: (obj) => "reload" in obj, get: (obj) => obj.reload }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _setCacheBehavior_decorators, { kind: "method", name: "setCacheBehavior", static: false, private: false, access: { has: (obj) => "setCacheBehavior" in obj, get: (obj) => obj.setCacheBehavior }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _print_decorators, { kind: "method", name: "print", static: false, private: false, access: { has: (obj) => "print" in obj, get: (obj) => obj.print }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _handleUserPrompt_decorators, { kind: "method", name: "handleUserPrompt", static: false, private: false, access: { has: (obj) => "handleUserPrompt" in obj, get: (obj) => obj.handleUserPrompt }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _setViewport_decorators, { kind: "method", name: "setViewport", static: false, private: false, access: { has: (obj) => "setViewport" in obj, get: (obj) => obj.setViewport }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _setTouchOverride_decorators, { kind: "method", name: "setTouchOverride", static: false, private: false, access: { has: (obj) => "setTouchOverride" in obj, get: (obj) => obj.setTouchOverride }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _performActions_decorators, { kind: "method", name: "performActions", static: false, private: false, access: { has: (obj) => "performActions" in obj, get: (obj) => obj.performActions }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _releaseActions_decorators, { kind: "method", name: "releaseActions", static: false, private: false, access: { has: (obj) => "releaseActions" in obj, get: (obj) => obj.releaseActions }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _createWindowRealm_decorators, { kind: "method", name: "createWindowRealm", static: false, private: false, access: { has: (obj) => "createWindowRealm" in obj, get: (obj) => obj.createWindowRealm }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _addPreloadScript_decorators, { kind: "method", name: "addPreloadScript", static: false, private: false, access: { has: (obj) => "addPreloadScript" in obj, get: (obj) => obj.addPreloadScript }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _addIntercept_decorators, { kind: "method", name: "addIntercept", static: false, private: false, access: { has: (obj) => "addIntercept" in obj, get: (obj) => obj.addIntercept }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _removePreloadScript_decorators, { kind: "method", name: "removePreloadScript", static: false, private: false, access: { has: (obj) => "removePreloadScript" in obj, get: (obj) => obj.removePreloadScript }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _setGeolocationOverride_decorators, { kind: "method", name: "setGeolocationOverride", static: false, private: false, access: { has: (obj) => "setGeolocationOverride" in obj, get: (obj) => obj.setGeolocationOverride }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _setTimezoneOverride_decorators, { kind: "method", name: "setTimezoneOverride", static: false, private: false, access: { has: (obj) => "setTimezoneOverride" in obj, get: (obj) => obj.setTimezoneOverride }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _setLocaleOverride_decorators, { kind: "method", name: "setLocaleOverride", static: false, private: false, access: { has: (obj) => "setLocaleOverride" in obj, get: (obj) => obj.setLocaleOverride }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _setScreenOrientationOverride_decorators, { kind: "method", name: "setScreenOrientationOverride", static: false, private: false, access: { has: (obj) => "setScreenOrientationOverride" in obj, get: (obj) => obj.setScreenOrientationOverride }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _getCookies_decorators, { kind: "method", name: "getCookies", static: false, private: false, access: { has: (obj) => "getCookies" in obj, get: (obj) => obj.getCookies }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _setCookie_decorators, { kind: "method", name: "setCookie", static: false, private: false, access: { has: (obj) => "setCookie" in obj, get: (obj) => obj.setCookie }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _setFiles_decorators, { kind: "method", name: "setFiles", static: false, private: false, access: { has: (obj) => "setFiles" in obj, get: (obj) => obj.setFiles }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _subscribe_decorators, { kind: "method", name: "subscribe", static: false, private: false, access: { has: (obj) => "subscribe" in obj, get: (obj) => obj.subscribe }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _addInterception_decorators, { kind: "method", name: "addInterception", static: false, private: false, access: { has: (obj) => "addInterception" in obj, get: (obj) => obj.addInterception }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _deleteCookie_decorators, { kind: "method", name: "deleteCookie", static: false, private: false, access: { has: (obj) => "deleteCookie" in obj, get: (obj) => obj.deleteCookie }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate5(this, null, _locateNodes_decorators, { kind: "method", name: "locateNodes", static: false, private: false, access: { has: (obj) => "locateNodes" in obj, get: (obj) => obj.locateNodes }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    static from(userContext, parent, id, url, originalOpener, clientWindow) {
      const browsingContext = new BrowsingContext6(userContext, parent, id, url, originalOpener, clientWindow);
      browsingContext.#initialize();
      return browsingContext;
    }
    #navigation = __runInitializers5(this, _instanceExtraInitializers);
    #reason;
    #url;
    // Indicated whether client hints have been set to non-default.
    #clientHintsAreSet = false;
    #children = /* @__PURE__ */ new Map();
    #disposables = new DisposableStack();
    #realms = /* @__PURE__ */ new Map();
    defaultRealm;
    id;
    parent;
    userContext;
    originalOpener;
    windowId;
    #emulationState = { javaScriptEnabled: true };
    #bluetoothEmulation;
    #deviceRequestPromptManager;
    constructor(userContext, parent, id, url, originalOpener, clientWindow) {
      super();
      this.#url = url;
      this.id = id;
      this.parent = parent;
      this.userContext = userContext;
      this.originalOpener = originalOpener;
      this.windowId = clientWindow;
      this.defaultRealm = this.#createWindowRealm();
      this.#bluetoothEmulation = new BidiBluetoothEmulation(this.id, this.#session);
      this.#deviceRequestPromptManager = new BidiDeviceRequestPromptManager(this.id, this.#session);
    }
    #initialize() {
      const userContextEmitter = this.#disposables.use(new EventEmitter(this.userContext));
      userContextEmitter.once("closed", (reason) => {
        this.dispose(`Browsing context already closed: ${reason}`);
      });
      const sessionEmitter = this.#disposables.use(new EventEmitter(this.#session));
      sessionEmitter.on("input.fileDialogOpened", (info) => {
        if (this.id !== info.context) {
          return;
        }
        this.emit("filedialogopened", info);
      });
      sessionEmitter.on("browsingContext.contextCreated", (info) => {
        if (info.parent !== this.id) {
          return;
        }
        const browsingContext = BrowsingContext6.from(this.userContext, this, info.context, info.url, info.originalOpener, info.clientWindow);
        this.#children.set(info.context, browsingContext);
        const browsingContextEmitter = this.#disposables.use(new EventEmitter(browsingContext));
        browsingContextEmitter.once("closed", () => {
          browsingContextEmitter.removeAllListeners();
          this.#children.delete(browsingContext.id);
        });
        this.emit("browsingcontext", browsingContext);
      });
      sessionEmitter.on("browsingContext.contextDestroyed", (info) => {
        if (info.context !== this.id) {
          return;
        }
        this.dispose("Browsing context already closed.");
      });
      sessionEmitter.on("browsingContext.historyUpdated", (info) => {
        if (info.context !== this.id) {
          return;
        }
        this.#url = info.url;
        this.emit("historyUpdated", void 0);
      });
      sessionEmitter.on("browsingContext.domContentLoaded", (info) => {
        if (info.context !== this.id) {
          return;
        }
        this.#url = info.url;
        this.emit("DOMContentLoaded", void 0);
      });
      sessionEmitter.on("browsingContext.load", (info) => {
        if (info.context !== this.id) {
          return;
        }
        this.#url = info.url;
        this.emit("load", void 0);
      });
      sessionEmitter.on("browsingContext.navigationStarted", (info) => {
        if (info.context !== this.id) {
          return;
        }
        if (this.#navigation !== void 0 && !this.#navigation.disposed) {
          return;
        }
        this.#navigation = Navigation.from(this);
        const navigationEmitter = this.#disposables.use(new EventEmitter(this.#navigation));
        for (const eventName of ["fragment", "failed", "aborted"]) {
          navigationEmitter.once(eventName, ({ url }) => {
            navigationEmitter[disposeSymbol]();
            this.#url = url;
          });
        }
        this.emit("navigation", this.#navigation);
      });
      sessionEmitter.on("network.beforeRequestSent", (event) => {
        if (event.context !== this.id) {
          return;
        }
        if (event.redirectCount > 0) {
          return;
        }
        const request = Request.from(this, event);
        this.emit("request", request);
      });
      sessionEmitter.on("log.entryAdded", (entry) => {
        if (entry.source.context !== this.id) {
          return;
        }
        this.emit("log", entry);
      });
      sessionEmitter.on("browsingContext.userPromptOpened", (info) => {
        if (info.context !== this.id) {
          return;
        }
        const userPrompt = UserPrompt.from(this, info);
        this.emit("userprompt", userPrompt);
      });
    }
    get #session() {
      return this.userContext.browser.session;
    }
    get children() {
      return this.#children.values();
    }
    get closed() {
      return this.#reason !== void 0;
    }
    get disposed() {
      return this.closed;
    }
    get realms() {
      const self = this;
      return (function* () {
        yield self.defaultRealm;
        yield* self.#realms.values();
      })();
    }
    get top() {
      let context = this;
      for (let { parent } = context; parent; { parent } = context) {
        context = parent;
      }
      return context;
    }
    get url() {
      return this.#url;
    }
    #createWindowRealm(sandbox) {
      const realm = WindowRealm2.from(this, sandbox);
      realm.on("worker", (realm2) => {
        this.emit("worker", realm2);
      });
      return realm;
    }
    dispose(reason) {
      this.#reason = reason;
      for (const context of this.#children.values()) {
        context.dispose("Parent browsing context was disposed");
      }
      this[disposeSymbol]();
    }
    async activate() {
      await this.#session.send("browsingContext.activate", {
        context: this.id
      });
    }
    async captureScreenshot(options = {}) {
      const { result: { data } } = await this.#session.send("browsingContext.captureScreenshot", {
        context: this.id,
        ...options
      });
      return data;
    }
    async startScreencast(options = {}) {
      const { result } = await this.#session.send("browsingContext.startScreencast", {
        context: this.id,
        ...options
      });
      return result;
    }
    async stopScreencast(screencast) {
      const { result } = await this.#session.send("browsingContext.stopScreencast", {
        screencast
      });
      return result;
    }
    async close(promptUnload) {
      await this.#session.send("browsingContext.close", {
        context: this.id,
        promptUnload
      });
    }
    async traverseHistory(delta) {
      await this.#session.send("browsingContext.traverseHistory", {
        context: this.id,
        delta
      });
    }
    async navigate(url, wait) {
      await this.#session.send("browsingContext.navigate", {
        context: this.id,
        url,
        wait
      });
    }
    async reload(options = {}) {
      await this.#session.send("browsingContext.reload", {
        context: this.id,
        ...options
      });
    }
    async setCacheBehavior(cacheBehavior) {
      await this.#session.send("network.setCacheBehavior", {
        contexts: [this.id],
        cacheBehavior
      });
    }
    async print(options = {}) {
      const { result: { data } } = await this.#session.send("browsingContext.print", {
        context: this.id,
        ...options
      });
      return data;
    }
    async handleUserPrompt(options = {}) {
      await this.#session.send("browsingContext.handleUserPrompt", {
        context: this.id,
        ...options
      });
    }
    async setViewport(options = {}) {
      await this.#session.send("browsingContext.setViewport", {
        context: this.id,
        ...options
      });
    }
    async setTouchOverride(maxTouchPoints) {
      await this.#session.send("emulation.setTouchOverride", {
        contexts: [this.id],
        maxTouchPoints
      });
    }
    async performActions(actions) {
      await this.#session.send("input.performActions", {
        context: this.id,
        actions
      });
    }
    async releaseActions() {
      await this.#session.send("input.releaseActions", {
        context: this.id
      });
    }
    createWindowRealm(sandbox) {
      return this.#createWindowRealm(sandbox);
    }
    async addPreloadScript(functionDeclaration, options = {}) {
      return await this.userContext.browser.addPreloadScript(functionDeclaration, {
        ...options,
        contexts: [this]
      });
    }
    async addIntercept(options) {
      const { result: { intercept } } = await this.userContext.browser.session.send("network.addIntercept", {
        ...options,
        contexts: [this.id]
      });
      return intercept;
    }
    async removePreloadScript(script) {
      await this.userContext.browser.removePreloadScript(script);
    }
    async setGeolocationOverride(options) {
      if (!("coordinates" in options)) {
        throw new Error("Missing coordinates");
      }
      await this.userContext.browser.session.send("emulation.setGeolocationOverride", {
        coordinates: options.coordinates,
        contexts: [this.id]
      });
    }
    async setTimezoneOverride(timezoneId) {
      if (timezoneId?.startsWith("GMT")) {
        timezoneId = timezoneId?.replace("GMT", "");
      }
      await this.userContext.browser.session.send("emulation.setTimezoneOverride", {
        timezone: timezoneId ?? null,
        contexts: [this.id]
      });
    }
    async setLocaleOverride(locale) {
      await this.userContext.browser.session.send("emulation.setLocaleOverride", {
        locale: locale ?? null,
        contexts: [this.id]
      });
    }
    async setScreenOrientationOverride(screenOrientation) {
      await this.#session.send("emulation.setScreenOrientationOverride", {
        screenOrientation,
        contexts: [this.id]
      });
    }
    async getCookies(options = {}) {
      const { result: { cookies } } = await this.#session.send("storage.getCookies", {
        ...options,
        partition: {
          type: "context",
          context: this.id
        }
      });
      return cookies;
    }
    async setCookie(cookie) {
      await this.#session.send("storage.setCookie", {
        cookie,
        partition: {
          type: "context",
          context: this.id
        }
      });
    }
    async setFiles(element, files) {
      await this.#session.send("input.setFiles", {
        context: this.id,
        element,
        files
      });
    }
    async subscribe(events) {
      await this.#session.subscribe(events, [this.id]);
    }
    async addInterception(events) {
      await this.#session.subscribe(events, [this.id]);
    }
    [(_dispose_decorators = [inertIfDisposed], _activate_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _captureScreenshot_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _startScreencast_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _stopScreencast_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _close_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _traverseHistory_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _navigate_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _reload_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _setCacheBehavior_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _print_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _handleUserPrompt_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _setViewport_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _setTouchOverride_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _performActions_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _releaseActions_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _createWindowRealm_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _addPreloadScript_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _addIntercept_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _removePreloadScript_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _setGeolocationOverride_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _setTimezoneOverride_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _setLocaleOverride_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _setScreenOrientationOverride_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _getCookies_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _setCookie_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _setFiles_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _subscribe_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _addInterception_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], disposeSymbol)]() {
      this.#reason ??= "Browsing context already closed, probably because the user context closed.";
      this.emit("closed", this.#reason);
      this.#disposables.dispose();
      super[disposeSymbol]();
    }
    async deleteCookie(...cookieFilters) {
      await Promise.all(cookieFilters.map(async (filter2) => {
        await this.#session.send("storage.deleteCookies", {
          filter: filter2,
          partition: {
            type: "context",
            context: this.id
          }
        });
      }));
    }
    async locateNodes(locator, startNodes = []) {
      const result = await this.#session.send("browsingContext.locateNodes", {
        context: this.id,
        locator,
        startNodes: startNodes.length ? startNodes : void 0
      });
      return result.result.nodes;
    }
    async setJavaScriptEnabled(enabled) {
      await this.userContext.browser.session.send("emulation.setScriptingEnabled", {
        // Enabled `null` means `default`, `false` means `disabled`.
        enabled: enabled ? null : false,
        contexts: [this.id]
      });
      this.#emulationState.javaScriptEnabled = enabled;
    }
    isJavaScriptEnabled() {
      return this.#emulationState.javaScriptEnabled;
    }
    async setUserAgent(userAgent) {
      await this.#session.send("emulation.setUserAgentOverride", {
        userAgent,
        contexts: [this.id]
      });
    }
    async setClientHintsOverride(clientHints) {
      if (clientHints === null && !this.#clientHintsAreSet) {
        return;
      }
      this.#clientHintsAreSet = true;
      await this.#session.send("userAgentClientHints.setClientHintsOverride", {
        clientHints,
        contexts: [this.id]
      });
    }
    async setOfflineMode(enabled) {
      await this.#session.send("emulation.setNetworkConditions", {
        networkConditions: enabled ? {
          type: "offline"
        } : null,
        contexts: [this.id]
      });
    }
    get bluetooth() {
      return this.#bluetoothEmulation;
    }
    async waitForDevicePrompt(timeout2, signal) {
      return await this.#deviceRequestPromptManager.waitForDevicePrompt(timeout2, signal);
    }
    async setExtraHTTPHeaders(headers) {
      await this.#session.send("network.setExtraHeaders", {
        headers: Object.entries(headers).map(([key, value]) => {
          assert(isString(value), `Expected value of header "${key}" to be String, but "${typeof value}" is found.`);
          return {
            name: key.toLowerCase(),
            value: { type: "string", value }
          };
        }),
        contexts: [this.id]
      });
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/core/UserContext.js
var __runInitializers6 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate6 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var UserContext = (() => {
  let _classSuper = EventEmitter;
  let _instanceExtraInitializers = [];
  let _dispose_decorators;
  let _createBrowsingContext_decorators;
  let _remove_decorators;
  let _getCookies_decorators;
  let _setCookie_decorators;
  let _setPermissions_decorators;
  return class UserContext2 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      __esDecorate6(this, null, _dispose_decorators, { kind: "method", name: "dispose", static: false, private: false, access: { has: (obj) => "dispose" in obj, get: (obj) => obj.dispose }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate6(this, null, _createBrowsingContext_decorators, { kind: "method", name: "createBrowsingContext", static: false, private: false, access: { has: (obj) => "createBrowsingContext" in obj, get: (obj) => obj.createBrowsingContext }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate6(this, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: (obj) => "remove" in obj, get: (obj) => obj.remove }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate6(this, null, _getCookies_decorators, { kind: "method", name: "getCookies", static: false, private: false, access: { has: (obj) => "getCookies" in obj, get: (obj) => obj.getCookies }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate6(this, null, _setCookie_decorators, { kind: "method", name: "setCookie", static: false, private: false, access: { has: (obj) => "setCookie" in obj, get: (obj) => obj.setCookie }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate6(this, null, _setPermissions_decorators, { kind: "method", name: "setPermissions", static: false, private: false, access: { has: (obj) => "setPermissions" in obj, get: (obj) => obj.setPermissions }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    static DEFAULT = "default";
    static create(browser, id) {
      const context = new UserContext2(browser, id);
      context.#initialize();
      return context;
    }
    #reason = __runInitializers6(this, _instanceExtraInitializers);
    // Note these are only top-level contexts.
    #browsingContexts = /* @__PURE__ */ new Map();
    #disposables = new DisposableStack();
    #id;
    browser;
    constructor(browser, id) {
      super();
      this.#id = id;
      this.browser = browser;
    }
    #initialize() {
      const browserEmitter = this.#disposables.use(new EventEmitter(this.browser));
      browserEmitter.once("closed", (reason) => {
        this.dispose(`User context was closed: ${reason}`);
      });
      browserEmitter.once("disconnected", (reason) => {
        this.dispose(`User context was closed: ${reason}`);
      });
      const sessionEmitter = this.#disposables.use(new EventEmitter(this.#session));
      sessionEmitter.on("browsingContext.contextCreated", (info) => {
        if (info.parent) {
          return;
        }
        if (info.userContext !== this.#id) {
          return;
        }
        const browsingContext = BrowsingContext3.from(this, void 0, info.context, info.url, info.originalOpener, info.clientWindow);
        this.#browsingContexts.set(browsingContext.id, browsingContext);
        const browsingContextEmitter = this.#disposables.use(new EventEmitter(browsingContext));
        browsingContextEmitter.on("closed", () => {
          browsingContextEmitter.removeAllListeners();
          this.#browsingContexts.delete(browsingContext.id);
        });
        this.emit("browsingcontext", browsingContext);
      });
    }
    get #session() {
      return this.browser.session;
    }
    get browsingContexts() {
      return this.#browsingContexts.values();
    }
    get closed() {
      return this.#reason !== void 0;
    }
    get disposed() {
      return this.closed;
    }
    get id() {
      return this.#id;
    }
    dispose(reason) {
      this.#reason = reason;
      this[disposeSymbol]();
    }
    async createBrowsingContext(type, options = {}) {
      const { result: { context: contextId } } = await this.#session.send("browsingContext.create", {
        type,
        ...options,
        referenceContext: options.referenceContext?.id,
        background: options.background,
        userContext: this.#id
      });
      const browsingContext = this.#browsingContexts.get(contextId);
      assert(browsingContext, "The WebDriver BiDi implementation is failing to create a browsing context correctly.");
      return browsingContext;
    }
    async remove() {
      try {
        await this.#session.send("browser.removeUserContext", {
          userContext: this.#id
        });
      } finally {
        this.dispose("User context already closed.");
      }
    }
    async getCookies(options = {}, sourceOrigin = void 0) {
      const { result: { cookies } } = await this.#session.send("storage.getCookies", {
        ...options,
        partition: {
          type: "storageKey",
          userContext: this.#id,
          sourceOrigin
        }
      });
      return cookies;
    }
    async setCookie(cookie, sourceOrigin) {
      await this.#session.send("storage.setCookie", {
        cookie,
        partition: {
          type: "storageKey",
          sourceOrigin,
          userContext: this.id
        }
      });
    }
    async setPermissions(origin, descriptor, state) {
      await this.#session.send("permissions.setPermission", {
        origin,
        descriptor,
        state,
        userContext: this.#id
      });
    }
    [(_dispose_decorators = [inertIfDisposed], _createBrowsingContext_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _remove_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _getCookies_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _setCookie_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], _setPermissions_decorators = [throwIfDisposed((context) => {
      return context.#reason;
    })], disposeSymbol)]() {
      this.#reason ??= "User context already closed, probably because the browser disconnected/closed.";
      this.emit("closed", this.#reason);
      this.#disposables.dispose();
      super[disposeSymbol]();
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/Page.js
var Bidi7 = __toESM(require_out(), 1);

// node_modules/puppeteer-core/lib/puppeteer/bidi/Deserializer.js
var BidiDeserializer = class {
  static deserialize(result, logger) {
    if (!result) {
      logger?.(DEBUG_PREFIXES.error)?.("Service did not produce a result.");
      return void 0;
    }
    switch (result.type) {
      case "array":
        return result.value?.map((value) => {
          return this.deserialize(value);
        });
      case "set":
        return result.value?.reduce((acc, value) => {
          return acc.add(this.deserialize(value));
        }, /* @__PURE__ */ new Set());
      case "object":
        return result.value?.reduce((acc, tuple) => {
          const { key, value } = this.#deserializeTuple(tuple);
          acc[key] = value;
          return acc;
        }, {});
      case "map":
        return result.value?.reduce((acc, tuple) => {
          const { key, value } = this.#deserializeTuple(tuple);
          return acc.set(key, value);
        }, /* @__PURE__ */ new Map());
      case "promise":
        return {};
      case "regexp":
        return new RegExp(result.value.pattern, result.value.flags);
      case "date":
        return new Date(result.value);
      case "undefined":
        return void 0;
      case "null":
        return null;
      case "number":
        return this.#deserializeNumber(result.value);
      case "bigint":
        return BigInt(result.value);
      case "boolean":
        return Boolean(result.value);
      case "string":
        return result.value;
    }
    logger?.(DEBUG_PREFIXES.error)?.(`Deserialization of type ${result.type} not supported.`);
    return void 0;
  }
  static #deserializeNumber(value) {
    switch (value) {
      case "-0":
        return -0;
      case "NaN":
        return NaN;
      case "Infinity":
        return Infinity;
      case "-Infinity":
        return -Infinity;
      default:
        return value;
    }
  }
  static #deserializeTuple([serializedKey, serializedValue]) {
    const key = typeof serializedKey === "string" ? serializedKey : this.deserialize(serializedKey);
    const value = this.deserialize(serializedValue);
    return { key, value };
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/JSHandle.js
var BidiJSHandle = class _BidiJSHandle extends JSHandle {
  static from(value, realm) {
    return new _BidiJSHandle(value, realm);
  }
  #remoteValue;
  realm;
  #disposed = false;
  constructor(value, realm) {
    super(realm.logger);
    this.#remoteValue = value;
    this.realm = realm;
  }
  get disposed() {
    return this.#disposed;
  }
  async jsonValue() {
    return await this.evaluate((value) => {
      return value;
    });
  }
  asElement() {
    return null;
  }
  async dispose() {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;
    await this.realm.destroyHandles([this]);
  }
  get isPrimitiveValue() {
    switch (this.#remoteValue.type) {
      case "string":
      case "number":
      case "bigint":
      case "boolean":
      case "undefined":
      case "null":
        return true;
      default:
        return false;
    }
  }
  toString() {
    if (this.isPrimitiveValue) {
      return "JSHandle:" + BidiDeserializer.deserialize(this.#remoteValue);
    }
    return "JSHandle@" + this.#remoteValue.type;
  }
  get id() {
    return "handle" in this.#remoteValue ? this.#remoteValue.handle : void 0;
  }
  remoteValue() {
    return this.#remoteValue;
  }
  remoteObject() {
    throw new UnsupportedOperation("Not available in WebDriver BiDi");
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/ElementHandle.js
var __runInitializers7 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate7 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var __addDisposableResource = function(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
};
var __disposeResources = /* @__PURE__ */ (function(SuppressedError2) {
  return function(env) {
    function fail(e) {
      env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  };
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var BidiElementHandle = (() => {
  let _classSuper = ElementHandle;
  let _instanceExtraInitializers = [];
  let _autofill_decorators;
  let _contentFrame_decorators;
  return class BidiElementHandle2 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      _autofill_decorators = [throwIfDisposed()];
      _contentFrame_decorators = [throwIfDisposed(), bindIsolatedHandle];
      __esDecorate7(this, null, _autofill_decorators, { kind: "method", name: "autofill", static: false, private: false, access: { has: (obj) => "autofill" in obj, get: (obj) => obj.autofill }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate7(this, null, _contentFrame_decorators, { kind: "method", name: "contentFrame", static: false, private: false, access: { has: (obj) => "contentFrame" in obj, get: (obj) => obj.contentFrame }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    #backendNodeId = __runInitializers7(this, _instanceExtraInitializers);
    static from(value, realm) {
      return new BidiElementHandle2(value, realm);
    }
    constructor(value, realm) {
      super(BidiJSHandle.from(value, realm), realm.logger);
    }
    get realm() {
      return this.handle.realm;
    }
    get frame() {
      return this.realm.environment;
    }
    remoteValue() {
      return this.handle.remoteValue();
    }
    async autofill(data) {
      const client = this.frame.client;
      const nodeInfo = await client.send("DOM.describeNode", {
        objectId: this.handle.id
      });
      const fieldId = nodeInfo.node.backendNodeId;
      const frameId = this.frame._id;
      await client.send("Autofill.trigger", {
        fieldId,
        frameId,
        card: data.creditCard,
        address: data.address
      });
    }
    async contentFrame() {
      const env_1 = { stack: [], error: void 0, hasError: false };
      try {
        const handle = __addDisposableResource(env_1, await this.evaluateHandle((element) => {
          if (element instanceof HTMLIFrameElement || element instanceof HTMLFrameElement) {
            return element.contentWindow;
          }
          return;
        }), false);
        const value = handle.remoteValue();
        if (value.type === "window") {
          return this.frame.page().frames().find((frame) => {
            return frame._id === value.value.context;
          }) ?? null;
        }
        return null;
      } catch (e_1) {
        env_1.error = e_1;
        env_1.hasError = true;
      } finally {
        __disposeResources(env_1);
      }
    }
    async uploadFile(...files) {
      const path = environment.value.path;
      if (path) {
        files = files.map((file) => {
          if (path.win32.isAbsolute(file) || path.posix.isAbsolute(file)) {
            return file;
          } else {
            return path.resolve(file);
          }
        });
      }
      await this.frame.setFiles(this, files);
    }
    async *queryAXTree(name, role) {
      const results = await this.frame.locateNodes(this, {
        type: "accessibility",
        value: {
          role,
          name
        }
      });
      return yield* AsyncIterableUtil.map(results, (node) => {
        return Promise.resolve(BidiElementHandle2.from(node, this.realm));
      });
    }
    async backendNodeId() {
      if (!this.frame.page().browser().cdpSupported) {
        throw new UnsupportedOperation();
      }
      if (this.#backendNodeId) {
        return this.#backendNodeId;
      }
      const { node } = await this.frame.client.send("DOM.describeNode", {
        objectId: this.handle.id
      });
      this.#backendNodeId = node.backendNodeId;
      return this.#backendNodeId;
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/Frame.js
var Bidi5 = __toESM(require_out(), 1);

// node_modules/puppeteer-core/lib/puppeteer/bidi/Dialog.js
var BidiDialog = class _BidiDialog extends Dialog {
  static from(prompt) {
    return new _BidiDialog(prompt);
  }
  #prompt;
  constructor(prompt) {
    super(prompt.info.type, prompt.info.message, prompt.info.defaultValue);
    this.#prompt = prompt;
    this.handled = prompt.handled;
    prompt.once("handled", () => {
      this.handled = true;
    });
  }
  async handle(options) {
    await this.#prompt.handle({
      accept: options.accept,
      userText: options.text
    });
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/ExposedFunction.js
var Bidi3 = __toESM(require_out(), 1);
var __addDisposableResource2 = function(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
};
var __disposeResources2 = /* @__PURE__ */ (function(SuppressedError2) {
  return function(env) {
    function fail(e) {
      env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  };
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var ExposableFunction = class _ExposableFunction {
  static async from(frame, name, apply, isolate = false, logger) {
    const func = new _ExposableFunction(frame, name, apply, isolate, logger);
    await func.#initialize();
    return func;
  }
  #frame;
  name;
  #apply;
  #isolate;
  #logger;
  #channel;
  #scripts = [];
  #disposables = new DisposableStack();
  constructor(frame, name, apply, isolate = false, logger) {
    this.#frame = frame;
    this.name = name;
    this.#apply = apply;
    this.#isolate = isolate;
    this.#logger = logger;
    this.#channel = `__puppeteer__${this.#frame._id}_page_exposeFunction_${this.name}`;
  }
  async #initialize() {
    const connection = this.#connection;
    const channel = {
      type: "channel",
      value: {
        channel: this.#channel,
        ownership: Bidi3.Script.ResultOwnership.Root
      }
    };
    const connectionEmitter = this.#disposables.use(new EventEmitter(connection, this.#logger));
    connectionEmitter.on("script.message", this.#handleMessage);
    const functionDeclaration = stringifyFunction(interpolateFunction((callback) => {
      Object.assign(globalThis, {
        [PLACEHOLDER("name")]: function(...args) {
          return new Promise((resolve, reject) => {
            callback([resolve, reject, args]);
          });
        }
      });
    }, { name: JSON.stringify(this.name) }));
    const frames = [this.#frame];
    for (const frame of frames) {
      frames.push(...frame.childFrames());
    }
    await Promise.all(frames.map(async (frame) => {
      const realm = this.#isolate ? frame.isolatedRealm() : frame.mainRealm();
      try {
        const [script] = await Promise.all([
          frame.browsingContext.addPreloadScript(functionDeclaration, {
            arguments: [channel],
            sandbox: realm.sandbox
          }),
          realm.realm.callFunction(functionDeclaration, false, {
            arguments: [channel]
          })
        ]);
        this.#scripts.push([frame, script]);
      } catch (error) {
        this.#logger?.(DEBUG_PREFIXES.error)?.(error);
      }
    }));
  }
  get #connection() {
    return this.#frame.page().browser().connection;
  }
  #handleMessage = async (params) => {
    const env_1 = { stack: [], error: void 0, hasError: false };
    try {
      if (params.channel !== this.#channel) {
        return;
      }
      const realm = this.#getRealm(params.source);
      if (!realm) {
        return;
      }
      const dataHandle = __addDisposableResource2(env_1, BidiJSHandle.from(params.data, realm), false);
      const stack = __addDisposableResource2(env_1, new DisposableStack(), false);
      const args = [];
      let result;
      try {
        const env_2 = { stack: [], error: void 0, hasError: false };
        try {
          const argsHandle = __addDisposableResource2(env_2, await dataHandle.evaluateHandle(([, , args2]) => {
            return args2;
          }), false);
          for (const [index, handle] of await argsHandle.getProperties()) {
            stack.use(handle);
            if (handle instanceof BidiElementHandle) {
              args[+index] = handle;
              stack.use(handle);
              continue;
            }
            args[+index] = handle.jsonValue();
          }
          result = await this.#apply(...await Promise.all(args));
        } catch (e_1) {
          env_2.error = e_1;
          env_2.hasError = true;
        } finally {
          __disposeResources2(env_2);
        }
      } catch (error) {
        try {
          if (error instanceof Error) {
            await dataHandle.evaluate(([, reject], name, message, stack2) => {
              const error2 = new Error(message);
              error2.name = name;
              if (stack2) {
                error2.stack = stack2;
              }
              reject(error2);
            }, error.name, error.message, error.stack);
          } else {
            await dataHandle.evaluate(([, reject], error2) => {
              reject(error2);
            }, error);
          }
        } catch (error2) {
          this.#logger?.(DEBUG_PREFIXES.error)?.(error2);
        }
        return;
      }
      try {
        await dataHandle.evaluate(([resolve], result2) => {
          resolve(result2);
        }, result);
      } catch (error) {
        this.#logger?.(DEBUG_PREFIXES.error)?.(error);
      }
    } catch (e_2) {
      env_1.error = e_2;
      env_1.hasError = true;
    } finally {
      __disposeResources2(env_1);
    }
  };
  #getRealm(source) {
    const frame = this.#findFrame(source.context);
    if (!frame) {
      return;
    }
    return frame.realm(source.realm);
  }
  #findFrame(id) {
    const frames = [this.#frame];
    for (const frame of frames) {
      if (frame._id === id) {
        return frame;
      }
      frames.push(...frame.childFrames());
    }
    return;
  }
  [Symbol.dispose]() {
    void this[Symbol.asyncDispose]().catch((error) => {
      this.#logger?.(DEBUG_PREFIXES.error)?.(error);
    });
  }
  async [Symbol.asyncDispose]() {
    this.#disposables.dispose();
    await Promise.all(this.#scripts.map(async ([frame, script]) => {
      const realm = this.#isolate ? frame.isolatedRealm() : frame.mainRealm();
      try {
        await Promise.all([
          realm.evaluate((name) => {
            delete globalThis[name];
          }, this.name),
          ...frame.childFrames().map((childFrame) => {
            return childFrame.evaluate((name) => {
              delete globalThis[name];
            }, this.name);
          }),
          frame.browsingContext.removePreloadScript(script)
        ]);
      } catch (error) {
        this.#logger?.(DEBUG_PREFIXES.error)?.(error);
      }
    }));
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/HTTPResponse.js
var __runInitializers8 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate8 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var BidiHTTPResponse = (() => {
  let _classSuper = HTTPResponse;
  let _instanceExtraInitializers = [];
  let _remoteAddress_decorators;
  return class BidiHTTPResponse2 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      _remoteAddress_decorators = [invokeAtMostOnceForArguments];
      __esDecorate8(this, null, _remoteAddress_decorators, { kind: "method", name: "remoteAddress", static: false, private: false, access: { has: (obj) => "remoteAddress" in obj, get: (obj) => obj.remoteAddress }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    /**
     * Returns a new BidiHTTPResponse or updates the existing one if it already exists.
     */
    static from(data, request, cdpSupported) {
      const existingResponse = request.response();
      if (existingResponse) {
        existingResponse.#data = data;
        return existingResponse;
      }
      const response = new BidiHTTPResponse2(data, request, cdpSupported);
      response.#initialize();
      return response;
    }
    #data = __runInitializers8(this, _instanceExtraInitializers);
    #request;
    #securityDetails;
    #cdpSupported = false;
    constructor(data, request, cdpSupported) {
      super();
      this.#data = data;
      this.#request = request;
      this.#cdpSupported = cdpSupported;
      const securityDetails = data["goog:securityDetails"];
      if (cdpSupported && securityDetails) {
        this.#securityDetails = new SecurityDetails(securityDetails);
      }
    }
    #initialize() {
      if (this.#data.fromCache) {
        this.#request._fromMemoryCache = true;
        this.#request.frame()?.page().trustedEmitter.emit("requestservedfromcache", this.#request);
      }
      this.#request.frame()?.page().trustedEmitter.emit("response", this);
    }
    remoteAddress() {
      return {
        ip: "",
        port: -1
      };
    }
    url() {
      return this.#data.url;
    }
    status() {
      return this.#data.status;
    }
    statusText() {
      return this.#data.statusText;
    }
    headers() {
      const headers = {};
      for (const header of this.#data.headers) {
        if (header.value.type === "string") {
          const headerName = header.name.toLowerCase();
          const value = headerName in headers ? `${headers[headerName]}
${header.value.value}` : header.value.value;
          headers[headerName] = normalizeHeaderValue(headerName, value);
        }
      }
      return headers;
    }
    request() {
      return this.#request;
    }
    fromCache() {
      return this.#data.fromCache;
    }
    timing() {
      const bidiTiming = this.#request.timing();
      return {
        requestTime: bidiTiming.requestTime,
        proxyStart: -1,
        proxyEnd: -1,
        dnsStart: bidiTiming.dnsStart,
        dnsEnd: bidiTiming.dnsEnd,
        connectStart: bidiTiming.connectStart,
        connectEnd: bidiTiming.connectEnd,
        sslStart: bidiTiming.tlsStart,
        sslEnd: -1,
        workerStart: -1,
        workerReady: -1,
        workerFetchStart: -1,
        workerRespondWithSettled: -1,
        workerRouterEvaluationStart: -1,
        workerCacheLookupStart: -1,
        sendStart: bidiTiming.requestStart,
        sendEnd: -1,
        pushStart: -1,
        pushEnd: -1,
        receiveHeadersStart: bidiTiming.responseStart,
        receiveHeadersEnd: bidiTiming.responseEnd
      };
    }
    frame() {
      return this.#request.frame();
    }
    fromServiceWorker() {
      return false;
    }
    securityDetails() {
      if (!this.#cdpSupported) {
        throw new UnsupportedOperation();
      }
      return this.#securityDetails ?? null;
    }
    async content() {
      return await this.#request.getResponseContent();
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/HTTPRequest.js
var _a7;
var requests = /* @__PURE__ */ new WeakMap();
var BidiHTTPRequest = class extends HTTPRequest {
  static from(bidiRequest, frame, isNetworkInterceptionEnabled, redirect, logger) {
    const request = new _a7(bidiRequest, frame, isNetworkInterceptionEnabled, redirect, logger);
    request.#initialize();
    return request;
  }
  #redirectChain;
  #response = null;
  id;
  #frame;
  #request;
  #logger;
  constructor(request, frame, isNetworkInterceptionEnabled, redirect, logger) {
    super();
    this.#logger = logger;
    requests.set(request, this);
    this.interception.enabled = isNetworkInterceptionEnabled;
    this.#request = request;
    this.#frame = frame;
    this.#redirectChain = redirect ? redirect.#redirectChain : [];
    this.id = request.id;
  }
  get client() {
    return this.#frame.client;
  }
  #initialize() {
    this.#request.on("redirect", (request) => {
      const httpRequest = _a7.from(request, this.#frame, this.interception.enabled, this, this.#logger);
      this.#redirectChain.push(this);
      request.once("success", () => {
        this.#frame.page().trustedEmitter.emit("requestfinished", httpRequest);
      });
      request.once("error", () => {
        this.#frame.page().trustedEmitter.emit("requestfailed", httpRequest);
      });
      void httpRequest.finalizeInterceptions();
    });
    this.#request.once("response", (data) => {
      this.#response = BidiHTTPResponse.from(data, this, this.#frame.page().browser().cdpSupported);
    });
    this.#request.once("success", (data) => {
      this.#response = BidiHTTPResponse.from(data, this, this.#frame.page().browser().cdpSupported);
    });
    this.#request.on("authenticate", this.#handleAuthentication);
    this.#frame.page().trustedEmitter.emit("request", this);
  }
  canBeIntercepted() {
    return this.#request.isBlocked;
  }
  interceptResolutionState() {
    if (!this.#request.isBlocked) {
      return { action: InterceptResolutionAction.Disabled };
    }
    return super.interceptResolutionState();
  }
  url() {
    return this.#request.url;
  }
  resourceType() {
    if (!this.#frame.page().browser().cdpSupported) {
      throw new UnsupportedOperation();
    }
    return (this.#request.resourceType || "other").toLowerCase();
  }
  method() {
    return this.#request.method;
  }
  postData() {
    if (!this.#frame.page().browser().cdpSupported) {
      throw new UnsupportedOperation();
    }
    return this.#request.postData;
  }
  hasPostData() {
    return this.#request.hasPostData;
  }
  async fetchPostData() {
    return await this.#request.fetchPostData();
  }
  async content() {
    try {
      return await this.#request.getRequestContent();
    } catch (err) {
      this.#logger?.(DEBUG_PREFIXES.error)?.(err);
      return;
    }
  }
  headers() {
    const headers = {};
    for (const header of this.#request.headers) {
      headers[header.name.toLowerCase()] = header.value.value;
    }
    return {
      ...headers
    };
  }
  response() {
    return this.#response;
  }
  failure() {
    if (this.#request.error === void 0) {
      return null;
    }
    return { errorText: this.#request.error };
  }
  isNavigationRequest() {
    return this.#request.navigation !== void 0;
  }
  initiator() {
    return {
      ...this.#request.initiator,
      type: this.#request.initiator?.type ?? "other"
    };
  }
  redirectChain() {
    return this.#redirectChain.slice();
  }
  frame() {
    return this.#frame;
  }
  async _continue(overrides = {}) {
    const headers = getBidiHeaders(overrides.headers);
    this.interception.handled = true;
    return await this.#request.continueRequest({
      url: overrides.url,
      method: overrides.method,
      body: overrides.postData ? {
        type: "base64",
        value: stringToBase64(overrides.postData)
      } : void 0,
      headers: headers.length > 0 ? headers : void 0
    }).catch((error) => {
      this.interception.handled = false;
      return handleError(error, this.#logger);
    });
  }
  async _abort() {
    this.interception.handled = true;
    return await this.#request.failRequest().catch((error) => {
      this.interception.handled = false;
      throw error;
    });
  }
  async _respond(response, _priority) {
    this.interception.handled = true;
    let parsedBody;
    if (response.body) {
      parsedBody = HTTPRequest.getResponse(response.body);
    }
    const headers = getBidiHeaders(response.headers);
    const hasContentLength = headers.some((header) => {
      return header.name === "content-length";
    });
    if (response.contentType) {
      headers.push({
        name: "content-type",
        value: {
          type: "string",
          value: response.contentType
        }
      });
    }
    if (parsedBody?.contentLength && !hasContentLength) {
      headers.push({
        name: "content-length",
        value: {
          type: "string",
          value: String(parsedBody.contentLength)
        }
      });
    }
    const status = response.status || 200;
    return await this.#request.provideResponse({
      statusCode: status,
      headers: headers.length > 0 ? headers : void 0,
      reasonPhrase: STATUS_TEXTS[status],
      body: parsedBody?.base64 ? {
        type: "base64",
        value: parsedBody?.base64
      } : void 0
    }).catch((error) => {
      this.interception.handled = false;
      throw error;
    });
  }
  #authenticationHandled = false;
  #handleAuthentication = async () => {
    if (!this.#frame) {
      return;
    }
    const credentials = this.#frame.page()._credentials;
    if (credentials && !this.#authenticationHandled) {
      this.#authenticationHandled = true;
      await this.#request.continueWithAuth({
        action: "provideCredentials",
        credentials: {
          type: "password",
          username: credentials.username,
          password: credentials.password
        }
      }).catch((error) => {
        this.#logger(DEBUG_PREFIXES.error)?.(error);
      });
    } else {
      await this.#request.continueWithAuth({
        action: "cancel"
      }).catch((error) => {
        this.#logger(DEBUG_PREFIXES.error)?.(error);
      });
    }
  };
  timing() {
    return this.#request.timing();
  }
  getResponseContent() {
    return this.#request.getResponseContent();
  }
};
_a7 = BidiHTTPRequest;
function getBidiHeaders(rawHeaders) {
  const headers = [];
  for (const [name, value] of Object.entries(rawHeaders ?? [])) {
    if (!Object.is(value, void 0)) {
      const values = Array.isArray(value) ? value : [value];
      for (const value2 of values) {
        headers.push({
          name: name.toLowerCase(),
          value: {
            type: "string",
            value: String(value2)
          }
        });
      }
    }
  }
  return headers;
}

// node_modules/puppeteer-core/lib/puppeteer/bidi/Realm.js
var Bidi4 = __toESM(require_out(), 1);

// node_modules/puppeteer-core/lib/puppeteer/bidi/Serializer.js
var UnserializableError = class extends Error {
};
var BidiSerializer = class {
  static serialize(arg) {
    switch (typeof arg) {
      case "symbol":
      case "function":
        throw new UnserializableError(`Unable to serializable ${typeof arg}`);
      case "object":
        return this.#serializeObject(arg);
      case "undefined":
        return {
          type: "undefined"
        };
      case "number":
        return this.#serializeNumber(arg);
      case "bigint":
        return {
          type: "bigint",
          value: arg.toString()
        };
      case "string":
        return {
          type: "string",
          value: arg
        };
      case "boolean":
        return {
          type: "boolean",
          value: arg
        };
    }
  }
  static #serializeNumber(arg) {
    let value;
    if (Object.is(arg, -0)) {
      value = "-0";
    } else if (Object.is(arg, Infinity)) {
      value = "Infinity";
    } else if (Object.is(arg, -Infinity)) {
      value = "-Infinity";
    } else if (Object.is(arg, NaN)) {
      value = "NaN";
    } else {
      value = arg;
    }
    return {
      type: "number",
      value
    };
  }
  static #serializeObject(arg) {
    if (arg === null) {
      return {
        type: "null"
      };
    } else if (Array.isArray(arg)) {
      const parsedArray = arg.map((subArg) => {
        return this.serialize(subArg);
      });
      return {
        type: "array",
        value: parsedArray
      };
    } else if (isPlainObject(arg)) {
      try {
        JSON.stringify(arg);
      } catch (error) {
        if (error instanceof TypeError && error.message.startsWith("Converting circular structure to JSON")) {
          error.message += " Recursive objects are not allowed.";
        }
        throw error;
      }
      const parsedObject = [];
      for (const key in arg) {
        parsedObject.push([this.serialize(key), this.serialize(arg[key])]);
      }
      return {
        type: "object",
        value: parsedObject
      };
    } else if (isRegExp(arg)) {
      return {
        type: "regexp",
        value: {
          pattern: arg.source,
          flags: arg.flags
        }
      };
    } else if (isDate(arg)) {
      return {
        type: "date",
        value: arg.toISOString()
      };
    }
    throw new UnserializableError("Custom object serialization not possible. Use plain objects instead.");
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/util.js
function convertConsoleMessageLevel(method) {
  switch (method) {
    case "group":
      return "startGroup";
    case "groupCollapsed":
      return "startGroupCollapsed";
    case "groupEnd":
      return "endGroup";
    default:
      return method;
  }
}
function getStackTraceLocations(stackTrace) {
  const stackTraceLocations = [];
  if (stackTrace) {
    for (const callFrame of stackTrace.callFrames) {
      stackTraceLocations.push({
        url: callFrame.url,
        lineNumber: callFrame.lineNumber,
        columnNumber: callFrame.columnNumber
      });
    }
  }
  return stackTraceLocations;
}
function getConsoleMessage(entry, args, frame, targetId, worker) {
  const text = args.reduce((value, arg) => {
    const parsedValue = arg instanceof BidiJSHandle && arg.isPrimitiveValue ? BidiDeserializer.deserialize(arg.remoteValue()) : arg.toString();
    return `${value} ${parsedValue}`;
  }, "").slice(1);
  return new ConsoleMessage(convertConsoleMessageLevel(entry.method), text, args, getStackTraceLocations(entry.stackTrace), frame, void 0, targetId, worker);
}
function isConsoleLogEntry(event) {
  return event.type === "console";
}
function isJavaScriptLogEntry(event) {
  return event.type === "javascript";
}
function createEvaluationError(details) {
  if (details.exception.type === "object" && !("value" in details.exception)) {
    return new Error(details.text);
  }
  if (details.exception.type !== "error") {
    return BidiDeserializer.deserialize(details.exception);
  }
  const [name = "", ...parts] = details.text.split(": ");
  const message = parts.join(": ");
  const error = new Error(message);
  error.name = name;
  const stackLines = [];
  if (details.stackTrace && stackLines.length < Error.stackTraceLimit) {
    for (const frame of details.stackTrace.callFrames.reverse()) {
      if (PuppeteerURL.isPuppeteerURL(frame.url) && frame.url !== PuppeteerURL.INTERNAL_URL) {
        const url = PuppeteerURL.parse(frame.url);
        stackLines.unshift(`    at ${frame.functionName || url.functionName} (${url.functionName} at ${url.siteString}, <anonymous>:${frame.lineNumber}:${frame.columnNumber})`);
      } else {
        stackLines.push(`    at ${frame.functionName || "<anonymous>"} (${frame.url}:${frame.lineNumber}:${frame.columnNumber})`);
      }
      if (stackLines.length >= Error.stackTraceLimit) {
        break;
      }
    }
  }
  error.stack = [details.text, ...stackLines].join("\n");
  return error;
}
function rewriteNavigationError(message, ms) {
  return (error) => {
    if (error instanceof ProtocolError) {
      error.message += ` at ${message}`;
    } else if (error instanceof TimeoutError) {
      error.message = `Navigation timeout of ${ms} ms exceeded`;
    }
    throw error;
  };
}
function rewriteEvaluationError(error) {
  if (error instanceof Error) {
    if (error.message.includes("ExecutionContext was destroyed") || error.message.includes("Inspected target navigated or closed")) {
      throw new Error("Execution context was destroyed, most likely because of a navigation.");
    }
  }
  throw error;
}

// node_modules/puppeteer-core/lib/puppeteer/bidi/Realm.js
var __addDisposableResource3 = function(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
};
var __disposeResources3 = /* @__PURE__ */ (function(SuppressedError2) {
  return function(env) {
    function fail(e) {
      env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  };
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var BidiRealm = class extends Realm {
  realm;
  #logger;
  constructor(realm, timeoutSettings, logger) {
    super(timeoutSettings);
    this.realm = realm;
    this.#logger = logger;
  }
  /**
   * @internal
   */
  get logger() {
    return this.#logger;
  }
  initialize() {
    this.realm.on("destroyed", (reason) => {
      this.taskManager.terminateAll(new Error(reason));
      this.dispose();
    });
    this.realm.on("updated", () => {
      this.internalPuppeteerUtil = void 0;
      void this.taskManager.rerunAll();
    });
  }
  internalPuppeteerUtil;
  get puppeteerUtil() {
    const promise = Promise.resolve();
    scriptInjector.inject((script) => {
      if (this.internalPuppeteerUtil) {
        void this.internalPuppeteerUtil.then((handle) => {
          void handle.dispose();
        });
      }
      this.internalPuppeteerUtil = promise.then(() => {
        return this.evaluateHandle(script);
      });
    }, !this.internalPuppeteerUtil);
    return this.internalPuppeteerUtil;
  }
  async evaluateHandle(pageFunction, ...args) {
    return await this.#evaluate(false, pageFunction, ...args);
  }
  async evaluate(pageFunction, ...args) {
    return await this.#evaluate(true, pageFunction, ...args);
  }
  async #evaluate(returnByValue, pageFunction, ...args) {
    const sourceUrlComment = getSourceUrlComment(getSourcePuppeteerURLIfAvailable(pageFunction)?.toString() ?? PuppeteerURL.INTERNAL_URL);
    let responsePromise;
    const resultOwnership = returnByValue ? Bidi4.Script.ResultOwnership.None : Bidi4.Script.ResultOwnership.Root;
    const serializationOptions = returnByValue ? {} : {
      maxObjectDepth: 0,
      maxDomDepth: 0
    };
    if (isString(pageFunction)) {
      const expression = SOURCE_URL_REGEX.test(pageFunction) ? pageFunction : `${pageFunction}
${sourceUrlComment}
`;
      responsePromise = this.realm.evaluate(expression, true, {
        resultOwnership,
        userActivation: true,
        serializationOptions
      });
    } else {
      let functionDeclaration = stringifyFunction(pageFunction);
      functionDeclaration = SOURCE_URL_REGEX.test(functionDeclaration) ? functionDeclaration : `${functionDeclaration}
${sourceUrlComment}
`;
      responsePromise = this.realm.callFunction(
        functionDeclaration,
        /* awaitPromise= */
        true,
        {
          // LazyArgs are used only internally and should not affect the order
          // evaluate calls for the public APIs.
          arguments: args.some((arg) => {
            return arg instanceof LazyArg;
          }) ? await Promise.all(args.map((arg) => {
            return this.serializeAsync(arg);
          })) : args.map((arg) => {
            return this.serialize(arg);
          }),
          resultOwnership,
          userActivation: true,
          serializationOptions
        }
      );
    }
    const result = await responsePromise.catch(rewriteEvaluationError);
    if ("type" in result && result.type === "exception") {
      throw createEvaluationError(result.exceptionDetails);
    }
    if (returnByValue) {
      return BidiDeserializer.deserialize(result.result);
    }
    return this.createHandle(result.result);
  }
  createHandle(result) {
    if ((result.type === "node" || result.type === "window") && this instanceof BidiFrameRealm) {
      return BidiElementHandle.from(result, this);
    }
    return BidiJSHandle.from(result, this);
  }
  async serializeAsync(arg) {
    if (arg instanceof LazyArg) {
      arg = await arg.get(this);
    }
    return this.serialize(arg);
  }
  serialize(arg) {
    if (arg instanceof BidiJSHandle || arg instanceof BidiElementHandle) {
      if (arg.realm !== this) {
        if (!(arg.realm instanceof BidiFrameRealm) || !(this instanceof BidiFrameRealm)) {
          throw new Error("Trying to evaluate JSHandle from different global types. Usually this means you're using a handle from a worker in a page or vice versa.");
        }
        if (arg.realm.environment !== this.environment) {
          throw new Error("Trying to evaluate JSHandle from different frames. Usually this means you're using a handle from a page on a different page.");
        }
      }
      if (arg.disposed) {
        throw new Error("JSHandle is disposed!");
      }
      return arg.remoteValue();
    }
    return BidiSerializer.serialize(arg);
  }
  async destroyHandles(handles) {
    if (this.disposed) {
      return;
    }
    const handleIds = handles.map(({ id }) => {
      return id;
    }).filter((id) => {
      return id !== void 0;
    });
    if (handleIds.length === 0) {
      return;
    }
    void this.realm.disown(handleIds).catch((error) => {
      this.#logger?.(DEBUG_PREFIXES.error)?.(error);
    });
  }
  async adoptHandle(handle) {
    return await this.evaluateHandle((node) => {
      return node;
    }, handle);
  }
  async transferHandle(handle) {
    if (handle.realm === this) {
      return handle;
    }
    const transferredHandle = this.adoptHandle(handle);
    await handle.dispose();
    return await transferredHandle;
  }
  extension() {
    throw new UnsupportedOperation();
  }
  get origin() {
    throw new UnsupportedOperation();
  }
};
var BidiFrameRealm = class _BidiFrameRealm extends BidiRealm {
  static from(realm, frame, logger) {
    const frameRealm = new _BidiFrameRealm(realm, frame, logger);
    frameRealm.#initialize();
    return frameRealm;
  }
  #frame;
  constructor(realm, frame, logger) {
    super(realm, frame.timeoutSettings, logger);
    this.#frame = frame;
  }
  #initialize() {
    super.initialize();
    this.realm.on("updated", () => {
      this.environment.clearDocumentHandle();
      this.#bindingsInstalled = false;
    });
  }
  #bindingsInstalled = false;
  get puppeteerUtil() {
    let promise = Promise.resolve();
    if (!this.#bindingsInstalled) {
      promise = Promise.all([
        ExposableFunction.from(this.environment, "__ariaQuerySelector", ARIAQueryHandler.queryOne, !!this.sandbox, this.logger),
        ExposableFunction.from(this.environment, "__ariaQuerySelectorAll", async (element, selector) => {
          const results = ARIAQueryHandler.queryAll(element, selector);
          return await element.realm.evaluateHandle((...elements) => {
            return elements;
          }, ...await AsyncIterableUtil.collect(results));
        }, !!this.sandbox, this.logger)
      ]);
      this.#bindingsInstalled = true;
    }
    return promise.then(() => {
      return super.puppeteerUtil;
    });
  }
  get sandbox() {
    return this.realm.sandbox;
  }
  get environment() {
    return this.#frame;
  }
  async adoptBackendNode(backendNodeId) {
    const env_1 = { stack: [], error: void 0, hasError: false };
    try {
      const { object } = await this.#frame.client.send("DOM.resolveNode", {
        backendNodeId,
        executionContextId: await this.realm.resolveExecutionContextId()
      });
      const handle = __addDisposableResource3(env_1, BidiElementHandle.from({
        handle: object.objectId,
        type: "node"
      }, this), false);
      return await handle.evaluateHandle((element) => {
        return element;
      });
    } catch (e_1) {
      env_1.error = e_1;
      env_1.hasError = true;
    } finally {
      __disposeResources3(env_1);
    }
  }
};
var BidiWorkerRealm = class _BidiWorkerRealm extends BidiRealm {
  static from(realm, worker, logger) {
    const workerRealm = new _BidiWorkerRealm(realm, worker, logger);
    workerRealm.initialize();
    return workerRealm;
  }
  #worker;
  constructor(realm, frame, logger) {
    super(realm, frame.timeoutSettings, logger);
    this.#worker = frame;
  }
  initialize() {
    super.initialize();
    this.realm.on("log", (entry) => {
      if (isConsoleLogEntry(entry) && this.#worker.listenerCount(WebWorkerEvent.Console)) {
        const args = entry.args.map((arg) => {
          return this.createHandle(arg);
        });
        const message = getConsoleMessage(entry, args, void 0, this.realm.id, this.#worker);
        this.#worker.emit(WebWorkerEvent.Console, message);
      }
    });
  }
  get environment() {
    return this.#worker;
  }
  async adoptBackendNode() {
    throw new Error("Cannot adopt DOM nodes into a worker.");
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/WebWorker.js
var BidiWebWorker = class _BidiWebWorker extends WebWorker {
  static from(frame, realm, logger) {
    const worker = new _BidiWebWorker(frame, realm, logger);
    return worker;
  }
  #frame;
  #realm;
  constructor(frame, realm, logger) {
    super(realm.origin);
    this.#frame = frame;
    this.#realm = BidiWorkerRealm.from(realm, this, logger);
  }
  get frame() {
    return this.#frame;
  }
  mainRealm() {
    return this.#realm;
  }
  get client() {
    throw new UnsupportedOperation();
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/Frame.js
var __runInitializers9 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate9 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var BidiFrame = (() => {
  var _a8;
  let _classSuper = Frame;
  let _instanceExtraInitializers = [];
  let _goto_decorators;
  let _setContent_decorators;
  let _waitForNavigation_decorators;
  let _private_waitForLoad$_decorators;
  let _private_waitForLoad$_descriptor;
  let _private_waitForNetworkIdle$_decorators;
  let _private_waitForNetworkIdle$_descriptor;
  let _setFiles_decorators;
  let _frameElement_decorators;
  let _locateNodes_decorators;
  return class BidiFrame2 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      _goto_decorators = [throwIfDetached];
      _setContent_decorators = [throwIfDetached];
      _waitForNavigation_decorators = [throwIfDetached];
      _private_waitForLoad$_decorators = [throwIfDetached];
      _private_waitForNetworkIdle$_decorators = [throwIfDetached];
      _setFiles_decorators = [throwIfDetached];
      _frameElement_decorators = [throwIfDetached];
      _locateNodes_decorators = [throwIfDetached];
      __esDecorate9(this, null, _goto_decorators, { kind: "method", name: "goto", static: false, private: false, access: { has: (obj) => "goto" in obj, get: (obj) => obj.goto }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate9(this, null, _setContent_decorators, { kind: "method", name: "setContent", static: false, private: false, access: { has: (obj) => "setContent" in obj, get: (obj) => obj.setContent }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate9(this, null, _waitForNavigation_decorators, { kind: "method", name: "waitForNavigation", static: false, private: false, access: { has: (obj) => "waitForNavigation" in obj, get: (obj) => obj.waitForNavigation }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate9(this, _private_waitForLoad$_descriptor = { value: __setFunctionName(function(options = {}) {
        let { waitUntil = "load" } = options;
        const { timeout: ms = this.timeoutSettings.navigationTimeout() } = options;
        if (!Array.isArray(waitUntil)) {
          waitUntil = [waitUntil];
        }
        const events = /* @__PURE__ */ new Set();
        for (const lifecycleEvent of waitUntil) {
          switch (lifecycleEvent) {
            case "load": {
              events.add("load");
              break;
            }
            case "domcontentloaded": {
              events.add("DOMContentLoaded");
              break;
            }
          }
        }
        if (events.size === 0) {
          return of(void 0);
        }
        return combineLatest([...events].map((event) => {
          return fromEmitterEvent(this.browsingContext, event);
        })).pipe(map(() => {
        }), first(), raceWith(timeout(ms), this.#detached$().pipe(map(() => {
          throw new Error("Frame detached.");
        }))));
      }, "#waitForLoad$") }, _private_waitForLoad$_decorators, { kind: "method", name: "#waitForLoad$", static: false, private: true, access: { has: (obj) => #waitForLoad$ in obj, get: (obj) => obj.#waitForLoad$ }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate9(this, _private_waitForNetworkIdle$_descriptor = { value: __setFunctionName(function(options = {}) {
        let { waitUntil = "load" } = options;
        if (!Array.isArray(waitUntil)) {
          waitUntil = [waitUntil];
        }
        let concurrency = Infinity;
        for (const event of waitUntil) {
          switch (event) {
            case "networkidle0": {
              concurrency = Math.min(0, concurrency);
              break;
            }
            case "networkidle2": {
              concurrency = Math.min(2, concurrency);
              break;
            }
          }
        }
        if (concurrency === Infinity) {
          return of(void 0);
        }
        return this.page().waitForNetworkIdle$({
          idleTime: 500,
          timeout: options.timeout ?? this.timeoutSettings.timeout(),
          concurrency
        });
      }, "#waitForNetworkIdle$") }, _private_waitForNetworkIdle$_decorators, { kind: "method", name: "#waitForNetworkIdle$", static: false, private: true, access: { has: (obj) => #waitForNetworkIdle$ in obj, get: (obj) => obj.#waitForNetworkIdle$ }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate9(this, null, _setFiles_decorators, { kind: "method", name: "setFiles", static: false, private: false, access: { has: (obj) => "setFiles" in obj, get: (obj) => obj.setFiles }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate9(this, null, _frameElement_decorators, { kind: "method", name: "frameElement", static: false, private: false, access: { has: (obj) => "frameElement" in obj, get: (obj) => obj.frameElement }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate9(this, null, _locateNodes_decorators, { kind: "method", name: "locateNodes", static: false, private: false, access: { has: (obj) => "locateNodes" in obj, get: (obj) => obj.locateNodes }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    static from(parent, browsingContext, logger) {
      const frame = new BidiFrame2(parent, browsingContext, logger);
      frame.#initialize();
      return frame;
    }
    #parent = __runInitializers9(this, _instanceExtraInitializers);
    browsingContext;
    #frames = /* @__PURE__ */ new WeakMap();
    realms;
    #logger;
    _id;
    client;
    accessibility;
    constructor(parent, browsingContext, logger) {
      super(logger);
      this.#parent = parent;
      this.browsingContext = browsingContext;
      this.#logger = logger;
      this._id = browsingContext.id;
      this.client = new BidiCdpSession(this);
      this.realms = {
        default: BidiFrameRealm.from(this.browsingContext.defaultRealm, this, logger),
        internal: BidiFrameRealm.from(this.browsingContext.createWindowRealm(`__puppeteer_internal_${Math.ceil(Math.random() * 1e4)}`), this, logger)
      };
      this.accessibility = new Accessibility(this.realms.default, this._id, logger);
    }
    #initialize() {
      for (const browsingContext of this.browsingContext.children) {
        this.#createFrameTarget(browsingContext);
      }
      this.browsingContext.on("browsingcontext", (browsingContext) => {
        this.#createFrameTarget(browsingContext);
      });
      this.browsingContext.on("closed", () => {
        for (const session of BidiCdpSession.sessions.values()) {
          if (session.frame === this) {
            session.onClose();
          }
        }
        this.page().trustedEmitter.emit("framedetached", this);
      });
      this.browsingContext.on("request", (request) => {
        const httpRequest = BidiHTTPRequest.from(request, this, this.page().isNetworkInterceptionEnabled, void 0, this.logger);
        request.once("success", () => {
          this.page().trustedEmitter.emit("requestfinished", httpRequest);
        });
        request.once("error", () => {
          this.page().trustedEmitter.emit("requestfailed", httpRequest);
        });
        void httpRequest.finalizeInterceptions();
      });
      this.browsingContext.on("navigation", (navigation) => {
        navigation.once("fragment", () => {
          this.page().trustedEmitter.emit("framenavigated", this);
        });
      });
      this.browsingContext.on("load", () => {
        this.page().trustedEmitter.emit("load", void 0);
      });
      this.browsingContext.on("DOMContentLoaded", () => {
        this._hasStartedLoading = true;
        this.page().trustedEmitter.emit("domcontentloaded", void 0);
        this.page().trustedEmitter.emit("framenavigated", this);
      });
      this.browsingContext.on("userprompt", (userPrompt) => {
        this.page().trustedEmitter.emit("dialog", BidiDialog.from(userPrompt));
      });
      this.browsingContext.on("log", (entry) => {
        if (this._id !== entry.source.context) {
          return;
        }
        if (isConsoleLogEntry(entry)) {
          if (!this.page().listenerCount(
            "console"
            /* PageEvent.Console */
          )) {
            return;
          }
          const args = entry.args.map((arg) => {
            return this.mainRealm().createHandle(arg);
          });
          this.page().trustedEmitter.emit("console", getConsoleMessage(entry, args, this));
        } else if (isJavaScriptLogEntry(entry)) {
          const error = new Error(entry.text ?? "");
          const messageHeight = error.message.split("\n").length;
          const messageLines = error.stack.split("\n").splice(0, messageHeight);
          const stackLines = [];
          if (entry.stackTrace) {
            for (const frame of entry.stackTrace.callFrames) {
              stackLines.push(`    at ${frame.functionName || "<anonymous>"} (${frame.url}:${frame.lineNumber + 1}:${frame.columnNumber + 1})`);
              if (stackLines.length >= Error.stackTraceLimit) {
                break;
              }
            }
          }
          error.stack = [...messageLines, ...stackLines].join("\n");
          this.page().trustedEmitter.emit("pageerror", error);
        } else {
          this.#logger?.(DEBUG_PREFIXES.error)?.(`Unhandled LogEntry with type "${entry.type}", text "${entry.text}" and level "${entry.level}"`);
        }
      });
      this.browsingContext.on("worker", (realm) => {
        const worker = BidiWebWorker.from(this, realm, this.#logger);
        realm.on("destroyed", () => {
          this.page().trustedEmitter.emit("workerdestroyed", worker);
        });
        this.page().trustedEmitter.emit("workercreated", worker);
      });
    }
    #createFrameTarget(browsingContext) {
      const frame = BidiFrame2.from(this, browsingContext, this.#logger);
      this.#frames.set(browsingContext, frame);
      this.page().trustedEmitter.emit("frameattached", frame);
      browsingContext.on("closed", () => {
        this.#frames.delete(browsingContext);
      });
      return frame;
    }
    get timeoutSettings() {
      return this.page()._timeoutSettings;
    }
    mainRealm() {
      return this.realms.default;
    }
    isolatedRealm() {
      return this.realms.internal;
    }
    realm(id) {
      for (const realm of Object.values(this.realms)) {
        if (realm.realm.id === id) {
          return realm;
        }
      }
      return;
    }
    page() {
      let parent = this.#parent;
      while (parent instanceof BidiFrame2) {
        parent = parent.#parent;
      }
      return parent;
    }
    url() {
      return this.browsingContext.url;
    }
    parentFrame() {
      if (this.#parent instanceof BidiFrame2) {
        return this.#parent;
      }
      return null;
    }
    childFrames() {
      return [...this.browsingContext.children].map((child) => {
        return this.#frames.get(child);
      });
    }
    #detached$() {
      return defer(() => {
        if (this.detached) {
          return of(this);
        }
        return fromEmitterEvent(
          this.page().trustedEmitter,
          "framedetached"
          /* PageEvent.FrameDetached */
        ).pipe(filter((detachedFrame) => {
          return detachedFrame === this;
        }));
      });
    }
    async goto(url, options = {}) {
      const [response] = await Promise.all([
        this.waitForNavigation(options),
        // Some implementations currently only report errors when the
        // readiness=interactive.
        //
        // Related: https://bugzilla.mozilla.org/show_bug.cgi?id=1846601
        this.browsingContext.navigate(url, Bidi5.BrowsingContext.ReadinessState.Interactive).catch((error) => {
          if (isErrorLike(error) && error.message.includes("net::ERR_HTTP_RESPONSE_CODE_FAILURE")) {
            return;
          }
          if (error.message.includes("navigation canceled")) {
            return;
          }
          if (error.message.includes("Navigation was aborted by another navigation")) {
            return;
          }
          throw error;
        })
      ]).catch(rewriteNavigationError(url, options.timeout ?? this.timeoutSettings.navigationTimeout()));
      return response;
    }
    async setContent(html, options = {}) {
      await Promise.all([
        this.setFrameContent(html),
        firstValueFrom(combineLatest([
          this.#waitForLoad$(options),
          this.#waitForNetworkIdle$(options)
        ]))
      ]);
    }
    async waitForNavigation(options = {}) {
      const { timeout: ms = this.timeoutSettings.navigationTimeout(), signal } = options;
      const frames = this.childFrames().map((frame) => {
        return frame.#detached$();
      });
      return await firstValueFrom(combineLatest([
        race(fromEmitterEvent(this.browsingContext, "navigation"), fromEmitterEvent(this.browsingContext, "historyUpdated").pipe(map(() => {
          return null;
        }))).pipe(first()).pipe(switchMap((navigation) => {
          if (navigation === null) {
            return of(null);
          }
          return this.#waitForLoad$(options).pipe(delayWhen(() => {
            if (frames.length === 0) {
              return of(void 0);
            }
            return combineLatest(frames);
          }), raceWith(fromEmitterEvent(navigation, "fragment"), fromEmitterEvent(navigation, "failed"), fromEmitterEvent(navigation, "aborted")), switchMap(() => {
            if (navigation.request) {
              let requestFinished$ = function(request) {
                if (navigation === null) {
                  return of(null);
                }
                if (request.response || request.error) {
                  return of(navigation);
                }
                if (request.redirect) {
                  return requestFinished$(request.redirect);
                }
                return fromEmitterEvent(request, "success").pipe(raceWith(fromEmitterEvent(request, "error")), raceWith(fromEmitterEvent(request, "redirect"))).pipe(switchMap(() => {
                  return requestFinished$(request);
                }));
              };
              return requestFinished$(navigation.request);
            }
            return of(navigation);
          }));
        })),
        this.#waitForNetworkIdle$(options)
      ]).pipe(map(([navigation]) => {
        if (!navigation) {
          return null;
        }
        const request = navigation.request;
        if (!request) {
          return null;
        }
        const lastRequest = request.lastRedirect ?? request;
        const httpRequest = requests.get(lastRequest);
        return httpRequest.response();
      }), raceWith(timeout(ms), fromAbortSignal(signal), this.#detached$().pipe(map(() => {
        throw new TargetCloseError("Frame detached.");
      })))));
    }
    waitForDevicePrompt(options = {}) {
      const { timeout: timeout2 = this.timeoutSettings.timeout(), signal } = options;
      return this.browsingContext.waitForDevicePrompt(timeout2, signal);
    }
    get detached() {
      return this.browsingContext.closed;
    }
    #exposedFunctions = /* @__PURE__ */ new Map();
    async exposeFunction(name, apply) {
      if (this.#exposedFunctions.has(name)) {
        throw new Error(`Failed to add page binding with name ${name}: globalThis['${name}'] already exists!`);
      }
      const exposable = await ExposableFunction.from(this, name, apply, false, this.#logger);
      this.#exposedFunctions.set(name, exposable);
    }
    async removeExposedFunction(name) {
      const exposedFunction = this.#exposedFunctions.get(name);
      if (!exposedFunction) {
        throw new Error(`Failed to remove page binding with name ${name}: window['${name}'] does not exists!`);
      }
      this.#exposedFunctions.delete(name);
      await exposedFunction[Symbol.asyncDispose]();
    }
    async createCDPSession() {
      if (!this.page().browser().cdpSupported) {
        throw new UnsupportedOperation();
      }
      const cdpConnection = this.page().browser().cdpConnection;
      return await cdpConnection._createSession({ targetId: this._id });
    }
    get #waitForLoad$() {
      return _private_waitForLoad$_descriptor.value;
    }
    get #waitForNetworkIdle$() {
      return _private_waitForNetworkIdle$_descriptor.value;
    }
    async setFiles(element, files) {
      await this.browsingContext.setFiles(
        // SAFETY: ElementHandles are always remote references.
        element.remoteValue(),
        files
      );
    }
    async frameElement() {
      const parentFrame = this.parentFrame();
      if (!parentFrame) {
        return null;
      }
      const [node] = await parentFrame.browsingContext.locateNodes({
        type: "context",
        value: {
          context: this._id
        }
      });
      if (!node) {
        return null;
      }
      return BidiElementHandle.from(node, parentFrame.mainRealm());
    }
    async locateNodes(element, locator) {
      return await this.browsingContext.locateNodes(
        locator,
        // SAFETY: ElementHandles are always remote references.
        [element.remoteValue()]
      );
    }
    extensionRealms() {
      throw new UnsupportedOperation();
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/Input.js
var Bidi6 = __toESM(require_out(), 1);
var SourceActionsType;
(function(SourceActionsType2) {
  SourceActionsType2["None"] = "none";
  SourceActionsType2["Key"] = "key";
  SourceActionsType2["Pointer"] = "pointer";
  SourceActionsType2["Wheel"] = "wheel";
})(SourceActionsType || (SourceActionsType = {}));
var ActionType;
(function(ActionType2) {
  ActionType2["Pause"] = "pause";
  ActionType2["KeyDown"] = "keyDown";
  ActionType2["KeyUp"] = "keyUp";
  ActionType2["PointerUp"] = "pointerUp";
  ActionType2["PointerDown"] = "pointerDown";
  ActionType2["PointerMove"] = "pointerMove";
  ActionType2["Scroll"] = "scroll";
})(ActionType || (ActionType = {}));
var getBidiKeyValue = (key) => {
  switch (key) {
    case "\r":
    case "\n":
      key = "Enter";
      break;
  }
  if ([...key].length === 1) {
    return key;
  }
  switch (key) {
    case "Cancel":
      return "\uE001";
    case "Help":
      return "\uE002";
    case "Backspace":
      return "\uE003";
    case "Tab":
      return "\uE004";
    case "Clear":
      return "\uE005";
    case "Enter":
      return "\uE007";
    case "Shift":
    case "ShiftLeft":
      return "\uE008";
    case "Control":
    case "ControlLeft":
      return "\uE009";
    case "Alt":
    case "AltLeft":
      return "\uE00A";
    case "Pause":
      return "\uE00B";
    case "Escape":
      return "\uE00C";
    case "PageUp":
      return "\uE00E";
    case "PageDown":
      return "\uE00F";
    case "End":
      return "\uE010";
    case "Home":
      return "\uE011";
    case "ArrowLeft":
      return "\uE012";
    case "ArrowUp":
      return "\uE013";
    case "ArrowRight":
      return "\uE014";
    case "ArrowDown":
      return "\uE015";
    case "Insert":
      return "\uE016";
    case "Delete":
      return "\uE017";
    case "NumpadEqual":
      return "\uE019";
    case "Numpad0":
      return "\uE01A";
    case "Numpad1":
      return "\uE01B";
    case "Numpad2":
      return "\uE01C";
    case "Numpad3":
      return "\uE01D";
    case "Numpad4":
      return "\uE01E";
    case "Numpad5":
      return "\uE01F";
    case "Numpad6":
      return "\uE020";
    case "Numpad7":
      return "\uE021";
    case "Numpad8":
      return "\uE022";
    case "Numpad9":
      return "\uE023";
    case "NumpadMultiply":
      return "\uE024";
    case "NumpadAdd":
      return "\uE025";
    case "NumpadSubtract":
      return "\uE027";
    case "NumpadDecimal":
      return "\uE028";
    case "NumpadDivide":
      return "\uE029";
    case "F1":
      return "\uE031";
    case "F2":
      return "\uE032";
    case "F3":
      return "\uE033";
    case "F4":
      return "\uE034";
    case "F5":
      return "\uE035";
    case "F6":
      return "\uE036";
    case "F7":
      return "\uE037";
    case "F8":
      return "\uE038";
    case "F9":
      return "\uE039";
    case "F10":
      return "\uE03A";
    case "F11":
      return "\uE03B";
    case "F12":
      return "\uE03C";
    case "Meta":
    case "MetaLeft":
      return "\uE03D";
    case "ShiftRight":
      return "\uE050";
    case "ControlRight":
      return "\uE051";
    case "AltRight":
      return "\uE052";
    case "MetaRight":
      return "\uE053";
    case "Digit0":
      return "0";
    case "Digit1":
      return "1";
    case "Digit2":
      return "2";
    case "Digit3":
      return "3";
    case "Digit4":
      return "4";
    case "Digit5":
      return "5";
    case "Digit6":
      return "6";
    case "Digit7":
      return "7";
    case "Digit8":
      return "8";
    case "Digit9":
      return "9";
    case "KeyA":
      return "a";
    case "KeyB":
      return "b";
    case "KeyC":
      return "c";
    case "KeyD":
      return "d";
    case "KeyE":
      return "e";
    case "KeyF":
      return "f";
    case "KeyG":
      return "g";
    case "KeyH":
      return "h";
    case "KeyI":
      return "i";
    case "KeyJ":
      return "j";
    case "KeyK":
      return "k";
    case "KeyL":
      return "l";
    case "KeyM":
      return "m";
    case "KeyN":
      return "n";
    case "KeyO":
      return "o";
    case "KeyP":
      return "p";
    case "KeyQ":
      return "q";
    case "KeyR":
      return "r";
    case "KeyS":
      return "s";
    case "KeyT":
      return "t";
    case "KeyU":
      return "u";
    case "KeyV":
      return "v";
    case "KeyW":
      return "w";
    case "KeyX":
      return "x";
    case "KeyY":
      return "y";
    case "KeyZ":
      return "z";
    case "Semicolon":
      return ";";
    case "Equal":
      return "=";
    case "Comma":
      return ",";
    case "Minus":
      return "-";
    case "Period":
      return ".";
    case "Slash":
      return "/";
    case "Backquote":
      return "`";
    case "BracketLeft":
      return "[";
    case "Backslash":
      return "\\";
    case "BracketRight":
      return "]";
    case "Quote":
      return "'";
    default:
      throw new Error(`Unknown key: "${key}"`);
  }
};
var BidiKeyboard = class extends Keyboard {
  #page;
  constructor(page) {
    super();
    this.#page = page;
  }
  async down(key, _options) {
    await this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Key,
        id: "__puppeteer_keyboard",
        actions: [
          {
            type: ActionType.KeyDown,
            value: getBidiKeyValue(key)
          }
        ]
      }
    ]);
  }
  async up(key) {
    await this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Key,
        id: "__puppeteer_keyboard",
        actions: [
          {
            type: ActionType.KeyUp,
            value: getBidiKeyValue(key)
          }
        ]
      }
    ]);
  }
  async press(key, options = {}) {
    const { delay = 0 } = options;
    const actions = [
      {
        type: ActionType.KeyDown,
        value: getBidiKeyValue(key)
      }
    ];
    if (delay > 0) {
      actions.push({
        type: ActionType.Pause,
        duration: delay
      });
    }
    actions.push({
      type: ActionType.KeyUp,
      value: getBidiKeyValue(key)
    });
    await this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Key,
        id: "__puppeteer_keyboard",
        actions
      }
    ]);
  }
  async type(text, options = {}) {
    const { delay = 0 } = options;
    const values = [...text].map(getBidiKeyValue);
    const actions = [];
    if (delay <= 0) {
      for (const value of values) {
        actions.push({
          type: ActionType.KeyDown,
          value
        }, {
          type: ActionType.KeyUp,
          value
        });
      }
    } else {
      for (const value of values) {
        actions.push({
          type: ActionType.KeyDown,
          value
        }, {
          type: ActionType.Pause,
          duration: delay
        }, {
          type: ActionType.KeyUp,
          value
        });
      }
    }
    await this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Key,
        id: "__puppeteer_keyboard",
        actions
      }
    ]);
  }
  async sendCharacter(char) {
    if ([...char].length > 1) {
      throw new Error("Cannot send more than 1 character.");
    }
    const frame = await this.#page.focusedFrame();
    await frame.isolatedRealm().evaluate(async (char2) => {
      document.execCommand("insertText", false, char2);
    }, char);
  }
};
var getBidiButton = (button) => {
  switch (button) {
    case MouseButton.Left:
      return 0;
    case MouseButton.Middle:
      return 1;
    case MouseButton.Right:
      return 2;
    case MouseButton.Back:
      return 3;
    case MouseButton.Forward:
      return 4;
  }
};
var BidiMouse = class extends Mouse {
  #page;
  #lastMovePoint = { x: 0, y: 0 };
  constructor(page) {
    super();
    this.#page = page;
  }
  async reset() {
    this.#lastMovePoint = { x: 0, y: 0 };
    await this.#page.mainFrame().browsingContext.releaseActions();
  }
  async move(x, y, options = {}) {
    const from2 = this.#lastMovePoint;
    const to = {
      x: Math.round(x),
      y: Math.round(y)
    };
    const actions = [];
    const steps = options.steps ?? 0;
    for (let i = 0; i < steps; ++i) {
      actions.push({
        type: ActionType.PointerMove,
        x: from2.x + (to.x - from2.x) * (i / steps),
        y: from2.y + (to.y - from2.y) * (i / steps),
        origin: options.origin
      });
    }
    actions.push({
      type: ActionType.PointerMove,
      ...to,
      origin: options.origin
    });
    this.#lastMovePoint = to;
    await this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Pointer,
        id: "__puppeteer_mouse",
        actions
      }
    ]);
  }
  async down(options = {}) {
    await this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Pointer,
        id: "__puppeteer_mouse",
        actions: [
          {
            type: ActionType.PointerDown,
            button: getBidiButton(options.button ?? MouseButton.Left)
          }
        ]
      }
    ]);
  }
  async up(options = {}) {
    await this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Pointer,
        id: "__puppeteer_mouse",
        actions: [
          {
            type: ActionType.PointerUp,
            button: getBidiButton(options.button ?? MouseButton.Left)
          }
        ]
      }
    ]);
  }
  async click(x, y, options = {}) {
    const actions = [
      {
        type: ActionType.PointerMove,
        x: Math.round(x),
        y: Math.round(y),
        origin: options.origin
      }
    ];
    const pointerDownAction = {
      type: ActionType.PointerDown,
      button: getBidiButton(options.button ?? MouseButton.Left)
    };
    const pointerUpAction = {
      type: ActionType.PointerUp,
      button: pointerDownAction.button
    };
    for (let i = 1; i < (options.count ?? 1); ++i) {
      actions.push(pointerDownAction, pointerUpAction);
    }
    actions.push(pointerDownAction);
    if (options.delay) {
      actions.push({
        type: ActionType.Pause,
        duration: options.delay
      });
    }
    actions.push(pointerUpAction);
    await this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Pointer,
        id: "__puppeteer_mouse",
        actions
      }
    ]);
  }
  async wheel(options = {}) {
    await this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Wheel,
        id: "__puppeteer_wheel",
        actions: [
          {
            type: ActionType.Scroll,
            ...this.#lastMovePoint ?? {
              x: 0,
              y: 0
            },
            deltaX: options.deltaX ?? 0,
            deltaY: options.deltaY ?? 0
          }
        ]
      }
    ]);
  }
  drag() {
    throw new UnsupportedOperation();
  }
  dragOver() {
    throw new UnsupportedOperation();
  }
  dragEnter() {
    throw new UnsupportedOperation();
  }
  drop() {
    throw new UnsupportedOperation();
  }
  dragAndDrop() {
    throw new UnsupportedOperation();
  }
};
var BidiTouchHandle = class {
  #started = false;
  #x;
  #y;
  #bidiId;
  #page;
  #touchScreen;
  #properties;
  constructor(page, touchScreen, id, x, y, properties) {
    this.#page = page;
    this.#touchScreen = touchScreen;
    this.#x = Math.round(x);
    this.#y = Math.round(y);
    this.#properties = properties;
    this.#bidiId = `${"__puppeteer_finger"}_${id}`;
  }
  async start(options = {}) {
    if (this.#started) {
      throw new TouchError("Touch has already started");
    }
    await this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Pointer,
        id: this.#bidiId,
        parameters: {
          pointerType: Bidi6.Input.PointerType.Touch
        },
        actions: [
          {
            type: ActionType.PointerMove,
            x: this.#x,
            y: this.#y,
            origin: options.origin
          },
          {
            ...this.#properties,
            type: ActionType.PointerDown,
            button: 0
          }
        ]
      }
    ]);
    this.#started = true;
  }
  move(x, y) {
    const newX = Math.round(x);
    const newY = Math.round(y);
    return this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Pointer,
        id: this.#bidiId,
        parameters: {
          pointerType: Bidi6.Input.PointerType.Touch
        },
        actions: [
          {
            ...this.#properties,
            type: ActionType.PointerMove,
            x: newX,
            y: newY
          }
        ]
      }
    ]);
  }
  async end() {
    await this.#page.mainFrame().browsingContext.performActions([
      {
        type: SourceActionsType.Pointer,
        id: this.#bidiId,
        parameters: {
          pointerType: Bidi6.Input.PointerType.Touch
        },
        actions: [
          {
            type: ActionType.PointerUp,
            button: 0
          }
        ]
      }
    ]);
    this.#touchScreen.removeHandle(this);
  }
};
var BidiTouchscreen = class extends Touchscreen {
  #page;
  constructor(page) {
    super();
    this.#page = page;
  }
  async touchStart(x, y, options = {}) {
    const id = this.idGenerator();
    const properties = {
      width: 0.5 * 2,
      // 2 times default touch radius.
      height: 0.5 * 2,
      // 2 times default touch radius.
      pressure: 0.5
    };
    const touch = new BidiTouchHandle(this.#page, this, id, x, y, properties);
    await touch.start(options);
    this.touches.push(touch);
    return touch;
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/ScreenRecording.js
var __runInitializers10 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate10 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var BidiScreenRecording = (() => {
  let _classSuper = ScreenRecording;
  let _instanceExtraInitializers = [];
  let _stop_decorators;
  return class BidiScreenRecording extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      _stop_decorators = [guarded()];
      __esDecorate10(this, null, _stop_decorators, { kind: "method", name: "stop", static: false, private: false, access: { has: (obj) => "stop" in obj, get: (obj) => obj.stop }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    #screencastId = __runInitializers10(this, _instanceExtraInitializers);
    #path;
    /**
     * @internal
     */
    constructor(page, options = {}, logger) {
      super(page, options, logger);
      const browsingContext = this.page.mainFrame().browsingContext;
      browsingContext?.once?.("closed", () => {
        void this.stop().catch((err) => {
          this.logger(DEBUG_PREFIXES.error)?.(err);
        });
      });
    }
    /**
     * @internal
     */
    async _start() {
      const frameRate = this.options.frameRate ?? this.options.fps;
      const video = this.options.maxWidth !== void 0 || this.options.maxHeight !== void 0 || frameRate !== void 0 ? {
        width: this.options.maxWidth,
        height: this.options.maxHeight,
        frameRate
      } : void 0;
      const result = await this.page.mainFrame().browsingContext.startScreencast({
        audio: this.options.audio,
        video
      });
      this.#screencastId = result.screencast;
      this.#path = result.path;
    }
    /**
     * Stops the screen recording.
     *
     * @public
     */
    async stop() {
      if (this.stopped) {
        return;
      }
      this.stopped = true;
      try {
        if (!this.#screencastId) {
          return;
        }
        const result = await this.page.mainFrame().browsingContext.stopScreencast(this.#screencastId).catch((err) => {
          this.logger(DEBUG_PREFIXES.error)?.(err);
          return void 0;
        });
        if (result?.error) {
          this.logger(DEBUG_PREFIXES.error)?.(result.error);
        }
        const filePath = result?.path ?? this.#path;
        if (filePath) {
          try {
            const buffer = await environment.value.readFile(filePath);
            this.controller.enqueue(buffer);
            for (const dest of this.destinations) {
              dest.write(buffer);
            }
          } catch (err) {
            this.logger(DEBUG_PREFIXES.error)?.(err);
          }
        }
      } finally {
        await this.closeDestinations();
      }
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/Page.js
var __esDecorate11 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var __runInitializers11 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __addDisposableResource4 = function(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
};
var __disposeResources4 = /* @__PURE__ */ (function(SuppressedError2) {
  return function(env) {
    function fail(e) {
      env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  };
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var BidiPage = (() => {
  let _classSuper = Page;
  let _trustedEmitter_decorators;
  let _trustedEmitter_initializers = [];
  let _trustedEmitter_extraInitializers = [];
  return class BidiPage2 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      _trustedEmitter_decorators = [bubble()];
      __esDecorate11(this, null, _trustedEmitter_decorators, { kind: "accessor", name: "trustedEmitter", static: false, private: false, access: { has: (obj) => "trustedEmitter" in obj, get: (obj) => obj.trustedEmitter, set: (obj, value) => {
        obj.trustedEmitter = value;
      } }, metadata: _metadata }, _trustedEmitter_initializers, _trustedEmitter_extraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    static from(browserContext, browsingContext, logger) {
      const page = new BidiPage2(browserContext, browsingContext, logger);
      page.#initialize();
      return page;
    }
    #trustedEmitter_accessor_storage = __runInitializers11(this, _trustedEmitter_initializers, new EventEmitter());
    get trustedEmitter() {
      return this.#trustedEmitter_accessor_storage;
    }
    set trustedEmitter(value) {
      this.#trustedEmitter_accessor_storage = value;
    }
    #browserContext = __runInitializers11(this, _trustedEmitter_extraInitializers);
    #frame;
    #viewport = null;
    #workers = /* @__PURE__ */ new Set();
    keyboard;
    mouse;
    touchscreen;
    tracing;
    get webmcp() {
      throw new UnsupportedOperation();
    }
    coverage;
    #cdpEmulationManager;
    #emulatedNetworkConditions;
    #fileChooserDeferreds = /* @__PURE__ */ new Set();
    _client() {
      return this.#frame.client;
    }
    constructor(browserContext, browsingContext, logger) {
      super(logger);
      this.#browserContext = browserContext;
      this.#frame = BidiFrame.from(this, browsingContext, logger);
      this.#cdpEmulationManager = new EmulationManager(this.#frame.client, logger);
      this.tracing = new Tracing(this.#frame.client, logger);
      this.coverage = new Coverage(this.#frame.client);
      this.keyboard = new BidiKeyboard(this);
      this.mouse = new BidiMouse(this);
      this.touchscreen = new BidiTouchscreen(this);
    }
    #initialize() {
      this.#frame.browsingContext.on("closed", () => {
        this.trustedEmitter.emit("close", void 0);
        this.trustedEmitter.removeAllListeners();
      });
      this.trustedEmitter.on("workercreated", (worker) => {
        this.#workers.add(worker);
      });
      this.trustedEmitter.on("workerdestroyed", (worker) => {
        this.#workers.delete(worker);
      });
    }
    /**
     * @internal
     */
    async setUserAgent(userAgentOrOptions, userAgentMetadata) {
      let userAgent;
      let clientHints;
      let platform;
      if (typeof userAgentOrOptions === "string") {
        userAgent = userAgentOrOptions;
        clientHints = userAgentMetadata;
      } else {
        userAgent = userAgentOrOptions.userAgent ?? null;
        clientHints = userAgentOrOptions.userAgentMetadata;
        platform = userAgentOrOptions.platform === "" ? void 0 : userAgentOrOptions.platform;
      }
      if (userAgent === "") {
        userAgent = null;
      }
      await this.#frame.browsingContext.setUserAgent(userAgent);
      if (platform && platform !== "") {
        clientHints = clientHints ?? {};
        clientHints.platform = platform;
      }
      await this.#frame.browsingContext.setClientHintsOverride(clientHints ?? null);
    }
    async setBypassCSP(enabled) {
      await this._client().send("Page.setBypassCSP", { enabled });
    }
    async queryObjects(prototypeHandle) {
      assert(!prototypeHandle.disposed, "Prototype JSHandle is disposed!");
      assert(prototypeHandle.id, "Prototype JSHandle must not be referencing primitive value");
      const response = await this.#frame.client.send("Runtime.queryObjects", {
        prototypeObjectId: prototypeHandle.id
      });
      return this.#frame.mainRealm().createHandle({
        type: "array",
        handle: response.objects.objectId
      });
    }
    browser() {
      return this.browserContext().browser();
    }
    browserContext() {
      return this.#browserContext;
    }
    mainFrame() {
      return this.#frame;
    }
    async triggerExtensionAction(_extension) {
      throw new UnsupportedOperation();
    }
    async emulateFocusedPage(enabled) {
      return await this.#cdpEmulationManager.emulateFocus(enabled);
    }
    resize(_params) {
      throw new UnsupportedOperation();
    }
    async windowId() {
      return this.#frame.browsingContext.windowId;
    }
    tabInfo() {
      throw new UnsupportedOperation();
    }
    openDevTools() {
      throw new UnsupportedOperation();
    }
    hasDevTools() {
      throw new UnsupportedOperation();
    }
    async focusedFrame() {
      const env_1 = { stack: [], error: void 0, hasError: false };
      try {
        const handle = __addDisposableResource4(env_1, await this.mainFrame().isolatedRealm().evaluateHandle(() => {
          let win = window;
          while (win.document.activeElement instanceof win.HTMLIFrameElement || win.document.activeElement instanceof win.HTMLFrameElement) {
            if (win.document.activeElement.contentWindow === null) {
              break;
            }
            win = win.document.activeElement.contentWindow;
          }
          return win;
        }), false);
        const value = handle.remoteValue();
        assert(value.type === "window");
        const frame = this.frames().find((frame2) => {
          return frame2._id === value.value.context;
        });
        assert(frame);
        return frame;
      } catch (e_1) {
        env_1.error = e_1;
        env_1.hasError = true;
      } finally {
        __disposeResources4(env_1);
      }
    }
    frames() {
      const frames = [this.#frame];
      for (const frame of frames) {
        frames.push(...frame.childFrames());
      }
      return frames;
    }
    isClosed() {
      return this.#frame.detached;
    }
    async close(options) {
      const env_2 = { stack: [], error: void 0, hasError: false };
      try {
        const _guard = __addDisposableResource4(env_2, await this.#browserContext.waitForScreenshotOperations(), false);
        try {
          await this.#frame.browsingContext.close(options?.runBeforeUnload);
        } catch {
          return;
        }
      } catch (e_2) {
        env_2.error = e_2;
        env_2.hasError = true;
      } finally {
        __disposeResources4(env_2);
      }
    }
    async reload(options = {}) {
      const [response] = await Promise.all([
        this.#frame.waitForNavigation(options),
        this.#frame.browsingContext.reload({
          ignoreCache: options.ignoreCache ? true : void 0
        })
      ]).catch(rewriteNavigationError(this.url(), options.timeout ?? this._timeoutSettings.navigationTimeout()));
      return response;
    }
    setDefaultNavigationTimeout(timeout2) {
      this._timeoutSettings.setDefaultNavigationTimeout(timeout2);
    }
    setDefaultTimeout(timeout2) {
      this._timeoutSettings.setDefaultTimeout(timeout2);
    }
    getDefaultTimeout() {
      return this._timeoutSettings.timeout();
    }
    getDefaultNavigationTimeout() {
      return this._timeoutSettings.navigationTimeout();
    }
    isJavaScriptEnabled() {
      return this.#frame.browsingContext.isJavaScriptEnabled();
    }
    async setGeolocation(options) {
      if (options === null) {
        return await this.#frame.browsingContext.setGeolocationOverride({
          coordinates: null
        });
      }
      const { longitude, latitude, accuracy = 0 } = options;
      if (longitude < -180 || longitude > 180) {
        throw new Error(`Invalid longitude "${longitude}": precondition -180 <= LONGITUDE <= 180 failed.`);
      }
      if (latitude < -90 || latitude > 90) {
        throw new Error(`Invalid latitude "${latitude}": precondition -90 <= LATITUDE <= 90 failed.`);
      }
      if (accuracy < 0) {
        throw new Error(`Invalid accuracy "${accuracy}": precondition 0 <= ACCURACY failed.`);
      }
      return await this.#frame.browsingContext.setGeolocationOverride({
        coordinates: {
          latitude: options.latitude,
          longitude: options.longitude,
          accuracy: options.accuracy
        }
      });
    }
    async setJavaScriptEnabled(enabled) {
      return await this.#frame.browsingContext.setJavaScriptEnabled(enabled);
    }
    async emulateMediaType(type) {
      return await this.#cdpEmulationManager.emulateMediaType(type);
    }
    async emulateCPUThrottling(factor) {
      return await this.#cdpEmulationManager.emulateCPUThrottling(factor);
    }
    async emulateMediaFeatures(features) {
      return await this.#cdpEmulationManager.emulateMediaFeatures(features);
    }
    async emulateTimezone(timezoneId) {
      return await this.#frame.browsingContext.setTimezoneOverride(timezoneId);
    }
    async emulateLocale(locale) {
      return await this.#frame.browsingContext.setLocaleOverride(locale);
    }
    async emulateIdleState(overrides) {
      return await this.#cdpEmulationManager.emulateIdleState(overrides);
    }
    async emulateVisionDeficiency(type) {
      return await this.#cdpEmulationManager.emulateVisionDeficiency(type);
    }
    async setViewport(viewport) {
      let needsReload = false;
      if (!this.browser().cdpSupported) {
        const viewportSize = viewport?.width && viewport?.height ? {
          width: viewport.width,
          height: viewport.height
        } : null;
        const devicePixelRatio = viewport?.deviceScaleFactor ? viewport.deviceScaleFactor : null;
        const screenOrientation = viewport ? viewport.isLandscape ? {
          natural: Bidi7.Emulation.ScreenOrientationNatural.Landscape,
          type: "landscape-primary"
        } : {
          natural: Bidi7.Emulation.ScreenOrientationNatural.Portrait,
          type: "portrait-primary"
        } : null;
        const commands = [
          this.#frame.browsingContext.setViewport({
            viewport: viewportSize,
            devicePixelRatio
          }),
          this.#frame.browsingContext.setScreenOrientationOverride(screenOrientation)
        ];
        if ((this.#viewport?.hasTouch ?? false) !== (viewport?.hasTouch ?? false)) {
          needsReload = true;
          const maxTouchPoints = viewport?.hasTouch ? 1 : null;
          commands.push(this.#frame.browsingContext.setTouchOverride(maxTouchPoints).catch((error) => {
            if (error instanceof ProtocolError && (error.message.includes("unknown command") || error.message.includes("unsupported operation"))) {
              return;
            }
            throw error;
          }));
        }
        await Promise.all(commands);
      } else {
        needsReload = await this.#cdpEmulationManager.emulateViewport(viewport);
      }
      this.#viewport = viewport;
      if (needsReload) {
        await this.reload();
      }
    }
    viewport() {
      return this.#viewport;
    }
    async pdf(options = {}) {
      const { timeout: ms = this._timeoutSettings.timeout(), path = void 0 } = options;
      const { printBackground: background, margin, landscape, width, height, pageRanges: ranges, scale, preferCSSPageSize } = parsePDFOptions(options, "cm");
      const pageRanges = ranges ? ranges.split(",").map((range) => {
        return range.trim();
      }) : [];
      await firstValueFrom(from(this.mainFrame().isolatedRealm().evaluate(() => {
        return document.fonts.ready;
      })).pipe(raceWith(timeout(ms))));
      const data = await firstValueFrom(from(this.#frame.browsingContext.print({
        background,
        margin,
        orientation: landscape ? "landscape" : "portrait",
        page: {
          width,
          height
        },
        pageRanges,
        scale,
        shrinkToFit: !preferCSSPageSize
      })).pipe(raceWith(timeout(ms))));
      const typedArray = stringToTypedArray(data, true);
      await this._maybeWriteTypedArrayToFile(path, typedArray);
      return typedArray;
    }
    async createPDFStream(options) {
      const typedArray = await this.pdf(options);
      return new ReadableStream({
        start(controller) {
          controller.enqueue(typedArray);
          controller.close();
        }
      });
    }
    async _screenshot(options) {
      const { clip, type, captureBeyondViewport, quality } = options;
      if (options.omitBackground !== void 0 && options.omitBackground) {
        throw new UnsupportedOperation(`BiDi does not support 'omitBackground'.`);
      }
      if (options.optimizeForSpeed !== void 0 && options.optimizeForSpeed) {
        throw new UnsupportedOperation(`BiDi does not support 'optimizeForSpeed'.`);
      }
      if (options.fromSurface !== void 0 && !options.fromSurface) {
        throw new UnsupportedOperation(`BiDi does not support 'fromSurface'.`);
      }
      if (clip !== void 0 && clip.scale !== void 0 && clip.scale !== 1) {
        throw new UnsupportedOperation(`BiDi does not support 'scale' in 'clip'.`);
      }
      let box;
      if (clip) {
        if (captureBeyondViewport) {
          box = clip;
        } else {
          const [pageLeft, pageTop] = await this.evaluate(() => {
            if (!window.visualViewport) {
              throw new Error("window.visualViewport is not supported.");
            }
            return [
              window.visualViewport.pageLeft,
              window.visualViewport.pageTop
            ];
          });
          box = {
            ...clip,
            x: clip.x - pageLeft,
            y: clip.y - pageTop
          };
        }
      }
      const data = await this.#frame.browsingContext.captureScreenshot({
        origin: captureBeyondViewport ? "document" : "viewport",
        format: {
          type: `image/${type}`,
          ...quality !== void 0 ? { quality: quality / 100 } : {}
        },
        ...box ? { clip: { type: "box", ...box } } : {}
      });
      return data;
    }
    async createCDPSession() {
      return await this.#frame.createCDPSession();
    }
    async bringToFront() {
      await this.#frame.browsingContext.activate();
    }
    async evaluateOnNewDocument(pageFunction, ...args) {
      const expression = evaluationExpression(pageFunction, ...args);
      const script = await this.#frame.browsingContext.addPreloadScript(expression);
      return { identifier: script };
    }
    async removeScriptToEvaluateOnNewDocument(id) {
      await this.#frame.browsingContext.removePreloadScript(id);
    }
    async exposeFunction(name, pptrFunction) {
      return await this.mainFrame().exposeFunction(name, "default" in pptrFunction ? pptrFunction.default : pptrFunction);
    }
    isDragInterceptionEnabled() {
      return false;
    }
    async setCacheEnabled(enabled) {
      if (!this.#browserContext.browser().cdpSupported) {
        await this.#frame.browsingContext.setCacheBehavior(enabled ? "default" : "bypass");
        return;
      }
      await this._client().send("Network.setCacheDisabled", {
        cacheDisabled: !enabled
      });
    }
    async cookies(...urls) {
      const normalizedUrls = (urls.length ? urls : [this.url()]).map((url) => {
        return new URL(url);
      });
      const cookies = await this.#frame.browsingContext.getCookies();
      return cookies.map((cookie) => {
        return bidiToPuppeteerCookie(cookie);
      }).filter((cookie) => {
        return normalizedUrls.some((url) => {
          return testUrlMatchCookie(cookie, url);
        });
      });
    }
    isServiceWorkerBypassed() {
      throw new UnsupportedOperation();
    }
    target() {
      const target = this.browserContext().getTargetForPage(this);
      if (!target) {
        throw new Error("Target not found for page");
      }
      return target;
    }
    async waitForFileChooser(options = {}) {
      const { timeout: timeout2 = this._timeoutSettings.timeout() } = options;
      const deferred = Deferred.create({
        message: `Waiting for \`FileChooser\` failed: ${timeout2}ms exceeded`,
        timeout: timeout2
      });
      this.#fileChooserDeferreds.add(deferred);
      if (options.signal) {
        options.signal.addEventListener("abort", () => {
          deferred.reject(options.signal?.reason);
        }, { once: true });
      }
      this.#frame.browsingContext.once("filedialogopened", (info) => {
        if (!info.element) {
          return;
        }
        const chooser = new FileChooser(BidiElementHandle.from({
          sharedId: info.element.sharedId,
          handle: info.element.handle,
          type: "node"
        }, this.#frame.mainRealm()), info.multiple);
        for (const deferred2 of this.#fileChooserDeferreds) {
          deferred2.resolve(chooser);
          this.#fileChooserDeferreds.delete(deferred2);
        }
      });
      try {
        return await deferred.valueOrThrow();
      } catch (error) {
        this.#fileChooserDeferreds.delete(deferred);
        throw error;
      }
    }
    workers() {
      return [...this.#workers];
    }
    get isNetworkInterceptionEnabled() {
      return Boolean(this.#requestInterception) || Boolean(this.#authInterception);
    }
    #requestInterception;
    async setRequestInterception(enable) {
      this.#requestInterception = await this.#toggleInterception([Bidi7.Network.InterceptPhase.BeforeRequestSent], this.#requestInterception, enable);
    }
    /**
     * @internal
     */
    async setExtraHTTPHeaders(headers) {
      await this.#frame.browsingContext.setExtraHTTPHeaders(headersInputToRecord(headers));
    }
    /**
     * @internal
     */
    _credentials = null;
    #authInterception;
    async authenticate(credentials) {
      this.#authInterception = await this.#toggleInterception([Bidi7.Network.InterceptPhase.AuthRequired], this.#authInterception, Boolean(credentials));
      this._credentials = credentials;
    }
    async #toggleInterception(phases, interception, expected) {
      if (expected && !interception) {
        return await this.#frame.browsingContext.addIntercept({
          phases
        });
      } else if (!expected && interception) {
        await this.#frame.browsingContext.userContext.browser.removeIntercept(interception);
        return;
      }
      return interception;
    }
    setDragInterception() {
      throw new UnsupportedOperation();
    }
    setBypassServiceWorker() {
      throw new UnsupportedOperation();
    }
    async setOfflineMode(enabled) {
      if (!this.#browserContext.browser().cdpSupported) {
        return await this.#frame.browsingContext.setOfflineMode(enabled);
      }
      if (!this.#emulatedNetworkConditions) {
        this.#emulatedNetworkConditions = {
          offline: false,
          upload: -1,
          download: -1,
          latency: 0
        };
      }
      this.#emulatedNetworkConditions.offline = enabled;
      return await this.#applyNetworkConditions();
    }
    async emulateNetworkConditions(networkConditions) {
      if (!this.#browserContext.browser().cdpSupported) {
        if (!networkConditions?.offline && ((networkConditions?.upload ?? -1) >= 0 || (networkConditions?.download ?? -1) >= 0 || (networkConditions?.latency ?? 0) > 0)) {
          throw new UnsupportedOperation();
        }
        return await this.#frame.browsingContext.setOfflineMode(networkConditions?.offline ?? false);
      }
      if (!this.#emulatedNetworkConditions) {
        this.#emulatedNetworkConditions = {
          offline: networkConditions?.offline ?? false,
          upload: -1,
          download: -1,
          latency: 0
        };
      }
      this.#emulatedNetworkConditions.upload = networkConditions?.upload ?? -1;
      this.#emulatedNetworkConditions.download = networkConditions?.download ?? -1;
      this.#emulatedNetworkConditions.latency = networkConditions?.latency ?? 0;
      this.#emulatedNetworkConditions.offline = networkConditions?.offline ?? false;
      return await this.#applyNetworkConditions();
    }
    async #applyNetworkConditions() {
      if (!this.#emulatedNetworkConditions) {
        return;
      }
      await this._client().send("Network.overrideNetworkState", {
        offline: this.#emulatedNetworkConditions.offline,
        latency: this.#emulatedNetworkConditions.latency,
        uploadThroughput: this.#emulatedNetworkConditions.upload,
        downloadThroughput: this.#emulatedNetworkConditions.download
      });
      await this._client().send("Network.emulateNetworkConditionsByRule", {
        matchedNetworkConditions: [
          {
            urlPattern: "",
            offline: this.#emulatedNetworkConditions.offline,
            latency: this.#emulatedNetworkConditions.latency,
            downloadThroughput: this.#emulatedNetworkConditions.download,
            uploadThroughput: this.#emulatedNetworkConditions.upload
          }
        ]
      });
    }
    async setCookie(...cookies) {
      const pageURL = this.url();
      const pageUrlStartsWithHTTP = pageURL.startsWith("http");
      for (const cookie of cookies) {
        let cookieUrl = cookie.url || "";
        if (!cookieUrl && pageUrlStartsWithHTTP) {
          cookieUrl = pageURL;
        }
        assert(cookieUrl !== "about:blank", `Blank page can not have cookie "${cookie.name}"`);
        assert(!String.prototype.startsWith.call(cookieUrl || "", "data:"), `Data URL page can not have cookie "${cookie.name}"`);
        assert(cookie.partitionKey === void 0 || typeof cookie.partitionKey === "string", "BiDi only allows domain partition keys");
        const normalizedUrl = URL.canParse(cookieUrl) ? new URL(cookieUrl) : void 0;
        const domain = cookie.domain ?? normalizedUrl?.hostname;
        assert(domain !== void 0, `At least one of the url and domain needs to be specified`);
        const bidiCookie = {
          domain,
          name: cookie.name,
          value: {
            type: "string",
            value: cookie.value
          },
          ...cookie.path !== void 0 ? { path: cookie.path } : {},
          ...cookie.httpOnly !== void 0 ? { httpOnly: cookie.httpOnly } : {},
          ...cookie.secure !== void 0 ? { secure: cookie.secure } : {},
          ...cookie.sameSite !== void 0 ? { sameSite: convertCookiesSameSiteCdpToBiDi(cookie.sameSite) } : {},
          ...{ expiry: convertCookiesExpiryCdpToBiDi(cookie.expires) },
          // Chrome-specific properties.
          ...cdpSpecificCookiePropertiesFromPuppeteerToBidi(cookie, "sourceScheme", "priority", "url")
        };
        if (cookie.partitionKey !== void 0) {
          await this.browserContext().userContext.setCookie(bidiCookie, cookie.partitionKey);
        } else {
          await this.#frame.browsingContext.setCookie(bidiCookie);
        }
      }
    }
    async deleteCookie(...cookies) {
      await Promise.all(cookies.map(async (deleteCookieRequest) => {
        const cookieUrl = deleteCookieRequest.url ?? this.url();
        const normalizedUrl = URL.canParse(cookieUrl) ? new URL(cookieUrl) : void 0;
        const domain = deleteCookieRequest.domain ?? normalizedUrl?.hostname;
        assert(domain !== void 0, `At least one of the url and domain needs to be specified`);
        const filter2 = {
          domain,
          name: deleteCookieRequest.name,
          ...deleteCookieRequest.path !== void 0 ? { path: deleteCookieRequest.path } : {}
        };
        await this.#frame.browsingContext.deleteCookie(filter2);
      }));
    }
    async removeExposedFunction(name) {
      await this.#frame.removeExposedFunction(name);
    }
    metrics() {
      throw new UnsupportedOperation();
    }
    async captureHeapSnapshot(_options) {
      throw new UnsupportedOperation();
    }
    async goBack(options = {}) {
      return await this.#go(-1, options);
    }
    async goForward(options = {}) {
      return await this.#go(1, options);
    }
    async #go(delta, options) {
      const controller = new AbortController();
      try {
        const [response] = await Promise.all([
          this.waitForNavigation({
            ...options,
            signal: controller.signal
          }),
          this.#frame.browsingContext.traverseHistory(delta)
        ]);
        return response;
      } catch (error) {
        controller.abort();
        throw error;
      }
    }
    async waitForDevicePrompt(options = {}) {
      return await this.mainFrame().waitForDevicePrompt(options);
    }
    get bluetooth() {
      return this.mainFrame().browsingContext.bluetooth;
    }
    extensionRealms() {
      throw new UnsupportedOperation();
    }
    /**
     * @internal
     */
    createScreenRecording(options) {
      return new BidiScreenRecording(this, options, this.logger);
    }
  };
})();
function evaluationExpression(fun, ...args) {
  return `() => {${evaluationString(fun, ...args)}}`;
}
function testUrlMatchCookieHostname(cookie, normalizedUrl) {
  const cookieDomain = cookie.domain.toLowerCase();
  const urlHostname = normalizedUrl.hostname.toLowerCase();
  if (cookieDomain === urlHostname) {
    return true;
  }
  return cookieDomain.startsWith(".") && urlHostname.endsWith(cookieDomain);
}
function testUrlMatchCookiePath(cookie, normalizedUrl) {
  const uriPath = normalizedUrl.pathname;
  const cookiePath = cookie.path;
  if (uriPath === cookiePath) {
    return true;
  }
  if (uriPath.startsWith(cookiePath)) {
    if (cookiePath.endsWith("/")) {
      return true;
    }
    if (uriPath[cookiePath.length] === "/") {
      return true;
    }
  }
  return false;
}
function testUrlMatchCookie(cookie, url) {
  const normalizedUrl = new URL(url);
  assert(cookie !== void 0);
  if (!testUrlMatchCookieHostname(cookie, normalizedUrl)) {
    return false;
  }
  return testUrlMatchCookiePath(cookie, normalizedUrl);
}
function bidiToPuppeteerCookie(bidiCookie, returnCompositePartitionKey = false) {
  const partitionKey = bidiCookie[CDP_SPECIFIC_PREFIX + "partitionKey"];
  function getPartitionKey() {
    if (typeof partitionKey === "string") {
      return { partitionKey };
    }
    if (typeof partitionKey === "object" && partitionKey !== null) {
      if (returnCompositePartitionKey) {
        return {
          partitionKey: {
            sourceOrigin: partitionKey.topLevelSite,
            hasCrossSiteAncestor: partitionKey.hasCrossSiteAncestor ?? false
          }
        };
      }
      return {
        // TODO: a breaking change in Puppeteer is required to change
        // partitionKey type and report the composite partition key.
        partitionKey: partitionKey.topLevelSite
      };
    }
    return {};
  }
  return {
    name: bidiCookie.name,
    // Presents binary value as base64 string.
    value: bidiCookie.value.value,
    domain: bidiCookie.domain,
    path: bidiCookie.path,
    size: bidiCookie.size,
    httpOnly: bidiCookie.httpOnly,
    secure: bidiCookie.secure,
    sameSite: convertCookiesSameSiteBiDiToCdp(bidiCookie.sameSite),
    expires: bidiCookie.expiry ?? -1,
    session: bidiCookie.expiry === void 0 || bidiCookie.expiry <= 0,
    // Extending with CDP-specific properties with `goog:` prefix.
    ...cdpSpecificCookiePropertiesFromBidiToPuppeteer(bidiCookie, "sourceScheme", "partitionKeyOpaque", "priority"),
    ...getPartitionKey()
  };
}
var CDP_SPECIFIC_PREFIX = "goog:";
function cdpSpecificCookiePropertiesFromBidiToPuppeteer(bidiCookie, ...propertyNames) {
  const result = {};
  for (const property of propertyNames) {
    if (bidiCookie[CDP_SPECIFIC_PREFIX + property] !== void 0) {
      result[property] = bidiCookie[CDP_SPECIFIC_PREFIX + property];
    }
  }
  return result;
}
function cdpSpecificCookiePropertiesFromPuppeteerToBidi(cookieParam, ...propertyNames) {
  const result = {};
  for (const property of propertyNames) {
    if (cookieParam[property] !== void 0) {
      result[CDP_SPECIFIC_PREFIX + property] = cookieParam[property];
    }
  }
  return result;
}
function convertCookiesSameSiteBiDiToCdp(sameSite) {
  switch (sameSite) {
    case "strict":
      return "Strict";
    case "lax":
      return "Lax";
    case "none":
      return "None";
    default:
      return "Default";
  }
}
function convertCookiesSameSiteCdpToBiDi(sameSite) {
  switch (sameSite) {
    case "Strict":
      return Bidi7.Network.SameSite.Strict;
    case "Lax":
      return Bidi7.Network.SameSite.Lax;
    case "None":
      return Bidi7.Network.SameSite.None;
    default:
      return Bidi7.Network.SameSite.Default;
  }
}
function convertCookiesExpiryCdpToBiDi(expiry) {
  return [void 0, -1].includes(expiry) ? void 0 : expiry;
}
function convertCookiesPartitionKeyFromPuppeteerToBiDi(partitionKey) {
  if (partitionKey === void 0 || typeof partitionKey === "string") {
    return partitionKey;
  }
  if (partitionKey.hasCrossSiteAncestor) {
    throw new UnsupportedOperation("WebDriver BiDi does not support `hasCrossSiteAncestor` yet.");
  }
  return partitionKey.sourceOrigin;
}

// node_modules/puppeteer-core/lib/puppeteer/bidi/Target.js
var BidiBrowserTarget = class extends Target {
  #browser;
  constructor(browser, logger) {
    super(logger);
    this.#browser = browser;
  }
  asPage() {
    throw new UnsupportedOperation();
  }
  url() {
    return "";
  }
  createCDPSession() {
    throw new UnsupportedOperation();
  }
  type() {
    return TargetType.BROWSER;
  }
  browser() {
    return this.#browser;
  }
  browserContext() {
    return this.#browser.defaultBrowserContext();
  }
  opener() {
    throw new UnsupportedOperation();
  }
};
var BidiPageTarget = class extends Target {
  #page;
  constructor(page, logger) {
    super(logger);
    this.#page = page;
  }
  async page() {
    return this.#page;
  }
  async asPage() {
    return await this.page();
  }
  url() {
    return this.#page.url();
  }
  createCDPSession() {
    return this.#page.createCDPSession();
  }
  type() {
    return TargetType.PAGE;
  }
  browser() {
    return this.browserContext().browser();
  }
  browserContext() {
    return this.#page.browserContext();
  }
  opener() {
    throw new UnsupportedOperation();
  }
};
var BidiFrameTarget = class extends Target {
  #frame;
  #page;
  constructor(frame, logger) {
    super(logger);
    this.#frame = frame;
  }
  async page() {
    if (this.#page === void 0) {
      this.#page = BidiPage.from(this.browserContext(), this.#frame.browsingContext, this.logger);
    }
    return this.#page;
  }
  async asPage() {
    return await this.page();
  }
  url() {
    return this.#frame.url();
  }
  createCDPSession() {
    return this.#frame.createCDPSession();
  }
  type() {
    return TargetType.PAGE;
  }
  browser() {
    return this.browserContext().browser();
  }
  browserContext() {
    return this.#frame.page().browserContext();
  }
  opener() {
    throw new UnsupportedOperation();
  }
};
var BidiWorkerTarget = class extends Target {
  #worker;
  constructor(worker, logger) {
    super(logger);
    this.#worker = worker;
  }
  async page() {
    throw new UnsupportedOperation();
  }
  async asPage() {
    throw new UnsupportedOperation();
  }
  url() {
    return this.#worker.url();
  }
  createCDPSession() {
    throw new UnsupportedOperation();
  }
  type() {
    return TargetType.OTHER;
  }
  browser() {
    return this.browserContext().browser();
  }
  browserContext() {
    return this.#worker.frame.page().browserContext();
  }
  opener() {
    throw new UnsupportedOperation();
  }
};

// node_modules/puppeteer-core/lib/puppeteer/bidi/BrowserContext.js
var __esDecorate12 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var __runInitializers12 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __addDisposableResource5 = function(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
};
var __disposeResources5 = /* @__PURE__ */ (function(SuppressedError2) {
  return function(env) {
    function fail(e) {
      env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  };
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var BidiBrowserContext = (() => {
  let _classSuper = BrowserContext;
  let _trustedEmitter_decorators;
  let _trustedEmitter_initializers = [];
  let _trustedEmitter_extraInitializers = [];
  return class BidiBrowserContext2 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      _trustedEmitter_decorators = [bubble()];
      __esDecorate12(this, null, _trustedEmitter_decorators, { kind: "accessor", name: "trustedEmitter", static: false, private: false, access: { has: (obj) => "trustedEmitter" in obj, get: (obj) => obj.trustedEmitter, set: (obj, value) => {
        obj.trustedEmitter = value;
      } }, metadata: _metadata }, _trustedEmitter_initializers, _trustedEmitter_extraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    static from(browser, userContext, options, logger) {
      const context = new BidiBrowserContext2(browser, userContext, options, logger);
      context.#initialize();
      return context;
    }
    #trustedEmitter_accessor_storage = __runInitializers12(this, _trustedEmitter_initializers, new EventEmitter());
    get trustedEmitter() {
      return this.#trustedEmitter_accessor_storage;
    }
    set trustedEmitter(value) {
      this.#trustedEmitter_accessor_storage = value;
    }
    #browser = __runInitializers12(this, _trustedEmitter_extraInitializers);
    #defaultViewport;
    // This is public because of cookies.
    userContext;
    #pages = /* @__PURE__ */ new WeakMap();
    #targets = /* @__PURE__ */ new Map();
    #overrides = [];
    #logger;
    constructor(browser, userContext, options, logger) {
      super(logger);
      this.#browser = browser;
      this.userContext = userContext;
      this.#defaultViewport = options.defaultViewport;
      this.#logger = logger;
    }
    #initialize() {
      for (const browsingContext of this.userContext.browsingContexts) {
        this.#createPage(browsingContext);
      }
      this.userContext.on("browsingcontext", (browsingContext) => {
        const page = this.#createPage(browsingContext);
        if (browsingContext.originalOpener) {
          for (const context of this.userContext.browsingContexts) {
            if (context.id === browsingContext.originalOpener) {
              this.#pages.get(context).trustedEmitter.emit("popup", page);
            }
          }
        }
      });
      this.userContext.on("closed", () => {
        this.trustedEmitter.removeAllListeners();
      });
    }
    #createPage(browsingContext) {
      const page = BidiPage.from(this, browsingContext, this.#logger);
      this.#pages.set(browsingContext, page);
      page.trustedEmitter.on("close", () => {
        this.#pages.delete(browsingContext);
      });
      const pageTarget = new BidiPageTarget(page, this.#logger);
      const pageTargets = /* @__PURE__ */ new Map();
      this.#targets.set(page, [pageTarget, pageTargets]);
      page.trustedEmitter.on("frameattached", (frame) => {
        const bidiFrame = frame;
        const target = new BidiFrameTarget(bidiFrame, this.#logger);
        pageTargets.set(bidiFrame, target);
        this.trustedEmitter.emit("targetcreated", target);
      });
      page.trustedEmitter.on("framenavigated", (frame) => {
        const bidiFrame = frame;
        const target = pageTargets.get(bidiFrame);
        if (target === void 0) {
          this.trustedEmitter.emit("targetchanged", pageTarget);
        } else {
          this.trustedEmitter.emit("targetchanged", target);
        }
      });
      page.trustedEmitter.on("framedetached", (frame) => {
        const bidiFrame = frame;
        const target = pageTargets.get(bidiFrame);
        if (target === void 0) {
          return;
        }
        pageTargets.delete(bidiFrame);
        this.trustedEmitter.emit("targetdestroyed", target);
      });
      page.trustedEmitter.on("workercreated", (worker) => {
        const bidiWorker = worker;
        const target = new BidiWorkerTarget(bidiWorker, this.#logger);
        pageTargets.set(bidiWorker, target);
        this.trustedEmitter.emit("targetcreated", target);
      });
      page.trustedEmitter.on("workerdestroyed", (worker) => {
        const bidiWorker = worker;
        const target = pageTargets.get(bidiWorker);
        if (target === void 0) {
          return;
        }
        pageTargets.delete(worker);
        this.trustedEmitter.emit("targetdestroyed", target);
      });
      page.trustedEmitter.on("close", () => {
        this.#targets.delete(page);
        this.trustedEmitter.emit("targetdestroyed", pageTarget);
      });
      this.trustedEmitter.emit("targetcreated", pageTarget);
      return page;
    }
    targets() {
      return [...this.#targets.values()].flatMap(([target, frames]) => {
        return [target, ...frames.values()];
      });
    }
    /**
     * @internal
     */
    getTargetForPage(page) {
      return this.#targets.get(page)?.[0];
    }
    async newPage(options) {
      const env_1 = { stack: [], error: void 0, hasError: false };
      try {
        const _guard = __addDisposableResource5(env_1, await this.waitForScreenshotOperations(), false);
        const type = options?.type === "window" ? Bidi8.BrowsingContext.CreateType.Window : Bidi8.BrowsingContext.CreateType.Tab;
        const context = await this.userContext.createBrowsingContext(type, {
          background: options?.background
        });
        const page = this.#pages.get(context);
        if (!page) {
          throw new Error("Page is not found");
        }
        if (this.#defaultViewport) {
          try {
            await page.setViewport(this.#defaultViewport);
          } catch (error) {
            this.#logger?.(DEBUG_PREFIXES.error)?.(error);
          }
        }
        if (options?.type === "window" && options?.windowBounds !== void 0) {
          try {
            await this.browser().setWindowBounds(context.windowId, options.windowBounds);
          } catch (error) {
            this.#logger?.(DEBUG_PREFIXES.error)?.(error);
          }
        }
        return page;
      } catch (e_1) {
        env_1.error = e_1;
        env_1.hasError = true;
      } finally {
        __disposeResources5(env_1);
      }
    }
    async close() {
      assert(this.userContext.id !== UserContext.DEFAULT, "Default BrowserContext cannot be closed!");
      try {
        await this.userContext.remove();
      } catch (error) {
        this.#logger?.(DEBUG_PREFIXES.error)?.(error);
      }
      this.#targets.clear();
    }
    browser() {
      return this.#browser;
    }
    async pages(_includeAll = false) {
      return [...this.userContext.browsingContexts].map((context) => {
        return this.#pages.get(context);
      });
    }
    async overridePermissions(origin, permissions) {
      const permissionsSet = new Set(permissions.map((permission) => {
        const protocolPermission = WEB_PERMISSION_TO_PROTOCOL_PERMISSION.get(permission);
        if (!protocolPermission) {
          throw new Error("Unknown permission: " + permission);
        }
        return permission;
      }));
      await Promise.all(Array.from(WEB_PERMISSION_TO_PROTOCOL_PERMISSION.keys()).map((permission) => {
        const result = this.userContext.setPermissions(origin, {
          name: permission
        }, permissionsSet.has(permission) ? Bidi8.Permissions.PermissionState.Granted : Bidi8.Permissions.PermissionState.Denied);
        this.#overrides.push({ origin, permission });
        if (!permissionsSet.has(permission)) {
          return result.catch((error) => {
            this.#logger?.(DEBUG_PREFIXES.error)?.(error);
          });
        }
        return result;
      }));
    }
    async setPermission(origin, ...permissions) {
      if (origin === "*") {
        throw new UnsupportedOperation("Origin (*) is not supported by WebDriver BiDi");
      }
      await Promise.all(permissions.map((permission) => {
        if (permission.permission.allowWithoutSanitization) {
          throw new UnsupportedOperation("allowWithoutSanitization is not supported by WebDriver BiDi");
        }
        if (permission.permission.panTiltZoom) {
          throw new UnsupportedOperation("panTiltZoom is not supported by WebDriver BiDi");
        }
        if (permission.permission.userVisibleOnly) {
          throw new UnsupportedOperation("userVisibleOnly is not supported by WebDriver BiDi");
        }
        return this.userContext.setPermissions(origin, {
          name: permission.permission.name
        }, permission.state);
      }));
    }
    async clearPermissionOverrides() {
      const promises = this.#overrides.map(({ permission, origin }) => {
        return this.userContext.setPermissions(origin, {
          name: permission
        }, Bidi8.Permissions.PermissionState.Prompt).catch((error) => {
          this.#logger?.(DEBUG_PREFIXES.error)?.(error);
        });
      });
      this.#overrides = [];
      await Promise.all(promises);
    }
    get id() {
      if (this.userContext.id === UserContext.DEFAULT) {
        return void 0;
      }
      return this.userContext.id;
    }
    async cookies() {
      const cookies = await this.userContext.getCookies();
      return cookies.map((cookie) => {
        return bidiToPuppeteerCookie(cookie, true);
      });
    }
    async setCookie(...cookies) {
      await Promise.all(cookies.map(async (cookie) => {
        const bidiCookie = {
          domain: cookie.domain,
          name: cookie.name,
          value: {
            type: "string",
            value: cookie.value
          },
          ...cookie.path !== void 0 ? { path: cookie.path } : {},
          ...cookie.httpOnly !== void 0 ? { httpOnly: cookie.httpOnly } : {},
          ...cookie.secure !== void 0 ? { secure: cookie.secure } : {},
          ...cookie.sameSite !== void 0 ? { sameSite: convertCookiesSameSiteCdpToBiDi(cookie.sameSite) } : {},
          ...{ expiry: convertCookiesExpiryCdpToBiDi(cookie.expires) },
          // Chrome-specific properties.
          ...cdpSpecificCookiePropertiesFromPuppeteerToBidi(cookie, "sourceScheme", "priority", "url")
        };
        return await this.userContext.setCookie(bidiCookie, convertCookiesPartitionKeyFromPuppeteerToBiDi(cookie.partitionKey));
      }));
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/core/Browser.js
var __runInitializers13 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate13 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var __addDisposableResource6 = function(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() {
      try {
        inner.call(this);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    env.stack.push({ value, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value;
};
var __disposeResources6 = /* @__PURE__ */ (function(SuppressedError2) {
  return function(env) {
    function fail(e) {
      env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  };
})(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var Browser2 = (() => {
  let _classSuper = EventEmitter;
  let _instanceExtraInitializers = [];
  let _dispose_decorators;
  let _close_decorators;
  let _addPreloadScript_decorators;
  let _removeIntercept_decorators;
  let _removePreloadScript_decorators;
  let _createUserContext_decorators;
  let _installExtension_decorators;
  let _uninstallExtension_decorators;
  let _setClientWindowState_decorators;
  let _getClientWindowInfo_decorators;
  return class Browser3 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      __esDecorate13(this, null, _dispose_decorators, { kind: "method", name: "dispose", static: false, private: false, access: { has: (obj) => "dispose" in obj, get: (obj) => obj.dispose }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate13(this, null, _close_decorators, { kind: "method", name: "close", static: false, private: false, access: { has: (obj) => "close" in obj, get: (obj) => obj.close }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate13(this, null, _addPreloadScript_decorators, { kind: "method", name: "addPreloadScript", static: false, private: false, access: { has: (obj) => "addPreloadScript" in obj, get: (obj) => obj.addPreloadScript }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate13(this, null, _removeIntercept_decorators, { kind: "method", name: "removeIntercept", static: false, private: false, access: { has: (obj) => "removeIntercept" in obj, get: (obj) => obj.removeIntercept }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate13(this, null, _removePreloadScript_decorators, { kind: "method", name: "removePreloadScript", static: false, private: false, access: { has: (obj) => "removePreloadScript" in obj, get: (obj) => obj.removePreloadScript }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate13(this, null, _createUserContext_decorators, { kind: "method", name: "createUserContext", static: false, private: false, access: { has: (obj) => "createUserContext" in obj, get: (obj) => obj.createUserContext }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate13(this, null, _installExtension_decorators, { kind: "method", name: "installExtension", static: false, private: false, access: { has: (obj) => "installExtension" in obj, get: (obj) => obj.installExtension }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate13(this, null, _uninstallExtension_decorators, { kind: "method", name: "uninstallExtension", static: false, private: false, access: { has: (obj) => "uninstallExtension" in obj, get: (obj) => obj.uninstallExtension }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate13(this, null, _setClientWindowState_decorators, { kind: "method", name: "setClientWindowState", static: false, private: false, access: { has: (obj) => "setClientWindowState" in obj, get: (obj) => obj.setClientWindowState }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate13(this, null, _getClientWindowInfo_decorators, { kind: "method", name: "getClientWindowInfo", static: false, private: false, access: { has: (obj) => "getClientWindowInfo" in obj, get: (obj) => obj.getClientWindowInfo }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    static async from(session) {
      const browser = new Browser3(session);
      await browser.#initialize();
      return browser;
    }
    #closed = (__runInitializers13(this, _instanceExtraInitializers), false);
    #reason;
    #disposables = new DisposableStack();
    #userContexts = /* @__PURE__ */ new Map();
    session;
    #sharedWorkers = /* @__PURE__ */ new Map();
    constructor(session) {
      super();
      this.session = session;
    }
    async #initialize() {
      const sessionEmitter = this.#disposables.use(new EventEmitter(this.session));
      sessionEmitter.once("ended", (reason) => {
        this.dispose(reason);
      });
      sessionEmitter.on("script.realmCreated", (info) => {
        if (info.type !== "shared-worker") {
          return;
        }
        this.#sharedWorkers.set(info.realm, SharedWorkerRealm.from(this, info.realm, info.origin));
      });
      await this.#syncUserContexts();
      await this.#syncBrowsingContexts();
    }
    async #syncUserContexts() {
      const { result: { userContexts } } = await this.session.send("browser.getUserContexts", {});
      for (const context of userContexts) {
        this.#createUserContext(context.userContext);
      }
    }
    async #syncBrowsingContexts() {
      const contextIds = /* @__PURE__ */ new Set();
      let contexts;
      {
        const env_1 = { stack: [], error: void 0, hasError: false };
        try {
          const sessionEmitter = __addDisposableResource6(env_1, new EventEmitter(this.session), false);
          sessionEmitter.on("browsingContext.contextCreated", (info) => {
            contextIds.add(info.context);
          });
          const { result } = await this.session.send("browsingContext.getTree", {});
          contexts = result.contexts;
        } catch (e_1) {
          env_1.error = e_1;
          env_1.hasError = true;
        } finally {
          __disposeResources6(env_1);
        }
      }
      for (const info of contexts) {
        if (!contextIds.has(info.context)) {
          this.session.emit("browsingContext.contextCreated", info);
        }
        if (info.children) {
          contexts.push(...info.children);
        }
      }
    }
    #createUserContext(id) {
      const userContext = UserContext.create(this, id);
      this.#userContexts.set(userContext.id, userContext);
      const userContextEmitter = this.#disposables.use(new EventEmitter(userContext));
      userContextEmitter.once("closed", () => {
        userContextEmitter.removeAllListeners();
        this.#userContexts.delete(userContext.id);
      });
      return userContext;
    }
    get closed() {
      return this.#closed;
    }
    get defaultUserContext() {
      return this.#userContexts.get(UserContext.DEFAULT);
    }
    get disconnected() {
      return this.#reason !== void 0;
    }
    get disposed() {
      return this.disconnected;
    }
    get userContexts() {
      return this.#userContexts.values();
    }
    dispose(reason, closed = false) {
      this.#closed = closed;
      this.#reason = reason;
      this[disposeSymbol]();
    }
    async close() {
      try {
        await this.session.send("browser.close", {});
      } finally {
        this.dispose("Browser already closed.", true);
      }
    }
    async addPreloadScript(functionDeclaration, options = {}) {
      const { result: { script } } = await this.session.send("script.addPreloadScript", {
        functionDeclaration,
        ...options,
        contexts: options.contexts?.map((context) => {
          return context.id;
        })
      });
      return script;
    }
    async removeIntercept(intercept) {
      await this.session.send("network.removeIntercept", {
        intercept
      });
    }
    async removePreloadScript(script) {
      await this.session.send("script.removePreloadScript", {
        script
      });
    }
    async createUserContext(options) {
      const proxyConfig = options.proxyServer === void 0 ? void 0 : {
        proxyType: "manual",
        httpProxy: options.proxyServer,
        sslProxy: options.proxyServer,
        noProxy: options.proxyBypassList
      };
      const { result: { userContext } } = await this.session.send("browser.createUserContext", {
        proxy: proxyConfig
      });
      if (options.downloadBehavior?.policy === "allowAndName") {
        throw new UnsupportedOperation("`allowAndName` is not supported in WebDriver BiDi");
      }
      if (options.downloadBehavior?.policy === "allow") {
        if (options.downloadBehavior.downloadPath === void 0) {
          throw new UnsupportedOperation("`downloadPath` is required in `allow` download behavior");
        }
        await this.session.send("browser.setDownloadBehavior", {
          downloadBehavior: {
            type: "allowed",
            destinationFolder: options.downloadBehavior.downloadPath
          },
          userContexts: [userContext]
        });
      }
      if (options.downloadBehavior?.policy === "deny") {
        await this.session.send("browser.setDownloadBehavior", {
          downloadBehavior: { type: "denied" },
          userContexts: [userContext]
        });
      }
      return this.#createUserContext(userContext);
    }
    async installExtension(path) {
      const { result: { extension } } = await this.session.send("webExtension.install", {
        extensionData: { type: "path", path }
      });
      return extension;
    }
    async uninstallExtension(id) {
      await this.session.send("webExtension.uninstall", { extension: id });
    }
    async setClientWindowState(params) {
      await this.session.send("browser.setClientWindowState", params);
    }
    async getClientWindowInfo(windowId) {
      const { result: { clientWindows } } = await this.session.send("browser.getClientWindows", {});
      const window2 = clientWindows.find((window3) => {
        return window3.clientWindow === windowId;
      });
      if (!window2) {
        throw new Error("Window not found");
      }
      return window2;
    }
    [(_dispose_decorators = [inertIfDisposed], _close_decorators = [throwIfDisposed((browser) => {
      return browser.#reason;
    })], _addPreloadScript_decorators = [throwIfDisposed((browser) => {
      return browser.#reason;
    })], _removeIntercept_decorators = [throwIfDisposed((browser) => {
      return browser.#reason;
    })], _removePreloadScript_decorators = [throwIfDisposed((browser) => {
      return browser.#reason;
    })], _createUserContext_decorators = [throwIfDisposed((browser) => {
      return browser.#reason;
    })], _installExtension_decorators = [throwIfDisposed((browser) => {
      return browser.#reason;
    })], _uninstallExtension_decorators = [throwIfDisposed((browser) => {
      return browser.#reason;
    })], _setClientWindowState_decorators = [throwIfDisposed((browser) => {
      return browser.#reason;
    })], _getClientWindowInfo_decorators = [throwIfDisposed((browser) => {
      return browser.#reason;
    })], disposeSymbol)]() {
      this.#reason ??= "Browser was disconnected, probably because the session ended.";
      if (this.closed) {
        this.emit("closed", this.#reason);
      }
      this.emit("disconnected", this.#reason);
      this.#disposables.dispose();
      super[disposeSymbol]();
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/core/Session.js
var __runInitializers14 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __esDecorate14 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var Session3 = (() => {
  let _classSuper = EventEmitter;
  let _instanceExtraInitializers = [];
  let _connection_decorators;
  let _connection_initializers = [];
  let _connection_extraInitializers = [];
  let _dispose_decorators;
  let _send_decorators;
  let _subscribe_decorators;
  let _addIntercepts_decorators;
  let _end_decorators;
  return class Session5 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      __esDecorate14(this, null, _connection_decorators, { kind: "accessor", name: "connection", static: false, private: false, access: { has: (obj) => "connection" in obj, get: (obj) => obj.connection, set: (obj, value) => {
        obj.connection = value;
      } }, metadata: _metadata }, _connection_initializers, _connection_extraInitializers);
      __esDecorate14(this, null, _dispose_decorators, { kind: "method", name: "dispose", static: false, private: false, access: { has: (obj) => "dispose" in obj, get: (obj) => obj.dispose }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate14(this, null, _send_decorators, { kind: "method", name: "send", static: false, private: false, access: { has: (obj) => "send" in obj, get: (obj) => obj.send }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate14(this, null, _subscribe_decorators, { kind: "method", name: "subscribe", static: false, private: false, access: { has: (obj) => "subscribe" in obj, get: (obj) => obj.subscribe }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate14(this, null, _addIntercepts_decorators, { kind: "method", name: "addIntercepts", static: false, private: false, access: { has: (obj) => "addIntercepts" in obj, get: (obj) => obj.addIntercepts }, metadata: _metadata }, null, _instanceExtraInitializers);
      __esDecorate14(this, null, _end_decorators, { kind: "method", name: "end", static: false, private: false, access: { has: (obj) => "end" in obj, get: (obj) => obj.end }, metadata: _metadata }, null, _instanceExtraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    static async from(connection, capabilities) {
      const { result } = await connection.send("session.new", {
        capabilities
      });
      const session = new Session5(connection, result);
      await session.#initialize();
      return session;
    }
    #reason = __runInitializers14(this, _instanceExtraInitializers);
    #disposables = new DisposableStack();
    #info;
    browser;
    #connection_accessor_storage = __runInitializers14(this, _connection_initializers, void 0);
    get connection() {
      return this.#connection_accessor_storage;
    }
    set connection(value) {
      this.#connection_accessor_storage = value;
    }
    constructor(connection, info) {
      super();
      __runInitializers14(this, _connection_extraInitializers);
      this.#info = info;
      this.connection = connection;
    }
    async #initialize() {
      this.browser = await Browser2.from(this);
      const browserEmitter = this.#disposables.use(this.browser);
      browserEmitter.once("closed", (reason) => {
        this.dispose(reason);
      });
      const seen = /* @__PURE__ */ new WeakSet();
      this.on("browsingContext.fragmentNavigated", (info) => {
        if (seen.has(info)) {
          return;
        }
        seen.add(info);
        this.emit("browsingContext.navigationStarted", info);
        this.emit("browsingContext.fragmentNavigated", info);
      });
    }
    get capabilities() {
      return this.#info.capabilities;
    }
    get disposed() {
      return this.ended;
    }
    get ended() {
      return this.#reason !== void 0;
    }
    get id() {
      return this.#info.sessionId;
    }
    dispose(reason) {
      this.#reason = reason;
      this[disposeSymbol]();
    }
    /**
     * Currently, there is a 1:1 relationship between the session and the
     * session. In the future, we might support multiple sessions and in that
     * case we always needs to make sure that the session for the right session
     * object is used, so we implement this method here, although it's not defined
     * in the spec.
     */
    async send(method, params) {
      return await this.connection.send(method, params);
    }
    async subscribe(events, contexts) {
      await this.send("session.subscribe", {
        events,
        contexts
      });
    }
    async addIntercepts(events, contexts) {
      await this.send("session.subscribe", {
        events,
        contexts
      });
    }
    async end() {
      try {
        await this.send("session.end", {});
      } finally {
        this.dispose(`Session already ended.`);
      }
    }
    [(_connection_decorators = [bubble()], _dispose_decorators = [inertIfDisposed], _send_decorators = [throwIfDisposed((session) => {
      return session.#reason;
    })], _subscribe_decorators = [throwIfDisposed((session) => {
      return session.#reason;
    })], _addIntercepts_decorators = [throwIfDisposed((session) => {
      return session.#reason;
    })], _end_decorators = [throwIfDisposed((session) => {
      return session.#reason;
    })], disposeSymbol)]() {
      this.#reason ??= "Session already destroyed, probably because the connection broke.";
      this.emit("ended", this.#reason);
      this.#disposables.dispose();
      super[disposeSymbol]();
    }
  };
})();

// node_modules/puppeteer-core/lib/puppeteer/bidi/Browser.js
var __esDecorate15 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
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
var __runInitializers15 = function(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};
var __setFunctionName2 = function(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var BidiBrowser = (() => {
  let _classSuper = Browser;
  let _private_trustedEmitter_decorators;
  let _private_trustedEmitter_initializers = [];
  let _private_trustedEmitter_extraInitializers = [];
  let _private_trustedEmitter_descriptor;
  return class BidiBrowser2 extends _classSuper {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
      _private_trustedEmitter_decorators = [bubble()];
      __esDecorate15(this, _private_trustedEmitter_descriptor = { get: __setFunctionName2(function() {
        return this.#trustedEmitter_accessor_storage;
      }, "#trustedEmitter", "get"), set: __setFunctionName2(function(value) {
        this.#trustedEmitter_accessor_storage = value;
      }, "#trustedEmitter", "set") }, _private_trustedEmitter_decorators, { kind: "accessor", name: "#trustedEmitter", static: false, private: true, access: { has: (obj) => #trustedEmitter in obj, get: (obj) => obj.#trustedEmitter, set: (obj, value) => {
        obj.#trustedEmitter = value;
      } }, metadata: _metadata }, _private_trustedEmitter_initializers, _private_trustedEmitter_extraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    }
    protocol = "webDriverBiDi";
    static subscribeModules = [
      "browsingContext",
      "network",
      "log",
      "script",
      "input"
    ];
    static subscribeCdpEvents = [
      // Coverage
      "goog:cdp.Debugger.scriptParsed",
      "goog:cdp.CSS.styleSheetAdded",
      "goog:cdp.Runtime.executionContextsCleared",
      // Tracing
      "goog:cdp.Tracing.tracingComplete",
      // TODO: subscribe to all CDP events in the future.
      "goog:cdp.Network.requestWillBeSent",
      "goog:cdp.Debugger.scriptParsed",
      "goog:cdp.Page.screencastFrame"
    ];
    static async create(opts) {
      const session = await Session3.from(opts.connection, {
        firstMatch: opts.capabilities?.firstMatch,
        alwaysMatch: {
          ...opts.capabilities?.alwaysMatch,
          // Capabilities that come from Puppeteer's API take precedence.
          acceptInsecureCerts: opts.acceptInsecureCerts,
          unhandledPromptBehavior: {
            default: Bidi9.Session.UserPromptHandlerType.Ignore
          },
          webSocketUrl: true,
          // Puppeteer with WebDriver BiDi does not support prerendering
          // yet because WebDriver BiDi behavior is not specified. See
          // https://github.com/w3c/webdriver-bidi/issues/321.
          "goog:prerenderingDisabled": true,
          // TODO: remove after Puppeteer rolled Chrome to 142 after Oct 28, 2025.
          "goog:disableNetworkDurableMessages": true
        }
      });
      await session.subscribe((opts.cdpConnection ? [...BidiBrowser2.subscribeModules, ...BidiBrowser2.subscribeCdpEvents] : BidiBrowser2.subscribeModules).filter((module) => {
        if (!opts.networkEnabled) {
          return module !== "network" && module !== "goog:cdp.Network.requestWillBeSent";
        }
        return true;
      }));
      await Promise.all([Bidi9.Network.DataType.Request, Bidi9.Network.DataType.Response].map(
        // Data collectors might be not implemented for specific data type, so create them
        // separately and ignore protocol errors.
        async (dataType) => {
          try {
            await session.send("network.addDataCollector", {
              dataTypes: [dataType],
              // Buffer size of 20 MB is equivalent to the CDP:
              maxEncodedDataSize: 2e7
            });
          } catch (err) {
            if (err instanceof ProtocolError) {
              opts.logger?.(DEBUG_PREFIXES.error)?.(err);
            } else {
              throw err;
            }
          }
        }
      ));
      const browser = new BidiBrowser2(session.browser, opts, opts.logger);
      browser.#initialize();
      return browser;
    }
    #trustedEmitter_accessor_storage = __runInitializers15(this, _private_trustedEmitter_initializers, new EventEmitter());
    get #trustedEmitter() {
      return _private_trustedEmitter_descriptor.get.call(this);
    }
    set #trustedEmitter(value) {
      return _private_trustedEmitter_descriptor.set.call(this, value);
    }
    #process = __runInitializers15(this, _private_trustedEmitter_extraInitializers);
    #closeCallback;
    #browserCore;
    #defaultViewport;
    #browserContexts = /* @__PURE__ */ new WeakMap();
    #target;
    #cdpConnection;
    #networkEnabled;
    #issuesEnabled;
    #logger;
    constructor(browserCore, opts, logger) {
      super(logger);
      this.#process = opts.process;
      this.#closeCallback = opts.closeCallback;
      this.#browserCore = browserCore;
      this.#defaultViewport = opts.defaultViewport;
      this.#cdpConnection = opts.cdpConnection;
      this.#networkEnabled = opts.networkEnabled;
      this.#issuesEnabled = opts.issuesEnabled;
      this.#logger = logger;
      this.#target = new BidiBrowserTarget(this, logger);
    }
    #initialize() {
      for (const userContext of this.#browserCore.userContexts) {
        this.#createBrowserContext(userContext);
      }
      this.#browserCore.once("disconnected", () => {
        this.#trustedEmitter.emit("disconnected", void 0);
        this.#trustedEmitter.removeAllListeners();
      });
      this.#process?.once("close", () => {
        this.#browserCore.dispose("Browser process exited.", true);
        this.connection.dispose();
      });
    }
    get #browserName() {
      return this.#browserCore.session.capabilities.browserName;
    }
    get #browserVersion() {
      return this.#browserCore.session.capabilities.browserVersion;
    }
    get cdpSupported() {
      return this.#cdpConnection !== void 0;
    }
    get cdpConnection() {
      return this.#cdpConnection;
    }
    async userAgent() {
      return this.#browserCore.session.capabilities.userAgent;
    }
    #createBrowserContext(userContext) {
      const browserContext = BidiBrowserContext.from(this, userContext, {
        defaultViewport: this.#defaultViewport
      }, this.#logger);
      this.#browserContexts.set(userContext, browserContext);
      browserContext.trustedEmitter.on("targetcreated", (target) => {
        this.#trustedEmitter.emit("targetcreated", target);
      });
      browserContext.trustedEmitter.on("targetchanged", (target) => {
        this.#trustedEmitter.emit("targetchanged", target);
      });
      browserContext.trustedEmitter.on("targetdestroyed", (target) => {
        this.#trustedEmitter.emit("targetdestroyed", target);
      });
      return browserContext;
    }
    get connection() {
      return this.#browserCore.session.connection;
    }
    wsEndpoint() {
      return this.connection.url;
    }
    async close() {
      if (this.connection.closed) {
        return;
      }
      try {
        await this.#browserCore.close();
      } catch (error) {
        this.#logger?.(DEBUG_PREFIXES.error)?.(error);
      }
      try {
        await this.#closeCallback?.call(null);
      } catch (error) {
        this.#logger?.(DEBUG_PREFIXES.error)?.(error);
      } finally {
        this.connection.dispose();
      }
    }
    get connected() {
      return !this.#browserCore.disconnected;
    }
    process() {
      return this.#process ?? null;
    }
    async createBrowserContext(options = {}) {
      const userContext = await this.#browserCore.createUserContext(options);
      return this.#createBrowserContext(userContext);
    }
    async version() {
      return `${this.#browserName}/${this.#browserVersion}`;
    }
    browserContexts() {
      return [...this.#browserCore.userContexts].map((context) => {
        return this.#browserContexts.get(context);
      });
    }
    defaultBrowserContext() {
      return this.#browserContexts.get(this.#browserCore.defaultUserContext);
    }
    newPage(options) {
      return this.defaultBrowserContext().newPage(options);
    }
    installExtension(path) {
      return this.#browserCore.installExtension(path);
    }
    async uninstallExtension(id) {
      await this.#browserCore.uninstallExtension(id);
    }
    installPWA() {
      throw new UnsupportedOperation();
    }
    uninstallPWA() {
      throw new UnsupportedOperation();
    }
    launchPWA() {
      throw new UnsupportedOperation();
    }
    getPWAState() {
      throw new UnsupportedOperation();
    }
    screens() {
      throw new UnsupportedOperation();
    }
    addScreen(_params) {
      throw new UnsupportedOperation();
    }
    removeScreen(_screenId) {
      throw new UnsupportedOperation();
    }
    async getWindowBounds(windowId) {
      const clientWindowInfo = await this.#browserCore.getClientWindowInfo(windowId);
      return {
        left: clientWindowInfo.x,
        top: clientWindowInfo.y,
        width: clientWindowInfo.width,
        height: clientWindowInfo.height,
        windowState: clientWindowInfo.state
      };
    }
    async setWindowBounds(windowId, windowBounds) {
      let params;
      const windowState = windowBounds.windowState ?? "normal";
      if (windowState === "normal") {
        params = {
          clientWindow: windowId,
          state: "normal",
          x: windowBounds.left,
          y: windowBounds.top,
          width: windowBounds.width,
          height: windowBounds.height
        };
      } else {
        params = {
          clientWindow: windowId,
          state: windowState
        };
      }
      await this.#browserCore.setClientWindowState(params);
    }
    targets() {
      return [
        this.#target,
        ...this.browserContexts().flatMap((context) => {
          return context.targets();
        })
      ];
    }
    target() {
      return this.#target;
    }
    async disconnect() {
      try {
        await this.#browserCore.session.end();
      } catch (error) {
        this.#logger?.(DEBUG_PREFIXES.error)?.(error);
      } finally {
        this.connection.dispose();
      }
    }
    get debugInfo() {
      return {
        pendingProtocolErrors: this.connection.getPendingProtocolErrors()
      };
    }
    isNetworkEnabled() {
      return this.#networkEnabled;
    }
    extensions() {
      throw new UnsupportedOperation();
    }
    isIssuesEnabled() {
      return this.#issuesEnabled;
    }
  };
})();
export {
  BidiBrowser,
  BidiBrowserContext,
  BidiConnection,
  BidiElementHandle,
  BidiFrame,
  BidiFrameRealm,
  BidiHTTPRequest,
  BidiHTTPResponse,
  BidiJSHandle,
  BidiKeyboard,
  BidiMouse,
  BidiPage,
  BidiRealm,
  BidiScreenRecording,
  BidiTouchscreen,
  BidiWorkerRealm,
  bidiToPuppeteerCookie,
  cdpSpecificCookiePropertiesFromPuppeteerToBidi,
  connectBidiOverCdp,
  convertCookiesExpiryCdpToBiDi,
  convertCookiesPartitionKeyFromPuppeteerToBiDi,
  convertCookiesSameSiteCdpToBiDi,
  requests
};
/*! Bundled license information:

webdriver-bidi-protocol/out/index.js:
puppeteer-core/lib/puppeteer/bidi/core/Navigation.js:
puppeteer-core/lib/puppeteer/bidi/core/Realm.js:
puppeteer-core/lib/puppeteer/bidi/core/Request.js:
puppeteer-core/lib/puppeteer/bidi/core/UserPrompt.js:
puppeteer-core/lib/puppeteer/bidi/core/BrowsingContext.js:
puppeteer-core/lib/puppeteer/bidi/core/UserContext.js:
puppeteer-core/lib/puppeteer/bidi/Realm.js:
puppeteer-core/lib/puppeteer/bidi/WebWorker.js:
puppeteer-core/lib/puppeteer/bidi/core/Browser.js:
puppeteer-core/lib/puppeteer/bidi/core/Session.js:
  (**
   * @license
   * Copyright 2024 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/puppeteer/bidi/Connection.js:
puppeteer-core/lib/puppeteer/bidi/Dialog.js:
puppeteer-core/lib/puppeteer/bidi/Input.js:
  (**
   * @license
   * Copyright 2017 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/puppeteer/bidi/BidiOverCdp.js:
puppeteer-core/lib/puppeteer/bidi/Deserializer.js:
puppeteer-core/lib/puppeteer/bidi/JSHandle.js:
puppeteer-core/lib/puppeteer/bidi/ElementHandle.js:
puppeteer-core/lib/puppeteer/bidi/ExposedFunction.js:
puppeteer-core/lib/puppeteer/bidi/Serializer.js:
puppeteer-core/lib/puppeteer/bidi/util.js:
puppeteer-core/lib/puppeteer/bidi/Frame.js:
puppeteer-core/lib/puppeteer/bidi/Target.js:
  (**
   * @license
   * Copyright 2023 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/puppeteer/bidi/BluetoothEmulation.js:
puppeteer-core/lib/puppeteer/bidi/DeviceRequestPrompt.js:
  (**
   * @license
   * Copyright 2025 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/puppeteer/bidi/ScreenRecording.js:
  (**
   * @license
   * Copyright 2026 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)

puppeteer-core/lib/puppeteer/bidi/Page.js:
puppeteer-core/lib/puppeteer/bidi/BrowserContext.js:
puppeteer-core/lib/puppeteer/bidi/Browser.js:
puppeteer-core/lib/puppeteer/bidi/bidi.js:
  (**
   * @license
   * Copyright 2022 Google Inc.
   * SPDX-License-Identifier: Apache-2.0
   *)
*/
