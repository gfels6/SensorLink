<template>
  <v-app>

<v-navigation-drawer
      v-model="drawer"
      clipped
      fixed
      app
      v-if="isLoggedIn">
      <v-list>
        <v-list-tile 
          v-for="item in menuItems" 
          :key="item.title"
          :to="item.path"
          >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>{{ item.title }}</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar fixed app clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer" v-if="isLoggedIn"></v-toolbar-side-icon>
      <v-toolbar-title class="headline">
        <span>SensorLink</span>
      </v-toolbar-title>
      <v-toolbar-title>
        <router-link to="/hello">Home</router-link> |
        <router-link to="/about">About</router-link> |
        <router-link to="/secure">Secure</router-link>
        <span v-if="!isLoggedIn"> | <router-link to="/">Login</router-link> </span>
        <span v-if="isLoggedIn"> | <a @click="logout">Logout</a></span>
        
      </v-toolbar-title>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data(){
    return {
      drawer : true,
      clipped: false,
      menuItems: [
        {
          icon: 'home',
          title: 'Home',
          path: '/hello',
        },
        {
          icon: 'home',
          title: 'Secure',
          path: '/secure',
        },       
      ]
    }
  },
  computed : {
      isLoggedIn : function(){ return this.$store.getters.isLoggedIn}
    },
  methods: {
    logout: function () {
      this.$store.dispatch('logout')
      .then(() => {
        this.$router.push('/')
      })
    },
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
