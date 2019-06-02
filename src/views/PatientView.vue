<template>
  <div>
    <v-container fluid grid-list-sm>
      <v-layout row wrap>
        <v-flex d-flex sm2>
          <v-layout row wrap>
            <v-flex d-flex>
              <v-card tile flat>
                <v-card-text>
                  <h3>Patientendaten</h3>
                  Patienten-ID: {{selectedPatient.patId}} <br>
                  Name: {{selectedPatient.firstname}} {{selectedPatient.lastname}} <br>
                  Geburtstag: {{dateFormat(selectedPatient.birthdate)}}
                </v-card-text>
              </v-card>
            </v-flex>
            <v-flex d-flex row wrap>
              <v-layout row>
                <v-flex d-flex>
                  <v-card tile flat >
                    <v-card-text>
                      <h3> Ereignisse </h3>
                    </v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex d-flex sm8 child-flex>
          <v-card tile flat>
            <v-card-text>
              <h3> Messdaten </h3>
              <v-img v-if="showImage" :src="image" />
              <v-card v-if="showStats" class="shadow">
                <v-card-title class="padd">
                  <div>
                    <div><b>Bewegung</b></div>
                    <div> Anzahl der Bettausstiege: {{ numberOfBedExits }} </div>
                    <div> Davon durch Personal bestätigt: {{ numberOfConfirmedBedExitWarnings }} </div>
                    <div> Durchschnittliche Bewegung: {{ Math.round(numberOfMovementsPerHour * 100) / 100 }} </div>
                    <div> Anzahl der Immobilitätswarnungen: {{ numberOfImmobilityWarnings }} </div>
                    <div> Zeit in Bett in Minuten: {{ totalTimeInBed + "/" + totalNumberOfItems }} </div>
                  </div>
                </v-card-title>
              </v-card>
              <v-card class="mx-auto shadow" v-if="showPulse">
                <v-card-title class="padd">
                  <v-layout
                    column
                    align-start
                  >
                    <div class="caption grey--text text-uppercase">
                      Puls
                    </div>
                    <div>
                      <span
                        class="display-2 font-weight-black"
                        v-text="avgHeartbeat || '—'"
                      ></span>
                      <strong v-if="avgHeartbeat">Schläge pro Minute</strong>
                    </div>
                  </v-layout>
                </v-card-title>
                <v-sheet color="transparent">
                  <v-sparkline
                    :key="String(avgHeartbeat)"
                    :smooth="8"
                    :gradient="['#f72047', '#ffd200', '#1feaea']"
                    :line-width="1"
                    :value="heartbeats"
                    auto-draw
                    stroke-linecap="round"
                  ></v-sparkline>
                </v-sheet>
              </v-card>
              <v-card class="mx-auto shadow" v-if="showSO2">
                <v-card-title class="padd">
                  <v-layout
                    column
                    align-start
                  >
                    <div class="caption grey--text text-uppercase">
                      Sauerstoffsättigung
                    </div>
                    <div>
                      <span
                        class="display-2 font-weight-black"
                        v-text="avgSO2 || '—'"
                      ></span>
                      <strong v-if="avgSO2">Sauerstoffsättigung in %</strong>
                    </div>
                  </v-layout>
                </v-card-title>
                <v-sheet color="transparent">
                  <v-sparkline
                    :key="String(avgSO2)"
                    :smooth="8"
                    :gradient="['#f72047', '#ffd200', '#1feaea']"
                    :line-width="1"
                    :value="so2"
                    auto-draw
                    stroke-linecap="round"
                  ></v-sparkline>
                </v-sheet>
              </v-card>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex d-flex sm2>
          <v-card tile flat>
            <v-card-text>
              <h3> Auswahl </h3>
              Von:
              <v-text-field
                label="dd.mm.yyyy hh:mm"
                solo>
              </v-text-field>
              <v-select
                :items="hours"
                label="Zeitdauer in h"
                solo>
              </v-select>
              <v-checkbox
                v-model="showImage"
                :label="`Bild anzeigen:`">
              </v-checkbox>
              <v-checkbox
                v-model="showStats"
                :label="`Bewegung anzeigen`">
              </v-checkbox>
              <v-checkbox
                v-model="showPulse"
                :label="`Puls anzeigen`">
              </v-checkbox>
              <v-checkbox
                v-model="showSO2"
                :label="`Sauerstoffsättigung anzeigen`">
              </v-checkbox>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>

import {mapState} from 'vuex'
import axios from 'axios'

const MOMO_BASE_URL = 'http://momo.bfh.ch:5000/api/';
const SL_BASE_URL = 'http://patientpath.i4mi.bfh.ch:3000/api/';

