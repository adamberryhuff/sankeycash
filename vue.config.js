// vue.config.js
module.exports = {
    chainWebpack: config => {
        config.externals({
            'google': 'google',
            'jquery': 'jQuery',
            'introJs': 'intro.js'
            // 'html2canvas': 'html2canvas'
        })
    },
}

