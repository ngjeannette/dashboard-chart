import React, { Component } from "react";
import Chart from "chart.js";

Chart.defaults.global.defaultFontFamily = "'PT Sans', sans-serif";
Chart.defaults.global.legend.display = false;
Chart.defaults.global.elements.line.tension = 0.2;

export default class LineGraph extends Component {
  chartRef = React.createRef();

  componentDidMount() {
    const myChartRef = this.chartRef.current.getContext("2d");
    const { width: graphWidth } = myChartRef.canvas;
    let gradientLine = myChartRef.createLinearGradient(0, 0, graphWidth * 2, 0);
    gradientLine.addColorStop(0, "#FF006E");
    gradientLine.addColorStop(1, "#F46036");
    const { data, color, labels } = this.props.data;

    new Chart(myChartRef, {
      type: "line",
      data: {
        //Bring in data
        labels: labels,
        datasets: [
          {
            label: "sales",
            data: data,
            fill: false,
            barPercentage: 0.5,
            barThickness: 6,
            maxBarThickness: 8,
            minBarLength: 2,
            borderColor: "#6610f2",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          xAxes: [
            {
              ticks: { display: true },
              gridLines: {
                display: false,
                drawBorder: true,
              },
            },
          ],
          yAxes: [
            {
              ticks: { display: true },
              gridLines: {
                display: false,
                drawBorder: true,
              },
            },
          ],
        },
      },
    });
  }
  render() {
    return (
      <div>
        <canvas id="myChart" ref={this.chartRef} />
      </div>
    );
  }
}
