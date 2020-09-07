<template>
    <div class="modal" id="breakdown-modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content" v-if="income">
                <div class="modal-header">
                    <h5 class="modal-title" style="width:100%" v-if="income">
                        {{ income.label }} - Net Breakdown
                        <span class="gross-net-header">
                            <span class="badge badge-primary">
                                {{ $t('common.gross_short') }}: {{ gross }}
                            </span>&nbsp;
                            <span class="badge badge-primary">
                                {{ $t('common.net_short') }}: {{ net }}
                            </span>&nbsp;
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row" v-if="income.exemptions.length">
                        <div class="col-md-6 col-sm-12">
                            <h6>
                                {{ $t('incomes.tax_exempt_contributions') }}
                                <span class="badge badge-secondary">{{ exemptions }}</span>
                            </h6>
                            <span class="equation" v-html="exemptionsBreakdown"></span>
                        </div>
                        <div class="col-sm-12 mobile-only"><br></div>
                        <div class="col-md-6 col-sm-12">
                            <h6>
                                {{ $t('incomes.tax_exempt_match') }}
                                <span class="badge badge-secondary">{{ matches }}</span>
                            </h6>
                            <span class="equation" v-html="matchesBreakdown"></span>
                        </div>
                    </div>
                    <br v-if="income.exemptions.length">
                    <div class="row" v-if="income.deductions.length">
                        <div class="col-md-12">
                            <h6>
                                {{ $t('incomes.pretax_deductions') }}
                                <span class="badge badge-secondary">{{ deductions }}</span>
                            </h6>
                            <span class="equation" v-html="deductionsBreakdown"></span>
                        </div>
                    </div>
                    <br v-if="income.deductions.length">
                    <div class="row" v-if="income.deductions.length || income.exemptions.length">
                        <div class="col-md-12">
                            <h6>
                                {{ this.$t('common.taxable') }}
                                <span class="badge badge-secondary">{{ taxable }}</span>
                            </h6>
                            <span class="equation" v-html="taxableBreakdown"></span>
                        </div>
                    </div>
                    <br v-if="income.deductions.length || income.exemptions.length">
                    <div class="row">
                        <div class="col-md-12">
                            <h6>
                                {{ this.$t('common.tax') }}
                                <span class="badge badge-secondary">{{ tax }}</span>
                            </h6>
                            <span class="equation" v-html="taxBreakdown"></span>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-md-12">
                            <h6>
                                {{ this.$t('common.net') }}
                                <span class="badge badge-secondary">{{ net }}</span>
                            </h6>
                            <span class="equation" v-html="netBreakdown"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import util from '../../util.js';
import Vue from 'vue';

