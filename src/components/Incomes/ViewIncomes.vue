<template>
    <div>
        <ViewIncomeBreakdown ref="breakdown" :mode="mode" />

        <!-- income streams label -->
        <div class="row">
            <div class="col-md-12">
                <label>{{ $t('incomes.header') }}</label>

                <!-- income streams gross, tax, net -->
                <span class="float-right net-income">
                    <span class="badge badge-success net-income-badge clickable">
                        {{ $t('common.gross_short') }}<span class="desktop-only-inline">: {{ util.formatMoney(grossSum, mode) }}</span>
                    </span>
                    <span class="badge badge-success net-income-badge clickable pad" data-toggle="tooltip" data-placement="top" :title="netTooltip">
                        {{ $t('common.net_short') }}<span class="desktop-only-inline">: {{ util.formatMoney(netSum, mode) }}</span>
                        &nbsp;
                        <span class="fa fa-question-circle" v-if="incomesItemized.length"></span>
                    </span>
                </span>
            </div>
        </div>

        <ul class="list-group">

            <!-- no income streams -->
            <li class="list-group-item d-flex justify-content-between align-items-center disabled" v-if="!incomesItemized.length">
                {{ $t('incomes.no_incomes') }}
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center clickable" v-for="(income, idx) in incomesItemized" v-bind:key="income.label">
                <div class="row no-gutters income-display">
                    <div class="col-md-4 left-side">
                        <span id="label">{{ income.label }}</span><br class="desktop-only">
                        <span class="view-edit-container">
                            <button type="button" class="btn btn-link view-breakdown" v-on:click="editIncome(idx)">
                                {{ $t('common.edit') }}
                            </button>&nbsp;
                            |
                            <button type="button" class="btn btn-link view-breakdown" v-on:click="deleteIncome(idx)">
                                {{ $t('common.delete') }}
                            </button>&nbsp;
                            |
                            <button type="button" class="btn btn-link view-breakdown" v-on:click="showBreakdownModal(income)">
                                {{ $t('common.details') }}
                            </button>
                        </span>
                    </div>
                    <div class="col-md-8 badges">
                        <span class="badge badge-secondary">
                            {{ getGrossDisplay(income) }}
                        </span>
                        <span class="badge badge-secondary clickable" data-toggle="tooltip" data-placement="top" data-html="true">
                            {{ getNetDisplay(income) }}
                        </span><br>
                        <span class="badge badge-light badge-exemption">
                            {{ getIncomeDisplay(income) }}
                        </span>
                        <span v-for="exemption in income.exemptions" v-bind:key="exemption.label">
                            <span class="badge badge-light badge-exemption">
                                {{ getExemptionDisplay(exemption) }}
                            </span>&nbsp;
                        </span>
                        <span v-for="deduction in income.deductions" v-bind:key="deduction.label">
                            <span class="badge badge-light badge-deduction">
                                {{ getDeductionDisplay(deduction) }}
                            </span>&nbsp;
                        </span>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>


<script>
import util from '../../util.js';
import ViewIncomeBreakdown from './ViewIncomeBreakdown.vue';

export default {
    name: 'ViewIncomes',
    props: ['incomesItemized', 'grossSum', 'taxSum', 'netSum', 'mode'],
    components: {
        ViewIncomeBreakdown
    },
    data () {
        return {
            util: util
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
        showBreakdownModal: function (income) {
            this.$refs.breakdown.show(income);
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
            return `${this.$t('common.taxable_short')}: ${taxable} (${tax})`;
        },
        getDeductionDisplay: function (deduction) {
            let value = util.formatMoney(deduction.value, this.mode);
            return `${deduction.label}: ${value}`;
        },
        deleteIncome: function (idx) {
            this.$emit('deleteIncome', idx);
        }
    },
    computed: {
        netTooltip () {
            if (!this.incomesItemized.length) return '';
            var tip = `${this.$t('common.net_short')} = `;
            this.incomesItemized.forEach(income => {
                tip += income.label + ' (';
                tip += util.formatMoney(util.getNet(income), this.mode);
                tip += ') + ';
            })
            return tip.substring(0, tip.length-2);
        }
    },
}

</script>


<style scoped>
.clickable {
    cursor:pointer
}
.badge {
    margin:2px;
}
.income-display {
    width:100%;
}
.net-income {
    margin-bottom: 0.5rem;
}
.net-income-badge {
    float:initial;
}
.badge-light {
    background-color: #ebebeb;
}

@media only screen and (min-width: 540px) {
    .pad {
        margin-right: calc(0.25rem + 15px);
    }
}

.badge-deduction {
    color: #ef6060;
}

.badge-exemption {
    color: #6c757d;
}

.view-breakdown {
    cursor: pointer;
    text-decoration: none;
    background-color: transparent;
    padding: 0px;
    border: 0px;
    color: #007bff;
    font-size: 12px;
    font-weight: 400;
}

.view-edit-container {
    font-size: 12px;
    font-weight: 400;
}

.badges {
    text-align:right;
}

@media only screen and (min-width: 540px) {
    .left-side {
        min-height:62px;
    }

    .view-edit-container {
        position:absolute;
        bottom:0px;
        left: 0px;
    }
}

@media only screen and (max-width: 540px) {
    .view-edit-container {
        float:right;
    }
}

</style>