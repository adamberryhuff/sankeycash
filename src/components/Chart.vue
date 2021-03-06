<template>
    <div v-show="show">
        <div class="sankey-wrapper" :class="{ 'sankey-scroll': canvas == 'medium' || canvas == 'large' }">
            <div id="sankey" class="sankey" :class="{ 'sankey-md': canvas == 'medium', 'sankey-lg': canvas == 'large' }"></div>
        </div>
        <div style="position: relative;">
            <span class="float-right switch">
                <div class="btn-group percent-buttons" role="group" aria-label="Basic example">
                    <input type="color" class="btn btn-secondary color-inputs" v-model="colors.income_light" />
                    <input type="color" class="btn btn-secondary color-inputs" v-model="colors.expenses_light" />
                    <input type="color" class="btn btn-secondary color-inputs" v-model="colors.investments_light" />
                    <input type="color" class="btn btn-secondary color-inputs" v-model="colors.unallocated_light" />
                </div>
                <div class="btn-group percent-buttons" role="group" aria-label="Basic example">
                    <button type="button" v-on:click="toggleCanvas('small')" class="btn btn-secondary canvas-small" :class="{ active: canvas == 'small' }"><span class="fa fa-square"></span></button>
                    <button type="button" v-on:click="toggleCanvas('medium')" class="btn btn-secondary canvas-medium" :class="{ active: canvas == 'medium' }"><span class="fa fa-square"></span></button>
                    <button type="button" v-on:click="toggleCanvas('large')" class="btn btn-secondary canvas-large" :class="{ active: canvas == 'large' }"><span class="fa fa-square"></span></button>
                </div>
                <div class="btn-group percent-buttons" role="group" aria-label="Basic example">
                    <button type="button" v-on:click="togglePercent(false)" class="btn btn-secondary" :class="{ active: !percent }">{{ mode }}</button>
                    <button type="button" v-on:click="togglePercent(true)" class="btn btn-secondary" :class="{ active: percent }">%</button>
                </div>
            </span>
        </div>
        <div class="btn-group chart-up" role="group">
            <button type="button" class="btn btn-secondary" v-on:click="viewChart()" v-show="!atTop && chartShowing">
                <span class="fa fa-arrow-up"> {{ $t('common.chart') }}</span>
            </button>
        </div>
        <br>
    </div>
</template>

<script>
import google from 'google';
import util from '../util.js';
import html2canvas from 'html2canvas';

