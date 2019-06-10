import Vue from 'vue'
import Vuex from 'vuex'
import './plugins/vuetify'
import App from './App.vue'
import router from './router.js'
import store from './store.js'
import Axios from 'axios'
import VueApexCharts from 'vue-apexcharts'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

Vue.use(Vuex)
Vue.use(VueApexCharts)

Vue.prototype.$http = Axios;