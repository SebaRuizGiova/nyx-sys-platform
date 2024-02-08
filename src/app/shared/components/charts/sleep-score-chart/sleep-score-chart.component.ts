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
            chart: {
              type: 'spline',
              backgroundColor: '#242526',
              animation: true,
              height: '150px',
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
              enabled: false,
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
          chart: {
            type: 'spline',
            backgroundColor: '#242526',
            animation: true,
            height: '150px',
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
            enabled: false,
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
