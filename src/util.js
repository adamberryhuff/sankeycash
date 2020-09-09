export default {
    /***************************************************************************
     * Formatting Helpers
     ***************************************************************************/
    formatMoney (quantity, type='$') {
        if (type != '%') quantity = Math.round(quantity);
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
    // color helper
    shadeColor: function (color, percent) {
        var R = parseInt(color.substring(1,3),16);
        var G = parseInt(color.substring(3,5),16);
        var B = parseInt(color.substring(5,7),16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R<255)?R:255;
        G = (G<255)?G:255;
        B = (B<255)?B:255;

        var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
        var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
        var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

        return "#"+RR+GG+BB;
    }
}