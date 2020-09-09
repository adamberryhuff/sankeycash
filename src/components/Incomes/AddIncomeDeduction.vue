<template>
    <span>

        <!-- yes/no button -->
        <span class="float-right">
            <input type="radio" name="yes-deductions" :checked="deductions.length" v-on:click="addDeduction()" v-on:keyup.enter="addDeduction()">
            &nbsp;{{ $t('common.yes') }}
            <input type="radio" class="no-checkbox" :checked="!deductions.length" name="yes-deductions" v-on:click="clearDeductions()" v-on:keyup.enter="clearDeductions()">
            &nbsp;{{ $t('common.no') }}
        </span>

        <div v-if="deductions.length" class="exemptions-expansion">
            <span class="exemptions-content">
                <!-- headers -->
                <div class="row no-gutters desktop-only">
                    <div class="col-md-6 exemptions">
                        <label class="exemption-label">{{ $t('common.chart_label') }}</label>
                    </div>
                    <div class="col-md-5 exemptions">
                        <label class="exemption-label">{{ $t('common.deduction') }}</label>
                    </div>
                    <div class="col-md-1 exemptions"></div>
                </div>

                <div class="row no-gutters" v-for="(deduction, idx) in deductions" v-bind:key="idx">

                    <!-- label -->
                    <div class="col-md-6 exemptions">
                        <label class="exemption-label mobile-only">{{ $t('common.chart_label') }}</label>
                        <input :placeholder="$t('common.label')" class="form-control" v-model="deduction.label" v-on:keyup.enter="$emit('addIncome')" :id="'deduction_' + idx" />
                    </div>

                    <!-- value -->
                    <div class="col-md-5 exemptions">
                        <label class="exemption-label mobile-only">{{ $t('common.deduction') }}</label>
                        <div class="input-group">
                            <input :placeholder="$t('common.deduction')" type="number" step="any" class="form-control"  v-model="deduction.value" v-on:keyup.enter="$emit('addIncome')" />
                            <div class="input-group-append">
                                <button type="button" class="btn btn-sm btn-secondary" :class="{ active: deduction.value_mode == 'currency' }" v-on:click="deduction.value_mode = 'currency'" tabindex="-1">{{ mode }}</button>
                            </div>
                            <div class="input-group-append">
                                <button type="button" :class="{ active: deduction.value_mode == 'percent' }" v-on:click="deduction.value_mode = 'percent'" tabindex="-1" class="btn btn-sm btn-secondary">%</button>
                            </div>
                        </div>
                    </div>

                    <!-- remove -->
                    <div class="col-md-1 exemptions">
                        <button type="button" class="btn btn-danger desktop-only" v-on:click="removeDeduction(idx)" v-on:keyup.enter="removeDeduction(idx)"><div><b>X</b></div></button>
                        <button type="button" class="btn btn-danger mobile-only" v-on:click="removeDeduction(idx)" v-on:keyup.enter="removeDeduction(idx)">{{ $t('incomes.deduction_remove') }}</button>
                    </div>
                    <div class="col-md-12 mobile-only" v-if="idx != deductions.length-1">
                        <hr>
                    </div>
                </div>
            </span>
        </div>

        <!-- exemption examples and add button -->
        <small class="form-text text-muted">
            {{ $t('incomes.deduction_examples') }}
            <button type="button" class="btn btn-link float-right add-exemption" v-if="deductions.length" v-on:click="addDeduction()" tabindex="0" v-on:keyup.enter="addDeduction()">
                <i>{{ $t('common.add_another') }}</i>
            </button>
        </small>
    </span>
</template>

<script>


export default {
    name: 'AddIncomeDeduction',
    props: ['deductions', 'mode'],
    methods: {
        removeDeduction: function (idx) {
            this.$emit('removeDeduction', idx);
        },
        addDeduction: function () {
            this.$emit('addDeduction');
        },
        clearDeductions: function () {
            this.$emit('clearDeductions');
        },
    },
}

</script>


<style scoped>

.exemptions {
    padding:0px 2px 0px 2px !important;
    margin-top:5px;
}

.exemption-label {
    font-size:14px;
    margin-bottom:0px;
    width:100%;
    padding-left:3px;
}

.btn.desktop-only {
    float: right;
}

.no-gutters {
    margin-right:-19px;
}

.no-checkbox {
     margin-left:10px;
}

.add-exemption {
    cursor:pointer;
    color: #007bff;
    text-decoration: none;
    background-color: transparent;
    padding: 0px;
    border: 0px;
    font-size: 100%;
    font-weight: 400;
}

.add-exemption:focus {
    text-decoration: #007bff;
    text-decoration-line: underline;
}

.exemptions-expansion {
    border-left: 5px solid #eae9e9;
    padding-left: 10px;
}

.exemptions-content {
    width: calc(100% - 15px);
    display:block;
}

.btn-danger {
    width:100%;
}

.btn-danger div {
    margin:auto;
}

</style>