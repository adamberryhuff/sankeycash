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
        var value = income.value;
        income.exemptions.forEach(exemption => {
            value -= exemption.value;
        })
        return value;
    },
    getTax: function (income) {
        let value = income.value;
        value -= income.exemptions.reduce((a, e) => a + e.value, 0);
        return value*(income.tax/100);
    },
    getMatch: function (income) {
        return income.exemptions.reduce((a, e) => a + e.match, 0);
    },
    getExemptions: function (income) {
        return income.exemptions.reduce((a, e) => a + e.value, 0);
    },
    getNet: function (income) {
        return income.value - this.getTax(income) + this.getMatch(income);
    },
}