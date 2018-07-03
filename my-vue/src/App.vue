<template>
  <div class="container-fluid">
    <Converter/>
    <p class="mt-5 pt-5 text-secondary text-center text-muted">by<a href="https://github.com/ky213" target="blank">ky</a></p>
  </div>
</template>

<script>
  import Converter from "./components/Converter.vue";
  
  export default {
    name: "app",
    components: {
      Converter
    }
  };
</script>

<style lang="scss">
  
</style>
