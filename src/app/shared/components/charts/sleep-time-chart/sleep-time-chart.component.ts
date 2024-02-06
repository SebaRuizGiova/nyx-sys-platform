import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';
import {
  SleepData,
  SleepDatum,
} from 'src/app/dashboard/interfaces/profile.interface';
import { HelpersService } from '../../../services/helpers.service';
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';

@Component({
  selector: 'sleep-time-chart',
  templateUrl: './sleep-time-chart.component.html',
  styleUrls: ['./sleep-time-chart.component.scss'],
})
export class SleepTimeChartComponent implements OnChanges {
  @Input() periods?: {
    durationInBed: any[];
    durationInSleep: any[];
    durationInAwake: any[];
    dates: any[];
  };
  public chart?: Chart;

  constructor(
    private helpersService: HelpersService,
    private timezoneService: TimezoneService
  ) {}

  ngOnChanges(): void {
    const durationInSleepValues = this.periods?.durationInSleep;
    const durationInBedValues = this.periods?.durationInBed;
    const durationInAwakeValues = this.periods?.durationInAwake;
    const datesValues = this.periods?.dates;

    if (
      !durationInSleepValues ||
      !durationInBedValues ||
      !durationInAwakeValues ||
      !datesValues
    ) {
      return;
    }

    const seriesData = this.constructSeriesData(
      durationInSleepValues,
      durationInBedValues,
      durationInAwakeValues
    );

    this.chart = new Chart({
      chart: {
        type: 'column',
        backgroundColor: '#242526',
        animation: true,
        height: '100px',
        margin: 0,
      },
      title: {
        text: '',
      },
      xAxis: {
        categories: datesValues,
        labels: {
          style: {
            color: '#d9d9d9',
          },
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
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        shared: true,
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          borderRadius: '10%',
          borderWidth: 0,
          groupPadding: 0,
        },
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
      series: seriesData,
    });
  }

  constructSeriesData(
    durationInSleepValues: any[],
    durationInBedValues: any[],
    durationInAwakeValues: any[]
  ): any[] {
    const seriesData = [
  /*     {
        name: 'Bed',
        data: durationInBedValues,
        color: '#544FC5',
      }, */
      {
        name: 'Awake',
        data: durationInAwakeValues,
        color: '#18A058',
      },
      {
        name: 'Sleep',
        data: durationInSleepValues,
        color: '#544FC5',
      },
    ];

    return seriesData;
  }
}
