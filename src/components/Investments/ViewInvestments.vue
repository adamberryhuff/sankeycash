<template>
    <div>

        <!-- investments label -->
        <label>{{ $t('common.investments') }}</label>
        <!-- investments: net - expenses = savings -->
        <span class="float-right">
            <span class="badge badge-success net-income-badge clickable" data-toggle="tooltip" data-placement="top" :title="budgetTooltip" v-on:click="populateInvestment()">
                {{ $t('common.unallocated') }}<span class="desktop-only-inline">: {{ util.formatMoney(unallocatedSum, mode) }}</span>&nbsp;
                <span class="fa fa-question-circle"></span>
            </span>
            <span class="badge badge-success net-income-badge clickable pad" data-toggle="tooltip" data-placement="top" :title="investmentTooltip">
                {{ $t('common.investments') }}<span class="desktop-only-inline">: {{ util.formatMoney(investmentSum, mode) }}</span>&nbsp;
                <span class="fa fa-question-circle"></span>
            </span>
        </span>

        <ul class="list-group">

            <!-- no investments -->
            <li class="list-group-item d-flex justify-content-between align-items-center disabled" v-if="!hasInvestments">
                {{ $t('investments.no_investments') }}
            </li>

            <!-- investments -->
            <li class="list-group-item d-flex justify-content-between align-items-center clickable" v-for="(investment, idx) in investmentsItemized" v-bind:key="idx" v-on:click="editInvestment(idx)">
                <div class="row no-gutters income-display">
                    <div class="col-md-4">
                        <span id="label">{{ investment.label }}</span>
                    </div>
                    <div class="col-md-8">
                        <span class="badge badge-secondary">
                            {{ util.formatMoney(investment.value, mode) }}
                        </span>
                    </div>
                </div>
            </li>

            <!-- contribution investments -->
            <span v-for="income in incomesItemized" v-bind:key="income.label">
                <li class="list-group-item d-flex justify-content-between align-items-center clickable" v-for="exemption in income.exemptions" v-bind:key="exemption.label" v-on:click="uneditableInvestment()">
                    <div class="row no-gutters income-display">
                        <div class="col-md-4">
                            <span id="label">{{ exemption.label }}</span>
                        </div>
                        <div class="col-md-8">
                            <span class="badge badge-secondary" :title="getExemptionTooltip(exemption)">
                                {{ displayExemption(exemption) }}
                                <span class="fa fa-question-circle"></span>
                            </span>
                        </div>
                    </div>
                </li>
            </span>
        </ul>
        <small class="form-text text-muted">
            {{ $t('investments.edit_instructions') }}
        </small>
    </div>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'ViewInvestments',
    props: [
        'investmentsItemized', 'incomesItemized',
        'netSum', 'expenseSum', 'unallocatedSum', 'investmentSum',
        'mode'
    ],
    data () {
        return {
            util: util,
        }
    },
    methods: {
        editInvestment: function (idx) {
            this.$emit('editInvestment', idx);
        },
        uneditableInvestment: function () {
            alert(this.$t('investments.uneditable'));
        },
        populateInvestment: function () {
            this.$emit('populateInvestment');
        },
        displayExemption: function (exemption) {
            return this.util.formatMoney(exemption.value + exemption.match, this.mode);
        },
        getExemptionTooltip: function (exemption) {
            let value = this.util.formatMoney(exemption.value, this.mode);
            let match = this.util.formatMoney(exemption.match, this.mode);
            let tip = `${exemption.label} = ${this.$t('common.contribution')} `;
            tip += `(${value}) + ${this.$t('common.match')} (${match})`;
            return tip;
        }
    },
    computed: {
        budgetTooltip () {
            var tip = `${this.$t('common.budget')} `;
            tip += `(${util.formatMoney(this.unallocatedSum, this.mode)}) = `;
            tip += `${this.$t('common.net')} `;
            tip += `(${util.formatMoney(this.netSum, this.mode)}) - `;
            tip += `${this.$t('common.expenses')} `;
            tip += `(${util.formatMoney(this.expenseSum, this.mode)}) - `;
            tip += `${this.$t('common.investments')} `;
            tip += `(${util.formatMoney(this.investmentSum, this.mode)})`;
            return tip;
        },
        investmentTooltip () {
            var tip = `${this.$t('common.expenses')} `;
            tip += `(${util.formatMoney(this.investmentSum, this.mode)}) = `;
            this.investmentsItemized.forEach(invest => {
                tip += `${invest.label} (${util.formatMoney(invest.value, this.mode)}) + `;
            })
            this.incomesItemized.forEach(income => {
                income.exemptions.forEach(exemption => {
                    let value = exemption.value + exemption.match;
                    tip += `${exemption.label} (${util.formatMoney(value, this.mode)}) + `;
                })
            })
            return tip.substring(0, tip.length-2);
        },
        hasInvestments: function () {
            let has = false;
            if (this.investmentsItemized.length) has = true;
            this.incomesItemized.forEach(income => {
                if (income.exemptions.length) has = true;
            });
            return has;
        }
    }
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