import {build, stop} from 'https://deno.land/x/esbuild@v0.13.15/mod.js'
import evalPlugin from './mod.js'

build({
  bundle: true,
  entryPoints: ['./example/fibonacci.js'],
  outfile: './example/fibonacci-bundled.js',
  plugins: [evalPlugin(build)]
}).then(stop)
