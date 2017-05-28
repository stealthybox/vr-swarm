import Vue from 'vue'
import Router from 'vue-router'
import Scene from '@/components/Scene'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Scene',
      component: Scene
    }
  ]
})
