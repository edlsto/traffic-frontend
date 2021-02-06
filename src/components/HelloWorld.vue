<template>
  <div class="text-center bg-gray-200 h-full">
    <div class="font-sans-serif pt-12 text-gray-700">
      <h1 class="text-6xl sm:text-8xl font-bold">
        I-70 guide
      </h1>
      <div class="text-lg" v-if="travelTime">
        <h2 class="text-lg mt-8">
          Travel time between Vail and Denver (eastbound) is currently
          {{ this.travelTime[0].TravelTime[0].Hours[0] }} hour
          {{ this.travelTime[0].TravelTime[0].Minutes[0] }} minutes
        </h2>
        <h2 class="text-lg mt-4">
          Travel time between Denver and Vail (westbound) is currently
          {{ this.travelTime[1].TravelTime[0].Hours[0] }} hour
          {{ this.travelTime[1].TravelTime[0].Minutes[0] }} minutes
        </h2>
      </div>
    </div>
    <Chart />
    <div v-if="data" class="flex flex-wrap justify-center">
      <div
        v-for="(image, index) in data.CameraView"
        :key="index"
        class="p-4 rounded bg-white m-4 shadow"
      >
        <img :src="baseURL + image.ImageLocation" alt="" />
        <div class="text-left">
          <p class="pt-4 font-bold text-left text-blue-600">
            {{ image.CameraName[0] }}
          </p>
          <p class="text-xs uppercase">
            Last updated: {{ formatTime(image.LastUpdatedDate[0]) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import Chart from "./Chart";
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  components: {
    Chart,
  },
  data() {
    return {
      data: null,
      baseURL: "http://www.cotrip.org/",
      travelTime: null,
    };
  },
  methods: {
    formatTime(rawTime) {
      return moment(rawTime).format("h:mm a MMM. D");
    },
  },
  async created() {
    const data = await axios.get("http://localhost:3000/photos");
    this.data = data.data;
    const travelTime = await axios.get("http://localhost:3000/speed");
    this.travelTime = travelTime.data;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
