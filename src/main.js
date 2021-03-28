import Vue from "vue";
import App from "./App.vue";
import "../src/assets/css/tailwind.css";
import VueAnalytics from "vue-analytics";
import router from './router'

Vue.config.productionTip = false;

Vue.use(VueAnalytics, {
  id: "UA-173458814-2",
});

new Vue({
  router,
  render: (h) => h(App)
}).$mount("#app");
