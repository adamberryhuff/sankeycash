<template>
    <div>
        <div class="row">
            <div class="col-md-12">
                <!-- expenses label -->
                <label>{{ $t('common.expenses') }}</label>

                <!-- expenses: net - expenses = savings -->
                <span class="float-right net-income">
                    <span class="badge badge-success net-income-badge clickable" data-toggle="tooltip" data-placement="top" :title="budgetTooltip">
                        {{ $t('common.unallocated') }}<span class="desktop-only-inline">: {{ util.formatMoney(unallocatedSum, mode) }}</span>
                        &nbsp;<span class="fa fa-question-circle"></span>
                    </span>
                    <span class="badge badge-success net-income-badge clickable pad" data-toggle="tooltip" data-placement="top" :title="expenseTooltip">
                        {{ $t('common.expenses') }}<span class="desktop-only-inline">: {{ util.formatMoney(expenseSum, mode) }}</span>
                        &nbsp;<span class="fa fa-question-circle"></span>
                    </span>
                </span>
            </div>
        </div>

        <ul class="list-group">

            <!-- no expenses -->
            <li class="list-group-item d-flex justify-content-between align-items-center disabled" v-if="!expensesItemized.length">
                {{ $t('expenses.no_expenses') }}
            </li>

            <!-- expenses -->
            <li class="list-group-item d-flex justify-content-between align-items-center clickable" v-for="(expense, idx) in expensesItemized" v-bind:key="idx">
                <div class="row no-gutters income-display">
                    <div class="col-md-4 left-side">
                        <span id="label">{{ expense.label }}</span>
                        <span class="view-edit-container">
                            <button type="button" class="btn btn-link view-breakdown" v-on:click="editExpense(idx)">
                                {{ $t('common.edit') }}
                            </button>&nbsp;
                            |
                            <button type="button" class="btn btn-link view-breakdown" v-on:click="deleteExpense(idx)">
                                {{ $t('common.delete') }}
                            </button>
                        </span>
                    </div>
                    <div class="col-md-8">
                        <span class="badge badge-secondary">
                            {{ util.formatMoney(expense.value, mode) }}
                        </span>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'ViewExpenses',
    props: [
        'expensesItemized', 'netSum', 'expenseSum', 'unallocatedSum', 'investmentSum', 'mode'
    ],
    data () {
        return {
            util: util,
        }
    },
    methods: {
        editExpense: function (idx) {
            this.$emit('editExpense', idx);
        },
        deleteExpense: function (idx) {
            this.$emit('deleteExpense', idx);
        }
    },
    computed: {
        budgetTooltip () {
            var tip = `${this.$t('common.budget')} `;
            tip += `(${util.formatMoney(this.unallocatedSum, this.mode)}) = `;
            tip += `${this.$t('common.net')} (${util.formatMoney(this.netSum, this.mode)}) - `;
            tip += `${this.$t('common.expenses')} `;
            tip += `(${util.formatMoney(this.expenseSum, this.mode)}) - `;
            tip += `${this.$t('common.investments')} `;
            tip += `(${util.formatMoney(this.investmentSum, this.mode)})`;
            return tip;
        },
        expenseTooltip () {
            var tip = `${this.$t('common.expenses')} `;
            tip += `(${util.formatMoney(this.expenseSum, this.mode)}) = `;
            this.expensesItemized.forEach(expense => {
                tip += `${expense.label} (${util.formatMoney(expense.value, this.mode)}) + `;
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
.net-income-badge {
    float:initial;
}
.net-income {
    margin-bottom:0.5rem;
}
@media only screen and (min-width: 540px) {
    .pad {
        margin-right: calc(0.25rem + 15px);
    }
}

.view-breakdown {
    cursor: pointer;
    text-decoration: none;
    background-color: transparent;
    padding: 0px;
    border: 0px;
    color: #007bff;
    font-size: 12px;
    font-weight: 400;
}

.view-edit-container {
    font-size: 12px;
    font-weight: 400;
}

@media only screen and (min-width: 540px) {
    .left-side {
        min-height:62px;
    }

    .view-edit-container {
        position:absolute;
        bottom:0px;
        left: 0px;
    }
}

@media only screen and (max-width: 540px) {
    .view-edit-container {
        float:right;
    }
}


</style>