export default {
  data(){
    return {
      image: "",
      numberOfBedExits: '',
      numberOfConfirmedBedExitWarnings: '',
      numberOfMovementsPerHour: '',
      numberOfImmobilityWarnings: '',
      microActivity: null,
      maxTimeWithoutMobility: '',
      totalNumberOfItems: '',
      totalTimeInBed: '',
      data: [1,2,3,4,5],
      heartbeats: [80,80],
      so2: [99,99],
      checking: false,
      showImage: true,
      showStats: true,
      showPulse: true,
      showSO2: false,
      hours: [4,6,8,10,12,16,18,24],
    }
  },
  components: {
    
  },

  computed : {
    ...mapState(['selectedPatient']),
      avgHeartbeat () {
      const sum = this.heartbeats.reduce((acc, cur) => acc + cur, 0)
      const length = this.heartbeats.length

      if (!sum && !length) return 0

      return Math.ceil(sum / length)
    },
    avgSO2 () {
      const sum = this.so2.reduce((acc, cur) => acc + cur, 0)
      const length = this.so2.length

      if (!sum && !length) return 0

      return Math.ceil(sum / length)
    },

  },

  methods: {
    dateFormat(date) {
        var event = new Date(date);
        var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return event.toLocaleDateString('de-DE', options)
    },

    getMoMoToken(){
      let formData = new FormData();

      formData.append('grant_type', 'password');
      formData.append('username', 'Administrator');
      formData.append('password', 'admin');
      formData.append('scope', 'superuser');

      return axios({url: MOMO_BASE_URL + 'token/',
      data: formData,
      method: 'POST',
      headers: { "Content-Type": "multipart/form-data",}
      })
      .then((response) => {
        console.log(response);
        return response;
      })
    },

    getMoMoPicture(token, patient, startTime, hours) {
      return axios({url: MOMO_BASE_URL + 'Patients/' + patient + '/MobilityAnalysisGraph.png?isPatientNumber=true&startTime=' + startTime + '&hours=' + hours + '&width=800&culture=de-DE&timeOffset=2', 
      method: 'GET',
      responseType: 'arraybuffer',
      headers: { 'Content-type': 'image/png', "Authorization": "Bearer " + token},
      })
      .then((response) => {
        var bytes = new Uint8Array(response.data);
        var binary = bytes.reduce((data, b) => data += String.fromCharCode(b), '');
        this.image = "data:image/jpeg;base64," + btoa(binary);
      })
      .catch(err => {
          
      })
    },

    getMoMoStatistics(token, patient, startTime, endTime) {
      return axios({url: MOMO_BASE_URL + 'Patients/' + patient + '/Statistics/SimpleCounts?isPatientNumber=true&from=' + startTime + '&to=' + endTime + '&includeMicroActivityAnalysis=true', 
      method: 'GET',
      headers: { "Authorization": "Bearer " + token},
      })
      .then((response) => {
        this.totalTimeInBed = response.data.totalTimeInBed;
        this.totalNumberOfItems = response.data.totalNumberOfItems;
        this.maxTimeWithoutMobility = response.data.maxTimeWithoutMobility;
        this.numberOfBedExits = response.data.numberOfBedExits;
        this.numberOfConfirmedBedExitWarnings = response.data.numberOfConfirmedBedExitWarnings;
        this.numberOfMovementsPerHour = response.data.numberOfMovementsPerHour;
        this.numberOfImmobilityWarnings = response.data.numberOfImmobilityWarnings;
        this.microActivity = response.data.microActivity;
      })
      .catch(err => {
          
      })
    },

    getPulse(patient, startTime, endTime) {
      return axios({url: SL_BASE_URL + 'patients/' + patient + '/measurements?from=' + startTime + '&to=' + endTime + '&code=8867-4', 
      method: 'GET',
      headers: { 'Content-type': 'application/json', "Authorization": this.$store.state.token},
      })
      .then((response) => {
        console.log(response.data[0]);
        response.data.forEach(element => {
          //console.log(element.value);
          this.heartbeats.push(parseInt(element.value));
        })
      })
      .catch(err => {
          
      })
    },

    getSO2(patient, startTime, endTime) {
      return axios({url: SL_BASE_URL + 'patients/' + patient + '/measurements?from=' + startTime + '&to=' + endTime + '&code=2708-6', 
      method: 'GET',
      headers: { 'Content-type': 'application/json', "Authorization": this.$store.state.token},
      })
      .then((response) => {
        console.log(response.data[0]);
        response.data.forEach(element => {
          //console.log(element.value);
          this.so2.push(parseInt(element.value));
        })
      })
      .catch(err => {
          
      })
    },
},

  mounted() {
    if(this.$store.state.selectedPatient == '') {
      this.$router.push('/patientOverview')
    };

    this.getMoMoToken()
    .then((response) => {
      //console.log(response.data.access_token);
      this.getMoMoPicture(response.data.access_token, 2, '2019-06-01T22:00:00.000Z', 8)
      .then((response) => {
        console.log("showPicture");
      })
      .catch((error) => {
        console.log("Error: " + error.statusCode + ": " + error.statusMessage)
      })


      this.getMoMoStatistics(response.data.access_token, 2, '2019-06-01T22:00:00', '2019-06-02T06:00:00')
      .then((resp) => {
        console.log("showStats");
      })
      .catch((error) => {
        console.log(error);
        console.log("Error: " + error.statusCode + ": " + error.statusMessage)
      }) 

    })
    .catch((error) => {
      console.log("Error: " + error.statusCode + ": " + error.statusMessage)
    })

    this.getPulse(2,'2019-06-01T22:00:00Z', '2019-06-02T06:00:00Z')
    .then((resp) => {
        console.log("getPulse");
    })

    this.getSO2(2,'2019-06-01T22:00:00Z', '2019-06-02T06:00:00Z')
    .then((resp) => {
        console.log("getSO2");
    })


  },
  created() {
    //this.takePulse(false);
  }
    
  }
</script>

<style>
.shadow {
   box-shadow: none;
}
.padd {
  padding: 16px 0px 16px 0px;
}
.max {
  max-height: 30vh;
}
</style>
