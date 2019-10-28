<template>
  <v-app>
    <v-navigation-drawer
      persistent
      v-model="drawer"
      enable-resize-watcher
      fixed
      app
    >
      <v-list>
        <v-list-tile
          value="true"
          v-for="(item, i) in items"
          :key="i"
          :to="item.link"
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      app
      color="transparent"
      class="elevation-1"
    >
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>

      <v-toolbar-title class="ml-2">Survey Gacha!</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
    <v-footer height="60">
      <v-flex xs12 class="text-xs-right px-3 py-2">
        <span>&copy; 2018 Kim Taewoo SKKU</span>
        <div>이용문의 & 피드백: acoustic0419@gmail.com</div>
      </v-flex>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      drawer: false,
      items: [
        {title: 'About',icon:'contact_support',link:'/'},
        {title: '진행중설문',icon:'list',link:'/surveylist'},
      ]
    }
  },
  name: 'App'
}
</script>
