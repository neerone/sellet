<script>
    import { fly, fade } from 'svelte-transitions';
    import Upsell from './Upsell.svelte'
    let header;
    let onClose;
    let hasUpsells = false;

    export { header, onClose, hasUpsells }
</script>

<style>
    .sellet-modal-wrapper {
        z-index: 99999999;
    	position: fixed;
    	top: 0;
    	left: 0;
    	width: 100%;
    	height: 100%;
    	background: rgba(0,0,0,0.2);
    	display: flex;
    	justify-content: center;
    	align-items: center;
        font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif;
    }
    .sellet-modal-prewrapper {
        min-width: 310px;
        max-width: 550px;
        width:100%;
        position: relative;
        padding:5px;
        overflow-y: auto;
        max-height: 85%;
        margin-top: 50px;
        margin-bottom: 50px;
    }
    .sellet-modal-inner-wrapper {
        background: white;
        width:100%;
        position: relative;
        border-radius: 5px;
        box-shadow: 0 1px 3px #0000000d;
    }
    .sellet-modal-close {
        display: block;
        position: absolute;
        right: 0;
        top: 0;
        font-size: 30px;
        font-family: Impact, serif;
        padding: 20px;
        line-height: 14px;
        cursor: pointer;
        color: #ff5b5bf2;
    }
    .sellet-modal-header {
        padding: 15px 20px;
        border-bottom: 1px solid #dedede;
        font-size: 200%;
        line-height: 120%;
        text-align: center;
    }
    .sellet-modal-content {
        padding: 15px 20px;

    }

    .upsellmodal {
        max-width: 700px;
    }



</style>


<div class='sellet-modal-wrapper' transition:fade="{{ duration: 300 }}"  >
    <div class="sellet-modal-prewrapper" class:upsellmodal={hasUpsells}>
        <div class='sellet-modal-inner-wrapper' transition:fly="{{ y: 200, duration: 300 }}">
            <div class='sellet-modal-close' on:click={onClose}>×</div>
            <div class='sellet-modal-header'>{header}</div>
            <div class='sellet-modal-content'><slot/>

            </div>
        </div>
    </div>
</div>