export default {
    name: 'Chart',
    props: [
        'chartShowing', 'mode', 'percent', 'canvas', 'colors',
        'itemizedIncomes', 'itemizedExpenses', 'itemizedInvestments',
        'grossSum', 'netSum', 'taxSum', 'unallocatedSum', 'investmentSum', 'expenseSum',
        'deductionSum'
    ],
    data () {
        return {
            // chart labels
            gross:       { label: false, value: false },
            net:         { label: false, value: false },
            tax:         { label: false, value: false },
            deductions:  { label: false, value: false },
            unallocated: { label: false, value: false },
            expenses:    { label: false, value: false },
            investments: { label: false, value: false },

            // chart rendering
            chart: false,
            color_mode: 'gradient',
            atTop: true,
            coded: [],
            nodes: [],
        }
    },
    mounted () {
        google.charts.load('current', {'packages':['sankey']});
        this.setChartLabels();
    },
    created () {
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);
    },
    destroyed () {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    },
    watch: {
        grossSum: function () {
            this.render();
        },
        netSum: function () {
            this.render();
        },
        taxSum: function () {
            this.render();
        },
        unallocatedSum: function () {
            this.render();
        },
        expenseSum: function () {
            this.render();
        },
        investmentSum: function () {
            this.render();
        },
        '$i18n.locale': function () {
            this.setChartLabels();
            this.render();
        },
        itemizedIncomes: function () {
            this.render();
        },
        itemizedExpenses: function () {
            this.render();
        },
        itemizedInvestments: function () {
            this.render();
        },
        percent: function () {
            this.render();
        },
        canvas: function () {
            this.render();
        },
        mode: function () {
            this.render();
        },
        'colors.income_light': function () {
            this.colors.income_dark = util.shadeColor(this.colors.income_light, -40);
            this.render();
        },
        'colors.expenses_light': function () {
            this.colors.expenses_dark = util.shadeColor(this.colors.expenses_light, -40);
            this.render();
        },
        'colors.investments_light': function () {
            this.colors.investments_dark = util.shadeColor(this.colors.investments_light, -40);
            this.render();
        },
        'colors.unallocated_light': function () {
            this.colors.unallocated_dark = util.shadeColor(this.colors.unallocated_light, -40);
            this.render();
        }
    },
    computed: {
        show: function () {
            return this.grossSum || this.netSum || this.taxSum || this.deductionSum
                || this.unallocatedSum || this.expenseSum || this.investmentSum;
        }
    },
    methods: {
        render: function (download=false) {
            if (!this.show) {
                return;
            }
            this.gross.value       = this.formatValue(this.grossSum);
            this.net.value         = this.formatValue(this.netSum);
            this.tax.value         = this.formatValue(this.taxSum);
            this.deductions.value  = this.formatValue(this.deductionSum);
            this.unallocated.value = this.formatValue(this.unallocatedSum);
            this.expenses.value    = this.formatValue(this.expenseSum);
            this.investments.value = this.formatValue(this.investmentSum);
            window.$(function () {
                window.$('[data-toggle="tooltip"]').tooltip('dispose');
                window.$('[data-toggle="tooltip"]').tooltip('enable');
            })
            google.charts.setOnLoadCallback(() => {
                this.chart = new google.visualization.DataTable();
                this.chart.addColumn('string', 'From');
                this.chart.addColumn('string', 'To');
                this.chart.addColumn('number', 'Amount');
                this.coded             = [];
                this.nodes             = [];
                this.drawIncomeBreakdown();
                this.drawExpensesBreakdown();
                this.drawInvestmentBreakdown();

                var canvas = document.getElementById('sankey-test');
                if (!canvas) canvas = document.getElementById('sankey');
                var chart = new google.visualization.Sankey(canvas);
                chart.draw(this.chart, this.getChartStyling());
                if (download) this.downloadChart();
            });
        },
        /**************************************************************
         * Income
         **************************************************************/
        drawIncomeBreakdown: function () {
            this.drawGrossIncome();
            this.drawTaxes();
            this.drawDeductions();
            this.drawNetIncome();
        },
        // draw lines: income streams -> gross
        // treat employee matches as separate income streams
        drawGrossIncome: function () {
            this.itemizedIncomes.forEach(stream => {
                stream = JSON.parse(JSON.stringify(stream));
                stream.value = this.formatValue(stream.value);
                this.addChartRow(stream, this.gross, this.colors.income_dark, this.colors.income_light);
                stream.exemptions.forEach(exemption => {
                    exemption = JSON.parse(JSON.stringify(exemption));
                    if (exemption.match > 0) {
                        exemption.match = this.formatValue(exemption.match);
                        this.addChartRow({
                            label: exemption.label+' Match', value: exemption.match
                        }, this.gross, this.colors.income_dark, this.colors.income_light);
                    }
                });
            })
        },
        // draw line: gross -> taxes
        // draw line: taxes -> taxes
        // draw line: taxes -> taxes
        drawTaxes: function () {
            this.addChartRow(this.gross, this.tax, this.colors.income_light, this.colors.expenses_light);
            this.addChartRow(this.tax, this.tax, this.colors.expenses_light, this.colors.expenses_light);
            this.addChartRow(this.tax, this.tax, this.colors.expenses_light, this.colors.expenses_dark);
        },
        // draw line: gross      -> deductions
        // draw line: deductions -> deductions
        // draw line: deductions -> deductions
        drawDeductions: function () {
            this.itemizedIncomes.forEach(stream => {
                stream.deductions.forEach(deduction => {
                    deduction = JSON.parse(JSON.stringify(deduction));
                    deduction.value = this.formatValue(deduction.value);
                    this.addChartRow(this.gross, deduction, this.colors.expenses_light, this.colors.expenses_light);
                    this.addChartRow(deduction, this.deductions, this.colors.expenses_light, this.colors.expenses_light);
                });
            });
            this.addChartRow(this.deductions, this.deductions, this.colors.expenses_light, this.colors.expenses_dark);
        },
        // draw line: gross -> net
        drawNetIncome: function () {
            this.addChartRow(this.gross, this.net, this.colors.income_light, this.colors.income_light);
        },
        /**************************************************************
         * Expenses
         **************************************************************/
        drawExpensesBreakdown: function () {
            this.itemizedExpenses.forEach(expense => {
                expense = JSON.parse(JSON.stringify(expense));
                expense.value = this.formatValue(expense.value);
                this.addChartRow(this.net, expense, this.colors.income_light, this.colors.expenses_light);
                this.addChartRow(expense, this.expenses, this.colors.expenses_light, this.colors.expenses_dark);
            })
        },
        /**************************************************************
         * Investments
         **************************************************************/
        drawInvestmentBreakdown: function () {
            this.drawExemptions();
            this.itemizedInvestments.forEach(investment => {
                investment = JSON.parse(JSON.stringify(investment));
                investment.value = this.formatValue(investment.value);
                this.addChartRow(this.net, investment, this.colors.income_light, this.colors.investments_light);
                this.addChartRow(investment, this.investments, this.colors.investments_light, this.colors.investments_dark);
            })
            this.addChartRow(this.net, this.unallocated, this.colors.income_light, this.colors.unallocated_light);
            this.addChartRow(this.unallocated, this.unallocated, this.colors.unallocated_light, this.colors.unallocated_dark);
        },
        drawExemptions: function () {
            this.itemizedIncomes.forEach(stream => {
                stream.exemptions.forEach(exemption => {
                    exemption = JSON.parse(JSON.stringify(exemption));
                    exemption.value = this.formatValue(exemption.value + exemption.match);
                    this.addChartRow(this.net, exemption, this.colors.income_light, this.colors.investments_light);
                    this.addChartRow(exemption, this.investments, this.colors.investments_light, this.colors.investments_dark);
                });
            })
        },
        /**************************************************************
         * Chart Stuff
         **************************************************************/
        addChartRow: function (from, to, from_color, to_color) {
            let mode = this.percent ? '%' : this.mode;
            if (from.value == 0 || to.value == 0) return;
            var append = to.label == from.label ? ' ' : '';
            let value = Math.min(from.value, to.value);
            let from_label = from.label + ' (';
            from_label += util.formatMoney(from.value, mode);
            from_label += ')';
            let to_label   = to.label + append + ' (';
            to_label += util.formatMoney(to.value, mode);
            to_label += ')';
            if (!this.nodes.includes(from_label)) this.coded.push(from_color);
            if (!this.nodes.includes(to_label)) this.coded.push(to_color);
            this.nodes.push(from_label);
            this.nodes.push(to_label);
            this.chart.addRow([from_label, to_label, value]);
            to.label += append;
        },
        viewChart: () => window.scrollTo(0,0),
        downloadChartTrigger: function () {
            this.color_mode = 'source';
            this.render(true);
        },
        downloadChart: function () {
            window.scrollTo(0,0);
            html2canvas(document.querySelector("#sankey")).then(canvas => {
                let uri = canvas.toDataURL();
                var link = document.createElement("a");
                link.download = "sankeycash.png";
                link.href = uri;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
            this.color_mode = 'gradient';
            this.render();
        },
        getChartStyling: function () {
            // light yellow - #fdbf6f, #ffff99
            // var colors = [
            //     '#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f',
            //     '#cab2d6', '#ffff99', '#1f78b4', '#33a02c'
            // ];
            return {
                sankey: {
                    node: {
                        colors: this.coded,
                        nodePadding: 7
                    },
                    link: {
                        colorMode: this.color_mode,
                        colors: this.coded
                    },
                    iterations: 0,
                },
            }
        },
        handleScroll: function () {
            this.atTop = window.scrollY < 300;
        },
        handleResize: function () {
            this.render();
        },
        formatValue: function (num) {
            return this.percent ? Math.round(num/this.grossSum*100*10)/10 : num;
        },
        togglePercent: function (percent) {
            this.$emit('setPercent', percent);
        },
        toggleCanvas: function (size) {
            this.$emit('setCanvas', size);
        },
        setChartLabels: function () {
            this.gross = {
                label: this.$t('common.gross'),
                value: this.formatValue(this.grossSum)
            };
            this.net = {
                label: this.$t('common.net'),
                value: this.formatValue(this.netSum)
            };
            this.tax = {
                label: this.$t('common.taxes'),
                value: this.formatValue(this.taxSum)
            };
            this.deductions = {
                label: this.$t('common.deductions'),
                value: this.formatValue(this.deductionSum)
            };
            this.unallocated = {
                label: this.$t('common.unallocated'),
                value: this.formatValue(this.unallocatedSum)
            };
            this.expenses = {
                label: this.$t('common.expenses'),
                value: this.formatValue(this.expenseSum)
            };
            this.investments = {
                label: this.$t('common.investments'),
                value: this.formatValue(this.investmentSum)
            };
        },
    }
}
</script>

<style scoped>

.sankey {
    height:300px;
    width: 100%;
    min-width:1000px;
    margin-bottom:15px;
}

.sankey-md {
    height:450px;
    width: 150%;
}

.sankey-lg {
    height:600px;
    width:200%;
}

.chart-up {
    position:fixed;
    bottom:0px;
    left:0px;
    z-index:10000;
    border-radius:
}

.chart-up .btn-secondary {
    box-shadow: 0 0 0 .2rem rgba(130,138,145,.5);
}

.chart-up .btn:first-child {
    border-radius: 0rem 0rem 0rem 0rem !important;
}
.chart-up .btn:last-child {
    border-radius: 0rem 0.25rem 0rem 0rem !important;
}

.switch {
    margin-right:30px;
}

.btn-secondary {
    font-weight:bold !important;
}

.sankey-wrapper {
    width: 100%;
    overflow-x: hidden;
    overflow-y: hidden;
}

.sankey-scroll {
    overflow-x: scroll;
}

@media only screen and (max-width: 1000px) {
    .sankey-wrapper {
        overflow-x: scroll;
    }
}

.percent-buttons {
    margin-left:10px;
}

.canvas-small {
    font-size: 5px;
}
.canvas-medium {
    font-size: 10px;
}
.canvas-large {
    font-size: 15px;
}

.color-inputs {
    width: 40px;
    height: 36.5px;
    padding: .6rem .7rem;
}

</style>

