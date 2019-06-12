<template>
  <div>
    <v-container fluid grid-list-sm>
      <v-layout row wrap>
        <v-flex d-flex sm2 child-flex>
          <v-layout row wrap>
            <v-flex d-flex>
              <v-card tile flat>
                <!-- container for the patient data and the events -->
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
            <!-- container for the different graphs and statistics -->
            <v-card-text>
              <h3> Messdaten von {{ startTimeHeader }} bis {{ endTimeHeader }}</h3>
              <!-- progress bar if the request is ongoing -->
              <v-progress-linear v-if="showProgress" :indeterminate="true"></v-progress-linear>
              <!-- mobility monitor image -->
              <v-img v-show="showImage" :src="image" />
              <!-- mobility monitor statistics -->
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
              <!-- event name -->
              <v-card v-show="showEvent" class="shadow">
                <v-card-title class="padd">
                  <div>
                    <div><b>Ereignis:</b> {{ eventName }} </div>
                  </div>
                </v-card-title>
              </v-card>
              <!-- pulse graph -->
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
              <!-- spo2 graph -->
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
              <!-- respiration rate graph -->
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
              <!-- heart rate variability graph -->
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
            <!-- selection form for new requests -->
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
                <!-- toggle switches for showing / hiding stats and graphs -->
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
    <!-- snackbar if no data exists for this patient -->
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
    <!-- snackbar if no mobility monitor data exists -->
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

// todo inline documentation

import {mapState} from 'vuex'
import axios from 'axios'

// constant url for the mobility monitor REST API
const MOMO_BASE_URL = 'http://momo.bfh.ch:5000/api/';
// constant url for the backend
const SL_BASE_URL = 'http://patientpath.i4mi.bfh.ch:3000/api/';

