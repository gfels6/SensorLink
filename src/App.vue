<template>
  <v-app>
    <!-- navigation drawer in the left side with menu -->
    <v-navigation-drawer
          v-model="drawer"
          clipped
          fixed
          app
          v-if="isLoggedIn"
          v-bind:width="260"
    >
      <NavigationList></NavigationList>
    </v-navigation-drawer>
    <!-- toolbar with the title and the hamburger icon for the drawer -->
    <v-toolbar color="light-blue lighten-2" fixed app clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer" v-if="isLoggedIn"></v-toolbar-side-icon>
      <v-toolbar-title class="headline">
        <span>SensorLink</span>
      </v-toolbar-title>
    </v-toolbar>
    <v-content>
      <!-- content from the differents views -->
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import NavigationList from './components/NavigationList.vue'

export default {
  name: 'App',
  data(){
    return {
      drawer : false,
      clipped: false,
    }
  },
  components: {
    NavigationList,
  },
  computed : {
      isLoggedIn : function(){ return this.$store.getters.isLoggedIn}
    },
  methods: {
    created: function () {
      this.$http.interceptors.response.use(undefined, function (err) {
        return new Promise(function (resolve, reject) {
          if (err.status === 401 && err.config && !err.config.__isRetryRequest) {
            this.$store.dispatch('logout')
          }
          throw err;
        });
      });
    }
  },
    
  }
</script>
