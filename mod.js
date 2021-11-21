export default build => ({
  name: 'eval',

  setup({initialOptions, onLoad, onResolve}) {
    let options = {
      ...initialOptions,
      bundle: true,
      format: 'esm',
      sourcemap: 'inline',
      write: false,
      metafile: true
    }

    onResolve({filter: /[?&]eval\b/}, ({path, importer}) => {
      let {pathname} = new URL(path, `file://${importer}`)
      return {namespace: 'eval', path: pathname}
    })

    onLoad({filter: /.*/, namespace: 'eval'}, async ({path}) => {
      let {metafile, outputFiles} = await build({...options, entryPoints: [path]})
      let watchFiles = Object.keys(metafile.inputs)
      let dataurl = await new Promise(cb => {
        let reader = new FileReader()
        let blob = new Blob([outputFiles[0].contents])
        reader.onload = () => cb(reader.result)
        reader.readAsDataURL(blob)
      })

      let entries = await import(dataurl).then(Object.entries)
      let contents = entries.reduce((js, [k, v]) => {
        let ident = k === 'default' ? `${k} ` : `const ${k}=`
        return js + `export ${ident}${JSON.stringify(v)}\n`
      }, '')

      return {loader: 'js', contents, watchFiles}
    })
  }
})
