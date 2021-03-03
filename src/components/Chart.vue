<template>
  <!-- <div class="loading"><div class="lds-dual-ring"></div></div> -->
  <svg class="chart" :viewBox="viewBox">
    <g :transform="`translate(${this.margin.left}, ${this.margin.top})`">
      <path :d="line2" class="line-chart__line last-week"></path>
      <path :d="line" class="line-chart__line"></path>
      <g v-axis:x="scale" :transform="`translate(0, ${this.height})`"></g>
      <g v-axis:y="scale"></g>
    </g>
  </svg>
</template>

<script>
import * as d3 from "d3";
export default {
  name: "Chart",
  data() {
    return {
      speeds: null,
      formatTime: d3.timeFormat("%Y-%m-%d"),
      margin: { top: 10, right: 30, bottom: 30, left: 60 },
      // loading: true,
      windowWidth: window.innerWidth,
    };
  },
  props: {
    todaysData: {
      required: true,
    },
    lastWeeksData: {
      required: true,
    },
    width: {
      default: 600,
      type: Number,
    },
    height: {
      default: 200,
      type: Number,
    },
  },
  computed: {
    rangeX() {
      const width = this.width;
      return [0, width];
    },
    rangeY() {
      const height = this.height;
      return [height, 0];
    },
    scale() {
      if (this.todaysData) {
        const x = d3.scaleTime().range(this.rangeX);
        const y = d3.scaleLinear().range(this.rangeY);
        x.domain([
          d3.timeHour.offset(
            d3.timeDay.floor(d3.max(this.todaysData, (d) => d.timeStamp)),
            4
          ),
          d3.timeDay.ceil(d3.max(this.todaysData, (d) => d.timeStamp)),
        ]);
        const maxTime = d3.max(this.todaysData, (d) => d.travelTime);
        const minTime = d3.min(this.todaysData, (d) => d.travelTime);
        y.domain([
          minTime < 4500 ? minTime : 4500,
          maxTime > 6300 ? maxTime : 6300,
        ]);
        return {
          x,
          y,
        };
      } else return null;
    },
    path() {
      return d3
        .line()
        .x((d) => this.scale.x(d.timeStamp))
        .y((d) => this.scale.y(d.travelTime))
        .curve(d3.curveCatmullRom.alpha(0.5));
    },
    path2() {
      return d3
        .line()
        .x((d) => this.scale.x(d3.timeDay.offset(d.timeStamp, 7)))
        .y((d) => this.scale.y(d.travelTime))
        .curve(d3.curveCatmullRom.alpha(0.5));
    },
    line() {
      return this.path(this.todaysData);
    },
    line2() {
      return this.path2(this.lastWeeksData);
    },
    viewBox() {
      return `0 0 ${this.width + this.margin.left + this.margin.right} ${this
        .height +
        this.margin.bottom +
        this.margin.top}`;
    },
  },
  directives: {
    axis(el, binding) {
      const axis = binding.arg;
      const axisMethod = { x: "axisBottom", y: "axisLeft" }[axis];
      const methodArg = binding.value[axis];
      if (axis === "y") {
        d3.select(el).call(
          d3[axisMethod](methodArg).tickFormat((s) => {
            const dateObj = new Date(s * 1000);
            const hours = dateObj.getUTCHours();
            const minutes = dateObj.getUTCMinutes();
            const timeString =
              hours + ":" + minutes.toString().padStart(2, "0");
            return timeString;
          })
        );
      } else {
        d3.select(el).call(d3[axisMethod](methodArg));
      }
    },
  },

  // methods: {
  // createGraph() {
  // const svg = d3
  //   .select("#chart")
  //   .append("svg")
  //   .style("position", "relative")
  //   .attr("width", this.width + this.margin.left + this.margin.right)
  //   .attr("height", this.height + this.margin.top + this.margin.bottom)

  // .append("g")
  // .attr(
  //   "transform",
  //   "translate(" + this.margin.left + "," + this.margin.top + ")"
  // );

  // svg
  //   .append("g")
  //   .attr("transform", "translate(0," + this.height + ")")
  //   .call()
  //   .style("position", "relative");

  // svg.append("g").call();

  // svg
  //   .append("path")
  //   .attr("id", "lineGraph")
  //   .datum(this.todaysData)
  //   .attr("fill", "none")
  //   .attr("stroke", "steelblue")
  //   .attr("stroke-width", 4)
  //   .attr("opacity", 0.7)
  //   .attr("cursor", "pointer")
  //   .attr("d");

  // svg
  //   .append("path")
  //   .attr("id", "lastWeeksData")
  //   .datum(this.lastWeeksData)
  //   .attr("fill", "none")
  //   .attr("stroke", "steelblue")
  //   .attr("stroke-width", 4)
  //   .attr("opacity", 0.3)
  //   .attr("cursor", "pointer")
  //   .attr(
  //     "d",
  //     d3
  //       .line()
  //       .x((d) => x(d3.timeDay.offset(d.timeStamp, 7)))
  //       .y((d) => y(d.travelTime))
  //       .curve(d3.curveCatmullRom.alpha(0.5))
  //       );

  //     const tooltip = d3
  //       .select("#chart")
  //       .append("div")
  //       .style("position", "absolute")
  //       .style("visibility", "visible")
  //       .style("background-color", "red")
  //       .style("top", "0")
  //       .text("Hello");

  //     d3.select("#lineGraph").on("mouseover", () => {
  //       tooltip.style("visibility", "visible");
  //     });

  //     d3.select("#lineGraph").on("mouseout", () => {
  //       tooltip.style("visibility", "hidden");
  //     });

  //     d3.select("#lineGraph").on("mousemove", (e) => {
  //       let yCoor = d3.pointer(e)[1];
  //       let seconds = y.invert(yCoor);
  //       const dateObj = new Date(seconds * 1000);
  //       const hours = dateObj.getUTCHours();
  //       const minutes = dateObj.getUTCMinutes();
  //       const timeString = hours + ":" + minutes.toString().padStart(2, "0");
  //       tooltip
  //         .text(timeString)
  //         .style("left", d3.pointer(e)[0] + 60 + "px")
  //         .style("top", d3.pointer(e)[1] + "px");
  //     });
  //   },
  // },
};
</script>

<style scoped>
.line-chart__line {
  fill: none;
  stroke: steelblue;
  stroke-width: 2px;
}

.last-week {
  stroke: steelblue;
  opacity: 0.2;
}

@media only screen and (max-width: 600px) {
  .line-chart__line {
    stroke-width: 3px;
  }
}

#chart {
  position: relative;
}

#linegraph {
  cursor: pointer;
}
</style>
