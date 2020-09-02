import Vue from 'vue'
import App from './App.vue'
import VueIntro from 'vue-introjs';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import VueI18n from 'vue-i18n';
import en from './assets/content/en.json';
import de from './assets/content/de.json';


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
Vue.use(VueI18n);

const messages = {en, de};
const i18n = new VueI18n({locale: 'de', messages});

new Vue({
    i18n,
    render: h => h(App),
}).$mount('#app')


