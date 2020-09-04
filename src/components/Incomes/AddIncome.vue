<template>
    <form v-on:keydown.enter.prevent="">
        <!-- income stream label -->
        <div class="form-group">
            <label>{{ $t('common.chart_label') }}</label>
            <input id="new-income-focus" v-model="label" type="text" class="form-control" :placeholder="$t('common.label')" name="income-stream-label">
            <small class="form-text text-muted">
                {{ $t('incomes.chart_label_examples') }}
            </small>
        </div>

        <!-- income stream amount -->
        <div class="form-group">
            <label>{{ $t('common.gross_amount') }}</label>
            <input type="number" class="form-control" min="1" v-model="value" :placeholder="$t('common.amount')" v-on:keyup="processKeyPress">
            <small class="form-text text-muted">
                {{ $t('incomes.gross_amount_examples', { mode: mode }) }}
            </small>
        </div>

        <!-- income stream tax rate -->
        <div class="form-group">
            <label>{{ $t('common.tax_rate') }}</label>
            <input type="number" class="form-control" step=".001" min="1" max="100" v-model="tax" :placeholder="$t('common.tax')" v-on:keyup="processKeyPress">
            <small class="form-text text-muted">
                {{ $t('incomes.tax_rate_examples') }}
            </small>
        </div>

        <!-- exemptions question -->
        {{ $t('incomes.exemptions_question') }}
        <AddIncomeExemption
            :exemptions="exemptions"
            :mode="mode"
            @addIncome="addIncome"
            @addExemption="addExemption"
            @removeExemption="removeExemption"
            @clearExemptions="clearExemptions" />
        <br>

        <!-- deductions question -->
        {{ $t('incomes.deductions_question') }}
        <AddIncomeDeduction
            :deductions="deductions"
            :mode="mode"
            @addIncome="addIncome"
            @addDeduction="addDeduction"
            @removeDeduction="removeDeduction"
            @clearDeductions="clearDeductions" />

        <!-- desktop buttons: save, delete, cancel -->
        <div class="desktop-only-inline">
            <button class="btn btn-primary float-right" v-on:keyup="processKeyPress" v-on:click.enter.prevent="addIncome">
                {{ income ? $t('incomes.update') : $t('incomes.add') }}
            </button>
            <button v-if="income" class="btn btn-link" v-on:click.enter.prevent="cancelEditIncome">
                {{ $t('common.cancel') }}
            </button>
            <button v-if="income" class="btn btn-link remove-expense" v-on:click.enter.prevent="deleteIncome">
                {{ $t('common.delete') }}
            </button>
        </div>

        <!-- mobile buttons: save, delete, cancel -->
        <div class="mobile-only row">
            <br>
            <button class="btn btn-primary col-sm-12" v-on:keyup="processKeyPress" v-on:click.enter.prevent="addIncome">
                {{ income ? $t('incomes.update') : $t('incomes.add') }}
            </button>
            <button v-if="income" class="btn btn-outline-primary col-sm-12" v-on:click.enter.prevent="cancelEditIncome">
                {{ $t('common.cancel') }}
            </button>
            <button v-if="income" class="btn btn-outline-danger col-sm-12" v-on:click.enter.prevent="deleteIncome">
                {{ $t('common.delete') }}
            </button>
        </div>
    </form>
</template>


<script>

import AddIncomeExemption from './AddIncomeExemption.vue';
import AddIncomeDeduction from './AddIncomeDeduction.vue';
import util from '../../util.js';

