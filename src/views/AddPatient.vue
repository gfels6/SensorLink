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

const SL_BASE_URL = 'http://patientpath.i4mi.bfh.ch:3000/api/';

export default {
  data(){
    return {
      patId: '',
      firstname: '',
      lastname: '',
      valid: true,
      date: null,
      menu: false,
      snackbar: false,
      textSuccess: "Patient wurde angelegt. Weiterleitung auf Patientenübersicht.",
      timeout: 4000,
      mode: 'multi-line',
      color: 'success',
    }
  },
  components: {
    
  },

  computed : {

  },

  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        this.createPatient();
      }
    },

    save (date) {
      this.$refs.menu.save(date)
    },

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
        if(response.status == "200") {
          this.snackbar = true;
          setTimeout(() =>{
            this.$router.push('/patientOverview')
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