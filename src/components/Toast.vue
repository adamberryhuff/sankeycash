<template>
    <div aria-live="polite" aria-atomic="true" style="position: relative; z-index:10000;">
        <!-- Position it -->
        <div style="position: fixed; bottom: 5px; right: -1px;">

        <!-- Then put toasts within -->
        <div class="toast" role="alert" aria-live="assertive" data-autohide="true" data-delay="1500" aria-atomic="true" id="toasty" style="background-color: rgb(255, 255, 255); border-radius: .25rem 0rem 0rem .25rem;">
            <div class="toast-body" style="background-color: #28A745; color:white">
                <span class="fa fa-check-circle"></span> {{ message }}
            </div>
        </div>
    </div>
</div>
</template>

<script>

import $ from 'jquery';

export default {
    name: 'Toast',
    data () {
        return {
            message: ''
        }
    },
    methods: {
        show: function (message) {
            this.message = message;
            $('#toasty').toast('show');
        }
    }
}

</script>