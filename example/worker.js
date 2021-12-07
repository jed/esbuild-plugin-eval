// eval:/Users/jed/Documents/GitHub/esbuild-plugin-eval/example/worker.jsx
var contentLength = 22;
var worker_default = { "fetch": async function fetch(request) {
  return new Response(html, {
    headers: {
      "content-type": "text/html",
      "content-length": contentLength
    }
  });
} };
var html = "<h1>Hello, world!</h1>";
export {
  contentLength,
  worker_default as default,
  html
};
