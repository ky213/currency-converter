<template>
    <div class="input-group mb-3 ">
        <div class="input-group-prepend ">
            <span class="input-group-text font-weight-bold" id="basic-addon2">{{symbol}}</span>
        </div>
        <input @input="$emit('input', $event.target.value)" @focus="$emit('focus')" :value="value" type="text" class="form-control font-weight-bold" placeholder="select currency">
    </div>
</template>

<script>
    export default {
        data: function() {
            return {};
        },
        props: ["value", "symbol"]
    };
</script>

<style >

</style>
