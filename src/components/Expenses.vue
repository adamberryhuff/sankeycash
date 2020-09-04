<template>
    <div class="row">
        <!-- title -->
        <div class="col-md-12">
            <h2>
                <span v-intro="$t('expenses.instructions')" v-intro-step="3">
                    {{ $t('common.expenses') }}
                </span>
            </h2>
            <p>
                {{ $t('expenses.title') }} {{ $t('common.remaining_budget') }}
                <span class="budget-inline">
                    {{ util.formatMoney(unallocatedSum, mode) }}
                </span>
            </p>
        </div>

        <div class="col-md-6">
            <AddExpense
                :unallocatedSum="unallocatedSum"
                :mode="mode"
                :expense="expense"
                @deleteExpense="deleteExpense"
                @editExpense="editExpense"
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
                @editExpense="editExpense" />
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
            util: util,
            idx: false
        }
    },
    methods: {
        deleteExpense: function () {
            this.$emit('removeExpense', this.idx);
            this.idx = false;
        },
        editExpense: function (idx) {
            this.idx = idx;
        },
        addExpense: function (expense) {
            expense.idx = this.idx;
            this.$emit('addExpense', expense);
            this.idx = false;
        }
    },
    computed: {
        expense: function () {
            let expense = this.expensesItemized[this.idx];
            return expense ? JSON.parse(JSON.stringify(expense)) : expense;
        },
    }
}

</script>

<style scoped>
.budget-inline {
    color: #28A745;
}
</style>