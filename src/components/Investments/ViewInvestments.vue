<template>
    <div>

        <!-- investments label -->
        <label>Investments</label>
        <!-- investments: net - expenses = savings -->
        <span class="float-right">
            <span class="badge badge-success badge-pill net-income-badge clickable" data-toggle="tooltip" data-placement="top" :title="budgetTooltip" v-on:click="populateInvestment()">
                Unallocated<span class="desktop-only-inline">: {{ util.formatMoney(unallocatedSum, mode) }}</span>&nbsp;
                <span class="fa fa-question-circle"></span>
            </span>
            <span class="badge badge-success badge-pill net-income-badge clickable" data-toggle="tooltip" data-placement="top" :title="investmentTooltip">
                Investments<span class="desktop-only-inline">: {{ util.formatMoney(investmentSum, mode) }}</span>&nbsp;
                <span class="fa fa-question-circle"></span>
            </span>
        </span>

        <ul class="list-group">

            <!-- no investments -->
            <li class="list-group-item d-flex justify-content-between align-items-center disabled" v-if="!hasInvestments">
                You haven't added any investments yet.
            </li>

            <!-- investments -->
            <li class="list-group-item d-flex justify-content-between align-items-center clickable" v-for="(investment, idx) in investmentsItemized" v-bind:key="idx" v-on:click="editInvestment(idx)">
                <div class="row no-gutters income-display">
                    <div class="col-md-4">
                        <span id="label">{{ investment.label }}</span>
                    </div>
                    <div class="col-md-8">
                        <span class="badge badge-secondary badge-pill">
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
                            <span class="badge badge-secondary badge-pill" :title="getExemptionTooltip(exemption)">
                                {{ displayExemption(exemption) }}
                                <span class="fa fa-question-circle"></span>
                            </span>
                        </div>
                    </div>
                </li>
            </span>
        </ul>
        <small class="form-text text-muted">
            Click on an investment to edit or remove it.
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
            alert("Edit tax-exempt contributions using the 'Incomes' interface at the top of the page.");
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
            return `${exemption.label} = Contribution (${value}) + Employee Match (${match})`;
        }
    },
    computed: {
        budgetTooltip () {
            var tip = `Budget (${util.formatMoney(this.unallocatedSum, this.mode)}) = `;
            tip += `Net Income (${util.formatMoney(this.netSum, this.mode)}) - `;
            tip += `Expenses (${util.formatMoney(this.expenseSum, this.mode)}) - `;
            tip += `Investments (${util.formatMoney(this.investmentSum, this.mode)})`;
            return tip;
        },
        investmentTooltip () {
            var tip = `Expenses (${util.formatMoney(this.investmentSum, this.mode)}) = `;
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
</style>