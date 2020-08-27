<template>
    <div>

        <!-- expenses label -->
        <label>Expenses</label>

        <!-- expenses: net - expenses = savings -->
        <span class="float-right net-income">
            <span class="badge badge-success badge-pill net-income-badge clickable" data-toggle="tooltip" data-placement="top" :title="budgetTooltip">
                Unallocated: {{ util.formatMoney(unallocatedSum) }}
                <span class="fa fa-question-circle"></span>
            </span>
            <span class="badge badge-success badge-pill net-income-badge clickable" data-toggle="tooltip" data-placement="top" :title="expenseTooltip">
                Expenses: {{ util.formatMoney(expenseSum) }}
                <span class="fa fa-question-circle"></span>
            </span>
        </span>

        <ul class="list-group">

            <!-- no expenses -->
            <li class="list-group-item d-flex justify-content-between align-items-center disabled" v-if="!expensesItemized.length">
                You haven't added any expenses yet.
            </li>

            <!-- expenses -->
            <li class="list-group-item d-flex justify-content-between align-items-center clickable" v-for="(expense, idx) in expensesItemized" v-bind:key="idx" v-on:click="removeExpense(idx)">
                <div class="row no-gutters income-display">
                    <div class="col-md-4">
                        <span id="label">{{ expense.label }}</span>
                    </div>
                    <div class="col-md-8">
                        <span class="badge badge-secondary badge-pill">
                            {{ util.formatMoney(expense.value) }}
                        </span>
                    </div>
                </div>
            </li>
        </ul>
        <small class="form-text text-muted">
            Click on an expense to remove it.
        </small>
    </div>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'ViewExpenses',
    props: ['expensesItemized', 'netSum', 'expenseSum', 'unallocatedSum', 'investmentSum'],
    data () {
        return {
            util: util,
        }
    },
    methods: {
        removeExpense: function (idx) {
            if (confirm("Are you sure you want to remove this expense?")) {
                this.$emit('removeExpense', idx);
            }
        }
    },
    computed: {
        budgetTooltip () {
            var tip = `Budget (${util.formatMoney(this.unallocatedSum)}) = `;
            tip += `Net Income (${util.formatMoney(this.netSum)}) - `;
            tip += `Expenses (${util.formatMoney(this.expenseSum)}) - `;
            tip += `Investments (${util.formatMoney(this.investmentSum)})`;
            return tip;
        },
        expenseTooltip () {
            var tip = `Expenses (${util.formatMoney(this.expenseSum)}) = `;
            this.expensesItemized.forEach(expense => {
                tip += `${expense.label} (${util.formatMoney(expense.value)}) + `;
            })
            return tip.substring(0, tip.length-2);
        }
    }
}

</script>


<style scoped>
.clickable {
    cursor:pointer
}
.badge {
    float:right;
    margin:2px;
}
.income-display {
    width:100%;
}
.net-income {
    padding-right: 1.25rem;
}
.net-income-badge {
    float:initial;
}
</style>