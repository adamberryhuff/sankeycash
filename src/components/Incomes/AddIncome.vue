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

        <!-- income stream tax exemptions -->
        <div class="form-group">
            Does this income stream have any tax-exempt contributions?
            <span class="float-right">
                <input type="radio" name="gridRadios" v-on:click="addExemption()" v-on:keyup="processKeyPress">
                &nbsp;Yes
                <input type="radio" class="no-checkbox" id="no-exemptions-cb" name="gridRadios" v-on:click="exemptions = []" checked v-on:keyup="processKeyPress">
                &nbsp;No
            </span>
            <div class="row no-gutters desktop-only" v-if="exemptions.length">
                <div class="col-md-3 exemptions">
                    <label class="exemption-label">Label</label>
                </div>
                <div class="col-md-4 exemptions">
                    <label class="exemption-label">Contribution ({{ mode }})</label>
                </div>
                <div class="col-md-4 exemptions">
                    <label class="exemption-label">Match ({{ mode }})</label>
                </div>
                <div class="col-md-1 exemptions"></div>
            </div>
            <div v-for="(exemption, idx) in exemptions" v-bind:key="idx" class="row no-gutters">
                <!-- income stream tax exemption label -->
                <div class="col-md-3 exemptions">
                    <label class="exemption-label mobile-only">Label</label>
                    <input placeholder="Chart Label" class="form-control" v-model="exemption.label" v-on:keyup="processKeyPress" />
                </div>

                <!-- income stream tax exemption amount -->
                <div class="col-md-4 exemptions">
                    <label class="exemption-label mobile-only">Contribution ({{ mode }})</label>
                    <input placeholder="Contribution" type="number" class="form-control"  v-model="exemption.value" v-on:keyup="processKeyPress" />
                </div>

                <!-- income stream tax exemption employer match -->
                <div class="col-md-4 exemptions">
                    <label class="exemption-label mobile-only">Match ({{ mode }})</label>
                    <input placeholder="Employer Match" type="number" class="form-control" v-model="exemption.match" v-on:keyup="processKeyPress" />
                </div>
                <div class="col-md-1 exemptions">
                    <button type="button" class="btn btn-outline-danger desktop-only" v-on:click="removeExemption(idx)">X</button>
                    <button type="button" class="btn btn-outline-danger mobile-only" v-on:click="removeExemption(idx)">Remove Exemption</button>
                </div>
            </div>
            <small class="form-text text-muted">
                Examples: 401k, HSA
                <button type="button" class="btn btn-link float-right add-exemption" v-if="exemptions.length" v-on:click="addExemption()" tabindex="0">
                    <i>Add Another</i>
                </button>
            </small>
        </div>
        <button class="btn btn-primary float-right desktop-only" v-on:keyup="processKeyPress" v-on:click.enter.prevent="addIncome">
            {{ submitText }}
        </button>
        <button class="btn btn-primary mobile-only" v-on:keyup="processKeyPress" v-on:click.enter.prevent="addIncome">
            {{ submitText }}
        </button>
        <span v-if="income">
            <!-- Delete Button -->
            <button class="btn btn-link desktop-only remove-expense" v-on:click.enter.prevent="deleteIncome">Remove Income Stream</button>
            <button class="btn btn-link mobile-only remove-expense" v-on:click.enter.prevent="deleteIncome">Remove Income</button>
            <!-- Cancel Button -->
            <button class="btn btn-link desktop-only" v-on:click.enter.prevent="cancelEdit">Cancel Edit</button>
            <button class="btn btn-link mobile-only cancel-btn" v-on:click.enter.prevent="cancelEdit">Cancel Edit</button>
        </span>
    </form>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'AddIncome',
    props: ['income', 'mode', 'unallocatedSum'],
    data () {
        return {
            // new income stream
            label: '',
            value: '',
            tax:   '',
            exemptions: [],

            util: util
        }
    },
    mounted () {
        this.focusNewIncome();
    },
    methods: {
        addIncome: function (e) {
            if (e) e.preventDefault();
            this.tax   = parseInt(this.tax);
            this.value = parseInt(this.value);

            // validate
            if (isNaN(this.tax) || this.tax < 1 || this.tax > 100) {
                alert('Income stream tax rate should be between 1 and 100');
                return;
            }
            if (isNaN(this.value) || this.value <= 0) {
                alert('Income stream amount must be positive number.');
                return;
            }

            // validate exemptions - required, valid labels,
            // sum of exemptions cannot be greater than income stream total
            var exemption_total = 0;
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
                exemption_total += exemption.value;
            })
            if (exemption_total > this.value) {
                alert('Exemption amount cannot be more than income stream amount!');
                return;
            }

            // if editing income stream, make sure new value doesn't make our budget
            // go negative
            let income = JSON.parse(JSON.stringify(this.income));
            income.value = this.value;
            var diff = util.getNet(this.income) - util.getNet(income);
            if (diff > this.unallocatedSum) {
                alert(`You cannot edit this income stream until you free up at least ${util.formatMoney(diff, this.mode)} into your unallocated budget. You must remove at least ${util.formatMoney(diff-this.unallocatedSum, this.mode)} in expenses or investments before you can make this change.`);
                return;
            }

            // add the new stream
            this.$emit('addIncome', {
                label: this.label,
                tax: this.tax,
                value: this.value,
                exemptions: this.exemptions
            });

            // reset everything in the form
            this.label      = '';
            this.tax        = '';
            this.value      = '';
            this.exemptions = [];

            // focus new income
            this.focusNewIncome();
        },
        cancelEdit: function () {
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
        addExemption: function () {
            this.exemptions.push({ label: '', value: '', match: '' });
        },
        removeExemption: function (idx) {
            var empty = !this.exemptions[idx].label;
            empty = empty && !this.exemptions[idx].value;
            empty = empty && !this.exemptions[idx].match;
            if (empty || confirm('Are you sure you want to remove this exemption?')) {
                this.exemptions.splice(idx, 1);
                if (!this.exemptions.length) {
                    document.getElementById('no-exemptions-cb').checked = true;
                }
            }
        },
        focusNewIncome: function () {
            document.getElementById('new-income-focus').focus();
            document.getElementById('no-exemptions-cb').checked = true;
        },
        processKeyPress: function (event) {
            if (event.keyCode == 13) this.addIncome();
        }
    },
    computed: {
        submitText: function () {
            return this.income ? 'Update Income Stream' : 'Add Income Stream';
        }
    },
    watch: {
        income: function () {
            this.value      = this.income ? this.income.value : '';
            this.label      = this.income ? this.income.label : '';
            this.tax        = this.income ? this.income.tax : '';
            this.exemptions = this.income ? this.income.exemptions : '';
        }
    }
}

</script>


<style scoped>
.exemptions {
    padding:0px 2px 0px 2px !important;
    margin-top:5px;
}
.add-exemption {
    cursor:pointer;
    color: #007bff;
    text-decoration: none;
    background-color: transparent;
    padding: 0px;
    border: 0px;
    font-size: 100%;
    font-weight: 400;
}

.add-exemption:focus {
    text-decoration: #007bff;
    text-decoration-line: underline;
}

.no-checkbox {
     margin-left:10px;
}

.exemption-label {
    font-size:14px;
    margin-bottom:0px;
}

.remove-label {
    color: transparent;
}

.btn.btn-primary.mobile-only {
    margin-top:30px;
    width:100%;
}

.btn.mobile-only.btn-outline-danger {
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