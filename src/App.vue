<template>
    <div id="app">
        <Toast ref="toast"></Toast>
        <Navbar
            :chartShowing="chartShowing"
            :itemizedIncomes="incomesItemized"
            :itemizedExpenses="expensesItemized"
            :itemizedInvestments="investmentsItemized"
            @setItemizedInvestments="setItemizedInvestments"
            @setItemizedExpenses="setItemizedExpenses"
            @setItemizedIncomes="setItemizedIncomes"
            @download="download"
            @alert="alert" />
        <Chart
            ref="chart"
            :chartShowing="chartShowing"
            :itemizedIncomes="incomesItemized"
            :itemizedExpenses="expensesItemized"
            :itemizedInvestments="investmentsItemized"
            :grossSum="grossSum"
            :netSum="netSum"
            :taxSum="taxSum"
            :expenseSum="expenseSum"
            :unallocatedSum="unallocatedSum"
            :investmentSum="investmentSum" />
        <div class="container-fluid">
            <Incomes
                :incomesItemized="incomesItemized"
                :unallocatedSum="unallocatedSum"
                :grossSum="grossSum"
                :netSum="netSum"
                :taxSum="taxSum"
                @addIncome="addIncome"
                @removeIncome="removeIncome" />
            <img src="./assets/divider.png" class="divider">
            <Expenses
                :expensesItemized="expensesItemized"
                :netSum="netSum"
                :expenseSum="expenseSum"
                :unallocatedSum="unallocatedSum"
                :investmentSum="investmentSum"
                @removeExpense="removeExpense"
                @addExpense="addExpense" />
            <img src="./assets/divider.png" class="divider">
            <Investments
                :investmentsItemized="investmentsItemized"
                :incomesItemized="incomesItemized"
                :netSum="netSum"
                :expenseSum="expenseSum"
                :unallocatedSum="unallocatedSum"
                :investmentSum="investmentSum"
                @removeInvestment="removeInvestment"
                @addInvestment="addInvestment" />
        </div>
        <Footer />
    </div>
</template>
<script>
import Toast from './components/Toast.vue';
import Navbar from './components/Navbar.vue';
import Chart from './components/Chart.vue'
import Footer from './components/Footer.vue'
import Incomes from './components/Incomes.vue'
import Expenses from './components/Expenses.vue'
import Investments from './components/Investments.vue'
import Vue from 'vue';

export default {
    name: 'App',
    components: {
        Toast,
        Chart,
        Footer,
        Navbar,
        Incomes,
        Expenses,
        Investments,
    },
    data () {
        return {
            incomesItemized: [],
            expensesItemized: [],
            investmentsItemized: []
        }
    },
    methods: {
        /**
         * Investment Methods
         */
        addIncome: function (income) {
            this.incomesItemized.push(income);
            this.incomesItemized.sort((a, b) => a.value < b.value);
            this.$refs.toast.show('Income Stream Added');
        },
        removeIncome: function (idx) {
            this.incomesItemized.splice(idx, 1);
            this.incomesItemized.sort((a, b) => a.value < b.value);
            this.$refs.toast.show('Income Stream Removed');
        },
        setItemizedIncomes: function (incomes) {
            incomes.sort((a, b) => a.value < b.value);
            Vue.set(this, 'incomesItemized', incomes);
        },

        /**
         * Expense Methods
         */
        addExpense: function (expense) {
            this.expensesItemized.push(expense);
            this.expensesItemized.sort((a, b) => a.value < b.value);
            this.$refs.toast.show('Expense Added');
        },
        removeExpense: function (idx) {
            this.expensesItemized.splice(idx, 1);
            this.expensesItemized.sort((a, b) => a.value < b.value);
            this.$refs.toast.show('Expense Removed');
        },
        setItemizedExpenses: function (expenses) {
            expenses.sort((a, b) => a.value < b.value);
            Vue.set(this, 'expensesItemized', expenses);
        },

        /**
         * Investment Methods
         */
        addInvestment: function (investment) {
            this.investmentsItemized.push(investment);
            this.investmentsItemized.sort((a, b) => a.value < b.value);
            this.$refs.toast.show('Investment Added');
        },
        removeInvestment: function (idx) {
            this.investmentsItemized.splice(idx, 1);
            this.investmentsItemized.sort((a, b) => a.value < b.value);
            this.$refs.toast.show('Investment Removed');
        },
        setItemizedInvestments: function (investments) {
            investments.sort((a, b) => a.value < b.value);
            Vue.set(this, 'investmentsItemized', investments);
        },

        /**
         * Util
         */
        download: function () {
            this.$refs.chart.downloadChartTrigger();
        },
        alert: function (alert) {
            this.$refs.toast.show(alert);
        }
    },
    computed: {
        grossSum () {
            let value = 0;
            this.incomesItemized.forEach(income => {
                value += parseInt(income.value);
                income.exemptions.forEach(exemption => {
                    value += parseInt(exemption.match);
                })
            })
            return value;
        },
        netSum () {
            return this.grossSum-this.taxSum;
        },
        taxSum () {
            let value = 0;
            this.incomesItemized.forEach(income => {
                let untaxable = income.exemptions.reduce((acc, e) => acc + e.value, 0);
                let taxable   = income.value - untaxable;
                value += taxable*(income.tax/100)
            })
            return value;
        },
        exemptionSum () {
            var value = 0;
            this.incomesItemized.forEach(income => {
                value += income.exemptions.reduce((acc, exemp) => acc + exemp.value + exemp.match, 0);
            });
            return value;
        },
        expenseSum () {
            return this.expensesItemized.reduce((acc, expense) => acc + expense.value, 0);
        },
        investmentSum () {
            let value = this.investmentsItemized.reduce((acc, i) => acc + i.value, 0);
            return value + this.exemptionSum;
        },
        unallocatedSum () {
            return this.netSum-this.expenseSum-this.investmentSum;
        },
        chartShowing () {
            return this.investmentSum || this.expenseSum || this.unallocatedSum;
        }
    },
    watch: {
        incomesItemized: function () {
            var $ = global.jQuery;
            $(function () {
              $('[data-toggle="tooltip"]').tooltip()
            })
        }
    }
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
.container-fluid {
    padding:30px 30px 0px 30px;
}

.divider {
    width: calc(100% + 60px);
    margin: 60px 0px 60px -30px;
}

.introjs-tooltiptext div {
    background-image:url('./assets/sankey.png');
    width: 700px;
    background-size: contain;
    min-height: 180px;
    background-repeat: no-repeat;
}

.introjs-tooltip {
    max-width:800px !important;
}
.google-visualization-tooltip {
    display:none;
}

</style>
