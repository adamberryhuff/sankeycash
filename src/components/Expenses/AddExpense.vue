<template>
    <div>
        <!-- expense label -->
        <div class="form-group">
            <label>Chart Label</label>
            <input id="new-expense-focus" v-model="label" type="text" class="form-control" placeholder="Label">
            <small class="form-text text-muted">
                The label will be used in the chart: Mortgage, Living Expenses, Car Payment, etc.
            </small>
        </div>

        <!-- income stream amount -->
        <div class="form-group">
            <label>Amount</label>
            <input type="number" class="form-control" min="1" v-model="value" placeholder="Amount" v-on:keyup="processKeyPress">
            <small class="form-text text-muted">
                The amount you pay annually to this expense.
            </small>
        </div>

        <button class="btn btn-primary float-right" v-on:click="addExpense()">
            Add Expense
        </button>
    </div>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'AddExpense',
    props: ['unallocatedSum'],
    data () {
        return {
            // new income stream
            label: '',
            value: '',
        }
    },
    methods: {
        addExpense: function () {
            this.value = parseInt(this.value);

            // validate
            if (isNaN(this.value) || this.value < 0) {
                alert('Expense amount must be a positive number!');
                return;
            }
            if (this.value > this.unallocatedSum) {
                alert(
                    `Expense must be less than your available budget of ${util.formatMoney(this.unallocatedSum)}`
                );
                return;
            }

            // emit
            this.$emit('addExpense', {
                label: this.label,
                value: this.value
            });

            // reset
            this.label = '';
            this.value = '';

            this.focusNewExpense();
        },
        focusNewExpense: function () {
            document.getElementById('new-expense-focus').focus();
        },
        processKeyPress: function (event) {
            if (event.keyCode == 13) this.addExpense();
        }
    }
}

</script>