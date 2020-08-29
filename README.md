# SSR 初体验

SSR （Server-Side Rendering）简称“服务端渲染”，是通过服务器返回全量字符串模板的技术。

**优势**：

- 缩短浏览器的白屏时间，获得更快的页面渲染；
- 利于 SEO 爬虫抓取网站内容，获得更好的搜索排名；

**劣势**

- 占用更多的服务器 CPU 资源；
- 一些常用的浏览器 API 无法在服务器使用；
- Vue 在服务器渲染中声明周期只支持 beforeCreated、created；

## 一、写一个 Hello World

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



打开 http://localhost:3000 可以在 response 中查看到渲染好的字符串模板，这就是服务端将数据渲染进模板返回给浏览器的基本技术，response 如下：

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

public/index.html 的 body 标签中添加 注释占位符，使用模板替换注释标签。

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



##  二、配置前端渲染基本工程

1、添加目录如下：

```
├── package.json
├── public
│   └── index.html
├── server.js
├── src
│   ├── App.vue
│   ├── components
│   │   ├── Bar.vue
│   │   └── Foo.vue
│   ├── entry-client.js
│   ├── entry-server.js
│   └── app.js
├── webpack.config.js
```

2、安装依赖文件

- 使用 webpack 启用服务
- 解析 .vue 文件
- ES 6 转译
- css 解析

```shell
yarn add webpack webpack-cli webpack-dev-server
yarn add @babel/core @babel/preset-env babel-loader
yarn add vue-loader vue-style-loader css-loader@^3.6.0 html-webpack-plugin vue-template-compiler
```



3、根目录添加 webpack.config.js 并配置 Webpack 

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = reqire('vue-loader/lib/plugin');

const resolve = (dir) => {
  return path.resolve(__dirname, dir);
};

module.exports = {
  mode: 'development',
  entry: resolve('../src/app.js'),
  output: {
    filename: 'bundle.js',
    path: resolve('dist')
  },
  resolve: {
      extensions: ['.js', '.jsx', '.vue','.css']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.vue/,
        use: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: true,
            },
          },
        ],
      },
    ],
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: resolve('../public/index.html'),
      })
    ],
  }
}

```

4、添加 script 命令，用于本地启动项目

```json
"script": {
	"dev": "webpack-dev-server"
}
```

5、index.html 配置

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>index</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

5、app.js 配置

```js
import Vue from 'vue';
import App from 'app';

const vm = new Vue({
	el: '#app',
	render: h => h(App)
})
```

6、App.vue 、foo.vue、bar.vue

```vue
// App.vue
<template>
  <div id="app">
    <foo />
    <bar />
  </div>
</template>
<script>
import Foo from './components/foo.vue';
import Bar from './components/bar.vue';
export default {
  components: {
    Foo,
    Bar,
  },
};
</script>

// foo.vue
<template>
  <div class="container">
    Foo
  </div>
</template>
<style scoped>
.container {
  color: red;
}
</style>

// bar.vue
<template>
  <div>
    <div @click="handleClick">Bar</div>
  </div>
</template>
<script>
export default {
  methods: {
    handleClick() {
      alert(1);
    },
  },
};
</script>

```

运行命令： yarn dev  就可以启动项目了。

## 三、配置工程化的 SSR 项目

1、创建项目目录

```
├── config
│   ├── webpack.base.js
│   ├── webpack.client.js
│   └── webpack.server.js
├── dist
│   ├── client.bundle.js
│   ├── index.client.html
│   ├── index.ssr.html
│   ├── server.bundle.js
│   ├── vue-ssr-client-manifest.json
│   └── vue-ssr-server-bundle.json
├── package.json
├── public
│   ├── index.client.html
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
yarn add webpack-merge
yarn add vue-router vuex
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

4、配置客户端及服务端入口文件

```js
// entry-client.js
import createApp from './app';
const { app } = createApp();
app.$mount('#app'); 

// entry-server.js
import createApp from './app';
export default () => {
  const { app } = createApp();
    return app;
};

```

5、配置 script 命令

```shell
"scripts": {
    "dev:client": "webpack-dev-server --config ./config/webpack.client.js",
    "build:client": "webpack --config ./config/webpack.client.js --watch",
    "build:server": "webpack --config ./config/webpack.server.js --watch",
    "build": "concurrently \"yarn build:client\" \"yarn build:server\" "
  },
```

6、配置服务端 server.js

```js
const Vue = require('vue');
const Koa = require('koa');
const Router = require('@koa/router');
const render = require('vue-server-renderer');
const fs = require('fs');
const path = require('path')
const static = require('koa-static');

const app = new Koa();
const router = new Router();

const serverBundle = fs.readFileSync(
  path.resolve(__dirname, 'dist/server.bundle.js'),
  'utf8'
);
const template = fs.readFileSync(
  path.resolve(__dirname, 'dist/index.ssr.html'),
  'utf8'
);
router.get('/(.*)', async (ctx) => {
  ctx.body = await VueServerRenderer.createBundleRenderer(serverBundle, {
    template
  }).renderToString();
});

app.use(router.routes());
app.use(static(path.resolve(__dirname, 'dist')));

app.listen(3000);

```

接下来运行 yarn build 同时打包客户端和服务端 并手动在 index.ssr.html 中添加如下代码，使用客户端 js 来处理事件逻辑

```js
<script src="client.bundle.js"></script>
```

这么做会存在一个缺陷，每次打包完都要手动添加这一行代码，很不方便！可以使用 通过json配置createBundleRenderer方法 解决该问题

6、通过json配置createBundleRenderer方法

