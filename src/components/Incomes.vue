<template>
    <div class="row">
        <!-- income streams title -->
        <div class="col-md-12">
            <h2>
                <span id="incomes-label">
                    {{ $t('incomes.header') }}
                </span>
            </h2>
            <p>{{ $t('incomes.title') }}</p>
        </div>

        <!-- add income stream -->
        <div class="col-md-6 col-sm-12">
            <AddIncome
                :income="income"
                :mode="mode"
                :unallocatedSum="unallocatedSum"
                @addIncome="addIncome"
                @editIncome="editIncome" />
        </div>

        <div class="col-sm-12 mobile-only">
            <hr class="lr-break">
        </div>

        <!-- view income streams -->
        <div class="col-md-6 col-sm-12">
            <ViewIncomes
                :incomesItemized="incomesItemized"
                :grossSum="grossSum"
                :taxSum="taxSum"
                :netSum="netSum"
                :mode="mode"
                @editIncome="editIncome"
                @deleteIncome="deleteIncome" />
        </div>
    </div>
</template>

<script>

import util from '../util.js';
import AddIncome from './Incomes/AddIncome.vue';
import ViewIncomes from './Incomes/ViewIncomes.vue';

export default {
    name: 'Incomes',
    props: ['incomesItemized', 'unallocatedSum', 'grossSum', 'netSum', 'taxSum', 'mode'],
    components: {
        AddIncome,
        ViewIncomes
    },
    data () {
        return {
            idx: false,
            util: util
        }
    },
    methods: {
        deleteIncome: function (idx) {
            let income = this.incomesItemized[idx];
            let net = util.getNet(income);
            net = net - income.exemptions.reduce((a, e) => a + e.value + e.match, 0);
            if (net > this.unallocatedSum) {
                alert(this.$t('incomes.deletion_error', {
                    required_total: util.formatMoney(net, this.mode),
                    required_additional: util.formatMoney(net-this.unallocatedSum, this.mode)
                }));
                return;
            }
            if (confirm(this.$t('incomes.deletion_confirmation'))) {
                this.$emit('removeIncome', idx);
            }
        },
        editIncome: function (idx) {
            this.idx = idx;
        },
        addIncome: function (income) {
            income.idx = this.idx;
            this.$emit('addIncome', income);
            this.idx = false;
        }
    },
    computed: {
        income: function () {
            let income = this.incomesItemized[this.idx];
            return income ? JSON.parse(JSON.stringify(income)) : income;
        }
    }
}

</script>
