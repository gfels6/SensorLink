<template>
  <div>
    <v-container fluid>
      <h2>Patient hinzufügen</h2>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-text-field
            label="Patienten ID"
            v-model="patId"
            :rules="[v => !!v || 'Patienten ID ist erforderlich!']"
            required>
          </v-text-field>
          <v-text-field
            label="Vorname"
            v-model="firstname"
            :rules="[v => !!v || 'Vorname ist erforderlich!']"
            required>
          </v-text-field>
          <v-text-field
            label="Nachname"
            v-model="lastname"
            :rules="[v => !!v || 'Nachname ist erforderlich!']"
            required>
          </v-text-field>
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            :nudge-right="40"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="date"
                label="Geburtstag"
                prepend-icon="event"
                :rules="[v => !!v || 'Geburtstag ist erforderlich!']"
                required
                readonly
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              ref="picker"
              v-model="date"
              :max="new Date().toISOString().substr(0, 10)"
              min="1950-01-01"
              @change="save"
            ></v-date-picker>
          </v-menu>
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
      // four patient parameters (from the form)
      patId: '',
      firstname: '',
      lastname: '',
      date: null,
      // toggle boolean for validity of the form
      valid: true,
      // from the datePicker
      menu: false,
      // toggle boolean for the snackbar
      snackbar: false,
      // text in the snackbar
      textSuccess: "Patient wurde angelegt. Weiterleitung auf Patientenübersicht.",
      // how long the snackbar is visible
      timeout: 4000,
      // two snackbar design options
      mode: 'multi-line',
      color: 'success',
    }
  },
  methods: {
    // validates if the form is valid (all rules ok), if it's ok then call createPatient
    validate() {
      if (this.$refs.form.validate()) {
        this.createPatient();
      }
    },

    // saves the date in the menu
    save (date) {
      this.$refs.menu.save(date)
    },

    // creates an new patient with four needed patient parameters from the form
    createPatient(){
      axios({url: SL_BASE_URL + 'patients', 
      method: 'POST',
      data: {
        "patId": this.patId,
        "firstname": this.firstname,
        "lastname": this.lastname,
        "birthdate": this.date
      },
      headers: { "Content-Type": "application/json", "Authorization": this.$store.state.token},
      })
      .then((response) => {
        // if it is successfull, it shows a snackbar element and makes a reroute after 3 seconds
        if(response.status == "200") {
          this.snackbar = true;
          setTimeout(() =>{
            this.$router.push('/patientOverview')
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