import {extensionConfig} from './config.js';

type Waiter = (result: boolean) => void;
type WaiterRegistry = Map<string, Set<Waiter>>;

type BlockArguments = {
  MESSAGE?: unknown;
  KEY?: unknown;
  SECONDS?: unknown;
};

const KEY_MENU = [
  'スペース',
  '上向き矢印',
  '下向き矢印',
  '右向き矢印',
  '左向き矢印',
  'Enter',
  'Escape',
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),
  ...'0123456789'.split('')
];

const REQUESTED_KEY_ALIASES: Record<string, string> = {
  スペース: 'space',
  space: 'space',
  spacebar: 'space',
  ' ': 'space',
  上向き矢印: 'arrowup',
  上矢印: 'arrowup',
  arrowup: 'arrowup',
  'up arrow': 'arrowup',
  下向き矢印: 'arrowdown',
  下矢印: 'arrowdown',
  arrowdown: 'arrowdown',
  'down arrow': 'arrowdown',
  右向き矢印: 'arrowright',
  右矢印: 'arrowright',
  arrowright: 'arrowright',
  'right arrow': 'arrowright',
  左向き矢印: 'arrowleft',
  左矢印: 'arrowleft',
  arrowleft: 'arrowleft',
  'left arrow': 'arrowleft',
  エンター: 'enter',
  enter: 'enter',
  return: 'enter',
  エスケープ: 'escape',
  escape: 'escape',
  esc: 'escape'
};

const EVENT_KEY_ALIASES: Record<string, string> = {
  ' ': 'space',
  spacebar: 'space',
  arrowup: 'arrowup',
  arrowdown: 'arrowdown',
  arrowright: 'arrowright',
  arrowleft: 'arrowleft',
  enter: 'enter',
  escape: 'escape',
  esc: 'escape'
};

export class ExtendedNotification implements TurboWarpExtension {
  private readonly notificationWaiters: WaiterRegistry = new Map();
  private readonly keyWaiters: WaiterRegistry = new Map();

  public constructor() {
    document.addEventListener('keydown', this.onKeyDown, true);

    Scratch.vm?.runtime?.on('PROJECT_STOP_ALL', () => {
      this.cancelAllWaiters();
    });
  }

