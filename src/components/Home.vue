<template>
  <div class="text-center bg-gray-200 h-full">
    <div class="font-sans-serif pt-12 text-gray-700">
      <!-- <h1 class="text-6xl sm:text-8xl font-bold">
        I-70 guide
      </h1> -->

      <select
        class="w-24 text-gray-700 py-2 px-3 mt-8 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        name="animals"
        v-model="direction"
      >
        <option value="East">
          East
        </option>
        <option value="West">
          West
        </option>
      </select>
      <!-- 
      <div class="text-lg">
        <h2 class="text-lg mt-8" v-if="this.direction === 'East'">
          Travel time between Vail and Denver (eastbound) is currently
          <span v-if="this.travelTime">
            {{ this.travelTime[0].TravelTime[0].Hours[0] }} hour
            {{ this.travelTime[0].TravelTime[0].Minutes[0] }} minutes
          </span>
        </h2>
        <h2 class="text-lg mt-8" v-else>
          Travel time between Denver and Vail (westbound) is currently
          <span v-if="this.travelTime">
            {{ this.travelTime[1].TravelTime[0].Hours[0] }} hour
            {{ this.travelTime[1].TravelTime[0].Minutes[0] }} minutes
          </span>
        </h2>
      </div> -->
    </div>
    <div
      class="flex justify-center chart-container"
      v-if="this.todaysData && this.lastWeeksData"
    >
      <Chart
        :todaysData="this.todaysData"
        :lastWeeksData="this.lastWeeksData"
        class="chart"
        :width="this.windowW"
        :height="this.windowHeight"
      />
    </div>
    <!-- <Spinner class="spinner" v-else :style="{ height: windowHeight + 'px' }" /> -->
    <!-- <div v-if="cameraData" class="flex flex-wrap justify-center">
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
    </div> -->
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import Chart from "./Chart";
// import Spinner from "./Spinner";
export default {
  name: "Home",
  components: {
    Chart,
    // Spinner,
  },
  data() {
    return {
      cameraData: null,
      baseURL: "http://www.cotrip.org/",
      travelTime: null,
      historicalData: null,
      todaysSpeeds: null,
      lastWeeksSpeeds: null,
      windowWidth: window.innerWidth,
      direction: "East",
    };
  },
  computed: {
    windowHeight() {
      return (this.windowWidth * 500) / this.windowWidth;
    },
    windowW() {
      return this.windowWidth < 800 ? this.windowWidth : 800;
    },
    todaysData() {
      if (this.todaysSpeeds) {
        return this.parseData(
          this.todaysSpeeds.filter((d) => d.direction === this.direction)
        );
      } else {
        return null;
      }
    },
    lastWeeksData() {
      if (this.lastWeeksSpeeds) {
        return this.parseData(
          this.lastWeeksSpeeds.filter((d) => d.direction === this.direction)
        );
      } else {
        return null;
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
    parseData(data) {
      return data
        .filter((d) => d.travelTime !== -1)
        .map((d) => ({
          timeStamp: Date.parse(d.timeStamp),
          travelTime: parseInt(d.travelTime),
        }));
    },
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    this.direction = new Date().getHours() < 12 ? "West" : "East";
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
        console.log(this.travelTime);
      });
      const todaysSpeeds = await axios.get("https://edwardisthe.best/today");
      this.todaysSpeeds = todaysSpeeds.data;
      const lastWeeksSpeeds = await axios.get(
        "https://edwardisthe.best/lastweek"
      );
      this.lastWeeksSpeeds = lastWeeksSpeeds.data;
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
