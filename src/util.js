export default {
    formatMoney (quantity) {
        return '$' + quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatTax (rate) {
        return rate + '%';
    },
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
}