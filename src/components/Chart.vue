<template>
  <svg class="chart" :viewBox="viewBox">
    <g :transform="`translate(${this.margin.left}, ${this.margin.top})`">
      <path
        v-for="(dataset, index) in dataToChart"
        :key="index"
        :d="createLine(dataset)"
        :class="
          dataset === todaysData
            ? 'line-chart__line'
            : 'line-chart__line last-week'
        "
      ></path>
      <g v-axis:x="scale" :transform="`translate(0, ${this.height})`"></g>
      <g v-axis:y="scale"></g>
      <g class="focus">
        <line class="x-hover-line hover-line" :y1="0" :y2="500"></line>
        <line class="y-hover-line hover-line" :x1="width" :x2="width"></line>
        <circle r="7.5"></circle>
        <text x="15" dy=".31em"></text>
      </g>
    </g>
    <rect
      class="overlay"
      :transform="`translate(${this.margin.left}, ${this.margin.top})`"
      :width="width"
      :height="height"
    ></rect>
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
      margin: { top: 50, right: 30, bottom: 80, left: 60 },
      bisectDate: d3.bisector(function(d) {
        return d.timeStamp;
      }).left,
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
    lastWeekTransposed() {
      return this.lastWeeksData.map((d) => ({
        ...d,
        timeStamp: d.timeStamp + 24 * 60 * 60 * 1000,
      }));
    },
    dataToChart() {
      return [this.todaysData, this.lastWeekTransposed];
    },
    rangeX() {
      const width = this.width;
      return [0, width];
    },
    rangeY() {
      const height = this.height;
      return [height, 0];
    },

    scale() {
      const x = d3.scaleTime().range(this.rangeX);
      const y = d3.scaleLinear().range(this.rangeY);
      x.domain([
        d3.timeHour.offset(
          d3.timeDay.floor(d3.max(this.todaysData, (d) => d.timeStamp)),
          3
        ),
        d3.timeDay.ceil(d3.max(this.todaysData, (d) => d.timeStamp)),
      ]);
      const maxTime = d3.max(
        this.todaysData.concat(this.lastWeeksData),
        (d) => d.travelTime
      );
      const minTime = d3.min(
        this.todaysData.concat(this.lastWeeksData),
        (d) => d.travelTime
      );
      y.domain([
        minTime < 4500 ? minTime : 4500,
        maxTime > 6300 ? maxTime : 6300,
      ]);
      return {
        x,
        y,
      };
    },
    path() {
      return d3
        .line()
        .x((d) => this.scale.x(d.timeStamp))
        .y((d) => this.scale.y(d.travelTime))
        .curve(d3.curveCatmullRom.alpha(0.5));
    },
    line() {
      return this.path(this.todaysData);
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
        d3.select(el).call(
          d3[axisMethod](methodArg).tickFormat((s) => {
            const dateObj = new Date(s);
            let hours = dateObj.getHours();
            let ampm = "am";
            if (hours === 0) {
              hours = 12;
            } else if (hours === 12) {
              ampm = "pm";
            } else if (hours > 12) {
              hours = hours % 12;
              ampm = "pm";
            }
            return `${hours} ${ampm}`;
          })
        );
      }
    },
  },
  methods: {
    createLine(data) {
      return this.path(data);
    },
    mousemove(e) {
      const focus = d3.select(".focus");
      const x0 = this.scale.x.invert(d3.pointer(e)[0]);
      const i = this.bisectDate(this.todaysData, x0, 1);
      const d0 = this.todaysData[i - 1];
      const d1 = this.todaysData[i];
      if (d1) {
        const d = x0 - d0.timeStamp > d1.timeStamp - x0 ? d1 : d0;
        console.log(d);
        focus.attr(
          "transform",
          "translate(" +
            this.scale.x(d.timeStamp) +
            "," +
            this.scale.y(d.travelTime) +
            ")"
        );
        focus.select("text").text(function() {
          return d.value;
        });
        focus
          .select(".x-hover-line")
          .attr("y2", this.height - this.scale.y(d.travelTime));
        focus.select(".y-hover-line").attr("x2", this.width + this.width);
      }
    },
  },
  mounted() {
    console.log(this.height);
    const focus = d3.select(".focus");
    d3.select(".overlay")
      .on("mouseover", function() {
        focus.style("display", "inline");
        console.log("mouse over");
      })
      .on("mouseout", function() {
        focus.style("display", "none");
        console.log("mouse out");
      })
      .on("mousemove", this.mousemove);
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

.overlay {
  border: 1px solid red;
  fill: none;
  pointer-events: all;
}

.focus {
  display: none;
}

.focus circle {
  fill: #f1f3f3;
  stroke: #6f257f;
  stroke-width: 5px;
}

.hover-line {
  stroke: #6f257f;
  stroke-width: 2px;
  stroke-dasharray: 3, 3;
}

@media only screen and (max-width: 600px) {
  .line-chart__line {
    stroke-width: 3px;
  }
}
</style>