```js
// webpack.client.js
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin'); 

plugins: [
    new VueSSRClientPlugin(),
]
// webpack.server.js
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin'); 
plugins: [
    new VueSSRClientPlugin(),
]
```

```js
// server.js
const Vue = require('vue');
const Koa = require('koa');
const Router = require('@koa/router');
const render = require('vue-server-renderer');
const fs = require('fs');
const path = require('path')
const static = require('koa-static');

const app = new Koa();
const router = new Router();

const serverBundle = fs.readFileSync(
  path.resolve(__dirname, 'dist/server.bundle.js'),
  'utf8'
);

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

app.use(router.routes());
app.use(static(path.resolve(__dirname, 'dist')));

app.listen(3000);

```

7、集成VueRouter

```js
// router.js
import Vue from "vue";
import VueRouter from "vue-router";
import Foo from "./components/Foo.vue";
Vue.use(VueRouter);
export default () => {
  const router = new VueRouter({
    mode: "history",
    routes: [
      { path: "/", component: Foo },
      { path: "/bar", component: () => import("./components/Bar.vue") }
    ]
  });
  return router;
};
```

```js
// app.js
import Vue from "vue";
import App from "./App.vue";
import createRouter from "./router";
export default () => {
  const router = createRouter();
  const app = new Vue({
    router,
    render: h => h(App)
  });
  return { app, router };
};
```

```vue
// App.vue
<template>
  <div id="app">
    <router-link to="/">foo</router-link>
    <router-link to="bar">bar</router-link>

    <router-view></router-view>
  </div>
</template>

<script>
import Foo from './components/foo.vue';
import Bar from './components/bar.vue';

export default {
  components: {
    Foo,
    Bar,
  },
};
</script>

<style></style>
```

防止刷新页面不存在

```js
router.get("*", async ctx => {
  ctx.body = await new Promise((resolve, reject) => {
    render.renderToString({ url: ctx.url }, (err, html) => {
      // 必须写成回调函数的方式否则样式不生效
      resolve(html);
    });
  });
});
```

保证异步路由加载完成

```js
export default ({ url }) => {
  return new Promise((resolve, reject) => {
    const { app, router } = createApp();
    router.push(url);
    router.onReady(() => {
      const matchComponents = router.getMatchedComponents();
      if (!matchComponents.length) {
        return reject({ code: 404 });
      }
      resolve(app);
    }, reject);
  });
};

// 服务器可以监控到错误信息，返回404
render.renderToString({ url: ctx.url }, (err, html) => {
      // 必须写成回调函数的方式否则样式不生效
    if (err && err.code == 404) {
    resolve("404 Not Found");
    }
    resolve(html);
});
```



8、集成vuex

```js
// store.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default () => {
  let store = new Vuex.Store({
    state: {
      username: 'jack',
    },
    mutations: {
      changeName(state) {
        state.username = 'rose';
      },
    },
    actions: {
      changeName({ commit }) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            commit('changeName');
            resolve();
          }, 1000);
        });
      },
    },
  });

  if (typeof window !== 'undefined' && window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
  }

  return store;
};

```

```js
// app.js
import createRouter from './router';
import createStore from './store'
export default ()=>{
    let router = createRouter();
    let store = createStore();
    let app = new Vue({
        router,
        store,
        render:(h)=>h(App)
    })
    return {app,router,store}
}
```

```js
// entry-server.js
import createApp from './app';

export default (context) => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp();
    router.push(context.url); // 默认跳转到路径里，有异步组件
    router.onReady(() => {

      const matchComponents = router.getMatchedComponents(); // 获取匹配到的组件
      if (matchComponents.length > 0) { // 匹配到路由了
        // 调用组件对应的asyncData
        console.log('matchComponents.length', matchComponents.length)
        Promise.all(matchComponents.map(component => {
          // 需要所有的asyncdata方法执行完毕后 才会响应结果
          console.log('component', component)
          console.log('component.asyncData', component.asyncData)
          if (component.methods.asyncData) {
            // 返回的是promise
            return component.methods.asyncData(store);
          }
        })).then(() => {
          context.state = store.state;// 将状态放到上下文中
          console.log(store.state)

          resolve(app)// 每次都是一个新的  只是产生一个实例 服务端根据实例 创建字符串 
        }, reject)

      } else {
        reject({ code: 404 });  // 没有匹配到路由
      }
    }, reject)
  });
};

```

在浏览器运行时替换store

```js
// 在浏览器运行代码
if(typeof window !== 'undefined' && window.__INITIAL_STATE__){
    store.replaceState(window.__INITIAL_STATE__);
}
```

需要执行的钩子函数

```js
export default {
 mounted() {
  return this.$store.dispatch("changeName");
 },
 asyncData(store) {
  return store.dispatch("changeName");
 }
};
```



当用户访问 /bar 时，浏览器向服务器请求 /bar 的路由，匹配到该组件有一个  asyncData 的方法，然后进行调用，改变了状态仓库的值，并且更新模板，最后返回的模板中带有已经赋值好的 store.state,并且会在 window.\__INITIAL_STATE__ 上挂载 store



以下是返回的模板实例 

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>index</title>
<link rel="preload" href="client.bundle.js" as="script"></head>
<body>
  <div id="app" data-server-rendered="true"><a href="/" class="router-link-active">foo</a> <a href="/bar" aria-current="page" class="router-link-exact-active router-link-active">bar</a> <div><div>Bar</div> <h1>
    rose
  </h1></div></div><script>window.__INITIAL_STATE__={"username":"rose"}</script><script src="client.bundle.js" defer></script>
</body>
</html>
```

