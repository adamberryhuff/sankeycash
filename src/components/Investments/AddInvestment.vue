<template>
    <div>
        <!-- investment label -->
        <div class="form-group">
            <label>Chart Label</label>
            <input v-model="label" type="text" class="form-control" placeholder="Label">
            <small class="form-text text-muted">
                The label will be used in the chart: Stocks, Bonds, Roth IRA, Extra Mortgage Payment, etc.
            </small>
        </div>

        <!-- investment amount -->
        <div class="form-group">
            <label>Amount</label>
            <input id="new-investment" type="number" class="form-control" min="1" v-model="value" placeholder="Amount">
            <small class="form-text text-muted">
                The amount you invest annually in this fund.
            </small>
        </div>

        <button type="submit" class="btn btn-primary float-right" style="position:relative;" v-on:click="addInvestment()">
            Add Investment
        </button>
    </div>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'AddInvestment',
    props: ['unallocatedSum'],
    data () {
        return {
            // new investment
            label: '',
            value: '',
        }
    },
    methods: {
        addInvestment: function () {
            this.value = parseInt(this.value);

            // validate
            if (isNaN(this.value) || this.value < 0) {
                alert('Investment amount must be a positive number!');
                return;
            }
            if (this.value > this.unallocatedSum) {
                alert(`Investment must be less than your available budget of ${util.formatMoney(this.unallocatedSum)}`);
                return;
            }

            // emit
            this.$emit('addInvestment', {
                label: this.label,
                value: this.value
            });

            // reset
            this.label = '';
            this.value = '';
        },
        populateInvestment: function () {
            this.value = this.unallocatedSum;
        }
    }
}

</script>