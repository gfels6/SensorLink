<template>
  <div>
    <v-container fluid>
      <h2>Patientenübersicht</h2>
        <v-btn
          color="blue darken-4"
          class="white--text pad"
          @click="addPatient()"
        >
          Neuen Patienten hinzufügen
        </v-btn>
        <v-card>
          <v-list>
          <template v-for="patient in patientList">
            <v-list-tile
              :key="patient.patId"
              @click="selectPatient(patient)"
            >
              <v-list-tile-content>
                <v-list-tile-title>{{patient.firstname}} {{patient.lastname}} - {{birthdateFormat(patient.birthdate)}}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
          </v-list>
        </v-card>
    </v-container>
  </div>
</template>

<script>

import {mapState} from 'vuex'

export default {
  computed : {
    // get the state patientList (access with this.patientList)
    ...mapState(['patientList']),
  },

  methods: {
    /**
    * sets the clicked patient in the store and routing to patientStatistics
    * @param  {Object} patient clicked patient
    */
    selectPatient(patient) {
      this.$store.commit("set_patient", patient)
      this.$router.push('/patientStatistics')
    },

    // routing to addPatient view
    addPatient() {
      this.$router.push('/addPatient')
    },

    /**
    * transforms a iso date string in a readable format
    * @param  {String} date the birthdate in ISO format
    * @return {String}      birthdate in the format dd.mm.yyyy
    */
    birthdateFormat(date) {
      var event = new Date(date);
      var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      return event.toLocaleDateString('de-DE', options)
    },

  },

  mounted() {
    // request for all patients in the store
    this.$store.dispatch('getAllPatients')
    .catch((error) => {
      console.log("Error: " + error.statusCode + ": " + error.statusMessage)
    })
  }
    
  }
</script>