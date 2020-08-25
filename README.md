# SSR 初体验

SSR （Server-Side Rendering）简称“服务端渲染”，是通过服务器返回全量字符串模板的技术。

**优势**：
- 缩短浏览器的白屏时间，获得更快的页面渲染；
- 利于 SEO 爬虫抓取网站内容，获得更好的搜索排名；

**劣势**
- 占用更多的服务器 CPU 资源；
- 一些常用的浏览器 API 无法在服务器使用；
- Vue 在服务器渲染中声明周期只支持 beforeCreated、created；

## 写一个 Hello World

1、安装依赖

```shell
yarn add vue vue-server-renderer koa @koa/router
```

2、使用 koa 搭建本地服务器

```js
const Vue = require('vue')
const render = require('vue-server-renderer')
const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router();

const vm = new Vue({
  data() {
    return {
      msg: 'hello world',
    }
  },
  template: `
    <div>{{msg}}</div> 
  `,
})

router.get('/', async (ctx) => {
  let res = await render.createRenderer().renderToString(vm);
  ctx.body =  `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    ${res}
  </body>
  </html>
  `
})
app.use(router.routes())
app.listen(3000)
```



可以在 response 中查看到渲染好的字符串模板，这就是服务端将数据渲染进模板返回给浏览器的基本技术，response 如下：

```html

  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <div data-server-rendered="true">hello world</div>
  </body>
  </html>
  
```

3、使用模板进行渲染

public/index.html 中添加 注释占位符，使用模板替换注释标签。

```
<!--vue-ssr-outlet-->
```

// server.js  从 index.html 中读取模板，将 new Vue 创建的 dom 渲染至 `<!--vue-ssr-outlet-->` 中

```js
const template = fs.readFileSync('./public/index.html', 'utf8');
router.get('/', async (ctx) => {
  const res = await render
    .createRenderer({
      template,
    })
    .renderToString(vm);
  ctx.body = res
});
```



## 配置工程化的 SSR 项目

1、创建项目目录

```
├── config
│   ├── webpack.base.js
│   ├── webpack.client.js
│   └── webpack.server.js
├── dist
│   ├── client.bundle.js
│   ├── index.html
│   ├── index.ssr.html
│   ├── server.bundle.js
│   ├── vue-ssr-client-manifest.json
│   └── vue-ssr-server-bundle.json
├── package.json
├── public
│   ├── index.html
│   └── index.ssr.html
├── server.js
├── src
│   ├── App.vue
│   ├── components
│   │   ├── Bar.vue
│   │   └── Foo.vue
│   ├── entry-client.js
│   ├── entry-server.js
│   ├── app.js
│   ├── router.js
│   └── store.js
├── webpack.config.js
```

2、安装依赖

```
yarn add webpack webpack-cli webpack-dev-server webpack-merge
yarn add @babel/core @babel/preset-env babel-loader
yarn add vue-loader vue-style-loader css-loader html-webpack-plugin vue-template-compiler
```

3、配置 webpack 打包配置

由于会打包两个端的文件，webpack 配置不完全相同，可以将相同的配置写在 webpack.base.js 中，通过 merge 的形式分别合并到 client 和 server

// webpack.base.js 

```js
const path = require('path');
const VueLoaderPlugin = reqire('vue-loader/lib/plugin');

// 化绝对地址为相对地址
const resolve = (dir) => {
  path.resolve(__dirname, dir);
};

module.exports = {
  ouput: {
    filename: '[name].bundle.js',
    path: resolve('../dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: {
              presets: ['@babel/preset-env']
            }
          }
        },
        exclude: /node_modules/
      },
      {
        test: /.vue$/,
        use: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
  ]
};

```

// webpack.client.js

```js
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const base = require('./webpack.base');

module.exports = merge(base, {
  entry: {
    client: resolve('../src/entry-client.js'),
  },
  terget: 'node',
  output: {
    libraryTarget: 'commonjs2',
  },
  plugins: [new HtmlWebpackPlugin('../public/index.client.html')],
});

```

// webpack.server.js

```js
const path = require('path');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const base = require('./webpack.base');

const resolve = (dir) => {
  return path.resolve(__dirname, dir);
};

module.exports = merge(base, {
  entry: {
    server: resolve('../src/entry-server.js'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.ssr.html',
      template: '../public/index.ssr.html',
      excludeChunks: ['server'],
    }),
  ],
});

```

