<script>
    let errors;
    export { errors }
</script>

<style>
    .sellet-error-message {

    }
</style>

{#each errors as error}
    <div class="sellet-error-message">{error}</div>
{/each}