export default {
    name: 'AddIncome',
    props: ['income', 'mode', 'unallocatedSum'],
    components: {
        AddIncomeExemption,
        AddIncomeDeduction
    },
    data () {
        return {
            // new income stream
            label: '',
            value: '',
            tax:   '',
            exemptions: [],
            deductions: [],

            util: util
        }
    },
    mounted () {
        this.initNewIncome();
    },
    methods: {
        addIncome: function (e) {
            if (e) e.preventDefault();
            this.normalizeIncome();
            this.normalizeExemptions();
            this.normalizeDeductions();
            if (!this.validateIncome()) return;
            this.validateExemptions();
            this.validateDeductions();

            // exemptions + deductions > income
            let tax_free = this.exemptions.reduce((a, e) => a + e.value, 0);
            tax_free = this.deductions.reduce((a, d) => a + d.value, tax_free);
            if (tax_free > this.value) {
                alert(this.$t('incomes.pretax_error'));
                return false;
            }

            // add
            this.$emit('addIncome', {
                label: this.label,
                tax: this.tax,
                value: this.value,
                exemptions: this.exemptions,
                deductions: this.deductions
            });

            this.initNewIncome();
        },
        normalizeIncome: function () {
            this.tax   = parseInt(this.tax);
            this.value = parseInt(this.value);
        },
        validateIncome: function () {
            // do we have budget to edit this income when lowering the income value?
            if (this.income) {
                let income = JSON.parse(JSON.stringify(this.income));
                income.value = this.value;
                var diff = util.getNet(this.income) - util.getNet(income);
                if (diff > this.unallocatedSum) {
                    alert(this.$t('incomes.reduction_error', {
                        required_total: util.formatMoney(diff, this.mode),
                        required_additional: util.formatMoney(diff-this.unallocatedSum, this.mode)
                    }));
                    return false;
                }
            }

            // validate label, tax, and value
            if (this.label == '') {
                alert(this.$t('incomes.label_error'));
                return false;
            }
            if (isNaN(this.tax) || this.tax < 1 || this.tax > 100) {
                alert(this.$t('incomes.tax_error'));
                return false;
            }
            if (isNaN(this.value) || this.value <= 0) {
                alert(this.$t('incomes.value_error'));
                return false;
            }
            return true;
        },
        cancelEditIncome: function () {
            this.$emit('editIncome', false);
        },
        deleteIncome: function () {
            let net = util.getNet(this.income);
            net = net - this.income.exemptions.reduce((a, e) => a + e.value + e.match, 0);
            if (net > this.unallocatedSum) {
                alert(this.$t('incomes.deletion_error', {
                    required_total: util.formatMoney(net, this.mode),
                    required_additional: util.formatMoney(net-this.unallocatedSum, this.mode)
                }));
                return;
            }
            if (confirm(this.$t('incomes.deletion_confirmation'))) {
                this.$emit('deleteIncome');
            }
        },
        /************************************************************
         * EXEMPTIONS
         ************************************************************/
        addExemption: function () {
            this.exemptions.push({
                label: '',
                value: '',
                match: '',
                value_mode: 'currency',
                match_mode: 'currency'
            });
        },
        removeExemption: function (idx) {
            var empty = !this.exemptions[idx].label;
            empty = empty && !this.exemptions[idx].value;
            empty = empty && !this.exemptions[idx].match;
            if (empty || confirm(this.$t('incomes.exemption_confirmation'))) {
                this.exemptions.splice(idx, 1);
            }
        },
        clearExemptions: function () {
            this.exemptions = [];
        },
        // convert % contribution and match to $
        normalizeExemptions: function () {
            for (var key in this.exemptions) {
                let exemption = this.exemptions[key];
                if (exemption.value_mode == 'percent') {
                    exemption.value      = this.value * exemption.value / 100;
                    exemption.value_mode = 'currency';
                }
                if (exemption.match_mode == 'percent') {
                    exemption.match      = this.value * exemption.match / 100;
                    exemption.match_mode = 'currency';
                }
            }
        },
        validateExemptions: function () {
            this.exemptions.forEach(exemption => {
                exemption.value = parseInt(exemption.value);
                if (isNaN(exemption.value) || exemption.value < 0) {
                    alert(this.$t('incomes.exemption_value_error'));
                    throw this.$t('incomes.exemption_value_error');
                }
                exemption.match = parseInt(exemption.match);
                if (isNaN(exemption.match) || exemption.match < 0) {
                    alert(this.$t('incomes.exemption_match_error'));
                    throw this.$t('incomes.exemption_match_error');
                }
            })
        },
        /************************************************************
         * DEDUCTIONS
         ************************************************************/
        addDeduction: function () {
            this.deductions.push({
                label: '',
                value: '',
                value_mode: 'currency',
            });
        },
        removeDeduction: function (idx) {
            var empty = !this.deductions[idx].label && !this.deductions[idx].value;
            if (empty || confirm(this.$t('incomes.deduction_confirmation'))) {
                this.deductions.splice(idx, 1);
            }
        },
        clearDeductions: function () {
            this.deductions = [];
        },
        // convert % deductions to $
        normalizeDeductions: function () {
            for (var key in this.deductions) {
                let deduction = this.deductions[key];
                if (deduction.value_mode == 'percent') {
                    deduction.value      = this.value * deduction.value / 100;
                    deduction.value_mode = 'currency';
                }
            }
        },
        validateDeductions: function () {
            this.deductions.forEach(deduction => {
                deduction.value = parseInt(deduction.value);
                if (isNaN(deduction.value) || deduction.value < 0) {
                    alert(this.$t('incomes.deduction_value_error'));
                    throw this.$t('incomes.deduction_value_error');
                }
            })
        },
        /************************************************************
         * UTIL
         ************************************************************/
        initNewIncome: function () {
            this.label      = '';
            this.tax        = '';
            this.value      = '';
            this.exemptions = [];
            this.deductions = [];
            document.getElementById('new-income-focus').focus();
        },
        processKeyPress: function (event) {
            if (event.keyCode == 13) this.addIncome();
        }
    },
    watch: {
        // set local scope values if someone clicks edit income
        income: function () {
            this.value      = this.income ? this.income.value : '';
            this.label      = this.income ? this.income.label : '';
            this.tax        = this.income ? this.income.tax : '';
            this.exemptions = this.income ? this.income.exemptions : [];
            this.deductions = this.income ? this.income.deductions : [];
            if (this.exemptions.length) {
                this.exemptions = JSON.parse(JSON.stringify(this.exemptions));
            }
            if (this.deductions.length) {
                this.deductions = JSON.parse(JSON.stringify(this.deductions));
            }
        }
    }
}

</script>


<style scoped>

.desktop-only-inline {
    float: right;
    margin-top:30px;
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