# esbuild-plugin-eval

This is an esbuild plugin that evaluates a module before importing it. It's useful in cases where you want to render static parts of your application at build time to prune runtime dependencies, such as pre-rendering html from JSX, or pre-calculating CSP header hashes.

## Usage

When invoked with esbuild's `build` function and then added to its `plugins` option, this plugin will evaluate any imported module with `eval` in the query string of its path. It does this by bundling the module into a data url, dynamically importing it, and then re-exporting the results.

So if we have this module that generates the first 50 fibonacci numbers like this:

```js
let fib = n => n < 2 ? 1 : fib(n - 1) + fib(n - 2)

export default Array.from({length: 50}, (_, n) => fib(n))
```

importing it without this plugin like this:

```js
import table from './table.js'

table.forEach((fib, i) => console.log(`fib(${i}) = ${fib}`))
```

will result in this code:

```js
(() => {
  // example/table.js
  var fib = (n) => n < 2 ? 1 : fib(n - 1) + fib(n - 2);
  var table_default = Array.from({ length: 30 }, (_, n) => fib(n));

  // example/fibonacci.js
  table_default.forEach((fib2, i) => console.log(`fib(${i}) = ${fib2}`));
})();
```

whereas importing it with this plugin like this:

```js
import table from './table.js?eval'

table.forEach((fib, i) => console.log(`fib(${i}) = ${fib}`))
```

will result in this code:

```js
(() => {
  // eval:example/table.js
  var table_default = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229, 832040];

  // example/fibonacci.js
  table_default.forEach((fib, i) => console.log(`fib(${i}) = ${fib}`));
})();
```