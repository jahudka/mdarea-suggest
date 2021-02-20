export type SuggestOptions = {
  pattern?: RegExp | string;
  keyMap?: Partial<Keymap>;
};

export type SuggestAction = 'prev' | 'next' | 'cancel' | 'accept';

export type Keymap = {
  [A in SuggestAction]: string | string[];
};

export type SuggestionsLoader = (
  prefix: string,
  signal?: AbortSignal,
) => Promise<string[]> | string[];

export type Options = {
  pattern: RegExp;
  keyMap: Keymap;
};

export function normalizeOptions(options: SuggestOptions = {}): Options {
  return {
    pattern: normalizePattern(options.pattern || '\\S+', '$'),
    keyMap: normalizeKeymap(options.keyMap),
  };
}

const defaultKeymap: Keymap = {
  prev: ['ArrowUp', 'Up'],
  next: ['ArrowDown', 'Down'],
  cancel: ['Escape', 'ArrowLeft', 'Left', 'Cancel'],
  accept: ['Enter', 'ArrowRight', 'Right', 'Tab', 'Accept'],
};

function normalizeKeymap(keymap: Partial<Keymap> = {}) : Keymap {
  const map: Keymap = {} as any;

  for (const action in defaultKeymap) if (defaultKeymap.hasOwnProperty(action)) {
    const keys = keymap[action] || defaultKeymap[action];
    map[action] = Array.isArray(keys) ? keys : keys.split(/\s*,\s*/g);
  }

  return map;
}

function normalizePattern(...re: (RegExp | string)[]) : RegExp {
  let ci: boolean = false;

  const pattern = re
    .map(p => {
      if (typeof p === 'string') {
        return p;
      }

      ci = ci || p.ignoreCase;
      return p.source.replace(/^\^|\$$/g, '');
    })
    .join('');

  return new RegExp(pattern, ci ? 'i' : undefined);
}
