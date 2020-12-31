import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '@/renderer/views/Main.vue'
import Assist from '@/renderer/views/Assist.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/main.html',
    name: 'main',
    component: Main
  },
  {
    path: '/main.html#assist',
    name: 'assist',
    component: Assist
  },
]

const router = new VueRouter({
  //mode: 'hash',
  mode: 'history',
  //base: 'http://localhost:8080/',
  //base: process.env.BASE_URL ? process.env.BASE_URL : 'app://./',
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.hash === '#assist') {
    next({name: 'assist'});
  } else {
    next();
  }
});

export default router;
