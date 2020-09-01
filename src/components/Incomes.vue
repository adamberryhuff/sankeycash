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
        <div class="col-md-6 col-sm-12">
            <AddIncome
                :income="income"
                :mode="mode"
                :unallocatedSum="unallocatedSum"
                @addIncome="addIncome"
                @editIncome="editIncome"
                @deleteIncome="deleteIncome" />
        </div>

        <div class="col-sm-12 mobile-only">
            <hr class="lr-break">
        </div>

        <!-- view income streams -->
        <div class="col-md-6 col-sm-12">
            <ViewIncomes
                :incomesItemized="incomesItemized"
                :grossSum="grossSum"
                :taxSum="taxSum"
                :netSum="netSum"
                :mode="mode"
                @editIncome="editIncome" />
        </div>
    </div>
</template>

<script>

import AddIncome from './Incomes/AddIncome.vue';
import ViewIncomes from './Incomes/ViewIncomes.vue';

export default {
    name: 'Incomes',
    props: ['incomesItemized', 'unallocatedSum', 'grossSum', 'netSum', 'taxSum', 'mode'],
    components: {
        AddIncome,
        ViewIncomes
    },
    data () {
        return {
            idx: false
        }
    },
    methods: {
        deleteIncome: function () {
            this.$emit('removeIncome', this.idx);
            this.idx = false;
        },
        editIncome: function (idx) {
            this.idx = idx;
        },
        addIncome: function (income) {
            income.idx = this.idx;
            this.$emit('addIncome', income);
            this.idx = false;
        }
    },
    computed: {
        income: function () {
            return this.incomesItemized[this.idx];
        }
    }
}

</script>
