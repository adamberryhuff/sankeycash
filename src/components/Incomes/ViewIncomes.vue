<template>
    <div>

        <!-- income streams label -->
        <label>{{ $t('incomes.header') }}</label>

        <!-- income streams gross, tax, net -->
        <span class="float-right net-income">
            <span class="badge badge-success net-income-badge clickable">
                {{ $t('common.gross_short') }}<span class="desktop-only-inline">: {{ util.formatMoney(grossSum, mode) }}</span>
            </span>
            <span class="badge badge-success net-income-badge clickable pad" data-toggle="tooltip" data-placement="top" :title="netTooltip">
                {{ $t('common.net_short') }}<span class="desktop-only-inline">: {{ util.formatMoney(netSum, mode) }}</span>
                &nbsp;
                <span class="fa fa-question-circle"></span>
            </span>
        </span>

        <ul class="list-group">

            <!-- no income streams -->
            <li class="list-group-item d-flex justify-content-between align-items-center disabled" v-if="!incomesItemized.length">
                {{ $t('incomes.no_incomes') }}
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center clickable" v-for="(income, idx) in incomesItemized" v-bind:key="income.label" v-on:click="editIncome(idx)">
                <div class="row no-gutters income-display">
                    <div class="col-md-4">
                        <span id="label">{{ income.label }}</span>
                    </div>
                    <div class="col-md-8">
                        <span class="badge badge-primary clickable" data-toggle="tooltip" data-placement="top" :title="getNetTooltip(income)" data-html="true">
                            {{ getNetDisplay(income) }}
                            <span class="fa fa-question-circle"></span>
                        </span>
                        <span class="badge badge-primary">
                            {{ getGrossDisplay(income) }}
                        </span><br>
                        <span class="badge badge-secondary float-right">
                            {{ getIncomeDisplay(income) }}
                        </span>
                        <span v-for="exemption in income.exemptions" v-bind:key="exemption.label">
                            <span class="badge badge-secondary">
                                {{ getExemptionDisplay(exemption) }}
                            </span>&nbsp;
                        </span>
                        <span v-for="deduction in income.deductions" v-bind:key="deduction.label">
                            <span class="badge badge-secondary">
                                {{ getDeductionDisplay(deduction) }}
                            </span>&nbsp;
                        </span>
                    </div>
                </div>
            </li>
        </ul>
        <small class="form-text text-muted">
            {{ $t('incomes.edit_instructions') }}
        </small>
    </div>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'ViewIncomes',
    props: ['incomesItemized', 'grossSum', 'taxSum', 'netSum', 'mode'],
    data () {
        return {
            util: util,
        }
    },
    methods: {
        editIncome: function (idx) {
            this.$emit('editIncome', idx);
        },
        getNetDisplay: function (income) {
            let net = util.formatMoney(util.getNet(income), this.mode);
            return `${this.$t('common.net_short')}: ${net}`;
        },
        getNetTooltip: function (income) {
            var exemptions = util.formatMoney(util.getExemptions(income), this.mode);
            var deductions = util.formatMoney(util.getDeductions(income), this.mode);
            var match      = util.formatMoney(util.getMatch(income), this.mode);
            var gross      = util.formatMoney(income.value, this.mode);
            var tax        = util.formatMoney(util.getTax(income), this.mode);
            var tax_rate   = util.formatTax(income.tax);
            var taxable    = util.formatMoney(util.getTaxableIncome(income), this.mode);
            let net        = util.formatMoney(util.getNet(income), this.mode);

            var tip = '';
            if (income.exemptions.length) {
                tip += `${this.$t('common.exemptions')} (${exemptions}) = `;
                income.exemptions.forEach(exemption => {
                    tip += `${exemption.label} `;
                    tip += `(${util.formatMoney(exemption.value, this.mode)}) + `;
                });
                tip = tip.substring(0, tip.length-2);
                tip += `<br><br>${this.$t('common.match')} (${match}) = `
                income.exemptions.forEach(exemption => {
                    tip += `${exemption.label} `;
                    tip += `(${util.formatMoney(exemption.match, this.mode)}) + `;
                });
                tip = tip.substring(0, tip.length-2);
                tip += `<br><br>`;
            }
            if (income.deductions.length) {
                tip += `${this.$t('common.deductions')} (${deductions}) = `;
                income.deductions.forEach(deduction => {
                    tip += `${deduction.label} `;
                    tip += `(${util.formatMoney(deduction.value, this.mode)}) + `;
                });
                tip = tip.substring(0, tip.length-2);
                tip += `<br><br>`;
            }
            if (income.exemptions.length || income.deductions.length) {
                tip += `${this.$t('common.taxable')} (${taxable}) = `;
                tip += `${this.$t('common.gross_short')} ${gross}`;
                if (exemptions) tip += ` - ${this.$t('common.exemptions')} (${exemptions})`;
                if (deductions) tip += ` - ${this.$t('common.deductions')} (${deductions})`;
                tip += `<br><br>`;
                tip += `${this.$t('common.tax')} (${tax}) = `;
                tip += `${this.$t('common.taxable')} ${taxable} * `;
                tip += `${this.$t('common.tax_rate')} (${tax_rate})`;
                tip += `<br><br>`;
            }

            // net
            if (!income.exemptions.length && !income.deductions.length) {
                tip += `${this.$t('common.net_short')} (${net}) = `;
                tip += `${this.$t('common.gross_short')} (${gross}) - `;
                tip += `${this.$t('common.tax')} (${tax})`;
                return tip;
            }
            tip += `${this.$t('common.net_short')} (${net}) = `;
            tip += `${this.$t('common.taxable')} (${taxable}) - `;
            tip += `${this.$t('common.tax')} (${tax})`;
            if (income.exemptions.length) {
                tip += ` + ${this.$t('common.exemptions')} (${exemptions}) + `;
                tip += `${this.$t('common.match')} (${match})`;
            }
            return tip;
        },
        getGrossDisplay: function (income) {
            let gross = util.formatMoney(income.value, this.mode);
            return `${this.$t('common.gross_short')}: ${gross}`
        },
        getExemptionDisplay: function (exemption) {
            let contribution = util.formatMoney(exemption.value, this.mode);
            let match        = util.formatMoney(exemption.match, this.mode);
            var disp = `${exemption.label}: ${contribution} + `;
            disp += `${match} ${this.$t('common.match_short')}`;
            return disp;
        },
        getIncomeDisplay: function (income) {
            let taxable = util.formatMoney(util.getTaxableIncome(income), this.mode);
            let tax     = util.formatTax(income.tax);
            return `${income.label}: ${taxable} - ${tax}`;
        },
        getDeductionDisplay: function (deduction) {
            let value = util.formatMoney(deduction.value, this.mode);
            return `${deduction.label}: ${value}`;
        }
    },
    computed: {
        netTooltip () {
            var tip = `${this.$t('common.net_short')} `;
            tip += `(${util.formatMoney(this.netSum, this.mode)}) = `;
            tip += `${this.$t('common.gross_short')} `;
            tip += `(${util.formatMoney(this.grossSum, this.mode)}) - `;
            tip += `${this.$t('common.tax')} `;
            tip += `(${util.formatMoney(this.taxSum, this.mode)})`;
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

@media only screen and (min-width: 540px) {
    .pad {
        margin-right: calc(0.25rem + 15px);
    }
}


</style>