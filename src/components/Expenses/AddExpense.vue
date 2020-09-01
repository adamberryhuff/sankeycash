<template>
    <form v-on:keydown.enter.prevent="">
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
                The amount ({{ mode }}) you pay annually for this expense.
            </small>
        </div>
        <br class="mobile-only">

        <!-- Submit button -->
        <button class="btn btn-primary desktop-only" v-on:keyup="processKeyPress" v-on:click.enter.prevent="addExpense">
            {{ submitText }}
        </button>
        <button class="btn btn-primary mobile-only" v-on:keyup="processKeyPress" v-on:click.enter.prevent="addExpense">
            {{ submitText }}
        </button>
        <span v-if="expense">
            <!-- Delete Button -->
            <button class="btn btn-link desktop-only remove-expense" v-on:click.enter.prevent="deleteExpense">Remove Expense</button>
            <button class="btn btn-link mobile-only remove-expense" v-on:click.enter.prevent="deleteExpense">Remove Expense</button>
            <!-- Cancel Button -->
            <button class="btn btn-link desktop-only" v-on:click.enter.prevent="cancelEdit">Cancel Edit</button>
            <button class="btn btn-link mobile-only cancel-btn" v-on:click.enter.prevent="cancelEdit">Cancel Edit</button>
        </span>
    </form>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'AddExpense',
    props: ['unallocatedSum', 'mode', 'expense'],
    data () {
        return {
            // new income stream
            label: '',
            value: '',
        }
    },
    methods: {
        addExpense: function (e) {
            if (e) e.preventDefault();
            this.value = parseInt(this.value);

            // validate
            if (isNaN(this.value) || this.value < 0) {
                alert('Expense amount must be a positive number!');
                return;
            }

            // make sure it's in the budget but take into account edit mode
            var difstr = this.expense ? 'difference ' : '';
            var value  = this.expense ? this.value - this.expense.value : this.value;
            if (value > this.unallocatedSum) {
                alert(
                    `Expense ${difstr}must be less than your available budget of ${util.formatMoney(this.unallocatedSum, this.mode)}`
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
        cancelEdit: function () {
            this.$emit('editExpense', false);
        },
        deleteExpense: function () {
            if (confirm("Are you sure you want to remove this expense?")) {
                this.$emit('deleteExpense');
            }
        },
        focusNewExpense: function () {
            document.getElementById('new-expense-focus').focus();
        },
        processKeyPress: function (event) {
            if (event.keyCode == 13) this.addExpense();
        }
    },
    computed: {
        submitText: function () {
            return this.expense ? 'Update Expense' : 'Add Expense';
        }
    },
    watch: {
        expense: function () {
            this.value = this.expense ? this.expense.value : '';
            this.label = this.expense ? this.expense.label : '';
        }
    }
}

</script>

<style SCOPED>

.btn.btn-primary.mobile-only {
    width:100%;
}

.btn.desktop-only {
    float: right;
}

.btn.btn-primary.desktop-only {
    margin-left: .5rem;
}

.btn.mobile-only.cancel-btn {
    float:right;
}

.remove-expense {
    color: red;
}

</style>