<template>
  <div class="p-4 rounded bg-white m-4 shadow card">
    <img
      :src="baseURL + cameraData.ImageLocation"
      alt=""
      v-if="cameraData.ImageLocation"
      class="img-ctn"
    />
    <Spinner v-else class="img-ctn" />
    <div class="text-left">
      <p class="pt-4 font-bold text-left text-blue-600">
        <slot />
      </p>
      <p class="text-xs uppercase">
        Last updated:
        <span v-if="cameraData.LastUpdatedDate">{{
          formatTime(cameraData.LastUpdatedDate[0])
        }}</span>
      </p>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import Spinner from "./Spinner";

export default {
  name: "Card",
  components: {
    Spinner,
  },
  data() {
    return {
      baseURL: "https://www.cotrip.org/",
    };
  },
  props: {
    cameraData: {
      required: true,
    },
  },
  methods: {
    formatTime(rawTime) {
      return moment(rawTime).format("h:mm a MMM. D");
    },
  },
};
</script>

<style scoped>
.img-ctn {
  width: 336px;
  height: 229px;
}

.card {
  width: 368px;
  height: 317px;
}
</style>
