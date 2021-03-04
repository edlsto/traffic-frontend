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
    <div class="flex justify-center chart-container" v-if="this.todaysData">
      <Chart
        :todaysData="this.todaysData"
        :lastWeeksData="this.lastWeeksData"
        class="chart"
        :width="this.windowW"
        :height="this.windowHeight"
      />
    </div>
    <Spinner class="spinner" v-else :style="{ height: windowHeight + 'px' }" />
    <div v-if="cameraData" class="flex flex-wrap justify-center">
      <div
        v-for="(image, index) in cameraData.CameraView"
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
import Spinner from "./Spinner";
export default {
  name: "Home",
  components: {
    Chart,
    Spinner,
  },
  data() {
    return {
      cameraData: null,
      baseURL: "http://www.cotrip.org/",
      travelTime: null,
      historicalData: null,
      todaysData: null,
      lastWeeksData: null,
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    windowHeight() {
      return (this.windowWidth * 500) / this.windowWidth;
    },
    windowW() {
      return this.windowWidth < 800 ? this.windowWidth : 800;
    },
  },
  methods: {
    formatTime(rawTime) {
      return moment(rawTime).format("h:mm a MMM. D");
    },
    onResize() {
      this.windowWidth = window.innerWidth;
    },
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  async getSpeeds() {},
  async created() {
    try {
      axios.get("https://edwardisthe.best/photos").then((response) => {
        this.cameraData = response.data;
      });
      axios.get("https://edwardisthe.best/speed").then((response) => {
        this.travelTime = response.data;
      });
      let todaysSpeeds = await axios.get("https://edwardisthe.best/today");
      let lastWeeksSpeeds = await axios.get(
        "https://edwardisthe.best/lastweek"
      );

      const parseData = (data) =>
        data.data
          .filter((d) => d.direction === "West")
          .filter((d) => d.travelTime !== -1)
          .map((d) => ({
            timeStamp: Date.parse(d.timeStamp),
            travelTime: parseInt(d.travelTime),
          }));
      this.todaysData = parseData(todaysSpeeds);
      this.lastWeeksData = parseData(lastWeeksSpeeds);
    } catch (error) {
      console.log(error);
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.text-center {
  min-height: 100vh;
}

.chart {
  max-width: 800px;
}
</style>
