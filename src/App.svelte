<script>
    import { HOST } from './config';
    import { formToJSON, getFormErrors, setForm, getForm, makeFormData } from './helpers/formHelpers'
    import Loader from './components/Loader.svelte'
    import Modal from './components/Modal.svelte'
    let color;
    let state = null;
    let modalState = {
        errors: []
    };
    let form = {
        name: null,
        phone: null,
        selltype: null,
        cost: null,
        offer: null,
        title: null
    };

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
        handleLandingFormSubmit(getForm(form))
    }, false);

    async function handleLandingFormSubmit(form)  {
        const errors = getFormErrors(form);
        if (!errors.length) {
            state = 'loading';
            const res = await fetch(`${HOST}/order.php`, {
                method: 'POST',
                body: makeFormData(form)
            });
            state = 'thanks';
            return
        }
        state = 'errors';
        modalState.errors = errors;
    }

    function handleCloseModal () {
        state = null;
        modalState.errors = [];
    }
</script>



{#if state === 'errors' && modalState.errors.length}
    <Modal header="Ошибка!" onClose={handleCloseModal}>
        {#each modalState.errors as error}
            <div class="sellet-error-message">{error}</div>
        {/each}
    </Modal>
{/if}

{#if state === 'loading'}
    <Modal header="Подождите" onClose={handleCloseModal}>
        <Loader/>
    </Modal>
{/if}

{#if state === 'thanks'}
    <Modal header="Спасибо за заказ" onClose={handleCloseModal}>
        Наш менеджер свяжется с вами в ближашее время!
    </Modal>
{/if}