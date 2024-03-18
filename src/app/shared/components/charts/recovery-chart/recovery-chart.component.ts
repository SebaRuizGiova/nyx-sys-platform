import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'angular-highcharts';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  selector: 'recovery-chart',
  templateUrl: './recovery-chart.component.html',
  styleUrls: ['./recovery-chart.component.scss'],
})
export class RecoveryChartComponent implements OnChanges {
  @Input() recovery: {
    totalRecovery: number;
    date: string;
  }[] = [];
  @Input() modal?: boolean;
  public chart?: Chart;

  constructor(
    private languageService: LanguageService,
    private translateService: TranslateService
  ) {}

  ngOnChanges(): void {
    const dates = this.recovery.map((item) => item.date);
    const totalRecoveryValues = this.recovery.map((item) => item.totalRecovery);

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
                  height: '80px',
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
              labels: {
                enabled: this.modal,
                style: {
                  color: '#d9d9d9',
                },
              },
              title: {
                text: '',
              },
              tickInterval: 10,
              tickPixelInterval: 10,
              min: -20,
              max: 60,
              endOnTick: false,
            },
            title: {
              text: '',
            },
            credits: {
              enabled: false,
            },
            plotOptions: {
              column: {
                stacking: 'normal',
                borderRadius: '10%',
                borderWidth: 0,
                groupPadding: 0,
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
                name: translatedName,
                type: 'column',
                data: totalRecoveryValues,
                color: '#544FC5',
                borderColor: '#544FC5',
                borderRadius: 5,
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
                height: '80px',
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
            labels: {
              enabled: this.modal,
              style: {
                color: '#d9d9d9',
              },
            },
            title: {
              text: '',
            },
            tickInterval: 10,
            tickPixelInterval: 10,
            min: -20,
            max: 60,
            endOnTick: false,
          },
          title: {
            text: '',
          },
          credits: {
            enabled: false,
          },
          plotOptions: {
            column: {
              stacking: 'normal',
              borderRadius: '10%',
              borderWidth: 0,
              groupPadding: 0,
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
              name: translatedName,
              type: 'column',
              data: totalRecoveryValues,
              color: '#544FC5',
              borderColor: '#544FC5',
              borderRadius: 5,
            },
          ],
        });
      });
  }
}
