<template>
  <svg class="chart" :viewBox="viewBox">
    <g
      :transform="
        `translate(${this.margin.left}, ${this.margin.top + this.legendHeight})`
      "
    >
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
        <line class="x-hover-line hover-line" :y1="0" :y2="height"></line>
        <line class="y-hover-line hover-line" :x1="0" :x2="width"></line>
        <circle r="5"></circle>
        <text x="15" dy=".31em"></text>
      </g>
    </g>
    <rect
      class="overlay"
      :transform="
        `translate(${this.margin.left}, ${this.margin.top + this.legendHeight})`
      "
      :width="width"
      :height="height"
    ></rect>
    <g
      :transform="
        `translate(${this.margin.left + this.width / 2 - legendWidth / 2}, ${
          this.margin.top
        })`
      "
    >
      <rect fill="none" :width="legendWidth" :height="legendHeight"></rect>
      <text :x="15" :y="legendHeight / 2 + 6">Today</text>
      <line
        x1="70"
        x2="120"
        y1="27"
        y2="27"
        stroke-width="3"
        stroke="steelblue"
      ></line>
      <text :x="170" :y="legendHeight / 2 + 6">7 days ago</text>
      <line
        x1="260"
        x2="310"
        y1="27"
        y2="27"
        stroke-width="3"
        stroke="steelblue"
        opacity="0.2"
      ></line>
    </g>
    <text
      class="source-text"
      :x="margin.left + width"
      :y="height + legendHeight + margin.top + 50"
      text-anchor="end"
    >
      Source: Colorado Department of Transportation
    </text>
  </svg>
</template>

<script>
import * as d3 from "d3";
import moment from "moment";
export default {
  name: "Chart",
  data() {
    return {
      speeds: null,
      margin: { top: 50, right: 30, bottom: 80, left: 60 },
      bisectDate: d3.bisector(function(d) {
        return d.timeStamp;
      }).left,
      legendWidth: 300,
      legendHeight: 50,
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
      type: Number,
    },
    height: {
      type: Number,
    },
  },
  computed: {
    isStandardToDST() {
      return (
        !moment(this.lastWeeksData[0].timeStamp).isDST() &&
        moment(this.todaysData[0].timeStamp).isDST()
      );
    },
    lastWeekTransposed() {
      return this.lastWeeksData.map((d) => ({
        ...d,
        timeStamp: this.isStandardToDST
          ? d.timeStamp + 24 * 6 * 60 * 60 * 1000 + 23 * 1 * 60 * 60 * 1000
          : d.timeStamp + 24 * 7 * 60 * 60 * 1000,
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
        this.margin.top +
        this.legendHeight}`;
    },
  },
  directives: {
    axis(el, binding, vnode) {
      const axis = binding.arg;
      const axisMethod = { x: "axisBottom", y: "axisLeft" }[axis];
      const methodArg = binding.value[axis];
      if (axis === "y") {
        d3.select(el).call(
          d3[axisMethod](methodArg).tickFormat(
            vnode.context.convertSecondsToTimeString
          )
        );
      } else {
        d3.select(el).call(
          d3[axisMethod](methodArg).tickFormat(
            vnode.context.convertTimeStampToTimeOfDayString
          )
        );
      }
    },
  },
  methods: {
    createLine(data) {
      return this.path(data);
    },
    convertSecondsToTimeString(s) {
      const dateObj = new Date(s * 1000);
      const hours = dateObj.getUTCHours();
      const minutes = dateObj.getUTCMinutes();
      const timeString = hours + ":" + minutes.toString().padStart(2, "0");
      return timeString;
    },
    convertTimeStampToTimeOfDayString(s) {
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
    },
    mousemove(e) {
      const that = this;
      const focus = d3.select(".focus");
      const x0 = this.scale.x.invert(d3.pointer(e)[0]);
      const i = this.bisectDate(this.todaysData, x0, 1);
      const d0 = this.todaysData[i - 1];
      const d1 = this.todaysData[i];
      if (d1) {
        const d = x0 - d0.timeStamp > d1.timeStamp - x0 ? d1 : d0;
        focus.attr(
          "transform",
          "translate(" +
            this.scale.x(d.timeStamp) +
            "," +
            this.scale.y(d.travelTime) +
            ")"
        );
        focus.select("text").text(function() {
          return that.convertSecondsToTimeString(d.travelTime);
        });
        focus
          .select(".x-hover-line")
          .attr("y2", this.height - this.scale.y(d.travelTime));
        focus.select(".y-hover-line").attr("x2", this.width);
      }
    },
  },
  mounted() {
    const focus = d3.select(".focus");
    d3.select(".overlay")
      .on("mouseover", function() {
        focus.style("display", "inline");
      })
      .on("mouseout", function() {
        focus.style("display", "none");
      })
      .on("mousemove", this.mousemove);
  },
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
  fill: none;
  pointer-events: all;
}

.focus {
  display: none;
}

.focus circle {
  fill: steelblue;
}

.hover-line {
  stroke: steelblue;
  stroke-width: 2px;
  opacity: 0.2;
}

.source-text {
  font-size: 0.85em;
}

@media only screen and (max-width: 600px) {
  .line-chart__line {
    stroke-width: 3px;
  }
}
</style>
