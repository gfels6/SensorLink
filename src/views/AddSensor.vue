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

const SL_BASE_URL = 'http://patientpath.i4mi.bfh.ch:3000/api/';

export default {
  data(){
    return {
      sensorId: '',
      manufacturer: ["Biovotion", "Compliant Concept"],
      sensorType: ["everion", "mobilitymonitor"],
      valid: true,
      snackbar: false,
      textSuccess: "Sensor wurde angelegt. Weiterleitung auf Sensorübersicht.",
      timeout: 4000,
      mode: 'multi-line',
      color: 'success',
      selectedSensorType: '',
      selectedManufacturer: '',
      heartrate: false,
      spo2: false,
      hrv: false,
      respiration: false,
      readings: [],
    }
  },
  components: {
    
  },

  computed : {

  },

  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        if(this.heartrate == true) {
          this.readings.push(this.$store.state.readingHR)
        }
        if(this.spo2 == true) {
          this.readings.push(this.$store.state.readingSPO2)
        }
        if(this.respiration === true) {
          this.readings.push(this.$store.state.readingRespiration)
        }
        if(this.hrv === true) {
          this.readings.push(this.$store.state.readingHRV)
        }
        this.addSensor();
        //console.log(this.readings);
      }
    },

    save (date) {
      this.$refs.menu.save(date)
    },

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
        if(response.status == "200") {
          this.snackbar = true;
          setTimeout(() =>{
            this.$router.push('/sensorOverview')
          }, 3000);
        }
      })
      .catch(err => {
          
      })
    }
  },

  watch: {
    menu (val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
    }
  },

  mounted() {

  }
    
  }
</script>