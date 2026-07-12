// Name: Extended Notification
// ID: kubohiroyaextendednotification
// Description: Wait for custom notifications or key presses with optional timeouts.
// By: Hiroya Kubo
// License: MPL-2.0

(function (Scratch) {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  const extensionConfig = {
    id: "kubohiroyaextendednotification",
    name: "Extended Notification"
  };
  const extensionName = "Extended Notification";
  const blocks = [{ "opcode": "sendNotification", "blockType": "COMMAND", "text": "send extended notification [MESSAGE]", "description": "Sends a named notification to every script currently waiting for that name.", "arguments": { "MESSAGE": { "type": "STRING", "defaultValue": "next" } } }, { "opcode": "waitForNotification", "blockType": "COMMAND", "text": "wait until extended notification [MESSAGE] is received", "description": "Pauses the current script until the named notification is received.", "arguments": { "MESSAGE": { "type": "STRING", "defaultValue": "next" } } }, { "opcode": "waitForNotificationOrTimeout", "blockType": "BOOLEAN", "text": "extended notification [MESSAGE] received before [SECONDS] seconds", "description": "Returns true when the named notification arrives before the timeout, otherwise false.", "disableMonitor": true, "arguments": { "MESSAGE": { "type": "STRING", "defaultValue": "next" }, "SECONDS": { "type": "NUMBER", "defaultValue": 5 } } }, { "opcode": "waitForKey", "blockType": "COMMAND", "text": "wait until [KEY] key is pressed", "description": "Pauses the current script until the selected key is pressed.", "section": "keyboard", "arguments": { "KEY": { "type": "STRING", "defaultValue": "space", "menu": "keyMenu" } } }, { "opcode": "waitForKeyOrTimeout", "blockType": "BOOLEAN", "text": "[KEY] key pressed before [SECONDS] seconds", "description": "Returns true when the selected key is pressed before the timeout, otherwise false.", "disableMonitor": true, "arguments": { "KEY": { "type": "STRING", "defaultValue": "space", "menu": "keyMenu" }, "SECONDS": { "type": "NUMBER", "defaultValue": 5 } } }];
  const definitions = {
    extensionName,
    blocks
  };
  const translate = (text) => Scratch.translate(text);
  const createKeyMenuItems = () => [
    { text: translate("space"), value: "space" },
    { text: translate("up arrow"), value: "arrowup" },
    { text: translate("down arrow"), value: "arrowdown" },
    { text: translate("right arrow"), value: "arrowright" },
    { text: translate("left arrow"), value: "arrowleft" },
    { text: translate("enter"), value: "enter" },
    { text: translate("escape"), value: "escape" },
    ..."abcdefghijklmnopqrstuvwxyz".split("").map((value) => ({ text: value, value })),
    ..."0123456789".split("").map((value) => ({ text: value, value }))
  ];
  const blockDefinitions = definitions.blocks;
  const KEY_ALIASES = {
    space: "space",
    spacebar: "space",
    " ": "space",
    arrowup: "arrowup",
    "up arrow": "arrowup",
    arrowdown: "arrowdown",
    "down arrow": "arrowdown",
    arrowright: "arrowright",
    "right arrow": "arrowright",
    arrowleft: "arrowleft",
    "left arrow": "arrowleft",
    enter: "enter",
    return: "enter",
    escape: "escape",
    esc: "escape",
    スペース: "space",
    上向き矢印: "arrowup",
    上矢印: "arrowup",
    下向き矢印: "arrowdown",
    下矢印: "arrowdown",
    右向き矢印: "arrowright",
    右矢印: "arrowright",
    左向き矢印: "arrowleft",
    左矢印: "arrowleft",
    エンター: "enter",
    エスケープ: "escape"
  };
  class ExtendedNotification {
    constructor() {
      __publicField(this, "notificationWaiters", /* @__PURE__ */ new Map());
      __publicField(this, "keyWaiters", /* @__PURE__ */ new Map());
      __publicField(this, "onKeyDown", (event) => {
        if (event.repeat) return;
        for (const key of this.eventKeys(event)) this.resolveWaiters(this.keyWaiters, key, true);
      });
      document.addEventListener("keydown", this.onKeyDown, true);
      Scratch.vm?.runtime?.on("PROJECT_STOP_ALL", () => this.cancelAllWaiters());
    }
    getInfo() {
      const blocks2 = [];
      let section;
      for (const block of blockDefinitions) {
        if (block.section && block.section !== section) blocks2.push("---");
        blocks2.push(this.toScratchBlock(block));
        if (block.section) section = block.section;
      }
      return {
        id: extensionConfig.id,
        name: translate(definitions.extensionName),
        color1: "#5B67A5",
        color2: "#4C5794",
        color3: "#3F487E",
        blocks: blocks2,
        menus: { keyMenu: { acceptReporters: true, items: createKeyMenuItems() } }
      };
    }
    sendNotification(args) {
      this.resolveWaiters(this.notificationWaiters, this.normalizeName(args.MESSAGE), true);
    }
    waitForNotification(args) {
      return this.wait(this.notificationWaiters, this.normalizeName(args.MESSAGE), null).then(() => void 0);
    }
    waitForNotificationOrTimeout(args) {
      return this.wait(this.notificationWaiters, this.normalizeName(args.MESSAGE), this.timeout(args.SECONDS));
    }
    waitForKey(args) {
      return this.wait(this.keyWaiters, this.normalizeKey(args.KEY), null).then(() => void 0);
    }
    waitForKeyOrTimeout(args) {
      return this.wait(this.keyWaiters, this.normalizeKey(args.KEY), this.timeout(args.SECONDS));
    }
    toScratchBlock(block) {
      return {
        opcode: block.opcode,
        blockType: Scratch.BlockType[block.blockType],
        text: translate(block.text),
        ...block.disableMonitor ? { disableMonitor: true } : {},
        arguments: Object.fromEntries(
          Object.entries(block.arguments).map(([name, argument]) => [
            name,
            {
              type: Scratch.ArgumentType[argument.type],
              defaultValue: argument.defaultValue,
              ...argument.menu ? { menu: argument.menu } : {}
            }
          ])
        )
      };
    }
    wait(registry, name, timeout) {
      return new Promise((resolve) => {
        let done = false;
        let timer = null;
        const finish = (result) => {
          if (done) return;
          done = true;
          if (timer !== null) clearTimeout(timer);
          const waiters2 = registry.get(name);
          waiters2?.delete(finish);
          if (waiters2?.size === 0) registry.delete(name);
          resolve(result);
        };
        const waiters = registry.get(name) ?? /* @__PURE__ */ new Set();
        registry.set(name, waiters);
        waiters.add(finish);
        if (timeout !== null) timer = setTimeout(() => finish(false), timeout);
      });
    }
    resolveWaiters(registry, name, result) {
      for (const finish of [...registry.get(name) ?? []]) finish(result);
    }
    cancelAllWaiters() {
      for (const registry of [this.notificationWaiters, this.keyWaiters]) {
        for (const waiters of registry.values()) for (const finish of [...waiters]) finish(false);
        registry.clear();
      }
    }
    normalizeName(value) {
      return Scratch.Cast.toString(value);
    }
    timeout(value) {
      const seconds = Scratch.Cast.toNumber(value);
      return Number.isFinite(seconds) && seconds > 0 ? seconds * 1e3 : 0;
    }
    normalizeKey(value) {
      const raw = Scratch.Cast.toString(value).trim();
      return KEY_ALIASES[raw] ?? KEY_ALIASES[raw.toLowerCase()] ?? raw.toLowerCase();
    }
    eventKeys(event) {
      const result = /* @__PURE__ */ new Set();
      const key = event.key.toLowerCase();
      const code = event.code.toLowerCase();
      result.add(KEY_ALIASES[key] ?? key);
      if (code === "space") result.add("space");
      else if (code.startsWith("key") && code.length === 4) result.add(code.slice(3));
      else if (code.startsWith("digit") && code.length === 6) result.add(code.slice(5));
      else if (["arrowup", "arrowdown", "arrowright", "arrowleft", "enter", "escape"].includes(code)) result.add(code);
      return result;
    }
  }
  if (!Scratch.extensions.unsandboxed) {
    throw new Error(`${extensionConfig.name} must run unsandboxed.`);
  }
  Scratch.extensions.register(new ExtendedNotification());

})(Scratch);
