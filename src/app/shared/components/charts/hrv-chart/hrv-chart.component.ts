import { HelpersService } from './../../../services/helpers.service';
import { Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'angular-highcharts';
import { LanguageService } from 'src/app/shared/services/language.service';
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';

@Component({
  selector: 'hrv-chart',
  templateUrl: './hrv-chart.component.html',
  styleUrls: ['./hrv-chart.component.scss'],
})
export class HrvChartComponent implements OnChanges {
  @Input() hrv: {
    hrArray: any[];
    hrvArray: any[];
    laArray: any[];
    timestamps: any[];
    absent: any[];
  } = {
    hrArray: [],
    hrvArray: [],
    laArray: [],
    timestamps: [],
    absent: [],
  };
  @Input() modal?: boolean = false;
  public chart?: Chart;

  constructor(
    private helpersService: HelpersService,
    private timezoneService: TimezoneService,
    private languageService: LanguageService,
    private translateService: TranslateService
  ) {}

  ngOnChanges(): void {
    const hrValues = this.hrv.hrArray;
    const hrvValues = this.hrv.hrvArray;
    const laValues = this.hrv.laArray;
    const timestamps = this.hrv.timestamps.map((timestamp) =>
      this.helpersService.formatTimestamp(
        timestamp,
        this.timezoneService.timezoneOffset
      )
    );
    const absentValues = this.hrv.absent;

    const self = this;

    this.languageService.langChanged$.subscribe(() => {
      this.translateService
        .get(['hrvChartHeartRate', 'hrvChartAdjustmentLine'])
        .subscribe((translations: { [key: string]: string }) => {
          const heartRateTranslate = translations['hrvChartHeartRate'];
          const adjustmentLineTranslate =
            translations['hrvChartAdjustmentLine'];
          this.chart = new Chart({
            chart: {
              backgroundColor: '#242526',
              animation: true,
              height: this.modal ? '300px' : '115px',
              margin: 0,
            },
            xAxis: {
              categories: timestamps,
              labels: {
                enabled: false,
              },
            },
            yAxis: [
              {
                title: {
                  text: heartRateTranslate,
                },
                tickInterval: 10,
                tickPixelInterval: 10,
                gridLineColor: '#3b3b3b',
                min: 20,
                max: 100,
                endOnTick: false,
              },
              {
                title: {
                  text: 'RMSSD',
                },
                tickInterval: 10,
                tickPixelInterval: 10,
                gridLineColor: '#3b3b3b',
                min: 20,
                max: 100,
                endOnTick: false,
              },
              {
                title: {
                  text: adjustmentLineTranslate,
                },
                tickInterval: 10,
                tickPixelInterval: 10,
                gridLineColor: '#3b3b3b',
                min: 20,
                max: 100,
                endOnTick: false,
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
              formatter: function () {
                const timestamp = self.helpersService.formatTimestamp(
                  this.point.x,
                  self.timezoneService.timezoneOffset
                );
                const value = this.point.y;
                return `<b>${timestamp}</b><br/>Data: ${value}`;
              },
            },
            series: [
              {
                name: heartRateTranslate,
                yAxis: 0,
                marker: {
                  symbol: 'circle',
                },
                type: 'spline',
                data: hrValues,
                lineWidth: 1.5,
              },
              {
                name: 'RMSSD',
                yAxis: 1,
                marker: {
                  symbol: 'circle',
                },
                type: 'line',
                data: hrvValues,
                lineWidth: 1.5,
              },
              {
                name: adjustmentLineTranslate,
                yAxis: 2,
                marker: {
                  symbol: 'circle',
                },
                type: 'line',
                data: laValues,
                pointRange: 100,
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
      .get(['hrvChartHeartRate', 'hrvChartAdjustmentLine'])
      .subscribe((translations: { [key: string]: string }) => {
        const heartRateTranslate = translations['hrvChartHeartRate'];
        const adjustmentLineTranslate = translations['hrvChartAdjustmentLine'];
        this.chart = new Chart({
          chart: this.modal
            ? {
                backgroundColor: '#242526',
                animation: true,
              }
            : {
                backgroundColor: '#242526',
                animation: true,
                height: '115px',
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
                text: heartRateTranslate,
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
              min: 20,
              max: 100,
              endOnTick: false,
            },
            {
              title: {
                text: 'RMSSD',
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
              min: 20,
              max: 100,
              endOnTick: false,
            },
            {
              title: {
                text: adjustmentLineTranslate,
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
              min: 20,
              max: 100,
              endOnTick: false,
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
            formatter: function () {
              const timestamp = self.helpersService.formatTimestamp(
                this.point.x,
                self.timezoneService.timezoneOffset
              );
              const value = this.point.y;
              return `<b>${timestamp}</b><br/>Data: ${value}`;
            },
          },
          series: [
            {
              name: heartRateTranslate,
              yAxis: 0,
              marker: {
                symbol: 'circle',
              },
              type: 'spline',
              data: hrValues,
              lineWidth: 1.5,
            },
            {
              name: 'RMSSD',
              yAxis: 1,
              marker: {
                symbol: 'circle',
              },
              type: 'line',
              data: hrvValues,
              lineWidth: 1.5,
            },
            {
              name: adjustmentLineTranslate,
              yAxis: 2,
              marker: {
                symbol: 'circle',
              },
              type: 'line',
              data: laValues,
              pointRange: 100,
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
