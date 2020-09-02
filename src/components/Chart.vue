<template>
    <div v-show="this.gross.value > 0">
        <div class="sankey-wrapper" :class="{ 'sankey-scroll': canvas == 'medium' || canvas == 'large' }">
            <div id="sankey" class="sankey" :class="{ 'sankey-md': canvas == 'medium', 'sankey-lg': canvas == 'large' }"></div>
        </div>
        <div style="position: relative;">
            <span class="float-right switch">
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
        'chartShowing', 'mode',
        'itemizedIncomes', 'itemizedExpenses', 'itemizedInvestments',
        'grossSum', 'netSum', 'taxSum', 'unallocatedSum', 'investmentSum', 'expenseSum',
        'deductionSum'
    ],
    data () {
        return {
            // chart labels
            gross: {
                label: this.$t('common.gross'),
                value: this.formatValue(this.grossSum)
            },
            net: {
                label: this.$t('common.net'),
                value: this.formatValue(this.netSum)
            },
            tax: {
                label: this.$t('common.taxes'),
                value: this.formatValue(this.taxSum)
            },
            deductions: {
                label: this.$t('common.deductions'),
                value: this.formatValue(this.deductionSum)
            },
            unallocated: {
                label: this.$t('common.unallocated'),
                value: this.formatValue(this.unallocatedSum)
            },
            expenses: {
                label: this.$t('common.expenses'),
                value: this.formatValue(this.expenseSum)
            },
            investments: {
                label: this.$t('common.investments'),
                value: this.formatValue(this.investmentSum)
            },

            // chart rendering
            chart: false,
            colors: 'gradient',
            atTop: true,
            percent: false,
            canvas: 'small'
        }
    },
    mounted () {
        google.charts.load('current', {'packages':['sankey']});
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
        }
    },
    methods: {
        render: function (download=false) {
            if (!this.grossSum && !this.netSum && !this.taxSum && !this.deductionSum
                && !this.unallocatedSum && !this.expenseSum  && !this.investmentSum) {
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
                this.drawIncomeBreakdown();
                this.drawExpensesBreakdown();
                this.drawInvestmentBreakdown();

                var canvas = document.getElementById('sankey');
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
                this.addChartRow(stream, this.gross);
                stream.exemptions.forEach(exemption => {
                    exemption = JSON.parse(JSON.stringify(exemption));
                    if (exemption.match > 0) {
                        exemption.match = this.formatValue(exemption.match);
                        this.addChartRow({
                            label: exemption.label+' Match', value: exemption.match
                        }, this.gross);
                    }
                });
            })
        },
        // draw line: gross -> taxes
        // draw line: taxes -> taxes
        // draw line: taxes -> taxes
        drawTaxes: function () {
            this.addChartRow(this.gross, this.tax);
            this.addChartRow(this.tax, this.tax);
            this.addChartRow(this.tax, this.tax);
        },
        // draw line: gross      -> deductions
        // draw line: deductions -> deductions
        // draw line: deductions -> deductions
        drawDeductions: function () {
            this.addChartRow(this.gross, this.deductions);
            this.addChartRow(this.deductions, this.deductions);
            this.addChartRow(this.deductions, this.deductions);
        },
        // draw line: gross -> net
        drawNetIncome: function () {
            this.addChartRow(this.gross, this.net);
        },
        /**************************************************************
         * Expenses
         **************************************************************/
        drawExpensesBreakdown: function () {
            this.itemizedExpenses.forEach(expense => {
                expense = JSON.parse(JSON.stringify(expense));
                expense.value = this.formatValue(expense.value);
                this.addChartRow(this.net, expense);
                this.addChartRow(expense, this.expenses);
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
                this.addChartRow(this.net, investment);
                this.addChartRow(investment, this.investments);
            })
            this.addChartRow(this.net, this.unallocated);
            this.addChartRow(this.unallocated, this.unallocated);
        },
        drawExemptions: function () {
            this.itemizedIncomes.forEach(stream => {
                stream.exemptions.forEach(exemption => {
                    exemption = JSON.parse(JSON.stringify(exemption));
                    exemption.value = this.formatValue(exemption.value + exemption.match);
                    this.addChartRow(this.net, exemption);
                    this.addChartRow(exemption, this.investments);
                });
            })
        },
        /**************************************************************
         * Chart Stuff
         **************************************************************/
        addChartRow: function (from, to) {
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
            this.chart.addRow([from_label, to_label, value]);
            to.label += append;
        },
        viewChart: () => window.scrollTo(0,0),
        downloadChartTrigger: function () {
            this.colors = 'source';
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
            this.colors = 'gradient';
            this.render();
        },
        getChartStyling: function () {
            var colors = [
                '#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f',
                '#cab2d6', '#ffff99', '#1f78b4', '#33a02c'
            ];
            return {
                sankey: {
                    node: {
                        colors: colors,
                        nodePadding: 7
                    },
                    link: {
                        colorMode: this.colors,
                        colors: colors
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
            this.percent = percent;
            this.render();
        },
        toggleCanvas: function (size) {
            this.canvas = size;
            this.render();
        }
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

</style>

