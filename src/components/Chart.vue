<template>
    <div v-show="this.gross.value > 0">
        <div class="sankey-wrapper">
            <div id="sankey"></div>
        </div>
        <div style="position: relative;" v-on:click="toggleMode()">
            <span class="float-right switch">
                <b><input type="checkbox" id="mode-checkbox" checked data-toggle="toggle" data-size="sm" data-on="$" data-off="%" data-onstyle="secondary" data-offstyle="secondary"></b>
            </span>
        </div>
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-secondary" v-on:click="viewChart()" v-show="!atTop && chartShowing">
                <span class="fa fa-arrow-up"> Chart</span>
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
        'chartShowing',
        'itemizedIncomes', 'itemizedExpenses', 'itemizedInvestments',
        'grossSum', 'netSum', 'taxSum', 'unallocatedSum', 'investmentSum', 'expenseSum'
    ],
    data () {
        return {
            // chart labels
            gross:       { label: 'Gross Income', value: this.formatValue(this.grossSum)      },
            net:         { label: 'Net Income',   value: this.formatValue(this.netSum)        },
            tax:         { label: 'Taxes',        value: this.formatValue(this.taxSum)        },
            unallocated: { label: 'Unallocated',  value: this.formatValue(this.unallocatedSum)},
            expenses:    { label: 'Expenses',     value: this.formatValue(this.expenseSum)    },
            investments: { label: 'Investments',  value: this.formatValue(this.investmentSum) },

            // chart rendering
            chart: false,
            colors: 'gradient',
            atTop: true,
            mode: 'value',
            percent: false
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
            this.gross.value = this.formatValue(this.grossSum);
            if (this.gross.value != 0) this.render();
        },
        netSum: function () {
            this.net.value = this.formatValue(this.netSum);
            if (this.net.value != 0) this.render();
        },
        taxSum: function () {
            this.tax.value = this.formatValue(this.taxSum);
            if (this.tax.value != 0) this.render();
        },
        unallocatedSum: function () {
            this.unallocated.value = this.formatValue(this.unallocatedSum);
            if (this.unallocated.value != 0) this.render();
        },
        expenseSum: function () {
            this.expenses.value = this.formatValue(this.expenseSum);
            if (this.expenses.value != 0) this.render();
        },
        investmentSum: function () {
            this.investments.value = this.formatValue(this.investmentSum);
            if (this.investments.value != 0) this.render();
        }
    },
    methods: {
        render: function (download=false) {
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
            if (from.value == 0 || to.value == 0) return;
            var append = to.label == from.label ? ' ' : '';
            let value = Math.min(from.value, to.value);
            let from_label = from.label + ' (';
            from_label += this.percent ? from.value + '%' : util.formatMoney(from.value);
            from_label += ')';
            let to_label   = to.label   + append + ' (';
            to_label += this.percent ? to.value + '%' : util.formatMoney(to.value);
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
        toggleMode: function () {
            this.percent           = document.getElementById('mode-checkbox').checked;
            this.gross.value       = this.formatValue(this.grossSum);
            this.net.value         = this.formatValue(this.netSum);
            this.tax.value         = this.formatValue(this.taxSum);
            this.unallocated.value = this.formatValue(this.unallocatedSum);
            this.expenses.value    = this.formatValue(this.expenseSum);
            this.investments.value = this.formatValue(this.investmentSum);
            this.render();
        }
    }
}
</script>

<style scoped>
#sankey {
    width: 100%;
    min-width:1000px;
    height:300px;
}

.btn-group {
    position:fixed;
    bottom:0px;
    left:0px;
    z-index:10000;
    border-radius:
}

.btn-secondary {
    box-shadow: 0 0 0 .2rem rgba(130,138,145,.5);
}

.btn-group .btn:first-child {
    border-radius: 0rem 0rem 0rem 0rem !important;
}
.btn-group .btn:last-child {
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

@media only screen and (max-width: 1000px) {
    .sankey-wrapper {
        overflow-x: scroll;
    }
}

</style>

