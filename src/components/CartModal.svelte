<script>
    let cart = null
    export { cart }
    console.log(cart);
</script>

<style>


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
 .remove_data{

 }
</style>


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