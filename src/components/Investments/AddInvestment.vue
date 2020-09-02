<template>
    <form v-on:keydown.enter.prevent="">
        <!-- investment label -->
        <div class="form-group">
            <label>{{ $t('common.chart_label') }}</label>
            <input id="new-investment-focus" v-model="label" type="text" class="form-control" :placeholder="$t('common.label')">
            <small class="form-text text-muted">
                {{ $t('investments.chart_label_examples') }}
            </small>
        </div>

        <!-- investment amount -->
        <div class="form-group">
            <label>{{ $t('common.amount') }}</label>
            <input id="new-investment" type="number" class="form-control" min="1" v-model="value" :placeholder="$t('common.amount')" v-on:keyup="processKeyPress">
            <small class="form-text text-muted">
                {{ $t('investments.amount_examples', {mode: mode}) }}
            </small>
        </div>
        <br class="mobile-only">

        <button class="btn btn-primary desktop-only" v-on:click.enter.prevent="addInvestment" v-on:keyup="processKeyPress">
            {{ submitText }}
        </button>
        <button class="btn btn-primary mobile-only" v-on:click.enter.prevent="addInvestment" v-on:keyup="processKeyPress">
            {{ submitText }}
        </button>
        <span v-if="investment">
            <!-- Delete Button -->
            <button class="btn btn-link desktop-only remove-expense" v-on:click.enter.prevent="deleteInvestment">{{ $t('common.delete') }}</button>
            <button class="btn btn-link mobile-only remove-expense" v-on:click.enter.prevent="deleteInvestment">{{ $t('common.delete') }}</button>
            <!-- Cancel Button -->
            <button class="btn btn-link desktop-only" v-on:click.enter.prevent="cancelEdit">{{ $t('common.cancel') }}</button>
            <button class="btn btn-link mobile-only cancel-btn" v-on:click.enter.prevent="cancelEdit">{{ $t('common.cancel') }}</button>
        </span>
    </form>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'AddInvestment',
    props: ['unallocatedSum', 'mode', 'investment'],
    data () {
        return {
            // new investment
            label: '',
            value: '',
        }
    },
    methods: {
        addInvestment: function (e) {
            if (e) e.preventDefault();
            this.value = parseInt(this.value);

            // validate
            if (isNaN(this.value) || this.value < 0) {
                alert(this.$t('investments.value_error'));
                return;
            }

            // make sure it's in the budget but take into account edit mode
            var err   = this.investment ? 'difference_error_edit' : 'difference_error_add';
            var value = this.investment ? this.value - this.investment.value : this.value;
            if (value > this.unallocatedSum) {
                var error = this.$t(`investments.${err}`, {
                    budget: util.formatMoney(this.unallocatedSum, this.mode)
                });
                alert(error);
                return;
            }

            // emit
            this.$emit('addInvestment', {
                label: this.label,
                value: this.value
            });

            // reset
            this.label = '';
            this.value = '';

            this.focusNewInvestment();
        },
        cancelEdit: function () {
            this.$emit('editInvestment', false);
        },
        deleteInvestment: function () {
            if (confirm(this.$t('investments.delete_confirmation'))) {
                this.$emit('removeInvestment');
            }
        },
        populateInvestment: function () {
            this.value = this.unallocatedSum;
        },
        focusNewInvestment: function () {
            document.getElementById('new-investment-focus').focus();
        },
        processKeyPress: function (event) {
            if (event.keyCode == 13) this.addInvestment();
        }
    },
    computed: {
        submitText: function () {
            return this.investment ? this.$t('investments.update') : this.$t('investments.add');
        }
    },
    watch: {
        investment: function () {
            this.value = this.investment ? this.investment.value : '';
            this.label = this.investment ? this.investment.label : '';
        }
    }
}

</script>

<style scoped>

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