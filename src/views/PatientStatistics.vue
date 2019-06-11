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
                          class="noPadd"
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
              <v-img v-show="showImage" :src="image" />
              <v-card v-show="showStats" class="shadow">
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
              <v-card v-show="showEvent" class="shadow">
                <v-card-title class="padd">
                  <div>
                    <div><b>Ereignis:</b> {{ eventName }} </div>
                  </div>
                </v-card-title>
              </v-card>
              <v-card class="mx-auto shadow" v-show="showPulse">
                <v-card-title class="padd">
                  <v-layout
                    column
                    align-start
                  >
                    <div>
                      <span
                        class="display-2 font-weight-black"
                        v-text="avgHR || '—'"
                      ></span>
                      <strong>Durchschnittlicher Puls pro Minute</strong>
                    </div>
                  </v-layout>
                  <div ref="chartHR" class="chart"></div>
                </v-card-title>
              </v-card>
              <v-card class="mx-auto shadow" v-show="showSPO2">
                <v-card-title class="padd">
                  <v-layout
                    column
                    align-start
                  >
                    <div>
                      <span
                        class="display-2 font-weight-black"
                        v-text="avgSPO2 || '—'"
                      ></span>
                      <strong>Durchschnittliche Sauerstoffsättigung in %</strong>
                    </div>
                  </v-layout>
                </v-card-title>
                <div ref="chartSPO2" class="chart"></div>
              </v-card>
              <v-card class="mx-auto shadow" v-show="showRR">
                <v-card-title class="padd">
                  <v-layout
                    column
                    align-start
                  >
                    <div>
                      <span
                        class="display-2 font-weight-black"
                        v-text="avgRR || '—'"
                      ></span>
                      <strong>Durchschnittliche Atemfrequenz pro Minute</strong>
                    </div>
                  </v-layout>
                </v-card-title>
                <div ref="chartRR" class="chart"></div>
              </v-card>
              <v-card class="mx-auto shadow" v-show="showHRV">
                <v-card-title class="padd">
                  <v-layout
                    column
                    align-start
                  >
                    <div>
                      <span
                        class="display-2 font-weight-black"
                        v-text="avgHRV || '—'"
                      ></span>
                      <strong>Durchschnittliche Herzfrequenzvariabilität</strong>
                    </div>
                  </v-layout>
                </v-card-title>
                <div ref="chartHRV" class="chart"></div>
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
                <v-switch class="noMargin" v-model="showSPO2" :label="`Sauerstoffsättigung anzeigen`"></v-switch>
                <v-switch class="noMargin" v-model="showRR" :label="`Atemfrequenz anzeigen`"></v-switch>
                <v-switch class="noMargin" v-model="showHRV" :label="`Herzfrequenzvariabilität anzeigen`"></v-switch>
              </v-layout>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
    <v-snackbar
      v-model="snackbar1"
      color="error"
      multi-line="multi-line"
    >
      {{ textError }}
      <v-btn
        dark
        flat
        @click="snackbar1 = false"
      >
        Schliessen
      </v-btn>
    </v-snackbar>
    <v-snackbar
      v-model="snackbar2"
      color="info"
      multi-line="multi-line"
      :timeout="timeout"
    >
      {{ textErrorMoMo }}
      <v-btn
        dark
        flat
        @click="snackbar2 = false"
      >
        Schliessen
      </v-btn>
    </v-snackbar>
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
      spo2: [99,99],
      checking: false,
      showImage: false,
      showStats: false,
      showPulse: true,
      showSPO2: false,
      showRR: true,
      showHRV: false,
      showEvent: false,
      fullHR: [],
      fullSPO2: [],
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
      eventName: '',
      eventFrom: '',
      eventTo: '',
      renderedOnce: false,
      chartHR: '',
      chartSPO2: '',
      chartRR: '',
      chartHRV: '',
      snackbar1: false,
      snackbar2: false,
      textError: "Es sind keine Messdaten für diesen Patient erfasst!",
      textErrorMoMo: "Es sind keine Messdaten vom Mobility-Monitor verfügbar.",
      timeout: 4000,
      optionsHR: {
        chart: {
          height: 350,
          type: "area"
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth"
        },
        series: [
          {
            name: "Puls",
            data: []
          }
        ],
        xaxis: {
          type: "datetime",
          categories: []
        },
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm:ss"
          }
        }
      },
      optionsSPO2: {
        chart: {
          height: 350,
          type: "area"
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth"
        },
        series: [
          {
            name: "SPO2",
            data: []
          }
        ],
        xaxis: {
          type: "datetime",
          categories: []
        },
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm:ss"
          }
        }
      },
      optionsRR: {
        chart: {
          height: 350,
          type: "area"
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth"
        },
        series: [
          {
            name: "Atemfrequenz",
            data: []
          }
        ],
        xaxis: {
          type: "datetime",
          categories: []
        },
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm:ss"
          }
        }
      },
      optionsHRV: {
        chart: {
          height: 350,
          type: "area"
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth"
        },
        series: [
          {
            name: "HRV",
            data: []
          }
        ],
        xaxis: {
          type: "datetime",
          categories: []
        },
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm:ss"
          }
        }
      },
    }
  },
  components: {
    
  },

  computed : {
    ...mapState(['selectedPatient']),

    avgHR () {
      const sum = this.optionsHR.series[0].data.reduce((acc, cur) => acc + cur, 0)
      const length = this.optionsHR.series[0].data.length

      if (!sum && !length) return 0

      return Math.ceil(sum / length)
    },

    avgSPO2 () {
      const sum = this.optionsSPO2.series[0].data.reduce((acc, cur) => acc + cur, 0)
      const length = this.optionsSPO2.series[0].data.length

      if (!sum && !length) return 0

      return Math.ceil(sum / length)
    }, 

    avgRR () {
      const sum = this.optionsRR.series[0].data.reduce((acc, cur) => acc + cur, 0)
      const length = this.optionsRR.series[0].data.length

      if (!sum && !length) return 0

      return Math.ceil(sum / length)
    }, 

    avgHRV () {
      const sum = this.optionsHRV.series[0].data.reduce((acc, cur) => acc + cur, 0)
      const length = this.optionsHRV.series[0].data.length

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

        this.selectAllMeasurements(startDate, endDate, 8)
      }
      else {
        this.snackbar1 = true;
        console.log('hasnt prop');
        this.showPulse = false;
        this.showSPO2 = false;
        this.showRR = false;
        this.showHRV = false;
      }

    },

    selectAllMeasurements(startDate, endDate, hours) {
      this.eventList = [];
      this.setHeaderTime(startDate, endDate);

      this.getMoMoToken()
        .then((response) => {
          this.getMoMoPicture(response.data.access_token, this.selectedPatient.patId, startDate.toISOString(), hours)
          this.getMoMoStatistics(response.data.access_token, this.selectedPatient.patId, startDate.toISOString(), endDate.toISOString())
        })
        .catch((error) => {
          console.log("Error: " + error.statusCode + ": " + error.statusMessage)
        })

        this.getVitalMeasurements(this.selectedPatient.patId, startDate.toISOString(), endDate.toISOString())
        this.getEvents(this.selectedPatient.patId, startDate.toISOString(), endDate.toISOString())
    },

    validate() {
      if (this.$refs.form.validate()) {
        let calculatingDate = new Date(this.selectedDate.replace( /(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"));
        let startDate = new Date(this.selectedDate.replace( /(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"));
        let endDate = new Date(calculatingDate.setHours(calculatingDate.getHours() + this.selectedHours));

        this.selectAllMeasurements(startDate, endDate, this.selectedHours);
      }
    },

    setHeaderTime(startTime, endTime) {
      this.startTimeHeader = this.transformDate(startTime);
      this.endTimeHeader = this.transformDate(endTime);
    },

    transformDate(date) {
      let toTransform = new Date(date);
      let options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
      toTransform = toTransform.toLocaleDateString('de-DE', options);
      return toTransform;
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
      return axios({url: MOMO_BASE_URL + 'Patients/' + patient + '/MobilityAnalysisGraph.png?isPatientNumber=true&startTime=' + startTime + '&hours=' + hours + '&width=750&culture=de-DE&timeOffset=2', 
      method: 'GET',
      responseType: 'arraybuffer',
      headers: { 'Content-type': 'image/png', "Authorization": "Bearer " + token},
      })
      .then((response) => {
        var bytes = new Uint8Array(response.data);
        var binary = bytes.reduce((data, b) => data += String.fromCharCode(b), '');
        this.image = "data:image/jpeg;base64," + btoa(binary);
        this.showImage = true;
      })
      .catch(err => {
        this.snackbar2 = true;
        this.showImage = false;
        this.showStats = false;
        console.log("Error: " + err.statusCode + ": " + err.statusMessage)
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
        this.showStats = true;
      })
      .catch(err => {
        console.log("Error: " + err.statusCode + ": " + err.statusMessage)
      })
    },

    getVitalMeasurements(patient, startTime, endTime) {
      this.optionsHR.series[0].data = [];
      this.optionsHR.xaxis.categories = [];
      this.optionsSPO2.series[0].data = [];
      this.optionsSPO2.xaxis.categories = [];
      this.optionsRR.series[0].data = [];
      this.optionsRR.xaxis.categories = [];
      this.optionsHRV.series[0].data = [];
      this.optionsHRV.xaxis.categories = [];


      return axios({url: SL_BASE_URL + 'patients/' + patient + '/measurements?from=' + startTime + '&to=' + endTime, 
      method: 'GET',
      headers: { 'Content-type': 'application/json', "Authorization": this.$store.state.token },
      })
      .then((response) => {
        let indexHR = 0;
        let avgHR = 0;
        let indexSPO2 = 0;
        let avgSPO2 = 0;
        let indexRR = 0;
        let avgRR = 0;
        let indexHRV = 0;
        let avgHRV = 0;

        response.data.forEach(element => {
          // 8867-4: HR, 2708-6: SPO2, 9279-1:RR, 80404-7:HRV
          if(element.reading.measurementCode[0].code == '8867-4') {
            this.fullHR.push(element);
            indexHR++;
            avgHR += parseInt(element.value);
            if (indexHR == 10) {
              this.optionsHR.series[0].data.push(parseInt(avgHR / 10));
              this.optionsHR.xaxis.categories.push(element.timestamp);
              avgHR = 0;
              indexHR = 0;
            }
          } else if(element.reading.measurementCode[0].code == '2708-6') {
            this.fullSPO2.push(element);
            indexSPO2++;
            avgSPO2 += parseInt(element.value);
            if (indexSPO2 == 10) {
              this.optionsSPO2.series[0].data.push(parseInt(avgSPO2 / 10));
              this.optionsSPO2.xaxis.categories.push(element.timestamp);
              avgSPO2 = 0;
              indexSPO2 = 0;
            }
          } else if(element.reading.measurementCode[0].code == '9279-1') {
            this.fullRR.push(element)
            indexRR++;
            avgRR += parseInt(element.value);
            if (indexRR == 10) {
              this.optionsRR.series[0].data.push(parseInt(avgRR / 10));
              this.optionsRR.xaxis.categories.push(element.timestamp);
              avgRR = 0;
              indexRR = 0;
            }
          } else if(element.reading.measurementCode[0].code == '80404-7') {
            this.fullHRV.push(element)
            indexHRV++;
            avgHRV += parseInt(element.value);
            if (indexHRV == 10) {
              this.optionsHRV.series[0].data.push(parseInt(avgHRV / 10));
              this.optionsHRV.xaxis.categories.push(element.timestamp);
              avgHRV = 0;
              indexHRV = 0;
            }  
          }
        })
        
        if(!this.renderedOnce) {
          if (this.$refs.chartHR ) {
            // HTML element exists
            this.chartHR = new ApexCharts(this.$refs.chartHR, this.optionsHR);
            this.chartHR.render();
          }
          if (this.$refs.chartSPO2) {
            // HTML element exists
            this.chartSPO2 = new ApexCharts(this.$refs.chartSPO2, this.optionsSPO2);
            this.chartSPO2.render();
          } 
          if (this.$refs.chartRR) {
            // HTML element exists
            this.chartRR = new ApexCharts(this.$refs.chartRR, this.optionsRR);
            this.chartRR.render();
          } 
          if (this.$refs.chartHRV) {
            // HTML element exists
            this.chartHRV = new ApexCharts(this.$refs.chartHRV, this.optionsHRV);
            this.chartHRV.render();
          } 
          this.renderedOnce = true;
        } else {
          this.chartHR.updateOptions(this.optionsHR);
          this.chartSPO2.updateOptions(this.optionsSPO2);
          this.chartRR.updateOptions(this.optionsRR);
          this.chartHRV.updateOptions(this.optionsHRV);
        }
        console.log("done");
      })
      .catch(err => {
          console.log("Error: " + err.statusCode + ": " + err.statusMessage)
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
          console.log("Error: " + err.statusCode + ": " + err.statusMessage)
      })
    },

    selectEvent(event) {
      this.eventName = event.eventName;
      this.showEvent = true;
      this.showImage = false;
      this.showStats = false;
      this.spo2 = [];
      this.heartbeats = [];

      this.setHeaderTime(event.from, event.to);

      this.getVitalMeasurements(this.selectedPatient.patId, new Date(event.from).toISOString(), new Date(event.to).toISOString())

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
.chart {
  width: 100%;
}
.noPadd a {
  padding-left: 0px;
}
</style>