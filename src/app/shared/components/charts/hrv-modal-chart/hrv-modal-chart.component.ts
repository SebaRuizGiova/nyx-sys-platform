import { Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'angular-highcharts';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  selector: 'hrv-modal-chart',
  templateUrl: './hrv-modal-chart.component.html',
  styleUrls: ['./hrv-modal-chart.component.scss'],
})
export class HrvModalChartComponent implements OnChanges {
  @Input() hrv: {
    average: number;
    date: string;
  }[] = [];
  @Input() modal?: boolean;
  public chart?: Chart;

  constructor(
    private languageService: LanguageService,
    private translateService: TranslateService
  ) {}

  ngOnChanges(): void {
    const dates = this.hrv.map((item) => item.date);
    const averageValues = this.hrv.map((item) => item.average);

    this.languageService.langChanged$.subscribe(() => {
      this.translateService
        .get('profileViewAverage')
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
            yAxis: [
              {
                gridLineColor: '#3b3b3b',
                title: {
                  text: translatedName,
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
            ],
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
                data: averageValues,
              },
            ],
          });
        });
    });

    this.translateService
      .get('profileViewAverage')
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
          yAxis: [
            {
              gridLineColor: '#3b3b3b',
              title: {
                text: translatedName,
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
          ],
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
              data: averageValues,
            },
          ],
        });
      });
  }
}
