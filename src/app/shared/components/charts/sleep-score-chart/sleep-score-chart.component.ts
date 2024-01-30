import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'sleep-score-chart',
  templateUrl: './sleep-score-chart.component.html',
  styleUrls: ['./sleep-score-chart.component.scss'],
})
export class SleepScoreChartComponent implements OnChanges {
  @Input() sleepScore: {
    sleepScore: number;
    date: string;
  }[] = [];
  public chart?: Chart;

  ngOnChanges(): void {
    const dates = this.sleepScore.map((item) => item.date);
    const totalRecoveryValues = this.sleepScore.map((item) => item.sleepScore);

    this.chart = new Chart({
      chart: {
        type: 'spline',
        backgroundColor: '#242526',
        animation: true,
        height: '150px',
        margin: 0,
      },
      xAxis: {
        categories: dates,
        labels: {
          enabled: false,
        },
      },
      yAxis: {
        gridLineColor: '#3b3b3b',
        // labels: {
        //   enabled: true,
        // },
        title: {
          text: '',
        },
        tickInterval: 10,
        tickPixelInterval: 10,
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        spline: {
          marker: {
            radius: 4,
            lineColor: '#56a7ff',
            lineWidth: 1,
          },
        },
      },
      tooltip: {
        shared: true,
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: 'Total de Recuperación',
          marker: {
            symbol: 'circle',
          },
          type: 'spline',
          data: totalRecoveryValues,
        },
      ],
    });
  }
}
