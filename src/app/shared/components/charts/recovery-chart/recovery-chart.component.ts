import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'recovery-chart',
  templateUrl: './recovery-chart.component.html',
  styleUrls: ['./recovery-chart.component.scss'],
})
export class RecoveryChartComponent implements OnChanges {
  @Input() recovery: {
    totalRecovery: number;
    date: string;
  }[] = [];
  public chart?: Chart;

  ngOnChanges(): void {
    const dates = this.recovery.map((item) => item.date);
    const totalRecoveryValues = this.recovery.map((item) => item.totalRecovery);

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
      yAxis: {
        gridLineColor: '#3b3b3b',
        labels: {
          enabled: false,
        },
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
        column: {
          stacking: 'normal',
          borderRadius: '10%',
          borderWidth: 0,
          groupPadding: 0,
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
        /*   marker: {
            symbol: 'circle',
          }, */
          type: 'column',
          data: totalRecoveryValues,
          color: '#544FC5',
          borderColor: '#544FC5',
          borderRadius: 5
        },
      ],
    });
  }
}
