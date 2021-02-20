import { SuggestionsLoader } from './types';

export class SuggestionRequest {
  private readonly load: SuggestionsLoader;
  private readonly prefix: string;
  private readonly controller?: AbortController;
  private aborted: boolean = false;

  constructor(load: SuggestionsLoader, prefix: string) {
    this.load = load;
    this.prefix = prefix;
    this.controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  }

  abort() : void {
    this.aborted = true;
    this.controller && this.controller.abort();
  }

  isAborted() : boolean {
    return this.aborted;
  }

  getResult() : Promise<string[]> | string[] {
    return this.load(this.prefix, this.controller?.signal);
  }
}
