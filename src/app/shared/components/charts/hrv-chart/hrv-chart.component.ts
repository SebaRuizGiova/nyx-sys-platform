import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'hrv-chart',
  templateUrl: './hrv-chart.component.html',
  styleUrls: ['./hrv-chart.component.scss'],
})
export class HrvChartComponent implements OnChanges {
  @Input() hrv: {
    hrArray: any[];
    hrvArray: any[];
    laArray: any[];
    timestamps: any[];
    labelsX: any[];
  } = {
    hrArray: [],
    hrvArray: [],
    laArray: [],
    timestamps: [],
    labelsX: []
  };
  public chart?: Chart;

  ngOnChanges(): void {
    const hrValues = this.hrv.hrArray;
    const hrvValues = this.hrv.hrvArray;
    const laValues = this.hrv.laArray;
    const timestamps = this.hrv.timestamps;

    this.chart = new Chart({
      chart: {
        backgroundColor: '#242526',
        animation: true,
        height: '100px',
        margin: 0,
        style: {
          overflow: 'visible'
        }
      },
      xAxis: {
        categories: timestamps,
        labels: {
          enabled: false,
        },
      },
      yAxis: [
        {
          title: {
            text: 'Heart rate',
          },
          tickInterval: 10,
          tickPixelInterval: 10,
          gridLineColor: '#3b3b3b',
        },
        {
          title: {
            text: 'RMSSD',
          },
          tickInterval: 10,
          tickPixelInterval: 10,
          gridLineColor: '#3b3b3b',
        },
        {
          title: {
            text: 'Adjusment line of RMSSD',
          },
          tickInterval: 10,
          tickPixelInterval: 10,
          gridLineColor: '#3b3b3b',
        },
      ],
      title: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      legend: {
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
        itemStyle: {
          color: '#d9d9d9',
          fontWeight: 'bold',
          fontSize: '11px'
        },
        y: -18
      },
      plotOptions: {
        spline: {
          marker: {
            radius: 0,
            lineColor: '#56a7ff',
            lineWidth: 1,
          },
        },
        series: {
          stickyTracking: true,
        },
      },
      tooltip: {
        shared: true,
      },
      series: [
        {
          name: 'Heart rate',
          yAxis: 0,
          marker: {
            symbol: 'circle',
          },
          type: 'spline',
          data: hrValues,
        },
        {
          name: 'RMSSD',
          yAxis: 1,
          marker: {
            symbol: 'circle',
          },
          type: 'line',
          data: hrvValues,
        },
        {
          name: 'Adjusment line of RMSSD',
          yAxis: 2,
          marker: {
            symbol: 'circle',
          },
          type: 'line',
          data: laValues,
          pointRange: 100,
        },
      ],
    });
  }
}
