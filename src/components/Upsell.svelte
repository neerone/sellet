<script>
    export let upsells;
    export let upsellUtpContent = '';
</script>

<style>
    .sellet-upsells-container {
        border-bottom: 1px solid #dedede;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    .sellet-single-upsell{
        max-width: 33%;
        display: flex;
        margin: 9px;
        flex-direction: column;
        align-items:center;
        border: 1px solid #ebebeb;
    }

    .sellet-single-upsell-header{
        text-align: center;
        font-size: 140%;
        outline-style: none!important;
        text-decoration: none!important;
        background-color: #48afefb8;
        color: white;
    }
    .sellet-single-upsell-image{
        max-width: 175px;
        border-radius: 0 0 3px 3px;
    }
    .sellet-upsell-price{
        text-align: center;
        width: 100%;
        margin: 10px 0px 10px 0px;
    }

    .sellet-add-upsell-button{
        width: 100%;
        height: 45px;
        cursor: pointer;
        margin: 0px 0px;
        border-radius: 3px;
        background: #48afef;
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#aa3800', endColorstr='#a65400',GradientType=0 );
        color: white;
        white-space: nowrap;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        font-size: 23px;
        text-decoration: none;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        padding: 10px;

    }

    .sellet-add-upsell-button:hover{
    background-color:#0c509e;
    }
</style>


{#if upsells && upsells.length} 
    {@html upsellUtpContent}
    <div class = 'sellet-upsells-container'>
        {#each upsells as upsell}
            <div class='sellet-single-upsell'>
                <a href={upsell.item_url}>
                    <div class='sellet-single-upsell-header'>{upsell.name}</div>
                    <img class = 'sellet-single-upsell-image' alt='' src={upsell.thumb} />    
                    <div class = 'sellet-upsell-price'>{upsell.item_price} ₽</div>

                </a>

                    <div class ='sellet-add-upsell-button'>
                        <div 
                            class="sellet-buy-button"
                            data-selltype="upsell"
                            data-offer={upsell.name}
                            data-cost={upsell.item_price}
                            data-title={upsell.name}
                        >
                            Добавить к заказу
                        </div>
                    </div>
            </div>  
        {/each}
    </div>
{/if}