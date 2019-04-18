<template>
  <v-card >
      <v-list class="pt-0" dense>
        <v-list-tile @click="goToPatOverview">
          <v-list-tile-action>
            <v-icon>group</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Patientenübersicht</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click="goToSensorOverview">
          <v-list-tile-action>
            <v-icon>settings_remote</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Sensorübersicht</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click="goToImportCSV">
          <v-list-tile-action>
            <v-icon>import_export</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Messwert Import CSV</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click="logout()">
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Logout</v-list-tile-title>
          </v-list-tile-content>
          </v-list-tile>
      </v-list>
  </v-card>
</template>

<script>
  export default {
    methods:{
        logout: function () {
            this.$store.dispatch('logout')
            .then(() => {
                this.$router.push('/')
            })
        },
        goToPatOverview(){
            this.$router.push('/patientOverview')
        },
        goToSensorOverview(){
            this.$router.push('/sensorOverview')
        },
        goToImportCSV(){
            this.$router.push('/importCSV')
        },
    }
  }
</script>