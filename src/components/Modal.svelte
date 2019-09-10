<script>
    let header;
    let errors;

    export { header, errors }
</script>

<style>
    .sellet-modal-wrapper {
    	position: fixed;
    	top: 0px;
    	left: 0px;
    	width: 100%;
    	height: 100%;
    	background: rgba(0,0,0,0.2);
    	display: flex;
    	justify-content: center;
    	align-items: center;
        font-family: Helvetica Neue,Helvetica,Arial,sans-serif;
    }
    .sellet-modal-inner-wrapper {
        background: white;
        padding: 10px;
        min-width: 300px;
        position: relative;
    }
    .sellet-modal-close {
        display: block;
        position: absolute;
        right: 0px;
        top: 0px;
        color: #a70000f2;
        font-size: 30px;
        font-family: impact;
        padding: 10px;
        line-height: 14px;
        cursor: pointer;
    }
    .sellet-modal-header {
        font-size: 150%;
    }
    .sellet-modal-content {
        margin-top: 10px;
    }
</style>

{#if errors.length}
    <div class='sellet-modal-wrapper'>
        <div class='sellet-modal-inner-wrapper'>
            <div class='sellet-modal-close' on:click="{() => { errors = [] } }">×</div>
            <div class='sellet-modal-header'>{header}</div>
            <div class='sellet-modal-content'><slot/></div>
        </div>
    </div>
{/if}
