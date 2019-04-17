import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/store.js'
import HelloWorld from '../components/HelloWorld.vue'
import Login from '../components/Login.vue'
import Secure from '../components/Secure.vue'

Vue.use(VueRouter)

let router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/hello',
      name: 'helloworld',
      component: HelloWorld
    },
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/secure',
      name: 'secure',
      component: Secure,
      meta: { 
        requiresAuth: true
      }
    },
  ]
})

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      next()
      return
    }
    next('/') 
  } else {
    next() 
  }
})

export default router