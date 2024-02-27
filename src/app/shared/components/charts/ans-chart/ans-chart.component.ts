import { Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'angular-highcharts';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
  selector: 'ans-chart',
  templateUrl: './ans-chart.component.html',
  styleUrls: ['./ans-chart.component.scss'],
})
export class ANSChartComponent implements OnChanges {
  @Input() ans: {
    hf: number;
    lf: number;
    bedExit: number[];
    date: string;
  }[] = [];
  public chart?: Chart;

  constructor(
    private languageService: LanguageService,
    private translateService: TranslateService
  ) {}

  ngOnChanges(): void {
    const dates = this.ans.map((item) => item.date);
    const hfValues = this.ans.map((item) => item.hf);
    const lfValues = this.ans.map((item) => item.lf);
    const bedExitValues = this.ans[0]?.bedExit;

    this.languageService.langChanged$.subscribe(() => {
      this.translateService
        .get('ansChartAbsent')
        .subscribe((translate: string) => {
          this.chart = new Chart({
            chart: {
              type: 'spline',
              backgroundColor: '#242526',
              animation: true,
              height: '80px',
              margin: 0,
            },
            xAxis: {
              categories: dates,
              labels: {
                enabled: false,
              },
            },
            yAxis: [
              // Eje Y para LF
              {
                title: {
                  text: 'LF',
                },
                min: 30,
                max: 70,
                tickInterval: 10,
                tickPixelInterval: 10,
                gridLineColor: '#3b3b3b',
              },
              // Eje Y para HF
              {
                title: {
                  text: 'HF',
                },
                // opposite: true, // Para colocar este eje a la derecha
                min: 30,
                max: 70,
                tickInterval: 10,
                tickPixelInterval: 10,
                gridLineColor: '#3b3b3b',
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
                  radius: 0,
                  lineColor: '#56a7ff',
                  lineWidth: 1,
                },
              },
              bar: {
                label: {
                  enabled: false,
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
                name: 'HF',
                yAxis: 0,
                marker: {
                  symbol: 'circle',
                },
                type: 'spline',
                data: hfValues,
              },
              {
                name: 'LF',
                yAxis: 1,
                marker: {
                  symbol: 'circle',
                },
                type: 'spline',
                data: lfValues,
              },
              {
                name: translate,
                type: 'column',
                color: '#d9d9d9',
                borderColor: '#d9d9d9',
                data: bedExitValues, // Agrega un punto si hay ausencia de datos
              },
            ],
          });
        });
    });

    this.translateService
      .get('ansChartAbsent')
      .subscribe((translate: string) => {
        this.chart = new Chart({
          chart: {
            type: 'spline',
            backgroundColor: '#242526',
            animation: true,
            height: '80px',
            margin: 0,
          },
          xAxis: {
            categories: dates,
            labels: {
              enabled: false,
            },
          },
          yAxis: [
            // Eje Y para LF
            {
              title: {
                text: 'LF',
              },
              min: 30,
              max: 70,
              tickInterval: 10,
              tickPixelInterval: 10,
              gridLineColor: '#3b3b3b',
            },
            // Eje Y para HF
            {
              title: {
                text: 'HF',
              },
              // opposite: true, // Para colocar este eje a la derecha
              min: 30,
              max: 70,
              tickInterval: 10,
              tickPixelInterval: 10,
              gridLineColor: '#3b3b3b',
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
                radius: 0,
                lineColor: '#56a7ff',
                lineWidth: 1,
              },
            },
            bar: {
              label: {
                enabled: false,
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
              name: 'HF',
              yAxis: 0,
              marker: {
                symbol: 'circle',
              },
              type: 'spline',
              data: hfValues,
            },
            {
              name: 'LF',
              yAxis: 1,
              marker: {
                symbol: 'circle',
              },
              type: 'spline',
              data: lfValues,
            },
            {
              name: translate,
              type: 'column',
              color: '#d9d9d9',
              borderColor: '#d9d9d9',
              data: bedExitValues, // Agrega un punto si hay ausencia de datos
            },
          ],
        });
      });
  }
}
