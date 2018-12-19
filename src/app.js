import Vue from 'vue'
import Vuelidate from 'vuelidate'
Vue.use(Vuelidate);

import Debits from './components/Debits';

Vue.component('debits', require('./components/Debits').default);

new Vue({
    el: '#app'
});