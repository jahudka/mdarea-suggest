import MarkdownArea, { MarkdownAreaExtension, NewState } from 'mdarea';
import { SuggestOptions, SuggestionsLoader, Options, normalizeOptions } from './types';
import { SuggestionRequest } from './request';

export class MarkdownAreaSuggest implements MarkdownAreaExtension {
  private readonly load: SuggestionsLoader;
  private readonly options: Options;
  private editor?: MarkdownArea;
  private request?: SuggestionRequest;
  private candidates?: string[];

  constructor(loader: SuggestionsLoader, options: SuggestOptions = {}) {
    this.load = loader;
    this.options = normalizeOptions(options);
  }

  init(editor: MarkdownArea): void {
    this.editor = editor;
  }

  cleanup(editor: MarkdownArea) {
    this.editor = undefined;
  }

  handleKey(
    prefix: string,
    selection: string,
    postfix: string,
    evt: KeyboardEvent,
  ): NewState | undefined {
    if (!this.editor) {
      return undefined;
    }

    if (this.request) {
      this.request.abort();
    }

    if (evt.ctrlKey || evt.metaKey || evt.altKey) {
      return undefined;
    }

    if (evt.key.length === 1 || evt.key === 'Backspace') {
      const prefixWithCurrent = evt.key === 'Backspace'
        ? prefix.substring(0, prefix.length - 1)
      : (prefix + evt.key);

      const match = this.options.pattern.exec(prefixWithCurrent);

      if (match) {
        return this.loadCandidates(match[0], prefixWithCurrent.substring(0, prefixWithCurrent.length - match[0].length), postfix);
      }
    }

    if (!this.candidates) {
      return undefined;
    }

    const candidates = this.candidates;
    const keyMap = this.options.keyMap;

    if (keyMap.cancel.includes(evt.key)) {
      this.candidates = undefined;
      return { v: prefix + postfix, s: prefix.length };
    }

    if (keyMap.accept.includes(evt.key)) {
      this.candidates = undefined;
      return { v: prefix + selection + postfix, s: prefix.length + selection.length };
    }

    const match = this.options.pattern.exec(prefix + selection);

    if (!match || !candidates.includes(match[0])) {
      return this.candidates = undefined;
    }

    const suggestion = match[0];
    const suggestionPrefix = suggestion.substring(0, suggestion.length - selection.length);
    let d: number = 0;

    if (candidates && keyMap.prev.includes(evt.key)) {
      d = -1;
    } else if (candidates && keyMap.next.includes(evt.key)) {
      d = 1;
    }

    if (d) {
      const idx = (candidates.length + candidates.indexOf(suggestion) + d) % candidates.length;
      const candidate = candidates[idx].substring(suggestionPrefix.length);

      return {
        v: prefix + candidate + postfix,
        s: prefix.length,
        e: prefix.length + candidate.length,
      };
    }

    return undefined;
  }

  private loadCandidates(start: string, prefix: string, postfix: string) : NewState | undefined {
    try {
      const request = this.request = new SuggestionRequest(this.load, start);

      const result = request.getResult();

      if (request.isAborted()) {
        return this.request = undefined;
      }

      if (Array.isArray(result)) {
        this.request = undefined;
        return this.processCandidates(result, start, prefix, postfix);
      }

      result.then(
        candidates => {
          this.request = undefined;

          if (this.editor && !request.isAborted()) {
            const state = this.processCandidates(candidates, start, prefix, postfix);

            if (state) {
              this.editor.pushState(state);
            }
          }
        },
        e => this.handleError(e),
      );
    } catch (e) {
      this.handleError(e);
    }

    return undefined;
  }

  private processCandidates(candidates: string[], start: string, prefix: string, postfix: string) : NewState | undefined {
    this.candidates = candidates;

    if (!candidates.length) {
      return undefined;
    }

    const candidate = candidates[0];

    return {
      v: prefix + candidate + postfix,
      s: prefix.length + start.length,
      e: prefix.length + candidate.length,
    };
  }

  private handleError(e: any) : void {
    this.request = undefined;

    if (!e || e.type !== 'abort') {
      throw e;
    }
  }
}
