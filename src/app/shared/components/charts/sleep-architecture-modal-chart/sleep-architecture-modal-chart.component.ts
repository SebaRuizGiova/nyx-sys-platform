import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { LanguageService } from 'src/app/shared/services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sleep-architecture-modal-chart',
  templateUrl: './sleep-architecture-modal-chart.component.html',
  styleUrls: ['./sleep-architecture-modal-chart.component.scss'],
})
export class SleepArchitectureModalChartComponent implements OnChanges {
  @Input() periods?: {
    durationAbsent: any[];
    durationAwake: any[];
    durationLight: any[];
    durationDeep: any[];
    durationREM: any[];
    dates: any[];
  };
  public chart?: Chart;

  constructor(
    private languageService: LanguageService,
    private translateService: TranslateService
  ) {}

  ngOnChanges(): void {
    const durationAbsent = this.periods?.durationAbsent;
    const durationAwake = this.periods?.durationAwake;
    const durationLight = this.periods?.durationLight;
    const durationDeep = this.periods?.durationDeep;
    const durationREM = this.periods?.durationREM;
    const datesValues = this.periods?.dates;

    if (
      !durationAbsent ||
      !durationAwake ||
      !durationLight ||
      !durationDeep ||
      !durationREM ||
      !datesValues
    ) {
      return;
    }

    this.languageService.langChanged$.subscribe(() => {
      this.translateService
        .get([
          'sleepArcChartAbsentHS',
          'sleepArcChartAwakeHS',
          'sleepArcChartLightHS',
          'sleepArcChartDeepHS',
          'sleepArcChartRemHS',
        ])
        .subscribe((translations: { [key: string]: string }) => {
          this.chart = new Chart({
            chart: {
              type: 'column',
              backgroundColor: '#242526',
              animation: true,
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
                style: {
                  color: '#d9d9d9',
                },
              },
              title: {
                text: '',
              },
              min: 0,
              max: 14,
              endOnTick: false,
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
                borderRadius: '3%',
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
            },
            series: this.constructSeriesData(
              durationAbsent,
              durationAwake,
              durationLight,
              durationDeep,
              durationREM,
              translations
            ),
          });
        });
    });

    this.translateService
      .get([
        'sleepArcChartAbsentHS',
        'sleepArcChartAwakeHS',
        'sleepArcChartLightHS',
        'sleepArcChartDeepHS',
        'sleepArcChartRemHS',
      ])
      .subscribe((translations: { [key: string]: string }) => {
        this.chart = new Chart({
          chart: {
            type: 'column',
            backgroundColor: '#242526',
            animation: true,
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
              style: {
                color: '#d9d9d9',
              },
            },
            title: {
              text: '',
            },
            min: 0,
            max: 14,
            endOnTick: false,
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
              borderRadius: '3%',
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
          },
          series: this.constructSeriesData(
            durationAbsent,
            durationAwake,
            durationLight,
            durationDeep,
            durationREM,
            translations
          ),
        });
      });
  }

  constructSeriesData(
    durationAbsent: any[],
    durationAwake: any[],
    durationLight: any[],
    durationDeep: any[],
    durationREM: any[],
    translations: { [key: string]: string }
  ): any[] {
    const seriesData = [
      {
        name: translations['sleepArcChartAbsentHS'],
        data: durationAbsent,
        color: '#d9d9d9',
      },
      {
        name: translations['sleepArcChartAwakeHS'],
        data: durationAwake,
        color: '#18A058',
      },
      {
        name: translations['sleepArcChartLightHS'],
        data: durationLight,
        color: '#56a7ff',
      },
      {
        name: translations['sleepArcChartDeepHS'],
        data: durationDeep,
        color: '#544FC5',
      },
      {
        name: translations['sleepArcChartRemHS'],
        data: durationREM,
        color: '#3043CE',
      },
    ];

    return seriesData;
  }
}
