import Router from 'vue-router'
import Vue from 'vue'

Vue.use(Router)

const Foo = () => import('./components/foo.vue')
const Bar = () => import('./components/bar.vue')

export default () => {
  const router = new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: Foo
      },
      {
        path: '/bar',
        component: Bar
      }
    ]
  })
  return router
}
