import { HelpersService } from '../../../services/helpers.service';
import { Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'angular-highcharts';
import { LanguageService } from 'src/app/shared/services/language.service';
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';

@Component({
  selector: 'hr-chart',
  templateUrl: './hr-chart.component.html',
  styleUrls: ['./hr-chart.component.scss'],
})
export class HrChartComponent implements OnChanges {
  @Input() hr: {
    hrArray: any[];
    timestamps: any[];
    absent: any[];
  } = {
    hrArray: [],
    timestamps: [],
    absent: [],
  };
  @Input() modal?: boolean;
  public chart?: Chart;

  constructor(
    private helpersService: HelpersService,
    private timezoneService: TimezoneService,
    private languageService: LanguageService,
    private translateService: TranslateService
  ) {}

  ngOnChanges(): void {
    let hrValues = this.hr.hrArray;
    let timestamps = this.hr.timestamps.map((timestamp) =>
      this.helpersService.formatTimestamp(
        timestamp,
        this.timezoneService.timezoneOffset
      )
    );
    let absentValues = this.hr.absent;

    const self = this;

    this.languageService.langChanged$.subscribe(() => {
      this.translateService
        .get('hrvChartHeartRate')
        .subscribe((translate: string) => {
          this.chart = new Chart({
            chart: this.modal
              ? {
                  backgroundColor: '#242526',
                  animation: true,
                }
              : {
                  backgroundColor: '#242526',
                  animation: true,
                  height: '120px',
                  margin: 0,
                },
            xAxis: {
              categories: timestamps,
              labels: {
                enabled: this.modal,
                style: {
                  color: '#d9d9d9',
                },
                formatter: function () {
                  return self.helpersService.formatTimestamp(
                    Number(this.value),
                    self.timezoneService.timezoneOffset
                  );
                },
              },
            },
            yAxis: [
              {
                title: {
                  text: translate,
                },
                tickInterval: 10,
                tickPixelInterval: 10,
                gridLineColor: '#3b3b3b',
                labels: {
                  enabled: this.modal,
                  style: {
                    color: '#d9d9d9',
                  },
                },
                min: 30,
                max: 100,
                endOnTick: false,
              },
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
                  lineWidth: 0.5,
                },
              },
              series: {
                stickyTracking: true,
              },
            },
            tooltip: {
              shared: true,
              formatter: function () {
                const timestamp = self.helpersService.formatTimestamp(
                  this.point.x,
                  self.timezoneService.timezoneOffset
                );
                const value = this.point.y;
                return `<b>${timestamp}</b><br/>${translate}: ${value}`;
              },
            },
            series: [
              {
                name: translate,
                yAxis: 0,
                marker: {
                  symbol: 'circle',
                },
                type: 'spline',
                data: hrValues,
                lineWidth: 1.5,
              },
              // {
              //   name: 'Absent',
              //   yAxis: 3,
              //   type: 'column',
              //   data: absentValues,
              //   pointRange: 100,
              // },
            ],
          });
        });
    });

    this.translateService
      .get('hrvChartHeartRate')
      .subscribe((translate: string) => {
        this.chart = new Chart({
          chart: this.modal
            ? {
                backgroundColor: '#242526',
                animation: true,
              }
            : {
                backgroundColor: '#242526',
                animation: true,
                height: '120px',
                margin: 0,
              },
          xAxis: {
            categories: timestamps,
            labels: {
              enabled: this.modal,
              style: {
                color: '#d9d9d9',
              },
              formatter: function () {
                return self.helpersService.formatTimestamp(
                  Number(this.value),
                  self.timezoneService.timezoneOffset
                );
              },
            },
          },
          yAxis: [
            {
              title: {
                text: translate,
              },
              tickInterval: 10,
              tickPixelInterval: 10,
              gridLineColor: '#3b3b3b',
              labels: {
                enabled: this.modal,
                style: {
                  color: '#d9d9d9',
                },
              },
              min: 30,
              max: 100,
              endOnTick: false,
            },
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
                lineWidth: 0.5,
              },
            },
            series: {
              stickyTracking: true,
            },
          },
          tooltip: {
            shared: true,
            formatter: function () {
              const timestamp = self.helpersService.formatTimestamp(
                this.point.x,
                self.timezoneService.timezoneOffset
              );
              const value = this.point.y;
              return `<b>${timestamp}</b><br/>${translate}: ${value}`;
            },
          },
          series: [
            {
              name: translate,
              yAxis: 0,
              marker: {
                symbol: 'circle',
              },
              type: 'spline',
              data: hrValues,
              lineWidth: 1.5,
            },
            // {
            //   name: 'Absent',
            //   yAxis: 3,
            //   type: 'column',
            //   data: absentValues,
            //   pointRange: 100,
            // },
          ],
        });
      });
  }
}
