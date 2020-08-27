<template>
    <div>

        <!-- investments label -->
        <label>Investments</label>

        <!-- investments: net - expenses = savings -->
        <span class="float-right net-income">
            <span class="badge badge-success badge-pill net-income-badge clickable" data-toggle="tooltip" data-placement="top" :title="budgetTooltip" v-on:click="populateInvestment()">
                Unallocated: {{ util.formatMoney(unallocatedSum) }}
                <span class="fa fa-question-circle"></span>
            </span>
            <span class="badge badge-success badge-pill net-income-badge clickable" data-toggle="tooltip" data-placement="top" :title="investmentTooltip">
                Investments: {{ util.formatMoney(investmentSum) }}
                <span class="fa fa-question-circle"></span>
            </span>
        </span>

        <ul class="list-group">

            <!-- no investments -->
            <li class="list-group-item d-flex justify-content-between align-items-center disabled" v-if="hasInvestments">
                You haven't added any investments yet.
            </li>

            <!-- investments -->
            <li class="list-group-item d-flex justify-content-between align-items-center clickable" v-for="(investment, idx) in investmentsItemized" v-bind:key="idx" v-on:click="removeInvestment(idx)">
                <div class="row no-gutters income-display">
                    <div class="col-md-4">
                        <span id="label">{{ investment.label }}</span>
                    </div>
                    <div class="col-md-8">
                        <span class="badge badge-secondary badge-pill">
                            {{ util.formatMoney(investment.value) }}
                        </span>
                    </div>
                </div>
            </li>

            <!-- contribution investments -->
            <span v-for="income in incomesItemized" v-bind:key="income.label">
                <li class="list-group-item d-flex justify-content-between align-items-center clickable" v-for="exemption in income.exemptions" v-bind:key="exemption.label" v-on:click="unremovableInvestment()">
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
            Click on an investment to remove it.
        </small>
    </div>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'ViewInvestments',
    props: [
        'investmentsItemized', 'incomesItemized',
        'netSum', 'expenseSum', 'unallocatedSum', 'investmentSum'
    ],
    data () {
        return {
            util: util,
        }
    },
    methods: {
        removeInvestment: function (idx) {
            if (confirm("Are you sure you want to remove this investment?")) {
                this.$emit('removeInvestment', idx);
            }
        },
        unremovableInvestment: function () {
            alert("Remove tax-exempt contributions via the 'Incomes' interface at the top of the page.");
        },
        populateInvestment: function () {
            this.$emit('populateInvestment');
        },
        displayExemption: function (exemption) {
            return this.util.formatMoney(parseInt(exemption.value) + parseInt(exemption.match));
        },
        getExemptionTooltip: function (exemption) {
            let value = this.util.formatMoney(exemption.value);
            let match = this.util.formatMoney(exemption.match);
            return `${exemption.label} = Contribution (${value}) + Employee Match (${match})`;
        }
    },
    computed: {
        budgetTooltip () {
            var tip = `Budget (${util.formatMoney(this.unallocatedSum)}) = `;
            tip += `Net Income (${util.formatMoney(this.netSum)}) - `;
            tip += `Expenses (${util.formatMoney(this.expenseSum)}) - `;
            tip += `Investments (${util.formatMoney(this.investmentSum)})`;
            return tip;
        },
        investmentTooltip () {
            var tip = `Expenses (${util.formatMoney(this.investmentSum)}) = `;
            this.investmentsItemized.forEach(invest => {
                tip += `${invest.label} (${util.formatMoney(invest.value)}) + `;
            })
            this.incomesItemized.forEach(income => {
                income.exemptions.forEach(exemption => {
                    let value = parseInt(exemption.value) + parseInt(exemption.match);
                    tip += `${exemption.label} (${util.formatMoney(value)}) + `;
                })
            })
            return tip.substring(0, tip.length-2);
        },
        hasInvestments: function () {
            if (this.investmentsItemized.length) return true;
            this.incomesItemized.forEach(income => {
                if (income.exemptions.length) return true;
            });
            return false;
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
.net-income {
    padding-right: 1.25rem;
}
.net-income-badge {
    float:initial;
}
</style>