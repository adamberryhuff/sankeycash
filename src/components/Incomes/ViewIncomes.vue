<template>
    <div>

        <!-- income streams label -->
        <label>Income Streams</label>

        <!-- income streams gross, tax, net -->
        <span class="float-right net-income">
            <span class="badge badge-success badge-pill net-income-badge clickable" data-toggle="tooltip" data-placement="top" :title="netTooltip">
                Net<span class="desktop-only-inline">: {{ util.formatMoney(netSum, mode) }}</span>
                &nbsp;
                <span class="fa fa-question-circle"></span>
            </span>
        </span>

        <ul class="list-group">

            <!-- no income streams -->
            <li class="list-group-item d-flex justify-content-between align-items-center disabled" v-if="!incomesItemized.length">
                You haven't added any income streams yet.
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center clickable" v-for="(income, idx) in incomesItemized" v-bind:key="income.label" v-on:click="removeIncome(idx, income)">
                <div class="row no-gutters income-display">
                    <div class="col-md-4">
                        <span id="label">{{ income.label }}</span>
                    </div>
                    <div class="col-md-8">
                        <span class="badge badge-primary badge-pill clickable" data-toggle="tooltip" data-placement="top" :title="getNetTooltip(income)" data-html="true">
                            {{ getNetDisplay(income) }}
                            <span class="fa fa-question-circle"></span>
                        </span>
                        <span class="badge badge-primary badge-pill">
                            {{ getGrossDisplay(income) }}
                        </span><br>
                        <span v-for="(exemption, idx) in income.exemptions" v-bind:key="idx">
                            <span class="badge badge-secondary badge-pill" v-if="exemption.value > 0">
                                {{ getExemptionDisplay(exemption) }}
                            </span>&nbsp;
                        </span>
                        <span class="badge badge-secondary badge-pill float-right">
                            {{ getIncomeDisplay(income) }}
                        </span>
                    </div>
                </div>
            </li>
        </ul>
        <small class="form-text text-muted">
            Click on an income stream to remove it.
        </small>
    </div>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'ViewIncomes',
    props: ['incomesItemized', 'unallocatedSum', 'grossSum', 'taxSum', 'netSum', 'mode'],
    data () {
        return {
            util: util,
        }
    },
    methods: {
        removeIncome: function (idx, income) {
            let net = this.getNet(income);
            net = net - income.exemptions.reduce((a, e) => a + e.value + e.match, 0);
            if (net > this.unallocatedSum) {
                alert(`You cannot remove this income stream until you free up at least ${util.formatMoney(net, this.mode)} into your unallocated budget. You must remove at least ${util.formatMoney(net-this.unallocatedSum, this.mode)} in expenses or investments before you can remove this income stream.`);
                return;
            }
            if (confirm("Are you sure you want to remove this income stream?")) {
                this.$emit('removeIncome', idx);
            }
        },
        getTaxableIncome: function (income) {
            var value = income.value;
            income.exemptions.forEach(exemption => {
                value -= exemption.value;
            })
            return value;
        },
        getTax: function (income) {
            let value = income.value;
            value -= income.exemptions.reduce((a, e) => a + e.value, 0);
            return value*(income.tax/100);
        },
        getMatch: function (income) {
            return income.exemptions.reduce((a, e) => a + e.match, 0);
        },
        getNet: function (income) {
            return income.value - this.getTax(income) + this.getMatch(income);
        },
        getExemptions: function (income) {
            return income.exemptions.reduce((a, e) => a + e.value, 0);
        },
        getNetDisplay: function (income) {
            let net = util.formatMoney(this.getNet(income), this.mode);
            return `Net: ${net}`;
        },
        getNetTooltip: function (income) {
            var exemptions = util.formatMoney(this.getExemptions(income), this.mode);
            var match = util.formatMoney(this.getMatch(income), this.mode);
            var gross = util.formatMoney(income.value, this.mode);
            var tax = util.formatTax(income.tax);
            var taxable = util.formatMoney(this.getTaxableIncome(income), this.mode);

            var tip = '';
            if (income.exemptions.length) {
                tip += `Exemptions (${exemptions}) = `;
                income.exemptions.forEach(exemption => {
                    tip += `${exemption.label} `;
                    tip += `(${util.formatMoney(exemption.value, this.mode)}) + `;
                });
                tip = tip.substring(0, tip.length-2);
                tip += `<br><br>Employee Match (${match}) = `
                income.exemptions.forEach(exemption => {
                    tip += `${exemption.label} `;
                    tip += `(${util.formatMoney(exemption.match, this.mode)}) + `;
                });
                tip = tip.substring(0, tip.length-2);
                tip += `<br><br>`;
                tip += `Taxable Income (${taxable}) = Gross ${gross} - `;
                tip += `Exemptions (${exemptions})<br><br>`;
            }

            // net
            var net = `Gross (${gross}) - Gross (${gross}) * Tax (${tax})`;
            tip += this.getNetDisplay(income) + ` = `;
            if (income.exemptions.length) {
                tip += `Exemptions (${exemptions}) + `;
                tip += `Employee Match (${match}) + `
                net = `Taxable Income (${taxable}) - Taxable Income (${taxable}) * `;
                net += `Tax (${tax})`;
            }
            return tip + net;
        },
        getGrossDisplay: function (income) {
            let gross = util.formatMoney(income.value, this.mode);
            return `Gross: ${gross}`
        },
        getExemptionDisplay: function (exemption) {
            let contribution = util.formatMoney(exemption.value, this.mode);
            let match        = util.formatMoney(exemption.match, this.mode);
            return `${exemption.label}: ${contribution} +  ${match} Match`;
        },
        getIncomeDisplay: function (income) {
            let taxable = util.formatMoney(this.getTaxableIncome(income), this.mode);
            let tax     = util.formatTax(income.tax);
            return `${income.label}: ${taxable} @ ${tax}`;
        },
    },
    computed: {
        netTooltip () {
            var tip = `Net (${util.formatMoney(this.netSum, this.mode)}) = `;
            tip += `Gross (${util.formatMoney(this.grossSum, this.mode)}) - `;
            tip += `Tax (${util.formatMoney(this.taxSum, this.mode)})`;
            return tip;
        }
    },
}

</script>


<style scoped>
.clickable {
    cursor:pointer
}
.badge {
    float:right;
    margin:2px;
}
.income-display {
    width:100%;
}
.net-income-badge {
    float:initial;
}
</style>