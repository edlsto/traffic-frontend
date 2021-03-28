<template>
  <div class="ctn flex items-end bg-gray-200 p-8">
    <div class="text-xl font-bold pr-4 logo">
      I-70 Guide
    </div>
    <div class="cursor-pointer px-4 nav-item">
      <router-link to="/">Home</router-link>
    </div>
    <div class="cursor-pointer px-4 nav-item">
      <router-link to="/about">About</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "Navbar",
};
</script>

<style scoped>
.nav-item {
  padding-bottom: 1px;
}
</style>
