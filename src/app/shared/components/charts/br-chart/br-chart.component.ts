import { HelpersService } from '../../../services/helpers.service';
import { Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'angular-highcharts';
import { LanguageService } from 'src/app/shared/services/language.service';
import { TimezoneService } from 'src/app/shared/services/timezoneService.service';

@Component({
  selector: 'br-chart',
  templateUrl: './br-chart.component.html',
  styleUrls: ['./br-chart.component.scss'],
})
export class BrChartComponent implements OnChanges {
  @Input() br: {
    brArray: any[];
    timestamps: any[];
    absent: any[];
  } = {
    brArray: [],
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
    let brValues = this.br.brArray;
    let timestamps = this.br.timestamps.map((timestamp) =>
      this.helpersService.formatTimestamp(
        timestamp,
        this.timezoneService.timezoneOffset
      )
    );
    let absentValues = this.br.absent;

    const self = this;

    this.languageService.langChanged$.subscribe(() => {
      this.translateService
        .get('brChartBreathingRate')
        .subscribe((translate: string) => {
          this.chart = new Chart({
            chart: {
              backgroundColor: '#242526',
              animation: true,
              height: this.modal ? '300px' : '120px',
              margin: 0,
              style: {
                overflow: 'visible',
              },
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
                  text: translate,
                },
                tickInterval: 5,
                tickPixelInterval: 5,
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
                // yAxis: 1,
                marker: {
                  symbol: 'circle',
                  radius: 0,
                },
                type: 'line',
                data: brValues,
                color: '#544FC5',
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
      .get('brChartBreathingRate')
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
              tickInterval: 5,
              tickPixelInterval: 5,
              gridLineColor: '#3b3b3b',
              labels: {
                enabled: this.modal,
                style: {
                  color: '#d9d9d9',
                },
              },
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
              return `<b>${timestamp}</b><br/>${translate}: ${value}`;
            },
          },
          series: [
            {
              name: translate,
              // yAxis: 1,
              marker: {
                symbol: 'circle',
                radius: 0,
              },
              type: 'line',
              data: brValues,
              color: '#544FC5',
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
