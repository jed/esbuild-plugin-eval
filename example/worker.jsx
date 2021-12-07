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