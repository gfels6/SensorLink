<template>
  <v-card >
      <v-list class="pt-0" dense>
        <v-list-tile @click="goToPatOverview">
          <v-list-tile-action>
            <v-icon>group</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="fSize">Patientenübersicht</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click="goToSensorOverview">
          <v-list-tile-action>
            <v-icon>settings_remote</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="fSize">Sensorübersicht</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click="logout()">
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title class="fSize">Logout</v-list-tile-title>
          </v-list-tile-content>
          </v-list-tile>
      </v-list>
  </v-card>
</template>

<script>
  export default {
    methods:{
        // the logout is executed in the store ($store.dispatch)
        logout: function () {
            this.$store.dispatch('logout')
            .then(() => {
                this.$router.push('/')
            })
        },
        // menu routing to the patient overview
        goToPatOverview(){
            this.$router.push('/patientOverview')
        },
        // menu routing to the sensor overview
        goToSensorOverview(){
            this.$router.push('/sensorOverview')
        },
    }
  }
</script>

<style>
.fSize {
  font-size: 16px;
}
</style>
