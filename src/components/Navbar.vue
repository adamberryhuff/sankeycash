<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a v-on:click="resetConfig()" class="navbar-brand" href="#" v-intro="'<div></div>'" v-intro-step="1"><span class="fa fa-money"></span> {{ $t('product') }}</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent" v-intro="$t('instructions.header')" v-intro-step="5">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="instructions()" data-toggle="tooltip" data-placement="bottom" :title="$t('header.instructions_tt')">{{ $t('header.instructions') }} </a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="loadTestData()" data-toggle="tooltip" data-placement="bottom" :title="$t('header.demo_tt')">{{ $t('header.demo') }} </a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="download()" data-toggle="tooltip" data-placement="bottom" :title="$t('header.download_tt')">{{ $t('header.download') }} </a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="importConfig()" data-toggle="tooltip" data-placement="bottom" :title="$t('header.import_tt')" >{{ $t('header.import') }} </a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="exportConfig()" data-toggle="tooltip" data-placement="bottom" :title="$t('header.export_tt')">{{ $t('header.export') }} </a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="resetConfig()" data-toggle="tooltip" data-placement="bottom" :title="$t('header.reset_tt')">{{ $t('header.reset') }} </a>
                </li>
                <li class="nav-item active" id="uploader"></li>
            </ul>
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle languages" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="fa fa-globe"></span>
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <a class="dropdown-item" href="#" v-for="(language, key) in $t('languages')" v-bind:key="key" v-on:click="setLanguage(key)">
                        {{ language }}
                    </a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="#" v-on:click="addLanguage()" download>Add Language</a>

                </div>
            </div>
            <div class="btn-group percent-buttons" role="group" aria-label="Basic example">
                <button type="button" v-on:click="toggleMode('$')" class="btn btn-secondary" :class="{ active: mode == '$' }">$</button>
                <button type="button" v-on:click="toggleMode('£')" class="btn btn-secondary" :class="{ active: mode == '£' }">£</button>
                <button type="button" v-on:click="toggleMode('€')" class="btn btn-secondary" :class="{ active: mode == '€' }">€</button>
            </div>
        </div>
    </nav>
</template>

<script>
import test from '../assets/sankey.json';

export default {
    name: 'Navbar',
    props: [
        'chartShowing', 'itemizedIncomes', 'itemizedExpenses', 'itemizedInvestments', 'mode'
    ],
    methods: {
        toggleMode: function (mode) {
            this.$emit('setMode', mode);
        },
        download: function () {
            if (!this.chartShowing) {
                alert(this.$t('header.download_error'));
                return;
            }
            this.$emit('download');
        },
        instructions: function () {
            this.$intro().start();
            this.$intro().showHints();
        },
        exportConfig: function () {
            if (!this.chartShowing) {
                alert(this.$t('header.export_error'));
                return;
            }
            let filename = 'sankeycash.json';
            let contents = {
                income: this.itemizedIncomes,
                expenses: this.itemizedExpenses,
                investments: this.itemizedInvestments
            };
            contents = encodeURIComponent(JSON.stringify(contents));
            var element  = document.createElement('a');
            element.setAttribute('href', 'data:application/json;charset=utf-8,' + contents);
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        },
        importConfig: function () {
            var uploader = document.createElement("INPUT");
            uploader.id = 'config';
            uploader.style.display = "none";
            uploader.setAttribute("type", "file");
            uploader.click();
            document.getElementById('uploader').appendChild(uploader);
            uploader.addEventListener("change", this.configUploaded, false);
        },
        configUploaded: function () {
            var f = document.getElementById('config').files[0];
            var reader = new FileReader();
            var a = this;
            reader.onload = (() =>  {
                document.getElementById('config').remove();
                return function(e) {
                    try {
                        var config = JSON.parse(e.target.result);
                    } catch (e) {
                        alert(a.$t('header.import_error'));
                        return;
                    }
                    if (typeof config !== 'object' || config.investments === undefined
                        || config.expenses === undefined || config.income === undefined) {
                        alert(a.$t('header.import_error'));
                    } else {
                        a.$emit('setItemizedInvestments', config.investments);
                        a.$emit('setItemizedExpenses', config.expenses);
                        a.$emit('setItemizedIncomes', config.income);
                        a.$emit('alert', this.$t('toasts.config_imported'));
                    }
                };
            }) (f);
            reader.readAsText(f);
        },
        resetConfig: function () {
            let fresh = !this.itemizedInvestments.length;
            fresh = fresh && !this.itemizedExpenses.length;
            fresh = fresh && !this.itemizedIncomes.length;
            if (fresh || confirm(this.$t('header.reset_confirmation'))) {
                this.$emit('setItemizedInvestments', []);
                this.$emit('setItemizedExpenses', []);
                this.$emit('setItemizedIncomes', []);
                this.$emit('alert', this.$t('toasts.data_reset'));
            }
        },
        loadTestData: function () {
            if (!this.chartShowing || confirm(this.$t('header.demo_confirmation'))) {
                this.$emit('setItemizedInvestments', test.investments);
                this.$emit('setItemizedExpenses', test.expenses);
                this.$emit('setItemizedIncomes', test.income);
                this.$emit('alert', 'Demo Data Loaded');
            }
        },
        setLanguage: function (key) {
            this.$i18n.locale = key;
            this.toggleMode(this.$t('currency'));
        },
        addLanguage: function () {
            var contents = require("../assets/content/en.json");
            contents = encodeURIComponent(JSON.stringify(contents))
            var element  = document.createElement('a');
            element.setAttribute('href', 'data:application/json;charset=utf-8,' + contents);
            element.setAttribute('download', 'en.json');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            alert(this.$t('add'));
        }
    }
}

</script>

<style scoped>
.fa {
    color: #28A745;
}

.languages {
    background-color: transparent !important;
    color: #6c757d !important;
    border-color: transparent !important;
}

.languages:focus {
    box-shadow: unset !important;
}

.languages:active {
    box-shadow: unset !important;
    border-color: transparent !important;
    background-color: transparent !important;
}

.languages span {
    color: #6c757d;
    font-size:20px;
}

</style>