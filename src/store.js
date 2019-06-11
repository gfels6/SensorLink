import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

const SL_BASE_URL = 'http://patientpath.i4mi.bfh.ch:3000/api/';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // status of the requests
    status: '',
    // token from the backend
    token: localStorage.getItem('token') || '',
    // which user is logged in
    user : {},
    // patientList which is showed in PatientOverview
    patientList: [],
    // sensorList which is showed in SensorOverview
    sensorList: [],
    // which patient is selected in PatientOverview
    selectedPatient: '',
    // needed readings for the AddSensor request
    readingHR: {
      "measurementString": "Puls",
      "measurementCode": [
        {
          "system": "loinc",
          "code": "8867-3",
          "display": "Heartrate"
        },
        {
          "system": "SNOMED CT",
          "code": "364075005",
          "display": "heart rate"
        }
      ],
      "Unit": "/min"
    },
    readingSPO2:  {
      "measurementString": "Sauerstoffsättigung",
      "measurementCode": [
        {
          "system": "loinc",
          "code": "2708-6",
          "display": "Oxygen saturation"
        },
        {
          "system": "SNOMED CT",
          "code": "442476006",
          "display": "Arterial oxygen saturation"
        }
      ],
      "Unit": "%"
    },
    readingRespiration: {
      "sensorType": "everion",
      "measurementString": "Atemfrequenz",
      "measurementCode": [
        {
          "system": "loinc",
          "code": "9279-1",
          "display": "Respiratory rate"
        }
      ],
      "Unit": "/min"
    },
    readingHRV: {
      "sensorType": "everion",
      "measurementString": "Herzfrequenzvariabilität",
      "measurementCode": [
        {
          "system": "loinc",
          "code": "80404-7",
          "display": "R-R interval.standard deviation (Heart rate variability)"
        }
      ],
      "Unit": "ms"
    },

  },
  mutations: {
    auth_request(state){
      state.status = 'loading'
    },
    auth_success(state, token, user){
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
      state.patientList = response.data;
    },
    set_patient(state, pat) {
      state.selectedPatient = pat;
    },
    set_sensorList(state, response){
      state.sensorList = response.data;
    }
  },
  actions: {
    /**
    * login request and storing of the token in the state
    * @param  {Object} user username and password
    */
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

    // select all existing patients and set the patientList state with it
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

    // select all existing sensors and set the sensorList state with it
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