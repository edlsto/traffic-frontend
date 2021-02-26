<template>
  <div id="chart-ctn">
    <div class="loading" v-if="loading"><div class="lds-dual-ring"></div></div>
    <div id="chart"></div>
  </div>
</template>

<script>
import axios from "axios";
import * as d3 from "d3";
export default {
  name: "Chart",
  data() {
    return {
      speeds: null,
      formatTime: d3.timeFormat("%Y-%m-%d"),
      margin: { top: 10, right: 30, bottom: 30, left: 60 },
      loading: true,
    };
  },
  computed: {
    width: function() {
      return 1600 - this.margin.left - this.margin.right;
    },
    height: function() {
      return 400 - this.margin.top - this.margin.bottom;
    },
  },
  async created() {
    try {
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
      this.createGraph();
    } catch (error) {
      console.log(error);
    }
  },
  methods: {
    handleMouseover() {
      this.style("opacity", 1);
    },
    createGraph() {
      const svg = d3
        .select("#chart")
        .append("svg")
        .style("position", "relative")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr(
          "transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")"
        );

      const x = d3
        .scaleTime()
        .domain([
          d3.timeDay.floor(d3.max(this.todaysData, (d) => d.timeStamp)),
          d3.timeDay.ceil(d3.max(this.todaysData, (d) => d.timeStamp)),
        ])
        .range([0, this.width]);
      svg
        .append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(x))
        .style("position", "relative");

      const y = d3
        .scaleLinear()
        .domain([
          d3.min(this.speeds, (d) => d.travelTime),
          d3.max(this.speeds, (d) => d.travelTime),
        ])
        .range([this.height, 0]);

      svg.append("g").call(
        d3.axisLeft(y).tickFormat((s) => {
          const dateObj = new Date(s * 1000);
          const hours = dateObj.getUTCHours();
          const minutes = dateObj.getUTCMinutes();
          const timeString = hours + ":" + minutes.toString().padStart(2, "0");
          return timeString;
        })
      );

      svg
        .append("path")
        .attr("id", "lineGraph")
        .datum(this.todaysData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 4)
        .attr("opacity", 0.7)
        .attr("cursor", "pointer")
        .attr(
          "d",
          d3
            .line()
            .x((d) => x(d.timeStamp))
            .y((d) => y(d.travelTime))
            .curve(d3.curveCatmullRom.alpha(0.5))
        );

      svg
        .append("path")
        .attr("id", "lastWeeksData")
        .datum(this.lastWeeksData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 4)
        .attr("opacity", 0.3)
        .attr("cursor", "pointer")
        .attr(
          "d",
          d3
            .line()
            .x((d) => x(d3.timeDay.offset(d.timeStamp, 7)))
            .y((d) => y(d.travelTime))
            .curve(d3.curveCatmullRom.alpha(0.5))
        );

      const tooltip = d3
        .select("#chart")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "visible")
        .style("background-color", "red")
        .style("top", "0")
        .text("Hello");

      d3.select("#lineGraph").on("mouseover", () => {
        tooltip.style("visibility", "visible");
      });

      d3.select("#lineGraph").on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

      d3.select("#lineGraph").on("mousemove", (e) => {
        let yCoor = d3.pointer(e)[1];
        let seconds = y.invert(yCoor);
        const dateObj = new Date(seconds * 1000);
        const hours = dateObj.getUTCHours();
        const minutes = dateObj.getUTCMinutes();
        const timeString = hours + ":" + minutes.toString().padStart(2, "0");
        tooltip
          .text(timeString)
          .style("left", d3.pointer(e)[0] + 60 + "px")
          .style("top", d3.pointer(e)[1] + "px");
      });
    },
  },
};
</script>

<style scoped>
#chart-ctn {
  display: flex;
  justify-content: center;
}

#chart {
  position: relative;
}

#linegraph {
  cursor: pointer;
}

.loading {
  height: 400px;
  width: 1600px;
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
  border: 6px solid #fff;
  border-color: #fff transparent #fff transparent;
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
