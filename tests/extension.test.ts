import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ExtendedNotification} from '../src/extension.js';

beforeEach(() => {
  vi.stubGlobal('document', {
    addEventListener: vi.fn()
  });

  vi.stubGlobal('Scratch', {
    BlockType: {
      COMMAND: 'command',
      REPORTER: 'reporter',
      BOOLEAN: 'boolean',
      HAT: 'hat'
    },
    ArgumentType: {
      STRING: 'string',
      NUMBER: 'number',
      BOOLEAN: 'boolean'
    },
    Cast: {
      toString: (value: unknown) => String(value ?? ''),
      toNumber: (value: unknown) => Number(value),
      toBoolean: (value: unknown) => Boolean(value)
    },
    extensions: {
      unsandboxed: true,
      register: vi.fn()
    },
    vm: {
      runtime: {
        on: vi.fn()
      }
    }
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ExtendedNotification', () => {
  it('resumes every waiter for the same notification', async () => {
    const extension = new ExtendedNotification();
    const first = extension.waitForNotification({MESSAGE: 'next'});
    const second = extension.waitForNotification({MESSAGE: 'next'});

    extension.sendNotification({MESSAGE: 'next'});

    await expect(Promise.all([first, second])).resolves.toEqual([
      undefined,
      undefined
    ]);
  });

  it('does not retain notifications sent before waiting begins', async () => {
    vi.useFakeTimers();
    const extension = new ExtendedNotification();

    extension.sendNotification({MESSAGE: 'next'});
    const result = extension.waitForNotificationOrTimeout({
      MESSAGE: 'next',
      SECONDS: 0.01
    });

    await vi.advanceTimersByTimeAsync(10);
    await expect(result).resolves.toBe(false);
  });

  it('returns true when a notification arrives before the timeout', async () => {
    vi.useFakeTimers();
    const extension = new ExtendedNotification();
    const result = extension.waitForNotificationOrTimeout({
      MESSAGE: 'next',
      SECONDS: 5
    });

    extension.sendNotification({MESSAGE: 'next'});

    await expect(result).resolves.toBe(true);
  });
});
