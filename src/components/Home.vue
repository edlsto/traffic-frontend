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
    <Chart
      :todaysData="this.todaysData"
      :lastWeeksData="this.lastWeeksData"
      v-if="this.todaysData"
      class="chart"
      :width="this.windowWidth"
      :height="this.windowHeight"
    />
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
import * as d3 from "d3";
import axios from "axios";
import moment from "moment";
import Chart from "./Chart";
export default {
  name: "Home",
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
      historicalData: null,
      todaysData: null,
      lastWeeksData: null,
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    windowHeight() {
      if (this.windowWidth < 600) {
        return this.windowWidth * 1;
      } else if (this.windowWidth < 1000) {
        return this.windowWidth * 0.6;
      } else {
        return this.windowWidth * 0.3;
      }
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
  watch: {
    windowWidth: function(newSize, oldSize) {
      console.log(newSize, oldSize);
    },
  },
  async created() {
    try {
      const data = await axios.get("https://edwardisthe.best/photos");
      this.data = data.data;
      const travelTime = await axios.get("https://edwardisthe.best/speed");
      this.travelTime = travelTime.data;
      console.log(this.travelTime);
      let historical = await axios.get("https://edwardisthe.best/historical");
      this.loading = false;
      const speeds = historical.data
        .filter((d) => d.direction === "West")
        .filter((d) => d.travelTime !== "-1")
        .map((d) => ({
          timeStamp: Date.parse(d.timeStamp),
          travelTime: parseInt(d.travelTime),
        }));
      this.speeds = speeds;
      this.todaysData = speeds.filter((datapoint) => {
        return datapoint.timeStamp > d3.timeDay.floor(new Date());
      });
      this.lastWeeksData = speeds.filter((datapoint) => {
        return (
          datapoint.timeStamp >
            d3.timeDay.floor(d3.timeDay.offset(new Date(), -7)) &&
          datapoint.timeStamp <
            d3.timeDay.floor(d3.timeDay.offset(new Date(), -6))
        );
      });
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
  /* max-width: 800px; */
}
</style>
