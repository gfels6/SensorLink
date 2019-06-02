import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

const SL_BASE_URL = 'http://patientpath.i4mi.bfh.ch:3000/api/';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    status: '',
    token: localStorage.getItem('token') || '',
    user : {},
    patientList: [],
    sensorList: [],
    selectedPatient: '',

  },
  mutations: {
    auth_request(state){
      state.status = 'loading'
    },
    auth_success(state, token, user){
      console.log("ichwarhier");
      state.status = 'success'
      localStorage.setItem('token', token)
      state.token = token
      state.user = user
    },
    auth_error(state){
      state.status = 'error'
    },
    logout(state){
      state.status = ''
      state.token = ''
      localStorage.removeItem('token')
    },
    set_patientList(state, response){
      console.log("Setzen der Patienten");
      state.patientList = response.data;
    },
    set_patient(state, pat) {
      state.selectedPatient = pat;
    },
    set_sensorList(state, response){
      console.log("Setzen der Sensoren");
      state.sensorList = response.data;
    }
  },
  actions: {
    login({commit}, user){
      return new Promise((resolve, reject) => {
        commit('auth_request')
        axios({url: SL_BASE_URL + 'Users/login', data: user, method: 'POST' })
        .then(resp => {
          const token = resp.data.id
          const user = resp.data.userId
          commit('auth_success', token, user)
          resolve(resp)
        })
        .catch(err => {
          commit('auth_error')
          localStorage.removeItem('token')
          reject(err)
        })
      })
    },

    logout({commit}){
        commit('logout')
    },

    getAllPatients(context){
      axios({url: SL_BASE_URL + 'patients', 
      method: 'GET',
      headers: { "Content-Type": "application/json", "Authorization": this.state.token},
      })
      .then((response) => {
        context.commit('set_patientList', response)
      })
      .catch(err => {
          
      })
    },

    getAllSensors(context){
      axios({url: SL_BASE_URL + 'sensors', 
      method: 'GET',
      headers: { "Content-Type": "application/json", "Authorization": this.state.token},
      })
      .then((response) => {
        context.commit('set_sensorList', response)
      })
      .catch(err => {
          
      })
    },

  },
  getters : {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
  }
})