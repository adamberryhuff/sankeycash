import Vue from 'vue'
import App from './App.vue'
import VueIntro from 'vue-introjs';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

global.jQuery = require('jquery');
global.introJs = introJs;
var $ = global.jQuery;
window.$ = $;
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
$('.toast').toast('animation');

Vue.config.productionTip = false
Vue.use(VueIntro);

new Vue({
  render: h => h(App),
}).$mount('#app')


