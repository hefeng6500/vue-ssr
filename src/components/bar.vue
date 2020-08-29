<template>
  <div>
    <div @click="handleClick">Bar</div>
    <h1>
      {{ this.$store.state.username }}
    </h1>
  </div>
</template>

<script>
export default {
  methods: {
    asyncData(store) {
      // asyncData只在服务端执行
      console.log("asyncData");
      return store.dispatch("changeName");
    },
    handleClick() {
      alert(1);
    },
  },
};
</script>

<style></style>
