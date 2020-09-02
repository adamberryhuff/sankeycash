<template>
    <div class="footer">
        <div class="footer-content">
            <br>
            {{ $t('footer.made') }}, 2020<br>
            {{ $t('footer.feature') }}: <a href="mailto:adamberryhuff@gmail.com">{{ $t('footer.email') }}</a>, <a href="https://github.com/adamberryhuff">GitHub</a><br>
            {{ $t('footer.donations') }}:
            <span>
                <span class="link" v-on:click="square = !square">Cash App</span>, <span class="link" v-on:click="ethereum = !ethereum">Ethereum</span>, <span class="link" v-on:click="paypal = !paypal">PayPal</span>
            </span>
            <span v-if="square">
                <br>
                Cash App: $AdamQBerryHuff
            </span>
            <span v-if="ethereum">
                <br>
                Ethereum: 0xaf9E998c01F96DAE7955d24D284d1166948Efe32
            </span>
            <span v-if="paypal">
                <br>
                Paypal: adamberryhuff@gmail.com
            </span>
            <br><br>
        </div>
    </div>
</template>

<script>

export default {
    name: 'Footer',
    data () {
        return {
            square: false,
            ethereum: false,
            paypal: false
        }
    }
}

</script>

<style scoped>
.footer {
    position:relative;
    text-align:center;
    height: 100px;
    margin-top:60px;
    background:url('../assets/divider.png');
    background-repeat: repeat-y !important;
    height: 200px;
    font-size:12px;
    background-size: contain;
}

.footer-content {
    background-color: white;
    width: 500px;
    margin: auto;
    border-radius: 10px 10px 0px 0px;
    bottom: 0px;
    position: absolute;
    left: calc(50% - 250px);
}

.footer-image {
    width:100%;
}

.link {
    color: #007bff;
    text-decoration: none;
    background-color: transparent;
    cursor:pointer;
}
</style>