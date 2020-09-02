<template>
    <form v-on:keydown.enter.prevent="">
        <!-- expense label -->
        <div class="form-group">
            <label>{{ $t('common.chart_label') }}</label>
            <input id="new-expense-focus" v-model="label" type="text" class="form-control" :placeholder="$t('common.label')">
            <small class="form-text text-muted">
                {{ $t('expenses.chart_label_examples') }}
            </small>
        </div>

        <!-- income stream amount -->
        <div class="form-group">
            <label>{{ $t('common.amount') }}</label>
            <input type="number" class="form-control" min="1" v-model="value" :placeholder="$t('common.amount')" v-on:keyup="processKeyPress">
            <small class="form-text text-muted">
                {{ $t('expenses.amount_examples', {mode: mode}) }}
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
            <button class="btn btn-link desktop-only remove-expense" v-on:click.enter.prevent="deleteExpense">{{ $t('common.delete') }}</button>
            <button class="btn btn-link mobile-only remove-expense" v-on:click.enter.prevent="deleteExpense">{{ $t('common.delete') }}</button>
            <!-- Cancel Button -->
            <button class="btn btn-link desktop-only" v-on:click.enter.prevent="cancelEdit">{{ $t('common.cancel') }}</button>
            <button class="btn btn-link mobile-only cancel-btn" v-on:click.enter.prevent="cancelEdit">{{ $t('common.cancel') }}</button>
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
                alert(this.$t('expenses.value_error'));
                return;
            }

            // make sure it's in the budget but take into account edit mode
            var err   = this.expense ? 'difference_error_edit' : 'difference_error_add';
            var value = this.expense ? this.value - this.expense.value : this.value;
            if (value > this.unallocatedSum) {
                var error = this.$t(`expenses.${err}`, {
                    budget: util.formatMoney(this.unallocatedSum, this.mode)
                });
                alert(error);
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
            if (confirm(this.$t('expenses.delete_confirmation'))) {
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
            return this.expense ? this.$t('expenses.update') : this.$t('expenses.add');
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

.desktop-only .remove-expense {
    padding-left:5px;
    padding-right:17px;
}


</style>