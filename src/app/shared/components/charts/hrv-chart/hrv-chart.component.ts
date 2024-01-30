import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'ans-chart',
  templateUrl: './hrv-chart.component.html',
  styleUrls: ['./hrv-chart.component.scss'],
})
export class HrvChartComponent implements OnChanges {
  @Input() ans: {
    hf: number;
    lf: number;
    bedExit: number[];
    date: string;
  }[] = [];
  public chart?: Chart;

  ngOnChanges(): void {
    const dates = this.ans.map((item) => item.date);
    const hfValues = this.ans.map((item) => item.hf);
    const lfValues = this.ans.map((item) => item.lf);
    const bedExitValues = this.ans[0].bedExit;

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
        // Eje Y para LF
        {
          title: {
            text: 'LF',
          },
          min: 30,
          max: 70,
          tickInterval: 10,
          tickPixelInterval: 10,
          gridLineColor: '#3b3b3b',
        },
        // Eje Y para HF
        {
          title: {
            text: 'HF',
          },
          // opposite: true, // Para colocar este eje a la derecha
          min: 30,
          max: 70,
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
      legend: {
        enabled: false,
      },
      series: [
        {
          name: 'HF',
          yAxis: 0,
          marker: {
            symbol: 'circle',
          },
          type: 'spline',
          data: hfValues,
        },
        {
          name: 'LF',
          yAxis: 1,
          marker: {
            symbol: 'circle',
          },
          type: 'spline',
          data: lfValues,
        },
        // {
        //   name: 'Ausencia de Datos',
        //   type: 'bar',
        //   color: 'red',
        //   data: bedExitValues, // Agrega un punto si hay ausencia de datos
        // },
      ],
    });
  }
}
