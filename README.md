# esbuild-plugin-eval

This is an esbuild plugin that evaluates a module before importing it. It's useful in cases where you want to render static parts of your application at build time to prune runtime dependencies, such as pre-rendering html from JSX, or pre-calculating CSP header hashes.

A best effort is made to properly handle function exports, but keep in mind that all variables accessed from exported functions will need to be exported as well.

So this won't work:

```js
// hello.js
let message = 'Hello, world!'
export default () => console.log(message)
```

But this will:

```js
// hello.js
export let message = 'Hello, world!'
export default () => console.log(message)
```

## Usage

When added to esbuild's `plugins` option, this plugin will evaluate any imported module with `eval` in the query string of its path. It does this by bundling the module into a data url, dynamically importing it, and then re-exporting the results.

In the provided Deno example, the following file:

```jsx
import {h} from 'https://unpkg.com/preact@10.5.13/dist/preact.module.js'
import render from 'https://unpkg.com/preact-render-to-string@5.1.19/dist/index.module.js?module'

let app = <h1>Hello, world!</h1>

export let html = render(app)

export let contentLength = new TextEncoder().encode(html).length

export default {
  async fetch(request) {
    return new Response(html, {
      headers: {
        'content-type': 'text/html',
        'content-length': contentLength
      }
    })
  }
}
```

is bundled via the code like the following:

```js
import {build, stop} from 'https://deno.land/x/esbuild@v0.14.5/mod.js'
import evalPlugin from 'https://deno.land/x/esbuild_plugin_eval@v2.0.0/mod.js'

await build({
  bundle: true,
  format: 'esm',
  entryPoints: ['./example/worker.jsx?eval'],
  outdir: './example',
  plugins: [evalPlugin],
  jsxFactory: 'h'
}).then(stop)
```

to create the following:

```js
var contentLength = 22;
var html = "<h1>Hello, world!</h1>";
var worker_default = { "fetch": async function fetch(request) {
  return new Response(html, {
    headers: {
      "content-type": "text/html",
      "content-length": contentLength
    }
  });
} };
export {
  contentLength,
  worker_default as default,
  html
};
```

In this case, Preact is used to render JSX and return plain HTML for a Cloudflare Worker, removing all remote dependencies and render compute overhead.

