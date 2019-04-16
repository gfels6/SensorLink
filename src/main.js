import Vue from 'vue'
import Vuex from 'vuex'
import './plugins/vuetify'
import App from './App.vue'
//import router from './router'
import HighchartsVue from 'highcharts-vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')

Vue.use(Vuex)
Vue.use(HighchartsVue)