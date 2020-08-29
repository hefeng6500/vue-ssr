<template>
  <div id="app">
    <router-link to="/">foo</router-link>
    <router-link to="bar">bar</router-link>

    <router-view></router-view>
  </div>
</template>

<script>
import Foo from './components/foo.vue';
import Bar from './components/bar.vue';

export default {
  components: {
    Foo,
    Bar,
  },
};
</script>

<style></style>