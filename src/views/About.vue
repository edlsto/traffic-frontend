<template>
  <div class="bg-gray-200 ctn">
    <div class="text mx-auto my-32 max-w-2xl leading-loose">
      <p class="pb-4">
        This is an app that visualizes the traffic times on Interstate 70
        between Denver and Vail, Colorado.
      </p>
      <p class="pb-4">
        This project was created by
        <a class="underline" href="https://www.edstoner.dev">Ed Stoner</a> using
        Vue, D3, TailwindCSS, Node, Express, MongoDB and Mongoose.
      </p>
      <p class="pb-4">
        It uses data from the Colorado Department of Transportation's API.
      </p>
      <p class="pb-4">
        You can check out the repo
        <a class="underline" href="https://github.com/edlsto/traffic-frontend"
          >here</a
        >.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "About",
};
</script>

<style scoped></style>
