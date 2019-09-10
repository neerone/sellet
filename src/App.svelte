<script>
    import { formToJSON, getFormErrors } from './helpers/formHelpers'
    import Loader from './components/Loader.svelte'
    import Modal from './components/Modal.svelte'
    let color;
    let uiState = {
        modalOpened: null,
        loading: false,
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
        form = formToJSON(this)
        handleLandingFormSubmit(form)
    }, false);

    const handleLandingFormSubmit = (form) => {
        console.log(form)
        const errors = getFormErrors(form)
        if (!errors) {
            uiState.modalOpened = 'mainForm'
            return
        }
        uiState.modalOpened = 'errors'
        uiState.errors = errors
        console.log(uiState)
    }

</script>

{#if uiState.errors.length}
    <Modal header="Ошибка!" errors={uiState.errors}>
        {#each uiState.errors as error}
            <div class="sellet-error-message">{error}</div>
        {/each}
    </Modal>
{/if}

{#if uiState.loading}
    <Modal header="Подождите">
        <Loader/>
    </Modal>
{/if}
