import { Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'angular-highcharts';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  selector: 'sleep-score-chart',
  templateUrl: './sleep-score-chart.component.html',
  styleUrls: ['./sleep-score-chart.component.scss'],
})
export class SleepScoreChartComponent implements OnChanges {
  @Input() sleepScore: {
    sleepScore: number;
    date: string;
  }[] = [];
  @Input() modal?: boolean;
  public chart?: Chart;

  constructor(
    private languageService: LanguageService,
    private translateService: TranslateService
  ) {}

  ngOnChanges(): void {
    const dates = this.sleepScore.map((item) => item.date);
    const totalRecoveryValues = this.sleepScore.map((item) => item.sleepScore);

    this.languageService.langChanged$.subscribe(() => {
      this.translateService
        .get('sleepScoreChartTotalRecovery')
        .subscribe((translatedName: string) => {
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
                  margin: 0,
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
            yAxis: {
              gridLineColor: '#3b3b3b',
              title: {
                text: '',
              },
              tickInterval: this.modal ? 40 : 10,
              tickPixelInterval: this.modal ? 40 : 10,
              labels: {
                enabled: this.modal,
                style: {
                  color: '#d9d9d9',
                },
              },
            },
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
                name: translatedName, // Asigna el nombre traducido
                marker: {
                  symbol: 'circle',
                },
                type: 'spline',
                data: totalRecoveryValues,
              },
            ],
          });
        });
    });

    this.translateService
      .get('sleepScoreChartTotalRecovery')
      .subscribe((translatedName: string) => {
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
                margin: 0,
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
          yAxis: {
            gridLineColor: '#3b3b3b',
            title: {
              text: '',
            },
            tickInterval: this.modal ? 40 : 10,
            tickPixelInterval: this.modal ? 40 : 10,
            labels: {
              enabled: this.modal,
              style: {
                color: '#d9d9d9',
              },
            },
          },
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
              name: translatedName, // Asigna el nombre traducido
              marker: {
                symbol: 'circle',
              },
              type: 'spline',
              data: totalRecoveryValues,
            },
          ],
        });
      });

    // this.chart = new Chart({
    //   chart: {
    //     type: 'spline',
    //     backgroundColor: '#242526',
    //     animation: true,
    //     height: '150px',
    //     margin: 0,
    //   },
    //   xAxis: {
    //     categories: dates,
    //     labels: {
    //       enabled: false,
    //     },
    //   },
    //   yAxis: {
    //     gridLineColor: '#3b3b3b',
    //     title: {
    //       text: '',
    //     },
    //     tickInterval: 10,
    //     tickPixelInterval: 10,
    //   },
    //   title: {
    //     text: '',
    //   },
    //   credits: {
    //     enabled: false,
    //   },
    //   plotOptions: {
    //     spline: {
    //       marker: {
    //         radius: 4,
    //         lineColor: '#56a7ff',
    //         lineWidth: 1,
    //       },
    //     },
    //   },
    //   tooltip: {
    //     shared: true,
    //   },
    //   legend: {
    //     enabled: false,
    //   },
    //   series: [
    //     {
    //       name: 'Total de Recuperación',
    //       marker: {
    //         symbol: 'circle',
    //       },
    //       type: 'spline',
    //       data: totalRecoveryValues,
    //     },
    //   ],
    // });
  }
}
