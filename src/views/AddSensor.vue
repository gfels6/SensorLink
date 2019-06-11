<template>
  <div>
    <v-container fluid>
      <h2>Sensor hinzufügen</h2>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-select
            :items="manufacturer"
            label="Hersteller"
            v-model="selectedManufacturer"
            :rules="[v => !!v || 'Hersteller ist erforderlich!']"
            required>
          </v-select>
          <v-select
            :items="sensorType"
            label="Sensor Typ"
            v-model="selectedSensorType"
            :rules="[v => !!v || 'Sensor Typ ist erforderlich!']"
            required>
          </v-select>
          <v-text-field
            label="Sensor ID (Seriennummer)"
            v-model="sensorId"
            :rules="[v => !!v || 'Sensor ID ist erforderlich!']"
            required>
          </v-text-field>
          Messwerte des Sensors:
          <v-layout row wrap>
            <v-switch v-model="heartrate" :label='`Puls`'></v-switch>
            <v-switch v-model="spo2" :label="`Sauerstoffsättigung`"></v-switch>
            <v-switch v-model="respiration" :label="`Atemfrequenz`"></v-switch>
            <v-switch v-model="hrv" :label="`Herzfrequenzvariabilität`"></v-switch>
          </v-layout>
          <v-btn
            :disabled="!valid"
            color="success"
            @click="validate"
          >
            Erstellen
          </v-btn>
        </v-form>
    </v-container>
      <v-snackbar
        v-model="snackbar"
        :color="color"
        :multi-line="mode"
        :timeout="timeout"
      >
        {{ textSuccess }}
        <v-btn
          dark
          flat
          @click="snackbar = false"
        >
          Schliessen
        </v-btn>
      </v-snackbar>
  </div>
</template>

<script>
import axios from 'axios'

// constant url of the backend
const SL_BASE_URL = 'http://patientpath.i4mi.bfh.ch:3000/api/';

export default {
  data(){
    return {
      sensorId: '',
      // all of the existing manufacturers and their name of the sensor
      manufacturer: ["Biovotion", "Compliant Concept"],
      sensorType: ["everion", "mobilitymonitor"],
      // toggle boolean for validity of the form
      valid: true,
      // toggle boolean for the snackbar
      snackbar: false,
      // text in the snackbar
      textSuccess: "Sensor wurde angelegt. Weiterleitung auf Sensorübersicht.",
      // how long the snackbar is visible
      timeout: 4000,
      // two snackbar design options
      mode: 'multi-line',
      color: 'success',
      // selected sensor type in the dropdown
      selectedSensorType: '',
      // selected manufacturer in the dropdown
      selectedManufacturer: '',
      // toggle boolean for the four possible vital data measurements
      heartrate: false,
      spo2: false,
      hrv: false,
      respiration: false,
      // array which is filled for all checked vital data types
      readings: [],
    }
  },
  methods: {
    // validates if the form is valid (all rules ok), if it's ok then call addSensor
    validate() {
      if (this.$refs.form.validate()) {
        if(this.heartrate === true) {
          this.readings.push(this.$store.state.readingHR)
        }
        if(this.spo2 === true) {
          this.readings.push(this.$store.state.readingSPO2)
        }
        if(this.respiration === true) {
          this.readings.push(this.$store.state.readingRespiration)
        }
        if(this.hrv === true) {
          this.readings.push(this.$store.state.readingHRV)
        }
        this.addSensor();
      }
    },

    // saves the date in the menu
    save (date) {
      this.$refs.menu.save(date)
    },

    // adds a new sensor with four needed sensor parameters from the form
    addSensor(){
      axios({url: SL_BASE_URL + 'sensors', 
      method: 'POST',
      data: {
        "sensorType": this.selectedSensorType,
        "manufacturer": this.selectedManufacturer,
        "sensorId": this.sensorId,
        "readings": this.readings
      },
      headers: { "Content-Type": "application/json", "Authorization": this.$store.state.token},
      })
      .then((response) => {
        // if it is successfull, it shows a snackbar element and makes a reroute after 3 seconds
        if(response.status == "200") {
          this.snackbar = true;
          setTimeout(() =>{
            this.$router.push('/sensorOverview')
          }, 3000);
        }
      })
      .catch(err => {
        console.log("Error: " + err.statusCode + ": " + err.statusMessage)
      })
    }
  },

  watch: {
    menu (val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
    }
  },
}
</script>