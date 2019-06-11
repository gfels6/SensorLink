import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store.js'
import AddPatient from './views/AddPatient.vue'
import AddSensor from './views/AddSensor.vue'
import Login from './views/Login.vue'
import PatientStatistics from './views/PatientStatistics.vue'
import PatientOverview from './views/PatientOverview.vue'
import PatientView from './views/PatientView.vue'
import SensorOverview from './views/SensorOverview.vue'

Vue.use(VueRouter)

let router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/addPatient',
      name: 'addpatient',
      component: AddPatient,
      meta: { 
        requiresAuth: true
      }
    },
    {
      path: '/addSensor',
      name: 'addsensor',
      component: AddSensor,
      meta: { 
        requiresAuth: true
      }
    },
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/patientStatistics',
      name: 'patientstatistics',
      component: PatientStatistics,
      meta: { 
        requiresAuth: true
      }
    },
    {
      path: '/patientOverview',
      name: 'patientoverview',
      component: PatientOverview,
      meta: { 
        requiresAuth: true
      }
    },
    {
      path: '/patientView',
      name: 'patientview',
      component: PatientView,
      meta: { 
        requiresAuth: true
      }
    },
    {
      path: '/sensorOverview',
      name: 'sensoroverview',
      component: SensorOverview,
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