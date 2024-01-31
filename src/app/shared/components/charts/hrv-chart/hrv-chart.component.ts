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
    dates: any[];
  } = {
    hrArray: [],
    hrvArray: [],
    laArray: [],
    dates: []
  };
  public chart?: Chart;

  ngOnChanges(): void {
    const hrValues = this.hrv.hrArray;
    const hrvValues = this.hrv.hrvArray;
    const laValues = this.hrv.laArray;
    const dates = this.hrv.dates;

    this.chart = new Chart({
      chart: {
        type: 'spline',
        backgroundColor: '#242526',
        animation: true,
        height: '80px',
        margin: 0,
      },
      xAxis: {
        categories: dates,
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
      plotOptions: {
        spline: {
          marker: {
            radius: 0,
            lineColor: '#56a7ff',
            lineWidth: 1,
          },
        },
        bar: {
          label: {
            enabled: false
          }
        }
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
          type: 'spline',
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
