<template>
  <div class="loading"><div class="lds-dual-ring"></div></div>
</template>

<script>
export default {};
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.3rem;
}

.lds-dual-ring {
  display: inline-block;
  width: 80px;
  height: 80px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid lightgray;
  border-color: lightgray transparent lightgray transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
