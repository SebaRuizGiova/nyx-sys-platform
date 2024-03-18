import { Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'angular-highcharts';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  selector: 'ans-modal-chart',
  templateUrl: './ans-modal-chart.component.html',
  styleUrls: ['./ans-modal-chart.component.scss'],
})
export class AnsModalChartComponent implements OnChanges {
  @Input() ans: {
    hf: number;
    lf: number;
    date: string;
  }[] = [];
  @Input() modal?: boolean;
  public chart?: Chart;

  constructor() {}

  ngOnChanges(): void {
    const dates = this.ans.map((item) => item.date);
    const hfValues = this.ans.map((item) => item.hf);
    const lfValues = this.ans.map((item) => item.lf);

    this.chart = new Chart({
      chart: this.modal
        ? {
            type: 'spline',
            backgroundColor: '#242526',
            animation: true,
          }
        : {
            type: 'spline',
            backgroundColor: '#242526',
            animation: true,
            height: '150px',
          },
      xAxis: {
        categories: dates,
        labels: {
          enabled: this.modal,
          style: {
            color: '#d9d9d9',
          },
        },
      },
      yAxis: [
        {
          gridLineColor: '#3b3b3b',
          title: {
            text: 'HF',
          },
          tickInterval: 10,
          tickPixelInterval: 10,
          labels: {
            enabled: this.modal,
            style: {
              color: '#d9d9d9',
            },
          },
          min: 30,
          max: 70,
          endOnTick: false,
        },
        {
          opposite: true,
          gridLineColor: '#3b3b3b',
          title: {
            text: 'LF',
          },
          tickInterval: 10,
          tickPixelInterval: 10,
          labels: {
            enabled: this.modal,
            style: {
              color: '#d9d9d9',
            },
          },
          min: 30,
          max: 70,
          endOnTick: false,
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
        enabled: this.modal,
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
        itemStyle: {
          color: '#d9d9d9',
          fontWeight: 'bold',
          fontSize: '11px',
        },
      },
      series: [
        {
          yAxis: 0,
          name: 'HF', // Asigna el nombre traducido
          marker: {
            symbol: 'circle',
          },
          type: 'spline',
          data: hfValues,
        },
        {
          yAxis: 1,
          name: 'LF', // Asigna el nombre traducido
          marker: {
            symbol: 'circle',
            lineWidth: 0
          },
          type: 'spline',
          data: lfValues,
        },
      ],
    });
  }
}
