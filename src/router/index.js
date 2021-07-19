import Vue from 'vue'
import Router from 'vue-router'
import CesiumGS from '@/pages/cesium/CesiumGS.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'CesiumGS',
      component: CesiumGS
    }
  ]
})
