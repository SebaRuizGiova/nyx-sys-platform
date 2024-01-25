import { Component, Input, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { Profile, SleepDatum } from 'src/app/dashboard/interfaces/profile.interface';
import { HelpersService } from '../../services/helpers.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  @Input() profileData?: Profile;
  @Input() sleepData: SleepDatum[] = [];
  public timestamps: string[] = [];
  public sleepTypes: number[] = [];
  public chart?: Chart;
  private cloudFunctionUrl =
    'https://us-central1-honyro-55d73.cloudfunctions.net/app';

  constructor(
    private helpersService: HelpersService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.sleepData && this.sleepData.length > 0) {
      const categories: string[] = this.sleepData.map((datum) =>
        this.helpersService.formatTimestamp(datum.timestamp)
      );

      const seriesData: any[] = [
        {
          name: 'Absent',
          color: '#d9d9d9',
          data: this.getSeriesData(0),
        },
        {
          name: 'Awake',
          color: '#18A058',
          data: this.getSeriesData(1),
        },
        {
          name: 'Light',
          color: '#56a7ff',
          data: this.getSeriesData(2),
        },
        {
          name: 'Deep',
          color: '#000A3D',
          data: this.getSeriesData(3),
        },
        {
          name: 'REM',
          color: '#3043CE',
          data: this.getSeriesData(4),
        },
      ];

      console.log(this.sleepData);

      this.chart = new Chart({
        chart: {
          type: 'column', // Cambiado a 'column' para barras verticales
          backgroundColor: '#242526',
          animation: true,
        },
        title: {
          text: 'Sleep architecture',
          style: {
            color: '#d9d9d9',
            fontWeight: 'bold',
          },
        },
        xAxis: {
          categories: categories,
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
        colors: ['#d9d9d9', '#18A058', '#56a7ff', '#3043CE', '#000A3D'],
        credits: {
          enabled: false,
        },
        plotOptions: {
          column: {
            stacking: 'normal',
          },
        },
        legend: {
          align: 'center',
          verticalAlign: 'top',
          layout: 'horizontal',
          itemStyle: {
            color: '#d9d9d9',
            fontWeight: 'bold',
          },
        },
        series: seriesData,
      });
    }
  }

  private getSeriesData(sleepType: number): number[] {
    return this.sleepData.map((datum) =>
      datum.sleepType === sleepType
        ? this.getSleepTypeHeight(datum.sleepType)
        : 0
    );
  }

  private getSleepTypeHeight(sleepType: number): number {
    switch (sleepType) {
      case 0:
        return 5;
      case 1:
        return 2;
      case 2:
        return 3;
      case 3:
        return -2;
      case 4:
        return 4;
      default:
        return 0;
    }
  }

  buildNight() {
    const url = `${this.cloudFunctionUrl}/build-night`;
    this.http.post(url, this.profileData).subscribe(
      (response) => console.log(response),
      (error) => {}
    );
  }
}
