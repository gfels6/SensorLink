<template>
  <div>
    <v-container fluid>
      <h2>Sensorübersicht</h2>
        <v-btn
          color="blue darken-4"
          class="white--text pad"
          @click="addSensor()"
        >
          Neuen Sensor hinzufügen
        </v-btn>
          <v-expansion-panel>
            <v-expansion-panel-content
                v-for="(sensor,i) in sensorList"
                :key="i"
                >
                <template v-slot:header>
                  <div>Sensor - {{ sensor.sensorType }} - {{ sensor.sensorId }}</div>
                </template>
                <v-card>
                  <v-card-text>
                    <div><b>Sensor mit ID:</b> {{ sensor.sensorType }} - {{ sensor.sensorId }}</div>
                    <div><b>Hersteller:</b> {{sensor.manufacturer}}</div>
                    <div v-if="sensor.sensorType=='mobilitymonitor'"><b>Mögliche Messwerte:</b> Liegeverhalten, Aufstehverhalten, Bewegung</div>
                    <div v-if="sensor.sensorType=='everion'"><b>Mögliche Messwerte: </b>Puls, Sauerstoffsättigung, Atemfrequenz, Herzvariabilität</div>
                    <div v-if="sensor.linkedPatId!=null"><b>Verbindung: </b>Patient {{sensor.linkedPatId}} mit diesem Sensor verbunden</div>
                    <div v-if="sensor.linkedPatId==null"><b>Verbindung: </b>Kein Patient mit diesem Sensor verbunden</div>
                    <v-form
                      v-if="sensor.linkedPatId==null"
                      ref="`form + i`"
                      v-model="valid"
                      lazy-validation
                    >
                      <v-autocomplete
                          v-model="mdlPatient"
                          :items="patientList"
                          :label="`Wähle einen Patienten zum verbinden aus`"
                          :rules="[v => !!v || 'Patient ist erforderlich!']"
                          return-object
                          required
                      >
                        <template slot="selection" slot-scope="data">
                            <v-list-tile-content>
                                <v-list-tile-title v-html="data.item.firstname +' '+ data.item.lastname"></v-list-tile-title>
                            </v-list-tile-content>
                        </template>
                        <template slot="item" slot-scope="data">
                            <v-list-tile-content>
                                <v-list-tile-title v-html="data.item.firstname +' '+ data.item.lastname"></v-list-tile-title>
                            </v-list-tile-content>
                        </template>
                      </v-autocomplete>
                      <v-btn
                        :disabled="!valid"
                        color="success"
                        @click="validate(sensor, i)"
                      >
                        Verbinden
                      </v-btn>
                    </v-form>
                    <v-btn
                      v-if="sensor.linkedPatId!=null"
                      color="success"
                      @click="deleteSensor(sensor, sensor.linkedPatId)"
                    >
                      Sensor entfernen
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
    </v-container>
      
  </div>
</template>

<script>

import {mapState} from 'vuex'
import axios from 'axios'

const SL_BASE_URL = 'http://patientpath.i4mi.bfh.ch:3000/api/';

export default {
  data(){
    return {
      mdlPatient: '',
      patList: [],
      valid: true,
    }
  },
  components: {
    
  },

  computed : {
    ...mapState(['patientList']),
    ...mapState(['sensorList']),
  },

  methods: {
    addSensor() {
      this.$router.push('/addSensor')
    },

    validate(sensor,i) {
      //console.log(sensor, i, this.mdlPatient);
      if(this.mdlPatient != '') {
        this.connectSensor(sensor, this.mdlPatient);
      }
    },

    connectSensor(sensor, patient){
      axios({url: SL_BASE_URL + 'patients/' + patient.patId + '/linkSensor', 
      method: 'POST',
      data: {
        "sensorIdentifier": sensor.sensorIdentifier
      },
      headers: { "Content-Type": "application/json", "Authorization": this.$store.state.token},
      })
      .then((response) => {

        this.$router.go(0);
        /*
        if(response.status == "200") {
          this.snackbar = true;
          setTimeout(() =>{
            this.$router.push('/sensorOverview')
          }, 3000);
        } */
      })
      .catch(err => {
        console.log("Error: " + err.statusCode + ": " + err.statusMessage)
      }) 
    },

    deleteSensor(sensor, patId) {
      axios({url: SL_BASE_URL + 'patients/' + patId + '/unlinkSensor', 
      method: 'POST',
      data: {
        "sensorIdentifier": sensor.sensorIdentifier
      },
      headers: { "Content-Type": "application/json", "Authorization": this.$store.state.token},
      })
      .then((response) => {

        this.$router.go(0);
        /*
        if(response.status == "200") {
          this.snackbar = true;
          setTimeout(() =>{
            this.$router.push('/sensorOverview')
          }, 3000);
        } */
      })
      .catch(err => {
        console.log("Error: " + err.statusCode + ": " + err.statusMessage)
      }) 
    }

  },

  mounted() {
    this.$store.dispatch('getAllPatients')
    .catch((error) => {
      console.log("Error: " + error.statusCode + ": " + error.statusMessage)
    })
    this.$store.dispatch('getAllSensors')
    .catch((error) => {
      console.log("Error: " + error.statusCode + ": " + error.statusMessage)
    })

  }
    
  }
</script>

<style>
.pad{
  margin-left:0px;
}
</style>
