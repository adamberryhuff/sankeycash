<template>
    <form v-on:keydown.enter.prevent="">
        <!-- investment label -->
        <div class="form-group">
            <label>{{ $t('common.chart_label') }}</label>
            <input id="new-investment-focus" v-model="label" type="text" class="form-control" :placeholder="$t('common.label')" v-on:keyup.enter="addInvestment()">
            <small class="form-text text-muted">
                {{ $t('investments.chart_label_examples') }}
            </small>
        </div>

        <!-- investment amount -->
        <div class="form-group">
            <label>{{ $t('common.amount') }}</label>
            <input id="new-investment" type="number" class="form-control" min="1" v-model="value" :placeholder="$t('common.amount')" v-on:keyup.enter="addInvestment()">
            <small class="form-text text-muted">
                {{ amountExamples }}
            </small>
        </div>

        <!-- desktop buttons: save, cancel -->
        <div class="desktop-only-inline">
            <button v-if="investment" class="btn btn-link" v-on:keyup.enter="cancelEdit()" v-on:click.enter.prevent="cancelEdit">
                {{ $t('common.cancel') }}
            </button>
            <button class="btn btn-primary" v-on:keyup.enter="addInvestment()" v-on:click.enter.prevent="addInvestment">
                {{ submitText }}
            </button>
        </div>

        <!-- mobile buttons: save, cancel -->
        <div class="mobile-only row">
            <br>
            <button class="btn btn-primary col-sm-12" v-on:keyup.enter="addInvestment()" v-on:click.enter.prevent="addInvestment">
                {{ submitText }}
            </button>
            <button v-if="investment" class="btn btn-outline-primary col-sm-12" v-on:keyup.enter="cancelEdit()" v-on:click.enter.prevent="cancelEdit">
                {{ $t('common.cancel') }}
            </button>
        </div>
    </form>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'AddInvestment',
    props: ['unallocatedSum', 'mode', 'investment', 'timeline'],
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
        populateInvestment: function () {
            this.value = this.unallocatedSum;
        },
        focusNewInvestment: function () {
            document.getElementById('new-investment-focus').focus();
        },
    },
    computed: {
        submitText: function () {
            return this.investment ? this.$t('investments.update') : this.$t('investments.add');
        },
        amountExamples: function () {
            var timeline = this.timeline == 'annual' ? 'common.annual' : 'common.monthly';
            return this.$t('investments.amount_examples', {
                mode: this.mode ,
                timeline: this.$t(timeline)
            });
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


.desktop-only-inline {
    float: right;
    margin-top: calc(30px - 1rem);
}

.desktop-only-inline .remove-expense {
    padding-left:5px;
    padding-right:17px;
    color:red;
}

.btn-outline-danger {
    margin-top:5px;
}

.btn-outline-primary {
    margin-top:5px;
}


</style>