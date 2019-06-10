<template>
  <div>
    <v-container fluid grid-list-sm>
      <v-layout row wrap>
        <v-flex d-flex sm2 child-flex>
          <v-layout row wrap>
            <v-flex d-flex>
              <v-card tile flat>
                <v-card-text>
                  <div class="patientData">
                    <h3>Patientendaten</h3>
                    Patienten-ID: {{selectedPatient.patId}} <br>
                    Name: {{selectedPatient.firstname}} {{selectedPatient.lastname}} <br>
                    Geburtstag: {{birthdateFormat(selectedPatient.birthdate)}}
                  </div>
                  <div class="patientEvents">
                    <h3>Ereignisse</h3>
                    <v-list class="pt-0">
                      <template v-for="(event, index) in eventList">
                        <v-list-tile
                          :key="event.from"
                          @click="selectEvent(event)"
                        >
                          <v-list-tile-content>
                            <v-list-tile-title>E{{index+1}}: {{event.eventName}}</v-list-tile-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </template>
                    </v-list>
                  </div>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex d-flex sm8 child-flex>
          <v-card tile flat>
            <v-card-text>
              <h3> Messdaten von {{ startTimeHeader }} bis {{ endTimeHeader }}</h3>
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
              <v-form
                ref="form"
                v-model="valid"
                lazy-validation
              >
              Von:
              <v-text-field
                label="dd.mm.yyyy hh:mm"
                v-model="selectedDate"
                :rules="[v => !!v || 'Zeitpunkt ist erforderlich!']"
                required
                >
              </v-text-field>
              <v-select
                :items="hours"
                v-model="selectedHours"
                label="Zeitdauer in h"
                required
                :rules="[v => !!v || 'Zeitdauer ist erforderlich!']"
                >
              </v-select>
              <v-btn
                :disabled="!valid"
                color="success"
                @click="validate"
              >
                Erstellen
              </v-btn>
              </v-form>
              <v-layout row wrap>
                <v-switch v-model="showImage" :label='`Bild anzeigen`'></v-switch>
                <v-switch class="noMargin" v-model="showStats" :label="`Bewegung anzeigen`"></v-switch>
                <v-switch class="noMargin" v-model="showPulse" :label="`Puls anzeigen`"></v-switch>
                <v-switch class="noMargin" v-model="showSO2" :label="`Sauerstoffsättigung anzeigen`"></v-switch>
              </v-layout>
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
      image: '',
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
      showImage: false,
      showStats: false,
      showPulse: true,
      showSO2: false,
      fullHR: [],
      fullSO2: [],
      fullRR: [],
      fullHRV: [],
      hours: [8,10,12,16,18,24],
      eventList: [],
      startMeasurement: '',
      endMeasurement: '',
      startTimeHeader: 'x',
      endTimeHeader: 'y',
      valid: true,
      selectedDate: '',
      selectedHours: '',
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
    initialize() {
      this.eventList = [];

      if(this.selectedPatient.hasOwnProperty('lastMeasurementEntry') && this.selectedPatient.lastMeasurementEntry != '') {
        console.log('has prop');        
        let calculatingDate = new Date(this.selectedPatient.lastMeasurementEntry);
        let endDate = new Date(this.selectedPatient.lastMeasurementEntry);
        let startDate = new Date(calculatingDate.setHours(calculatingDate.getHours() - 8));

        this.selectMeasurements(startDate, endDate, 8)
      }
      else {
        console.log('hasnt prop');
        this.showPulse = false;
      }

    },

    selectMeasurements(startDate, endDate, hours) {
      this.eventList = [];
      this.setHeaderTime(startDate, endDate);

      this.getMoMoToken()
        .then((response) => {
          this.getMoMoPicture(response.data.access_token, this.selectedPatient.patId, startDate.toISOString(), hours)
          .then((response) => {
            console.log("got Picture");
            this.showImage = true;
          })
          .catch((error) => {
            console.log("Error: " + error.statusCode + ": " + error.statusMessage)
            this.showImage = false;

          })

          this.getMoMoStatistics(response.data.access_token, this.selectedPatient.patId, startDate.toISOString(), endDate.toISOString())
          .then((resp) => {
            console.log("got Stats");
            this.showStats = true;
          })
          .catch((error) => {
            console.log("Error: " + error.statusCode + ": " + error.statusMessage)
            this.showStats = false;
          }) 

        })
        .catch((error) => {
          console.log("Error: " + error.statusCode + ": " + error.statusMessage)
        })

        this.getMeasurements(this.selectedPatient.patId, startDate.toISOString(), endDate.toISOString())
        .then((response) => {
          console.log("got Measurements")
        }) 

        this.getEvents(this.selectedPatient.patId, startDate.toISOString(), endDate.toISOString())
        .then((response) => {
          console.log("got Events")
        })

    },
    
    validate() {
      if (this.$refs.form.validate()) {
        let calculatingDate = new Date(this.selectedDate.replace( /(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"));
        let startDate = new Date(this.selectedDate.replace( /(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"));
        let endDate = new Date(calculatingDate.setHours(calculatingDate.getHours() + this.selectedHours));

        this.selectMeasurements(startDate, endDate, this.selectedHours);
      }
    },

    setHeaderTime(startTime, endTime) {
      let start = new Date(startTime);
      let end = new Date(endTime);
      let options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
      this.startTimeHeader = start.toLocaleDateString('de-DE', options);
      this.endTimeHeader = end.toLocaleDateString('de-DE', options);
    },

    birthdateFormat(date) {
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
          console.log(err);
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
          console.log(err);
      })
    },

    getMeasurements(patient, startTime, endTime) {
      return axios({url: SL_BASE_URL + 'patients/' + patient + '/measurements?from=' + startTime + '&to=' + endTime, 
      method: 'GET',
      headers: { 'Content-type': 'application/json', "Authorization": this.$store.state.token },
      })
      .then((response) => {
        response.data.forEach(element => {
          // 8867-4: HR, 2708-6: SO2, 9279-1:RR, 80404-7:HRV
          if(element.reading.measurementCode[0].code == '8867-4') {
            this.fullHR.push(element);
            this.heartbeats.push(parseInt(element.value));
          } else if(element.reading.measurementCode[0].code == '2708-6') {
            this.fullSO2.push(element);
            this.so2.push(parseInt(element.value));
          } else if(element.reading.measurementCode[0].code == '9279-1') {
            this.fullRR.push(element)
          } else if(element.reading.measurementCode[0].code == '80404-7') {
            this.fullHRV.push(element)
          }
        })

        console.log("done");
      })
      .catch(err => {
          
      })
    },

    getEvents(patient, startTime, endTime) {
      return axios({url: SL_BASE_URL + 'patients/' + patient + '/eventsAt?from=' + startTime + '&to=' + endTime, 
      method: 'GET',
      headers: { 'Content-type': 'application/json', "Authorization": this.$store.state.token},
      })
      .then((response) => {
        response.data.forEach(element => {
          this.eventList.push(element);
        })
      })
      .catch(err => {
          
      })
    },

    selectEvent(event) {
      console.log(event);
    },
  },

  mounted() {
    if(this.$store.state.selectedPatient == '') {
      this.$router.push('/patientOverview')
      return;
    }

    this.initialize();
  },
    
}
</script>

<style>
.shadow {
   box-shadow: none;
}
.padd {
  padding: 4px 0px 4px 0px;
}
.max {
  max-height: 30vh;
}
.patientEvents {
  margin-top: 16px;
}
.noMargin {
  margin-top: 0px;
}
</style>
