<template>
    <div>
        <!-- expense label -->
        <div class="form-group">
            <label>Chart Label</label>
            <input v-model="label" type="text" class="form-control" placeholder="Label">
            <small class="form-text text-muted">
                The label will be used in the chart: Mortgage, Living Expenses, Car Payment, etc.
            </small>
        </div>

        <!-- income stream amount -->
        <div class="form-group">
            <label>Amount</label>
            <input type="number" class="form-control" min="1" v-model="value" placeholder="Amount">
            <small class="form-text text-muted">
                The amount you pay annually to this expense.
            </small>
        </div>

        <button type="submit" class="btn btn-primary float-right" v-on:click="addExpense()">
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
            // validate
            this.value = parseInt(this.value);
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
        }
    }
}

</script>