# MarkdownArea autosuggest extension

This is the tiniest imaginable autosuggest interface
for the Tiniest Markdown Editor for the web. It renders
the current suggestion as a text selection, so there's
no UI - your textarea is still just a textarea.

Check out the [demo] to see how it works.

## Installation

```bash
npm install --save mdarea-suggest
```

Or you can download the raw archive from the [Releases] section.

Add the `mdarea-suggest.js` or `mdarea-suggest.min.js` script
to your page or bundle after `mdarea.js` or `mdarea.min.js`.

Like `mdarea`, `mdarea-suggest` is written in TypeScript
and therefore includes native typings out of the box.
The package exposes the extension class as the default export
and type declarations for the options object are available
as named exports:

```typescript
import MarkdownAreaSuggest, { SuggestOptions } from 'mdarea-suggest';
```

Register the extension during MarkdownArea initialisation:

```html
<textarea id="mdarea"></textarea>

<script type="application/javascript">
  const loadHashtags = async (prefix, signal) => {
    const response = await fetch('/hashtags?prefix=' + encodeURIComponent(prefix), { signal });
    return response.json();
  };

  var editor = new MarkdownArea(document.getElementById('mdarea'), {
    extensions: [
      new MarkdownAreaSuggest(loadHashtags, {
        pattern: /#[a-z0-9._]*/i
      }),
    ],
  });
</script>
```

## API

 - `new MarkdownAreaSuggest(loader[, options])`

   Creates a new instance of the extension. See below
   for info on the constructor arguments.

That's it - the extension doesn't have any other public methods
that you need to know about. It is automatically managed and destroyed
by the editor.

# Constructor arguments

 - `loader` (required, `(prefix: string, signal: AbortSignal) => Promise<string[]> | string[]`)

   This function is responsible for obtaining suggestions matching
   a given `prefix`. The function can do anything - filter an in-memory
   array or load suggestions from an API or anything else really,
   but it should always return an array of strings, or a Promise
   which resolves to an array of strings. The `signal` argument will be
   an `AbortSignal` instance if `AbortController` is implemented
   (or polyfilled) in the browser; you can pass it directly to `fetch()`
   as shown above or you can bind a listener to its `abort` event using
   the standard `addEventListener()` method.

 - `options` (`object`)

   - `pattern` (`RegExp | string`, default `\S+`)

     Specifies the pattern that the suggestion prefix must match
     in order for autosuggest to be triggered. The pattern is tested
     on each keystroke against the string immediately to the left
     of the cursor. Even though the pattern is optional, you'll probably
     want to specify it. Usually the pattern has something fixed at the
     start - e.g. `#` or `@` or even `[@#]`, followed by a pattern for
     the contents of the suggestion (e.g. `[a-z0-9._]` might be a good
     starting point for `@mentions` and `#hashtags`). The pattern
     should never match the empty string and ideally it also shouldn't
     match across line boundaries to keep it reasonably performant
     even if the text in the editor is long.

   - `keyMap` (`object`)

     Lets you customize the default key mapping for the autosuggest
     extension. The keys of the `keyMap` object correspond to the
     actions: `prev`, `next`, `accept` and `cancel`. The values can
     be either comma-separated strings or an array of strings containing
     the [names of keys] which should trigger the specified action.

     Note that unlike `mdarea` the autosuggest extension doesn't support
     key combinations, only single keys. The default mapping is as follows:

     | Action   | Keys                                            |
     | -------- | ----------------------------------------------- |
     | `prev`   | `ArrowUp`, `Up`                                 |
     | `next`   | `ArrowDown`, `Down`                             |
     | `accept` | `ArrowRight`, `Right`, `Enter`, `Tab`, `Accept` |
     | `cancel` | `ArrowLeft`, `Left`, `Escape`, `Cancel`         |


[demo]: https://jahudka.github.io/mdarea-suggest
[Releases]: https://github.com/jahudka/mdarea-suggest/releases
[names of keys]: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
