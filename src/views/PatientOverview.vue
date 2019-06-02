<template>
  <div>
    <h2>Patientenübersicht</h2>
    <v-list class="pt-0">
      <template v-for="patient in patientList">
        <v-list-tile
          :key="patient.patId"
          @click="selectPatient(patient)"
        >
          <v-list-tile-content>
            <v-list-tile-title>{{patient.firstname}} {{patient.lastname}}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
      </v-list>
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
    ...mapState(['patientList']),
  },

  methods: {
    selectPatient(patient) {
      this.$store.commit("set_patient", patient)
      //console.log(patient);
      this.$router.push('/patientView')
    },

  },

  created() {
    this.$store.dispatch('getAllPatients')
    .catch((error) => {
      console.log("Error: " + error.statusCode + ": " + error.statusMessage)
    })
  }
    
  }
</script>