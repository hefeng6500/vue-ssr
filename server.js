const Vue = require('vue');
const Koa = require('koa');
const Router = require('@koa/router');
const render = require('vue-server-renderer');
const fs = require('fs');

const app = new Koa();

const vm = new Vue({
  data() {
    return {
      msg: 'Hello World',
    };
  },
  template: `
    <div>{{msg}}</div> 
  `,
});

const router = new Router();

const template = fs.readFileSync('./public/index.html', 'utf8');
router.get('/', async (ctx) => {
  const res = await render
    .createRenderer({
      template,
    })
    .renderToString(vm);
  ctx.body = res
});

app.use(router.routes());
app.listen(3000);
