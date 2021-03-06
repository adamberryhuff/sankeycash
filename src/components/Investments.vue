<template>
    <div class="row">

        <!-- income streams title -->
        <div class="col-md-12">
            <h2>
                <span id="investments-label">
                    {{ $t('common.investments') }}
                </span>
            </h2>
            <p>
                {{ title }} {{ $t('common.remaining_budget') }}
                <span class="budget-inline" v-on:click="populateInvestment()">
                    {{ util.formatMoney(unallocatedSum, mode) }}
                </span>
            </p>
        </div>

        <!-- add investments -->
        <div class="col-md-6">
            <AddInvestment
                ref="add"
                :unallocatedSum="unallocatedSum"
                :mode="mode"
                :timeline="timeline"
                :investment="investment"
                @addInvestment="addInvestment"
                @editInvestment="editInvestment" />
        </div>
        <div class="col-sm-12 mobile-only">
            <hr class="lr-break">
        </div>

        <!-- view investments -->
        <div class="col-md-6">
            <ViewInvesments
                :investmentsItemized="investmentsItemized"
                :incomesItemized="incomesItemized"
                :netSum="netSum"
                :expenseSum="expenseSum"
                :unallocatedSum="unallocatedSum"
                :investmentSum="investmentSum"
                :mode="mode"
                @populateInvestment="populateInvestment"
                @editInvestment="editInvestment"
                @deleteInvestment="deleteInvestment" />
        </div>
    </div>
</template>

<script>

import ViewInvesments from './Investments/ViewInvestments.vue';
import AddInvestment from './Investments/AddInvestment.vue';
import util from '../util.js';

export default {
    name: 'Investments',
    props: [
        'investmentsItemized', 'incomesItemized',
        'unallocatedSum', 'netSum', 'investmentSum', 'expenseSum',
        'mode', 'timeline'
    ],
    data () {
        return {
            util: util,
            idx: false
        }
    },
    components: {
        ViewInvesments,
        AddInvestment
    },
    methods: {
        deleteInvestment: function (idx) {
            if (confirm(this.$t('investments.delete_confirmation'))) {
                this.$emit('removeInvestment', idx);
            }
        },
        editInvestment: function (idx) {
            this.idx = idx;
        },
        addInvestment: function (investment) {
            investment.idx = this.idx;
            this.$emit('addInvestment', investment);
            this.idx = false;
        },
        populateInvestment: function () {
            this.$refs.add.populateInvestment();
        }
    },
    computed: {
        investment: function () {
            let investment = this.investmentsItemized[this.idx];
            return investment ? JSON.parse(JSON.stringify(investment)) : investment;
        },
        title: function () {
            var timeline = this.timeline == 'annual' ? 'common.annual' : 'common.monthly';
            return this.$t('investments.title', { timeline: this.$t(timeline) })
        }
    }
}

</script>

<style scoped>
.budget-inline {
    color: #28A745;
}

</style>