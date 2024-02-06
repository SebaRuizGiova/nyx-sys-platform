import { HelpersService } from '../../../services/helpers.service';
import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';

@Component({
  selector: 'br-chart',
  templateUrl: './br-chart.component.html',
  styleUrls: ['./br-chart.component.scss'],
})
export class BrChartComponent implements OnChanges {
  @Input() br: {
    brArray: any[];
    timestamps: any[];
    absent: any[];
  } = {
    brArray: [],
    timestamps: [],
    absent: [],
  };
  public chart?: Chart;

  constructor(
    private helpersService: HelpersService,
    private timezoneService: TimezoneService
  ) {}

  ngOnChanges(): void {
    let brValues;
    let timestamps;
    let absentValues;
    brValues = this.br.brArray;
    timestamps = this.br.timestamps.map((timestamp) =>
      this.helpersService.formatTimestamp(
        timestamp,
        this.timezoneService.timezoneOffset
      )
    );
    absentValues = this.br.absent;

    const self = this;

    this.chart = new Chart({
      chart: {
        backgroundColor: '#242526',
        animation: true,
        height: '100px',
        margin: 0,
        style: {
          overflow: 'visible',
        },
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
            text: 'Breathing rate',
          },
          tickInterval: 5,
          tickPixelInterval: 5,
          gridLineColor: '#3b3b3b',
        },
        // {
        //   title: {
        //     text: 'Absent',
        //   },
        //   tickInterval: 10,
        //   tickPixelInterval: 10,
        //   gridLineColor: '#d9d9d9',
        // },
      ],
      title: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      legend: {
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
        series: {
          stickyTracking: true,
        },
      },
      tooltip: {
        shared: true,
        formatter: function () {
          const timestamp = self.helpersService.formatTimestamp(
            this.point.x,
            self.timezoneService.timezoneOffset
          );
          const value = this.point.y;
          return `<b>${timestamp}</b><br/>Data: ${value}`;
        },
      },
      series: [
        {
          name: 'Breathing rate',
          // yAxis: 1,
          marker: {
            symbol: 'circle',
          },
          type: 'line',
          data: brValues,
          color: '#544FC5'
        },
        // {
        //   name: 'Absent',
        //   yAxis: 3,
        //   type: 'column',
        //   data: absentValues,
        //   pointRange: 100,
        // },
      ],
    });
  }
}
