import { HelpersService } from '../../../services/helpers.service';
import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';

@Component({
  selector: 'hr-chart',
  templateUrl: './hr-chart.component.html',
  styleUrls: ['./hr-chart.component.scss'],
})
export class HrChartComponent implements OnChanges {
  @Input() hr: {
    hrArray: any[];
    timestamps: any[];
    absent: any[];
  } = {
    hrArray: [],
    timestamps: [],
    absent: [],
  };
  public chart?: Chart;

  constructor(
    private helpersService: HelpersService,
    private timezoneService: TimezoneService
  ) {}

  ngOnChanges(): void {
    let hrValues;
    let timestamps;
    let absentValues;
    hrValues = this.hr.hrArray;
    timestamps = this.hr.timestamps.map((timestamp) =>
      this.helpersService.formatTimestamp(
        timestamp,
        this.timezoneService.timezoneOffset
      )
    );
    absentValues = this.hr.absent;

    const self = this;

    this.chart = new Chart({
      chart: {
        backgroundColor: '#242526',
        animation: true,
        height: '120px',
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
            text: 'Heart rate',
          },
          tickInterval: 10,
          tickPixelInterval: 10,
          gridLineColor: '#3b3b3b',
        },
        // {
        //   title: {
        //     text: 'Breathing rate',
        //   },
        //   tickInterval: 5,
        //   tickPixelInterval: 5,
        //   gridLineColor: '#3b3b3b',
        // },
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
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
        itemStyle: {
          color: '#d9d9d9',
          fontWeight: 'bold',
          fontSize: '11px',
        },
        y: -18,
      },
      plotOptions: {
        spline: {
          marker: {
            radius: 0,
            lineColor: '#56a7ff',
            lineWidth: 0.5,
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
          return `<b>${timestamp}</b><br/>Heart rate: ${value}`;
        },
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
          lineWidth: 1.5
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
