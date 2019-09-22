<script>
    import { fly, fade } from 'svelte-transitions';
    let header;
    let onClose;

    function wrapperClose() {
        onClose()
    }

    function preventClose(event) {
        event.stopPropagation()
        event.stopImmediatePropagation()
        event.preventDefault()
    }

    export { header, onClose }
</script>

<style>
    .sellet-modal-wrapper {
        z-index: 99999999;
    	position: fixed;
    	top: 0px;
    	left: 0px;
    	width: 100%;
    	height: 100%;
    	background: rgba(0,0,0,0.2);
    	display: flex;
    	justify-content: center;
    	align-items: center;
        font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif;
    }
    .sellet-modal-inner-wrapper {
        background: white;
        min-width: 310px;
        max-width: 450px;
        width:100%;
        position: relative;
        border-radius: 5px;
        box-shadow: 0px 1px 3px #0000000d;
    }
    .sellet-modal-close {
        display: block;
        position: absolute;
        right: 0px;
        top: 0px;
        font-size: 30px;
        font-family: impact;
        padding: 14px;
        line-height: 14px;
        cursor: pointer;
        color: #ff5b5bf2;
    }
    .sellet-modal-header {
        padding: 10px 15px;
        border-bottom: 1px solid #cccccc;
        font-size: 120%;
        line-height: 120%;
    }
    .sellet-modal-content {
        padding: 10px 15px;
    }
</style>


<div class='sellet-modal-wrapper' on:click={wrapperClose} transition:fade="{{ duration: 300 }}">
    <div class='sellet-modal-inner-wrapper' on:click={preventClose} transition:fly="{{ y: 200, duration: 300 }}">
        <div class='sellet-modal-close' on:click={onClose}>×</div>
        <div class='sellet-modal-header'>{header}</div>
        <div class='sellet-modal-content'><slot/></div>
    </div>
</div>
