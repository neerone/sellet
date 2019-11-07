<script>
    let cart = null
    export { cart }
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
        overflow:auto;
        min-width: 310px;
        max-width: 550px;
        width:100%;
        position: relative;
        padding:5px;
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
        overflow: hidden !important;
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
 .cart_single_item{
    display:flex;
    flex-direction: column;
    justify-items: center;
    align-items: center;
    border: 1px solid #ebebeb;
    margin-top: 20px;
 }
 .cart_item_header{
        min-width:70%;
        text-align: center;
        font-size: 140%;
        outline-style: none!important;
        text-decoration: none!important;
        background-color: #48afefb8;
        color: white;
 }
 .cart_item_cost{

 }
 .cart_item_image{
    min-width:70%;
 }
 .remove_cart_item{
    width: 70%;
    text-align:center;
    border:none;
    height: 45px;
    cursor: pointer;
    margin: 0px 0px;
    background: #48afef;
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#aa3800', endColorstr='#a65400',GradientType=0 );
    color: white;
    white-space: nowrap;
    display: flex;
    font-size: 23px;
    text-decoration: none;
    align-items: center;
    padding: 10px;
    display: flex;
    justify-content: center;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;

 }


</style>


<div class='sellet-modal-wrapper' transition:fade="{{ duration: 300 }}"  >
    <div class="sellet-modal-prewrapper" class:upsellmodal={hasUpsells}>
        <div class='sellet-modal-inner-wrapper' transition:fly="{{ y: 200, duration: 300 }}">
            <div class='sellet-modal-close' on:click={onClose}>×</div>
            <div class='sellet-modal-header'>{header}</div>
            <div class='sellet-modal-content'>
                {#if cart && cart.length} 
                    	{#each cart as item, index}
                        <div class = 'cart_single_item' >
                            <div class = 'remove_data' id = { index } data-key = {index} >
                                <div class = 'cart_item_header' > <h2> { item.title } </h2> </div>        
                                    <img class = 'cart_item_image' alt='' src={item.image} />
                                <button class = 'remove_cart_item'> УДАЛИТЬ ИЗ ЗАКАЗА </button>                
                                <div class = 'cart_item_cost'> { item.cost }  ₽ </div>
                            </div>

                         </div>
                        {/each}
                {:else}
                Твоя корзина пуста
                {/if} 

            </div>
        </div>
    </div>
</div>
