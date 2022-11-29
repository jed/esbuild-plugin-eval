import {assertEquals} from 'https://deno.land/std@0.166.0/testing/asserts.ts'
import {build, stop} from 'https://deno.land/x/esbuild@v0.15.16/mod.js'
import evalPlugin from './mod.js'

await build({
  bundle: true,
  format: 'esm',
  entryPoints: ['./example/worker.jsx?eval'],
  outdir: './example',
  plugins: [evalPlugin],
  jsxFactory: 'h'
}).then(stop)

let {default: worker} = await import('./example/worker.js')
let response = await worker.fetch()

assertEquals(response.headers.get('content-length'), "22")
assertEquals(await response.text(), '<h1>Hello, world!</h1>')
