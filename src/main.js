import Vue from 'vue'
import App from './App'
import router from './router'
import {
  Vuetify,
  VGrid,
  VApp,
  VTextField,
  VNavigationDrawer,
  VFooter,
  VBtn,
  VIcon,
  VToolbar,
  VList,
  VProgressCircular
} from 'vuetify'

import '../node_modules/vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  components: {
    VApp,
    VGrid,
    VNavigationDrawer,
    VTextField,
    VFooter,
    VBtn,
    VIcon,
    VToolbar,
    VList,
    VProgressCircular
  }
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
