import Vue from "vue";
import App from "./App.vue";
import "../src/assets/css/tailwind.css";
import VueGtag from "vue-gtag";

Vue.config.productionTip = false;

Vue.use(VueGtag, {
  config: { id: "G-5LB14SZ3S2" },
});

new Vue({
  render: (h) => h(App),
}).$mount("#app");
