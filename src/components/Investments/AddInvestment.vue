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

        <button class="btn btn-primary desktop-only" v-on:click.enter.prevent="addInvestment" v-on:keyup="processKeyPress">
            {{ submitText }}
        </button>
        <button class="btn btn-primary mobile-only" v-on:click.enter.prevent="addInvestment" v-on:keyup="processKeyPress">
            {{ submitText }}
        </button>
        <span v-if="investment">
            <!-- Delete Button -->
            <button class="btn btn-link desktop-only remove-expense" v-on:click.enter.prevent="deleteInvestment">Remove Investment</button>
            <button class="btn btn-link mobile-only remove-expense" v-on:click.enter.prevent="deleteInvestment">Remove Investment</button>
            <!-- Cancel Button -->
            <button class="btn btn-link desktop-only" v-on:click.enter.prevent="cancelEdit">Cancel Edit</button>
            <button class="btn btn-link mobile-only cancel-btn" v-on:click.enter.prevent="cancelEdit">Cancel Edit</button>
        </span>
    </form>
</template>


<script>
import util from '../../util.js';

export default {
    name: 'AddInvestment',
    props: ['unallocatedSum', 'mode', 'investment'],
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

            var difstr = this.investment ? 'difference ' : '';
            var value  = this.investment ? this.value - this.investment.value : this.value;
            if (value > this.unallocatedSum) {
                alert(`Investment ${difstr}must be less than your available budget of ${util.formatMoney(this.unallocatedSum, this.mode)}`);
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
        cancelEdit: function () {
            this.$emit('editInvestment', false);
        },
        deleteInvestment: function () {
            if (confirm("Are you sure you want to remove this investment?")) {
                this.$emit('removeInvestment');
            }
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
    },
    computed: {
        submitText: function () {
            return this.investment ? 'Update Investment' : 'Add Investment';
        }
    },
    watch: {
        investment: function () {
            this.value = this.investment ? this.investment.value : '';
            this.label = this.investment ? this.investment.label : '';
        }
    }
}

</script>

<style scoped>

.btn.btn-primary.mobile-only {
    width:100%;
}

.btn.desktop-only {
    float: right;
}

.btn.btn-primary.desktop-only {
    margin-left: .5rem;
}

.btn.mobile-only.cancel-btn {
    float:right;
}

.remove-expense {
    color: red;
}

</style>