  public getInfo(): Record<string, unknown> {
    return {
      id: extensionConfig.id,
      name: '拡張通知',
      color1: '#5B67A5',
      color2: '#4C5794',
      color3: '#3F487E',
      blocks: [
        {
          opcode: 'sendNotification',
          blockType: Scratch.BlockType.COMMAND,
          text: '[MESSAGE] を拡張通知する',
          arguments: {
            MESSAGE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '次へ'
            }
          }
        },
        {
          opcode: 'waitForNotification',
          blockType: Scratch.BlockType.COMMAND,
          text: '[MESSAGE] 拡張通知を受け取るまで待つ',
          arguments: {
            MESSAGE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '次へ'
            }
          }
        },
        {
          opcode: 'waitForNotificationOrTimeout',
          blockType: Scratch.BlockType.BOOLEAN,
          text: '[MESSAGE] 拡張通知を受け取る または [SECONDS] 秒待った',
          disableMonitor: true,
          arguments: {
            MESSAGE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '次へ'
            },
            SECONDS: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 5
            }
          }
        },
        '---',
        {
          opcode: 'waitForKey',
          blockType: Scratch.BlockType.COMMAND,
          text: '[KEY] キー押下の拡張通知まで待つ',
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              menu: 'keyMenu',
              defaultValue: 'スペース'
            }
          }
        },
        {
          opcode: 'waitForKeyOrTimeout',
          blockType: Scratch.BlockType.BOOLEAN,
          text: '[KEY] キー押下の拡張通知 または [SECONDS] 秒を待った',
          disableMonitor: true,
          arguments: {
            KEY: {
              type: Scratch.ArgumentType.STRING,
              menu: 'keyMenu',
              defaultValue: 'スペース'
            },
            SECONDS: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 5
            }
          }
        }
      ],
      menus: {
        keyMenu: {
          acceptReporters: true,
          items: KEY_MENU
        }
      }
    };
  }

  public sendNotification(args: BlockArguments): void {
    const name = this.normalizeNotificationName(args.MESSAGE);
    this.resolveWaiters(this.notificationWaiters, name, true);
  }

  public waitForNotification(args: BlockArguments): Promise<void> {
    const name = this.normalizeNotificationName(args.MESSAGE);
    return this.createWaitPromise(this.notificationWaiters, name, null).then(
      () => undefined
    );
  }

  public waitForNotificationOrTimeout(args: BlockArguments): Promise<boolean> {
    const name = this.normalizeNotificationName(args.MESSAGE);
    return this.createWaitPromise(
      this.notificationWaiters,
      name,
      this.secondsToMilliseconds(args.SECONDS)
    );
  }

  public waitForKey(args: BlockArguments): Promise<void> {
    const key = this.normalizeRequestedKey(args.KEY);
    return this.createWaitPromise(this.keyWaiters, key, null).then(() => undefined);
  }

  public waitForKeyOrTimeout(args: BlockArguments): Promise<boolean> {
    const key = this.normalizeRequestedKey(args.KEY);
    return this.createWaitPromise(
      this.keyWaiters,
      key,
      this.secondsToMilliseconds(args.SECONDS)
    );
  }

  private createWaitPromise(
    registry: WaiterRegistry,
    name: string,
    timeoutMilliseconds: number | null
  ): Promise<boolean> {
    return new Promise((resolve) => {
      let finished = false;
      let timerId: ReturnType<typeof setTimeout> | null = null;

      const finish: Waiter = (result) => {
        if (finished) return;
        finished = true;

        if (timerId !== null) clearTimeout(timerId);

        const waiters = registry.get(name);
        waiters?.delete(finish);
        if (waiters?.size === 0) registry.delete(name);

        resolve(Boolean(result));
      };

      const waiters = registry.get(name) ?? new Set<Waiter>();
      registry.set(name, waiters);
      waiters.add(finish);

      if (timeoutMilliseconds !== null) {
        timerId = setTimeout(() => finish(false), timeoutMilliseconds);
      }
    });
  }

  private resolveWaiters(
    registry: WaiterRegistry,
    name: string,
    result: boolean
  ): void {
    const waiters = registry.get(name);
    if (!waiters) return;

    for (const finish of [...waiters]) {
      try {
        finish(result);
      } catch (error) {
        console.error('Failed to resolve an Extended Notification waiter:', error);
      }
    }
  }

  private cancelAllWaiters(): void {
    for (const registry of [this.notificationWaiters, this.keyWaiters]) {
      for (const waiters of registry.values()) {
        for (const finish of [...waiters]) {
          try {
            finish(false);
          } catch (error) {
            console.error('Failed to cancel an Extended Notification waiter:', error);
          }
        }
      }
      registry.clear();
    }
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) return;

    for (const key of this.eventToNormalizedKeys(event)) {
      this.resolveWaiters(this.keyWaiters, key, true);
    }
  };

  private normalizeNotificationName(value: unknown): string {
    return Scratch.Cast.toString(value);
  }

  private secondsToMilliseconds(value: unknown): number {
    const seconds = Number(Scratch.Cast.toNumber(value));
    return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
  }

  private normalizeRequestedKey(value: unknown): string {
    const key = Scratch.Cast.toString(value).trim().toLowerCase();
    return REQUESTED_KEY_ALIASES[key] ?? key;
  }

  private eventToNormalizedKeys(event: KeyboardEvent): Set<string> {
    const result = new Set<string>();
    const key = event.key.toLowerCase();
    const code = event.code.toLowerCase();

    const normalizedKey = EVENT_KEY_ALIASES[key];
    if (normalizedKey) result.add(normalizedKey);
    else if (key) result.add(key);

    if (code === 'space') result.add('space');
    else if (code.startsWith('key') && code.length === 4) result.add(code.slice(3));
    else if (code.startsWith('digit') && code.length === 6) result.add(code.slice(5));
    else if (
      ['arrowup', 'arrowdown', 'arrowright', 'arrowleft', 'enter', 'escape'].includes(
        code
      )
    ) {
      result.add(code);
    }

    return result;
  }
}
