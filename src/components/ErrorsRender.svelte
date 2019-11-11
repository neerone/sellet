<script>
    let errors;
    export { errors }
</script>

<style>

</style>

{#each errors as error}
    <div class="sellet-error-message">{error}</div>
{/each}


