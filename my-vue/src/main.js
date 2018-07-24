import Vue from "vue";
import App from "./App.vue";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");

navigator.serviceWorker.register("/sw.js").then(function(reg) {
  if (!navigator.serviceWorker.controller) {
    return;
  }

  if (reg.waiting) {
    console.log("waiting for service wroker");
    return;
  }

  if (reg.installing) {
    console.log("installing service wrker");
    return;
  }

  reg.addEventListener("updatefound", function() {
    console.log("update found!!");
  });
});
