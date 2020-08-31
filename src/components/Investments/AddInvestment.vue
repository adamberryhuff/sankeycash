<template>
    <form v-on:keydown.enter.prevent="">
        <!-- investment label -->
        <div class="form-group">
            <label>Chart Label</label>
            <input id="new-investment-focus" v-model="label" type="text" class="form-control" placeholder="Label">
            <small class="form-text text-muted">
                The label will be used in the chart: Stocks, Bonds, Roth IRA, Extra Mortgage Payment, etc.
            </small>
        </div>

        <!-- investment amount -->
        <div class="form-group">
            <label>Amount</label>
            <input id="new-investment" type="number" class="form-control" min="1" v-model="value" placeholder="Amount" v-on:keyup="processKeyPress">
            <small class="form-text text-muted">
                The amount you invest annually in this fund.
            </small>
        </div>
        <br class="mobile-only">
        <button class="btn btn-primary float-right desktop-only" style="position:relative;" v-on:click.enter.prevent="addInvestment" v-on:keyup="processKeyPress">
            Add Investment
        </button>
        <button class="btn btn-primary mobile-only" style="position:relative;" v-on:click.enter.prevent="addInvestment" v-on:keyup="processKeyPress">
            Add Investment
        </button>
    </form>
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
        addInvestment: function (e) {
            if (e) e.preventDefault();
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

            this.focusNewInvestment();
        },
        populateInvestment: function () {
            this.value = this.unallocatedSum;
        },
        focusNewInvestment: function () {
            document.getElementById('new-investment-focus').focus();
        },
        processKeyPress: function (event) {
            if (event.keyCode == 13) this.addInvestment();
        }
    }
}

</script>

<style SCOPED>

.btn.mobile-only {
    width:100%;
}

</style>