import {extensionConfig} from './config.js';
import {createKeyMenuItems, translate} from './i18n.js';

type Waiter = (result: boolean) => void;
type WaiterRegistry = Map<string, Set<Waiter>>;
type BlockArguments = {MESSAGE?: unknown; KEY?: unknown; SECONDS?: unknown};

const KEY_ALIASES: Record<string, string> = {
  space: 'space', spacebar: 'space', ' ': 'space',
  arrowup: 'arrowup', 'up arrow': 'arrowup',
  arrowdown: 'arrowdown', 'down arrow': 'arrowdown',
  arrowright: 'arrowright', 'right arrow': 'arrowright',
  arrowleft: 'arrowleft', 'left arrow': 'arrowleft',
  enter: 'enter', return: 'enter', escape: 'escape', esc: 'escape',
  スペース: 'space', 上向き矢印: 'arrowup', 上矢印: 'arrowup',
  下向き矢印: 'arrowdown', 下矢印: 'arrowdown',
  右向き矢印: 'arrowright', 右矢印: 'arrowright',
  左向き矢印: 'arrowleft', 左矢印: 'arrowleft',
  エンター: 'enter', エスケープ: 'escape'
};

export class ExtendedNotification implements TurboWarpExtension {
  private readonly notificationWaiters: WaiterRegistry = new Map();
  private readonly keyWaiters: WaiterRegistry = new Map();

  public constructor() {
    document.addEventListener('keydown', this.onKeyDown, true);
    Scratch.vm?.runtime?.on('PROJECT_STOP_ALL', () => this.cancelAllWaiters());
  }

  public getInfo(): Record<string, unknown> {
    return {
      id: extensionConfig.id,
      name: translate('Extended Notification'),
      color1: '#5B67A5', color2: '#4C5794', color3: '#3F487E',
      blocks: [
        {
          opcode: 'sendNotification', blockType: Scratch.BlockType.COMMAND,
          text: translate('send extended notification [MESSAGE]'),
          arguments: {MESSAGE: {type: Scratch.ArgumentType.STRING, defaultValue: 'next'}}
        },
        {
          opcode: 'waitForNotification', blockType: Scratch.BlockType.COMMAND,
          text: translate('wait until extended notification [MESSAGE] is received'),
          arguments: {MESSAGE: {type: Scratch.ArgumentType.STRING, defaultValue: 'next'}}
        },
        {
          opcode: 'waitForNotificationOrTimeout', blockType: Scratch.BlockType.BOOLEAN,
          text: translate('extended notification [MESSAGE] received before [SECONDS] seconds'),
          disableMonitor: true,
          arguments: {
            MESSAGE: {type: Scratch.ArgumentType.STRING, defaultValue: 'next'},
            SECONDS: {type: Scratch.ArgumentType.NUMBER, defaultValue: 5}
          }
        },
        '---',
        {
          opcode: 'waitForKey', blockType: Scratch.BlockType.COMMAND,
          text: translate('wait until [KEY] key is pressed'),
          arguments: {KEY: {type: Scratch.ArgumentType.STRING, menu: 'keyMenu', defaultValue: 'space'}}
        },
        {
          opcode: 'waitForKeyOrTimeout', blockType: Scratch.BlockType.BOOLEAN,
          text: translate('[KEY] key pressed before [SECONDS] seconds'),
          disableMonitor: true,
          arguments: {
            KEY: {type: Scratch.ArgumentType.STRING, menu: 'keyMenu', defaultValue: 'space'},
            SECONDS: {type: Scratch.ArgumentType.NUMBER, defaultValue: 5}
          }
        }
      ],
      menus: {keyMenu: {acceptReporters: true, items: createKeyMenuItems()}}
    };
  }

  public sendNotification(args: BlockArguments): void {
    this.resolveWaiters(this.notificationWaiters, this.normalizeName(args.MESSAGE), true);
  }

  public waitForNotification(args: BlockArguments): Promise<void> {
    return this.wait(this.notificationWaiters, this.normalizeName(args.MESSAGE), null).then(() => undefined);
  }

  public waitForNotificationOrTimeout(args: BlockArguments): Promise<boolean> {
    return this.wait(this.notificationWaiters, this.normalizeName(args.MESSAGE), this.timeout(args.SECONDS));
  }

  public waitForKey(args: BlockArguments): Promise<void> {
    return this.wait(this.keyWaiters, this.normalizeKey(args.KEY), null).then(() => undefined);
  }

  public waitForKeyOrTimeout(args: BlockArguments): Promise<boolean> {
    return this.wait(this.keyWaiters, this.normalizeKey(args.KEY), this.timeout(args.SECONDS));
  }

  private wait(registry: WaiterRegistry, name: string, timeout: number | null): Promise<boolean> {
    return new Promise((resolve) => {
      let done = false;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const finish: Waiter = (result) => {
        if (done) return;
        done = true;
        if (timer !== null) clearTimeout(timer);
        const waiters = registry.get(name);
        waiters?.delete(finish);
        if (waiters?.size === 0) registry.delete(name);
        resolve(result);
      };
      const waiters = registry.get(name) ?? new Set<Waiter>();
      registry.set(name, waiters);
      waiters.add(finish);
      if (timeout !== null) timer = setTimeout(() => finish(false), timeout);
    });
  }

  private resolveWaiters(registry: WaiterRegistry, name: string, result: boolean): void {
    for (const finish of [...(registry.get(name) ?? [])]) finish(result);
  }

  private cancelAllWaiters(): void {
    for (const registry of [this.notificationWaiters, this.keyWaiters]) {
      for (const waiters of registry.values()) for (const finish of [...waiters]) finish(false);
      registry.clear();
    }
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) return;
    for (const key of this.eventKeys(event)) this.resolveWaiters(this.keyWaiters, key, true);
  };

  private normalizeName(value: unknown): string { return Scratch.Cast.toString(value); }
  private timeout(value: unknown): number {
    const seconds = Scratch.Cast.toNumber(value);
    return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
  }
  private normalizeKey(value: unknown): string {
    const raw = Scratch.Cast.toString(value).trim();
    return KEY_ALIASES[raw] ?? KEY_ALIASES[raw.toLowerCase()] ?? raw.toLowerCase();
  }
  private eventKeys(event: KeyboardEvent): Set<string> {
    const result = new Set<string>();
    const key = event.key.toLowerCase();
    const code = event.code.toLowerCase();
    result.add(KEY_ALIASES[key] ?? key);
    if (code === 'space') result.add('space');
    else if (code.startsWith('key') && code.length === 4) result.add(code.slice(3));
    else if (code.startsWith('digit') && code.length === 6) result.add(code.slice(5));
    else if (['arrowup', 'arrowdown', 'arrowright', 'arrowleft', 'enter', 'escape'].includes(code)) result.add(code);
    return result;
  }
}