export default {
  data(){
    return {
      // mobility monitor image in base64
      image: '',
      // mobility monitor stats
      numberOfBedExits: '',
      numberOfConfirmedBedExitWarnings: '',
      numberOfMovementsPerHour: '',
      numberOfImmobilityWarnings: '',
      microActivity: null,
      maxTimeWithoutMobility: '',
      totalNumberOfItems: '',
      totalTimeInBed: '',
      // toggle boolean for showing / hiding
      showImage: false,
      showStats: false,
      showPulse: true,
      showSPO2: false,
      showRR: true,
      showHRV: false,
      showEvent: false,
      showProgress: false,
      // all measurement objects divided into types
      fullHR: [],
      fullSPO2: [],
      fullRR: [],
      fullHRV: [],
      // possible hour selections for the form
      hours: [8,10,12,16,18,24],
      // event list with all events in this period
      eventList: [],
      // start time for the heading
      startTimeHeader: 'x',
      // end time for the heading
      endTimeHeader: 'y',
      // toggle boolean for validity of the form
      valid: true,
      // selected date in the form
      selectedDate: '',
      // selected hours in the form
      selectedHours: '',
      // clicked event name
      eventName: '',
      // start date of the event
      eventFrom: '',
      // end date of the event
      eventTo: '',
      // boolean for the first render of the graphs
      renderedOnce: false,
      // charts for the different measurement types
      chartHR: '',
      chartSPO2: '',
      chartRR: '',
      chartHRV: '',
      // no overall data found snackbar
      snackbar1: false,
      // no mobility monitor data found snackbar
      snackbar2: false,
      textError: "Es sind keine Messdaten für diesen Patient erfasst!",
      textErrorMoMo: "Es sind keine Messdaten vom Mobility-Monitor verfügbar.",
      // how long the snackbar is visible in ms
      timeout: 4000,
      // options and data for the HR chart
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
            // the data itself (value of the measurement)
            data: []
          }
        ],
        xaxis: {
          type: "datetime",
          // all date data for the x axis
          categories: []
        },
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm:ss"
          }
        }
      },
      // options and data for the SPO2 chart
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
            // the data itself (value of the measurement)
            data: []
          }
        ],
        xaxis: {
          type: "datetime",
          // all date data for the x axis
          categories: []
        },
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm:ss"
          }
        }
      },
      // options and data for the RR chart
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
            // the data itself (value of the measurement)
            data: []
          }
        ],
        xaxis: {
          type: "datetime",
          // all date data for the x axis
          categories: []
        },
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm:ss"
          }
        }
      },
      // options and data for the HRV chart
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
            // the data itself (value of the measurement)
            data: []
          }
        ],
        xaxis: {
          type: "datetime",
          // all date data for the x axis
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

  computed : {
    // get the state selectedPatient (access with this.selectedPatient)
    ...mapState(['selectedPatient']),

    /**
    * calculates the average heart rate
    * @return {Integer}      average HR over all data
    */
    avgHR () {
      const sum = this.optionsHR.series[0].data.reduce((acc, cur) => acc + cur, 0)
      const length = this.optionsHR.series[0].data.length

      if (!sum && !length) return 0

      return Math.ceil(sum / length)
    },

    /**
    * calculates the average oxygen saturation
    * @return {Integer}      average SPO2 over all data
    */
    avgSPO2 () {
      const sum = this.optionsSPO2.series[0].data.reduce((acc, cur) => acc + cur, 0)
      const length = this.optionsSPO2.series[0].data.length

      if (!sum && !length) return 0

      return Math.ceil(sum / length)
    }, 

    /**
    * calculates the average respiration rate
    * @return {Integer}      average RR over all data
    */
    avgRR () {
      const sum = this.optionsRR.series[0].data.reduce((acc, cur) => acc + cur, 0)
      const length = this.optionsRR.series[0].data.length

      if (!sum && !length) return 0

      return Math.ceil(sum / length)
    }, 

    /**
    * calculates the average heart rate variability
    * @return {Integer}      average HRV over all data
    */
    avgHRV () {
      const sum = this.optionsHRV.series[0].data.reduce((acc, cur) => acc + cur, 0)
      const length = this.optionsHRV.series[0].data.length

      if (!sum && !length) return 0

      return Math.ceil(sum / length)
    }, 

  },

  methods: {
    // initializes the first measurement request (last measurement minus 8 hours)
    initialize() {
      this.eventList = [];

      // if the patient has a lastMeasurementEntry which is not null
      if(this.selectedPatient.hasOwnProperty('lastMeasurementEntry') && this.selectedPatient.lastMeasurementEntry != '') {
        console.log('has prop');        
        let calculatingDate = new Date(this.selectedPatient.lastMeasurementEntry);
        let endDate = new Date(this.selectedPatient.lastMeasurementEntry);
        let startDate = new Date(calculatingDate.setHours(calculatingDate.getHours() - 8));

        this.selectAllMeasurements(startDate, endDate, 8)
      }
      else {
        // no measurements for the patient found
        this.snackbar1 = true;
        console.log('hasnt prop');
        this.showPulse = false;
        this.showSPO2 = false;
        this.showRR = false;
        this.showHRV = false;
      }

    },

    /**
    * starts all requests (mobility monitor data, vital signs and events)
    * for the momo image request is a hours (8-24 is possible) needed
    * @param  {Date} startDate the startDate for the request
    * @param  {Date} endDate the endDate for the request
    * @param  {Integer} hours selected hours / standard is 8
    */
    selectAllMeasurements(startDate, endDate, hours) {
      this.showProgress = true;
      this.eventList = [];
      // setting the header time (from y to x)
      this.setHeaderTime(startDate, endDate);

      // first we need the MoMo Token, the durability for the token is very short
      // therefore the request is made every single time
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

    // validates if the form is valid (all rules ok), if it's ok then call select all measurements method
    validate() {
      if (this.$refs.form.validate()) {
        // the replace is to change day and month (is not working with newDate if it is dd.mm.yyyy)
        let calculatingDate = new Date(this.selectedDate.replace( /(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"));
        let startDate = new Date(this.selectedDate.replace( /(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3"));
        // calculating the endDate with the startDate + selected hours
        let endDate = new Date(calculatingDate.setHours(calculatingDate.getHours() + this.selectedHours));

        this.selectAllMeasurements(startDate, endDate, this.selectedHours);
      }
    },

    // setting the header times in the right format
    setHeaderTime(startTime, endTime) {
      this.startTimeHeader = this.transformDate(startTime);
      this.endTimeHeader = this.transformDate(endTime);
    },

    /**
    * transforms a date string in a better readable format
    * @param  {String} date a date (mostly in the ISO format)
    * @return {String}      formatted date in the format dd.mm.yyyy HH:mm:ss
    */
    transformDate(date) {
      let toTransform = new Date(date);
      let options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
      toTransform = toTransform.toLocaleDateString('de-DE', options);
      return toTransform;
    },

    /**
    * transforms a date string in a readable birthdate string
    * @param  {String} date a date (mostly in the ISO format)
    * @return {String}      formatted date in the format dd.mm.yyyy
    */
    birthdateFormat(date) {
        var event = new Date(date);
        var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return event.toLocaleDateString('de-DE', options)
    },

    /**
    * mobility monitor token request
    * @return {Object}      response of the server (token)
    */
    getMoMoToken(){
      // it has to be a form-data format
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

    /**
    * momo image request directly to the their REST API
    * @param  {String} token momo token
    * @param  {Date} patient id from the patient
    * @param  {Date} startTime startTime for the image
    * @param  {Integer} hours number of hours for the image
    */
    getMoMoPicture(token, patient, startTime, hours) {
      return axios({url: MOMO_BASE_URL + 'Patients/' + patient + '/MobilityAnalysisGraph.png?isPatientNumber=true&startTime=' + startTime + '&hours=' + hours + '&width=750&culture=de-DE&timeOffset=2', 
      method: 'GET',
      // attention: response is a arraybuffer
      responseType: 'arraybuffer',
      headers: { 'Content-type': 'image/png', "Authorization": "Bearer " + token},
      })
      .then((response) => {
        // Uint8Array parsing
        var bytes = new Uint8Array(response.data);
        // transforming to binary code
        var binary = bytes.reduce((data, b) => data += String.fromCharCode(b), '');
        // transforming to base64 string
        this.image = "data:image/jpeg;base64," + btoa(binary);
        this.showImage = true;
      })
      .catch(err => {
        // if no data is found, show error
        this.snackbar2 = true;
        this.showImage = false;
        this.showStats = false;
        console.log("Error: " + err.statusCode + ": " + err.statusMessage)
      })
    },

   /**
    * momo statistics request directly to their REST API
    * @param  {String} token momo token
    * @param  {Date} patient id from the patient
    * @param  {Date} startTime startTime for the stats
    * @param  {Date} endTime endTime for the stats
    */
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

   /**
    * vital sign request for all measurement types in one
    * @param  {Date} patient id from the patient
    * @param  {Date} startTime startTime for the vital signs
    * @param  {Date} endTime endTime for the vitalsigns
    */
    getVitalMeasurements(patient, startTime, endTime) {
      // reset all chart data and xaxis data
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
        // indexing and average for all measurement types
        // the measurements are collected in groups of 10, average calculated and pushed into chart data
        // the reason for this is, that otherwhise there are to many data points, and apexCharts will crash
        let indexHR = 0;
        let avgHR = 0;
        let indexSPO2 = 0;
        let avgSPO2 = 0;
        let indexRR = 0;
        let avgRR = 0;
        let indexHRV = 0;
        let avgHRV = 0;

        response.data.forEach(element => {
          /* codes for the different measurements
          *  8867-4: HR
          *  2708-6: SPO2
          *  9279-1:RR
          *  80404-7:HRV */
          if(element.reading.measurementCode[0].code == '8867-4') {
            // push of the object to have the hole objects
            this.fullHR.push(element);
            indexHR++;
            avgHR += parseInt(element.value);
            // if there are 10 measurements take the average and push it into the chart data
            if (indexHR == 10) {
              this.optionsHR.series[0].data.push(parseInt(avgHR / 10));
              this.optionsHR.xaxis.categories.push(element.timestamp);
              avgHR = 0;
              indexHR = 0;
            }
          } else if(element.reading.measurementCode[0].code == '2708-6') {
            // push of the object to have the hole objects
            this.fullSPO2.push(element);
            indexSPO2++;
            avgSPO2 += parseInt(element.value);
            // if there are 10 measurements take the average and push it into the chart data
            if (indexSPO2 == 10) {
              this.optionsSPO2.series[0].data.push(parseInt(avgSPO2 / 10));
              this.optionsSPO2.xaxis.categories.push(element.timestamp);
              avgSPO2 = 0;
              indexSPO2 = 0;
            }
          } else if(element.reading.measurementCode[0].code == '9279-1') {
            // push of the object to have the hole objects
            this.fullRR.push(element)
            indexRR++;
            avgRR += parseInt(element.value);
            // if there are 10 measurements take the average and push it into the chart data
            if (indexRR == 10) {
              this.optionsRR.series[0].data.push(parseInt(avgRR / 10));
              this.optionsRR.xaxis.categories.push(element.timestamp);
              avgRR = 0;
              indexRR = 0;
            }
          } else if(element.reading.measurementCode[0].code == '80404-7') {
            // push of the object to have the hole objects
            this.fullHRV.push(element)
            indexHRV++;
            avgHRV += parseInt(element.value);
            // if there are 10 measurements take the average and push it into the chart data
            if (indexHRV == 10) {
              this.optionsHRV.series[0].data.push(parseInt(avgHRV / 10));
              this.optionsHRV.xaxis.categories.push(element.timestamp);
              avgHRV = 0;
              indexHRV = 0;
            }  
          }
        })
        
        // rendering of the charts, this is only once needed
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
          // updating of the options (data) of the charts and automatically rerendering it
          this.chartHR.updateOptions(this.optionsHR);
          this.chartSPO2.updateOptions(this.optionsSPO2);
          this.chartRR.updateOptions(this.optionsRR);
          this.chartHRV.updateOptions(this.optionsHRV);
        }
        this.showProgress = false;
        console.log("done");
      })
      .catch(err => {
          console.log("Error: " + err.statusCode + ": " + err.statusMessage)
      })
    },

   /**
    * event request for all events in this timespan
    * @param  {Date} patient id from the patient
    * @param  {Date} startTime startTime for the events
    * @param  {Date} endTime endTime for the events
    */
    getEvents(patient, startTime, endTime) {
      return axios({url: SL_BASE_URL + 'patients/' + patient + '/eventsAt?from=' + startTime + '&to=' + endTime, 
      method: 'GET',
      headers: { 'Content-type': 'application/json', "Authorization": this.$store.state.token},
      })
      .then((response) => {
        response.data.forEach(element => {
          // push every event into the eventList
          this.eventList.push(element);
        })
      })
      .catch(err => {
          console.log("Error: " + err.statusCode + ": " + err.statusMessage)
      })
    },

    /**
    * clickhandler for the events
    * start all the needed requests for the timespan of the event
    * @param  {Object} event clicked event
    */
    selectEvent(event) {
      this.eventName = event.eventName;
      this.showEvent = true;
      this.showImage = false;
      this.showStats = false;
      this.setHeaderTime(event.from, event.to);
      this.getVitalMeasurements(this.selectedPatient.patId, new Date(event.from).toISOString(), new Date(event.to).toISOString())
    },
  },

  mounted() {
    // if there is a reload of this page, go back to patientOverview
    if(this.$store.state.selectedPatient == '') {
      this.$router.push('/patientOverview')
      return;
    }
    // initialize the standard procedure
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