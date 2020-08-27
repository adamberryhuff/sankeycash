<template>
    <div class="row">
        <!-- income streams title -->
        <div class="col-md-12">
            <h2>
                <span v-intro="'In the Income Streams section you can add your streams of income including tax rates and the tax-exempt investment account like your 401k.'" v-intro-step="2">
                    Income Streams
                </span>
            </h2>
            <p>Input your annual income stream(s) and the tax rate you expect to pay.</p>
        </div>

        <!-- add income stream -->
        <div class="col-md-6">
            <AddIncome @addIncome="newIncome" />
        </div>

        <!-- view income streams -->
        <div class="col-md-6">
            <ViewIncomes
                :incomesItemized="incomesItemized"
                :unallocatedSum="unallocatedSum"
                :grossSum="grossSum"
                :taxSum="taxSum"
                :netSum="netSum"
                @removeIncome="deleteIncome" />
        </div>
    </div>
</template>

<script>

import AddIncome from './Incomes/AddIncome.vue';
import ViewIncomes from './Incomes/ViewIncomes.vue';

export default {
    name: 'Incomes',
    props: ['incomesItemized', 'unallocatedSum', 'grossSum', 'netSum', 'taxSum'],
    components: {
        AddIncome,
        ViewIncomes
    },
    methods: {
        newIncome: function (income) {
            this.$emit('addIncome', income);
        },
        deleteIncome: function (idx) {
            this.$emit('removeIncome', idx);
        },
    },
}

</script>