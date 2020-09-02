<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a v-on:click="resetConfig()" class="navbar-brand" href="#" v-intro="'<div></div>'" v-intro-step="1"><span class="fa fa-money"></span> SankeyCash</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto" v-intro="'The chart will render in realtime at the top of the page.<br><br>In the nav you can render the demo chart, download a PNG of your chart, import a previously exported chart configuration, export the current chart configuration, or reset the chart data.'" v-intro-step="5">
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="instructions()" data-toggle="tooltip" data-placement="bottom" title="View chart rendering instructions.">Instructions </a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="loadTestData()" data-toggle="tooltip" data-placement="bottom" title="Load demo data and render demo chart.">Demo </a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="download()" data-toggle="tooltip" data-placement="bottom" title="Download a PNG image of the chart.">Download </a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="importConfig()" data-toggle="tooltip" data-placement="bottom" title="Import a chart configuration file.">Import </a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="exportConfig()" data-toggle="tooltip" data-placement="bottom" title="Export a chart configuration file.">Export </a>
                </li>
                <li class="nav-item active">
                    <a class="nav-link" href="#" v-on:click="resetConfig()" data-toggle="tooltip" data-placement="bottom" title="Reset the chart data.">Reset </a>
                </li>
                <li class="nav-item active" id="uploader"></li>
            </ul>
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
                alert("You must input chart data before you can download the chart!");
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
                alert("You must input chart data before you can export the config file!");
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
                    var config = JSON.parse(e.target.result);
                    if (typeof config !== 'object' || config.investments === undefined
                        || config.expenses === undefined || config.income === undefined) {
                        alert("Invalid input file!");
                    } else {
                        a.$emit('setItemizedInvestments', config.investments);
                        a.$emit('setItemizedExpenses', config.expenses);
                        a.$emit('setItemizedIncomes', config.income);
                        a.$emit('alert', 'Config Imported');
                    }
                };
            }) (f);
            reader.readAsText(f);
        },
        resetConfig: function () {
            let fresh = !this.itemizedInvestments.length;
            fresh = fresh && !this.itemizedExpenses.length;
            fresh = fresh && !this.itemizedIncomes.length;
            if (fresh || confirm("Are you sure you want to reset?")) {
                this.$emit('setItemizedInvestments', []);
                this.$emit('setItemizedExpenses', []);
                this.$emit('setItemizedIncomes', []);
                this.$emit('alert', 'Data Reset');
            }
        },
        loadTestData: function () {
            let str = "Are you sure you want to load demo data? ";
            str    += "Your current configuration will be lost.";
            if (!this.chartShowing || confirm(str)) {
                this.$emit('setItemizedInvestments', test.investments);
                this.$emit('setItemizedExpenses', test.expenses);
                this.$emit('setItemizedIncomes', test.income);
                this.$emit('alert', 'Demo Data Loaded');
            }
        }
    }
}

</script>

<style scoped>
.fa {
    color: #28A745;
}
</style>