import { Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'angular-highcharts';
import { HelpersService } from 'src/app/shared/services/helpers.service';
import { LanguageService } from 'src/app/shared/services/language.service';
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
  @Input() modal?: boolean;
  public chart?: Chart;

  constructor(
    private languageService: LanguageService,
    private translateService: TranslateService,
    private helpersService: HelpersService,
    private timezoneService: TimezoneService
  ) {}

  ngOnChanges(): void {
    const movementsValues = this.movement?.movement;
    const totalActivityValues = this.movement?.totalActivity;
    const timestampsValues = this.movement?.timestamps;

    const self = this;

    this.languageService.langChanged$.subscribe(() => {
      this.translateService
        .get(['movementsChartMovement', 'movementsChartTurns'])
        .subscribe((translations: { [key: string]: string }) => {
          const movementTranslate = translations['movementsChartMovement'];
          const turnsTranslate = translations['movementsChartTurns'];
          this.chart = new Chart({
            chart: this.modal
              ? {
                  backgroundColor: '#242526',
                  animation: true,
                }
              : {
                  backgroundColor: '#242526',
                  animation: true,
                  height: this.modal ? '300px' : '120px',
                  margin: 0,
                },
            xAxis: {
              categories: timestampsValues,
              labels: {
                enabled: this.modal,
                style: {
                  color: '#d9d9d9',
                },
              },
            },
            yAxis: [
              {
                title: {
                  text: movementTranslate,
                },
                labels: {
                  enabled: this.modal,
                  style: {
                    color: '#d9d9d9',
                  },
                },
                gridLineColor: 'transparent',
              },
              {
                title: {
                  text: turnsTranslate,
                },
                tickInterval: 20,
                labels: {
                  enabled: this.modal,
                  style: {
                    color: '#d9d9d9',
                  },
                },
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
              shared: true,
            },
            series: [
              {
                name: movementTranslate,
                yAxis: 0,
                type: 'column',
                data: movementsValues,
                color: '#544FC5',
                borderColor: '#544FC5',
                borderRadius: '10%',
              },
              {
                name: turnsTranslate,
                yAxis: 1,
                marker: {
                  symbol: 'circle',
                },
                type: 'spline',
                data: totalActivityValues,
                pointRange: 100,
                lineWidth: 1.5,
              },
            ],
          });
        });
    });

    this.translateService
      .get(['movementsChartMovement', 'movementsChartTurns'])
      .subscribe((translations: { [key: string]: string }) => {
        const movementTranslate = translations['movementsChartMovement'];
        const turnsTranslate = translations['movementsChartTurns'];
        this.chart = new Chart({
          chart: this.modal
            ? {
                backgroundColor: '#242526',
                animation: true,
              }
            : {
                backgroundColor: '#242526',
                animation: true,
                height: this.modal ? '300px' : '120px',
                margin: 0,
              },
          xAxis: {
            categories: timestampsValues,
            labels: {
              enabled: this.modal,
              style: {
                color: '#d9d9d9',
              },
            },
          },
          yAxis: [
            {
              title: {
                text: movementTranslate,
              },
              labels: {
                enabled: this.modal,
                style: {
                  color: '#d9d9d9',
                },
              },
              gridLineColor: 'transparent',
            },
            {
              title: {
                text: turnsTranslate,
              },
              tickInterval: 20,
              labels: {
                enabled: this.modal,
                style: {
                  color: '#d9d9d9',
                },
              },
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
            shared: true,
          },
          series: [
            {
              name: movementTranslate,
              yAxis: 0,
              type: 'column',
              data: movementsValues,
              color: '#544FC5',
              borderColor: '#544FC5',
              borderRadius: '10%',
            },
            {
              name: turnsTranslate,
              yAxis: 1,
              marker: {
                symbol: 'circle',
              },
              type: 'spline',
              data: totalActivityValues,
              pointRange: 100,
              lineWidth: 1.5,
            },
          ],
        });
      });
  }
}
