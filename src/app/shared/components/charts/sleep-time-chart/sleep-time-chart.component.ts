import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';
import {
  SleepData,
  SleepDatum,
} from 'src/app/dashboard/interfaces/profile.interface';
import { HelpersService } from '../../../services/helpers.service';
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';
import { LanguageService } from 'src/app/shared/services/language.service';
import { TranslateService } from '@ngx-translate/core';

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
  @Input() modal?: boolean;
  public chart?: Chart;

  constructor(
    private languageService: LanguageService,
    private translateService: TranslateService
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

    this.languageService.langChanged$.subscribe(() => {
      this.translateService
        .get(['sleepTimeChartAwake', 'sleepTimeChartSleep'])
        .subscribe((translations: { [key: string]: string }) => {
          const awakeTranslate = translations['sleepTimeChartAwake'];
          const sleepTranslate = translations['sleepTimeChartSleep'];
          this.chart = new Chart({
            chart: {
              type: 'column',
              backgroundColor: '#242526',
              animation: true,
              height: this.modal ? '300px' : '100px',
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
            series: this.constructSeriesData(
              durationInSleepValues,
              durationInBedValues,
              durationInAwakeValues,
              awakeTranslate,
              sleepTranslate
            ),
          });
        });
    });

    this.translateService
      .get('sleepTimeChartAwakeHS')
      .subscribe((awakeTranslate: string) => {
        this.translateService
          .get('sleepTimeChartSleepHS')
          .subscribe((sleepTranslate: string) => {
            this.chart = new Chart({
              chart: this.modal ? {
                type: 'column',
                backgroundColor: '#242526',
                animation: true,
              } : {
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
                  enabled: this.modal,
                  style: {
                    color: '#d9d9d9',
                  },
                },
              },
              yAxis: {
                gridLineColor: '#3b3b3b',
                labels: {
                  enabled: this.modal,
                  style: {
                    color: '#d9d9d9',
                  },
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
              series: this.constructSeriesData(
                durationInSleepValues,
                durationInBedValues,
                durationInAwakeValues,
                awakeTranslate,
                sleepTranslate
              ),
            });
          });
      });
  }

  constructSeriesData(
    durationInSleepValues: any[],
    durationInBedValues: any[],
    durationInAwakeValues: any[],
    awakeTitle: string,
    sleepTitle: string
  ): any[] {
    const seriesData = [
      /*     {
        name: 'Bed',
        data: durationInBedValues,
        color: '#544FC5',
      }, */
      {
        name: awakeTitle,
        data: durationInAwakeValues,
        color: '#18A058',
      },
      {
        name: sleepTitle,
        data: durationInSleepValues,
        color: '#544FC5',
      },
    ];

    return seriesData;
  }
}
