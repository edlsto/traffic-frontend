import Vue from "vue";
import App from "./App.vue";
import "../src/assets/css/tailwind.css";
import VueGtag from "vue-gtag";

Vue.config.productionTip = false;

Vue.use(VueGtag, {
  config: { id: "UA-173458814-2" },
});

new Vue({
  render: (h) => h(App),
}).$mount("#app");
