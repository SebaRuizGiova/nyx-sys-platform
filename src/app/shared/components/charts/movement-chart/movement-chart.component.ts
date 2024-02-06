import { HelpersService } from '../../../services/helpers.service';
import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';

@Component({
  selector: 'movement-chart',
  templateUrl: './movement-chart.component.html',
  styleUrls: ['./movement-chart.component.scss'],
})
export class MovementChartComponent implements OnChanges {
  @Input() movement: {
    movement: any[];
    totalActivity: any[];
    timestamps: any[];
  } = {
    movement: [],
    totalActivity: [],
    timestamps: [],
  };
  public chart?: Chart;

  constructor(
    private helpersService: HelpersService,
    private timezoneService: TimezoneService
  ) {}

  ngOnChanges(): void {
    const movementsValues = this.movement.movement;
    const totalActivityValues = this.movement.totalActivity;
    const timestampsValues = this.movement.timestamps;

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
        categories: timestampsValues,
        labels: {
          enabled: false,
        },
      },
      yAxis: [
        {
          title: {
            text: 'Amount of big movements',
          },
          // tickInterval: 10,
          // tickPixelInterval: 95,
          gridLineColor: 'transparent',
        },
        {
          title: {
            text: 'Turns/Night',
          },
          tickInterval: 20,
          // tickPixelInterval: 95,
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
            lineWidth: 1,
          },
        },
        series: {
          stickyTracking: true,
        },
      },
      tooltip: {
        shared: true
      },
      series: [
        {
          name: 'Amount of big movements',
          yAxis: 0,
          type: 'column',
          data: movementsValues,
          color: '#544FC5',
          borderColor: '#544FC5',
          borderRadius: '10%'
        },
        {
          name: 'Turns/Night',
          yAxis: 1,
          marker: {
            symbol: 'circle',
          },
          type: 'spline',
          data: totalActivityValues,
          pointRange: 100,
          lineWidth: 1.5
        },
      ],
    });
  }
}
