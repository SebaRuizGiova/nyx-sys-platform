import { Component, Input, OnChanges } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { LanguageService } from 'src/app/shared/services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'movement-modal-chart',
  templateUrl: './movement-modal-chart.component.html',
  styleUrls: ['./movement-modal-chart.component.scss'],
})
export class MovementModalChartComponent implements OnChanges {
  @Input() periods?: {
    amount: any[];
    turns: any[];
    dates: any[];
  };
  @Input() modal?: boolean;
  public chart?: Chart;

  constructor(
    private languageService: LanguageService,
    private translateService: TranslateService
  ) {}

  ngOnChanges(): void {
    const amount = this.periods?.amount;
    const turns = this.periods?.turns;
    const datesValues = this.periods?.dates;

    if (
      !amount ||
      !turns ||
      !datesValues
    ) {
      return;
    }

    this.languageService.langChanged$.subscribe(() => {
      this.translateService
        .get([
          'movementsChartMovement',
          'movementsChartTurns',
        ])
        .subscribe((translations: { [key: string]: string }) => {
          this.chart = new Chart({
            chart: this.modal
              ? {
                  type: 'column',
                  backgroundColor: '#242526',
                  animation: true,
                }
              : {
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
              amount,
              turns,
              translations
            ),
          });
        });
    });

    this.translateService
      .get([
        'movementsChartMovement',
        'movementsChartTurns',
      ])
      .subscribe((translations: { [key: string]: string }) => {
        this.chart = new Chart({
          chart: this.modal
            ? {
                type: 'column',
                backgroundColor: '#242526',
                animation: true,
              }
            : {
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
            amount,
            turns,
            translations
          ),
        });
      });
  }

  constructSeriesData(
    amount: any[],
    turns: any[],
    translations: { [key: string]: string }
  ): any[] {
    const seriesData = [
      {
        name: translations['movementsChartMovement'],
        data: amount,
        color: '#2caffe',
      },
      {
        name: translations['movementsChartTurns'],
        data: turns,
        color: '#544fc5',
      }
    ];

    return seriesData;
  }
}
