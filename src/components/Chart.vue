<template>
  <div id="chart"></div>
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
    console.log("created");
    const historical = await axios.get(
      "https://traffic-app-edlsto.herokuapp.com/historical"
    );
    const speeds = historical.data
      .filter((d) => d.direction === "West")
      .filter((d) => d.travelTime !== "-1")
      .map((d) => ({
        timeStamp: Date.parse(d.timeStamp),
        travelTime: parseInt(d.travelTime),
      }));
    this.speeds = speeds;
    console.log(this.speeds);
    this.createGraph();
  },
  methods: {
    createGraph() {
      const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr(
          "transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")"
        );

      const x = d3
        .scaleTime()
        .domain(d3.extent(this.speeds, (d) => d.timeStamp))
        .range([0, this.width]);
      svg
        .append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(x));

      const y = d3
        .scaleLinear()
        .domain([5000, d3.max(this.speeds, (d) => d.travelTime)])
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
        .datum(this.speeds)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 5)
        .attr("opacity", 0.7)
        .attr(
          "d",
          d3
            .line()
            .x((d) => x(d.timeStamp))
            .y((d) => y(d.travelTime))
            .curve(d3.curveCatmullRom.alpha(0.5))
        );
    },
  },
};
</script>

<style scoped>
#chart {
  display: flex;
  justify-content: center;
}
</style>
