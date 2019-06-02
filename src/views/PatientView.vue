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
              <div> </div>
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

export default {
  data(){
    return {

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
    }
},

  mounted() {
    if(this.$store.state.selectedPatient == '') {
      this.$router.push('/patientOverview')
    }

    /*
    this.$store.dispatch('getMoMoToken')
    .catch((error) => {
      console.log("Error: " + error.statusCode + ": " + error.statusMessage)
    })  */
  }
    
  }
</script>