<template>
  <div class="text-center bg-gray-200 h-full">
    <div class="font-sans-serif text-gray-700">
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

      <div class="text-lg marquee">
        <h2 class="text-lg mt-8" v-if="this.direction === 'East'">
          Travel time between Vail and Denver (eastbound) is currently
          <span v-if="this.travelTime && this.travelTime[0].TravelTime">
            {{ this.travelTime[0].TravelTime[0].Hours[0] }} hour
            {{ this.travelTime[0].TravelTime[0].Minutes[0] }} minutes
          </span>
        </h2>
        <h2 class="text-lg mt-8" v-else>
          Travel time between Denver and Vail (westbound) is currently
          <span v-if="this.travelTime && this.travelTime[0].TravelTime">
            {{ this.travelTime[1].TravelTime[0].Hours[0] }} hour
            {{ this.travelTime[1].TravelTime[0].Minutes[0] }} minutes
          </span>
        </h2>
      </div>
    </div>
    <div class="chart-container" v-if="this.todaysData && this.lastWeeksData">
      <Chart
        :todaysData="this.todaysData"
        :lastWeeksData="this.lastWeeksData"
        class="chart"
        :width="this.windowW"
        :height="this.windowHeight"
      />
    </div>
    <Spinner class="spinner" v-else :style="{ height: windowHeight + 'px' }" />
    <div class="gallery justify-center">
      <Card class="gallery justify-center" :cameraData="cameraData.genesee"
        >1.1 mi E of Genesee Park Int
      </Card>
      <Card class="gallery justify-center" :cameraData="cameraData.copper"
        >CO-91 Copper Mtn
      </Card>
      <Card class="gallery justify-center" :cameraData="cameraData.beaverBrook"
        >Beaver Brook Int - EB
      </Card>
      <Card class="gallery justify-center" :cameraData="cameraData.vMTnl"
        >0.6 mi W of VM Tnl
      </Card>
      <Card class="gallery justify-center" :cameraData="cameraData.fifteenth"
        >0.1 mi E of 15th St
      </Card>
      <Card class="gallery justify-center" :cameraData="cameraData.vailPass"
        >0.2 mi W of Vail Pass Summit
      </Card>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Chart from "@/components/Chart";
import Card from "@/components/Card";
import Spinner from "@/components/Spinner";
export default {
  name: "Home",
  metaInfo: {
    title: "I-70 Traffic Guide, Vail to Denver, Colorado",
  },
  components: {
    Chart,
    Spinner,
    Card,
  },
  data() {
    return {
      cameraData: {
        genesee: {},
        copper: {},
        beaverBrook: {},
        vMTnl: {},
        fifteenth: {},
        vailPass: {},
      },
      travelTime: null,
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
    track() {
      this.$ga.page("/");
    },
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    this.direction = new Date().getHours() < 12 ? "West" : "East";
    this.track();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  async getSpeeds() {},
  async created() {
    try {
      axios.get("https://edwardisthe.best/photos").then((response) => {
        console.log(response.data.CameraView[0]);
        this.cameraData = {
          genesee: response.data.CameraView[0],
          copper: response.data.CameraView[1],
          beaverBrook: response.data.CameraView[2],
          vMTnl: response.data.CameraView[3],
          fifteenth: response.data.CameraView[4],
          vailPass: response.data.CameraView[7],
        };
      });
      axios.get("https://edwardisthe.best/speed").then((response) => {
        this.travelTime = response.data;
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
  margin: auto;
}

.chart-container {
  display: block;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 400px));
  max-width: 1200px;
  margin: 1em auto;
}

.marquee {
  padding: 0 2rem;
}
</style>
