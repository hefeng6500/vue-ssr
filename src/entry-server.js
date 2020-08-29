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
