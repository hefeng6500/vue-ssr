const Vue = require('vue')
const Koa = require('koa')
const Router = require('@koa/router')
const render = require('vue-server-renderer')

const app = new Koa()

const vm = new Vue({
  data(){
    return {
      msg: 'Hello World'
    }
  },
  template: `
    <div>{{msg}}</div> 
  `
})

const router = new Router()

router.get('/', async ctx => {
  const res = await render.createRenderer().renderToString(vm)
  ctx.body = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>index</title>
  </head>
  <body>
    ${res}
  </body>
  </html>
  `
})

app.use(router.routes())
app.listen(3000)