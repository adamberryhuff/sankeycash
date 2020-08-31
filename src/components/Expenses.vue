<template>
    <div class="row">
        <!-- title -->
        <div class="col-md-12">
            <h2>
                <span v-intro="'In the Expenses section you can add your expected expenses such as mortgage payments, rent, and other living expenses.'" v-intro-step="3">
                    Expenses
                </span>
            </h2>
            <p>Input your annual expenses. You have <span class="budget-inline">{{ util.formatMoney(unallocatedSum, mode) }}</span> available in your budget.</p>
        </div>

        <div class="col-md-6">
            <AddExpense
                :unallocatedSum="unallocatedSum"
                :mode="mode"
                @addExpense="addExpense" />
        </div>
        <div class="col-sm-12 mobile-only">
            <hr class="lr-break">
        </div>
        <div class="col-md-6">
            <ViewExpenses
                :expensesItemized="expensesItemized"
                :netSum="netSum"
                :expenseSum="expenseSum"
                :unallocatedSum="unallocatedSum"
                :investmentSum="investmentSum"
                :mode="mode"
                @removeExpense="deleteExpense" />
        </div>
    </div>
</template>

<script>
import util from '../util.js';
import AddExpense from './Expenses/AddExpense.vue';
import ViewExpenses from './Expenses/ViewExpenses.vue';

export default {
    name: 'Expenses',
    props: [
        'expensesItemized', 'netSum', 'expenseSum', 'unallocatedSum', 'investmentSum', 'mode'
    ],
    components: {
        AddExpense,
        ViewExpenses
    },
    data () {
        return {
            util: util
        }
    },
    methods: {
        deleteExpense: function (idx) {
            this.$emit('removeExpense', idx);
        },
        addExpense: function (expense) {
            this.$emit('addExpense', expense);
        }
    }
}

</script>

<style scoped>
.budget-inline {
    color: #28A745;
}
</style>