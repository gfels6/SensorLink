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
                    <div>Sensor mit ID: {{ sensor.sensorType }} - {{ sensor.sensorId }}</div>
                    <div>Hersteller: {{sensor.manufacturer}}</div>
                    <div v-if="sensor.sensorType=='mobilitymonitor'">Mögliche Messwerte: Liegeverhalten, Aufstehverhalten, Bewegung</div>
                    <div v-if="sensor.sensorType=='everion'">Mögliche Messwerte: Puls, Sauerstoffsättigung, Atemfrequenz, Herzvariabilität</div>
                    <div v-if="sensor.linkedPatId!=null">Patient {{sensor.linkedPatId}} mit diesem Sensor verbunden</div>
                    <div v-if="sensor.linkedPatId==null">Kein Patient mit diesem Sensor verbunden</div>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
        

    </v-container>
      
  </div>
</template>

<script>

import {mapState} from 'vuex'

export default {
  data(){
    return {

    }
  },
  components: {
    
  },

  computed : {
    ...mapState(['sensorList']),
  },

  methods: {
    addSensor() {
      this.$router.push('/addSensor')
    }
  },

  mounted() {
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