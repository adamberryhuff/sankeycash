<template>
    <div id="app">
        <Toast ref="toast"></Toast>
        <Navbar
            :mode="mode"
            :percent="percent"
            :canvas="canvas"
            :timeline="timeline"
            :chartShowing="chartShowing"
            :itemizedIncomes="incomesItemized"
            :itemizedExpenses="expensesItemized"
            :itemizedInvestments="investmentsItemized"
            @setItemizedInvestments="setItemizedInvestments"
            @setItemizedExpenses="setItemizedExpenses"
            @setItemizedIncomes="setItemizedIncomes"
            @setTimeline="setTimeline"
            @download="download"
            @alert="alert"
            @setMode="setMode"
            @forceRender="forceRender"
            @setPercent="setPercent"
            @setCanvas="setCanvas" />
        <Chart
            ref="chart"
            :chartShowing="chartShowing"
            :itemizedIncomes="incomesItemized"
            :itemizedExpenses="expensesItemized"
            :itemizedInvestments="investmentsItemized"
            :grossSum="grossSum"
            :netSum="netSum"
            :taxSum="taxSum"
            :mode="mode"
            :percent="percent"
            :canvas="canvas"
            :expenseSum="expenseSum"
            :unallocatedSum="unallocatedSum"
            :investmentSum="investmentSum"
            :deductionSum="deductionSum"
            @setPercent="setPercent"
            @setCanvas="setCanvas" />
        <div class="container-fluid">
            <Incomes
                :incomesItemized="incomesItemized"
                :unallocatedSum="unallocatedSum"
                :grossSum="grossSum"
                :netSum="netSum"
                :taxSum="taxSum"
                :timeline="timeline"
                :mode="mode"
                @addIncome="addIncome"
                @removeIncome="removeIncome" />
            <img src="./assets/divider.png" class="divider">
            <Expenses
                :expensesItemized="expensesItemized"
                :netSum="netSum"
                :expenseSum="expenseSum"
                :unallocatedSum="unallocatedSum"
                :investmentSum="investmentSum"
                :timeline="timeline"
                :mode="mode"
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
                :timeline="timeline"
                :mode="mode"
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
            investmentsItemized: [],
            mode: '$',
            timeline: 'annual',
            percent: false,
            canvas: 'small'
        }
    },
    methods: {
        /**
         * Investment Methods
         */
        addIncome: function (income) {
            if (income.idx !== false) {
                this.incomesItemized[income.idx] = income;
                delete this.incomesItemized[income.idx].idx;
                this.$refs.toast.show(this.$t('toasts.income_update'));
            } else {
                this.incomesItemized.push(income);
                this.$refs.toast.show(this.$t('toasts.income_added'));
            }
            this.incomesItemized.sort((a, b) => a.value < b.value);
        },
        removeIncome: function (idx) {
            this.incomesItemized.splice(idx, 1);
            this.incomesItemized.sort((a, b) => a.value < b.value);
            this.$refs.toast.show(this.$t('toasts.income_removed'));
        },
        setItemizedIncomes: function (incomes) {
            incomes.sort((a, b) => a.value < b.value);
            incomes.forEach(income => {
                income.value = parseInt(income.value);
                income.tax   = parseInt(income.tax);
                income.exemptions.forEach(exemption => {
                    exemption.value = parseInt(exemption.value);
                    exemption.match = parseInt(exemption.match);
                });
            });
            Vue.set(this, 'incomesItemized', incomes);
        },

        /**
         * Expense Methods
         */
        addExpense: function (expense) {
            if (expense.idx !== false) {
                this.expensesItemized[expense.idx] = expense;
                delete this.expensesItemized[expense.idx].idx;
                this.$refs.toast.show(this.$t('toasts.expense_update'));
            } else {
                this.expensesItemized.push(expense);
                this.$refs.toast.show(this.$t('toasts.expense_added'));
            }
            this.expensesItemized.sort((a, b) => a.value < b.value);
        },
        removeExpense: function (idx) {
            this.expensesItemized.splice(idx, 1);
            this.expensesItemized.sort((a, b) => a.value < b.value);
            this.$refs.toast.show(this.$t('toasts.expense_removed'));
        },
        setItemizedExpenses: function (expenses) {
            expenses.sort((a, b) => a.value < b.value);
            Vue.set(this, 'expensesItemized', expenses);
        },

        /**
         * Investment Methods
         */
        addInvestment: function (investment) {
            if (investment.idx !== false) {
                this.investmentsItemized[investment.idx] = investment;
                delete this.investmentsItemized[investment.idx].idx;
                this.$refs.toast.show(this.$t('toasts.investment_update'));
            } else {
                this.investmentsItemized.push(investment);
                this.$refs.toast.show(this.$t('toasts.investment_added'));
            }
            this.investmentsItemized.sort((a, b) => a.value < b.value);
        },
        removeInvestment: function (idx) {
            this.investmentsItemized.splice(idx, 1);
            this.investmentsItemized.sort((a, b) => a.value < b.value);
            this.$refs.toast.show(this.$t('toasts.investment_removed'));
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
        },
        setMode: function (mode) {
            this.mode = mode;
        },
        forceRender: function () {
            this.$refs.chart.render();
        },
        setTimeline: function (timeline) {
            // adjust all numbers
            this.incomesItemized.forEach(income => {
                income.value = this.adjustTimeline(income.value, timeline);
                income.exemptions.forEach(exemption => {
                    exemption.value = this.adjustTimeline(exemption.value, timeline);
                    exemption.match = this.adjustTimeline(exemption.match, timeline);
                });
                income.deductions.forEach(deduction => {
                    deduction.value = this.adjustTimeline(deduction.value, timeline);
                })
            });
            this.expensesItemized.forEach(expense => {
                expense.value = this.adjustTimeline(expense.value, timeline);
            });
            this.investmentsItemized.forEach(investment => {
                investment.value = this.adjustTimeline(investment.value, timeline);
            });

            this.timeline = timeline;
        },
        adjustTimeline (amount, new_timeline) {
            if (this.timeline == 'annual' && new_timeline == 'monthly') {
                return amount/12;
            } else if (this.timeline == 'monthly' && new_timeline == 'annual') {
                return amount*12;
            }
        },
        setPercent: function (percent) {
            this.percent = percent;
        },
        setCanvas: function (canvas) {
            this.canvas = canvas;
        }
    },
    computed: {
        grossSum () {
            let value = 0;
            this.incomesItemized.forEach(income => {
                value += income.value;
                income.exemptions.forEach(exemption => {
                    value += exemption.match;
                })
            })
            return value;
        },
        netSum () {
            return this.grossSum-this.taxSum-this.deductionSum;
        },
        taxSum () {
            let value = 0;
            this.incomesItemized.forEach(income => {
                let untaxable = income.exemptions.reduce((a, e) => a + e.value, 0);
                untaxable = income.deductions.reduce((a, d) => a + d.value, untaxable);
                let taxable   = income.value - untaxable;
                value += taxable*(income.tax/100);
            })
            return value;
        },
        deductionSum () {
            var value = 0;
            this.incomesItemized.forEach(income => {
                value += income.deductions.reduce((a, d) => a + d.value, 0);
            });
            return value;
        },
        exemptionSum () {
            var value = 0;
            this.incomesItemized.forEach(income => {
                value += income.exemptions.reduce((a, e) => a + e.value + e.match, 0);
            });
            return value;
        },
        expenseSum () {
            return this.expensesItemized.reduce((a, e) => a + e.value, 0);
        },
        investmentSum () {
            let value = this.investmentsItemized.reduce((a, i) => a + i.value, 0);
            return value + this.exemptionSum;
        },
        unallocatedSum () {
            return this.netSum-this.expenseSum-this.investmentSum;
        },
        chartShowing () {
            return this.investmentSum || this.expenseSum || this.unallocatedSum;
        },
    },
    watch: {
        incomesItemized: function () {
            window.$(function () {
                window.$('[data-toggle="tooltip"]').tooltip('dispose');
                window.$('[data-toggle="tooltip"]').tooltip('enable');
            })
        },
    },
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
}
.container-fluid {
    padding:30px 30px 0px 30px;
}

.divider {
    width: calc(100% + 60px);
    margin: 60px 0px 60px -30px;
}

.introjs-tooltip {
    max-width:800px !important;
}
.google-visualization-tooltip {
    display:none;
}

.mobile-only {
    display:none;
}

@media only screen and (max-width: 540px) {
    .mobile-only {
        display: initial;
    }
}

.desktop-only {
    display:none;
}

.desktop-only-inline {
    display: none;
}

#sankey-test {
    min-width:800px;
}

@media only screen and (min-width: 540px) {
    .desktop-only {
        display: flex;
    }
    .desktop-only-inline {
        display: inline;
    }
}

.lr-break {
    margin: 25px 0px 25px 0px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>