export default {
    name: "ViewIncomeBreakdown",
    props: ['mode'],
    data () {
        return {
            util: util,
            income: false
        }
    },
    methods: {
        show: function (income) {
            Vue.set(this, 'income', income);
            window.$('#breakdown-modal').modal('show');
        }
    },
    computed: {
        gross: function () {
            return util.formatMoney(this.income.value, this.mode);
        },
        tax_rate: function () {
            return util.formatTax(this.income.tax);
        },
        exemptions: function () {
            return util.formatMoney(util.getExemptions(this.income), this.mode);
        },
        exemptionsBreakdown: function () {
            let breakdown = this.$t('incomes.tax_exempt_contributions') + ' = ';
            this.income.exemptions.forEach(exemption => {
                breakdown += exemption.label + ' + ';
            });
            breakdown = breakdown.substring(0, breakdown.length-2) + '<br>';
            breakdown += this.$t('incomes.tax_exempt_contributions') + ' = ';
            this.income.exemptions.forEach(exemption => {
                breakdown += util.formatMoney(exemption.value, this.mode) + ' + ';
            });
            breakdown = breakdown.substring(0, breakdown.length-2) + '<br>';
            if (this.income.exemptions.length == 1) return breakdown;
            breakdown += this.$t('incomes.tax_exempt_contributions') + ' = ' + this.exemptions;
            return breakdown;
        },
        matches: function () {
            return util.formatMoney(util.getMatch(this.income), this.mode);
        },
        matchesBreakdown: function () {
            let breakdown = this.$t('incomes.tax_exempt_match') + ' = ';
            this.income.exemptions.forEach(exemption => {
                breakdown += exemption.label + ' + ';
            });
            breakdown = breakdown.substring(0, breakdown.length-2) + '<br>';
            breakdown += this.$t('incomes.tax_exempt_match') + ' = ';
            this.income.exemptions.forEach(exemption => {
                breakdown += util.formatMoney(exemption.match, this.mode) + ' + ';
            });
            breakdown = breakdown.substring(0, breakdown.length-2) + '<br>';
            if (this.income.exemptions.length == 1) return breakdown;
            breakdown += this.$t('incomes.tax_exempt_match') + ' = ' + this.matches;
            return breakdown;
        },
        deductions: function () {
            return util.formatMoney(util.getDeductions(this.income), this.mode);
        },
        deductionsBreakdown: function () {
            let breakdown = this.$t('incomes.pretax_deductions') + ' = ';
            this.income.deductions.forEach(deduction => {
                breakdown += deduction.label + ' + ';
            });
            breakdown = breakdown.substring(0, breakdown.length-2) + '<br>';
            breakdown += this.$t('incomes.pretax_deductions') + ' = ';
            this.income.deductions.forEach(deduction => {
                breakdown += util.formatMoney(deduction.value, this.mode) + ' + ';
            });
            breakdown = breakdown.substring(0, breakdown.length-2) + '<br>';
            if (this.income.deductions.length == 1) return breakdown;
            breakdown += this.$t('incomes.pretax_deductions') + ' = ' + this.deductions;
            return breakdown;
        },
        taxable: function () {
            return util.formatMoney(util.getTaxableIncome(this.income), this.mode);
        },
        taxableBreakdown: function () {
            let breakdown = this.$t('common.taxable') + ' = ' + this.$t('common.gross');
            breakdown += ' - ' + this.$t('incomes.tax_exempt_contributions');
            breakdown += ' - ' + this.$t('incomes.pretax_deductions');
            breakdown += '<br>';
            breakdown += this.$t('common.taxable') + ' = ' + this.gross;
            breakdown += ' - ' + this.exemptions;
            breakdown += ' - ' + this.deductions;
            breakdown += '<br>';
            breakdown += this.$t('common.taxable') + ' = ' + this.taxable;
            return breakdown;
        },
        tax: function () {
            return util.formatMoney(util.getTax(this.income), this.mode);
        },
        taxBreakdown: function () {
            let breakdown = this.$t('common.tax') + ' = ';
            breakdown += this.$t('common.taxable') + ' * ' + this.$t('common.tax_rate');
            breakdown += '<br>';
            breakdown += this.$t('common.tax') + ' = ';
            breakdown += this.taxable + ' * (' + this.tax_rate + ' / 100)';
            breakdown += '<br>';
            breakdown += this.$t('common.tax') + ' = ' + this.tax;
            return breakdown;
        },
        net: function () {
            return util.formatMoney(util.getNet(this.income), this.mode);
        },
        netBreakdown: function () {
            let breakdown = this.$t('common.net') + ' = ';
            if (!this.income.exemptions.length && !this.income.deductions.length) {
                breakdown += this.$t('common.gross') + ' - ' + this.$t('common.tax');
                breakdown += '<br>';
                breakdown += this.$t('common.net') + ' = ';
                breakdown += this.gross + ' - ' + this.tax;
                breakdown += '<br>';
                breakdown += this.$t('common.net') + ' = ' + this.net;
                return breakdown;
            }
            breakdown += this.$t('common.taxable') + ' - ' + this.$t('common.tax');
            if (this.income.exemptions.length) {
                breakdown += ' + ' + this.$t('incomes.tax_exempt_contributions');
                breakdown += ' + ' + this.$t('incomes.tax_exempt_match');
            }
            breakdown += '<br>';
            breakdown += this.$t('common.net') + ' = ';
            breakdown += this.taxable + ' - ' + this.tax;
            if (this.income.exemptions.length) {
                breakdown += ' + ' + this.exemptions + ' + ' + this.matches;
            }
            breakdown += '<br>';
            breakdown += this.$t('common.net') + ' = ' + this.net;
            return breakdown;
        }
    }
}

</script>

<style scoped>

.equation {
    font-variant: all-small-caps;
    font-size: 14px;
}

h6 {
    margin-bottom: 0px;
}

@media only screen and (min-width: 540px) {
    .gross-net-header {
        float:right;
    }
}

</style>