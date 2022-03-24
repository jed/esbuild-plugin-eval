export default {
  name: 'eval',

  setup({initialOptions, onLoad, onResolve, esbuild}) {
    let options = {
      ...initialOptions,
      bundle: true,
      format: 'esm',
      sourcemap: false,
      write: false,
      metafile: true
    }

    onResolve({filter: /[?&]eval\b/}, ({path, resolveDir}) => {
      let {pathname} = new URL(path, `file://${resolveDir}/`)
      return {namespace: 'eval', path: pathname}
    })

    onLoad({filter: /.*/, namespace: 'eval'}, async ({path}) => {
      let {metafile, outputFiles} = await esbuild.build({...options, entryPoints: [path]})
      let watchFiles = Object.keys(metafile.inputs)
      let dataurl = await new Promise(cb => {
        let reader = new FileReader()
        let blob = new Blob([outputFiles[0].contents])
        reader.onload = () => cb(reader.result)
        reader.readAsDataURL(blob)
      })

      let entries = await import(dataurl).then(Object.entries)
      let contents = entries.reduce((js, [k, v]) => {
        let ident = k === 'default' ? `${k} ` : `let ${k}=`
        return js + `export ${ident}${stringify(v)}\n`
      }, '')

      return {loader: 'js', contents, watchFiles}
    })
  }
}

function stringify(v) {
  switch (typeof v) {
    case 'object':
      if (v === null) return 'null'
      if (Array.isArray(v)) return `[${v.map(stringify)}]`
      return `{${Object.entries(v).map(e => e.map(stringify).join(':'))}}`
    case 'function':
      try { return String(eval(`(${v})`)) }
      catch (e) { return String(v).replace(/^async|^/, '$& function ') }
    case 'bigint':
      return `${v}n`
    case 'undefined':
      return 'undefined'
    default:
      return JSON.stringify(v)
  }
}
