import createApp from './app';

export default (context) => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp();
    router.push(context.url); // 默认跳转到路径里，有异步组件
    router.onReady(() => {
      resolve(app); // 每次都是一个新的  只是产生一个实例 服务端根据实例 创建字符串
    }, reject);
  });
};
