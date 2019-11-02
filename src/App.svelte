<script>
    import { HOST, redirectDelay } from './config';
    import { formToJSON, getFormErrors, setForm, getForm, makeFormData, formFromDataAttributes } from './helpers/formHelpers'
    
    import { reachGoals, getKeys } from './helpers/helpers'
    import Loader from './components/Loader.svelte'
    import Modal from './components/Modal.svelte'
    import Refill from './components/Refill.svelte'
    import ErrorsRender from './components/ErrorsRender.svelte'
    import Thanks from './components/Thanks.svelte'
    import Upsell from './components/Upsell.svelte'
    import CartModal from './components/CartModal.svelte'

    let cart = [];
    let cartPusher = {};
    let cartCounter = window.localStorage.getItem('cart_counter') || 0;

    function initialCart() {
        if (window.localStorage.getItem('actual_cart')){
            cart = JSON.parse(window.localStorage.getItem('actual_cart'));
        }
    }
    initialCart();

    function cartOnHandle () {
        //берём самый первый карт айтем при хэндлинге
        let theVeryFirstTitle = window.localStorage.getItem('_sellet_title');
        let theVeryFirstCost = window.localStorage.getItem('_sellet_cost');
        let theVeryFirstImage = window.localStorage.getItem('_sellet_thumbimage');
        let cartPusher = {
            title: theVeryFirstTitle,
            cost: theVeryFirstCost,
            image: theVeryFirstImage, 
            id: cartCounter

        } 
        //добавляем первый айтем в cart_cache
        window.localStorage.setItem('cart_cache', JSON.stringify(cartPusher));
        //берём первый айтем из cart_cache в переменную
        //пушим в actual_cart данные из перемнной, где накапливаются товары
        window.localStorage.setItem('actual_cart', JSON.stringify(cart));
        cartCounter++;
        window.localStorage.setItem('cart_counter', cartCounter);
    }


    let color;
    let state = null;
    let errors = {};

    let form = {
        name: '',
        phone: '',
        selltype: '',
        cost: '',
        offer: '',
        title: '',
        agree: false,
        upsells: [],
        data_image:''
    };

    let hasUpsells = false
    let upsells = []
    let buttonAttributeData = null 

    document.addEventListener('keyup', function(e) {
     if (e.key === "Escape") {
         handleCloseModal()
    }
});



    document.addEventListener('submit', function (event) {

        if (!event.target.tagName.toLowerCase() === 'form') return;
        event.preventDefault();
        event.stopPropagation();
        form = formToJSON(this);
        handleLandingFormSubmit(setForm(form))
    }, false);

    document.addEventListener('click', function (event) {
        
        if (!event.target.classList.contains('sellet-buy-button')) return;
        event.preventDefault();
        event.stopPropagation();
        form = getForm(form)
        buttonAttributeData = formFromDataAttributes(event.target)
        form = Object.assign({}, form, buttonAttributeData, {upsells: buttonAttributeData.upsells})
        upsells = form.upsells ? JSON.parse(form.upsells) : null
        hasUpsells = upsells && typeof upsells === 'object' && !!upsells.length
        state = 'refill';
    }, false);


    /// cart item removing (only UI)
        document.addEventListener('click', function (event) {
        if (!event.target.classList.contains('remove_cart_item')) return;
        var indexOfelemToBeRemoved = event.target.parentElement.id;
        console.log('parentElementID:', indexOfelemToBeRemoved);
        var keyOfRemovedItem =  document.getElementById(indexOfelemToBeRemoved).dataset.key
        console.log(document.getElementById(indexOfelemToBeRemoved))
        console.log('parentElementID:', indexOfelemToBeRemoved);
         document.getElementById(indexOfelemToBeRemoved).style.display = 'none';
        //удаляем удалённый юзером элемент из локалсторадж
        var refreshedActualCart = JSON.parse(window.localStorage.getItem('actual_cart'))
        refreshedActualCart.splice(indexOfelemToBeRemoved, 1)
        console.log(refreshedActualCart);
        window.localStorage.setItem('actual_cart', JSON.stringify(refreshedActualCart));
        if(refreshedActualCart.length === 0){
            return  "Ваша корзина пуста!"
        }

    }, false);


    async function handleLandingFormSubmit(form)  {
        setForm(form)
        const validationErrors = getFormErrors(form);
        if (getKeys(validationErrors).length) {
            state = 'refill';
            errors = validationErrors;
            return
        }
        state = 'loading';
        reachGoals('sell-success')
        const res = await fetch(`${HOST}/api/new_order`, {
            method: 'POST',
            body: makeFormData(form)
        });
        state = 'thanks';
        cartOnHandle();  
/*         console.log(nicecart);
        var cartPusher = JSON.parse(localStorage.getItem('cart_item') || '[]');
        cartPusher.push(window.localStorage.getItem('_sellet_cart'));
        window.localStorage.setItem('cart_item', JSON.stringify(cartPusher));
        cart = cartPusher;   */
        
        return res;
    }

    function handleCloseModal () {
        state = null;
    }

    async function onRefill() {
        await handleLandingFormSubmit(form)
        makeRedirect(form)
    }

    function makeRedirect(form) {
        if (!form.redirect) return
        setTimeout(function() {
            window.location = form.redirect
        }, redirectDelay)
    }   


    /// cart 
        document.addEventListener('click', function (event) {
        if (!event.target.classList.contains('sellet_cart')) return;
        state = 'cart';
        })




</script>

{#if state === 'cart'}
    <Modal header="Корзина" onClose={handleCloseModal}>
        <CartModal cart={ cart } />
    </Modal>
{/if}

{#if state === 'refill'}
    <Modal header="Форма заявки" onClose={handleCloseModal}>
        <Refill onRefill={onRefill} form={form} errors={errors} />
    </Modal>
{/if}

{#if state === 'errors' && errors.length}
    <Modal header="Ошибка!" onClose={handleCloseModal}>
        <ErrorsRender errors={errors} />
    </Modal>
{/if}

{#if state === 'loading'}
    <Modal header="Подождите" onClose={handleCloseModal}>
        <Loader/>
    </Modal>
{/if}

{#if state === 'thanks'}
    <Modal header="Спасибо за заказ!" hasUpsells={hasUpsells} onClose={handleCloseModal}>
        <Thanks/>
        <Upsell upsells={upsells} upsellUtpContent={JSON.parse(form.upsellutpcontent)}/>
    </Modal>
{/if}