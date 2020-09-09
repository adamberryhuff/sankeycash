<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a v-on:click="resetConfig()" class="navbar-brand" id="logo-main" href="#"><span class="fa fa-money"></span> {{ $t('product') }}</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="instructions()" data-toggle="tooltip" data-placement="bottom" :title="$t('header.instructions_tt')">{{ $t('header.instructions') }} </a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="loadTestData()" data-toggle="tooltip" data-placement="bottom" id="demo-btn" :title="$t('header.demo_tt')">{{ $t('header.demo') }} </a>
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
            <div class="btn-group percent-buttons" style="margin-right:10px;" role="group" aria-label="Basic example">
                <button type="button" v-on:click="$emit('setTimeline', 'annual')" class="btn btn-secondary" :class="{ active: timeline == 'annual' }">Year</button>
                <button type="button" v-on:click="$emit('setTimeline', 'monthly')" class="btn btn-secondary" :class="{ active: timeline == 'monthly' }">Month</button>
            </div>
            <div class="btn-group percent-buttons" style="margin-right:10px;" role="group" aria-label="Basic example">
                <button type="button" v-on:click="toggleMode('$')" class="btn btn-secondary" :class="{ active: mode == '$' }">$</button>
                <button type="button" v-on:click="toggleMode('£')" class="btn btn-secondary" :class="{ active: mode == '£' }">£</button>
                <button type="button" v-on:click="toggleMode('€')" class="btn btn-secondary" :class="{ active: mode == '€' }">€</button>
            </div>
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle languages" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="fa fa-globe"></span>
                </button>
                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                    <a class="dropdown-item" href="#" v-for="(language, idx) in languages" v-bind:key="idx" v-on:click="setLanguage(language.key)">
                        {{ language.label }}<span class="float-right" style="color: rgba(108, 117, 125, 0.39); font-weight:bold;">{{ language.currency }}</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a class="dropdown-item" href="#" v-on:click="addLanguage()" download>Add Language</a>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
import test from '../assets/sankey.json';

export default {
    name: 'Navbar',
    props: [
        'itemizedIncomes', 'itemizedExpenses', 'itemizedInvestments',
        'mode', 'timeline', 'percent', 'canvas', 'chartShowing', 'colors'
    ],
    data () {
        return {
            languages: [
                {
                    key: 'en',
                    label: 'English',
                    currency: '$'
                },
                {
                    key: 'de',
                    label: 'German',
                    currency: '€'
                }
            ],
        }
    },
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
            let introJS = this.$intro();
            introJS.setOption("nextLabel", this.$t('common.next'));
            introJS.setOption("prevLabel", this.$t('common.back'));
            introJS.setOption("skipLabel", this.$t('common.skip'));
            introJS.setOption("doneLabel", this.$t('common.done'));
            introJS.setOption("showStepNumbers", false);
            introJS.addSteps([
                {
                    step: 1,
                    element: document.getElementById('logo-main'),
                    intro: this.$t('instructions.example') + '<div id="sankey-test"></div>' + this.$t('instructions.generate') + '<br>' + this.$t('instructions.demo')
                }, {
                    step: 2,
                    element: document.getElementById('incomes-label'),
                    intro: this.$t('incomes.instructions')
                }, {
                    step: 3,
                    element: document.getElementById('expenses-label'),
                    intro: this.$t('expenses.instructions')
                }, {
                    step: 4,
                    element: document.getElementById('investments-label'),
                    intro: this.$t('investments.instructions')
                }, {
                    step: 5,
                    element: document.getElementById('navbarSupportedContent'),
                    intro: this.$t('instructions.header')
                }
            ]);
            var reset = this.chartShowing ? false : true;
            introJS.oncomplete(() => {
                if (reset) this.reset();
            });

            introJS.start();
            let skip_btn = document.getElementsByClassName('introjs-skipbutton')[0];
            let overlay = document.getElementsByClassName('introjs-overlay')[0];
            skip_btn.addEventListener('click', () => {
                if (reset) this.reset();
            });
            overlay.addEventListener('click', () => {
                if (reset) this.reset();
            });
            if (!this.chartShowing) this.load();
            this.$emit('forceRender');
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
                investments: this.itemizedInvestments,
                timeline: this.timeline,
                mode: this.mode,
                percent: this.percent,
                canvas: this.canvas,
                language: this.$i18n.locale,
                colors: this.colors
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
                        a.$emit('setItemizedIncomes', config.income);
                        a.$emit('setItemizedExpenses', config.expenses);
                        a.$emit('setItemizedInvestments', config.investments);
                        if (config.timeline) a.$emit('setTimeline', config.timeline);
                        if (config.mode) a.$emit('setMode', config.mode);
                        if (config.percent !== undefined) a.$emit('setPercent', config.percent);
                        if (config.canvas) a.$emit('setCanvas', config.canvas);
                        if (config.language) a.$i18n.locale = config.language;
                        if (config.colors) a.$emit('setColors', config.colors);
                        a.$emit('alert', a.$t('toasts.config_imported'));
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
                this.reset();
                this.$emit('alert', this.$t('toasts.data_reset'));
            }
        },
        reset: function () {
            this.$emit('setItemizedInvestments', []);
            this.$emit('setItemizedExpenses', []);
            this.$emit('setItemizedIncomes', []);
            window.scrollTo(0,0);
        },
        loadTestData: function () {
            if (!this.chartShowing || confirm(this.$t('header.demo_confirmation'))) {
                this.load();
                this.$emit('alert', 'Demo Data Loaded');
            }
        },
        load: function () {
            this.$emit('setItemizedInvestments', JSON.parse(JSON.stringify(test.investments)));
            this.$emit('setItemizedExpenses', JSON.parse(JSON.stringify(test.expenses)));
            this.$emit('setItemizedIncomes', JSON.parse(JSON.stringify(test.income)));
        },
        setLanguage: function (key) {
            this.$i18n.locale = key;
            this.toggleMode(this.$t('currency'));
            window.$(function () {
                window.$('[data-toggle="tooltip"]').tooltip('dispose');
                window.$('[data-toggle="tooltip"]').tooltip('enable');
            })
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
        },
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