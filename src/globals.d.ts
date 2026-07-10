interface TurboWarpExtension {
  getInfo(): Record<string, unknown>;
}

interface ScratchRuntime {
  on(eventName: string, listener: () => void): void;
}

interface ScratchApi {
  extensions: {
    unsandboxed: boolean;
    register(extension: TurboWarpExtension): void;
  };
  BlockType: Record<'COMMAND' | 'REPORTER' | 'BOOLEAN' | 'HAT', string>;
  ArgumentType: Record<'STRING' | 'NUMBER' | 'BOOLEAN', string>;
  Cast: {
    toString(value: unknown): string;
    toNumber(value: unknown): number;
    toBoolean(value: unknown): boolean;
  };
  vm?: {
    runtime?: ScratchRuntime;
  };
}

declare const Scratch: ScratchApi;
