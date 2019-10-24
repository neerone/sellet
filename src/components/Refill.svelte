<script>
    import {getFormErrors} from '../helpers/formHelpers'
    import {getKeys} from '../helpers/helpers'
    import Checkmark from "./icons/Checkmark.svelte";

    let form, errors, onRefill;
    $: {
        errors = getFormErrors(form);
    }
    export {form, errors, onRefill}
</script>

<style>
    a {
        display: inline-block;
        text-decoration: none!important;
        outline:none;
    }
    .sellet-refill-form {
        display: flex;
        flex-direction: column;
    }
    .svelte-form-input-group {
        display: flex;
        flex-direction: column;
        margin-bottom: 25px;
    }
    .svelte-form-label {
        font-size: 14px;
        color: #4a4a4a;
    }
    .svelte-form-input {
        padding: 5px 5px;
        font-size: 18px;
        line-height: 18px;
        border: 1px solid #00b52e;
        outline:none;
    }
    .svelte-form-input.error {
        border: 1px solid #ff5500;
    }

    .svelte-form-message {
        line-height: 14px;
        font-size: 14px;
        height: 14px;
        color: #ff5500;
        margin-top: 5px;
    }

    .svelte-form-submit {
        height: 50px;
        background: #e5ffee;
        border: 1px solid #00f956;
        color: #00862e;
        border-radius: 5px;
        font-size: 18px;
        font-weight: bolder;
        letter-spacing: 1px;
    }
    .svelte-form-submit:disabled {
        opacity: 0.5;
    }

    .link {
        color: #006fff;
        text-decoration: none;
    }
</style>


<div class='sellet-refill-form'>
    <div class="sellet-refill-form">
        <div class="svelte-form-input-group">
            <label class="svelte-form-label">Имя *</label>
            <input class="svelte-form-input" class:error="{!!errors.name}" name="name" bind:value={form.name}>
            <span class="svelte-form-message">{errors.name ? errors.name : ''}</span>
        </div>
        <div class="svelte-form-input-group">
            <label class="svelte-form-label">Телефон *</label>
            <input class="svelte-form-input" class:error="{!!errors.phone}" name="phone" bind:value={form.phone}>
            <span class="svelte-form-message">{errors.phone ? errors.phone : ''}</span>
        </div>
        <div class="svelte-form-input-group">
            <label class="svelte-form-label">
                <input type="checkbox" class="svelte-form-input" class:error="{!!errors.phone}" name="phone" bind:checked={form.agree}>
                Я согласен на обработку персональных данных и ознакомлен с <a class="link" href="https://sellet.ru/politica" target="_blank">политикой конфиденциальности</a>
            </label>

            <span class="svelte-form-message">{errors.agree ? errors.agree : ''}</span>
        </div>
        <div class="svelte-form-input-group">
            <button class="svelte-form-submit" disabled={getKeys(errors).length} on:click={onRefill} type="submit">
                <Checkmark/>
                Оставить заявку
            </button>
        </div>
    </div>
</div>
