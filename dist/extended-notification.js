// Name: Extended Notification
// ID: kubohiroyaextendednotification
// Description: Wait for custom notifications or key presses with optional timeouts.
// By: Hiroya Kubo
// License: MPL-2.0

(function (Scratch) {
  'use strict';

  //#region src/config.ts
  var extensionConfig = {
  	id: "kubohiroyaextendednotification",
  	slug: "extended-notification",
  	name: "Extended Notification",
  	description: "Wait for custom notifications or key presses with optional timeouts.",
  	author: "Hiroya Kubo",
  	license: "MPL-2.0",
  	unsandboxed: true,
  	blockIconURI: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZD0iTTIyIDhhOSA5IDAgMCAxIDkgOXY4bDMgNEgxMGwzLTR2LThhOSA5IDAgMCAxIDktOXoiIGZpbGw9IiNFNjUzM0MiLz48cGF0aCBkPSJNMTggMzJhNCA0IDAgMCAwIDggMHoiIGZpbGw9IiNFNjUzM0MiLz48Y2lyY2xlIGN4PSIzNiIgY3k9IjMzIiByPSI5IiBmaWxsPSIjRkZBQjE5Ii8+PHBhdGggZD0iTTM2IDI4djVsMy41IDIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyLjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=="
  };
  var block_editor_fixed_inputs_schema_default = {
  	$schema: "http://json-schema.org/draft-07/schema#",
  	$id: "https://kubohiroya.github.io/turbowarp-extended-notification/schemas/block-editor-fixed-inputs.schema.json",
  	title: "turbowarp-extended-notification fixed editing contracts",
  	$defs: {
  		"waitForNotificationOrTimeout": {
  			"type": "object",
  			"properties": { "SECONDS": { "type": "number" } },
  			"additionalProperties": false
  		},
  		"waitForKeyOrTimeout": {
  			"type": "object",
  			"properties": { "SECONDS": { "type": "number" } },
  			"additionalProperties": false
  		}
  	}
  };
  //#endregion
  //#region src/fixed-input-editors.ts
  var contracts = block_editor_fixed_inputs_schema_default.$defs;
  var repository = "turbowarp-extended-notification";
  var extensionId = "kubohiroyaextendednotification";
  var token = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?$/u;
  function readNumber(value) {
  	if (typeof value !== "string" && typeof value !== "number") throw new TypeError("Invalid numeric projection.");
  	if (typeof value === "string" && value.trim() === "") throw new TypeError("Existing blank field is readonly.");
  	const number = Number(value);
  	if (!Number.isFinite(number)) throw new TypeError("Existing nonfinite field is readonly.");
  	return number;
  }
  function newNumberToken(value) {
  	if (typeof value === "number") {
  		if (!Number.isFinite(value)) throw new TypeError("Invalid new number.");
  		return Object.is(value, -0) ? "-0" : String(value);
  	}
  	if (typeof value !== "string" || !token.test(value.trim()) || !Number.isFinite(Number(value))) throw new TypeError("Invalid new number.");
  	return value.trim();
  }
  function existingChoice(_opcode, value) {
  	if (typeof value !== "string") throw new TypeError("Invalid string projection.");
  	return value;
  }
  function candidateValid(_opcode, _argument, schema, value) {
  	if (schema.type === "number" || schema.type === "integer") {
  		let number;
  		try {
  			number = readNumber(value);
  		} catch {
  			return false;
  		}
  		if (schema.type === "integer" && !Number.isInteger(number)) return false;
  		if (schema.minimum !== void 0 && number < schema.minimum) return false;
  		if (schema.maximum !== void 0 && number > schema.maximum) return false;
  		if (schema.exclusiveMinimum !== void 0 && number <= schema.exclusiveMinimum) return false;
  		if (schema.enum && !schema.enum.includes(number)) return false;
  		return true;
  	}
  	return typeof value === "string" && schema.enum.includes(value);
  }
  function fixedInputEditorOptions() {
  	return Object.entries(contracts).map(([opcode, contract]) => ({
  		apiVersion: 1,
  		extensionId,
  		editorId: `${extensionId}.fixed.${opcode}`,
  		opcodes: [`${extensionId}_${opcode}`],
  		contractId: `${repository}.${opcode}.fixed`,
  		contractRevision: "fixed-inputs-v1",
  		validationContext: () => ({
  			consumerId: repository,
  			nowMs: 0,
  			settings: null
  		}),
  		bindings: Object.entries(contract.properties).map(([argument, schema]) => {
  			const numeric = schema.type === "number" || schema.type === "integer";
  			const source = {
  				repository,
  				path: "schemas/block-editor-fixed-inputs.schema.json",
  				symbol: `/$defs/${opcode}/properties/${argument}`
  			};
  			return {
  				argument,
  				schemaBundle: {
  					identity: {
  						ownerId: repository,
  						contractId: `${opcode}.${argument}`,
  						revision: "fixed-inputs-v1",
  						variantId: "fixed"
  					},
  					dialect: "draft-07",
  					root: {
  						retrievalUri: `${block_editor_fixed_inputs_schema_default.$id}?binding=${opcode}.${argument}`,
  						document: schema,
  						artifact: {
  							role: "canonical-schema",
  							source
  						}
  					},
  					resources: [],
  					provenance: {
  						canonicalSources: [
  							source,
  							{
  								repository,
  								path: "src/block-definitions.json"
  							},
  							{
  								repository,
  								path: "src/extension.ts",
  								symbol: opcode
  							}
  						],
  						generatedFiles: [],
  						referenceSchemas: [],
  						generationSources: []
  					}
  				},
  				control: numeric ? { kind: "number" } : {
  					kind: "enum",
  					choices: schema.enum.map((value) => ({
  						value,
  						label: String(value)
  					}))
  				},
  				read: (value) => numeric ? readNumber(value) : existingChoice(opcode, value),
  				encode: (value) => {
  					if (numeric) return newNumberToken(value);
  					if (typeof value !== "string" || !schema.enum.includes(value)) throw new TypeError("Invalid new enum value.");
  					return value;
  				},
  				validateCandidate: (value) => candidateValid(opcode, argument, schema, value) ? [] : [{
  					path: argument,
  					message: "Check this value before saving."
  				}]
  			};
  		})
  	}));
  }
  /** Register only visible static contracts; ordinary composition consumers load no editor runtime. */
  function registerFixedInputEditors(scratch, runtime, visibleBlocks) {
  	const api = scratch.gui?.blockEditors;
  	if (api?.apiVersion !== 1 || typeof api.registerFixedInputEditor !== "function") return void 0;
  	const visibleOpcodes = new Set(visibleBlocks.flatMap((block) => {
  		if (typeof block !== "object" || block === null || !("opcode" in block)) return [];
  		return typeof block.opcode === "string" ? [block.opcode] : [];
  	}));
  	const events = runtime;
  	const removers = [];
  	let active = true;
  	const dispose = () => {
  		if (!active) return;
  		active = false;
  		events?.off?.("RUNTIME_DISPOSED", dispose);
  		for (const remove of removers.splice(0).reverse()) remove();
  	};
  	try {
  		for (const options of fixedInputEditorOptions()) if (options.opcodes.some((opcode) => visibleOpcodes.has(opcode.slice(31)))) removers.push(api.registerFixedInputEditor.call(api, options));
  		events?.on?.("RUNTIME_DISPOSED", dispose);
  	} catch (error) {
  		dispose();
  		throw error;
  	}
  	return dispose;
  }
  var block_definitions_default = {
  	extensionName: "Extended Notification",
  	blocks: [
  		{
  			"opcode": "sendNotification",
  			"blockType": "COMMAND",
  			"text": "send extended notification [MESSAGE]",
  			"description": "Sends a named notification to every script currently waiting for that name.",
  			"arguments": { "MESSAGE": {
  				"type": "STRING",
  				"defaultValue": "next"
  			} }
  		},
  		{
  			"opcode": "waitForNotification",
  			"blockType": "COMMAND",
  			"text": "wait until extended notification [MESSAGE] is received",
  			"description": "Pauses the current script until the named notification is received.",
  			"arguments": { "MESSAGE": {
  				"type": "STRING",
  				"defaultValue": "next"
  			} }
  		},
  		{
  			"opcode": "waitForNotificationOrTimeout",
  			"blockType": "BOOLEAN",
  			"text": "extended notification [MESSAGE] received before [SECONDS] seconds",
  			"description": "Returns true when the named notification arrives before the timeout, otherwise false.",
  			"disableMonitor": true,
  			"arguments": {
  				"MESSAGE": {
  					"type": "STRING",
  					"defaultValue": "next"
  				},
  				"SECONDS": {
  					"type": "NUMBER",
  					"defaultValue": 5
  				}
  			}
  		},
  		{
  			"opcode": "waitForKey",
  			"blockType": "COMMAND",
  			"text": "wait until [KEY] key is pressed",
  			"description": "Pauses the current script until the selected key is pressed.",
  			"section": "keyboard",
  			"arguments": { "KEY": {
  				"type": "STRING",
  				"defaultValue": "space",
  				"menu": "keyMenu"
  			} }
  		},
  		{
  			"opcode": "waitForKeyOrTimeout",
  			"blockType": "BOOLEAN",
  			"text": "[KEY] key pressed before [SECONDS] seconds",
  			"description": "Returns true when the selected key is pressed before the timeout, otherwise false.",
  			"disableMonitor": true,
  			"arguments": {
  				"KEY": {
  					"type": "STRING",
  					"defaultValue": "space",
  					"menu": "keyMenu"
  				},
  				"SECONDS": {
  					"type": "NUMBER",
  					"defaultValue": 5
  				}
  			}
  		}
  	]
  };
  //#endregion
  //#region src/i18n.ts
  var translate = (text) => Scratch.translate(text);
  var createKeyMenuItems = () => [
  	{
  		text: translate("space"),
  		value: "space"
  	},
  	{
  		text: translate("up arrow"),
  		value: "arrowup"
  	},
  	{
  		text: translate("down arrow"),
  		value: "arrowdown"
  	},
  	{
  		text: translate("right arrow"),
  		value: "arrowright"
  	},
  	{
  		text: translate("left arrow"),
  		value: "arrowleft"
  	},
  	{
  		text: translate("enter"),
  		value: "enter"
  	},
  	{
  		text: translate("escape"),
  		value: "escape"
  	},
  	..."abcdefghijklmnopqrstuvwxyz".split("").map((value) => ({
  		text: value,
  		value
  	})),
  	..."0123456789".split("").map((value) => ({
  		text: value,
  		value
  	}))
  ];
  //#endregion
  //#region \0@oxc-project+runtime@0.148.0/helpers/esm/typeof.js
  function _typeof(o) {
  	"@babel/helpers - typeof";
  	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
  		return typeof o;
  	} : function(o) {
  		return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  	}, _typeof(o);
  }
  //#endregion
  //#region \0@oxc-project+runtime@0.148.0/helpers/esm/toPrimitive.js
  function toPrimitive(t, r) {
  	if ("object" != _typeof(t) || !t) return t;
  	var e = t[Symbol.toPrimitive];
  	if (void 0 !== e) {
  		var i = e.call(t, r || "default");
  		if ("object" != _typeof(i)) return i;
  		throw new TypeError("@@toPrimitive must return a primitive value.");
  	}
  	return ("string" === r ? String : Number)(t);
  }
  //#endregion
  //#region \0@oxc-project+runtime@0.148.0/helpers/esm/toPropertyKey.js
  function toPropertyKey(t) {
  	var i = toPrimitive(t, "string");
  	return "symbol" == _typeof(i) ? i : i + "";
  }
  //#endregion
  //#region \0@oxc-project+runtime@0.148.0/helpers/esm/defineProperty.js
  function _defineProperty(e, r, t) {
  	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
  		value: t,
  		enumerable: !0,
  		configurable: !0,
  		writable: !0
  	}) : e[r] = t, e;
  }
  //#endregion
  //#region src/extension.ts
  var blockDefinitions = block_definitions_default.blocks;
  var KEY_ALIASES = {
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
  var ExtendedNotification = class {
  	constructor() {
  		_defineProperty(this, "fixedEditorsDispose", void 0);
  		_defineProperty(this, "notificationWaiters", /* @__PURE__ */ new Map());
  		_defineProperty(this, "keyWaiters", /* @__PURE__ */ new Map());
  		_defineProperty(this, "onKeyDown", (event) => {
  			if (event.repeat) return;
  			for (const key of this.eventKeys(event)) this.resolveWaiters(this.keyWaiters, key, true);
  		});
  		document.addEventListener("keydown", this.onKeyDown, true);
  		Scratch.vm?.runtime?.on("PROJECT_STOP_ALL", () => this.cancelAllWaiters());
  	}
  	getInfo() {
  		const blocks = [];
  		let section;
  		for (const block of blockDefinitions) {
  			if (block.section && block.section !== section) blocks.push("---");
  			blocks.push(this.toScratchBlock(block));
  			if (block.section) section = block.section;
  		}
  		const info = {
  			id: extensionConfig.id,
  			docsURI: "https://kubohiroya.github.io/turbowarp-extended-notification/",
  			blockIconURI: extensionConfig.blockIconURI,
  			name: translate(block_definitions_default.extensionName),
  			color1: "#5B67A5",
  			color2: "#4C5794",
  			color3: "#3F487E",
  			blocks,
  			menus: { keyMenu: {
  				acceptReporters: true,
  				items: createKeyMenuItems()
  			} }
  		};
  		this.fixedEditorsDispose ?? (this.fixedEditorsDispose = registerFixedInputEditors(Scratch, Scratch.vm?.runtime, info.blocks));
  		return info;
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
  			arguments: Object.fromEntries(Object.entries(block.arguments).map(([name, argument]) => [name, {
  				type: Scratch.ArgumentType[argument.type],
  				defaultValue: argument.defaultValue,
  				...argument.menu ? { menu: argument.menu } : {}
  			}]))
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
  				const waiters = registry.get(name);
  				waiters?.delete(finish);
  				if (waiters?.size === 0) registry.delete(name);
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
  		else if ([
  			"arrowup",
  			"arrowdown",
  			"arrowright",
  			"arrowleft",
  			"enter",
  			"escape"
  		].includes(code)) result.add(code);
  		return result;
  	}
  };
  //#endregion
  //#region src/index.ts
  if (extensionConfig.unsandboxed && !Scratch.extensions.unsandboxed) throw new Error(`${extensionConfig.name} must run unsandboxed.`);
  Scratch.extensions.register(new ExtendedNotification());
  //#endregion

})(Scratch);
