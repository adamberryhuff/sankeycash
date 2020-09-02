<template>
    <span>

        <!-- yes/no button -->
        <span class="float-right">
            <input type="radio" name="yes-deductions" :checked="deductions.length" v-on:click="addDeduction()" v-on:keyup="processKeyPress">
            &nbsp;Yes
            <input type="radio" class="no-checkbox" :checked="!deductions.length" name="no-deductions" v-on:click="clearDeductions()" v-on:keyup="processKeyPress">
            &nbsp;No
        </span>

        <div class="row no-gutters" v-if="deductions.length">
            <div class="left-line"></div>
            <div class="col-md-11">

                <!-- headers -->
                <div class="row no-gutters">
                    <div class="col-md-6 exemptions">
                        <label class="exemption-label">Chart Label</label>
                    </div>
                    <div class="col-md-5 exemptions">
                        <label class="exemption-label">Deduction</label>
                    </div>
                    <div class="col-md-1 exemptions"></div>
                </div>

                <div class="row no-gutters desktop-only" v-for="(deduction, idx) in deductions" v-bind:key="idx">

                    <!-- label -->
                    <div class="col-md-6 exemptions">
                        <label class="exemption-label mobile-only">Chart Label</label>
                        <input placeholder="Label" class="form-control" v-model="deduction.label" v-on:keyup="processKeyPress" />
                    </div>

                    <!-- value -->
                    <div class="col-md-5 exemptions">
                        <label class="exemption-label mobile-only">Deduction</label>
                        <div class="input-group">
                            <input placeholder="Deduction" type="number" class="form-control"  v-model="deduction.value" v-on:keyup="processKeyPress" />
                            <div class="input-group-append">
                                <button type="button" class="btn btn-sm btn-secondary" :class="{ active: deduction.value_mode == 'currency' }" v-on:click="deduction.value_mode = 'currency'">{{ mode }}</button>
                            </div>
                            <div class="input-group-append">
                                <button type="button" :class="{ active: deduction.value_mode == 'percent' }" v-on:click="deduction.value_mode = 'percent'" class="btn btn-sm btn-secondary">%</button>
                            </div>
                        </div>
                    </div>

                    <!-- remove -->
                    <div class="col-md-1 exemptions">
                        <button type="button" class="btn btn-danger desktop-only" v-on:click="removeDeduction(idx)">X</button>
                        <button type="button" class="btn btn-danger mobile-only" v-on:click="removeDeduction(idx)">Remove Deduction</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- exemption examples and add button -->
        <small class="form-text text-muted">
            Examples: Social Security, Medicare, Health Insurance
            <button type="button" class="btn btn-link float-right add-exemption" v-if="deductions.length" v-on:click="addDeduction()" tabindex="0">
                <i>Add Another</i>
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
        processKeyPress: function (event) {
            if (event.keyCode == 13) this.$emit('addIncome');
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

.left-line {
    border-left: thick solid #eae9e9;
    margin-right:10px;
}


</style>