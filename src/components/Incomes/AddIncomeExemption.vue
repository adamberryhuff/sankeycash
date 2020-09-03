<template>
    <span>

        <!-- yes/no button -->
        <span class="float-right">
            <input type="radio" name="yes-exemptions" :checked="exemptions.length" v-on:click="addExemption()" v-on:keyup="processKeyPress">
            &nbsp;{{ $t('common.yes') }}
            <input type="radio" class="no-checkbox" :checked="!exemptions.length" name="no-exemptions" v-on:click="clearExemptions()" v-on:keyup="processKeyPress">
            &nbsp;{{ $t('common.no') }}
        </span>

        <div class="row no-gutters" v-if="exemptions.length">
            <div class="left-line"></div>
            <div class="col-md-11">

                <!-- headers -->
                <div class="row no-gutters">
                    <div class="col-md-3 exemptions">
                        <label class="exemption-label">{{ $t('common.chart_label') }}</label>
                    </div>
                    <div class="col-md-4 exemptions">
                        <label class="exemption-label">{{ $t('common.contribution') }}</label>
                    </div>
                    <div class="col-md-4 exemptions">
                        <label class="exemption-label">{{ $t('common.match') }}</label>
                    </div>
                    <div class="col-md-1 exemptions"></div>
                </div>

                <div class="row no-gutters desktop-only" v-for="(exemption, idx) in exemptions" v-bind:key="idx">

                    <!-- label -->
                    <div class="col-md-3 exemptions">
                        <label class="exemption-label mobile-only">{{ $t('common.chart_label') }}</label>
                        <input :placeholder="$t('common.label')" class="form-control" v-model="exemption.label" v-on:keyup="processKeyPress" />
                    </div>

                    <!-- value -->
                    <div class="col-md-4 exemptions">
                        <label class="exemption-label mobile-only">{{ $t('common.contribution') }}</label>
                        <div class="input-group">
                            <input :placeholder="$t('common.contribution')" type="number" class="form-control"  v-model="exemption.value" v-on:keyup="processKeyPress" />
                            <div class="input-group-append">
                                <button type="button" class="btn btn-sm btn-secondary" :class="{ active: exemption.value_mode == 'currency' }" v-on:click="exemption.value_mode = 'currency'">{{ mode }}</button>
                            </div>
                            <div class="input-group-append">
                                <button type="button" :class="{ active: exemption.value_mode == 'percent' }" v-on:click="exemption.value_mode = 'percent'" class="btn btn-sm btn-secondary">%</button>
                            </div>
                        </div>
                    </div>

                    <!-- match -->
                    <div class="col-md-4 exemptions">
                        <label class="exemption-label mobile-only">{{ $t('common.match') }}</label>
                        <div class="input-group">
                            <input :placeholder="$t('common.match_short')" type="number" class="form-control" v-model="exemption.match" v-on:keyup="processKeyPress" />
                            <div class="input-group-append">
                                <button type="button" class="btn btn-sm btn-secondary" :class="{ active: exemption.match_mode == 'currency' }" v-on:click="exemption.match_mode = 'currency'">{{ mode }}</button>
                            </div>
                            <div class="input-group-append">
                                <button type="button" class="btn btn-sm btn-secondary" :class="{ active: exemption.match_mode == 'percent' }" v-on:click="exemption.match_mode = 'percent'">%</button>
                            </div>
                        </div>
                    </div>

                    <!-- remove -->
                    <div class="col-md-1 exemptions">
                        <button type="button" class="btn btn-danger desktop-only" v-on:click="removeExemption(idx)">X</button>
                        <button type="button" class="btn btn-danger mobile-only" v-on:click="removeExemption(idx)">{{ $t('incomes.exemption_remove') }}</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- exemption examples and add button -->
        <small class="form-text text-muted">
            {{ $t('incomes.exemption_examples') }}
            <button type="button" class="btn btn-link float-right add-exemption" v-if="exemptions.length" v-on:click="addExemption()" tabindex="0">
                <i>{{ $t('common.add_another') }}</i>
            </button>
        </small>
    </span>
</template>

<script>


export default {
    name: 'AddIncomeExeption',
    props: ['exemptions', 'mode'],
    methods: {
        removeExemption: function (idx) {
            this.$emit('removeExemption', idx);
        },
        addExemption: function () {
            this.$emit('addExemption');
        },
        clearExemptions: function () {
            this.$emit('clearExemptions');
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