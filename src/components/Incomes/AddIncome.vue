<template>
    <div>
        <!-- income stream label -->
        <div class="form-group">
            <label>Chart Label</label>
            <input id="new-income-focus" v-model="label" type="text" class="form-control" placeholder="Label">
            <small class="form-text text-muted">
                The label will be used in the chart: Salary, Rental Income, etc.
            </small>
        </div>

        <!-- income stream amount -->
        <div class="form-group">
            <label>Amount (Gross)</label>
            <input type="number" class="form-control" min="1" v-model="value" placeholder="Amount" v-on:keyup="processKeyPress">
            <small class="form-text text-muted">
                The amount you make annually from this income stream (pre-tax).
            </small>
        </div>

        <!-- income stream tax rate -->
        <div class="form-group">
            <label>Tax Rate</label>
            <input type="number" class="form-control" step=".001" min="0" max="100" v-model="tax" placeholder="Tax" v-on:keyup="processKeyPress">
            <small class="form-text text-muted">
                The percentage of tax for this income stream.
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
            <div v-for="(exemption, idx) in exemptions" v-bind:key="idx" class="row no-gutters">

                <!-- income stream tax exemption label -->
                <div class="col-md-4 exemptions">
                    <input placeholder="Chart Label" class="form-control" v-model="exemption.label" v-on:keyup="processKeyPress" />
                </div>

                <!-- income stream tax exemption amount -->
                <div class="col-md-4 exemptions">
                    <input placeholder="Contribution" type="number" class="form-control"  v-model="exemption.value" v-on:keyup="processKeyPress" />
                </div>

                <!-- income stream tax exemption employer match -->
                <div class="col-md-4 exemptions">
                    <input placeholder="Employer Match" type="number" class="form-control" v-model="exemption.match" v-on:keyup="processKeyPress" />
                </div>
            </div>
            <small class="form-text text-muted">
                Examples: 401k, HSA
                <button type="button" class="btn btn-link float-right add-exemption" v-if="exemptions.length" v-on:click="addExemption()" tabindex="0">
                    <i>Add Another</i>
                </button>
            </small>
        </div>
        <button type="submit" class="btn btn-primary float-right" v-on:click="addIncome()">
            Add Income Stream
        </button>
    </div>
</template>


<script>

export default {
    name: 'AddIncome',
    data () {
        return {
            // new income stream
            label: '',
            value: '',
            tax:   '',
            exemptions: []
        }
    },
    mounted () {
        this.focusNewIncome();
    },
    methods: {
        addIncome: function () {
            this.tax   = parseInt(this.tax);
            this.value = parseInt(this.value);

            // validate
            if (isNaN(this.tax) || this.tax < 0 || this.tax > 100) {
                alert('Income stream tax rate should be between 0 and 100');
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
                    alert('Exemption amount must be greater or equal to 0.');
                    return;
                }
                exemption.match = parseInt(exemption.match);
                if (isNaN(exemption.match) || exemption.match < 0) {
                    alert('Exemption match amount must be greater or equal to 0.');
                    return;
                }
                exemption_total += exemption.value;
            })
            if (exemption_total > this.value) {
                alert('Exemption amount cannot be more than income stream amount!');
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
        addExemption: function () {
            this.exemptions.push({ label: '', value: '', match: '' });
        },
        focusNewIncome: function () {
            document.getElementById('new-income-focus').focus();
            document.getElementById('no-exemptions-cb').checked = true;
        },
        processKeyPress: function (event) {
            if (event.keyCode == 13) this.addIncome();
        }
    },
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
</style>