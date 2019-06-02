import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import { format } from 'url';

const SL_BASE_URL = 'http://patientpath.i4mi.bfh.ch:3000/api/';
const MOMO_BASE_URL = 'http://momo.bfh.ch:5000/api/';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    status: '',
    token: localStorage.getItem('token') || '',
    user : {},
    patientList: [],
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

    getMoMoToken(context){
      let formData = new FormData();

      formData.append('grant_type', 'password');
      formData.append('username', 'Administrator');
      formData.append('password', 'admin');
      formData.append('scope', 'superuser');

      axios({url: MOMO_BASE_URL + 'token/',
      data: formData,
      method: 'POST',
      headers: { "Content-Type": "multipart/form-data"},
      })
      .then((response) => {
        console.log(response);
      })
    }


  },
  getters : {
    isLoggedIn: state => !!state.token,
    authStatus: state => state.status,
  }
})