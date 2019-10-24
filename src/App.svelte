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
        console.log({upsells, form: form})
        hasUpsells = upsells && typeof upsells === 'object' && !!upsells.length
        state = 'refill';
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
        return res;
    }

    function handleCloseModal () {
        state = null;
    }

    async function onRefill() {
        await  handleLandingFormSubmit(form)
        makeRedirect(form)
    }

    function makeRedirect(form) {
        if (!form.redirect) return
        setTimeout(function() {
            window.location = form.redirect
        }, redirectDelay)
    }   

</script>

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