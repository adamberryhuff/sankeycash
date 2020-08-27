<template>
    <div class="row">

        <!-- income streams title -->
        <div class="col-md-12">
            <h2>
                <span v-intro="'In the Investments section you can add your expected investment contribtions. The pre-tax contributions you entered in the Income Streams section will automatically show up here.'" v-intro-step="4">
                    Investments
                </span>
            </h2>
            <p>
                Input your annual post-tax investment contributions. You have <span class="budget-inline" v-on:click="populateInvestment()">{{ util.formatMoney(unallocatedSum) }}</span> available in your budget.
            </p>
        </div>

        <!-- add investments -->
        <div class="col-md-6">
            <AddInvestment
                ref="add"
                :unallocatedSum="unallocatedSum"
                @addInvestment="addInvestment" />
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
                @removeInvestment="removeInvestment"
                @populateInvestment="populateInvestment" />
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
        'unallocatedSum', 'netSum', 'investmentSum', 'expenseSum'
    ],
    data () {
        return {
            util: util
        }
    },
    components: {
        ViewInvesments,
        AddInvestment
    },
    methods: {
        removeInvestment: function (idx) {
            this.$emit('removeInvestment', idx);
        },
        addInvestment: function (investment) {
            this.$emit('addInvestment', investment);
        },
        populateInvestment: function () {
            this.$refs.add.populateInvestment();
        }
    }
}

</script>

<style scoped>
.budget-inline {
    color: #28A745;
}

</style>