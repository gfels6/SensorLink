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
            <v-flex d-flex>
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
              <v-img :src="image" />
              <v-card>
                <v-card-title>
                  <div>
                    <div> Anzahl der Bettausstiege: {{ numberOfBedExits }} </div>
                    <div> Davon durch Personal bestätigt: {{ numberOfConfirmedBedExitWarnings }} </div>
                    <div> Durchschnittliche Bewegung: {{ Math.round(numberOfMovementsPerHour * 100) / 100 }} </div>
                    <div> Anzahl der Immobilitätswarnungen: {{ numberOfImmobilityWarnings }} </div>
                    <div> Zeit in Bett in Minuten: {{ totalTimeInBed + "/" + totalNumberOfItems }} </div>
                  </div>
                </v-card-title>
              </v-card>
              <v-card>
                <v-card-title>
                  <div>

                  </div>
                </v-card-title>
              </v-card>
            </v-card-text>
          </v-card>
        </v-flex>
        <v-flex d-flex sm2>
          <v-card tile flat>
            <v-card-text>
              <h3> Auswahl </h3>
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

    }
  },
  components: {
    
  },

  computed : {
    ...mapState(['selectedPatient']),
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

    getBase64(file) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        console.log(reader.result);
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
},

  mounted() {
    if(this.$store.state.selectedPatient == '') {
      this.$router.push('/patientOverview')
    }

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
  }
    
  }
</script>