import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Share from '@/components/Share'
import Gacha from '@/components/Gacha'
import GachaShare from '@/components/GachaShare'
import ErrorPage from '@/components/ErrorPage'


Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/gacha/:id',
      name: 'Gacha',
      props: true,
      component: Gacha
    },
    {
      path: '/gacha/:id/:share_id',
      name: 'GachaShare',
      props: true,
      component: GachaShare
    },
    {
      path: '/share/:id/:share_id',
      name: 'Share',
      props: true,
      component: Share
    },
    {
      path: '*',
      name: 'ErrorPage',
      component: ErrorPage
    }
  ]
})
