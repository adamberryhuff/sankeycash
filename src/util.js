export default {
    /***************************************************************************
     * Formatting Helpers
     ***************************************************************************/
    formatMoney (quantity, type='$') {
        if (type == '$') {
            return '$' + quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else if (type == '%') {
            return quantity + '%';
        } else if (type == '£') {
            return '£' + quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            return '€ ' + quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    },
    formatTax (rate) {
        return rate + '%';
    },
    /***************************************************************************
     * Validation Helpers
     ***************************************************************************/
    isValidChartLabel (label, incomes) {
        // not empty
        if (label == '') return false;

        // unique to incomes and exemptions
        incomes.forEach(income => {
            if (income.label == label) return false;
            income.exemptions.forEach(exemption => {
                if (exemption.label == label) return false;
            })
        })
        return true;
    },
    /***************************************************************************
     * Income Calculation Helpers
     ***************************************************************************/
    getTaxableIncome (income) {
        return income.value - this.getExemptions(income) - this.getDeductions(income);
    },
    getTax: function (income) {
        return this.getTaxableIncome(income)*(income.tax/100);
    },
    getMatch: function (income) {
        return income.exemptions.reduce((a, e) => a + e.match, 0);
    },
    getExemptions: function (income) {
        return income.exemptions.reduce((a, e) => a + e.value, 0);
    },
    getDeductions: function (income) {
        return income.deductions.reduce((a, d) => a + d.value, 0);
    },
    getNet: function (income) {
        return income.value - this.getTax(income) + this.getMatch(income) - this.getDeductions(income);
    },
}