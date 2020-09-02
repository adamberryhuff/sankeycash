<template>
    <form v-on:keydown.enter.prevent="">
        <!-- income stream label -->
        <div class="form-group">
            <label>Chart Label</label>
            <input id="new-income-focus" v-model="label" type="text" class="form-control" placeholder="Label" name="income-stream-label">
            <small class="form-text text-muted">
                The label will be used in the chart: Salary, Rental Income, etc.
            </small>
        </div>

        <!-- income stream amount -->
        <div class="form-group">
            <label>Gross Amount</label>
            <input type="number" class="form-control" min="1" v-model="value" placeholder="Amount" v-on:keyup="processKeyPress">
            <small class="form-text text-muted">
                The amount ({{ mode }}) you make annually from this income stream (pre-tax).
            </small>
        </div>

        <!-- income stream tax rate -->
        <div class="form-group">
            <label>Tax Rate</label>
            <input type="number" class="form-control" step=".001" min="1" max="100" v-model="tax" placeholder="Tax" v-on:keyup="processKeyPress">
            <small class="form-text text-muted">
                The tax rate (%) of this income stream.
            </small>
        </div>

        <!-- exemptions question -->
        Does this income stream have any tax-exempt contributions?
        <AddIncomeExemption
            :exemptions="exemptions"
            :mode="mode"
            @addIncome="addIncome"
            @addExemption="addExemption"
            @removeExemption="removeExemption"
            @clearExemptions="clearExemptions" />
        <br>

        <!-- deductions question -->
        Does this income stream have any pre-tax deductions?
        <AddIncomeDeduction
            :deductions="deductions"
            :mode="mode"
            @addIncome="addIncome"
            @addDeduction="addDeduction"
            @removeDeduction="removeDeduction"
            @clearDeductions="clearDeductions" />

        <!-- desktop buttons: save, delete, cancel -->
        <div class="desktop-only">
            <button class="btn btn-primary float-right" v-on:keyup="processKeyPress" v-on:click.enter.prevent="addIncome">
                {{ income ? 'Update Income Stream' : 'Add Income Stream' }}
            </button>
            <button v-if="income" class="btn btn-link" v-on:click.enter.prevent="cancelEditIncome">
                Cancel
            </button>
            <button v-if="income" class="btn btn-link remove-expense" v-on:click.enter.prevent="deleteIncome">
                Delete
            </button>
        </div>

        <!-- mobile buttons: save, delete, cancel -->
        <div class="mobile-only">
            <button class="btn btn-primary" v-on:keyup="processKeyPress" v-on:click.enter.prevent="addIncome">
                {{ income ? 'Update Income Stream' : 'Add Income Stream' }}
            </button>
            <button v-if="income" class="btn btn-link cancel-btn" v-on:click.enter.prevent="cancelEditIncome">
                Cancel
            </button>
            <button v-if="income" class="btn btn-link remove-expense" v-on:click.enter.prevent="deleteIncome">
                Delete
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
                alert('Tax-exempt contributions and deductions cannot be more than income stream amount!');
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
                    alert(`You cannot edit this income stream until you free up at least ${util.formatMoney(diff, this.mode)} into your unallocated budget. You must remove at least ${util.formatMoney(diff-this.unallocatedSum, this.mode)} in expenses or investments before you can make this change.`);
                    return false;
                }
            }

            // validate label, tax, and value
            if (this.label == '') {
                alert('Income stream label is required.');
                return false;
            }
            if (isNaN(this.tax) || this.tax < 1 || this.tax > 100) {
                alert('Income stream tax rate should be between 1 and 100.');
                return false;
            }
            if (isNaN(this.value) || this.value <= 0) {
                alert('Income stream amount must be positive number.');
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
                alert(`You cannot remove this income stream until you free up at least ${util.formatMoney(net, this.mode)} into your unallocated budget. You must remove at least ${util.formatMoney(net-this.unallocatedSum, this.mode)} in expenses or investments before you can remove this income stream.`);
                return;
            }
            if (confirm("Are you sure you want to remove this income stream?")) {
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
            if (empty || confirm('Are you sure you want to remove this exemption?')) {
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
                    let str = 'Exemption amount must be greater or equal to 0.';
                    alert(str);
                    throw str;
                }
                exemption.match = parseInt(exemption.match);
                if (isNaN(exemption.match) || exemption.match < 0) {
                    let str = 'Exemption match amount must be greater or equal to 0.';
                    alert(str);
                    throw str;
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
            if (empty || confirm('Are you sure you want to remove this deduction?')) {
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
                    let str = 'Deduction amount must be greater or equal to 0.';
                    alert(str);
                    throw str;
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

.desktop-only {
    float: right;
    display:inline;
    margin-top:30px;
}

.remove-expense {
    color: red;
}

.desktop-only .remove-expense {
    padding-left:5px;
    padding-right:17px;
}

</style>