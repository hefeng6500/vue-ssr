const Vue = require('vue');
const Koa = require('koa');
const Router = require('@koa/router');
const VueServerRenderer = require('vue-server-renderer');
const fs = require('fs');
const path = require('path')
const static = require('koa-static');

const app = new Koa();
const router = new Router();

const serverBundle = require('./dist/vue-ssr-server-bundle.json');
const template = fs.readFileSync(
  path.resolve(__dirname, 'dist/index.ssr.html'),
  'utf8'
);
const clientManifest = require('./dist/vue-ssr-client-manifest.json');

router.get('/(.*)', async (ctx) => {
  ctx.body = await VueServerRenderer.createBundleRenderer(serverBundle, {
    template,
    clientManifest,
  }).renderToString({ url: ctx.url });
});

app.use(static(path.resolve(__dirname, 'dist')));
app.use(router.routes());

app.listen(3000);
